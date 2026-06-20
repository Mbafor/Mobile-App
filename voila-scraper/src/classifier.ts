import Anthropic from '@anthropic-ai/sdk';
import { config } from './config';
import type { RawOpportunity, OpportunityRecord } from './types';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const POLL_INTERVAL_MS = 15_000;
const MAX_POLL_ATTEMPTS = 120; // 30 minutes max

const CATEGORIES = [
  'Internship', 'Scholarship', 'Fellowship', 'Graduate Programme',
  'Job (Full-time)', 'Job (Part-time)', 'Volunteer', 'Research Opportunity',
  'Exchange Programme', 'Bootcamp & Training', 'Grant & Funding', 'Competition & Award',
] as const;

const TAGS = [
  'Technology & Innovation', 'Research & Academia', 'Entrepreneurship',
  'Leadership & Management', 'Creative Arts & Design', 'Community & Social Impact',
  'Finance & Investment', 'Healthcare & Wellness', 'Sustainability & Environment',
  'Data & Analytics', 'Policy & Governance', 'Marketing & Branding',
] as const;

type Category = typeof CATEGORIES[number];
type Tag = typeof TAGS[number];
type FundingType = 'fully_funded' | 'partially_funded' | 'self_funded';
type LocationType = 'remote' | 'onsite' | 'hybrid';
type DegreeLevel = 'high_school' | 'bachelors' | 'masters' | 'phd' | 'professional';

interface ClassifyJson {
  description: string;
  category: Category;
  country: string;
  tags: Tag[];
  funding_type: FundingType;
  degree_levels: DegreeLevel[];
  location_type: LocationType;
}

const SYSTEM_PROMPT = `You are an assistant for Voila, a platform that helps African youth discover life-changing opportunities. Given a raw opportunity listing, return ONLY a JSON object with these exact fields:

- description: a clean, engaging rewrite of the opportunity description in around 120 words. Do NOT copy the raw text. Rewrite it in Voila's voice — clear, energetic, and youth-friendly. Tell the reader: what the opportunity is, who it's for, what they get, and why it matters. Write in third person, present tense, no hype or filler.
- category: one of ${CATEGORIES.map(c => `"${c}"`).join(', ')}
- country: the primary target country (e.g. "Kenya", "United Kingdom", "Ghana") or "Global" if open to all
- tags: array of 1-3 tags from [${TAGS.map(t => `"${t}"`).join(', ')}]
- funding_type: one of "fully_funded", "partially_funded", "self_funded"
- degree_levels: array of applicable levels from ["high_school", "bachelors", "masters", "phd", "professional"] (empty array if not specified)
- location_type: one of "remote", "onsite", "hybrid"

Return ONLY valid JSON, no explanation or markdown.`;

function buildUserText(raw: RawOpportunity): string {
  return `Title: ${raw.title}\n\nOrganization: ${raw.organization}\n\nDescription: ${raw.description.slice(0, 1500)}`;
}

function buildRecord(raw: RawOpportunity, json: ClassifyJson): OpportunityRecord {
  return {
    title: raw.title,
    organization: raw.organization,
    description: json.description || raw.description,
    deadline: raw.deadline || null,
    apply_url: raw.applyUrl,
    image_url: raw.imageUrl,
    category: json.category,
    country: json.country,
    tags: json.tags,
    funding_type: json.funding_type,
    degree_levels: json.degree_levels,
    location_type: json.location_type,
    source: raw.source,
    status: 'pending',
    is_active: false,
  };
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export async function classifyBatch(raws: RawOpportunity[]): Promise<OpportunityRecord[]> {
  if (raws.length === 0) return [];

  console.log(`[classifier] Creating batch for ${raws.length} opportunities...`);

  let batch: Anthropic.Messages.MessageBatch;
  try {
    batch = await client.messages.batches.create({
      requests: raws.map((raw, i) => ({
        custom_id: `opp-${i}`,
        params: {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user' as const, content: buildUserText(raw) }],
        },
      })),
    });
  } catch (err) {
    console.warn(`[classifier] Batch creation failed, falling back to keyword classification: ${String(err)}`);
    return raws.map(classifyWithKeywords);
  }

  console.log(`[classifier] Batch ${batch.id} submitted. Polling for results...`);

  // Poll until ended
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);
    try {
      batch = await client.messages.batches.retrieve(batch.id);
    } catch (err) {
      console.warn(`[classifier] Poll attempt ${attempt + 1} failed: ${String(err)}`);
      continue;
    }

    const counts = batch.request_counts;
    console.log(`[classifier] Batch ${batch.id}: processing=${counts.processing} succeeded=${counts.succeeded} errored=${counts.errored}`);

    if (batch.processing_status === 'ended') break;
  }

  if (batch.processing_status !== 'ended') {
    console.warn(`[classifier] Batch did not complete within timeout — using keyword fallback for all ${raws.length} items`);
    return raws.map(classifyWithKeywords);
  }

  // Collect text results by custom_id
  const resultMap = new Map<string, string>();
  try {
    for await (const item of await client.messages.batches.results(batch.id)) {
      if (item.result.type === 'succeeded') {
        const block = item.result.message.content[0];
        if (block?.type === 'text') {
          resultMap.set(item.custom_id, block.text);
        }
      } else {
        console.warn(`[classifier] Item ${item.custom_id} ${item.result.type} — using keyword fallback`);
      }
    }
  } catch (err) {
    console.warn(`[classifier] Failed to stream batch results: ${String(err)} — using keyword fallback for all`);
    return raws.map(classifyWithKeywords);
  }

  console.log(`[classifier] Batch complete — ${resultMap.size}/${raws.length} items classified by Claude`);

  // Map results back in order, falling back to keywords for any missing item
  return raws.map((raw, i) => {
    const text = resultMap.get(`opp-${i}`);
    if (!text) {
      return classifyWithKeywords(raw);
    }
    try {
      const json = JSON.parse(text.trim()) as ClassifyJson;
      return buildRecord(raw, json);
    } catch {
      console.warn(`[classifier] JSON parse failed for "${raw.title}" — using keyword fallback`);
      return classifyWithKeywords(raw);
    }
  });
}

// ---------------------------------------------------------------------------
// Keyword-based fallback
// ---------------------------------------------------------------------------

function lower(text: string): string {
  return text.toLowerCase();
}

function keywordCategory(text: string): Category {
  const t = lower(text);
  if (/scholarship|tuition|study award|bursary/.test(t)) return 'Scholarship';
  if (/\bfellowship\b/.test(t)) return 'Fellowship';
  if (/\binternship\b|\bintern\b/.test(t)) return 'Internship';
  if (/graduate programme|graduate program|grad scheme/.test(t)) return 'Graduate Programme';
  if (/full[- ]time|\bpermanent\b/.test(t)) return 'Job (Full-time)';
  if (/part[- ]time/.test(t)) return 'Job (Part-time)';
  if (/\bvolunteer\b|volunteering/.test(t)) return 'Volunteer';
  if (/research opportunity|\bresearcher?\b/.test(t)) return 'Research Opportunity';
  if (/exchange programme|exchange program/.test(t)) return 'Exchange Programme';
  if (/\bbootcamp\b|\btraining\b|\bcourse\b|\bworkshop\b/.test(t)) return 'Bootcamp & Training';
  if (/\bgrant\b|\bfunding\b|seed fund/.test(t)) return 'Grant & Funding';
  if (/competition|\baward\b|\bprize\b|\bchallenge\b/.test(t)) return 'Competition & Award';
  return 'Internship';
}

function keywordFundingType(text: string): FundingType {
  const t = lower(text);
  if (/fully funded|all expenses|full scholarship|covers tuition|stipend.{0,20}accommodation|expenses covered/.test(t)) return 'fully_funded';
  if (/partial|partially funded|some funding|travel grant/.test(t)) return 'partially_funded';
  return 'self_funded';
}

function keywordLocationType(text: string): LocationType {
  const t = lower(text);
  if (/\bremote\b|\bvirtual\b|\bonline\b|work from home/.test(t)) return 'remote';
  if (/\bhybrid\b/.test(t)) return 'hybrid';
  return 'onsite';
}

function keywordDegreeLevels(text: string): DegreeLevel[] {
  const t = lower(text);
  const levels = new Set<DegreeLevel>();
  if (/undergraduate|\bbachelor\b|\bbsc\b|\bba\b/.test(t)) levels.add('bachelors');
  if (/\bmaster\b|\bmsc\b|\bmba\b|postgraduate/.test(t)) levels.add('masters');
  if (/\bphd\b|\bdoctorate\b|\bdphil\b/.test(t)) levels.add('phd');
  if (/high school|secondary school|o[- ]level|a[- ]level/.test(t)) levels.add('high_school');
  if (/\bprofessional\b|working professional/.test(t)) levels.add('professional');
  return Array.from(levels);
}

const COUNTRIES: string[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Botswana', 'Brazil', 'Cameroon', 'Canada',
  'Chile', 'China', 'Colombia', 'Democratic Republic of Congo', 'Egypt',
  'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 'India', 'Indonesia',
  'Italy', 'Japan', 'Jordan', 'Kenya', 'Lebanon', 'Liberia', 'Madagascar',
  'Malawi', 'Malaysia', 'Mali', 'Mauritius', 'Mexico', 'Morocco', 'Mozambique',
  'Namibia', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan',
  'Philippines', 'Portugal', 'Romania', 'Rwanda', 'Senegal', 'Sierra Leone',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sudan', 'Sweden',
  'Switzerland', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda',
  'Ukraine', 'United Kingdom', 'United States', 'Vietnam', 'Zambia', 'Zimbabwe',
  'West Africa', 'East Africa', 'Southern Africa', 'Central Africa',
  'North Africa', 'Sub-Saharan Africa',
];

const COUNTRY_ALIASES: Record<string, string> = {
  uk: 'United Kingdom',
  usa: 'United States',
  us: 'United States',
  drc: 'Democratic Republic of Congo',
};

function keywordCountry(text: string): string {
  const t = lower(text);
  if (/global|worldwide|all countries|international|anywhere|across the world|open to all/.test(t)) return 'Global';
  for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, 'i').test(text)) return canonical;
  }
  for (const country of COUNTRIES) {
    if (t.includes(lower(country))) return country;
  }
  return 'Global';
}

function keywordTags(text: string): Tag[] {
  const t = lower(text);
  const tags: Tag[] = [];
  if (/\btech\b|software|\bai\b|\bcoding\b|\bdigital\b|programming|computer|\bict\b/.test(t)) tags.push('Technology & Innovation');
  if (/\bresearch\b|\bacademic\b|\bscience\b|\blab\b|\bscholar\b/.test(t)) tags.push('Research & Academia');
  if (/startup|entrepreneur|\bbusiness\b|\binnovation\b|\bventure\b/.test(t)) tags.push('Entrepreneurship');
  if (/leadership|management|executive|\bmanager\b/.test(t)) tags.push('Leadership & Management');
  if (/\bdesign\b|\bart\b|\bcreative\b|\bmedia\b|\bfilm\b|photography|animation/.test(t)) tags.push('Creative Arts & Design');
  if (/community|\bsocial\b|\bngo\b|nonprofit|non-profit|\bdevelopment\b|humanitarian/.test(t)) tags.push('Community & Social Impact');
  if (/\bfinance\b|investment|\bbanking\b|\beconomics\b|\bfinancial\b/.test(t)) tags.push('Finance & Investment');
  if (/\bhealth\b|\bmedical\b|\bwellness\b|\bclinical\b|\bmedicine\b|\bnursing\b/.test(t)) tags.push('Healthcare & Wellness');
  if (/environment|\bclimate\b|sustainability|\bgreen\b|renewable|\becology\b/.test(t)) tags.push('Sustainability & Environment');
  if (/\bdata\b|\banalytics\b|statistics|\bml\b|machine learning|artificial intelligence/.test(t)) tags.push('Data & Analytics');
  if (/\bpolicy\b|governance|\blaw\b|\bgovernment\b|\blegal\b|regulation/.test(t)) tags.push('Policy & Governance');
  if (/\bmarketing\b|\bbrand\b|communications|\bpr\b|advertising|public relations/.test(t)) tags.push('Marketing & Branding');
  return tags.slice(0, 3);
}

function classifyWithKeywords(raw: RawOpportunity): OpportunityRecord {
  const combined = `${raw.title} ${raw.description} ${raw.organization}`;
  return {
    title: raw.title,
    organization: raw.organization,
    description: raw.description,
    deadline: raw.deadline || null,
    apply_url: raw.applyUrl,
    image_url: raw.imageUrl,
    category: keywordCategory(combined),
    country: keywordCountry(combined),
    tags: keywordTags(combined),
    funding_type: keywordFundingType(combined),
    degree_levels: keywordDegreeLevels(combined),
    location_type: keywordLocationType(combined),
    source: raw.source,
    status: 'pending',
    is_active: false,
  };
}
