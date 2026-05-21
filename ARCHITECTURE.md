# Olives Forum — Architecture

Production-oriented **feature-first** architecture for React Native (Expo) + TypeScript + Supabase.

## Principles

| Principle | Application |
|-----------|-------------|
| Feature-first | Business logic lives in `src/features/<module>/`. Shared code only when used by 2+ features. |
| Thin routes | `app/` contains Expo Router files only — re-export feature screens, no business logic. |
| Unidirectional data | UI → hooks → services → Supabase. Server cache via TanStack Query; client/session via Zustand. |
| Public feature API | Each feature exports via `index.ts` — other features import only from that barrel. |
| Fail closed | Auth and role guards run before entering protected route groups. |

## Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│  app/ (Expo Router) — route groups, layouts, redirects      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  src/features/* — screens, feature components, hooks, store │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ src/components│   │  src/hooks    │   │ src/providers │
│  (shared UI)  │   │  (shared)     │   │  (app shell)  │
└───────────────┘   └───────────────┘   └───────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  src/services — Supabase client, API modules, mappers         │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Supabase (Auth, Postgres, Realtime, Storage, Edge Fn)      │
└─────────────────────────────────────────────────────────────┘
```

## Folder structure

```
OLF/
├── app/                          # Expo Router (navigation shell only)
│   ├── _layout.tsx               # Root providers + auth bootstrap
│   ├── index.tsx                 # Entry redirect (auth → onboarding → main)
│   ├── (auth)/                   # Unauthenticated stack
│   ├── (onboarding)/             # Post-signup onboarding flow
│   ├── (main)/                   # Authenticated app
│   │   ├── (tabs)/               # Primary tab navigator
│   │   └── settings/             # Settings stack (modal-friendly)
│   └── (admin)/                  # Admin-only routes (role guard)
│
├── src/
│   ├── features/                 # Feature modules (see below)
│   ├── components/               # Shared presentational UI
│   │   ├── ui/                   # Primitives (Button, Text, Input…)
│   │   ├── layout/               # Screen, Header, Container…
│   │   ├── feedback/             # Loading, Empty, Error…
│   │   └── forms/                # FormField, controlled inputs…
│   ├── navigation/               # Guards, linking, nav types, helpers
│   ├── services/                 # Data access & external APIs
│   ├── store/                    # Global Zustand + React Query setup
│   ├── types/                    # Cross-cutting TypeScript types
│   ├── utils/                    # Pure helpers (no React, no Supabase)
│   ├── constants/                # Routes, theme tokens, app config keys
│   ├── hooks/                    # Shared hooks (non-feature-specific)
│   ├── providers/                # Context providers composition
│   ├── config/                   # Env validation, feature flags
│   └── assets/                   # Images, fonts (imported statically)
│
├── docs/
│   └── NAVIGATION.md             # Route map & guard flow
│
├── ARCHITECTURE.md               # This file
├── package.json
└── tsconfig.json                 # Path aliases: @/* → src/*
```

### Feature module anatomy

Each feature under `src/features/<name>/` follows the same shape:

```
<feature>/
├── components/     # UI used only inside this feature
├── hooks/          # Feature hooks (often wrap React Query)
├── screens/        # Screen components consumed by app/ routes
├── store/          # Feature-local Zustand slice (if needed)
├── types/          # Feature-local types
├── navigation/     # Feature-specific nav params / helpers
└── index.ts        # Public exports — single import surface
```

| Module | Responsibility |
|--------|----------------|
| `auth` | Sign in/up, session, password reset, OAuth |
| `onboarding` | Profile setup, preferences, first-run checklist |
| `opportunities` | List/detail/create opportunities, applications |
| `dashboard` | Home feed, stats, quick actions |
| `notifications` | In-app notification center, read state |
| `settings` | Account, privacy, theme, logout |
| `admin` | Moderation, user management, platform config |

## Navigation structure

Expo Router **file-based routing** with **route groups** (parentheses = no URL segment).

| Group | Path pattern | Guard | Purpose |
|-------|--------------|-------|---------|
| `(auth)` | `/login`, `/register`, … | Guest only | Authentication |
| `(onboarding)` | `/welcome`, `/profile-setup`, … | Authenticated, incomplete onboarding | First-run |
| `(main)` | `/dashboard`, `/opportunities`, … | Authenticated + onboarded | Core app |
| `(main)/(tabs)` | Tab routes | Same as main | Bottom tabs |
| `(main)/settings` | `/settings/*` | Same as main | Settings stack |
| `(admin)` | `/admin/*` | Authenticated + `admin` role | Admin tools |

**Bootstrap flow** (`app/index.tsx`):

1. Loading → resolve session (Supabase + secure storage).
2. No session → `(auth)`.
3. Session + onboarding incomplete → `(onboarding)`.
4. Session + onboarded → `(main)/(tabs)/dashboard`.
5. Admin deep links → `(admin)` after role check.

See [docs/NAVIGATION.md](./docs/NAVIGATION.md) for the full route tree.

## State management

| Concern | Tool | Location |
|---------|------|----------|
| Server/async data | TanStack Query | `src/store/query-client.ts`, feature `hooks/` |
| Auth session & user | Zustand | `src/features/auth/store/` + `src/store/slices/` |
| UI preferences (theme) | Zustand | `src/features/settings/store/` or global slice |
| Ephemeral UI | React state | Screen/component level |
| Form state | React Hook Form (when added) | Feature screens |

**Rules:**

- Do not duplicate server data in Zustand — cache in React Query.
- Feature stores are optional; prefer colocating slice in feature when only that feature reads it.
- Global store (`src/store/`) holds app bootstrap, query client, and cross-feature session.

## Services layer

```
src/services/
├── supabase/
│   ├── client.ts       # Singleton Supabase client
│   └── types.ts        # Generated DB types (supabase gen types)
├── api/
│   ├── auth.api.ts
│   ├── opportunities.api.ts
│   ├── notifications.api.ts
│   └── admin.api.ts
└── index.ts            # Re-exports for app-wide imports
```

- **Services** talk to Supabase/API only — no React imports.
- **Hooks** in features call services and expose data to UI.
- **Mappers** (when needed) live next to API files or in `utils/` if pure transforms.

## Reusable components

```
src/components/
├── ui/           # Design system primitives
├── layout/       # Screen scaffolding, safe areas, headers
├── feedback/     # LoadingSpinner, EmptyState, ErrorBoundary fallback UI
└── forms/        # Composed form controls built on ui/
```

**Convention:** Components are presentational — no direct Supabase calls. Container logic stays in feature screens/hooks.

## Types

```
src/types/
├── api/          # Request/response DTOs, pagination wrappers
├── domain/       # User, Opportunity, Notification entities
├── navigation/   # Root param lists, typed route helpers
└── index.ts
```

Feature-specific types stay in `src/features/<feature>/types/` until shared across features.

## Utils & constants

```
src/utils/        # Pure functions: validation, formatting, storage helpers, errors
src/constants/    # ROUTES, theme, storage keys, query keys — no secrets
```

Secrets and env: `EXPO_PUBLIC_*` via `src/config/env.ts` (validated at startup).

## Cross-feature communication

1. **Preferred:** Shared types + services + React Query invalidation.
2. **Avoid:** Feature A importing Feature B's internal screens.
3. **Events:** Use query invalidation or a minimal event bus only if necessary.

## Security & roles

- Supabase Row Level Security is the source of truth for data access.
- Client guards (`src/navigation/guards/`) improve UX only — never replace RLS.
- Admin routes use `requireAdmin` guard + server role claims.

## Testing (future)

```
__tests__/
├── unit/         # utils, services mappers
├── features/     # hooks with MSW
└── e2e/          # Detox / Maestro
```

## Path aliases

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@features/*` | `src/features/*` |
| `@components/*` | `src/components/*` |
| `@services/*` | `src/services/*` |
| `@store/*` | `src/store/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |
| `@constants/*` | `src/constants/*` |

## Implementation order (suggested)

1. Config + Supabase client + env validation  
2. Auth feature + root guards + `(auth)` routes  
3. Onboarding + redirect logic  
4. Main tabs shell + dashboard/opportunities/notifications placeholders  
5. Settings + admin modules  
6. Shared UI kit + React Query patterns  
