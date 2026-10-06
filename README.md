# Shelfmallow web

The React frontend for Shelfmallow, a platform where students browse books and share study resources.
The Spring Boot API lives in a separate repository (`java-book-api`).

## Stack

React 19, TypeScript, Vite, React Router, TanStack Query, Axios, Tailwind CSS, React Hook Form, Zod
and Motion (scroll reveals on the landing pages only).

## Design

The look is claymorphism. Tokens live in `src/styles/tokens.css`, the clay surfaces (`clay-sm`,
`clay`, `clay-lg`, `clay-well`, `clay-input`, `clay-btn`) in `src/styles/clay.css`. The logo is
`src/components/brand/Logo.tsx` (and `public/favicon.svg`), book covers are drawn by
`src/components/clay/ClayBook.tsx` around the `coverUrl` the API returns, and the illustrations
in `src/components/illustrations/` are inline SVG built around one mascot.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

The dev server forwards every `/api` request to the backend at `http://localhost:8080`, so the
browser sees one origin: no CORS setup is needed in development and the refresh cookie just works.
To point at a different backend, copy `.env.example` to `.env.local` and set `API_PROXY_TARGET`.

### Without a backend

```bash
npm run dev:mock
```

This serves the same app, but `/api/v1` is answered in-process by [`mock/api.ts`](mock/api.ts),
an in-memory stand-in for the contract with 34 books, categories, reviews and resources. Book
details in [`mock/books.json`](mock/books.json) were looked up on Open Library by ISBN, and the
covers load from `covers.openlibrary.org`, so they need an internet connection. Data resets when
the dev server restarts. The login page shows one-click demo accounts:

| Role | Email | Password |
|---|---|---|
| Student | `student@shelfmallow.dev` | `student123` |
| Admin | `admin@shelfmallow.dev` | `admin12345` |

The mock is never part of a production build, and nothing in `src/` imports it.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload, using the real backend |
| `npm run dev:mock` | Dev server with the in-memory mock API |
| `npm run build` | Typecheck, then production build into `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build locally |

## The API contract

[`docs/BACKEND_TASKS.md`](docs/BACKEND_TASKS.md) Part 2 lists every endpoint this app calls and the
exact JSON shapes. `src/types/api.ts` mirrors it. Change both together.

## Layout

```
src/
├── app/          router and error pages
├── lib/          axios client, session store, query client, helpers
├── types/        API types
├── components/   shared UI (Button, Field, Pagination, loading/empty/error states)
├── layouts/      app shell, admin shell, route guards
└── features/     one folder per backend module:
    auth/ books/ categories/ reviews/ resources/ account/ admin/ home/
    each has api.ts (requests and query hooks) and its pages
```

## How a few things work

- **Auth.** The access token is kept in memory only (`lib/session.ts`). On page load, and whenever a
  request returns 401, `lib/api.ts` calls `POST /auth/refresh`; the httpOnly refresh cookie returns
  a new token and the failed request is retried. Parallel 401s share one refresh call.
- **Route guards** (`layouts/guards.tsx`) only decide what the UI shows. The API enforces the rules.
- **Lists** keep search, filters, sort and page in the URL (`lib/useListParams.ts`), so they survive
  a reload and can be shared.
- **Downloads** ask the API for a short-lived signed URL, then open it.
# book
