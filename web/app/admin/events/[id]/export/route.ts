import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  const { id } = await params;
  const client = createUserClient(session.accessToken);

  const { data: event } = await client.from('events').select('title').eq('id', id).maybeSingle();
  if (!event) return new Response('Event not found', { status: 404 });

  const { data: registrations, error } = await client
    .from('event_registrations')
    .select('full_name, email, whatsapp, is_existing_user, registration_ref, created_at')
    .eq('event_id', id)
    .order('created_at', { ascending: true });

  if (error) return new Response(error.message, { status: 400 });

  const header = ['Full name', 'Email', 'WhatsApp', 'Existing user', 'Registration ref', 'Registered at'];
  const rows = (registrations ?? []).map((r) =>
    [r.full_name, r.email, r.whatsapp ?? '', r.is_existing_user ? 'Yes' : 'No', r.registration_ref, r.created_at]
      .map((v) => csvEscape(String(v)))
      .join(','),
  );
  const csv = [header.join(','), ...rows].join('\r\n');

  const filename = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-registrations.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
