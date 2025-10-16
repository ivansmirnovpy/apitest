# Fastify TypeScript Starter

A starter template for building modular Fastify applications with TypeScript. This project is configured with environment variable validation, linting, formatting, and testing tooling to streamline development.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` – run the development server with automatic reloads using `ts-node-dev`
- `npm run build` – compile TypeScript to JavaScript in the `dist` directory
- `npm run start` – start the compiled application
- `npm run lint` – lint the codebase using ESLint
- `npm run lint:fix` – run ESLint with automatic fixes
- `npm run format` – format source files with Prettier
- `npm run format:check` – check formatting without applying changes
- `npm run test` – run the Jest test suite
- `npm run test:watch` – watch mode for tests
- `npm run test:coverage` – generate test coverage report
- `npm run prisma:generate` – generate the Prisma client based on the schema
- `npm run prisma:migrate:dev` – create or apply migrations against the development database
- `npm run prisma:migrate:deploy` – apply migrations in production-like environments
- `npm run prisma:seed` – seed the database with baseline tenant data

## Project Structure

```
.
├── src
│   ├── app.ts           # Fastify application factory
│   ├── server.ts        # Entry point for starting the server
│   ├── plugins
│   │   ├── env.ts       # Fastify plugin to expose validated environment variables
│   │   └── README.md    # Guidance for creating additional plugins
│   └── utils
│       └── env.ts       # Environment loader with dotenv + zod validation
├── prisma
│   ├── schema.prisma    # Prisma schema (SQLite in development)
│   ├── migrations/      # Checked-in database migrations
│   └── seed.ts          # Seed script for sample tenant data
├── tsconfig.json        # TypeScript configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js       # Jest configuration
├── package.json         # Project metadata and scripts
├── README.md            # Project documentation
└── .env.example         # Example environment variables
```

## Environment Management

Environment variables are managed through `dotenv` and validated with `zod` to ensure required configuration is present. By default, the loader reads from the following files (if they exist), with later files overriding earlier ones:

1. `.env`
2. `.env.local`
3. `.env.<NODE_ENV>`
4. `.env.<NODE_ENV>.local`

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

## Development Workflow

1. Load environment variables by creating a `.env` (or environment-specific) file.
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build the project before running in production:
   ```bash
   npm run build
   npm run start
   ```
4. Use linting and formatting scripts to maintain code quality.

## Database & Prisma

Prisma is configured with a SQLite datasource for local development. The Prisma client is exposed to Fastify routes via the `prisma` plugin (`fastify.prisma`).

### Local development (SQLite)

1. Copy the example environment file and update values as needed:
   ```bash
   cp .env.example .env
   ```
2. Run migrations and generate the Prisma client:
   ```bash
   npm run prisma:migrate:dev
   ```
3. Seed the database with the sample tenant data:
   ```bash
   npm run prisma:seed
   ```

### Switching to Postgres

1. Update `DATABASE_URL` in `.env` to point at your Postgres instance, for example:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
   ```
2. Change the datasource provider in `prisma/schema.prisma` (and `prisma/migrations/migration_lock.toml`) from `sqlite` to `postgresql`.
3. Regenerate the Prisma client and apply the existing migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate:deploy
   ```
4. Optionally re-run the seed script against Postgres:
   ```bash
   npm run prisma:seed
   ```

> The migration SQL checked into `prisma/migrations` uses column types that are compatible with both SQLite and Postgres. For Postgres you can further evolve the `metadata` column to `JSONB` if you need native JSON operators.

## Health Check

The server exposes a `GET /health` endpoint that returns service status, current timestamp, and uptime. This can be used for readiness or liveness checks in deployment environments.
