import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { AdminDigestBuilder, type DigestCandidate } from './AdminDigestBuilder';

interface CandidateRow {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  country: string | null;
  funding_type: string | null;
  apply_url: string | null;
  deadline: string | null;
  last_sent_at: string | null;
  times_sent: number;
}

export default async function AdminDigestPage() {
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.digest')]);
  const client = createUserClient(session.accessToken);

  const { data } = await client
    .from('opportunities')
    .select(
      'id, title, organization, description, category, country, funding_type, apply_url, deadline, last_sent_at, times_sent',
    )
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('deadline', { ascending: true, nullsFirst: false })
    .returns<CandidateRow[]>();

  const candidates: DigestCandidate[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    organization: row.organization,
    description: row.description,
    category: row.category,
    country: row.country,
    fundingType: row.funding_type,
    applyUrl: row.apply_url,
    deadline: row.deadline,
    lastSentAt: row.last_sent_at,
    timesSent: row.times_sent,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <AdminDigestBuilder candidates={candidates} />
    </div>
  );
}
