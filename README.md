# Commit Ledger

Commit Ledger is an accountability-first skill tracker built with Next.js 16 App Router and TypeScript.

Core product rule:
Users can add and complete commitments, but can never delete them.

This rule is enforced across:
- Database model design
- API route behavior
- UI actions

## Product Intent

Most trackers hide dropped goals.
Commit Ledger preserves commitment history and keeps unfinished work visible.

The emotional center is unfinished commitments, not streak gamification.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- PostgreSQL + Prisma 7
- Auth.js (next-auth v5 beta, credentials provider)
- Zod validation

## Current Features

- Add skill with category, optional target date, optional pin
- Mark skill completed
- Pin and unpin
- No delete endpoint and no delete UI
- In-progress vs completed separation
- Accountability summary panel
- Analytics dashboard:
  - Completion rate
  - Unfinished commitments count
  - Streak-style metric
  - Weekly and monthly completion trends
  - Category breakdown
- Visitor mode with seeded demo data
- Owner mode with private data after login
- Public pinned endpoint for portfolio consumption
- Skill event audit log for status changes

## Repository Map

- App pages and routes: [src/app](src/app)
- API routes: [src/app/api](src/app/api)
- Auth configuration: [src/auth.ts](src/auth.ts)
- Next proxy entry: [src/proxy.ts](src/proxy.ts)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- Prisma config: [prisma.config.ts](prisma.config.ts)
- Seed script: [prisma/seed.ts](prisma/seed.ts)
- Business logic services: [src/lib/skill-service.ts](src/lib/skill-service.ts)
- Analytics computation: [src/lib/metrics.ts](src/lib/metrics.ts)

## Data Model

Main entities:
- User
  - role: OWNER or VISITOR
- Skill
  - status: IN_PROGRESS or COMPLETED
  - pinned boolean
  - optional targetDate and notes
- SkillEvent
  - immutable event log for CREATED, COMPLETED, PINNED, UNPINNED

No destructive behavior:
- No delete action in UI
- DELETE methods intentionally blocked in API routes
- Referential integrity uses restrict semantics

## API Contract

Owner and mode-aware routes:
- POST /api/skills
- PATCH /api/skills/:id/complete
- PATCH /api/skills/:id/pin
- GET /api/skills
- GET /api/analytics
- GET /api/events (owner only)

Public route:
- GET /api/public/pinned

Portfolio should consume only this public route.

## Environment Variables

Copy [.env.example](.env.example) to .env and set values.

Required:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET

Example values:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/commit_ledger?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-string

## Local Setup

1. Install dependencies
	npm install

2. Generate Prisma client
	npm run prisma:generate

3. Create migration
	npm run prisma:migrate -- --name init

4. Seed demo data
	npm run prisma:seed

5. Start app
	npm run dev

6. Verify quality
	npm run lint
	npm run build

## Seeded Accounts

- Owner: owner@commitledger.local / ownerpass123
- Visitor: visitor@commitledger.local / visitorpass123

Visitor mode is read-only and uses seeded visitor data.
Owner mode reads owner private data after login.

## Detailed Implementation Steps Followed

This section documents the order used to build this project so you can reproduce it without guessing.

Phase 1: Foundation
1. Scaffolded Next.js 16 App Router with TypeScript and Tailwind.
2. Installed runtime and dev dependencies.
3. Set up Prisma 7 with PostgreSQL:
	- datasource provider in [prisma/schema.prisma](prisma/schema.prisma)
	- connection URL in [prisma.config.ts](prisma.config.ts)
	- Prisma adapter and pg pool in [src/lib/db.ts](src/lib/db.ts)

Phase 2: Auth and Access Model
1. Added Auth.js credentials flow in [src/auth.ts](src/auth.ts).
2. Added session and JWT role handling for OWNER and VISITOR.
3. Added auth route handler in [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts).
4. Added Next 16 proxy auth entry in [src/proxy.ts](src/proxy.ts).

Phase 3: Domain Logic and Validation
1. Added Zod schemas in [src/lib/validation.ts](src/lib/validation.ts).
2. Added service-layer operations in [src/lib/skill-service.ts](src/lib/skill-service.ts):
	- createSkill
	- completeSkill
	- pinSkill
	- getAnalyticsForUser
	- getPublicPinned
3. Added analytics computations in [src/lib/metrics.ts](src/lib/metrics.ts).

Phase 4: API Layer
1. Added skill CRUD-lite routes (no delete):
	- [src/app/api/skills/route.ts](src/app/api/skills/route.ts)
	- [src/app/api/skills/[id]/complete/route.ts](src/app/api/skills/[id]/complete/route.ts)
	- [src/app/api/skills/[id]/pin/route.ts](src/app/api/skills/[id]/pin/route.ts)
2. Added analytics and event routes.
3. Added public pinned route for portfolio integration.

Phase 5: UI and UX
1. Built dark dashboard shell and navigation.
2. Added accountability panel as primary visual focus.
3. Added tracker with optimistic interactions.
4. Added analytics charts and category breakdown.
5. Added settings and login pages.
6. Marked DB-backed pages dynamic for safe production builds.

Phase 6: Verification
1. Prisma client generation passed.
2. Lint passed.
3. Production build passed.

## PostgreSQL: Online vs Local

Short answer:
You do not have to install PostgreSQL locally if you use a managed online provider.

Option A: Managed online Postgres (recommended for deployment)
- Providers: Neon, Supabase, Railway, Render, Aiven
- You get a connection string from provider dashboard
- Put it in DATABASE_URL
- Run migration and seed against that DB

Option B: Local Postgres
- Install PostgreSQL locally
- Create database commit_ledger
- Use local DATABASE_URL
- Good for offline dev and local data experimentation

If your goal is deploy-first, choose Option A.

## Deploy Checklist (No Surprises)

1. Create managed Postgres database.
2. Set env vars in hosting platform:
	- DATABASE_URL
	- NEXTAUTH_URL
	- NEXTAUTH_SECRET
4. Run migration in deploy environment:
	npm run prisma:deploy
4. Seed optional starter data:
	npm run prisma:seed
5. Build and start:
	npm run build
	npm run start

## Agentic AI and API Keys

Current state:
- This codebase does not require any AI API keys right now.
- There are no model calls in current routes.
- You can deploy fully without OpenAI/Anthropic/Gemini keys.

When agentic features are added:
- You will need either:
  - External model API key, or
  - Self-hosted local model endpoint

No-key strategy options:
- Local model runtime (self-hosted) with your own infrastructure
- Rule-based accountability jobs without LLMs for phase 1
- Manual reflection templates generated from SQL analytics only

Recommended practical rollout:
1. Deploy current non-AI product first.
2. Add manual trigger endpoints for reflection and planning output templates.
3. Add AI provider abstraction layer after production usage proves value.
4. Keep AI optional behind feature flag so app still works with zero API keys.

## Anti-Vibe-Coder Operating Mode

If you want to avoid fragile build habits, use this repeatable discipline:

1. Write constraints first
	- No delete behavior
	- Role boundaries
	- Public/private data separation

2. Build service layer before UI actions
	- Put business logic in [src/lib/skill-service.ts](src/lib/skill-service.ts)

3. Validate all input on server
	- Zod schemas in [src/lib/validation.ts](src/lib/validation.ts)

4. Keep auditability as a first-class concern
	- Write SkillEvent records for all state transitions

5. Force production checks before every merge
	- npm run lint
	- npm run build

6. Treat deployment as part of development, not an afterthought
	- Run real migrations
	- Verify env vars
	- Smoke test critical routes

