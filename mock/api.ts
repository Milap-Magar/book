// A stand-in for the Spring Boot API, used only by `npm run dev:mock`.
// It implements docs/BACKEND_TASKS.md Part 2 in memory so the frontend can be built and
// demoed before the real endpoints exist. Data resets every time the dev server restarts.
// Nothing in src/ knows this exists: the app makes the same HTTP calls either way.
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { STATUS_CODES, type IncomingMessage, type ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import type { BookDetail, Category, DownloadRecord, Resource, ResourceStatus, Review, Role, User } from '../src/types/api.ts'

interface SeedBook {
  isbn: string
  title: string
  author: string
  publishedYear: number | null
  category: string
  description: string
  coverUrl: string | null
}

type StoredUser = User & { password: string }
type StoredDownload = DownloadRecord & { userId: number }
type Json = Record<string, unknown>

export const MOCK_ACCOUNTS = {
  admin: { email: 'admin@bookhub.dev', password: 'admin12345' },
  student: { email: 'student@bookhub.dev', password: 'student123' },
}

const now = () => new Date().toISOString()
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()
let nextId = 1000
const id = () => ++nextId

const categories: Category[] = [
  { id: 1, name: 'Programming', slug: 'programming' },
  { id: 2, name: 'Computer Science', slug: 'computer-science' },
  { id: 3, name: 'Mathematics', slug: 'mathematics' },
  { id: 4, name: 'Science', slug: 'science' },
  { id: 5, name: 'Business', slug: 'business' },
  { id: 6, name: 'Literature', slug: 'literature' },
]

const users: StoredUser[] = [
  { id: 1, ...MOCK_ACCOUNTS.admin, displayName: 'Maya Admin', role: 'ADMIN', enabled: true, createdAt: daysAgo(120) },
  { id: 2, ...MOCK_ACCOUNTS.student, displayName: 'Sam Student', role: 'USER', enabled: true, createdAt: daysAgo(40) },
  { id: 3, email: 'riya@bookhub.dev', password: 'riya12345', displayName: 'Riya Sharma', role: 'USER', enabled: true, createdAt: daysAgo(25) },
]

const seed = JSON.parse(readFileSync(resolve(process.cwd(), 'mock/books.json'), 'utf8')) as SeedBook[]
const books: BookDetail[] = seed.map((book, index) => ({
  id: index + 1,
  title: book.title,
  author: book.author,
  publisher: null,
  publishedYear: book.publishedYear,
  isbn: book.isbn,
  description: book.description,
  category: categories.find((category) => category.slug === book.category) ?? categories[0],
  coverUrl: book.coverUrl,
  ratingAvg: 0,
  ratingCount: 0,
  // Every third book has no file, so the "no file yet" state is visible too.
  hasFile: index % 3 !== 2,
  createdAt: daysAgo(index * 2),
  updatedAt: daysAgo(index * 2),
}))

const reviews: Review[] = []
const resources: Resource[] = []
const downloads: StoredDownload[] = []

function recalcRating(bookId: number) {
  const book = books.find((item) => item.id === bookId)
  if (!book) return
  const all = reviews.filter((review) => review.bookId === bookId)
  book.ratingCount = all.length
  book.ratingAvg = all.length ? all.reduce((sum, review) => sum + review.rating, 0) / all.length : 0
}

function seedReview(bookId: number, user: StoredUser, rating: number, comment: string, days: number) {
  reviews.push({ id: id(), bookId, rating, comment, user: { id: user.id, displayName: user.displayName }, createdAt: daysAgo(days), updatedAt: daysAgo(days) })
  recalcRating(bookId)
}

function seedResource(title: string, type: Resource['type'], status: ResourceStatus, uploader: StoredUser, bookId: number | null, days: number, extra: Partial<Resource> = {}) {
  const book = books.find((item) => item.id === bookId)
  resources.push({
    id: id(),
    title,
    description: null,
    type,
    status,
    rejectionReason: null,
    uploader: { id: uploader.id, displayName: uploader.displayName },
    book: book ? { id: book.id, title: book.title } : null,
    category: book?.category ?? categories[0],
    file: { originalName: `${title.toLowerCase().replace(/\W+/g, '-')}.pdf`, sizeBytes: 180_000 + days * 37_000, contentType: 'application/pdf' },
    createdAt: daysAgo(days),
    reviewedAt: status === 'PENDING' ? null : daysAgo(Math.max(0, days - 1)),
    ...extra,
  })
}

const [, sam, riya] = users
seedReview(1, sam, 5, 'Changed how I name things and split functions. The chapter on comments alone is worth it.', 12)
seedReview(1, riya, 4, 'Very useful, though some of the Java examples feel dated.', 6)
seedReview(2, riya, 5, 'Short chapters you can read between classes. Lots of advice that still holds up.', 9)
seedReview(13, sam, 4, 'Heavy going, but the best reference I have for exam revision.', 20)
seedReview(18, sam, 5, 'Finally understood replication and consistency after reading this.', 3)
seedReview(27, riya, 4, 'Makes you notice your own snap judgements.', 15)

seedResource('Clean Code chapter summaries', 'NOTES', 'APPROVED', riya, 1, 10, { description: 'One page per chapter, with the rules I found most useful.' })
seedResource('Algorithms midterm 2025', 'PAST_PAPER', 'APPROVED', sam, 13, 30, { description: 'Past paper with my worked answers for the graph questions.' })
seedResource('Sorting and searching slides', 'SLIDES', 'APPROVED', riya, 14, 18)
seedResource('Calculus formula sheet', 'NOTES', 'APPROVED', sam, 20, 22, { description: 'Derivatives, integrals and series tests on two pages.' })
seedResource('Operating systems lab notes', 'NOTES', 'PENDING', sam, 15, 1, { description: 'Notes from the process scheduling labs.' })
seedResource('Discrete maths past paper 2024', 'PAST_PAPER', 'PENDING', riya, 24, 2)
seedResource('Random scans', 'OTHER', 'REJECTED', sam, null, 14, { rejectionReason: 'The pages are unreadable. Please rescan and upload again.' })

const accessTokens = new Map<string, number>()
const refreshTokens = new Map<string, number>()

const publicUser = ({ password: _password, ...user }: StoredUser): User => user
const summary = ({ publisher: _p, isbn: _i, description: _d, createdAt: _c, updatedAt: _u, ...book }: BookDetail) => book

function paged<T>(list: T[], query: URLSearchParams) {
  const page = Math.max(0, Number(query.get('page') ?? 0) || 0)
  const size = Math.min(50, Math.max(1, Number(query.get('size') ?? 20) || 20))
  return { content: list.slice(page * size, page * size + size), page, size, totalElements: list.length, totalPages: Math.ceil(list.length / size) }
}

function send(res: ServerResponse, status: number, body?: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers })
  res.end(body === undefined ? '' : JSON.stringify(body))
}

function fail(res: ServerResponse, status: number, message: string, fieldErrors?: Record<string, string>) {
  send(res, status, { timestamp: now(), status, error: STATUS_CODES[status], message, ...(fieldErrors && { fieldErrors }) })
}

function startSession(res: ServerResponse, user: StoredUser) {
  const accessToken = randomUUID()
  const refreshToken = randomUUID()
  accessTokens.set(accessToken, user.id)
  refreshTokens.set(refreshToken, user.id)
  send(res, 200, { accessToken, expiresIn: 900, user: publicUser(user) }, { 'set-cookie': `refresh_token=${refreshToken}; HttpOnly; SameSite=Lax; Path=/api/v1/auth` })
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((done) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => done(Buffer.concat(chunks)))
  })
}

/** A one-page PDF, so "Read" and "Download" open something real. */
function samplePdf(title: string): Buffer {
  const text = title.replace(/[()\\]/g, '').slice(0, 60)
  const stream = `BT /F1 20 Tf 60 720 Td (${text}) Tj 0 -32 Td /F1 12 Tf (Sample file from the BookHub mock API.) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = objects.map((object, index) => {
    const offset = pdf.length
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const query = url.searchParams
  const method = req.method ?? 'GET'
  const path = url.pathname.replace(/^\/api\/v1/, '')
  const raw = await readBody(req)
  const body = (): Json => {
    try {
      return JSON.parse(raw.toString() || '{}') as Json
    } catch {
      return {}
    }
  }

  const token = (req.headers.authorization ?? '').replace('Bearer ', '')
  const me = users.find((user) => user.id === accessTokens.get(token) && user.enabled)
  const cookie = /refresh_token=([^;]+)/.exec(req.headers.cookie ?? '')?.[1] ?? ''
  const isAdmin = me?.role === 'ADMIN'
  let match: RegExpExecArray | null

  // ── Mock-only helpers ────────────────────────────────────────────────
  if (path === '/__mock/file.pdf') {
    const disposition = query.get('disposition') === 'inline' ? 'inline' : 'attachment'
    res.writeHead(200, { 'content-type': 'application/pdf', 'content-disposition': `${disposition}; filename="bookhub-sample.pdf"` })
    return res.end(samplePdf(query.get('title') ?? 'BookHub'))
  }
  const link = (title: string) => ({
    url: `/api/v1/__mock/file.pdf?disposition=${query.get('disposition') ?? 'attachment'}&title=${encodeURIComponent(title)}`,
    expiresAt: new Date(Date.now() + 300_000).toISOString(),
  })

  // ── Auth ─────────────────────────────────────────────────────────────
  if (method === 'POST' && path === '/auth/register') {
    const input = body()
    const email = String(input.email ?? '').toLowerCase()
    if (users.some((user) => user.email === email)) return fail(res, 409, 'An account with this email already exists')
    const user: StoredUser = { id: id(), email, password: String(input.password), displayName: String(input.displayName), role: 'USER', enabled: true, createdAt: now() }
    users.push(user)
    return send(res, 201, publicUser(user))
  }
  if (method === 'POST' && path === '/auth/login') {
    const input = body()
    const user = users.find((item) => item.email === String(input.email ?? '').toLowerCase() && item.password === input.password)
    if (!user) return fail(res, 401, 'Invalid email or password')
    if (!user.enabled) return fail(res, 401, 'This account has been disabled')
    return startSession(res, user)
  }
  if (method === 'POST' && path === '/auth/refresh') {
    const user = users.find((item) => item.id === refreshTokens.get(cookie) && item.enabled)
    if (!user) return fail(res, 401, 'Session expired')
    refreshTokens.delete(cookie)
    return startSession(res, user)
  }
  if (method === 'POST' && path === '/auth/logout') {
    refreshTokens.delete(cookie)
    return send(res, 204, undefined, { 'set-cookie': 'refresh_token=; Max-Age=0; Path=/api/v1/auth' })
  }

  // ── Public reads ─────────────────────────────────────────────────────
  if (method === 'GET' && path === '/categories') return send(res, 200, [...categories].sort((a, b) => a.name.localeCompare(b.name)))

  if (method === 'GET' && path === '/books') {
    const search = (query.get('search') ?? '').toLowerCase()
    const author = (query.get('author') ?? '').toLowerCase()
    const category = query.get('category')
    const [field, direction] = (query.get('sort') ?? 'createdAt,desc').split(',')
    if (!['title', 'createdAt', 'publishedYear', 'ratingAvg'].includes(field)) return fail(res, 400, `Cannot sort by '${field}'`)
    const key = field as 'title' | 'createdAt' | 'publishedYear' | 'ratingAvg'
    const sign = direction === 'desc' ? -1 : 1
    const list = books
      .filter((book) => !search || `${book.title} ${book.author}`.toLowerCase().includes(search))
      .filter((book) => !author || book.author.toLowerCase().includes(author))
      .filter((book) => !category || book.category?.slug === category)
      .sort((a, b) => {
        const left = a[key] ?? 0
        const right = b[key] ?? 0
        return (left > right ? 1 : left < right ? -1 : 0) * sign
      })
    return send(res, 200, paged(list.map(summary), query))
  }
  if (method === 'GET' && (match = /^\/books\/(\d+)$/.exec(path))) {
    const book = books.find((item) => item.id === Number(match![1]))
    return book ? send(res, 200, book) : fail(res, 404, `Book with id ${match[1]} not found`)
  }
  if (method === 'GET' && (match = /^\/books\/(\d+)\/reviews$/.exec(path))) {
    const bookId = Number(match[1])
    return send(res, 200, paged(reviews.filter((review) => review.bookId === bookId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), query))
  }
  if (method === 'GET' && path === '/resources') {
    const search = (query.get('search') ?? '').toLowerCase()
    const list = resources
      .filter((resource) => resource.status === 'APPROVED')
      .filter((resource) => !search || resource.title.toLowerCase().includes(search))
      .filter((resource) => !query.get('bookId') || resource.book?.id === Number(query.get('bookId')))
      .filter((resource) => !query.get('category') || resource.category.slug === query.get('category'))
      .filter((resource) => !query.get('type') || resource.type === query.get('type'))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return send(res, 200, paged(list, query))
  }

  // ── Everything below needs a signed-in user ──────────────────────────
  if (!me) return fail(res, 401, 'Authentication required')

  if (path === '/users/me') {
    if (method === 'PATCH') me.displayName = String(body().displayName)
    return send(res, 200, publicUser(me))
  }
  if (method === 'GET' && path === '/users/me/resources') {
    const status = query.get('status')
    return send(res, 200, paged(resources.filter((resource) => resource.uploader.id === me.id && (!status || resource.status === status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), query))
  }
  if (method === 'GET' && path === '/users/me/downloads') {
    return send(res, 200, paged(downloads.filter((download) => download.userId === me.id).map(({ userId: _userId, ...download }) => download), query))
  }

  if (method === 'POST' && (match = /^\/books\/(\d+)\/download$/.exec(path))) {
    const book = books.find((item) => item.id === Number(match![1]))
    if (!book?.hasFile) return fail(res, 404, 'This book has no file')
    downloads.unshift({ id: id(), userId: me.id, type: 'BOOK', targetId: book.id, title: book.title, downloadedAt: now() })
    return send(res, 200, link(book.title))
  }

  if ((match = /^\/books\/(\d+)\/reviews\/mine$/.exec(path))) {
    const bookId = Number(match[1])
    let review = reviews.find((item) => item.bookId === bookId && item.user.id === me.id)
    if (method === 'GET') return review ? send(res, 200, review) : fail(res, 404, 'You have not reviewed this book')
    if (method === 'PUT') {
      const input = body()
      const rating = Number(input.rating)
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(res, 400, 'Validation failed', { rating: 'must be between 1 and 5' })
      if (!review) {
        review = { id: id(), bookId, rating, comment: null, user: { id: me.id, displayName: me.displayName }, createdAt: now(), updatedAt: now() }
        reviews.push(review)
      }
      Object.assign(review, { rating, comment: input.comment ? String(input.comment) : null, updatedAt: now() })
      recalcRating(bookId)
      return send(res, 200, review)
    }
  }
  if (method === 'DELETE' && (match = /^\/reviews\/(\d+)$/.exec(path))) {
    const index = reviews.findIndex((item) => item.id === Number(match![1]))
    if (index < 0) return fail(res, 404, 'Review not found')
    if (reviews[index].user.id !== me.id && !isAdmin) return fail(res, 403, 'You can only delete your own review')
    const [removed] = reviews.splice(index, 1)
    recalcRating(removed.bookId)
    return send(res, 204)
  }

  if (method === 'POST' && path === '/resources') {
    const text = raw.toString('latin1')
    const part = /name="metadata"[^\r\n]*\r\nContent-Type: application\/json\r\n\r\n([\s\S]*?)\r\n--/.exec(text)
    if (!part) return fail(res, 400, 'The metadata part must be sent as application/json')
    if (!/name="file"; filename="[^"]+\.pdf"/i.test(text)) return fail(res, 400, 'Only PDF files are accepted')
    const meta = JSON.parse(Buffer.from(part[1], 'latin1').toString('utf8')) as Json
    const book = books.find((item) => item.id === meta.bookId)
    const category = categories.find((item) => item.id === meta.categoryId)
    if (!category) return fail(res, 400, 'Validation failed', { categoryId: 'Unknown category' })
    const resource: Resource = {
      id: id(),
      title: String(meta.title),
      description: meta.description ? String(meta.description) : null,
      type: meta.type as Resource['type'],
      status: 'PENDING',
      rejectionReason: null,
      uploader: { id: me.id, displayName: me.displayName },
      book: book ? { id: book.id, title: book.title } : null,
      category,
      file: { originalName: /name="file"; filename="([^"]+)"/.exec(text)?.[1] ?? 'file.pdf', sizeBytes: raw.length, contentType: 'application/pdf' },
      createdAt: now(),
      reviewedAt: null,
    }
    resources.push(resource)
    return send(res, 201, resource)
  }
  if ((match = /^\/resources\/(\d+)(\/download)?$/.exec(path))) {
    const resource = resources.find((item) => item.id === Number(match![1]))
    const visible = resource && (resource.status === 'APPROVED' || resource.uploader.id === me.id || isAdmin)
    if (!resource || !visible) return fail(res, 404, 'Resource not found')
    if (match[2] && method === 'POST') {
      downloads.unshift({ id: id(), userId: me.id, type: 'RESOURCE', targetId: resource.id, title: resource.title, downloadedAt: now() })
      return send(res, 200, link(resource.title))
    }
    if (method === 'DELETE') {
      if (resource.uploader.id !== me.id && !isAdmin) return fail(res, 403, 'You can only delete your own uploads')
      resources.splice(resources.indexOf(resource), 1)
      return send(res, 204)
    }
  }

  // ── Admin ────────────────────────────────────────────────────────────
  const adminOnly = path.startsWith('/admin/') || path.startsWith('/books') || path.startsWith('/categories')
  if (adminOnly && !isAdmin) return fail(res, 403, 'Access denied')

  if (method === 'POST' && path === '/categories') {
    const name = String(body().name ?? '').trim()
    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) return fail(res, 409, 'This category already exists')
    const category = { id: id(), name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
    categories.push(category)
    return send(res, 201, category)
  }
  if ((match = /^\/categories\/(\d+)$/.exec(path))) {
    const category = categories.find((item) => item.id === Number(match![1]))
    if (!category) return fail(res, 404, 'Category not found')
    if (method === 'PUT') {
      category.name = String(body().name)
      return send(res, 200, category)
    }
    if (method === 'DELETE') {
      if (books.some((book) => book.category?.id === category.id) || resources.some((resource) => resource.category.id === category.id)) {
        return fail(res, 409, 'This category is still used by books or resources')
      }
      categories.splice(categories.indexOf(category), 1)
      return send(res, 204)
    }
  }

  if (method === 'POST' && path === '/books') {
    const input = body()
    const category = categories.find((item) => item.id === input.categoryId)
    if (!category) return fail(res, 400, 'Validation failed', { categoryId: 'Unknown category' })
    if (input.isbn && books.some((book) => book.isbn === input.isbn)) return fail(res, 409, 'A book with this ISBN already exists')
    const book: BookDetail = {
      id: id(),
      title: String(input.title),
      author: String(input.author),
      publisher: input.publisher ? String(input.publisher) : null,
      publishedYear: input.publishedYear ? Number(input.publishedYear) : null,
      isbn: input.isbn ? String(input.isbn) : null,
      description: input.description ? String(input.description) : null,
      category,
      coverUrl: null,
      ratingAvg: 0,
      ratingCount: 0,
      hasFile: false,
      createdAt: now(),
      updatedAt: now(),
    }
    books.push(book)
    return send(res, 201, book, { location: `/api/v1/books/${book.id}` })
  }
  if ((match = /^\/books\/(\d+)$/.exec(path))) {
    const book = books.find((item) => item.id === Number(match![1]))
    if (!book) return fail(res, 404, `Book with id ${match[1]} not found`)
    if (method === 'PUT') {
      const input = body()
      const category = categories.find((item) => item.id === input.categoryId)
      if (!category) return fail(res, 400, 'Validation failed', { categoryId: 'Unknown category' })
      if (input.isbn && books.some((other) => other !== book && other.isbn === input.isbn)) return fail(res, 409, 'A book with this ISBN already exists')
      Object.assign(book, {
        title: String(input.title),
        author: String(input.author),
        publisher: input.publisher ? String(input.publisher) : null,
        publishedYear: input.publishedYear ? Number(input.publishedYear) : null,
        isbn: input.isbn ? String(input.isbn) : null,
        description: input.description ? String(input.description) : null,
        category,
        updatedAt: now(),
      })
      return send(res, 200, book)
    }
    if (method === 'DELETE') {
      books.splice(books.indexOf(book), 1)
      return send(res, 204)
    }
  }
  if (method === 'PUT' && (match = /^\/books\/(\d+)\/(file|cover)$/.exec(path))) {
    const book = books.find((item) => item.id === Number(match![1]))
    if (!book) return fail(res, 404, 'Book not found')
    const upload = /name="file"; filename="[^"]*"\r\nContent-Type: ([^\r\n]+)\r\n\r\n/.exec(raw.toString('latin1'))
    if (!upload) return fail(res, 400, 'The file part is missing')
    if (match[2] === 'file') {
      if (upload[1] !== 'application/pdf') return fail(res, 400, 'Only PDF files are accepted')
      book.hasFile = true
    } else {
      if (!/^image\/(jpeg|png|webp)$/.test(upload[1])) return fail(res, 400, 'Covers must be JPEG, PNG or WebP')
      // The mock keeps the image in memory as a data URL instead of using object storage.
      const start = (upload.index ?? 0) + upload[0].length
      const end = raw.lastIndexOf(Buffer.from('\r\n--'))
      book.coverUrl = `data:${upload[1]};base64,${raw.subarray(start, end).toString('base64')}`
    }
    return send(res, 200, book)
  }

  if (method === 'GET' && path === '/admin/resources') {
    const status = query.get('status') ?? 'PENDING'
    return send(res, 200, paged(resources.filter((resource) => resource.status === status).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), query))
  }
  if (method === 'POST' && (match = /^\/admin\/resources\/(\d+)\/(approve|reject)$/.exec(path))) {
    const resource = resources.find((item) => item.id === Number(match![1]))
    if (!resource) return fail(res, 404, 'Resource not found')
    if (resource.status !== 'PENDING') return fail(res, 409, 'Only pending resources can be reviewed')
    if (match[2] === 'approve') resource.status = 'APPROVED'
    else Object.assign(resource, { status: 'REJECTED', rejectionReason: String(body().reason ?? '') })
    resource.reviewedAt = now()
    return send(res, 200, resource)
  }
  if (method === 'GET' && path === '/admin/users') {
    const search = (query.get('search') ?? '').toLowerCase()
    return send(res, 200, paged(users.filter((user) => !search || `${user.displayName} ${user.email}`.toLowerCase().includes(search)).map(publicUser), query))
  }
  if (method === 'PATCH' && (match = /^\/admin\/users\/(\d+)$/.exec(path))) {
    const user = users.find((item) => item.id === Number(match![1]))
    if (!user) return fail(res, 404, 'User not found')
    if (user.id === me.id) return fail(res, 409, 'You cannot change your own role or status')
    const input = body()
    if (input.role === 'USER' || input.role === 'ADMIN') user.role = input.role as Role
    if (typeof input.enabled === 'boolean') user.enabled = input.enabled
    return send(res, 200, publicUser(user))
  }
  if (method === 'GET' && path === '/admin/stats') {
    const count = (status: ResourceStatus) => resources.filter((resource) => resource.status === status).length
    return send(res, 200, { users: users.length, books: books.length, resources: { pending: count('PENDING'), approved: count('APPROVED'), rejected: count('REJECTED') }, downloads: downloads.length })
  }

  return fail(res, 404, `The mock API has no handler for ${method} ${path}`)
}

export function mockApi(): Plugin {
  return {
    name: 'bookhub-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/v1')) return next()
        handle(req, res).catch((error: unknown) => {
          console.error('[mock api]', error)
          if (!res.headersSent) fail(res, 500, 'The mock API crashed; see the terminal')
        })
      })
      server.config.logger.info(
        `\n  Mock API active. Sign in with ${MOCK_ACCOUNTS.student.email} / ${MOCK_ACCOUNTS.student.password}` +
          ` or ${MOCK_ACCOUNTS.admin.email} / ${MOCK_ACCOUNTS.admin.password}\n`,
      )
    },
  }
}
