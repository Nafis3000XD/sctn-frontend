# Frontend architecture

This React 19 and TypeScript SPA builds with Vite, uses Tailwind CSS and Lucide icons, and keeps auth, settings and notifications in Zustand.

| Code | Responsibility |
| --- | --- |
| `src/main.tsx`, `src/App.tsx` | Entry point, route-level lazy loading, role redirects and protected portal routing |
| `src/pages/Login.tsx`, `Register.tsx` | Login and citizen registration |
| `src/pages/CitizenDashboard.tsx` | Profile sections, uploads, consent, notification feed and citizen chat |
| `src/pages/AdminDashboard.tsx` | User admin, fraud, audits, consent and support; routes to correction review |
| `src/pages/VerifierDashboard.tsx` | Role-specific verification, consent requests and policy evaluation |
| `src/components/CorrectionAssistant.tsx` | Intent, password confirmation, catalog-driven form and submission |
| `src/components/ChangeRequestsView.tsx` | Citizen status/history and admin decisions |
| `src/components/ConnectionStatus.tsx` | Polls `/healthz` and distinguishes backend and database outages |
| `src/lib/axios.ts` | Relative `/api` client, bearer header and unauthorized-session handling |
| `src/lib/changeRequestDraft.ts` | Account-scoped correction drafts in tab session storage |
| `src/store`, `src/lib/translations.ts` | Client-side state and language strings |
| `test/` | Vitest, jsdom and Testing Library |

## Browser routes

- Public: `/login`, `/register`. `/` redirects by session role.
- Citizen: `/citizen` and its `profile`, `documents`, `permissions`, `medical`, `crime`, `notifications`, `changes` pages.
- Admin: `/admin` and its `users`, `fraud`, `requests`, `logs`, `support`, `search`, `changes` pages.
- Verifier: `/verifier`, `/verifier/search`, and `/verifier/grants`. Available views depend on the signed-in role.

Backend contracts and all HTTP endpoints are documented in the [backend inventory](https://github.com/Nafis3000XD/sctn-backend/blob/main/.agent/ENDPOINTS.md). The [integration runbook](https://github.com/Nafis3000XD/sctn-web/blob/main/.agent/RUNBOOK.md) covers Render, local startup and source synchronization.
