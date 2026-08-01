// Mentorship messaging notifications, run on a schedule (every 10-15 min):
//
// Trigger 1 - new message: a message sat unread for 15+ min gets emailed to
// the recipient, batching every unread message from that sender into one
// email. Skipped/cancelled if the recipient reads it before we send.
//
// Trigger 2 - stale thread nudge: a conversation's last message has gone
// unanswered for 48h (first nudge) or 7 days (final nudge). At most one nudge
// per threshold per conversation, ever (enforced in the DB, see
// 059_messaging_notifications.sql).
//
// Auth, cron-secret handling, and Resend send mirror the other scheduled
// functions in this project (mentorship-maintenance, send-mentor-match-emails).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  appWebBase,
  newMessageEmailHtml,
  sendResendEmail,
  staleThreadNudgeEmailHtml,
} from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const NEW_MESSAGE_DELAY_MINUTES = 15;
const NUDGE_THRESHOLDS: { hours: number; type: 'nudge_48h' | 'nudge_7d'; urgency: '48h' | '7d' }[] = [
  { hours: 48, type: 'nudge_48h', urgency: '48h' },
  { hours: 168, type: 'nudge_7d', urgency: '7d' },
];

type UnreadMessageRow = {
  message_id: string;
  mentorship_id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_email: string;
  recipient_name: string;
  body: string;
  created_at: string;
};

type NudgeCandidateRow = {
  mentorship_id: string;
  last_message_id: string;
  last_message_created_at: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_email: string;
  recipient_name: string;
  hours_waiting: number;
};

function firstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName;
}

async function handleNewMessages(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  resendApiKey: string,
): Promise<{ sent: number; skipped: number }> {
  const webBase = appWebBase();
  const ctaHref = `${webBase}/mentorship`;

  const { data: rows, error } = await supabase.rpc('get_unread_message_candidates', {
    p_delay_minutes: NEW_MESSAGE_DELAY_MINUTES,
  });
  if (error) throw new Error(`get_unread_message_candidates: ${error.message}`);

  const candidates = (rows ?? []) as UnreadMessageRow[];
  if (candidates.length === 0) return { sent: 0, skipped: 0 };

  // Rows arrive ordered by (mentorship_id, sender_id, created_at) -- group
  // consecutive rows into one batch per sender per conversation.
  const batches = new Map<string, UnreadMessageRow[]>();
  for (const row of candidates) {
    const key = `${row.mentorship_id}:${row.sender_id}`;
    const batch = batches.get(key);
    if (batch) batch.push(row);
    else batches.set(key, [row]);
  }

  let sent = 0;
  let skipped = 0;

  for (const batch of batches.values()) {
    const head = batch[batch.length - 1];

    // Belt-and-suspenders: re-check the read cursor right before sending,
    // since it may have changed since get_unread_message_candidates ran.
    const { data: state } = await supabase
      .from('mentorship_participant_state')
      .select('last_read_at')
      .eq('mentorship_id', head.mentorship_id)
      .eq('user_id', head.recipient_id)
      .maybeSingle();

    if (state?.last_read_at && new Date(state.last_read_at) >= new Date(head.created_at)) {
      skipped++;
      continue;
    }

    const { subject, html } = newMessageEmailHtml({
      recipientFirstName: firstName(head.recipient_name),
      senderName: head.sender_name,
      ctaHref,
      previewMessages: batch.map((m) => m.body).filter((b) => b.trim().length > 0),
    });

    const result = await sendResendEmail({
      apiKey: resendApiKey,
      to: head.recipient_email,
      subject,
      html,
    });

    if (!result.ok) {
      skipped++;
      continue;
    }

    const { data: claimed, error: logError } = await supabase.rpc('log_notification_send', {
      p_mentorship_id: head.mentorship_id,
      p_message_id: head.message_id,
      p_recipient_id: head.recipient_id,
      p_sender_id: head.sender_id,
      p_notification_type: 'new_message',
    });

    if (logError) throw new Error(`log_notification_send: ${logError.message}`);
    if (claimed) sent++;
    else skipped++; // a concurrent run already sent this exact batch
  }

  return { sent, skipped };
}

async function handleStaleThreadNudges(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  resendApiKey: string,
): Promise<{ sent: number; skipped: number }> {
  const webBase = appWebBase();
  const ctaHref = `${webBase}/mentorship`;

  let sent = 0;
  let skipped = 0;

  for (const threshold of NUDGE_THRESHOLDS) {
    const { data: rows, error } = await supabase.rpc('get_stale_thread_nudge_candidates', {
      p_hours: threshold.hours,
      p_notification_type: threshold.type,
    });
    if (error) throw new Error(`get_stale_thread_nudge_candidates(${threshold.type}): ${error.message}`);

    const candidates = (rows ?? []) as NudgeCandidateRow[];

    for (const candidate of candidates) {
      const { subject, html } = staleThreadNudgeEmailHtml({
        recipientFirstName: firstName(candidate.recipient_name),
        senderName: candidate.sender_name,
        hoursWaiting: candidate.hours_waiting,
        urgency: threshold.urgency,
        ctaHref,
      });

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: candidate.recipient_email,
        subject,
        html,
      });

      if (!result.ok) {
        skipped++;
        continue;
      }

      const { data: claimed, error: logError } = await supabase.rpc('log_notification_send', {
        p_mentorship_id: candidate.mentorship_id,
        p_message_id: candidate.last_message_id,
        p_recipient_id: candidate.recipient_id,
        p_sender_id: candidate.sender_id,
        p_notification_type: threshold.type,
      });

      if (logError) throw new Error(`log_notification_send: ${logError.message}`);
      if (claimed) sent++;
      else skipped++;
    }
  }

  return { sent, skipped };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    const cronHeader = req.headers.get('x-cron-secret');
    const bearerOk = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const headerOk = cronSecret && cronHeader === cronSecret;

    if (!cronSecret || (!bearerOk && !headerOk)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Resend is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const [newMessageResult, nudgeResult] = await Promise.all([
      handleNewMessages(supabase, resendApiKey),
      handleStaleThreadNudges(supabase, resendApiKey),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        new_message: newMessageResult,
        stale_thread_nudge: nudgeResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
