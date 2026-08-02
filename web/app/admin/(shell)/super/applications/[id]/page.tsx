import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';

interface MentorApplicationDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  portfolio: string | null;
  area_of_expertise: string;
  years_of_experience: string;
  short_bio: string;
  motivation: string | null;
  status: string;
  submitted_at: string;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-1">{label}</p>
      <p className="text-sm whitespace-pre-wrap break-words">{value?.trim() ? value : '—'}</p>
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, t] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.applications'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client
    .from('mentor_applications')
    .select(
      'id, first_name, last_name, email, phone, linkedin, portfolio, area_of_expertise, years_of_experience, short_bio, motivation, status, submitted_at',
    )
    .eq('id', id)
    .maybeSingle();

  const application = data as MentorApplicationDetail | null;
  if (!application) notFound();

  return (
    <div>
      <Link href="/admin/super/applications" className="text-sm text-primary hover:underline">
        {t('back')}
      </Link>

      <h1 className="text-2xl font-semibold text-primary mt-2 mb-1">
        {application.first_name} {application.last_name}
      </h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {t('detailSubtitle', {
          date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(application.submitted_at)),
        })}
      </p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('columns.email')} value={application.email} />
          <Field label={t('phone')} value={application.phone} />
          <Field label={t('linkedin')} value={application.linkedin} />
          <Field label={t('portfolio')} value={application.portfolio} />
          <Field label={t('columns.role')} value={application.area_of_expertise} />
          <Field label={t('columns.experience')} value={application.years_of_experience} />
          <Field label={t('columns.status')} value={application.status} />
        </div>
        <Field label={t('skillsExperience')} value={application.short_bio} />
        <Field label={t('anythingElse')} value={application.motivation} />
      </section>
    </div>
  );
}
