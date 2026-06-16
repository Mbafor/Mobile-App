# Supabase + Resend — Email Auth Setup Checklist

You use **Resend** for all outbound email. There are **two separate email systems** in this app
and each needs its own configuration:

| System | What it sends | How it's sent |
|---|---|---|
| **Supabase Auth** | Sign-up OTP codes, email confirmation | Resend SMTP relay (configured in Supabase Dashboard) |
| **Edge Function** | Welcome email after onboarding | Resend HTTP API (your `RESEND_API_KEY` secret) |

Both need the same verified sender domain. Do section 1 (domain verification) first — everything
else depends on it.

---

## 1. Verify your domain in Resend

> This unlocks sending from `noreply@voila-africa.com` instead of Resend's shared pool.

1. Log in to [resend.com](https://resend.com) → **Domains → Add Domain**
2. Enter `voila-africa.com` and click **Add**
3. Resend will give you DNS records to add. Go to your DNS provider (Cloudflare / Namecheap /
   etc.) and add **all three**:

   | Type | Name | Value (example — use Resend's exact values) |
   |---|---|---|
   | TXT | `resend._domainkey.voila-africa.com` | `p=MIGfMA0GCSqGSIb3...` (DKIM public key) |
   | TXT | `voila-africa.com` | `v=spf1 include:amazonses.com ~all` |
   | MX | `bounces.voila-africa.com` | `feedback-smtp.us-east-1.amazonses.com` |

4. Click **Verify DNS** in Resend. Status changes from **Pending** → **Verified** (can take up
   to 48 h but usually < 5 min with Cloudflare).
5. Once verified, go to Resend → **API Keys → Create API Key**
   - Name: `Voila Production`
   - Permission: **Sending access** (not full access)
   - Copy the key — you will only see it once.

---

## 2. Set Edge Function secrets (transactional welcome email)

> Dashboard → **Project Settings → Edge Functions → Secrets**

Add or update these three secrets:

| Secret name | Value |
|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` (the key from step 1) |
| `RESEND_EMAIL_FROM` | `Voila <noreply@voila-africa.com>` |
| `APP_WEB_URL` | `https://app.voila-africa.com` |

After saving, deploy your functions so they pick up the new secrets:

```bash
supabase functions deploy --project-ref <your-project-ref>
```

---

## 3. Configure Supabase Auth to send OTP emails via Resend SMTP

> The 6-digit sign-up codes users receive come from Supabase, not your Edge Function.
> Supabase needs its own connection to Resend to send these.

### Step-by-step

1. Dashboard → **Authentication → Email**
2. Under **SMTP Settings**, enable **Custom SMTP**
3. Fill in the fields exactly:

   | Field | Value |
   |---|---|
   | **SMTP Host** | `smtp.resend.com` |
   | **Port** | `587` |
   | **Username** | `resend` |
   | **Password** | `re_xxxxxxxxxxxx` ← your Resend API key (same one from step 1) |
   | **Sender name** | `Voila` |
   | **Sender email** | `noreply@voila-africa.com` |

4. Click **Save** — Supabase will test the connection immediately. If it fails, double-check
   that the domain is verified in Resend and that the API key has sending access.

> **Important**: Resend's SMTP endpoint only accepts API keys that have sending permission.
> Make sure you didn't create a full-access key and scope it down, or create a dedicated key.

---

## 4. Update Auth email templates

> Dashboard → **Authentication → Email Templates**

The default Supabase templates use placeholder links and a generic layout. Update each one.

### Confirm signup (OTP)

This is the email users receive when they create an account. Supabase inserts the 6-digit code
via `{{ .Token }}`.

Paste this as the **Body (HTML)**:

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
  <div style="width:48px;height:48px;background:#0B6623;border-radius:12px;
    display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
    <span style="color:white;font-size:22px;font-weight:700;">O</span>
  </div>
  <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">Confirm your email</h1>
  <p style="color:#555;line-height:1.65;margin:0 0 24px;">
    Enter this code in the Voila app to complete your sign-up:
  </p>
  <div style="background:#F3F7F4;border-radius:12px;padding:24px;text-align:center;
    margin-bottom:24px;">
    <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0B6623;">
      {{ .Token }}
    </span>
  </div>
  <p style="color:#555;font-size:14px;line-height:1.65;margin:0 0 8px;">
    This code expires in <strong>10 minutes</strong>. If you did not request this, you can
    safely ignore this email.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#aaa;font-size:12px;margin:0;">
    Voila · Helping students find global opportunities
  </p>
</div>
```

Set **Subject** to: `Your Voila verification code`

### Magic Link (if you enable it later)

Subject: `Sign in to Voila`

Replace the CTA link with:
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink
```

### Change email address

Subject: `Confirm your new email — Voila`

Replace the CTA link with:
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change
```

### Reset password

Subject: `Reset your Voila password`

Replace the CTA link with:
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery
```

---

## 5. Set URL Configuration

> Dashboard → **Authentication → URL Configuration**

| Field | Value |
|---|---|
| **Site URL** | `https://app.voila-africa.com` |

Under **Redirect URLs**, add each line as a separate entry:

```
https://app.voila-africa.com/**
https://voila-africa.com/**
voila://auth/callback
exp://localhost:8081/--/auth/callback
```

> The `voila://` entry is required for Google OAuth on mobile.
> The `exp://` entry is for Expo Go during development.
> Without these, Google Sign-In throws a `redirect_uri_mismatch` error.

---

## 6. Configure Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services →
   Credentials** → open your OAuth 2.0 client (or create one).
2. Under **Authorized redirect URIs**, add:
   ```
   https://psfnzgvldniabvxxnrbm.supabase.co/auth/v1/callback
   ```
   *(This is your project's Supabase callback — Supabase proxies Google's response back to your app.)*
3. Save.
4. Dashboard → **Authentication → Providers → Google** → toggle **Enable**, paste your
   **Client ID** and **Client Secret**, save.

---

## 7. Auth settings to double-check

> Dashboard → **Authentication → Providers → Email**

| Setting | Value |
|---|---|
| **Enable Email provider** | ✅ On |
| **Confirm email** | ✅ On (users must verify before they can sign in) |
| **Secure email change** | ✅ On |
| **OTP Expiry** | `600` seconds (10 min — matches the UI hint) |

---

## 8. Smoke-test checklist

Run through each of these after applying all the settings above:

### Create account (new user)
- [ ] Go to the app → "Create account" tab → enter name, email, password → tap **Create account**
- [ ] Receive 6-digit code email from `noreply@voila-africa.com` within 30 seconds
- [ ] Email arrives in inbox (not spam) and code is readable
- [ ] Enter code in app → lands on **Basic information** onboarding screen
- [ ] Complete all 3 onboarding steps → lands on **Dashboard**
- [ ] Receive welcome email from `noreply@voila-africa.com` with "Open Platform" link
- [ ] "Open Platform" link opens `https://app.voila-africa.com`

### Sign in (existing user)
- [ ] "Sign in" tab → email + password → **Continue**
- [ ] If email not yet confirmed: receive OTP, verify, land on onboarding or dashboard
- [ ] If already confirmed: land directly on dashboard (no OTP needed)

### Google Sign-In
- [ ] Tap **Continue with Google** → Google picker appears
- [ ] Select account → returns to app → lands on onboarding (new) or dashboard (existing)
- [ ] No `redirect_uri_mismatch` error

### Welcome email content
- [ ] From address shows `Voila <noreply@voila-africa.com>`
- [ ] Subject is `Welcome to Voila`
- [ ] "Open Platform" button links to `https://app.voila-africa.com`
- [ ] Support contact shows `support@voila-africa.com`

### Email deliverability
- [ ] Send a test email via Resend dashboard → check [mail-tester.com](https://mail-tester.com)
- [ ] SPF: Pass
- [ ] DKIM: Pass
- [ ] DMARC: Pass (or None if not yet configured)
- [ ] Spam score: 9+/10

---

## Quick reference: what sends what

```
User signs up
  └─► Supabase Auth sends OTP code        ← configured via Resend SMTP (section 3)
        └─► User verifies OTP
              └─► Onboarding completes
                    └─► Edge Function sends welcome email  ← uses RESEND_API_KEY secret (section 2)
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| OTP email never arrives | Resend SMTP not configured or domain not verified | Re-check section 3 |
| OTP arrives from `noreply@mail.app.supabase.io` | Custom SMTP not saved or test failed | Re-enter SMTP password (the Resend API key) and save again |
| `redirect_uri_mismatch` on Google sign-in | Missing redirect URL in Supabase or Google Console | Add entries from section 5 and 6 |
| Welcome email not sending | `RESEND_API_KEY` secret missing or domain not verified | Re-check section 2 |
| Code "invalid or expired" | OTP expiry too short or user waited too long | Check OTP Expiry is 600 in Auth settings |
| Sign-up succeeds but user skips onboarding | `onboarding_complete` already set to true in DB | Run `UPDATE profiles SET onboarding_complete = false WHERE id = '<user_id>'` |
