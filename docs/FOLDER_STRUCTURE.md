# Folder structure reference

```
OLF/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── profile-setup.tsx
│   │   └── complete.tsx
│   ├── (main)/
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── opportunities.tsx
│   │   │   ├── notifications.tsx
│   │   │   └── settings-tab.tsx
│   │   └── settings/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── account.tsx
│   │       ├── privacy.tsx
│   │       └── notifications-prefs.tsx
│   └── (admin)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── users.tsx
│       └── moderation.tsx
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── opportunities/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   └── forms/
│   ├── navigation/
│   │   ├── guards/
│   │   └── linking/
│   ├── services/
│   │   ├── supabase/
│   │   └── api/
│   ├── store/
│   │   ├── slices/
│   │   ├── selectors/
│   │   └── middleware/
│   ├── types/
│   │   ├── api/
│   │   ├── domain/
│   │   └── navigation/
│   ├── utils/
│   │   ├── errors/
│   │   ├── validation/
│   │   ├── formatting/
│   │   └── storage/
│   ├── constants/
│   │   ├── theme/
│   │   ├── routes.ts
│   │   ├── query-keys.ts
│   │   └── storage-keys.ts
│   ├── hooks/
│   ├── providers/
│   ├── config/
│   └── assets/
│
├── docs/
├── ARCHITECTURE.md
└── README.md
```
