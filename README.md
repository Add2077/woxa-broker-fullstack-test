# Woxa Brokers List Full Stack Test

Full stack broker directory application with authentication, protected broker creation, server-side search/filtering, and dynamic broker detail metadata.

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT bearer token with bcrypt password hashing
- Containerization: Docker Compose

## Why This Stack

This project follows the suggested stack from the assignment: Next.js for the frontend, NestJS for the backend, and TypeScript across both applications.

- Next.js App Router was chosen because the test requires frontend routing and SEO metadata on the broker detail page. It also keeps page-level data loading and routing conventions clear.
- NestJS was chosen because the backend requirements include authentication, authorization guards, validation, and REST modules. Its module/controller/service structure keeps those concerns separated.
- TypeScript was used across frontend and backend to keep DTOs, API payloads, broker types, and auth-related data safer to maintain.
- PostgreSQL was chosen because the broker and user data are relational, and the search/filter requirements map cleanly to SQL queries.
- Prisma was chosen to make the database schema, enum values, unique constraints, and seed data easy to inspect and reproduce.
- Docker Compose was added so the reviewer can run the frontend, backend, and database together with one command.

## Deliverables

- Source code: publish this project to a public GitHub repository before submission.
- Tech stack: documented in the `Tech Stack` and `Why This Stack` sections.
- Database setup: documented in `Run With Docker` and `Run Locally`; Prisma migration and seed commands are included.
- Install dependencies: run `npm install` for local development.
- Start project locally: run `npm run dev` after PostgreSQL is running and migrations are applied.
- Start project with Docker: run `docker compose up --build`.
- Test command: run `npm test` after the Docker services and seed data are ready.

## Features

- Register and login users
- JWT-protected `POST /api/brokers`
- Protected `/create` page
- Create broker form with all required fields
- Broker type dropdown: `cfd`, `bond`, `stock`, `crypto`
- Broker list with debounced search and broker type filter
- Server-side database filtering via query params
- Broker detail page by slug
- Dynamic metadata on broker detail pages
- Data validation for email, password length, URLs, broker type, and unique slug
- Docker Compose setup for frontend, backend, and database

## Production Readiness Checklist

- `.env.example`: included at the root for database URL, JWT secret, API port, frontend URL, and frontend API URLs.
- `docker-compose.yml`: included for PostgreSQL, NestJS API, and Next.js web app.
- Prisma migration and seed: migration SQL is committed under `apps/api/prisma/migrations`, and seed data is available through `npm run db:seed`.
- Frontend and backend validation: forms use required fields and client-side checks where useful; backend DTOs enforce the source of truth.
- Error responses: backend uses NestJS HTTP exceptions, while frontend API helpers normalize error messages into `ApiError`.
- Debounced search: broker list search waits before requesting the API.
- Protected route and protected API: `/create` checks local auth state, and `POST /api/brokers` requires a valid JWT bearer token.
- README architecture and manual test cases: documented below for reviewer verification.

## Architecture

```txt
Next.js App Router frontend
  -> src/lib/api.ts centralizes API calls and error handling
  -> src/lib/auth.ts stores and reads the JWT session
  -> src/lib/use-debounce.ts controls broker search frequency

NestJS backend
  -> auth module handles register, login, bcrypt, and JWT
  -> brokers module handles protected create, list search/filter, and detail lookup
  -> prisma module owns the PostgreSQL connection

PostgreSQL
  -> users table stores hashed passwords and soft-delete timestamp
  -> brokers table stores unique slugs and enum broker types
```

## Design Note

The provided Figma design is treated as a visual reference. The implemented UI keeps the expected broker directory workflow and adapts the presentation into a clean dashboard-style interface. Fields or broker data not provided by the design are mocked through Prisma seed data.

## Run With Docker

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api
- PostgreSQL: localhost:15432

The API container runs `prisma migrate deploy` on startup.

To seed demo data after Docker is running:

```bash
docker compose exec api npm run prisma:seed
```

If an old local Docker volume was created before migrations were added and Prisma reports `P3005`, reset the local database volume:

```bash
docker compose down -v
docker compose up --build
```

Demo account:

```txt
Email: demo@woxa.test
Password: password123
```

## Run Locally

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Start PostgreSQL, then install dependencies:

```bash
npm install
```

Run Prisma migrations:

```bash
npm run db:migrate
```

Seed demo data:

```bash
npm run db:seed
```

Start both apps:

```bash
npm run dev
```

Local URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api

## Testing

Build check:

```bash
npm run test:build
```

End-to-end smoke test:

```bash
docker compose up -d --build
docker compose exec api npm run prisma:seed
npm test
```

The smoke test verifies frontend routes, register, login, protected broker creation, search/filter, broker detail API, and broker detail page rendering. It creates temporary records and removes them after the run.

Optional overrides:

```bash
API_URL=http://localhost:4000/api WEB_URL=http://localhost:3000 npm test
```

## Manual Test Cases

1. Register at `/register` with `fullName`, `email`, `password`, and `confirmPassword`; confirm it redirects to `/login`.
2. Try registering again with the same email; confirm the API returns a duplicate email error.
3. Login at `/login`; confirm it redirects to `/create`.
4. Open `/create` without a saved token; confirm it redirects to `/login`.
5. Submit a broker with all six required fields and a valid `broker_type`; confirm it redirects to `/`.
6. Try submitting a broker with a duplicate slug; confirm the API rejects it.
7. Search by broker name on `/`; confirm the request uses `GET /api/brokers?search=...`.
8. Filter by broker type; confirm the request uses `GET /api/brokers?type=cfd` or another enum value.
9. Open a broker card; confirm `/broker/[slug]` displays the selected broker and has dynamic page metadata.
10. Call `POST /api/brokers` without `Authorization: Bearer <token>`; confirm it returns `401`.

## Grading Focus Coverage

Core evaluation:

- Authentication & Authorization: `POST /api/register` and `POST /api/login` are implemented in NestJS. Login returns a JWT access token. The `/create` page checks for a token before rendering the broker submission flow, and `POST /api/brokers` is protected by `JwtAuthGuard`.
- Search & Filter Implementation: the broker list sends `search` and `type` query parameters from the frontend. The backend applies database-level filtering with Prisma `where` conditions on broker `name` and `broker_type`.
- Frontend Routing: Next.js routes are implemented for `/`, `/login`, `/register`, `/create`, and `/broker/[slug]`. Broker cards link to the detail route using the broker slug.
- Frontend to Backend Integration: frontend API helpers centralize request methods, payloads, error handling, and `Authorization: Bearer <token>` headers. CORS is enabled in the backend for the frontend origin.
- Backend to Database Connection: Prisma connects NestJS to PostgreSQL. Broker creation persists all required fields, and list/detail endpoints read directly from the database.
- Code Structure: backend code is separated into `auth`, `brokers`, and `prisma` modules. frontend code is separated into routes, components, API helpers, auth helpers, hooks, and shared types.
- SEO Optimization: `/broker/[slug]` uses `generateMetadata` to set dynamic title, description, and Open Graph data from the broker detail API.

Bonus coverage:

- Debounce Search: the home page search input uses a reusable `useDebounce` hook before calling the broker list API.
- Data Validation: NestJS DTO validation checks required fields, email format, URL format, slug format, password length, and broker type enum. Duplicate broker slugs and duplicate user emails are rejected.
- Containerization: `docker-compose.yml` runs PostgreSQL, NestJS API, and Next.js frontend together.
- Add-on Features: seed data, institutional dark UI based on the reference design, Docker smoke testing, and dynamic detail metadata are included.

## API Endpoints

```txt
POST /api/register
POST /api/login
POST /api/brokers
GET  /api/brokers
GET  /api/brokers/:slug
```

Search and filter examples:

```txt
GET /api/brokers?search=exness
GET /api/brokers?type=cfd
GET /api/brokers?search=broker&type=stock
```

Protected broker creation:

```http
Authorization: Bearer <accessToken>
```

Create broker response:

```json
{
  "message": "Broker created successfully",
  "broker": {
    "id": "uuid",
    "name": "Exness",
    "slug": "exness-broker",
    "description": "CFD broker platform",
    "logo_url": "https://example.com/logo.png",
    "website": "https://example.com",
    "broker_type": "cfd"
  }
}
```

Broker list response:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Exness",
      "slug": "exness-broker",
      "description": "CFD broker platform",
      "logo_url": "https://example.com/logo.png",
      "website": "https://example.com",
      "broker_type": "cfd"
    }
  ]
}
```

Register payload:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Register response:

```json
{
  "message": "Register successful",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

Login response:

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

## Project Structure

```txt
apps/
  api/
    prisma/
    src/
      auth/
      brokers/
      prisma/
  web/
    src/
      app/
      components/
      lib/
      types/
docker-compose.yml
```

## AI Usage

AI was used as an implementation assistant for scaffolding and review. Architecture decisions, validation rules, API behavior, database schema, and final verification were reviewed and adjusted manually.
