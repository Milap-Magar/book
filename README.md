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

## Deploying

`npm run build` writes a static site to `dist/`. Any static host can serve it, with two things set up.

**1. Send unknown paths to `index.html`.** The app uses browser-history routing, so a reload on
`/books/12` must return `index.html`, not a 404. Most hosts call this an SPA fallback or rewrite.

**2. Tell the browser where the API is.** Pick one:

| | How | Notes |
|---|---|---|
| Same origin | Leave `VITE_API_URL` unset and add a host rewrite from `/api/*` to `https://<api-host>/api/*` | No CORS, and the refresh cookie is first-party. This is what the dev server does. |
| Cross origin | Set `VITE_API_URL=https://<api-host>/api/v1` | The API must allow this site's origin, see below. |

`VITE_API_URL` is the full base URL **including `/api/v1`**. It is baked in at build time, so
changing it on the host needs a new build, not just a restart.

Optional: `VITE_FEATURE_FILES=true` once the API has file storage (see `.env.example`).

### What the API needs for a cross-origin frontend

Set on the backend (`java-book-api`), not here:

| Variable | Value |
|---|---|
| `APP_CORS_ORIGINS` | This site's exact origin, e.g. `https://book.example.com`. No trailing slash, no path. |
| `APP_COOKIE_SAME_SITE` | `Lax` if the site and the API share a registrable domain (`book.example.com` and `api.example.com`). `None` if they do not (`book.example.com` and `something.onrender.com`). |

With the wrong `SameSite` value login still works, but the browser drops the refresh cookie: users
are signed out on every reload and when the access token expires. Browsers that block third-party
cookies do the same even with `None`, so the same-origin setup, or an API subdomain of the site's
own domain, is the dependable choice.

### Troubleshooting

| Symptom | Cause |
|---|---|
| Login shows "Missing, invalid or expired access token". In the network tab `OPTIONS` succeeds and `POST https://<api-host>/auth/login` is 401 | `VITE_API_URL` lacks `/api/v1`. The API answers 401 for every path outside `/api/v1`. The `OPTIONS` row is the CORS preflight, a separate request, which is why one passes and one fails. |
| Request blocked with a CORS error, no response status | This site's origin is missing from `APP_CORS_ORIGINS`, or written differently (`http` vs `https`, `www`, trailing slash). |
| Login works, but a reload signs the user out | The refresh cookie was not stored or sent. Check `APP_COOKIE_SAME_SITE`. |
| First request takes up to a minute | A free-tier API was asleep. The client waits 90 seconds before giving up. |
| A reload on any page except `/` is a 404 | The SPA fallback in step 1 is missing. |

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
