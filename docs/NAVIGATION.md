# Navigation — Voila

Expo Router file-based routes. Route groups `(name)` do not appear in the URL path.

## Route tree

```
app/
├── _layout.tsx                 Root: Providers, fonts, theme, auth listener
├── index.tsx                   Redirect hub (session → correct group)
│
├── (auth)/
│   ├── _layout.tsx             Stack, header hidden
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
│
├── (onboarding)/
│   ├── _layout.tsx             Stack
│   ├── welcome.tsx
│   ├── profile-setup.tsx
│   └── complete.tsx
│
├── (main)/
│   ├── _layout.tsx             Stack over tabs + settings
│   ├── (tabs)/
│   │   ├── _layout.tsx         Bottom tabs
│   │   ├── dashboard.tsx       → DashboardScreen
│   │   ├── opportunities.tsx   → OpportunitiesListScreen
│   │   ├── notifications.tsx   → NotificationsScreen
│   │   └── settings-tab.tsx    → Settings entry (or link to settings stack)
│   └── settings/
│       ├── _layout.tsx         Settings stack
│       ├── index.tsx           → SettingsHomeScreen
│       ├── account.tsx
│       ├── privacy.tsx
│       └── notifications-prefs.tsx
│
└── (admin)/
    ├── _layout.tsx             Stack + requireAdmin guard
    ├── index.tsx               → AdminDashboardScreen
    ├── users.tsx
    └── moderation.tsx
```

## Deep linking (scheme: `Voila://`)

| Path | Screen |
|------|--------|
| `Voila://login` | `(auth)/login` |
| `Voila://dashboard` | `(main)/(tabs)/dashboard` |
| `Voila://opportunities/:id` | `(main)/opportunity/[id]` *(add when feature ships)* |
| `Voila://admin` | `(admin)` |

Config: `src/navigation/linking/config.ts`

## Guard matrix

| Guard | Condition | Redirect |
|-------|-----------|----------|
| `requireAuth` | No session | `/(auth)/login` |
| `requireGuest` | Has session | `/(main)/(tabs)/dashboard` |
| `requireOnboarding` | Session + `onboardingComplete === false` | `/(onboarding)/welcome` |
| `requireOnboarded` | Session + onboarding incomplete | `/(onboarding)/welcome` |
| `requireAdmin` | Session + role ≠ admin | `/(main)/(tabs)/dashboard` |

Guards live in `src/navigation/guards/` and are invoked from group `_layout.tsx` files.

## Tab bar (main)

| Tab | Route file | Feature module |
|-----|------------|----------------|
| Home | `dashboard.tsx` | `dashboard` |
| Opportunities | `opportunities.tsx` | `opportunities` |
| Notifications | `notifications.tsx` | `notifications` |
| Settings | `settings-tab.tsx` or stack push | `settings` |

## Modal / stack patterns (future)

- Opportunity detail: `(main)/opportunity/[id].tsx` (stack above tabs)
- Create opportunity: `(main)/opportunity/create.tsx` (modal presentation)

## Typed routes

Enable `experiments.typedRoutes` in `app.config.ts`. Extend param types in `src/types/navigation/`.
