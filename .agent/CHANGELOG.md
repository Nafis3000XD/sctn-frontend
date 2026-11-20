# Change log

Append a dated entry for each durable change. Include affected areas, verification, and deployment or follow-up status.

## 2026-11-20

- Added frontend architecture, durable agent memory and handoff rules for the private source export. Runtime code and the deployed frontend configuration are unchanged.

## 2026-11-20 Docker and Vercel packaging

- Root Dockerfile builds Vite and serves it with Caddy. Vercel uses a configurable HTTPS API origin for same-origin API and media routing.
- The integration workflow includes a Docker stack smoke test. Vercel project creation is separate from this release.
