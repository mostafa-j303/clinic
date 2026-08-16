This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## End-to-end tests

A real, committed Playwright suite lives in `e2e/` (config: `playwright.config.ts`).

```bash
npm run test:e2e       # headless run, starts its own dev server if one isn't already running
npm run test:e2e:ui    # interactive UI mode, useful while writing/debugging a spec
```

Notes:
- Never point this suite at production — `playwright.config.ts` always targets `http://localhost:3000` via a dev server it starts itself.
- Admin specs read `ADMIN_PASSWORD_REFERENCE` from `.env` to log in — keep that value in sync with the real admin password (see the "Admin login access" section of `CLAUDE.md`).
- There is no separate test database. Specs that would create real data (registering a client, submitting an intake form, placing an order) are intentionally scoped to UI-only assertions (disabled/enabled button states, navigation, validation) rather than actually submitting — don't add a spec that calls `/api/client/register`, `/api/orders`, `/api/client/submit-intake`, etc. against this shared DB without first setting up an isolated test database.
- Outbound notification calls (`/api/send-email`, `/api/send-whatsapp`) are stubbed at the network layer for every test (see `e2e/fixtures.ts`) — no real email/WhatsApp message is ever sent by the suite.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

library :
npm install swiper

When the Render database expires and you need a new one :
1. Before it expires, run `npm run db:backup` to get a fresh backup file (skip if you already have a recent one).
2. Create the new database on Render.
3. Run `npm run db:restore -- backups/<your-backup-file>.backup <new-render-db-url>` to restore everything (tables, data, images URLs) into the new database.
4. Update `DATABASE_URL` in two places: locally in `.env`, and on Vercel (project → Settings → Environment Variables → `DATABASE_URL`) → then redeploy.
Note: images themselves are stored in Vercel Blob, not in the database, so they keep working automatically once the database is restored — no separate image recovery needed.

Backup / restore database (recommended way) :
- Backup: `npm run db:backup` — dumps the current DATABASE_URL (from .env) into a timestamped .backup file under `backups/` (gitignored).
- Restore: `npm run db:restore -- <backup-file> [target-database-url]` — restores a .backup file into DATABASE_URL (or a different target URL if given as a second argument). Asks for confirmation before running since it overwrites existing objects.
Example: `npm run db:restore -- backups/misso-clinic_2026-08-15_21-23-28.backup`

Restore database (manual / pgAdmin fallback) :
go to pgadmin 4 --> Open pgAdmin 4 and connect to your server --> In the Object Explorere (left sidebar) --> Expand your server --> Render DB --> Databases --> Right-click on the database jarjourdb or the db we have create on render etc.. or create db and right click on it --> Choose Restore --> choose the back up file , format custom .backup or plain .sql .
the back up files are in the misso-clinic folder .


to change vercel branch : go to vercel project --> setting --> Environments --> change branch name and readeploye 
to change dbatabe info in the vercel : go to vercel project --> setting --> Environments varialbe --> edit the DATABASE_URL to the new external url value you take it from render .

for google login : https://console.cloud.google.com/apis/credentials?project=valiant-monitor-462917-k9

Direct intake form link for customers :
Send a customer this URL: https://<your-domain>/intake-form
- If they're not logged in, it sends them to login/register first, then automatically brings them straight back to the intake form afterward.
- If they're already logged in but haven't filled it yet, it opens the form directly.
- If they already completed it, it sends them to their dashboard instead (so they're not asked to redo it).
No extra setup needed — this already works as-is.


To recreate the database structure (all tables, relations, functions) from scratch, use sql_tables.sql :
1. Create a new empty database (in pgAdmin or Render).
2. Run this command in the terminal, replacing <new_db_url> with your new database connection string :
   psql <new_db_url> -f sql_tables.sql
   or open sql_tables.sql, copy all of it, and paste/run it in pgAdmin's Query Tool on the new database.
This only creates the empty structure, no data/rows.