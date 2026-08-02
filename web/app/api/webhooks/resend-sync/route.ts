import { NextRequest, NextResponse } from 'next/server';

import { createServiceRoleClient } from '@/lib/supabase-server';

const RESEND_API_URL = 'https://api.resend.com';

type ProfileRecord = {
  id?: string | null;
  email?: string | null;
  full_name?: string | null;
};

type SupabaseWebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: ProfileRecord | null;
  old_record: ProfileRecord | null;
};

export async function POST(req: NextRequest) {
  const incomingSecret = req.headers.get('x-webhook-secret');
  if (incomingSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: SupabaseWebhookPayload;
  try {
    payload = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const userId = payload.record?.id;
  const email = payload.record?.email;
  const fullName = payload.record?.full_name;

  if (!email || !fullName) {
    return NextResponse.json({ error: 'email and full_name are required' }, { status: 400 });
  }

  // This webhook fires on every qualifying `profiles` update (basic info,
  // academic info, onboarding complete, ...), not just the first one where
  // full_name becomes available. Without a claim, each of those re-adds the
  // contact to the Resend audience, and if that audience has a welcome
  // automation configured, every re-add can re-trigger it -- producing
  // duplicate welcome emails for a single signup. Claim once, same pattern
  // as the atomic dedup in supabase/functions/send-welcome-email.
  if (userId) {
    const supabase = createServiceRoleClient();
    const { data: claimed, error: claimError } = await supabase
      .from('profiles')
      .update({ resend_contact_synced_at: new Date().toISOString() })
      .eq('id', userId)
      .is('resend_contact_synced_at', null)
      .select('id');

    if (claimError) {
      console.error('resend-sync: claim query failed', claimError);
      return NextResponse.json({ error: 'Failed to claim sync slot' }, { status: 500 });
    }

    if (!claimed || claimed.length === 0) {
      return NextResponse.json({ data: { skipped: true } }, { status: 200 });
    }
  }

  const firstName = fullName.split(' ')[0];

  try {
    const resendResponse = await fetch(
      `${RESEND_API_URL}/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          unsubscribed: false,
        }),
      }
    );

    const resendBody = await resendResponse.json().catch(() => null);

    if (!resendResponse.ok) {
      console.error('resend-sync: Resend API error', resendResponse.status, resendBody);
      return NextResponse.json(
        { error: 'Failed to sync contact to Resend', details: resendBody },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: resendBody }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('resend-sync: request to Resend failed', message);
    return NextResponse.json(
      { error: 'Failed to sync contact to Resend', details: message },
      { status: 500 }
    );
  }
}
