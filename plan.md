# misso-clinic — Restoration & Revival Plan

## Context

misso-clinic is being brought back into active development. The owner's original 9 requests, and how they map into an executable roadmap:

1. Automatic WhatsApp notifications on new registrations, appointments, orders, and intake forms — must be free. Also: persist this and future durable instructions in `CLAUDE.md` so they don't need to be repeated.
2. Full visual redesign of the whole app.
3. Test everything (real end-to-end usage, not just build/type-check).
4. Rebuild anything that was built badly.
5. Treat this as a full restoration — use the design/build skills available in this workspace.
6. Any new database schema change must be reflected in `sql_tables.sql`.
7. Scripts to back up the database and to restore it from a backup file.
8. Images are currently stored inside the database — fix that.
9. Fix weak/missing loading states throughout the app.

Codebase facts gathered before planning (Next.js, App Router UI + Pages Router API, Postgres via `pg` on Render, Vercel deploy, NextAuth + iron-session auth, Brevo for email, no ORM):

- The 4 notification-triggering events each do their own raw-SQL `INSERT` with no shared hook: `src/pages/api/client/register.ts`, `src/pages/api/create-appointment-request.ts`, `src/pages/api/orders.ts`, `src/pages/api/client/submit-intake.ts`.
- WhatsApp today is only manual `wa.me` links an admin clicks — nothing automated. **Decision: use Meta WhatsApp Cloud API** (official, free tier, HTTP-based, mirrors the existing Brevo email pattern) rather than a self-hosted Baileys bridge, which would need an always-on server Vercel can't provide and risks the number being banned.
- Images (`images`, `product_images` tables) are stored as raw `bytea` and base64-encoded into `data:` URIs on every API response — this bloats the DB (backups are ~3.2MB, almost entirely image bytes) and slows every page. **Decision: migrate to Vercel Blob storage**, storing only URLs in Postgres.
- Architecture issues worth rebuilding: dead code in `tailwind.config.ts`; admin pages share the public Header/Footer with only client-side `isAdmin` gating; three styling systems coexist (Tailwind, MUI, Bootstrap); several 700-1700 line monolithic files; raw SQL duplicated across ~30 API routes with no shared query layer.
- Loading-state issues: no `loading.tsx` files anywhere; `client-dashboard`/`client-portal` render a blank screen while auth resolves; `Cart` has a bare unstyled fallback; an existing `Apploading.tsx` shows a fake 5-second countdown unrelated to real load state.

## Phase 0 — CLAUDE.md + environment prep
- `CLAUDE.md` created in this project (done) — captures the WhatsApp decision, schema/backup/testing rules.
- Add required env var placeholders (document in CLAUDE.md/README since no `.env.example` exists yet): `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_OWNER_NUMBER`, `WHATSAPP_TEMPLATE_NAME`, `BLOB_READ_WRITE_TOKEN`.
- Scaffold Playwright for Phase 7 early so tests can be added incrementally as each phase lands.

## Phase 1 — WhatsApp Cloud API integration (code done, blocked on Meta business verification — see CLAUDE.md)
- One-time manual setup: Meta Business Manager app + WhatsApp Business Platform product, get a phone number ID, permanent access token, and an approved template message.
- New `src/lib/whatsapp.ts` — shared `sendWhatsAppMessage()` client, called directly (not via self-HTTP round trip) from the 4 event routes and from a companion API route `src/pages/api/send-whatsapp.ts` (mirrors `send-email.ts`).
- New `src/app/utils/whatsappTemplates.ts` — per-event message builders (registration, appointment, order, intake), keeping copy out of route files, mirroring `emailTemplates.ts`.
- Modify the 4 event routes to call `sendWhatsAppMessage()` right after their successful INSERT/COMMIT, wrapped in try/catch so a notification failure never blocks the user-facing request.
- **Verify:** trigger each of the 4 flows in dev, confirm the owner's WhatsApp number receives a message within seconds; check Vercel logs for the Graph API response; temporarily break the token and confirm the parent request (e.g. order creation) still succeeds.

## Phase 2 — Image storage migration to Vercel Blob (done)
- Schema: add `image_url text` to `images` and `product_images`, keep `image bytea` temporarily for rollback safety; update `view_products_with_image` and `get_image_data()` accordingly.
- One-off migration script (`scripts/migrate-images-to-blob.ts`): reads each row's bytea, uploads via `@vercel/blob`'s `put()`, writes the URL back. Run once against production **after** Phase 3's backup script exists and a fresh backup has been taken.
- Rewrite upload routes (`add-product.ts`, `edit-product.ts`, and the settings-image upload route) to use `@vercel/blob` instead of `fs.readFileSync` + bytea INSERT.
- Rewrite fetch routes (`fetch-products.ts`, `fetch-settings-images.ts`) to return the URL directly, dropping the base64 encoding step.
- Once verified, drop the `bytea` columns and regenerate `sql_tables.sql`.
- **Verify:** upload a product image through admin, confirm it appears in the Blob dashboard and `product_images.image_url` is set; storefront images load from the Blob CDN (no more giant base64 in API responses); `pg_dump` backup size drops sharply.

## Phase 3 — DB backup/restore scripts + sql_tables.sql process (done)
*(Create the backup script before running Phase 2's migration, as a safety prerequisite — not a strict ordering dependency.)*
- `scripts/backup-db.sh` — wraps `pg_dump` using `DATABASE_URL`, writes a timestamped `.backup` file to a gitignored `backups/` directory.
- `scripts/restore-db.sh` — wraps `pg_restore`/`psql`, takes a backup file path argument.
- `package.json` scripts: `db:backup`, `db:restore`.
- Update `README.md`'s manual pgAdmin restore section to reference the new scripts (keep pgAdmin steps as a documented fallback).
- Formalize in `CLAUDE.md`/README: every schema change ends with regenerating `sql_tables.sql` via `pg_dump --schema-only --no-owner --no-privileges --no-comments`, then stripping the `\restrict`/`\unrestrict` lines.
- **Verify:** `npm run db:backup` produces a file; `npm run db:restore` against a scratch database reproduces schema + row counts; `sql_tables.sql` matches live schema.

## Phase 4 — Targeted rebuild of flagged architecture issues
- Remove dead/stray runtime imports from `tailwind.config.ts`.
- Introduce a real admin layout: App Router route group (e.g. `src/app/(admin)/layout.tsx`) wrapping `Setting`, `Orders`, `IntakeForms`, `Appointments` with a dedicated shell, replacing the shared public Header/Footer and the client-side-only `isAdmin` gating with real route-level protection (mirroring `lib/session.ts`'s `requireAdmin`).
- Consolidate on Tailwind: replace `material-react-table` admin tables with Tailwind-styled tables; remove `react-bootstrap`/`bootstrap` after confirming zero usage.
- Split monoliths: `src/app/types/table.tsx` (1739 lines) → `src/app/_components/tables/*`; `src/app/types/Form.tsx` (1411 lines) → `src/app/_components/forms/*`; `emailTemplates.ts` → per-template files.
- Introduce `src/lib/repositories/` (clients, orders, appointments, products) to replace raw SQL duplicated across ~30 route files — start with the routes already touched in Phases 1–2 so they aren't refactored twice.
- **Verify:** `npm run build` passes; every admin page shows the new admin shell and redirects non-admins; full click-through of every route confirms no regressions from the Bootstrap/MUI removal or file splits.

## Phase 5 — Full visual redesign
- Brand reference: owner's Instagram (instagram.com/staywellclinic) — clean/minimalist wellness-clinic aesthetic, bilingual Arabic/English, content organized as Reviews/Products/Prices/Packages/Offers/Healthy Recipes/Articles. Current teal palette (`#0f766e`/`#14b8a6`, already used in email templates) is a plausible starting point.
- **Hard requirement: fully responsive on phone and desktop** — every page/component verified at both breakpoints, not just desktop.
- Use the `21st-ui-explore` skill first to compare design directions (style/palette/font pairing), since no direction is pre-selected; then `21st-ui-build`/`ui-ux-pro-max` to implement.
- Apply the chosen system to `globals.css`, `SettingsContext.tsx` (keep DB-backed brand colors as formal design tokens), and every route: home, `client-dashboard`, `client-portal`, `Cart`, `intake-form`, and the new admin shell from Phase 4.
- Depends on Phase 4 (clean component structure) and Phase 2 (image URLs, not base64).
- **Verify:** visual QA of every route at mobile/tablet/desktop breakpoints via the `run` skill; confirm no MUI/Bootstrap classNames remain; run the Phase 7 E2E suite against the redesigned pages to catch functional regressions.

## Phase 6 — Loading-state fixes
- Add `loading.tsx` files at key route segments (`client-dashboard`, `client-portal`, `Cart`, and the admin routes).
- Fix `client-dashboard/page.tsx` and `client-portal/page.tsx`: replace `if (status === "loading") return null` (blank screen) with the existing `Loding.tsx` skeleton.
- Fix `Cart/page.tsx`: replace the bare `<div>Loading...</div>` with `Loding.tsx`.
- Retire `Apploading.tsx`'s fake 5-second countdown; tie it to real load state or remove it in favor of `loading.tsx` files.
- Stretch goal: standardize on SWR for consistent loading/error/revalidation state instead of each page hand-rolling a `loading` boolean.
- Sequenced after Phase 5 so skeletons match the new visual system.
- **Verify:** throttle network and load each affected route, confirming a visible skeleton/spinner instead of a blank screen; confirm the fake countdown is gone.

## Phase 7 — End-to-end testing
- Playwright (`e2e/` directory), scaffolded in Phase 0 and expanded as each phase lands, not written all at once at the end.
- Core specs: registration, appointment booking, order/checkout, intake form submission, admin image upload, admin layout/gating, loading-state skeletons.
- Stub the WhatsApp Graph API and Brevo API at the network layer in tests (Playwright route interception) so tests verify the call was attempted with the right payload without sending real messages/emails.
- `npm run test:e2e` must pass before any phase is considered complete; never run against production data.

## Suggested execution order
0 → 1 → 3 (backup script) → 2 (image migration) → 3 (finish: sql_tables.sql process) → 4 → 5 → 6 → 7 (built incrementally throughout, finalized last)
