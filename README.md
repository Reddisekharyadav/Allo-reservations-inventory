# Allo Reservations

Reservation-first inventory for multiple warehouses built with Next.js, Prisma, and Postgres.
Developed by **Reddi sekhar**.

## Overview

This project implements a robust inventory system with a focus on reservations. It handles multiple warehouses and ensures accurate stock tracking even under high concurrency. 

### Key Features
- Lists products with per-warehouse availability.
- Creates atomic reservations using row-level locking (`SELECT ... FOR UPDATE`).
- Confirms or releases reservations securely.
- Expires stale holds automatically through cron jobs.
- Supports `Idempotency-Key` for reliable reserve and confirm operations.

## Local setup

```bash
npm install
npm run prisma:generate
npm run dev
```

If you need to initialize the database first:

```bash
npx prisma migrate deploy
npm run db:seed
```

## Environment Variables

- `DATABASE_URL`: Postgres connection string.
- `CRON_SECRET`: required for the secured cleanup route.

## Cron setup

1. Set `CRON_SECRET` in Vercel and GitHub.
2. Set `DEPLOYMENT_URL` in GitHub to your live app URL.
3. The secured cron route is located at `/api/cron/release-expired`.

## Repository layout

- `src/`: app routes, UI, and reservation logic.
- `prisma/`: schema, seed data, and migrations.
- `public/`: static assets.
- `scripts/`: local helper scripts.
- `allo-assessment/`: nested copy of the assessment app and its own README.

## Notes

- The root app is the main working copy.
- The reservation flow relies on PostgreSQL transactions for correctness.