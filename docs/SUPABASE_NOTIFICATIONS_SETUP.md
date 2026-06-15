# Notifications: push, in-app, and email

## 1. Run migrations

Apply migrations in order through `021_notification_system_completion.sql`:

| Migration | Purpose |
|-----------|---------|
| `005_notifications.sql` | Core tables, prefs auto-create, RLS |
| `015_super_admin_notifications.sql` | Mentorship types, triggers, `create_app_notification` |
| `018_mentorship_calendar_scheduling.sql` | `session_booked`, booking triggers, reminders |
| `021_notification_system_completion.sql` | Email RPC, CV reminders, preference fix, delete policy |

## 2. Environment

```env
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-uuid
EXPO_PUBLIC_APP_WEB_URL=https://voila-africa.com
```

Supabase secrets (Dashboard → Edge Functions → Secrets):

- `RESEND_API_KEY` — transactional email
- `CRON_SECRET` — protects scheduled edge functions
- `APP_WEB_URL` — optional; defaults to `https://voila-africa.com` for email CTAs

## 3. In-app + push flows

| Type | Source | Preference |
|------|--------|------------|
| New match | Client sync | `new_matches` |
| Deadline reminder | Client sync (3 days) | `deadline_reminders` |
| Saved reminder | Client sync (1 day, saved) | `saved_reminders` |
| Mentor / mentee assigned | DB trigger | `mentorship_assignments` |
| Waiting list | DB trigger | `waiting_list_updates` |
| Session reminder / booked | DB trigger + cron RPC | `session_reminders` |
| Mentorship message | DB trigger | `mentorship_messages` |
| Mentor broadcast | Super admin RPC | always on |

- **In-app** respects per-type prefs only (`push_enabled` does not block in-app rows).
- **Local push** when the app is open and `push_enabled`.
- **Remote push** via `deliver-pending-pushes` (Expo Push API + `user_push_tokens`).
- **Realtime** invalidates the notifications list on insert/update.

## 4. Email flows

| Function | Trigger | CTA |
|----------|---------|-----|
| `send-welcome-email` | After onboarding complete (client invoke, deduped) | Open Platform |
| `send-deadline-reminder` | Daily cron | View Opportunity |
| `send-cv-abandonment-reminder` | Daily cron | Continue Building CV |
| `send-mentor-match-emails` | Cron after mentorship assign | View Profile |

All cron email/push functions require:

```http
POST /functions/v1/<name>
Authorization: Bearer <CRON_SECRET>
```

Suggested schedules (Supabase Dashboard → Edge Functions → Schedules):

| Function | Schedule |
|----------|----------|
| `deliver-pending-pushes` | Every 5–15 minutes |
| `send-deadline-reminder` | Daily 09:00 UTC |
| `send-cv-abandonment-reminder` | Daily 10:00 UTC |
| `send-mentor-match-emails` | Every 15 minutes |
| `mentorship-maintenance` | Hourly |

## 5. App screens

- **Notifications tab** — filters, grouping, avatars, swipe read/delete
- **Settings → Notification preferences** — toggles in Supabase

## 6. Physical device

Push requires a physical device and EAS project ID. Web skips push registration.
