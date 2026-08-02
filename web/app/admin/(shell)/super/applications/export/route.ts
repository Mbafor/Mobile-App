import { requireSuperAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  const session = await requireSuperAdminSession();
  const client = createUserClient(session.accessToken);

  const search = new URL(request.url).searchParams.get('search')?.trim();

  let query = client
    .from('mentor_applications')
    .select(
      'first_name, last_name, email, phone, linkedin, portfolio, area_of_expertise, years_of_experience, short_bio, motivation, status, submitted_at',
    );

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,area_of_expertise.ilike.%${search}%`,
    );
  }

  const { data: applications, error } = await query.order('submitted_at', { ascending: false });

  if (error) return new Response(error.message, { status: 400 });

  const header = [
    'First name',
    'Last name',
    'Email',
    'Phone',
    'LinkedIn',
    'Portfolio',
    'Role applied for',
    'Years of experience',
    'Skills & experience',
    'Anything else',
    'Status',
    'Submitted at',
  ];
  const rows = (applications ?? []).map((a) =>
    [
      a.first_name,
      a.last_name,
      a.email,
      a.phone ?? '',
      a.linkedin ?? '',
      a.portfolio ?? '',
      a.area_of_expertise,
      a.years_of_experience,
      a.short_bio,
      a.motivation ?? '',
      a.status,
      a.submitted_at,
    ]
      .map((v) => csvEscape(String(v)))
      .join(','),
  );
  const csv = [header.join(','), ...rows].join('\r\n');

  const filename = `voila-applications-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
