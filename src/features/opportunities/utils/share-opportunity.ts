import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Share } from 'react-native';

import { env } from '@/config/env';
import { buildOpportunityWebLink } from '@/features/opportunities/utils/opportunity-share-link';
import { formatDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

function guessImageExtension(imageUrl: string): string {
  const lower = imageUrl.toLowerCase();
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.webp')) return 'webp';
  if (lower.includes('.gif')) return 'gif';
  return 'jpg';
}

/** Downloads listing art to cache so the OS share sheet attaches the file, not a URL string. */
async function cacheOpportunityImage(
  imageUrl: string,
  opportunityId: string,
): Promise<string | null> {
  try {
    const ext = guessImageExtension(imageUrl);
    const localPath = `${FileSystem.cacheDirectory}olf-share-${opportunityId}.${ext}`;
    const existing = await FileSystem.getInfoAsync(localPath);
    if (existing.exists) return localPath;

    const { uri, status } = await FileSystem.downloadAsync(imageUrl, localPath);
    return status >= 200 && status < 300 ? uri : null;
  } catch {
    return null;
  }
}

function firstNWords(text: string, n: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, n).join(' ') + (words.length > n ? '…' : '');
}

const LOCATION_LABEL: Record<string, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
};

/**
 * Builds a richly formatted share message.
 * Uses *bold* and _italic_ markdown understood by WhatsApp, Telegram, and
 * many other messaging apps. Sections are separated by blank lines so the
 * message reads cleanly as plain text too.
 */
export function buildShareMessage(opportunity: Opportunity, opportunityLink: string): string {
  const lines: string[] = [];

  // ── Title ──────────────────────────────────────────────────────────────────
  lines.push(`🎯 *${opportunity.title}*`);
  lines.push('');

  // ── Key details ────────────────────────────────────────────────────────────
  lines.push(`🏛️ *Organisation:* ${opportunity.organization}`);
  lines.push(`🗓️ *Deadline:* ${formatDeadline(opportunity.deadline)}`);

  if (opportunity.country) {
    const locationPart = opportunity.locationType
      ? `${opportunity.country} · ${LOCATION_LABEL[opportunity.locationType] ?? opportunity.locationType}`
      : opportunity.country;
    lines.push(`🌍 *Location:* ${locationPart}`);
  } else if (opportunity.locationType) {
    lines.push(`🌍 *Location:* ${LOCATION_LABEL[opportunity.locationType] ?? opportunity.locationType}`);
  }

  if (opportunity.fundingType) {
    const label =
      opportunity.fundingType.charAt(0).toUpperCase() +
      opportunity.fundingType.slice(1).toLowerCase();
    lines.push(`💰 *Funding:* ${label}`);
  }

  if (opportunity.category) {
    const label =
      opportunity.category.charAt(0).toUpperCase() +
      opportunity.category.slice(1).toLowerCase();
    lines.push(`📌 *Category:* ${label}`);
  }

  // ── Description ────────────────────────────────────────────────────────────
  const snippet = opportunity.description?.trim()
    ? firstNWords(opportunity.description.trim(), 50)
    : '';

  if (snippet) {
    lines.push('');
    lines.push('📝 *About*');
    lines.push(snippet);
  }

  // ── CTA: apply directly, then browse more ─────────────────────────────────
  const applyLink = opportunity.applyUrl?.trim() || opportunityLink;
  lines.push('');
  lines.push('👉 *Apply directly:*');
  lines.push(applyLink);
  lines.push('');
  lines.push('🔎 *Find more opportunities:*');
  lines.push(env.LANDING_URL.replace(/\/$/, ''));
  lines.push('');
  lines.push('_Shared via Voila Africa — Discover opportunities made for you_');

  // ── Tags (always last) ─────────────────────────────────────────────────────
  if (opportunity.tags.length > 0) {
    lines.push('');
    lines.push(`🔖 ${opportunity.tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, '')}`).join('  ')}`);
  }

  return lines.join('\n');
}

/**
 * Shares the listing image file (when available) plus title, org, deadline,
 * and a single Voila opportunity link — never the apply URL or raw image URL.
 */
export async function shareOpportunity(opportunity: Opportunity) {
  const opportunityLink = buildOpportunityWebLink(opportunity.id);
  const message = buildShareMessage(opportunity, opportunityLink);

  if (Platform.OS === 'web') {
    // Best-effort: attempt to download the image so the share sheet can attach it.
    // Some web share targets may ignore local file URIs, so we fallback to message-only.
    const imageUri = opportunity.imageUrl?.trim()
      ? await cacheOpportunityImage(opportunity.imageUrl.trim(), opportunity.id)
      : null;

    if (imageUri) {
      await Share.share({ title: opportunity.title, message, url: imageUri });
      return;
    }

    await Share.share({ title: opportunity.title, message });
    return;
  }

  const imageUri = opportunity.imageUrl?.trim()
    ? await cacheOpportunityImage(opportunity.imageUrl.trim(), opportunity.id)
    : null;

  if (imageUri) {
    await Share.share({
      title: opportunity.title,
      message,
      url: imageUri,
    });
    return;
  }

  await Share.share({
    title: opportunity.title,
    message,
  });
}
