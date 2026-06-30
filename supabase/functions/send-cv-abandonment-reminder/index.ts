import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appWebBase, emailShell, sendResendEmail } from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: cvs, error: cvsError } = await supabase
      .from('cvs')
      .select('id, user_id, title, content, reminder_count, last_reminder_sent_at, created_at')
      .lt('reminder_count', 3)
      .lte('created_at', twentyFourHoursAgo.toISOString())
      .or(
        `last_reminder_sent_at.is.null,last_reminder_sent_at.lte.${twentyFourHoursAgo.toISOString()}`,
      );

    if (cvsError) {
      return new Response(JSON.stringify({ error: cvsError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!cvs || cvs.length === 0) {
      return new Response(JSON.stringify({ message: 'No abandoned CVs found.', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webBase = appWebBase();
    let sent = 0;

    for (const cv of cvs) {
      const { data: isIncomplete } = await supabase.rpc('cv_content_is_incomplete', {
        p_content: cv.content ?? {},
      });

      if (!isIncomplete) continue;

      const { data: successPayment } = await supabase
        .from('cv_payments')
        .select('id')
        .eq('cv_id', cv.id)
        .eq('status', 'success')
        .limit(1);

      if (successPayment && successPayment.length > 0) continue;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', cv.user_id)
        .single();

      if (profileError || !profile?.email) continue;

      const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'there';
      const reminderNumber = (cv.reminder_count ?? 0) + 1;

      const linkedInUrl = 'https://www.linkedin.com/company/voila-africa/';
      const linkedInFooter = `
        <p style="margin-top:28px; padding-top:20px; border-top:1px solid #e8e8e8; font-size:13px; color:#666666;">
          Follow us on LinkedIn for career tips and global opportunities:<br>
          <a href="${linkedInUrl}" style="color:#0A66C2; font-weight:600; text-decoration:none;">linkedin.com/company/voila-africa</a>
        </p>
      `;

      const messages = {
        1: {
          subject: `Building your CV? Here are a few tips to get you started — Voila`,
          headline: `Your CV is saved and waiting for you, ${firstName}`,
          bodyHtml: `
            <p>You started your CV on Voila — great first move. While you find a moment to get back to it, here are a few things worth knowing before you dive in:</p>

            <div style="margin-top:20px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">1. Nail your personal section first</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Your name, a professional email address, your location, and a LinkedIn URL are the first things a recruiter looks for.
                Use a simple email format like <em>firstname.lastname@gmail.com</em> — avoid old nicknames or numbers that look unprofessional.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">2. Write a short personal summary</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Two to three sentences at the top of your CV that tell a recruiter who you are and what you bring.
                Think of it as your elevator pitch: your field, your level of experience, and what you are looking for.
                Example: <em>"Final-year Computer Science student with a focus on data engineering and two internship experiences in fintech, seeking graduate opportunities in software development."</em>
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">3. Save and share as a PDF</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                PDFs preserve your formatting on every device and every operating system. When you download your CV from Voila, it comes as a PDF — ready to attach to any application.
                Name the file clearly: <em>FirstName-LastName-CV.pdf</em>.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">4. Only include what adds value</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                There is no rule that says every section must be filled. If you have no publications or awards yet, leave those sections out entirely.
                A clean, focused CV beats a padded one every time.
              </p>
            </div>

            <p style="margin-top:20px; font-size:13px; color:#444444; line-height:1.7;">
              Your CV does not need to be perfect on the first pass — just get the sections filled in and the polish will come naturally as you review it.
            </p>
            ${linkedInFooter}
          `,
        },
        2: {
          subject: `How to write experience that gets you noticed — Voila`,
          headline: `Make your experience impossible to ignore, ${firstName}`,
          bodyHtml: `
            <p>The experience and education sections are where most CVs win or lose. Here is how to make yours stand out:</p>

            <div style="margin-top:20px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">1. Lead with action verbs and add numbers</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Start every bullet point with a strong verb — <em>Led, Built, Designed, Managed, Increased, Reduced, Launched, Coordinated, Analysed</em>.
                Then add a number wherever you can. <em>"Managed a social media account and grew followers by 2,000 in three months"</em> is far more memorable than <em>"Responsible for social media."</em>
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">2. Be specific about your skills</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                List specific tools, platforms, and languages — not just soft traits like "teamwork" or "communication."
                Recruiters and applicant tracking systems (ATS) often filter by keyword, so naming exactly what you know — <em>Python, Figma, Excel, Salesforce, SPSS</em> — helps you get found and shortlisted.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">3. Make the most of your education section</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                List your degree, institution, and graduation year. If your GPA or grade is strong, include it.
                If you are early in your career, add relevant coursework, a dissertation or thesis topic, academic awards, or competitive exam results — these all signal ability to employers.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">4. Volunteering and activities count</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                If you have limited formal work experience, do not leave the experience section empty. Include leadership roles in clubs or student associations, volunteer work, freelance projects, or community initiatives.
                These show initiative, transferable skills, and character — things employers genuinely care about.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">5. Employment gaps are okay — address them briefly</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                If there is a gap in your timeline, a short honest note is better than awkward silence.
                Something like <em>"Career break — caregiving responsibilities"</em> or <em>"Personal development: online courses in data analysis"</em> shows self-awareness and keeps the reader's trust.
              </p>
            </div>

            <p style="margin-top:20px; font-size:13px; color:#444444; line-height:1.7;">
              Your CV is saved on Voila whenever you are ready to continue.
            </p>
            ${linkedInFooter}
          `,
        },
        3: {
          subject: `The final touches that make a CV shine — Voila`,
          headline: `Almost there — here is how to finish strong, ${firstName}`,
          bodyHtml: `
            <p>You are close. These are the finishing-touch tips that separate a good CV from a great one:</p>

            <div style="margin-top:20px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">1. Keep it to one or two pages</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Unless you have 10+ years of experience, one page is the gold standard. Prioritise your most recent and most relevant roles.
                If something does not directly support the role you are applying to, leave it out — brevity signals good judgement.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">2. Format for readability</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Use a clean font at 10–12pt. Keep your formatting consistent — if you bold one job title, bold all of them.
                Align your dates, use the same bullet style throughout, and leave enough white space so the page does not feel crowded.
                Recruiters scan CVs in seconds; layout guides where their eye goes.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">3. Tailor it for every application</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Read the job description carefully and reflect its language back. Adjust your summary and reorder your bullet points to match what they are specifically asking for.
                Many companies use ATS software that scans for keywords before a human ever reads your CV — mirroring the job description helps you clear that first filter.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">4. Skip "References available on request"</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Everyone has references available. This line just wastes space.
                Instead, keep a separate document with two or three references ready to email when asked — a former manager, lecturer, or supervisor works best.
              </p>
            </div>

            <div style="margin-top:16px; padding:16px 20px; background:#f5faf5; border-left:3px solid #0B6623;">
              <p style="margin:0 0 6px; font-weight:600; color:#111111;">5. Proofread — then proofread again</p>
              <p style="margin:0; font-size:13px; color:#444444; line-height:1.7;">
                Read your CV out loud to catch awkward phrasing. Run a spell-check. Then ask a friend or classmate to read it with fresh eyes.
                Typos and inconsistent capitalisation are the easiest things to fix — and often the first things a recruiter notices.
              </p>
            </div>

            <p style="margin-top:24px; font-size:13px; color:#444444; line-height:1.7;">
              Your CV is saved on Voila. Head back whenever you are ready, add the finishing touches, and download your final copy.
            </p>
            ${linkedInFooter}
          `,
        },
      };

      const message = messages[reminderNumber as keyof typeof messages];
      if (!message) continue;

      const cvUrl = `${webBase}/cv-builder/${cv.id}`;

      const result = await sendResendEmail({
        apiKey: resendApiKey,
        to: profile.email,
        subject: message.subject,
        html: emailShell({
          headline: message.headline,
          bodyHtml: message.bodyHtml,
          ctaLabel: 'Continue Building My CV',
          ctaHref: cvUrl,
          footerNote: 'You are receiving this because you started a CV on Voila.',
        }),
      });

      if (result.ok) {
        await supabase
          .from('cvs')
          .update({
            reminder_count: reminderNumber,
            last_reminder_sent_at: now.toISOString(),
          })
          .eq('id', cv.id);

        sent++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
