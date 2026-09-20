# Changelog

All notable changes to the **Digital Products Marketplace** project.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning is
informational (capstone project); releases are tracked per milestone phase.

---

## [Unreleased] — Review II stabilization (working tree)

### Added
- **Buyer Portal UI**: cart, checkout, mock payment, order history + details, Digital Library, download authorization, product reviews (create / update / delete, purchase-gated).
- **Admin Moderation UI**: pending-product queue with details panel, approve / reject with confirmation.
- **Catalog search & sort**: client-side toolbar (search by title / seller / category; sort by date, price, name).
- **Product lifecycle guards (server-side)**: `ProductService` now rejects illegal transitions — submit only from `DRAFT`/`REJECTED`; approve/reject only from `PENDING_APPROVAL`.
- **Deployment preparation**:
  - `backend/Dockerfile` + `frontend/Dockerfile` (multi-stage images)
  - `docker-compose.yml` (db + backend + frontend with healthchecks)
  - `render.yaml` (Render blueprint: managed PostgreSQL + Docker web service)
  - `vercel.json` (Vite SPA config)
  - `frontend/nginx.conf` (SPA fallback + `/api` proxy)
  - Actuator health endpoint + environment-driven configuration (`DB_*`, `JWT_SECRET`, `PORT`, `CORS_ALLOWED_ORIGINS`, `APP_DEMO_DATA_ENABLED`)
- **CORS**: `PATCH` allowed in preflight (needed for seller submit).

### Changed
- **`frontend/nginx.conf`**: backend proxy fixed from `:8090` → `:8080` (container port).
- **`render.yaml`**: `dockerfilePath` corrected to `./Dockerfile` (relative to `rootDir: backend`);
  `fromDatabase` references corrected to the declared `digital-marketplace-db`.
- **`DashboardNavbar`**: brand link is role-aware (`/admin` for ADMIN, `/seller` for SELLER).
- **`SecurityConfig`**: CORS allowed methods now include `PATCH`.

### Tests
- Backend suite now **146 tests** (up from 138): guards for illegal product-status transitions covered by unit tests.

---

## Sprint 1 — 2026-09 (committed)

### Added
- Seller Dashboard (statistics, recent products, quick actions).
- Seller Product Management (list / status filter / create / edit / submit for approval / archive with confirmation).
- Product Lifecycle UI: `PENDING_APPROVAL` read-only view, Save & Submit for `DRAFT`/`REJECTED`, live status counts, URL guards.
- `PROJECT_CONTEXT.md` repository handbook.

---

## Phase 1 — 2026-08 (committed)

### Added
- Backend foundation: 11 JPA entities + 4 enums, 11 repositories, 8 services, 11 REST controllers.
- JWT security (HS256, stateless), BCrypt hashing, role-based authorization, 401/403 JSON.
- Jakarta Bean Validation, RFC 7807 `ProblemDetail` error handling, Swagger (springdoc-openapi).
- Entitlement-based digital access: cart → checkout → mock payment → order → `PurchaseEntitlement` → Digital Library → authorized download.
- Customer reviews with purchase verification.
- Demo data seeder (demo admin / seller / buyer, 5 categories, approved products).
- CI workflow (GitHub Actions): backend compile + test, frontend build.
- **138 tests** at phase completion.

---

## Phase 0 — 2026-08 (committed)

### Added
- `Problem_Statement.md` (capstone problem statement, chosen Java track).
- System architecture, entity-relationship diagram, class diagram, physical database schema.

---

## Deploy-day checklist (not yet done)

- Fill `render.yaml` placeholders: GitHub repo URL and `CORS_ALLOWED_ORIGINS` (frontend origin).
- Set `VITE_API_URL` in the Vercel dashboard.
- Provide a real `JWT_SECRET` at first Render deploy (Render prompts automatically).
- Disable demo data in production (`APP_DEMO_DATA_ENABLED=false` — already the default in compose/render).