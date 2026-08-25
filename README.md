# LinkTrim

Multi-tenant URL shortener for teams. Organizations share one workspace to create short links, track analytics, and collaborate with role-based access. Includes a REST API for programmatic link creation.

## Features

- **Organizations** — Multi-tenant workspaces with `owner`, `admin`, and `member` roles
- **Custom & random slugs** — Pick a slug or let the server generate one
- **Link lifecycle** — Scheduled activation, expiration dates, click caps that auto-disable
- **REST API** — Create links programmatically via API keys (no browser required)
- **API key management** — Owner-only dashboard to create, list, and revoke keys
- **Analytics** — Org-wide and per-link: clicks over time, devices, referrers, countries, recent activity
- **Click recording** — Every redirect logs IP, user agent, referrer, device, country; bots flagged and excluded from metrics
- **Members & invitations** — Invite teammates, promote/demote roles, cancel pending invitations
- **Organization settings** — Rename workspaces, leave, delete (owner-only)

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components)   |
| Language   | TypeScript (strict)                          |
| Database   | PostgreSQL 18 with Drizzle ORM               |
| Auth       | Better Auth (email/password, organizations)  |
| UI         | Tailwind CSS v4 + shadcn/ui                  |
| Charts     | Recharts                                     |
| Monorepo   | Turborepo + Bun workspaces                   |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://www.docker.com) (for local PostgreSQL)

### 1. Install dependencies

```sh
bun install
```

### 2. Configure environment

Copy the example env file and fill in a secret:

```sh
cp apps/web/.env.example apps/web/.env
```

The defaults work with the bundled Docker Postgres:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/LinkTrim
BETTER_AUTH_SECRET=<generate a random string, minimum 32 characters>
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
```

### 3. Start the database and push the schema

```sh
bun run db:start    # starts Postgres 18 via Docker
bun run db:push     # pushes Drizzle schema to the database
```

### 4. Start the dev server

```sh
bun run dev
```

Open [http://localhost:3001](http://localhost:3001). Sign up, create an organization, and start creating links.

## API

Once you have an API key (created from the dashboard by the org owner), you can create links without the browser.

### Create a link

```sh
curl -X POST http://localhost:3001/api/links \
  -H "Authorization: Bearer lt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"organizationSlug":"my-org","originalUrl":"https://example.com"}'
```

The `slug` field is optional. If omitted, a random 8-character slug is generated.

Optional fields: `slug`, `clickCap`, `expiresAt`, `scheduledAt`.

### API key management

API keys are managed through the dashboard at `/orgs/[slug]/api-keys`. Only the organization owner can create or revoke keys. Keys are shown once at creation and cannot be recovered.

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| POST   | `/api/links`     | Create a link            |
| GET    | `/api/links`     | List links for an org    |
| PATCH  | `/api/links`     | Toggle link active state |

## Demo Data

Seed a ready-made organization with members, links, and ~30k realistic click records:

```sh
bun run db:seed                  # owner = first user in the database
bun run db:seed you@example.com  # owner = a specific user
```

Creates a `demo_org` workspace with 7 links, 3 demo members, a pending invitation, and click data spanning several weeks. The seed is idempotent.

## Database Schema

| Table         | Purpose                                             |
| ------------- | --------------------------------------------------- |
| `user`        | User accounts (email/password auth)                 |
| `session`     | Active sessions, tracks `active_organization_id`    |
| `account`     | Auth provider links (email/password in this case)   |
| `verification`| Email verification tokens                           |
| `organization`| Tenant workspaces (name, slug, logo)                |
| `member`      | Org membership with roles (`owner`/`admin`/`member`)|
| `invitation`  | Pending org invitations                             |
| `link`        | Short links (slug, URL, click cap, expiry, status)  |
| `click`       | Every redirect (IP, user agent, device, country)    |
| `api_key`     | API keys for programmatic access (hashed, revocable)|

Schema definitions: `packages/db/src/schema/`

## Project Structure

```
LinkTrim/
├── apps/
│   └── web/                          # Next.js application
│       └── src/
│           ├── app/                  # App Router pages & API routes
│           ├── components/           # App-level components
│           ├── context/              # React contexts (organization)
│           ├── hooks/                # Custom hooks (links, analytics)
│           ├── lib/                  # Auth client, roles, slugs, API key auth
│           └── types/                # TypeScript type definitions
├── packages/
│   ├── auth/                         # Better Auth server configuration
│   ├── db/                           # Drizzle schema, migrations, seed scripts
│   ├── ui/                           # Shared shadcn/ui components & styles
│   ├── env/                          # Validated environment variables (zod)
│   └── config/                       # Shared TypeScript config
├── turbo.json                        # Turborepo task pipeline
└── package.json                      # Workspace root scripts
```

## Scripts

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `bun run dev`        | Start all applications in development mode     |
| `bun run dev:web`    | Start only the web app (port 3001)             |
| `bun run build`      | Build all applications                         |
| `bun run check-types`| Type-check all packages                        |
| `bun run db:start`   | Start the PostgreSQL container                 |
| `bun run db:stop`    | Stop the PostgreSQL container                  |
| `bun run db:down`    | Stop and remove the PostgreSQL container        |
| `bun run db:push`    | Push schema changes to the database            |
| `bun run db:generate`| Generate Drizzle migration files               |
| `bun run db:migrate` | Apply generated migrations                     |
| `bun run db:studio`  | Open Drizzle Studio in the browser             |
| `bun run db:seed`    | Seed demo data (`db:seed <email>` to set owner)|

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and verify with `bun run check-types`.
4. Open a pull request describing the change.

Keep changes small, preserve multi-tenant isolation, and never weaken authentication or authorization.

## License

[Apache 2.0](LICENSE)
