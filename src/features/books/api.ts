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

/** Books per page everywhere. The API allows at most 50. */
export const PAGE_SIZE = 20

/** The sort the catalogue opens with. Must be on the backend's whitelist (BookService.SORT_FIELDS). */
export const NEWEST_FIRST = 'createdAt,desc'

export function useBooks(params: BookListParams) {
  const clean = cleanParams(params)
  return useQuery({
    queryKey: bookKeys.list(clean),
    queryFn: async () => (await api.get<PageResponse<BookSummary>>('/books', { params: clean })).data,
    // Keep showing the current page while the next one loads, instead of flashing a skeleton.
    placeholderData: keepPreviousData,
  })
}

/**
 * The first page of the catalogue, newest first. The landing page, the dashboard, the Books page
 * and the admin table all open on exactly this query, so whichever comes first pays for the
 * request and the others read it from the cache.
 */
export function useLatestBooks() {
  return useBooks({ sort: NEWEST_FIRST, page: 0, size: PAGE_SIZE })
}

export function useBook(id: number) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: async () => (await api.get<BookDetail>(`/books/${id}`)).data,
    enabled: Number.isFinite(id),
  })
}

export function useSaveBook() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, book }: { id?: number; book: BookRequest }) => {
      const response = id ? await api.put<BookDetail>(`/books/${id}`, book) : await api.post<BookDetail>('/books', book)
      return response.data
    },
    onSuccess: (book) => {
      // The response is the saved book, so the detail page needs no request of its own.
      client.setQueryData(bookKeys.detail(book.id), book)
      // Lists and the admin totals are only marked stale; they reload when next shown.
      return Promise.all([
        client.invalidateQueries({ queryKey: bookKeys.lists }),
        client.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
    },
  })
}

export function useDeleteBook() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/books/${id}`),
    onSuccess: (_response, id) => {
      client.removeQueries({ queryKey: bookKeys.detail(id) })
      return Promise.all([
        client.invalidateQueries({ queryKey: bookKeys.lists }),
        client.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
    },
  })
}

/** Attaches the PDF (`file`) or the cover image (`cover`) to a book. Needs `features.files`. */
export function useUploadBookFile(id: number, kind: 'file' | 'cover') {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      // No time limit: a large file on a slow line is not a hung request.
      return (await api.put<BookDetail>(`/books/${id}/${kind}`, form, { timeout: 0 })).data
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
