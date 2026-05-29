# Google Meet Setup (Mentorship Sessions)

Meet links are generated automatically via the Supabase Edge Function
`google-calendar-create-event` using a **Google Workspace Service Account**
with **Domain-Wide Delegation (DWD)**. No user-facing OAuth calendar scope is
requested — the service account handles everything on the backend.

## Architecture overview

```
Coach confirms session
        │
        ▼
Frontend → supabase.functions.invoke('google-calendar-create-event')
        │
        ▼
Edge Function
  1. Verifies caller's Supabase JWT
  2. Builds a signed JWT assertion (RS256) for the Service Account
  3. Exchanges assertion for a Google OAuth 2.0 access token
     (DWD impersonates GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL)
  4. Calls Google Calendar API → creates event + Meet link
  5. Writes meeting_url to mentorship_sessions (service role)
        │
        ▼
Frontend receives { meetingUrl, eventId }
```

Required Supabase secrets:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL`
- `GOOGLE_CALENDAR_ID` (defaults to `primary`)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase in production)

> See `docs/SERVICE_ACCOUNT_DWD_SETUP.md` for the full step-by-step
> Google Cloud + Workspace Admin configuration guide.

## Quick-start checklist

- [ ] Google Workspace admin access available
- [ ] Google Cloud project created and Calendar API enabled
- [ ] Service account created with DWD enabled, JSON key downloaded
- [ ] DWD granted in Google Workspace Admin for the `calendar` scope
- [ ] Four Supabase secrets set (see above)
- [ ] Edge Function deployed: `supabase functions deploy google-calendar-create-event`

## Local development

```bash
# Run with local secrets file
supabase functions serve google-calendar-create-event \
  --env-file ./supabase/.env.local
```

`supabase/.env.local` (never commit):
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=my-sa@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_EMAIL=admin@yourworkspace.com
GOOGLE_CALENDAR_ID=primary
```

## Notification flow (unchanged)

After `meeting_url` is written:
- In-app + push notifications are produced from `notifications` rows
- Session emails are sent by `send-session-booking-emails` (cron-triggered)

## End-to-end test checklist

1. Book a slot as mentee
2. Confirm as coach (triggers edge function)
3. Check Supabase logs — no errors from the function
4. Verify `meeting_url` is populated in `mentorship_sessions`
5. Verify both users receive in-app notification, push, and email
6. Open the Meet link — confirm it loads a valid Google Meet room
