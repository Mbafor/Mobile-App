# Olives Forum — Screen inventory

Use this list when working on frontend UI. Each row maps an **Expo Router route** to its **screen component** and **backend data**.

> **Important:** This app does **not** use Firebase for app data or auth. Everything persists in **Supabase** (PostgreSQL + Auth). Expo may use FCM/APNs under the hood for device push delivery, but your writes go to Supabase tables only.

---

## Data flow: Settings & preferences

| What the user edits | Settings screen | Supabase table(s) | Used by |
|---------------------|-----------------|-------------------|---------|
| Name, country, university, degree, interests | Profile & preferences | `profiles` | Recommendations, new-match notifications |
| Opportunity types, countries, funding | Profile & preferences | `user_preferences` | Recommendations, new-match notifications |
| Push / match / deadline / saved toggles | Notification preferences | `notification_preferences` | In-app + local push sync |
| Saved / applied counts | (read-only on dashboard) | `saved_opportunities`, `applied_opportunities` | Dashboard stats |

**Profile & preferences save path:** `EditProfilePreferencesScreen` → `useOnboardingActions.saveAllForEdit()` → `profilesApi.saveFullProfile()` + `userPreferencesApi.saveFullPreferences()` → cache invalidation + auth profile refresh.

**Not Firebase:** There is no Firebase Firestore/Realtime Database sync for profile or preferences.

---

## Cross-check: key features after settings change

### Recommendations (Dashboard → “Recommended For You”)

| Check | Status |
|-------|--------|
| Reads `profiles.interests` | Yes — via `useProfileData()` |
| Reads `user_preferences.opportunity_types` | Yes |
| Matches opportunity `tags`, rank by match count, min 1 match | Yes — `rankOpportunitiesByTagMatch()` |
| Updates after profile save | Yes — `saveAllForEdit` invalidates `queryKeys.auth.profile` and `preferences`; pull-to-refresh on dashboard refetches opportunities |

**Note:** Recommendations refresh when React Query refetches profile data (after save, or when revisiting the dashboard). No separate “recompute” job.

### In-app notifications (Notifications tab)

| Check | Status |
|-------|--------|
| History stored in Supabase | Yes — `notifications` table |
| Sync creates rows from rules | Yes — `runNotificationSync()` |
| New matches use interests + opportunity types | Yes — same tag matching as recommendations (`countMatchingTags`) |
| Respects toggles | Yes — `new_matches`, `deadline_reminders`, `saved_reminders` on `notification_preferences` |
| Re-sync after profile change | On next app foreground or when notification pref deps change — not instant on profile save alone |

### Push notifications

| Check | Status |
|-------|--------|
| Preference saved to Supabase | Yes — `notification_preferences.push_enabled` |
| Device permission + Expo token | Yes — `registerExpoPushToken()` → `user_push_tokens` |
| Alert shown on device | **Local push** — `presentLocalPush()` when sync creates a new notification (not a remote Firebase Cloud Function) |
| Remote server push campaign | **Not implemented** — token is stored; no backend sender in repo |

---

## Navigation structure

```
app/
├── index.tsx                    → bootstrap redirect
├── auth/callback.tsx            → OAuth return
├── (auth)/                      → guest auth stack
├── (onboarding)/                → first-time setup (guarded)
└── (main)/                      → drawer (authenticated)
    ├── (tabs)/                  → bottom tabs
    ├── settings/                → settings stack
    ├── opportunity/[id].tsx
    ├── profile.tsx              → drawer
    ├── browse-categories.tsx
    ├── category/[category].tsx
    ├── help.tsx
    ├── legal/privacy.tsx
    ├── legal/terms.tsx
    └── refer.tsx
```

**Drawer:** Hamburger on tab headers → My Profile, Browse, Help, Privacy, Terms, Refer, Log out.

**Bottom tabs:** Dashboard | Saved | Notifications | Settings (+ Admin if `profiles.is_admin`).

---

## Screen catalog

### Bootstrap & auth (guest)

| Route | File | Component | Purpose | Status |
|-------|------|-----------|---------|--------|
| `/` | `app/index.tsx` | `SplashScreen` | Session check → welcome, onboarding, or main | Done |
| `/auth/callback` | `app/auth/callback.tsx` | OAuth callback | Exchange OAuth code for Supabase session | Done |
| `/(auth)/welcome` | `app/(auth)/welcome.tsx` | `WelcomeScreen` | Landing, Google/Apple/email entry | Done |
| `/(auth)/email` | `app/(auth)/email.tsx` | `EmailOtpScreen` | Enter email for OTP | Done |
| `/(auth)/verify-otp` | `app/(auth)/verify-otp.tsx` | `VerifyOtpScreen` | Enter 6-digit code | Done |

### Onboarding (authenticated, incomplete onboarding only)

| Route | File | Component | Supabase writes | Status |
|-------|------|-----------|-----------------|--------|
| `/(onboarding)/basic-information` | `app/(onboarding)/basic-information.tsx` | `BasicInformationScreen` | `profiles` (name, country) | Done |
| `/(onboarding)/academic-information` | `app/(onboarding)/academic-information.tsx` | `AcademicInformationScreen` | `profiles` (university, degree, interests, …) | Done |
| `/(onboarding)/opportunity-preferences` | `app/(onboarding)/opportunity-preferences.tsx` | `OpportunityPreferencesScreen` | `user_preferences`, `onboarding_complete` | Done |

> **Do not** link completed users here — onboarding guard redirects to dashboard.

### Main — bottom tabs

| Route | File | Component | Purpose | Status |
|-------|------|-----------|---------|--------|
| `/(main)/(tabs)/dashboard` | `app/(main)/(tabs)/dashboard.tsx` | `DashboardScreen` | Search bar, recommendations, recent, closing soon | Done |
| `/(main)/(tabs)/saved` | `app/(main)/(tabs)/saved.tsx` | `SavedOpportunitiesScreen` | Saved list + unsave | Done |
| `/(main)/(tabs)/notifications` | `app/(main)/(tabs)/notifications.tsx` | `NotificationsScreen` | In-app notification center | Done |
| `/(main)/(tabs)/settings-tab` | `app/(main)/(tabs)/settings-tab.tsx` | Redirect | → `/(main)/settings` | Done |
| `/(main)/(tabs)/admin` | `app/(main)/(tabs)/admin/index.tsx` | `AdminDashboardScreen` | Admin only — analytics | Done |
| `/(main)/(tabs)/admin/opportunities` | `app/(main)/(tabs)/admin/opportunities.tsx` | `AdminOpportunitiesScreen` | List / edit / delete | Done |
| `/(main)/(tabs)/admin/create` | `app/(main)/(tabs)/admin/create.tsx` | `AdminCreateOpportunityScreen` | Create opportunity | Done |
| `/(main)/(tabs)/admin/[id]/edit` | `app/(main)/(tabs)/admin/[id]/edit.tsx` | `AdminEditOpportunityScreen` | Edit opportunity | Done |

### Main — opportunity detail

| Route | File | Component | Purpose | Status |
|-------|------|-----------|---------|--------|
| `/(main)/opportunity/[id]` | `app/(main)/opportunity/[id].tsx` | `OpportunityDetailScreen` | Detail, save, apply, share | Done |

### Main — settings stack

| Route | File | Component | Purpose | Status |
|-------|------|-----------|---------|--------|
| `/(main)/settings` | `app/(main)/settings/index.tsx` | `SettingsHomeScreen` | Hub: profile, privacy, notifications, logout | Done |
| `/(main)/settings/profile` | `app/(main)/settings/profile.tsx` | `EditProfilePreferencesScreen` | Edit profile + prefs → **Supabase** | Done |
| `/(main)/settings/privacy` | `app/(main)/settings/privacy.tsx` | `PrivacySettingsScreen` | Account privacy / delete | **Placeholder** |
| `/(main)/settings/notifications-prefs` | `app/(main)/settings/notifications-prefs.tsx` | `NotificationPreferencesScreen` | Toggles → `notification_preferences` | Done |

### Main — drawer screens

| Route | File | Component | Purpose | Status |
|-------|------|-----------|---------|--------|
| `/(main)/profile` | `app/(main)/profile.tsx` | `EditProfilePreferencesScreen` | Same as settings profile | Done |
| `/(main)/browse-categories` | `app/(main)/browse-categories.tsx` | `BrowseCategoriesScreen` | Category grid | Done |
| `/(main)/category/[category]` | `app/(main)/category/[category].tsx` | `CategoryOpportunitiesScreen` | Filtered list by category/tags | Done |
| `/(main)/help` | `app/(main)/help.tsx` | `HelpFaqScreen` | Static FAQ | Done |
| `/(main)/legal/privacy` | `app/(main)/legal/privacy.tsx` | `LegalPrivacyScreen` | Static privacy copy | Done |
| `/(main)/legal/terms` | `app/(main)/legal/terms.tsx` | `LegalTermsScreen` | Static terms copy | Done |
| `/(main)/refer` | `app/(main)/refer.tsx` | `ReferFriendScreen` | System share sheet | Done |

### Unused / legacy components (no route)

| Component | Path | Note |
|-----------|------|------|
| `OpportunitiesListScreen` | `src/features/opportunities/screens/OpportunitiesListScreen.tsx` | Replaced by dashboard search — safe to ignore or delete |
| `SearchScreen` | (removed) | Search moved to dashboard top bar |
| `SplashScreen` | `src/features/auth/screens/SplashScreen.tsx` | Not wired to a route |

---

## Shared UI (not full screens)

| Area | Location | Used on |
|------|----------|---------|
| Opportunity search bar | `OpportunitySearchBar` | Dashboard |
| Search results | `OpportunitySearchResults` | Dashboard (active search) |
| Filters modal | `OpportunityFiltersPanel` | Dashboard |
| Opportunity cards/rows | `OpportunityCard`, `OpportunityListRow` | Dashboard sections, lists |
| Drawer menu | `AppDrawerContent` | All main drawer routes |
| Admin charts | `AdminBarChart`, `AdminPieChart`, `AdminTopList` | Admin dashboard |

---

## Supabase tables reference (frontend-relevant)

| Table | Screens that read/write |
|-------|-------------------------|
| `profiles` | Onboarding, profile edit, recommendations, notifications sync |
| `user_preferences` | Onboarding, profile edit, recommendations, notifications sync |
| `opportunities` | Dashboard, search, saved, category browse, detail, admin |
| `saved_opportunities` | Saved tab, detail save, dashboard counts, notification rules |
| `applied_opportunities` | Detail apply, dashboard counts |
| `notifications` | Notifications tab, sync |
| `notification_preferences` | Notification settings, sync |
| `user_push_tokens` | Push registration |

---

## Suggested frontend work order

1. **Polish** — `DashboardScreen`, `OpportunityDetailScreen`, `SavedOpportunitiesScreen`
2. **Settings** — `PrivacySettingsScreen` (delete account UI if RPC exists)
3. **Drawer / legal** — copy and layout on Help, Privacy, Terms, Refer
4. **Onboarding** — visual consistency with `EditProfilePreferencesScreen`
5. **Admin** — charts layout and opportunity form UX
6. **Notifications** — empty states, list item design, permission banner

---

## Quick test checklist (settings → features)

1. Change **interests** and **opportunity types** in Profile & preferences → Save.
2. Open **Dashboard** → Recommended section should reflect new tags (after save or pull-to-refresh).
3. Background app and reopen → **Notifications** sync may create new-match rows if new listings match.
4. Toggle **Notification preferences** → confirm rows in Supabase `notification_preferences`.
5. Enable push → new sync items should trigger a **local** device banner (physical device; limited on web/simulator).
