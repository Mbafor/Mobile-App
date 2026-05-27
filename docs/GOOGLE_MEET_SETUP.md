# Google Meet Setup (Mentorship Sessions)

This project auto-generates Google Meet links through the Supabase edge function:
`supabase/functions/google-calendar-create-event`.

## 1) Create Google Cloud Project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project for OLF

## 2) Enable API

Enable:
- **Google Calendar API**

## 3) Create service account

1. IAM & Admin -> Service Accounts -> Create service account
2. Create a JSON key
3. Save:
   - `client_email`
   - `private_key`

## 4) Share calendar with service account

1. Create/select the calendar to host mentorship meetings
2. Share it with the service account email
3. Grant "Make changes to events"

## 5) Set Supabase secrets

Set these secrets in Supabase:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep line breaks; if pasted escaped, `\n` is handled)
- `GOOGLE_CALENDAR_ID` (calendar email/id, or `primary`)
- `SUPABASE_SERVICE_ROLE_KEY`

## 6) Deploy function

Deploy:
- `google-calendar-create-event`

This function:
1. Creates a Calendar event with `conferenceData.createRequest`
2. Generates a Meet link
3. Writes `meeting_url` and `status='confirmed'` to `mentorship_sessions`

## 7) Notification flow

After session creation/confirmation:
- In-app + push are produced from `notifications` rows
- Session emails are sent by `send-session-booking-emails` (cron-triggered)

## 8) Local + production test checklist

1. Book a slot as mentee
2. Confirm as mentor
3. Verify `meeting_url` is saved in DB
4. Verify both users receive:
   - in-app notification
   - push notification
   - email
5. Open Meet link from app + email
