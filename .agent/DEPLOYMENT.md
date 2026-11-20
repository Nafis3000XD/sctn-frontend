# Frontend deployment

## Docker on a VM

From the repository root, run `docker build -t sctn-frontend .`. Use the [integration Compose runbook](https://github.com/Nafis3000XD/sctn-web/blob/main/.agent/RUNBOOK.md#docker-on-a-vm) to start the frontend, API and PostgreSQL together. Caddy serves the SPA and proxies `/api/*`, `/uploads/*` and `/healthz`. Set `SCTN_API_UPSTREAM` if the backend is reachable at a host and port other than `backend:3000`.

## Vercel

Import this repo as a Vite project with Root Directory at the repo root. Set `SCTN_API_ORIGIN` to the backend's HTTPS origin in each Vercel environment. `vercel.mjs` builds `dist/` and rewrites API, media, and health requests before falling back to the SPA. Keep the backend reachable by the Vercel proxy.

Check a direct visit to `/citizen`, sign-in, a private image, and `/healthz` on the frontend URL.
