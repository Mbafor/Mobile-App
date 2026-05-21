# Phase 8: Push & in-app notifications

## 1. Run migration

In the Supabase SQL Editor, run migrations in order. For notifications:

`supabase/migrations/005_notifications.sql`

Creates:

- `notification_preferences` — per-user toggles + `last_match_sync_at`
- `user_push_tokens` — Expo push tokens
- `notifications` — in-app history with `dedupe_key` (prevents duplicates)

## 2. Environment

Optional for **remote** Expo push (device token registration):

```env
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-uuid
```

Create a project at [expo.dev](https://expo.dev) and copy the project ID. Without this, in-app notifications and local alerts still work; remote push token registration is skipped.

## 3. App behavior

| Type | When | Preference |
|------|------|------------|
| New match | Opportunity created after last sync, tag overlap with interests/types | `new_matches` |
| Deadline reminder | Exactly 3 calendar days before deadline | `deadline_reminders` |
| Saved reminder | Saved opportunity, 1 calendar day before deadline | `saved_reminders` |

- **Dedupe:** `unique (user_id, dedupe_key)` in `notifications`
- **Sync:** On app launch and when app returns to foreground (`NotificationProvider`)
- **Push:** Local notification when `push_enabled` and OS permission granted; token stored in `user_push_tokens`
- **Denied permission:** Settings shows warning; enabling push requests permission again

## 4. Screens

- **Notifications tab** — history, mark read, open opportunity
- **Settings → Notification preferences** — toggles stored in Supabase

## 5. Production remote push (optional)

For alerts when the app is closed, deploy a scheduled Supabase Edge Function that:

1. Evaluates the same rules as `notification-sync.ts` (or reads pending rows)
2. Inserts into `notifications` with dedupe
3. Sends via [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/) using tokens from `user_push_tokens`

Use the **service role** key only on the server, never in the client.

## 6. Physical device

Push notifications require a physical device (not Expo Go web). Use a development build or EAS Build for full push testing on iOS/Android.
