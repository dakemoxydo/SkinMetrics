# SkinMetrics

CS2 portfolio tracker built with Next.js, Prisma and PostgreSQL.

## What is implemented

- Auth:
  - NextAuth credentials sign-in for development
  - Steam sign-in flow (OpenID callback + user upsert)
- Portfolio:
  - CRUD for portfolio items
  - Portfolio stats and history endpoints
  - Price sync from Steam Market with DB cache
- Additional features:
  - Wishlist CRUD
  - Price alerts
  - Transactions (buy/sell)
  - Public profile pages
  - Public share pages (`/p/[shareId]`)
  - Portfolio compare page (`/compare`)
- UX:
  - Theme switch
  - Language switch (RU/EN)
  - PWA manifest + service worker registration

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Prisma + PostgreSQL
- NextAuth
- Vitest
- Playwright (e2e baseline)

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Use PostgreSQL URL like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skinmetrics?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-long-random-secret"
CRON_SECRET="replace-with-long-random-secret"
STEAM_API_KEY=""
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Prepare database

```bash
npm run db:generate
npm run db:migrate
```

If you only need to sync schema quickly:

```bash
npm run db:push
```

Optional seed:

```bash
npm run db:seed
```

### 5. Run app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - run local development server
- `npm run lint` - run ESLint
- `npm run test` - run unit/integration tests (Vitest)
- `npm run test:e2e` - run Playwright e2e tests
- `npm run build` - production build
- `npm run db:generate` - generate Prisma client
- `npm run db:migrate` - apply dev migrations
- `npm run db:migrate:prod` - apply production migrations
- `npm run db:push` - sync schema without migration history
- `npm run db:studio` - open Prisma Studio

## Notes

- Portfolio compare works only for public profiles.
- Public share pages are available via `/p/[shareId]`.
- Middleware injects `x-user-id` for protected API routes from session token.
