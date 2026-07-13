/**
 * Invites a new partner org: creates a Supabase Auth user and the matching
 * `partners` row (slug + ref_code). Run manually by the Voila admin -- there
 * is no self-signup for partners in the MVP.
 *
 * Usage:
 *   node --env-file=.env scripts/create-partner.mjs \
 *     --org "Campus Connect" --email partner@example.org --password "TempPass123!"
 *
 * Requires SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY
 * in the environment.
 */
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    if (key) args[key] = argv[i + 1];
  }
  return args;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const RESERVED_SLUGS = new Set(['login', 'dashboard', 'logout', 'api']);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { org, email, password, logo } = args;

  if (!org || !email || !password) {
    console.error('Usage: node scripts/create-partner.mjs --org "Name" --email x@y.com --password "..." [--logo https://...]');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    console.error('Failed to create auth user:', userError.message);
    process.exit(1);
  }

  const baseSlug = slugify(org);
  if (RESERVED_SLUGS.has(baseSlug)) {
    console.error(`"${baseSlug}" is a reserved slug (${[...RESERVED_SLUGS].join(', ')}). Pick a different --org name or pass a distinguishing suffix.`);
    process.exit(1);
  }
  const refCode = randomUUID().slice(0, 8);

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .insert({
      org_name: org,
      slug: baseSlug,
      logo_url: logo || null,
      contact_email: email,
      ref_code: refCode,
      auth_user_id: userData.user.id,
    })
    .select()
    .single();

  if (partnerError) {
    console.error('Failed to create partners row:', partnerError.message);
    console.error(`Auth user ${userData.user.id} was created but has no partners row -- clean it up manually if retrying.`);
    process.exit(1);
  }

  console.log('Partner created:');
  console.log(`  org_name:  ${partner.org_name}`);
  console.log(`  slug:      ${partner.slug}  ->  /partner/${partner.slug}`);
  console.log(`  ref_code:  ${partner.ref_code}`);
  console.log(`  login:     ${email} / (password as provided)`);
}

main();
