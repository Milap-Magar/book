import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, errorStatus } from '@/lib/api'
import { bookKeys } from '@/features/books/api'
import type { PageResponse, Review } from '@/types/api'

const reviewKeys = {
  book: (bookId: number) => ['reviews', bookId] as const,
  list: (bookId: number, page: number) => ['reviews', bookId, 'list', page] as const,
  mine: (bookId: number) => ['reviews', bookId, 'mine'] as const,
}

export function useReviews(bookId: number, page: number) {
  return useQuery({
    queryKey: reviewKeys.list(bookId, page),
    queryFn: async () =>
      (await api.get<PageResponse<Review>>(`/books/${bookId}/reviews`, { params: { page, size: 10 } })).data,
    placeholderData: keepPreviousData,
  })
}

/** Resolves to null when the user has not reviewed this book yet (the API answers 404). */
export function useMyReview(bookId: number, enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.mine(bookId),
    enabled,
    queryFn: async () => {
      try {
        return (await api.get<Review>(`/books/${bookId}/reviews/mine`)).data
      } catch (error) {
        if (errorStatus(error) === 404) return null
        throw error
      }
    },
  })
}

function useInvalidateReviews(bookId: number) {
  const client = useQueryClient()
  // A review changes the book's ratingAvg and ratingCount, so the book queries are stale too.
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: reviewKeys.book(bookId) }),
      client.invalidateQueries({ queryKey: bookKeys.all }),
    ])
}

export function useSaveReview(bookId: number) {
  const invalidate = useInvalidateReviews(bookId)
  return useMutation({
    mutationFn: async (input: { rating: number; comment: string }) =>
      (await api.put<Review>(`/books/${bookId}/reviews/mine`, input)).data,
    onSuccess: invalidate,
  })
}

export function useDeleteReview(bookId: number) {
  const invalidate = useInvalidateReviews(bookId)
  return useMutation({
    mutationFn: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
    onSuccess: invalidate,
  })
}
