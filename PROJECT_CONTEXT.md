# PROJECT_CONTEXT.md — Repository Developer Handbook

> **Purpose:** single source of truth for OpenCode sessions and any new developer working on this
> repository. Reading this file (plus the referenced docs) should ground a full context of the
> project within a few minutes.
>
> **Maintenance rule:** update this file whenever architecture, stack, workflow, or status changes
> materially. Keep it truthful — completed work is marked `✅`, planned work is marked `planned`.

---

## 1. PROJECT OVERVIEW

### Project name
**Digital Products Marketplace** — an online platform for buying and selling digital products.

### Purpose
A full-stack, modular-monolith marketplace for digital goods — ebooks, software, digital templates,
design assets, and courses — that combines a structured product catalog with a controlled,
entitlement-based transaction flow: sellers list and manage their own products, admins moderate,
and buyers purchase then download only what they own.

### Problem statement
Independent creators and sellers of digital products lack a simple, centralized way to sell their
work with automated, controlled delivery. Manual payment and file-transfer processes are
fragmented; buyers have no trusted place to discover verified digital products; and digital delivery
requires controlled access after a successful purchase. This marketplace solves that by combining
**discovery → transaction → purchase tracking → authorized download** in one workflow.
(Source: `Problem_Statement.md`.)

### Target users
| Role | Capabilities (server-enforced) |
|---|---|
| **USER** (buyer) | Browse catalog, manage cart, checkout, pay, order history, Digital Library, authorized download, review purchased products |
| **SELLER** | Everything a USER can do, plus create / edit / archive **own** products and submit them for approval |
| **ADMIN** | Everything above, plus moderation: list pending products, approve / reject |

Role boundaries are enforced on the backend (`@PreAuthorize` + ownership checks). The frontend never
grants access on its own.

### Current development stage
- ✅ Phase 0 — requirements & design docs (`Problem_Statement.md`, `docs/diagrams/`, `docs/database/`)
- ✅ Phase 1 — backend foundation (domain, repositories, services, REST API, JWT security, 138 tests)
- ✅ Sprint 1 · Task 1 — Seller Dashboard (frontend)
- ✅ Sprint 1 · Task 2 — Seller Product Management (frontend: list / filter / create / edit / submit / archive)
- ✅ Sprint 1 · Task 3 — Product Lifecycle completion (frontend: pending read-only, Save & Submit, confirm dialog, live status counts, contextual errors)
- ⏳ Buyer UI flows (cart / checkout / payment / library / download) — backend demo-ready, UI not yet built

---

## 2. TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| Frontend | React 19 (`^19.2.8`), Vite 8 (`^8.2.1`), Tailwind CSS 4 (`^4.3.3`), Axios (`^1.19.0`), React Router 7 (`^7.18.2`) |
| Backend | Spring Boot 3.5.16 (parent), Java 17, Maven (wrapper `./mvnw.cmd`) |
| Database | PostgreSQL — local dev server v17 on this machine; production target v15 (Aiven) |
| ORM | Spring Data JPA + Hibernate (`ddl-auto: update`; no migration tool) |
| Authentication | Spring Security, stateless JWT (JJWT `0.12.6`, HS256), BCrypt password hashing |
| Validation | Jakarta Bean Validation on request DTOs |
| API docs | springdoc-openapi 2.8.6 — Swagger UI at `/swagger-ui.html`, JSON at `/v3/api-docs` |
| Backend testing | JUnit 5, Mockito, `@WebMvcTest` (MockMvc), `@SpringBootTest` — **138 tests** |
| Frontend testing | Production build only (`npm run build`) — no unit/e2e suite yet |
| CI | GitHub Actions (`.github/workflows/ci.yml`): backend compile+test, frontend install+build; JDK 17 / Node 26 |
| Development tools | Git/GitHub, Vite dev proxy, psql client (see §8 environment notes) |

---

## 3. PROJECT ARCHITECTURE

### High-level architecture
**Modular monolith.** One stateless Spring Boot REST API serves a React SPA against a single
PostgreSQL database. The backend is the single source of truth for authorization, product
availability/status, order totals, transaction status, purchase ownership, and download
authorization. (Full mermaid diagrams: `docs/diagrams/system-architecture.md`.)

```
React SPA (Vercel)  →  HTTPS/JSON + Bearer JWT  →  Spring Boot REST (Render)  →  PostgreSQL (Aiven)
                                                     └─ Payment abstraction (mock) → real provider later
                                                     └─ File storage abstraction (metadata only in DB)
```

### Frontend architecture
- React SPA organized into `components/`, `layouts/`, `pages/`, `routes/`, `services/`,
  `context/`, `hooks/`, `utils/`, `assets/`.
- JWT persisted to `localStorage`; `AuthContext` + `useAuth()` expose session state.
- All HTTP through a central Axios client (`services/api.js`) that attaches the token and
  globally redirects on 401 (`/unauthorized`) and 403 (`/forbidden`).
- Routing uses React Router v7 with `ProtectedRoute` (authenticated) and `RoleRoute` (role-gated).
- Pages own their state and data fetching; composed children are presentational (props/callbacks).
- No global state store (no Redux/Zustand); feature state is local + context for auth.

### Backend architecture
- Layered: `Controller (DTO + validation) → Service (business logic) → Repository (Spring Data JPA) → DB`.
- Controllers never contain business logic; requests/responses use DTOs, never entities.
- Global exception handling converts errors to RFC 7807 `ProblemDetail` JSON (401/403 included).
- `PaymentProcessor` interface + `MockPaymentProcessor` — a real gateway plugs in later without redesign.
- Only file **metadata** lives in the DB (`storageReference` never exposed); actual files are external.
- `PurchaseEntitlement` is the core access model — downloads require a verified entitlement.

### Database architecture
- Single schema; **11 tables** (`users, categories, products, product_files, carts, cart_items,
  orders, order_items, payments, reviews, purchase_entitlements`).
- `id` identity PKs; money is exact `NUMERIC`; timestamps `TIMESTAMPTZ`; role/status values are
  `VARCHAR` + CHECK (no Postgres ENUMs, no lookup tables).
- All relationships are 1→many or 1→1; **no many-to-many / junction tables**.
- Physical schema source of truth: `docs/database/schema.md`.

### Authentication flow
1. Register `POST /api/auth/register` — only `USER`/`SELLER` self-register; password BCrypt-hashed.
2. Login `POST /api/auth/login` — credentials verified; issued a signed JWT (24h) containing user id + role.
3. `JwtAuthenticationFilter` validates signature/expiry on every `/api/**` request and populates the security context.
4. `@PreAuthorize("hasRole('...')")` + ownership checks enforce role boundaries.
5. Missing/invalid token → **401**; authenticated-but-forbidden → **403** (JSON).
6. No refresh tokens, no OAuth, no server-side sessions.

### API flow (core business journey)
`Product → Cart → Checkout → Payment → Order → PurchaseEntitlement → Digital Library → Authorized Download`

1. Buyer adds approved products to cart.
2. Checkout creates a `PENDING` order (totals computed server-side) and clears the cart.
3. Buyer pays via mock provider (`MOCK-<uuid>`) → order `PAID`, payment `SUCCESS`.
4. `PurchaseEntitlementService.grantForOrder(order)` creates one entitlement per purchased product
   (idempotent on `(user, product)`).
5. Entitled products appear in the Digital Library.
6. `GET /api/library/products/{id}/download` returns metadata **only** for entitled users — else **403**.

---

## 4. FOLDER STRUCTURE

```
.
├── PROJECT_CONTEXT.md          # This handbook (start here)
├── README.md                   # Public project readme (setup, API table, credentials)
├── Problem_Statement.md        # Capstone problem statement & chosen track
├── backend/                    # Spring Boot REST API
│   └── src/
│       ├── main/java/com/digitalmarketplace/
│       │   ├── config/         # SecurityConfig, AppConfig, DemoDataInitializer
│       │   ├── controller/     # 11 REST controllers (DTO in/out)
│       │   ├── dto/            # ~21 request/response records (validation)
│       │   ├── entity/         # 11 JPA entities + 4 enums
│       │   ├── exception/      # Global exception handling (RFC 7807)
│       │   ├── repository/     # 11 Spring Data JPA repositories
│       │   ├── security/       # JWT service, filter, UserPrincipal, UserDetailsServiceImpl
│       │   └── service/        # 8 business services (+ service/payment abstraction)
│       ├── main/resources/application.yml
│       └── test/resources/application.yml   # test-profile config (demo data disabled)
│   └── src/test/               # 138 JUnit 5 tests
├── frontend/                   # React SPA
│   └── src/
│       ├── components/         # ui/ (shared), dashboard/, products/, layout/, auth/
│       ├── layouts/            # RootLayout, DashboardLayout
│       ├── pages/              # 11 pages (public, auth, seller)
│       ├── routes/             # AppRoutes + guards
│       ├── services/           # api.js (Axios), auth.js, categories.js, products.js
│       ├── context/            # AuthContext
│       ├── hooks/              # useAuth
│       ├── utils/              # storage.js, format.js
│       └── assets/
├── docs/
│   ├── database/schema.md      # Physical DB schema (authoritative)
│   └── diagrams/               # system-architecture.md, er-diagram.md, class-diagram.md
└── .github/workflows/ci.yml    # CI: backend test + frontend build
```

---

## 5. DATABASE

### Choice
PostgreSQL, accessed via Spring Data JPA + Hibernate. Local dev machine runs a v17 server
(`postgresql-X64-17`, port 5432); production target is v15 on Aiven. psql client binaries are at
`C:\Program Files\PostgreSQL\18\bin\psql.exe`.

### Schema overview
11 tables. Key details:

- **users** — `email` UNIQUE, `role` CHECK (USER/SELLER/ADMIN), BCrypt `password_hash`.
- **categories** — `name` UNIQUE (+ optional description).
- **products** — `seller_id`, `category_id`, `title(200)`, `description (TEXT)`, `price NUMERIC(10,2)` with `CHECK (price >= 0)`, `status` CHECK, `created_at`/`updated_at`. Indexes: `(seller_id)`, `(category_id)`, `(status)`.
- **product_files** — `product_id`, `file_name`, `storage_reference` UNIQUE, `file_type`, `file_size`; actual bytes live externally.
- **carts / cart_items** — one cart per user (`user_id` UNIQUE); `UNIQUE (cart_id, product_id)`, `quantity > 0`.
- **orders** — `user_id`, `total_amount NUMERIC(12,2)`, `status` CHECK (PENDING/PAID/FAILED/CANCELLED). Indexes: `(user_id)`, `(status)`.
- **order_items** — `order_id`, `product_id`, `unit_price` (price snapshot), `quantity`; NOT unique on (order, product).
- **payments** — `order_id` UNIQUE (0..1 per order), `amount NUMERIC(12,2)`, `status` CHECK (PENDING/SUCCESS/FAILED), `method`, `provider_reference`, `paid_at`.
- **reviews** — `UNIQUE (user_id, product_id)`, `rating CHECK (1..5)`, comment. Index `(product_id)`.
- **purchase_entitlements** — `UNIQUE (user_id, product_id)`, `order_id`, `granted_at`; indexes `(product_id)`, `(order_id)`.

### Entity relationships
- `users → products` 1→N (seller ownership) · `categories → products` 1→N
- `products → product_files` 1→N (metadata) · `products → {cart_items, order_items, reviews, purchase_entitlements}` 1→N
- `users → carts` 1→1 · `carts → cart_items` 1→N (composition)
- `users → orders` 1→N (buyer) · `orders → order_items` 1→N (composition) · `orders → payments` 1→0..1
- `orders / users / products → purchase_entitlements` (created only on successful payment)

### Migration decisions
- **No Flyway/Liquibase.** Schema evolves via Hibernate `ddl-auto: update`; `docs/database/schema.md`
  is the physical-schema source of truth and must stay in sync with the entities.
- FK behavior: RESTRICT on historical/owned rows (orders, order_items, reviews, entitlements,
  seller/category references); CASCADE only on transient children (cart, cart items, file metadata,
  order items, payments). No `SET NULL`.
- Product removal is modelled as **`ARCHIVED` status, not destructive delete**.

### Development database
- URL `jdbc:postgresql://127.0.4.7:5432/digitalmarketplace` (also reachable at `127.0.0.1`),
  user `postgres`, password empty in local dev (overridable via `DB_USERNAME`/`DB_PASSWORD`).
- `DemoDataInitializer` (idempotent, dev-only, gated by `app.demo-data.enabled`) seeds:
  - Users: `admin@demo.com`, `seller@demo.com`, `buyer@demo.com` — all password `DemoPass123!`
  - 5 categories: Ebooks, Software, Digital Templates, Design Assets, Courses
  - 5 approved products for the demo seller (two with file metadata)

### Production database
- Aiven PostgreSQL 15, configured entirely via environment variables
  (`DATABASE_URL`, `DATABASE_DRIVER`, `DB_USERNAME`, `DB_PASSWORD`, `JPA_DIALECT`).
- Demo-data seeding must be disabled (`app.demo-data.enabled=false`).

---

## 6. BACKEND

### Package structure
`com.digitalmarketplace` → `config`, `controller`, `dto`, `entity`, `exception`, `repository`,
`security`, `service` (+ `service.payment`). Entry point: `DigitalMarketplaceApplication`.

### Layered architecture
`Controller → Service → Repository → DB`. Controllers map HTTP, validate DTOs, call services;
services own all business rules (availability/status transitions, totals, ownership, eligibility);
repositories are Spring Data JPA interfaces with derived queries.

### Controllers (11)
`AuthController`, `HomeController`, `UserController`, `CategoryController`, `ProductController`,
`ProductModerationController`, `CartController`, `OrderController`, `PaymentController`,
`DigitalLibraryController`, `ReviewController`.

### Services (8)
`UserService`, `CategoryService`, `ProductService`, `CartService`, `OrderService`, `PaymentService`,
`PurchaseEntitlementService`, `ReviewService` + `service/payment/` (`PaymentProcessor`,
`PaymentRequest`, `PaymentResult`, `MockPaymentProcessor`).

### Repositories (11)
`UserRepository`, `CategoryRepository`, `ProductRepository`, `ProductFileRepository`,
`CartRepository`, `CartItemRepository`, `OrderRepository`, `OrderItemRepository`,
`PaymentRepository`, `ReviewRepository`, `PurchaseEntitlementRepository`.

### Security
- `SecurityConfig` — stateless chain, `/api/**` protected, JWT filter registered, BCrypt encoder bean.
- `JwtService` (JJWT HS256, 24h default), `JwtAuthenticationFilter`, `UserDetailsServiceImpl`,
  `UserPrincipal`.
- Authorization via `@PreAuthorize("hasRole('...')")`; ownership verified in services
  (sellers may only mutate their own products).

### DTO strategy
Java **records**; ~21 DTOs. Use-case-specific shapes — e.g. `ProductCreateRequest` /
`ProductUpdateRequest` / `ProductResponse` (includes `categoryName`, `sellerName`);
`LoginRequest/login` / `RegisterRequest` / `UserResponse`; cart/order/payment/library/review DTO sets.
Entities are never serialized directly.

### Validation
Jakarta Bean Validation on request DTOs (`@NotBlank @Size(max=200)` title, `@NotNull` categoryId,
`@DecimalMin("0.00")` price, `@Size(max=10000)` description, rating `@Min(1) @Max(5)`, etc.). Invalid
payloads → 400 with ProblemDetail.

---

## 7. FRONTEND

### Pages (11)
- Public/auth: `Home`, `Login`, `Register`, `Products`, `ProductDetails`, `NotFound`,
  `Unauthorized`, `Forbidden`
- Seller: `SellerDashboard`, `SellerProductsPage`, `ProductFormPage` (create + edit)

### Layouts
- `RootLayout` — public shell with `Navbar`.
- `DashboardLayout` — seller shell with `DashboardNavbar` + `Sidebar`.

### Components
- `components/ui/` (shared, reusable): `StatusBadge`, `LoadingSpinner`, `LoadingSkeleton`,
  `EmptyState`, `ErrorState`, `ModulePlaceholder` (reusable utility; currently unused by routes)
- `components/dashboard/`: `DashboardHeader`, `StatisticsCards`, `StatisticCard`,
  `RecentProductsTable`, `ProductRow`, `QuickActionCard`
- `components/products/`: `ProductsToolbar`, `ProductStatusFilter`, `ProductsTable`,
  `ProductManagementRow`, `ProductForm`, `ProductCard`
- `components/auth/`: `ProtectedRoute`, `RoleRoute`
- `components/layout/`: `Navbar`, `Sidebar`, `DashboardNavbar`, `DashboardLayout`

### Reusable UI
Common states rendered via `LoadingSkeleton` / `LoadingSpinner` / `EmptyState` / `ErrorState`.
Shared building blocks promoted into `components/ui/` (e.g. `StatusBadge` now lives in `ui/` so
dashboard and products both consume it).

### Routing (React Router v7)
| Path | Guard | Element |
|---|---|---|
| `/` | public | Home |
| `/login`, `/register` | public | Login / Register |
| `/products` | authenticated | Products |
| `/products/:productId` | authenticated | ProductDetails |
| `/seller` | `RoleRoute(SELLER)` `DashboardLayout` | index → SellerDashboard |
| `/seller/my-products` | SELLER | SellerProductsPage |
| `/seller/my-products/:productId/edit` | SELLER | ProductFormPage (edit) |
| `/seller/create-product` | SELLER | ProductFormPage (create) |
| `/unauthorized`, `/forbidden`, `*` | public | Unauthorized / Forbidden / NotFound |

### State management
- `AuthContext` + `useAuth()` — JWT + user session, persisted to `localStorage` (`utils/storage.js`).
- Pages own feature state (loading/error/data); child components receive props + callbacks.
- No global store; `DashboardLayout` provides navigation layout for seller pages.

### API services
- `services/api.js` — shared Axios instance (base `VITE_API_URL` or `/api` via dev proxy); request
  interceptor attaches `Bearer` token; response interceptor handles 401 → `/unauthorized`,
  403 → `/forbidden`.
- `services/auth.js` — login/register; `services/categories.js` — `getCategories`;
  `services/products.js` — list sellers' products, create/update/archive/submit, browse endpoints.
- `utils/format.js` — currency/date formatting helpers.

### Known gap (backend-only today)
Cart, checkout, payment, orders, Digital Library, download, and reviews are implemented and
Swagger-demonstrable on the backend but have **no frontend pages yet** (planned).

---

## 8. DEVELOPMENT WORKFLOW

### Planning process
1. OpenCode starts in **Plan Mode**: research repo + `PROJECT_CONTEXT.md` + `docs/` first.
2. Propose structure/content plan; nothing edited until the user approves (exit Plan Mode).

### Implementation process
- One task at a time. Build Mode changes are scoped to the approved plan.
- Reuse existing components/services; no new dependencies without approval.
- Follow repo conventions (§12) and never redesign approved architecture.

### Verification process (mandatory before commit)
Backend:: `./mvnw.cmd test` → **138 tests, 0 failures**.
Frontend:: `npm.cmd run build` → production bundle without errors (`npm.cmd`, see environment notes).
Live smoke test:: exercise the real API on the running backend (login demo seller → create → list →
update → submit → archive) and confirm response shapes match the frontend services.
Static checks:: no stale imports/refs to moved/deleted files; grep for orphaned usages.

### Architecture review / QA review
Approvals gate before commits. Anything that changes approved architecture is out of scope until
re-planned.

### Commit strategy
- One logical task = one commit; `git add -A` stages exactly the working tree for that task.
- Conventional commit messages (e.g. `feat(seller): ...`, `docs: ...`).
- Author/committer timestamps pinned exactly when the user requests (e.g. a `feat` commit dated by sprint).
- Never amend/rewrite history; never commit secrets; stage only intended files.

### Push strategy
**Never push without explicit user approval.** Confirm push state with `git rev-parse @{upstream}`
and `git rev-list --count origin/main..HEAD` before/after committing.

---

## 9. GIT HISTORY

### Verified commit timeline (newest → oldest)
| Hash | Date | Message |
|---|---|---|
| `a36be1b` | 2026-09-05 12:00 +0530 | `feat(seller): complete product lifecycle` |
| `fe48459` | 2026-09-04 12:00 +0530 | `docs: add PROJECT_CONTEXT.md repository handbook` |
| `719390a` | 2026-09-03 19:30 +0530 | `feat(seller): implement product management` |
| `a942787` | 2026-09-01 12:00 +0530 | `feat(seller): implement Seller Dashboard` |
| `75efa70` | 2026-08-10 19:54 +0530 | `feat: implement JWT security` |
| `98bf597` | 2026-08-09 23:17 +0530 | `feat: implement REST API layer` |
| `5c8d9b8` | 2026-08-09 22:26 +0530 | `feat: implement service layer` |
| `d4f29a0` | 2026-08-09 19:30 +0530 | `feat: implement JPA repository layer` |
| `a652c1c` | 2026-08-09 18:58 +0530 | `feat: implement JPA domain model` |
| `e2a76f8` | 2026-08-09 18:21 +0530 | `chore: scaffold backend and frontend` |
| `04e9a8f` | 2026-08-09 11:42 +0530 | `docs: refine project requirements` |
| `f7dbc12` | 2026-08-05 12:20 +0530 | `docs(database): add physical schema design` |
| `f3bddc0` | 2026-08-04 12:07 +0530 | `docs(database): add class diagram` |
| `0542133` | 2026-08-03 12:00 +0530 | `docs(database): add entity relationship diagram` |

### Milestones
- **Phase 0:** requirements + ER / class / schema docs (2026-08-03 → 2026-08-09).
- **Phase 1 (backend foundation):** scaffold → domain model → repositories → services → REST API →
  JWT security (2026-08-09 → 2026-08-10).
- **Sprint 1:** Seller Dashboard (2026-09-01), Product Management (2026-09-03), Product Lifecycle (2026-09-05).

### Conventions
`type(scope): subject` with types `feat`, `docs`, `chore`, `fix` and scopes such as `seller`,
`database`. Commits are informational and pinned to sprint dates where requested.

### Current branch state
- Branch `main`; HEAD `a36be1b`; working tree clean.
- `origin/main` points at `75efa70` → commits `a942787`, `719390a`, `fe48459`, `a36be1b` are
  **local-only** until pushed.

---

## 10. CURRENT PROJECT STATUS

### Completed
- ✅ **Phase 0**: `Problem_Statement.md`, system architecture, ER diagram, class diagram, physical schema.
- ✅ **Phase 1**: full backend — 11 entities, 11 repos, 8 services, 11 controllers, JWT security,
  validation, RFC 7807 errors, Swagger docs, **138 tests passing**, CI workflow.
- ✅ **Sprint 1 · Task 1**: Seller Dashboard UI (statistics cards, recent products, quick actions).
- ✅ **Sprint 1 · Task 2**: Seller Product Management UI — list with status filter, create/edit form
  (client validation mirroring backend), submit-for-approval, archive-with-confirm; server-error
  banners; loading/empty/error states; edit lookup via owned-list (documented temp solution).
- ✅ **Sprint 1 · Task 3**: Product Lifecycle completion — `ProductStatusMeta` as single source of
  truth; PENDING_APPROVAL read-only (notice "This product is currently under review."); "Save &
  Submit for Approval" for DRAFT/REJECTED; reusable `ConfirmDialog` (replaces `window.confirm`);
  reusable `FlashMessage`; per-action error banners and live status counts; ARCHIVED/Pending URL
  guards.

### Current branch status
- `main`, HEAD `a36be1b`; working tree clean; 4 local commits ahead of `origin/main` (unpushed).

### Pending work
- Buyer-flow UI: cart, checkout, payment, orders, Digital Library, download, reviews.
- Admin UI: product moderation, category management, monitoring.
- Catalog search/filter/sort UI; pagination.
- Real file upload/storage and real payment provider (behind existing abstractions).
- Deployment: Docker images, Vercel/Render/Aiven config, production env hardening.

---

## 11. ROADMAP

### Sprint 1 (delivered)
- ✅ Task 1 — Seller Dashboard; ✅ Task 2 — Product Management; ✅ Task 3 — Product Lifecycle.
- Architecture + QA review sign-off for the sprint still pending before building further.

### Future sprints
- Seller order/transaction monitoring dashboard.
- Admin moderation + category management UI.
- Buyer flows UI (cart → checkout → payment → library → download → review).
- Public catalog search, filter, and sort; pagination for large catalogs.

### Long-term goals
- Real digital file upload/object storage behind the file abstraction.
- Real payment gateway behind the `PaymentProcessor` abstraction.
- Docker images and production deployment (Vercel / Render / Aiven), hardened secrets (real `JWT_SECRET`).
- AI-assisted discovery and recommendations (explicitly post-MVP).

---

## 12. CODING STANDARDS

### Naming conventions
- Java: camelCase members, PascalCase types, `snake_case` DB columns with plural table names.
- JS/React: PascalCase components, camelCase functions/variables, kebab-case file names for JS modules.
- Backend packages mirror `com.digitalmarketplace.<layer>`.

### Component organization
- Feature folders: `components/dashboard/`, `components/products/`, `components/auth/`, `components/layout/`.
- Truly shared primitives live in `components/ui/` and are imported by any feature (no `dashboard → products`
  cross-imports).

### Backend conventions
- Controllers delegate to services; DTOs on the wire; `@Valid` request validation.
- Role + ownership checks on every protected mutation (e.g. seller may edit only own products).
- Business rules stay in services; exceptions via `BusinessException` / `ResourceNotFoundException` /
  `ForbiddenException` → RFC 7807.
- Money as `BigDecimal`/`NUMERIC`; timestamps `LocalDateTime` mapped to `TIMESTAMPTZ`.

### Frontend conventions
- Function components; hooks for shared logic (`useAuth`); pages own state + API calls.
- Inline SVG icons — no icon library dependency.
- Client-side validation mirrors backend rules (title ≤ 200, price ≥ 0, required category, description ≤ 10 000).
- No new npm dependencies without explicit approval.

### Reusable component policy
- Reuse `StatusBadge`, `LoadingSkeleton/Spinner`, `EmptyState`, `ErrorState` wherever applicable.
- Promote genuinely shared pieces into `components/ui/` (done for `StatusBadge`).

### Error handling
- Backend: structured RFC 7807 `ProblemDetail` (400/401/403/404/409/500).
- Frontend: per-view `ErrorState` with retry for load failures; per-action error banners for
  mutations (list stays rendered); `window.confirm` for destructive actions (archive).

### Documentation expectations
- Design / schema docs live in `docs/` and are kept consistent with code.
- Temporary workarounds must carry an explanatory developer comment naming the future replacement
  (e.g. ProductFormPage edit-lookup temp solution: owned-list prefetch until a direct authenticated
  product lookup exists).
- `PROJECT_CONTEXT.md` must be updated on material architecture/status changes.

---

## 13. PROJECT RULES

### Permanent architectural decisions
- **Modular monolith** — one Spring Boot API + one React SPA + one PostgreSQL DB.
- **Entitlement-based digital access** — downloads require a `PurchaseEntitlement`; never guessable URLs.
- **Archive-not-delete** for products; destructive delete only for transient ownership data.
- **Server-side authorization** is the source of truth; role boundaries + ownership verified on the backend.
- **Abstractions for change** — `PaymentProcessor` and file-storage are swappable without redesign.
- **No many-to-many** relationships; single cart per user; single payment per order (MVP).

### Database policy
- No migration tool — Hibernate `ddl-auto: update`; `docs/database/schema.md` is the physical model source.
- Example/seed data comes only from the idempotent `DemoDataInitializer`, disabled in production.

### Backend policy
- Java 17 + Spring Boot 3.5; layered controller/service/repository; DTOs never entities; tests required.

### Frontend policy
- React 19 + Vite 8 + Tailwind 4; reuse `components/ui/`; pages own state; no icon libs; no unapproved deps.

### Git policy
- One task = one commit; conventional messages; **no history rewrites**; no secrets in commits;
  **no commits or pushes without explicit approval**.

### Review policy
- Plan approval before Build Mode; architecture + QA review gate before commits; publish a
  verification report and stop after each task.

### Quality policy
- `./mvnw.cmd test` → 138/138 green; `npm.cmd run build` → clean bundle; live API smoke tests on the
  running backend before committing frontend service changes.

---

## 14. FUTURE OPECDE INSTRUCTIONS

How any future OpenCode session should work on this project:

1. **Read `PROJECT_CONTEXT.md` first** (plus `docs/` and `README.md` for depth) before any task or proposal.
2. **Never redesign approved architecture** — extend within it; propose changes as new plans.
3. **Build one task at a time** — plan first, get approval, then implement that task only.
4. **Verify before committing** — `./mvnw.cmd test` (138), `npm.cmd run build`, live API smoke test, static checks.
5. **Never push without approval** — confirm `@{upstream}` and local-ahead count; state it in the report.
6. **Reuse existing components and services** wherever possible; never add dependencies without approval.
7. **Follow the established Sprint workflow** — plan → build → verify → report → commit (on approval) → stop.
8. **Environment notes for this machine (win32 / PowerShell 5.1):**
   - Use `npm.cmd` (PowerShell execution policy blocks `npm.ps1`) and `./mvnw.cmd`; no `||` operator — use `if ($?) { ... }`.
   - Backend must run on **port 8090 locally** (port 8080 is occupied on this machine by another service);
     Vite dev proxy targets `http://localhost:8090` (`frontend/vite.config.js`).
   - `rg` is not installed — use file-content search tools instead of `rg`/`grep` shell commands.
   - `psql` client: `C:\Program Files\PostgreSQL\18\bin\psql.exe`; local DB user `postgres`, empty password,
     database `digitalmarketplace` at `127.0.0.1:5432` (config URL uses `127.0.4.7`).
   - Demo credentials: `admin@demo.com` / `seller@demo.com` / `buyer@demo.com`, password `DemoPass123!`.
   - Never leave temporary demo records in the database from smoke tests; clean them up before committing
     (or log them in the report for review).