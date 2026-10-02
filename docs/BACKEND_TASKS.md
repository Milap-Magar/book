# BookHub backend: tasks and API contract

This file has two parts:

1. **Tasks** — what to build in `book-api`, in order, with a check for each stage.
2. **API contract** — every endpoint the frontend will call, with exact request and response shapes.

The frontend is built against Part 2. If you change a path, field name or status code, update this
file in the same commit so both sides stay in sync.

Decisions already made (see the blueprint): modular monolith, package by feature, Flyway owns the
schema, JWT access token plus refresh cookie, multipart upload through Spring Boot, signed URLs for
download, one private S3-compatible bucket.

---

# Part 1 — Tasks

Do the stages in order. Each stage ends with a **✔ check**; the stage is done only when it passes.

> ⚠️ Render redeploys on every push to `main`. Build Stages 2 and 3 on a branch and merge them
> together, otherwise the book write endpoints are live on the internet with no login.

## Stage 0 — Fix what is broken

- [x] `compose.yaml` line 22: `SPRIbooNG_DATASOURCE_URL` → `SPRING_DATASOURCE_URL`.
- [x] `BookRepository`: `existsByIsbn` must return `boolean`. `findByIsbn` → `Optional<Book>`.
- [x] Replace field `@Autowired` with `private final` fields and a constructor in `BookService` and `BookController`.
- [x] Make `ErrorResponse` a record: `timestamp`, `status`, `error`, `message`, `fieldErrors` (nullable map). Use it in `GlobalExceptionHandler` instead of the `Map`.
- [x] `Book`: `id` → `Long`. Remove `price` and `applyDiscount()` (BookHub has no prices). Base `equals`/`hashCode` on `id`, not ISBN, because ISBN becomes optional.
- [x] Remove the REST Docs dependencies and the asciidoctor plugin from `pom.xml`.
- [x] Update `TODO.md` and `README.md`: tick what is really done, fix `/api/books` → `/api/v1/books`, drop price and discount.
- [ ] `Book.publishedYear` → `Integer`. Deferred to Stage 1: it changes a column type, which needs a Flyway migration.
- [ ] Drop the exporter, Member and Loan stages (G and H) from `TODO.md` if you agree they are out of scope.

✔ `docker compose up --build` starts both containers and `curl localhost:8080/api/v1/books` returns `[]` or a list.

## Stage 1 — Foundation

- [ ] Move to package-by-feature: `common`, `config`, `auth`, `user`, `category`, `book`, `resource`, `review`, `download`, `storage`. Move the existing files; create the rest as you need them.
- [ ] Add Flyway. Write `V1__init.sql` for the current `books` table. Set `ddl-auto: validate` locally and on Render.
- [ ] `common/BaseEntity` (`@MappedSuperclass`) with `id`, `createdAt`, `updatedAt`.
- [ ] `common/PageResponse<T>` record: `content`, `page`, `size`, `totalElements`, `totalPages`, with a static `from(Page<T>)`.
- [ ] Exception handling for: `ResourceNotFoundException` → 404, `ConflictException` → 409, `MethodArgumentNotValidException` → 400 with `fieldErrors`, bad query params → 400, `MaxUploadSizeExceededException` → 413, everything else → 500 with a generic message (log the stack trace, never return it).
- [ ] Add springdoc-openapi (the release line for Spring Boot 4). Swagger UI at `/swagger-ui.html`.
- [ ] Add Testcontainers for Postgres so `./mvnw test` needs no running database.

✔ App starts with `ddl-auto: validate`. `GET /api/v1/books/999` returns the 404 JSON from Part 2. `./mvnw test` passes with Postgres stopped.

## Stage 2 — Categories and book catalogue

*Unblocks frontend: home, book list, search, book details.*

- [ ] Migration: `categories` (id, name, slug unique). Add to `books`: `description`, `category_id`, `rating_avg` (default 0), `rating_count` (default 0), `created_at`, `updated_at`; make `isbn` nullable but still unique.
- [ ] `Category` entity, repository, service, controller. Slug is generated from the name.
- [ ] `Book` → `@ManyToOne(fetch = LAZY) Category`.
- [ ] DTOs: `BookRequest` (validated), `BookSummaryResponse`, `BookDetailResponse`, each response with a static `from(Book)`.
- [ ] `POST`, `PUT`, `DELETE` for books. Duplicate ISBN → 409. `POST` returns 201 with a `Location` header.
- [ ] `GET /books` with `Pageable` and `JpaSpecificationExecutor`: `search` (case-insensitive match on title or author), `category` (slug), `author`.
- [ ] Sort whitelist: `title`, `createdAt`, `publishedYear`, `ratingAvg`. Anything else → 400. Cap `size` at 50.
- [ ] Fetch the category with the list query (`@EntityGraph` or join fetch) so the list is not N+1.
- [ ] `@Transactional(readOnly = true)` on the service class, `@Transactional` on writes.
- [ ] Seed migration with about 6 categories and 20 books so the frontend has data.

✔ `GET /api/v1/books?search=java&category=programming&sort=title,asc&page=0&size=10` returns a `PageResponse`. With `show-sql` on, the list runs a fixed number of queries regardless of page size.

## Stage 3 — Authentication and authorization

*Unblocks frontend: login, register, protected routes, admin book management.*

- [ ] Add `spring-boot-starter-security` and `spring-boot-starter-oauth2-resource-server`.
- [ ] Migration: `users` (email unique on `lower(email)`, password_hash, display_name, role, enabled, created_at) and `refresh_tokens` (user_id, token_hash unique, expires_at, revoked_at).
- [ ] `User` entity, `Role` enum (`USER`, `ADMIN`), BCrypt `PasswordEncoder` bean.
- [ ] `TokenService`: issues an HS256 JWT (15 minutes; claims `sub` = user id, `role`) using `JwtEncoder`, with the secret from `JWT_SECRET`.
- [ ] Refresh tokens: random 32 bytes, store only the SHA-256 hash, 7-day expiry, rotate on every refresh, revoke on logout.
- [ ] Refresh cookie: name `refresh_token`, `HttpOnly`, `Secure` (off in the dev profile), `SameSite=Lax`, `Path=/api/v1/auth`.
- [ ] `AuthController`: register, login, refresh, logout. Login failure message is always "Invalid email or password".
- [ ] `SecurityConfig`: stateless sessions, CSRF disabled, the URL rules in Part 2, a converter that maps the `role` claim to `ROLE_USER` / `ROLE_ADMIN`.
- [ ] Custom `AuthenticationEntryPoint` (401) and `AccessDeniedHandler` (403) that write `ErrorResponse` JSON.
- [ ] CORS: allowed origins from `APP_CORS_ORIGINS` (dev: `http://localhost:5173`), `allowCredentials = true`, headers `Authorization` and `Content-Type`.
- [ ] Create the first admin at startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` when no admin exists.
- [ ] `GET /users/me`, `PATCH /users/me`.
- [ ] Park or wire up the existing `UserLoginRequest` as the login body (add `@Email`).

✔ `POST /books` returns 401 with no token, 403 with a USER token, 201 with an ADMIN token. After the access token expires, `POST /auth/refresh` returns a new one and the old refresh token no longer works.

## Stage 4 — Storage and book files

*Unblocks frontend: covers, read and download buttons, admin file upload.*

- [ ] Add MinIO to `compose.yaml` and the AWS SDK v2 `s3` dependency.
- [ ] `storage/StorageService` interface: `put(key, stream, size, contentType)`, `delete(key)`, `presignGet(key, filename, inline, ttl)`. One implementation, `S3StorageService`. Nothing outside `storage` imports the AWS SDK.
- [ ] Migration: `stored_files` (storage_key unique, original_name, content_type, size_bytes, sha256, uploaded_by, created_at). Add `file_id` and `cover_file_id` to `books`.
- [ ] `FileValidator`: extension, declared content type, magic bytes (`%PDF-` for PDFs), size. PDF ≤ 25 MB; cover JPEG/PNG/WebP ≤ 2 MB.
- [ ] Set `spring.servlet.multipart.max-file-size` and `max-request-size`.
- [ ] Storage keys are server-generated (`books/{uuid}.pdf`, `covers/{uuid}.jpg`). Never use the uploaded filename in the key.
- [ ] Upload order: put the object, then save rows; if the save fails, delete the object.
- [ ] `PUT /books/{id}/file`, `PUT /books/{id}/cover` (admin).
- [ ] `coverUrl` in book responses is a signed URL valid for 1 hour, or `null`.
- [ ] Migration: `downloads` (user_id, book_id nullable, resource_id nullable, created_at; check that exactly one target is set).
- [ ] `POST /books/{id}/download` records a download and returns a signed URL valid for 5 minutes.
- [ ] `GET /users/me/downloads`.

✔ Upload a PDF as admin, then as a normal user call `POST /books/{id}/download` and open the returned URL. A `.exe` renamed to `.pdf` is rejected with 400. The bucket is not publicly listable.

## Stage 5 — Resources and moderation

*Unblocks frontend: upload resource, my uploads, admin moderation queue.*

- [ ] Migration: `resources` (title, description, type, status, uploader_id, book_id nullable, category_id, file_id, rejection_reason, reviewed_by, reviewed_at, created_at). Index `(status, created_at)` and `uploader_id`.
- [ ] Enums: `ResourceType` (`NOTES`, `PAST_PAPER`, `SLIDES`, `OTHER`), `ResourceStatus` (`PENDING`, `APPROVED`, `REJECTED`).
- [ ] `POST /resources` (multipart). New resources are always `PENDING`.
- [ ] Duplicate check: same SHA-256 as an existing `PENDING` or `APPROVED` resource → 409.
- [ ] `ResourceValidator` interface with one basic implementation (file checks only). All status changes go through one method in `ResourceService`. This is the seam for AI validation later; do not add anything AI-specific now.
- [ ] Visibility rule in the service: `APPROVED` is public; `PENDING` and `REJECTED` are visible to the uploader and admins only (return 404 to everyone else).
- [ ] `GET /resources`, `GET /resources/{id}`, `GET /users/me/resources`, `PATCH /resources/{id}`, `DELETE /resources/{id}`.
- [ ] `POST /resources/{id}/download` (same rules as visibility, plus login required).
- [ ] Admin: `GET /admin/resources?status=`, `approve`, `reject` (reason required). A transition from anything other than `PENDING` → 409.
- [ ] Deleting a resource deletes its stored object.

✔ User A uploads; user B gets 404 on it; admin approves; user B can now list and download it. Rejecting stores the reason and user A sees it in `GET /users/me/resources`.

## Stage 6 — Reviews

*Unblocks frontend: rating and review section on book details.*

- [ ] Migration: `reviews` (book_id, user_id, rating, comment, created_at, updated_at; unique `(book_id, user_id)`; check rating between 1 and 5).
- [ ] `PUT /books/{id}/reviews/mine` creates or updates the caller's review.
- [ ] Recalculate `books.rating_avg` and `rating_count` in the same transaction on create, update and delete.
- [ ] `GET /books/{id}/reviews`, `GET /books/{id}/reviews/mine`, `DELETE /reviews/{id}` (owner or admin).

✔ Two users rate a book 5 and 3; `GET /books/{id}` shows `ratingAvg: 4.0`, `ratingCount: 2`. Deleting one updates both numbers.

## Stage 7 — Admin users and stats

*Unblocks frontend: admin dashboard, manage users.*

- [ ] `GET /admin/users` with `search` and pagination.
- [ ] `PATCH /admin/users/{id}`: change role, enable or disable. An admin cannot disable or demote themselves (409).
- [ ] Login and refresh reject disabled users.
- [ ] `GET /admin/stats`.

✔ A disabled user cannot log in or refresh.

## Stage 8 — Tests, hardening, deployment

- [ ] Service unit tests (Mockito, no Spring context): duplicate ISBN, moderation transitions, rating recalculation, ownership checks.
- [ ] `@WebMvcTest` for one controller: status codes and validation errors.
- [ ] Security tests: 401 / 403 / 200 for one public, one user and one admin endpoint.
- [ ] One Testcontainers integration test: register → login → upload → approve → download.
- [ ] Limit Actuator exposure to `health`.
- [ ] Rate-limit `POST /auth/login` (simple in-memory limiter per IP is enough).
- [ ] `application-prod.yaml`; production env vars: `SPRING_DATASOURCE_*`, `JWT_SECRET`, `APP_CORS_ORIGINS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
- [ ] GitHub Actions: `./mvnw verify` on every push.

✔ CI is green and the full flow works against the Render URL.

---

# Part 2 — API contract

## Conventions

- Base path: `/api/v1`. All bodies are JSON with camelCase keys unless marked multipart.
- IDs are numbers. Timestamps are ISO-8601 UTC strings (`2026-10-02T08:15:30Z`).
- Auth header: `Authorization: Bearer <accessToken>`.
- Access column: **Public**, **User** (any logged-in user), **Owner**, **Admin**.

### Pagination

Query params on every list endpoint: `page` (0-based, default 0), `size` (default 20, max 50),
`sort` (`field,asc|desc`).

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 134,
  "totalPages": 7
}
```

### Errors

Every non-2xx response has this body. `fieldErrors` is present only on validation failures.

```json
{
  "timestamp": "2026-10-02T08:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "fieldErrors": { "title": "must not be blank" }
}
```

| Status | When |
|---|---|
| 400 | Validation failed, bad query param, file type not allowed |
| 401 | Missing, invalid or expired access token; bad login |
| 403 | Logged in but not allowed |
| 404 | Not found, or not visible to this user |
| 409 | Duplicate (email, ISBN, file), or invalid state change |
| 413 | File too large |

## Shared shapes

```jsonc
// UserResponse
{ "id": 1, "email": "a@b.com", "displayName": "Asha", "role": "USER", "enabled": true,
  "createdAt": "2026-10-02T08:15:30Z" }

// AuthResponse
{ "accessToken": "eyJ...", "expiresIn": 900, "user": { /* UserResponse */ } }

// CategoryResponse
{ "id": 3, "name": "Programming", "slug": "programming" }

// BookSummaryResponse  (used in lists)
{ "id": 10, "title": "Clean Code", "author": "Robert C. Martin", "publishedYear": 2008,
  "category": { "id": 3, "name": "Programming", "slug": "programming" },
  "coverUrl": "https://...signed" /* or null */,
  "ratingAvg": 4.5, "ratingCount": 12, "hasFile": true }

// BookDetailResponse = BookSummaryResponse plus:
{ "publisher": "Prentice Hall", "isbn": "9780132350884" /* or null */,
  "description": "...", "createdAt": "...", "updatedAt": "..." }

// BookRequest
{ "title": "Clean Code", "author": "Robert C. Martin", "publisher": "Prentice Hall",
  "publishedYear": 2008, "isbn": "9780132350884", "description": "...", "categoryId": 3 }
// required: title, author, categoryId

// ReviewResponse
{ "id": 7, "bookId": 10, "rating": 4, "comment": "Clear and practical.",
  "user": { "id": 1, "displayName": "Asha" },
  "createdAt": "...", "updatedAt": "..." }

// ResourceResponse
{ "id": 21, "title": "DSA unit 3 notes", "description": "...",
  "type": "NOTES",                 // NOTES | PAST_PAPER | SLIDES | OTHER
  "status": "PENDING",             // PENDING | APPROVED | REJECTED
  "rejectionReason": null,
  "uploader": { "id": 1, "displayName": "Asha" },
  "book": { "id": 10, "title": "Clean Code" } /* or null */,
  "category": { "id": 3, "name": "Programming", "slug": "programming" },
  "file": { "originalName": "unit3.pdf", "sizeBytes": 482113, "contentType": "application/pdf" },
  "createdAt": "...", "reviewedAt": null }

// DownloadLinkResponse
{ "url": "https://...signed", "expiresAt": "2026-10-02T08:20:30Z" }

// DownloadResponse  (history row)
{ "id": 55, "type": "BOOK" /* BOOK | RESOURCE */, "targetId": 10, "title": "Clean Code",
  "downloadedAt": "..." }
```

## Auth

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `{ email, password, displayName }` | 201 `UserResponse`; 409 if email taken |
| POST | `/auth/login` | Public | `{ email, password }` | 200 `AuthResponse` + sets `refresh_token` cookie; 401 on bad credentials |
| POST | `/auth/refresh` | Cookie | none | 200 `AuthResponse` + rotated cookie; 401 if missing, expired or revoked |
| POST | `/auth/logout` | Cookie | none | 204, cookie cleared |

Validation: `email` valid format; `password` 8–72 characters; `displayName` 2–50 characters.

The frontend calls `/auth/refresh` once on page load to restore the session, and again whenever a
request returns 401. It sends cookies only to `/auth/*`.

## Users

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/users/me` | User | — | `UserResponse` |
| PATCH | `/users/me` | User | `{ displayName }` | `UserResponse` |
| GET | `/users/me/resources` | User | `?status&page&size` | `PageResponse<ResourceResponse>` (all statuses) |
| GET | `/users/me/downloads` | User | `?page&size` | `PageResponse<DownloadResponse>`, newest first |
| GET | `/admin/users` | Admin | `?search&page&size` | `PageResponse<UserResponse>` |
| PATCH | `/admin/users/{id}` | Admin | `{ role?, enabled? }` | `UserResponse`; 409 when changing yourself |

## Categories

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/categories` | Public | — | `CategoryResponse[]` (not paged, sorted by name) |
| POST | `/categories` | Admin | `{ name }` | 201 `CategoryResponse`; 409 if it exists |
| PUT | `/categories/{id}` | Admin | `{ name }` | `CategoryResponse` |
| DELETE | `/categories/{id}` | Admin | — | 204; 409 if books or resources still use it |

## Books

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/books` | Public | query params below | `PageResponse<BookSummaryResponse>` |
| GET | `/books/{id}` | Public | — | `BookDetailResponse` |
| POST | `/books` | Admin | `BookRequest` | 201 `BookDetailResponse` + `Location`; 409 on duplicate ISBN |
| PUT | `/books/{id}` | Admin | `BookRequest` | `BookDetailResponse` |
| DELETE | `/books/{id}` | Admin | — | 204 |
| PUT | `/books/{id}/file` | Admin | multipart, part `file` (PDF ≤ 25 MB) | `BookDetailResponse` |
| PUT | `/books/{id}/cover` | Admin | multipart, part `file` (JPEG/PNG/WebP ≤ 2 MB) | `BookDetailResponse` |
| POST | `/books/{id}/download` | User | `?disposition=attachment\|inline` (default `attachment`) | `DownloadLinkResponse`; 404 if the book has no file |

`GET /books` query params:

| Param | Meaning |
|---|---|
| `search` | Case-insensitive match on title or author |
| `category` | Category slug |
| `author` | Case-insensitive match on author |
| `sort` | `title`, `createdAt`, `publishedYear` or `ratingAvg`, plus `,asc` or `,desc`. Default `createdAt,desc` |
| `page`, `size` | See Pagination |

`disposition=inline` is how the frontend's "Read" button opens the PDF in a browser tab.

## Reviews

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/books/{id}/reviews` | Public | `?page&size` | `PageResponse<ReviewResponse>`, newest first |
| GET | `/books/{id}/reviews/mine` | User | — | `ReviewResponse`; 404 if none |
| PUT | `/books/{id}/reviews/mine` | User | `{ rating, comment }` | `ReviewResponse` (creates or updates) |
| DELETE | `/reviews/{id}` | Owner or Admin | — | 204 |

Validation: `rating` integer 1–5; `comment` optional, up to 2000 characters.

## Resources

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/resources` | Public | `?search&bookId&category&type&page&size&sort` | `PageResponse<ResourceResponse>`, `APPROVED` only |
| GET | `/resources/{id}` | Public if approved, else Owner or Admin | — | `ResourceResponse`; 404 if not visible |
| POST | `/resources` | User | multipart, see below | 201 `ResourceResponse` with `status: PENDING`; 409 on duplicate file |
| PATCH | `/resources/{id}` | Owner | `{ title?, description? }` | `ResourceResponse` |
| DELETE | `/resources/{id}` | Owner or Admin | — | 204 |
| POST | `/resources/{id}/download` | User | `?disposition=attachment\|inline` | `DownloadLinkResponse` |

`POST /resources` is `multipart/form-data` with two parts:

- `file` — the PDF, up to 25 MB.
- `metadata` — content type `application/json`:
  ```json
  { "title": "DSA unit 3 notes", "description": "...", "type": "NOTES",
    "bookId": 10, "categoryId": 3 }
  ```
  Required: `title` (3–150 characters), `type`, `categoryId`. `bookId` is optional.

`GET /resources` sort whitelist: `createdAt`, `title`. Default `createdAt,desc`.

## Admin moderation and stats

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/admin/resources` | Admin | `?status=PENDING&page&size` | `PageResponse<ResourceResponse>`, oldest first |
| POST | `/admin/resources/{id}/approve` | Admin | — | `ResourceResponse`; 409 if not `PENDING` |
| POST | `/admin/resources/{id}/reject` | Admin | `{ reason }` (5–500 characters) | `ResourceResponse`; 409 if not `PENDING` |
| GET | `/admin/stats` | Admin | — | see below |

```json
{ "users": 42, "books": 120,
  "resources": { "pending": 5, "approved": 61, "rejected": 9 },
  "downloads": 870 }
```

## Access rules summary (for `SecurityConfig`)

| Access | Requests |
|---|---|
| Public | `/auth/**`; `GET /books/**` except `/reviews/mine`; `GET /categories`; `GET /resources/**`; `/actuator/health`; Swagger UI |
| Admin | `/admin/**`; `POST`, `PUT`, `DELETE` on `/books/**` except `/download` and `/reviews/mine`; writes on `/categories/**` |
| User | Everything else |

Owner checks and the "not visible → 404" rule are enforced in the service layer, not in URL rules.

## What the frontend needs from you first

1. Stage 2 with seed data — the public pages can be built against it.
2. Stage 3 — login, register and protected routes.
3. CORS for `http://localhost:5173` with credentials allowed.
4. Swagger UI, so shapes can be checked against this file.
