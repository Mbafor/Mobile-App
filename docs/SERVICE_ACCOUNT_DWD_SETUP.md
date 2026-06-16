# Service Account + Domain-Wide Delegation Setup

This guide explains every step required to make the `google-calendar-create-event`
Edge Function work with a Google Workspace Service Account using
Domain-Wide Delegation (DWD).

## What is Domain-Wide Delegation?

A Service Account normally only has access to resources it owns. DWD lets it
**impersonate a real user in your Google Workspace** — in this case the admin
(or a dedicated "calendar-bot") account — so it can create Calendar events and
generate Google Meet links on that user's behalf, without any end-user OAuth
consent flow.

**Why this is better than the previous approach:**
- Users never see a "Grant access to Google Calendar" consent screen during login
- No stored user refresh tokens that can expire or be revoked
- Calendar event creation is fully server-side and invisible to end users
- Credentials rotate in one place (Supabase secrets), not per-user

---

## Prerequisites

- You are a **Google Workspace Super Admin** (or have someone who is)
- You have access to **Google Cloud Console** for your project
- You have the Supabase CLI installed and can deploy Edge Functions

---

## Part 1 — Google Cloud Console

### 1.1 Select (or create) your Google Cloud project

1. Open [https://console.cloud.google.com](https://console.cloud.google.com)
2. In the top bar, select the project linked to Voila (or create a new one)

### 1.2 Enable the Google Calendar API

1. Go to **APIs & Services → Library**
2. Search for **Google Calendar API**
3. Click it and press **Enable**

### 1.3 Create a Service Account

1. Go to **IAM & Admin → Service Accounts**
2. Click **+ Create Service Account**
3. Fill in:
   - **Name**: `Voila-calendar` (or any descriptive name)
   - **ID**: auto-filled, e.g. `Voila-calendar@your-project.iam.gserviceaccount.com`
   - **Description**: "Creates Google Calendar events for Voila mentorship sessions"
4. Click **Create and Continue**
5. Skip the optional "Grant access" and "Grant users access" steps — click **Done**

> You do NOT need to assign any IAM roles to the service account.
> Calendar access is granted through DWD in the Workspace Admin Console, not IAM.

### 1.4 Enable Domain-Wide Delegation on the Service Account

1. In the Service Accounts list, click the service account you just created
2. Click the **Details** tab (or scroll to "Advanced settings")
3. Under **Domain-wide delegation**, click **Edit**
4. Check **Enable Google Workspace Domain-wide Delegation**
5. Enter a product name for the consent screen (e.g. "Voila")
6. Click **Save**
7. **Note the Client ID** shown (a long number like `123456789012345678901`). You need it in Part 2.

### 1.5 Download a JSON key

1. Still on the service account page, click the **Keys** tab
2. Click **Add Key → Create new key**
3. Choose **JSON** → **Create**
4. The file downloads automatically — it looks like:

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n",
  "client_email": "Voila-calendar@your-project.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  ...
}
```

5. **Keep this file secret** — treat it like a password. Store it somewhere safe
   (e.g. your password manager) and never commit it to git.

Values you need from this file:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

---

## Part 2 — Google Workspace Admin Console

> You must complete this step as a **Google Workspace Super Admin**.
> This is what actually grants the service account permission to act on behalf
> of users in your domain.

### 2.1 Navigate to Domain-Wide Delegation settings

1. Open [https://admin.google.com](https://admin.google.com)
2. Go to **Security → Access and data control → API controls**
3. Scroll to **Domain-wide delegation** and click **Manage Domain Wide Delegation**

### 2.2 Add the service account

1. Click **Add new**
2. In **Client ID**, paste the Client ID you noted in step 1.4
3. In **OAuth scopes**, add exactly:
   ```
   https://www.googleapis.com/auth/calendar
   ```
4. Click **Authorize**

> **Why `calendar` and not `calendar.events`?**
> The broader `calendar` scope is required when creating events with
> `conferenceData` (Meet links). The narrower `calendar.events` scope
> does not let the service account create conference data.

### 2.3 Decide which user to impersonate

The `GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL` secret must be the email address
of a real Google Workspace user in your domain. Two common choices:

| Option | Pros | Cons |
|--------|------|------|
| **Workspace admin** (e.g. `admin@yourcompany.com`) | Already exists | Mixes admin and app calendars |
| **Dedicated bot account** (e.g. `meetings@yourcompany.com`) | Clean separation | Requires a licensed Workspace seat |

Recommended: create a dedicated `meetings@yourcompany.com` (or similar) account.
The Meet links and calendar invites will appear to come from that address.

> That account must have **Google Meet** enabled. You can verify by logging in
> as that user and checking that Meet is available in Google Workspace apps.

---

## Part 3 — Supabase Secrets

Set these four secrets in your Supabase project. Values come from the JSON
key file downloaded in step 1.5 and your decisions in step 2.3.

### Using the Supabase Dashboard

1. Open your Supabase project → **Edge Functions** (left sidebar)
2. Click **Manage secrets**
3. Add each secret:

| Secret name | Value |
|-------------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON key, e.g. `Voila-calendar@your-project.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Full `private_key` value from the JSON key, including the `-----BEGIN/END-----` headers |
| `GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL` | The Workspace user to impersonate, e.g. `meetings@yourworkspace.com` |
| `GOOGLE_CALENDAR_ID` | `primary` (uses the impersonated user's primary calendar) — or a specific calendar ID if you want a shared team calendar |

### Using the Supabase CLI

```bash
supabase secrets set \
  GOOGLE_SERVICE_ACCOUNT_EMAIL="Voila-calendar@your-project.iam.gserviceaccount.com" \
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEv...
-----END PRIVATE KEY-----" \
  GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL="meetings@yourworkspace.com" \
  GOOGLE_CALENDAR_ID="primary"
```

> **Important — private key formatting:**
> The private key contains literal newline characters. When you paste it into
> the Supabase Dashboard, paste it exactly as it appears in the JSON file
> (with real newlines, not `\n` escape sequences). The Edge Function handles
> both formats.

---

## Part 4 — Deploy the Edge Function

```bash
supabase functions deploy google-calendar-create-event
```

Verify deployment:
```bash
supabase functions list
# Should show: google-calendar-create-event   ACTIVE
```

---

## Part 5 — Verify it Works

### Manual test via curl

```bash
# 1. Get a valid Supabase user JWT (log in via the app and copy the access token)
TOKEN="eyJhbGci..."

# 2. Invoke the function
curl -X POST https://<your-project>.supabase.co/functions/v1/google-calendar-create-event \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-id",
    "coachEmail": "coach@example.com",
    "studentEmail": "student@example.com",
    "scheduledStart": "2025-06-15T14:00:00Z",
    "scheduledEnd": "2025-06-15T15:00:00Z",
    "timezone": "UTC",
    "title": "Test Mentorship Session"
  }'
```

Expected response:
```json
{
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "eventId": "abc123xyz..."
}
```

### In-app test

1. Book a slot as a mentee
2. Confirm as the coach — the UI shows a loading state while the function runs
3. Check Supabase **Edge Function logs** for the function (no errors)
4. Verify `meeting_url` is populated in the `mentorship_sessions` table
5. Open the Meet link in a browser — it should resolve to a valid meeting room

---

## Troubleshooting

### `Service Account token exchange failed: unauthorized_client`

The DWD grant in Google Workspace Admin has not propagated yet, or the
Client ID was entered incorrectly. Wait up to 10 minutes after adding the
grant, then retry.

### `Service Account token exchange failed: access_denied`

The scope in the Workspace Admin grant does not match. Confirm it is
`https://www.googleapis.com/auth/calendar` (not `calendar.events`).

### `Google Calendar API error: 403 — Service accounts cannot invite attendees…`

The impersonated account does not have a Google Workspace Calendar licence.
Use a real, licensed Workspace user as the impersonate email.

### `Google returned no Meet link`

The impersonated user does not have Google Meet enabled in their Workspace
account. Log in as that user, open Google Meet, and verify it is accessible.
If Meet is not included in your Workspace plan, you will need to upgrade.

### Private key import error in Edge Function logs

The `private_key` value was pasted with escaped `\n` instead of real newlines,
AND the normalisation in the function did not fix it. Try re-setting the secret
with real newline characters (open the JSON file, copy the key value including
the headers, paste directly).

---

## Secrets rotation

When you need to rotate the key:
1. Create a new JSON key in Google Cloud Console (Service Account → Keys → Add Key)
2. Update `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (and `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   if you changed accounts) in Supabase secrets
3. Delete the old key in Google Cloud Console
4. Redeploy the function: `supabase functions deploy google-calendar-create-event`
