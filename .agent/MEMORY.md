# Frontend memory

- The integrated repo is [sctn-web](https://github.com/Nafis3000XD/sctn-web). This repo exports its `frontend/` directory. The current public site is [SCTN on Render](https://sctn-web-hw6f.onrender.com).
- Browser API paths are relative. The Vite dev proxy forwards API, uploads and health to the local backend on port 3000. See the backend contract before changing them.
- Citizen profile correction entry points open the assistant instead of editing official fields directly. Drafts are tab-scoped, resume after reload when the assistant is opened, and clear on successful submit, discard, or logout. Passwords and verification grants are never placed in draft storage.
- Admin and citizen share `ChangeRequestsView`. The admin may accept or decline. Citizen receives status and notification.
- Shared status badge is present on sign-in, registration and the dashboard navbar.
