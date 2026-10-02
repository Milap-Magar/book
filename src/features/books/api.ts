import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cleanParams } from '@/lib/format'
import type { BookDetail, BookRequest, BookSummary, Disposition, DownloadLink, PageParams, PageResponse } from '@/types/api'

export interface BookListParams extends PageParams {
  search?: string
  category?: string
  author?: string
}

export const bookKeys = {
  all: ['books'] as const,
  lists: ['books', 'list'] as const,
  list: (params: BookListParams) => ['books', 'list', params] as const,
  detail: (id: number) => ['books', 'detail', id] as const,
}

// ── Compatibility with the backend while it is being built ─────────────────
// The contract (docs/BACKEND_TASKS.md) says GET /books returns a page of books with category,
// cover and rating fields. Until backend Stage 2 lands it returns a plain array of
// {id, title, author, publisher, publishedYear, isbn}. Everything is normalised here, at the
// edge, so no component has to care. Once the backend matches the contract these helpers
// do nothing and can be deleted.

type RawBook = Partial<Omit<BookDetail, 'publishedYear'>> & { id: number; publishedYear?: number | string | null }

function normalizeBook(raw: RawBook): BookDetail {
  const year = Number(raw.publishedYear)
  return {
    id: raw.id,
    title: raw.title ?? 'Untitled',
    author: raw.author ?? 'Unknown author',
    publisher: raw.publisher ?? null,
    publishedYear: raw.publishedYear && Number.isFinite(year) ? year : null,
    isbn: raw.isbn ?? null,
    description: raw.description ?? null,
    category: raw.category ?? null,
    coverUrl: raw.coverUrl ?? null,
    ratingAvg: raw.ratingAvg ?? 0,
    ratingCount: raw.ratingCount ?? 0,
    hasFile: raw.hasFile ?? false,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  }
}

/** Accepts a real page, or a plain array that is then searched and paged in the browser. */
function toBookPage(data: PageResponse<RawBook> | RawBook[], params: BookListParams): PageResponse<BookSummary> {
  if (!Array.isArray(data)) return { ...data, content: data.content.map(normalizeBook) }

  const search = (params.search ?? '').toLowerCase()
  const all = data.map(normalizeBook).filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(search))
  const size = params.size ?? 20
  const page = params.page ?? 0
  return {
    content: all.slice(page * size, page * size + size),
    page,
    size,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
  }
}

export function useBooks(params: BookListParams) {
  const clean = cleanParams(params)
  return useQuery({
    queryKey: bookKeys.list(clean),
    queryFn: async () => toBookPage((await api.get<PageResponse<RawBook> | RawBook[]>('/books', { params: clean })).data, clean),
    // Keep showing the current page while the next one loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
  })
}

export function useBook(id: number) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: async () => normalizeBook((await api.get<RawBook>(`/books/${id}`)).data),
    enabled: Number.isFinite(id),
  })
}

export function useSaveBook() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, book }: { id?: number; book: BookRequest }) => {
      const response = id
        ? await api.put<RawBook>(`/books/${id}`, book)
        : await api.post<RawBook>('/books', book)
      return normalizeBook(response.data)
    },
    onSuccess: (book) => {
      client.setQueryData(bookKeys.detail(book.id), book)
      return client.invalidateQueries({ queryKey: bookKeys.lists })
    },
  })
}

export function useDeleteBook() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/books/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: bookKeys.all }),
  })
}

/** Attaches the PDF (`file`) or the cover image (`cover`) to a book. */
export function useUploadBookFile(id: number, kind: 'file' | 'cover') {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return normalizeBook((await api.put<RawBook>(`/books/${id}/${kind}`, form)).data)
    },
    onSuccess: (book) => {
      client.setQueryData(bookKeys.detail(id), book)
      return client.invalidateQueries({ queryKey: bookKeys.lists })
    },
  })
}

export async function requestBookDownload(id: number, disposition: Disposition): Promise<DownloadLink> {
  const { data } = await api.post<DownloadLink>(`/books/${id}/download`, null, { params: { disposition } })
  return data
}
