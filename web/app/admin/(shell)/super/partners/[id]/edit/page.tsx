import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { EditPartnerForm } from './EditPartnerForm';

interface PartnerDetail {
  id: string;
  org_name: string;
  slug: string;
  logo_url: string | null;
  contact_email: string;
  ref_code: string;
  is_active: boolean;
}

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, t] = await Promise.all([
    requireSuperAdminSession(),
    getTranslations('Admin.superAdmin.partners'),
  ]);
  const client = createUserClient(session.accessToken);

  const { data } = await client.rpc('get_super_admin_partner', { p_partner_id: id });
  const partner = data as PartnerDetail | null;

  if (!partner) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('editTitle')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('editSubtitle', { org: partner.org_name })}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <EditPartnerForm
          partnerId={partner.id}
          initialValues={{
            orgName: partner.org_name,
            contactEmail: partner.contact_email,
            logoUrl: partner.logo_url ?? '',
          }}
          slug={partner.slug}
          refCode={partner.ref_code}
        />
      </section>
    </div>
  );
}
