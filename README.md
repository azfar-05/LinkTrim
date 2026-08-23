# LinkTrim

**Production-quality, multi-tenant URL shortener for teams.**

LinkTrim is an invite-only link management platform where organizations share one workspace to create short links, track per-link analytics, and collaborate with role-based access — powered by a modern TypeScript monorepo.

## Features

- **Organizations** — Multi-tenant workspaces with `owner`, `admin`, and `member` roles (Better Auth)
- **Custom & random slugs** — Pick a memorable slug like `localhost:3001/sale` or let LinkTrim generate one
- **Link lifecycle controls** — Scheduled activation, expiration dates, and click caps that auto-disable links
- **Analytics** — Organization-wide and per-link dashboards: clicks over time, unique visitors, device split, peak hours, referrers, countries, top links, and recent activity (Recharts)
- **Click recording** — Every redirect logs IP, user agent, referrer, device, and country; bots are flagged and excluded from all metrics
- **Members & invitations** — Invite teammates, promote/demote roles, cancel pending invitations
- **Organization settings** — Rename workspaces, leave organizations, and delete orgs (owner-only danger zone)
- **Reserved-slug enforcement** — Reserved keywords are blocked server-side on links and organizations

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | Next.js (App Router, Server Components)      |
| Language   | TypeScript (strict)                          |
| Database   | PostgreSQL with Drizzle ORM                  |
| Auth       | Better Auth (email/password, organizations)  |
| UI         | Tailwind CSS + shadcn/ui primitives          |
| Charts     | Recharts                                     |
| Monorepo   | Turborepo + Bun workspaces                   |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.x`
- [Docker](https://www.docker.com) (for the local PostgreSQL database)

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Copy `apps/web/.env.example` to `apps/web/.env` (or create it) with:

```env
DATABASE_URL=postgres://postgres:CHANGE_ME@localhost:5432/LinkTrim
BETTER_AUTH_SECRET=<a-random-secret-at-least-32-chars>
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
```

> The bundled `docker-compose` (step 3) configures Postgres with user `postgres` and password `password`, so for local development use `postgres://postgres:password@localhost:5432/LinkTrim`. Use a strong password in any shared or deployed environment.

### 3. Start the database and apply the schema

```bash
bun run db:start   # docker compose up -d (Postgres 18)
bun run db:push    # push the Drizzle schema
```

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001). Sign up, create an organization, and start shortening links.

## Demo Data

Want to demo the product quickly? Seed a ready-made organization with members, links, and ~30k realistic click records:

```bash
bun run db:seed            # owner = first user in the database
bun run db:seed you@example.com  # owner = a specific user
```

This creates a `demo_org` workspace owned by your account with 7 links covering high/low/zero traffic, expired and scheduled links, 3 demo members, and a pending invitation. The seed is idempotent — re-running it resets the demo organization.

## Analytics

All metrics are computed live from the `click` table — nothing is precomputed, simulated, or estimated. Every redirect inserts one row (IP, user agent, referrer, device, country) before forwarding to the destination.

- **Bots** are detected from the user agent at redirect time. Their rows are kept with `is_bot = true` (visible in the per-link recent activity feed) but excluded from every metric and never increment a link's click counter.
- **Unique visitors** are counted as distinct non-null IPs. This undercounts visitors sharing one IP; there is no fingerprinting.
- **Device** is parsed from the user agent once, when the click is recorded (`Mobile`, `Tablet`, `Desktop`, `TV`, `Other`). Rows recorded before this column existed show up as Unknown.
- **Country** comes from CDN geo headers: `x-vercel-ip-country` on Vercel or `cf-ipcountry` on Cloudflare. Local development has no geo headers, so countries read as Unknown there.
- **Referrers** are normalized to bare hostnames; visits without a `Referer` header count as Direct.

## Project Structure

```
LinkTrim/
├── apps/
│   └── web/              # Next.js application
│       └── src/app/      # App Router pages & API routes
├── packages/
│   ├── auth/             # Better Auth server configuration
│   ├── db/               # Drizzle schema, migrations & seed scripts
│   ├── ui/               # Shared shadcn/ui components & styles
│   ├── env/              # Validated environment variables (zod)
│   └── config/           # Shared TypeScript/tooling config
├── turbo.json            # Turborepo task pipeline
└── package.json          # Workspace root scripts
```

## Available Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `bun run dev`           | Start all applications in development mode    |
| `bun run dev:web`       | Start only the web app (port 3001)            |
| `bun run build`         | Build all applications                        |
| `bun run check-types`   | Type-check all packages                       |
| `bun run db:start`      | Start the PostgreSQL container                |
| `bun run db:stop`       | Stop the PostgreSQL container                 |
| `bun run db:push`       | Push schema changes to the database           |
| `bun run db:generate`   | Generate Drizzle migrations from the schema   |
| `bun run db:migrate`    | Apply generated migrations                    |
| `bun run db:studio`     | Open Drizzle Studio to browse the database    |
| `bun run db:seed`       | Seed demo data (`db:seed <email>` to pick owner) |

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and verify them with `bun run check-types`.
4. Open a pull request describing the change and any trade-offs.

Please keep changes small, preserve multi-tenant isolation, and never weaken authentication or authorization.

## License

[Apache 2.0](LICENSE)
