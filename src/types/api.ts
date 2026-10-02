// Shapes from docs/BACKEND_TASKS.md, Part 2. Keep the two in sync.

export type Role = 'USER' | 'ADMIN'
export type ResourceType = 'NOTES' | 'PAST_PAPER' | 'SLIDES' | 'OTHER'
export type ResourceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type Disposition = 'attachment' | 'inline'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  fieldErrors?: Record<string, string>
}

export interface User {
  id: number
  email: string
  displayName: string
  role: Role
  enabled: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  expiresIn: number
  user: User
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface BookSummary {
  id: number
  title: string
  author: string
  publishedYear: number | null
  /** Null until the backend has categories (Stage 2). */
  category: Category | null
  coverUrl: string | null
  ratingAvg: number
  ratingCount: number
  hasFile: boolean
}

export interface BookDetail extends BookSummary {
  publisher: string | null
  isbn: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface BookRequest {
  title: string
  author: string
  publisher?: string
  publishedYear?: number
  isbn?: string
  description?: string
  categoryId: number
}

export interface Review {
  id: number
  bookId: number
  rating: number
  comment: string | null
  user: { id: number; displayName: string }
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id: number
  title: string
  description: string | null
  type: ResourceType
  status: ResourceStatus
  rejectionReason: string | null
  uploader: { id: number; displayName: string }
  book: { id: number; title: string } | null
  category: Category
  file: { originalName: string; sizeBytes: number; contentType: string }
  createdAt: string
  reviewedAt: string | null
}

export interface ResourceMetadata {
  title: string
  description?: string
  type: ResourceType
  bookId?: number
  categoryId: number
}

export interface DownloadLink {
  url: string
  expiresAt: string
}

export interface DownloadRecord {
  id: number
  type: 'BOOK' | 'RESOURCE'
  targetId: number
  title: string
  downloadedAt: string
}

export interface AdminStats {
  users: number
  books: number
  resources: { pending: number; approved: number; rejected: number }
  downloads: number
}
