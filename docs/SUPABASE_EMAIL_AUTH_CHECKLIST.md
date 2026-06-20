# Supabase + Resend — Email Auth Setup Checklist

You use **Resend** for all outbound email. There are **two separate email systems** in this app
and each needs its own configuration:

| System | What it sends | How it's sent |
|---|---|---|
| **Supabase Auth** | Sign-up OTP codes, email confirmation | Resend SMTP relay (configured in Supabase Dashboard) |
| **Edge Functions** | Welcome, deadline, CV, mentor, session emails | Resend HTTP API (`RESEND_API_KEY` secret) |

Both use the same sender domain. Do section 1 (domain verification) first — everything else
depends on it.

---

## 1. Verify your domain in Resend

> This unlocks sending from `noreply@voila-africa.com`.

1. Log in to [resend.com](https://resend.com) → **Domains → Add Domain**
2. Enter `voila-africa.com` and click **Add**
3. Add all DNS records Resend gives you to your DNS provider:

   | Type | Name | Value |
   |---|---|---|
   | TXT | `resend._domainkey.voila-africa.com` | *(DKIM key — copy exact value from Resend)* |
   | TXT | `voila-africa.com` | `v=spf1 include:amazonses.com ~all` |
   | MX | `bounces.voila-africa.com` | `feedback-smtp.us-east-1.amazonses.com` |

4. Click **Verify DNS** in Resend. Status changes from **Pending** → **Verified** (usually under
   5 minutes with Cloudflare, up to 48 h with other providers).
5. Go to Resend → **API Keys → Create API Key**
   - Name: `Voila Production`
   - Permission: **Sending access** only
   - Copy the key — you will only see it once.

---

## 2. Set Edge Function secrets

> Supabase Dashboard → **Project Settings → Edge Functions → Secrets**

Add or update all three:

| Secret name | Value |
|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` (from step 1) |
| `RESEND_EMAIL_FROM` | `Voila <noreply@voila-africa.com>` |
| `APP_WEB_URL` | `https://voila-africa.com` |

After saving, deploy all functions:

```bash
supabase functions deploy --project-ref psfnzgvldniabvxxnrbm
```

---

## 3. Configure Supabase Auth to send OTP codes via Resend SMTP

> The 6-digit sign-up codes come from Supabase, not your Edge Functions.
> Supabase needs its own SMTP connection to Resend to send these.

1. Dashboard → **Authentication → Email**
2. Under **SMTP Settings**, enable **Custom SMTP**
3. Fill in exactly:

   | Field | Value |
   |---|---|
   | **SMTP Host** | `smtp.resend.com` |
   | **Port** | `587` |
   | **Username** | `resend` |
   | **Password** | `re_xxxxxxxxxxxx` ← your Resend API key |
   | **Sender name** | `Voila` |
   | **Sender email** | `noreply@voila-africa.com` |

4. Click **Save**. Supabase tests the connection immediately. If it fails:
   - Confirm `voila-africa.com` is **Verified** in Resend (not Pending)
   - Confirm the API key has **Sending access** (not full access)
   - Re-paste the API key as the SMTP Password and save again

---

## 4. Update Auth email templates

> Dashboard → **Authentication → Email Templates**

### Confirm signup (OTP) — the code users enter to verify their email

Set **Subject** to:
```
Your Voila verification code
```

Paste this as the **Body (HTML)**:

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
     background:#f0f0f0; padding:40px 16px;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff;">

    <div style="padding:18px 32px; border-bottom:3px solid #0B6623;">
      <span style="font-size:14px; font-weight:700; color:#0B6623; letter-spacing:3px;">VOILA</span>
    </div>

    <div style="padding:36px 32px;">
      <h1 style="margin:0 0 16px; font-size:21px; font-weight:600; color:#111111; line-height:1.35;">
        Confirm your email
      </h1>
      <p style="margin:0 0 24px; font-size:14px; color:#444444; line-height:1.75;">
        Enter this code in the Voila app to complete your sign-up.
        It expires in <strong>10 minutes</strong>.
      </p>

      <div style="background:#f8f8f8; border-left:3px solid #0B6623; padding:28px 32px;
           margin-bottom:24px; text-align:center;">
        <span style="font-size:40px; font-weight:700; letter-spacing:12px; color:#0B6623;">
          {{ .Token }}
        </span>
      </div>

      <p style="margin:0; font-size:13px; color:#888888; line-height:1.6;">
        If you did not request this, you can safely ignore this email.
        Your account will not be created unless you enter the code above.
      </p>
    </div>

    <div style="padding:16px 32px 24px; border-top:1px solid #e8e8e8;">
      <p style="margin:0; font-size:11px; color:#aaaaaa; line-height:1.6;">
        Voila &mdash; Helping students find global opportunities
      </p>
    </div>

  </div>
</div>
```

### Magic Link (if you enable it later)

Subject: `Sign in to Voila`

Use this as the callback URL in the template:
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink
```

### Change email address

Subject: `Confirm your new email — Voila`

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change
```

### Reset password

Subject: `Reset your Voila password`

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery
```

---

## 5. Set URL Configuration

> Dashboard → **Authentication → URL Configuration**

| Field | Value |
|---|---|
| **Site URL** | `https://voila-africa.com` |

Under **Redirect URLs**, add each line as a separate entry:

```
https://voila-africa.com/**
voila://auth/callback
exp://localhost:8081/--/auth/callback
```

> `voila://` is required for Google OAuth on mobile.
> `exp://` is for Expo Go during development.
> Without these, Google Sign-In throws `redirect_uri_mismatch`.

---

## 6. Configure Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services →
   Credentials** → open your OAuth 2.0 client
2. Under **Authorized redirect URIs**, add:
   ```
   https://psfnzgvldniabvxxnrbm.supabase.co/auth/v1/callback
   ```
3. Save.
4. Dashboard → **Authentication → Providers → Google** → toggle **Enable**, paste
   **Client ID** and **Client Secret**, save.

---

## 7. Auth settings to double-check

> Dashboard → **Authentication → Providers → Email**

| Setting | Value |
|---|---|
| **Enable Email provider** | On |
| **Confirm email** | On |
| **Secure email change** | On |
| **OTP Expiry** | `600` seconds (10 minutes) |

---

## 8. Smoke-test checklist

### Create account (new user)
- [ ] Enter name, email, password → tap **Create account**
- [ ] Receive 6-digit code email from `noreply@voila-africa.com` within 30 seconds
- [ ] Email arrives in inbox (not spam), code is readable
- [ ] Enter code → lands on onboarding screen
- [ ] Complete onboarding → lands on dashboard
- [ ] Receive welcome email from `noreply@voila-africa.com`
- [ ] "Go to Voila" button in welcome email opens `https://voila-africa.com/dashboard`

### Sign in (existing user)
- [ ] Email + password → **Continue**
- [ ] If email not yet confirmed: receive OTP, verify, land on onboarding or dashboard
- [ ] If already confirmed: land directly on dashboard (no OTP needed)

### Google Sign-In
- [ ] Tap **Continue with Google** → Google picker appears
- [ ] Select account → returns to app → lands on onboarding (new) or dashboard (existing)
- [ ] No `redirect_uri_mismatch` error

### Email deliverability
- [ ] Send a test email via Resend dashboard → check [mail-tester.com](https://mail-tester.com)
- [ ] SPF: Pass
- [ ] DKIM: Pass
- [ ] Spam score: 9+/10

---

## How the email systems connect

```
User signs up
  └─► Supabase Auth sends OTP code (6-digit)      ← Resend SMTP (section 3)
        └─► User enters code in app
              └─► User completes onboarding
                    └─► Edge Function sends welcome email  ← RESEND_API_KEY secret (section 2)

User saves an opportunity
  └─► Cron job calls send-deadline-reminder        ← 3 days before deadline

User starts a CV
  └─► Cron job calls send-cv-abandonment-reminder  ← 3 emails over 3 days

Admin pairs mentor + mentee
  └─► send-mentor-match-emails fires               ← notifies both parties

Session is booked
  └─► send-session-booking-emails fires            ← confirmation email
        └─► 15 min before session
              └─► send-session-booking-emails fires ← reminder with join link
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| OTP email never arrives | Resend SMTP not configured or domain not verified | Re-check section 3 |
| OTP arrives from `noreply@mail.app.supabase.io` | Custom SMTP not saved | Re-enter SMTP password (the Resend API key) and save |
| `redirect_uri_mismatch` on Google | Missing redirect URL | Add entries from section 5 and 6 |
| Welcome email not sending | `RESEND_API_KEY` secret missing | Re-check section 2 |
| Code says "invalid or expired" | OTP expiry too short or waited too long | Confirm OTP Expiry is 600 in Auth settings |
| Sign-up works but user skips onboarding | `onboarding_complete` already true | `UPDATE profiles SET onboarding_complete = false WHERE id = '<id>'` |
| Session booking emails not sending | Function missing from config.toml | Already fixed — redeploy with `supabase functions deploy` |
