
I'm building an event registration and management system for Voila Africa (voila-africa.com, Next.js marketing site, connected to Supabase project ref psfnzgvldniabvxxnrb). Goal: maximize event attendance by making registration frictionless (no Google Forms, no login required) and following up with reminders.

**Database (Supabase/Postgres):**

1. `events` table: id, title, slug (unique), tagline, description (About this event, multi-paragraph), takeaways (array of strings), host_name, host_bio, start_time, end_time, timezone (default GMT), location_type (in_person/online), location_platform (e.g. "Google Meet", or venue name), meeting_link (nullable, revealed after registration), cover_image_url, topic, capacity (nullable int), status (upcoming/past/cancelled), created_at.
2. `event_registrations` table: id, event_id (fk), full_name, email, whatsapp (nullable), is_existing_user (bool, matched by email), registration_ref (unique short code), created_at, reminder_3day_sent (bool), reminder_1day_sent (bool).

**Events listing page** at voila-africa.com/events:
- Upcoming / Past toggle, search bar, filter pills (All / In person / Online, plus topic)
- Event cards: date badge, cover image, online/in-person tag, time, title, description snippet, "Free" tag, host attribution with verified badge

**Single event page** at voila-africa.com/events/[slug]:
- Cover image with date badge and location tag overlaid
- Register button + location tag near top
- Title + tagline
- "Hosted by [name]" with verified badge (text only, no photo)
- Date & Time card: full date, time range with timezone, "Add to calendar" dropdown with three options: Google Calendar link, Outlook link, and .ics download (for Apple/other calendar apps)
- Location card: platform name, lock icon, "Join link appears after you register"
- **About this event** section, multi-paragraph
- "What you'll take away" bullet section
- Host bio block (text only)
- Sticky/bottom CTA card:
  - "Free" heading, "Free to attend" subtext
  - "Reserve your spot" subheading, "Free · takes 20 seconds" subtext
  - Form fields: **Full name** (placeholder "Ama Mensah"), **Email** (placeholder "you@email.com"), **WhatsApp** marked "optional" (placeholder "+233 ...")
  - Button: "Confirm registration →"
  - Trust line with shield icon: "We only email you about this event."
- On success: confirmation with registration ref, meeting link (if online), add-to-calendar dropdown, and a "Create your free Voila Africa account" CTA prefilled with their info if is_existing_user is false
- If capacity is set, show live "X/Y spots filled"

**Confirmation email:** on registration insert, trigger a Resend email with event details, date/time, location/meeting link, registration ref, and .ics attachment.

**Reminder system:** pg_cron job (daily) finds events happening in 3 days and 1 day, pulls registrations where the relevant reminder flag is false, sends a Resend batch reminder, flips the flag. Same batching pattern as digest_batch on profiles.

**Admin view** (internal only): list of events with registration counts, CSV export of registrants per event.

Build order: database migration → events listing + single event page + form (matching the exact copy above) → add-to-calendar (Google link + Outlook link + .ics generation) → confirmation email with .ics attachment → cron reminder job → admin view.
