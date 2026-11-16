import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, errorStatus } from '@/lib/api'
import { bookKeys } from '@/features/books/api'
import type { PageResponse, Review } from '@/types/api'

const reviewKeys = {
  lists: (bookId: number) => ['reviews', bookId, 'list'] as const,
  list: (bookId: number, page: number) => ['reviews', bookId, 'list', page] as const,
  mine: (bookId: number) => ['reviews', bookId, 'mine'] as const,
}

/** `enabled: false` for a book nobody has rated: the answer is known to be an empty list. */
export function useReviews(bookId: number, page: number, enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.list(bookId, page),
    enabled,
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

/**
 * After a review changes: "my review" is written straight into the cache (the server just told
 * us what it is), and only the two things that really changed are fetched again: the list of
 * reviews, and the book, whose ratingAvg and ratingCount moved.
 */
function useReviewChanged(bookId: number) {
  const client = useQueryClient()
  return (mine: Review | null | undefined) => {
    if (mine !== undefined) client.setQueryData(reviewKeys.mine(bookId), mine)
    return Promise.all([
      client.invalidateQueries({ queryKey: reviewKeys.lists(bookId) }),
      client.invalidateQueries({ queryKey: bookKeys.detail(bookId) }),
      // Book lists show ratings too. Marked stale without a request; they reload when next opened.
      client.invalidateQueries({ queryKey: bookKeys.lists, refetchType: 'none' }),
    ])
  }
}

export function useSaveReview(bookId: number) {
  const changed = useReviewChanged(bookId)
  return useMutation({
    mutationFn: async (input: { rating: number; comment: string }) =>
      (await api.put<Review>(`/books/${bookId}/reviews/mine`, input)).data,
    onSuccess: (review) => changed(review),
  })
}

/** `own`: the signed-in user is deleting their own review (as opposed to an admin moderating). */
export function useDeleteReview(bookId: number, own: boolean) {
  const changed = useReviewChanged(bookId)
  return useMutation({
    mutationFn: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => changed(own ? null : undefined),
  })
}
