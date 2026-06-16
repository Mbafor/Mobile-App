# Voila (OLF)

React Native + Expo + TypeScript + Supabase — feature-first production scaffold.

## Quick start

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm start
```

**Phase 1 (Auth)** setup: [docs/SUPABASE_AUTH_SETUP.md](./docs/SUPABASE_AUTH_SETUP.md)  
**Phase 2 (Onboarding)** setup: [docs/SUPABASE_ONBOARDING_SETUP.md](./docs/SUPABASE_ONBOARDING_SETUP.md)  
**Phase 3 (Home / Opportunities)** setup: [docs/SUPABASE_OPPORTUNITIES_SETUP.md](./docs/SUPABASE_OPPORTUNITIES_SETUP.md)  
**Phase 4 (Opportunity details)** setup: [docs/SUPABASE_OPPORTUNITY_DETAILS_SETUP.md](./docs/SUPABASE_OPPORTUNITY_DETAILS_SETUP.md)  
**Phase 6 & 7 (Search + Dashboard)** setup: [docs/SUPABASE_SEARCH_DASHBOARD_SETUP.md](./docs/SUPABASE_SEARCH_DASHBOARD_SETUP.md)

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — layers, state, services, decisions
- [docs/NAVIGATION.md](./docs/NAVIGATION.md) — route tree and guards

## Modules

| Module | Path |
|--------|------|
| Auth | `src/features/auth` |
| Onboarding | `src/features/onboarding` |
| Opportunities | `src/features/opportunities` |
| Dashboard | `src/features/dashboard` |
| Notifications | `src/features/notifications` |
| Settings | `src/features/settings` |
| Admin | `src/features/admin` |

Routes live in `app/` and re-export feature screens only.
