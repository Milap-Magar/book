import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/Button'
import { Stars } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { useDeleteReview, useMyReview, useReviews, useSaveReview } from '@/features/reviews/api'
import { isMissingEndpoint } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useSession } from '@/lib/session'
import type { Review } from '@/types/api'

function ReviewForm({ bookId, existing }: { bookId: number; existing: Review | null }) {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const save = useSaveReview(bookId)
  const remove = useDeleteReview(bookId)

  return (
    <form
      className="clay p-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (rating > 0) save.mutate({ rating, comment: comment.trim() })
      }}
    >
      <p className="mb-2 text-sm font-medium">{existing ? 'Your review' : 'Rate this book'}</p>

      <div role="radiogroup" aria-label="Rating" className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
            onClick={() => setRating(star)}
            className={`text-2xl leading-none ${star <= rating ? 'text-amber-500' : 'text-line hover:text-amber-300'}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        aria-label="Comment (optional)"
        placeholder="What did you think? (optional)"
        rows={3}
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="mb-3 block w-full clay-input"
      />

      <FormError error={save.error ?? remove.error} />
      <div className="mt-3 flex gap-2">
        <Button type="submit" size="sm" loading={save.isPending} disabled={rating === 0}>
          {existing ? 'Update review' : 'Post review'}
        </Button>
        {existing && (
          <Button variant="ghost" size="sm" loading={remove.isPending} onClick={() => remove.mutate(existing.id)}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}

export function ReviewSection({ bookId }: { bookId: number }) {
  const { status, user } = useSession()
  const location = useLocation()
  const [page, setPage] = useState(0)
  const reviews = useReviews(bookId, page)
  const mine = useMyReview(bookId, status === 'authenticated')
  const remove = useDeleteReview(bookId)

  // No reviews endpoint on the server yet: leave the section out instead of showing an error.
  if (isMissingEndpoint(reviews.error)) return null

  return (
    <section aria-labelledby="reviews-heading" className="mt-12">
      <h2 id="reviews-heading" className="mb-4 text-2xl">
        Reviews
      </h2>

      <div className="mb-6">
        {status === 'anonymous' && (
          <p className="text-sm text-ink/70">
            <Link to="/login" state={{ from: location.pathname }} className="font-medium text-brand-700 underline">
              Log in
            </Link>{' '}
            to rate and review this book.
          </p>
        )}
        {/* The key remounts the form when the saved review changes, so its fields reset to the new values. */}
        {status === 'authenticated' && mine.isSuccess && (
          <ReviewForm key={mine.data?.updatedAt ?? 'new'} bookId={bookId} existing={mine.data} />
        )}
      </div>

      <QueryState
        query={reviews}
        isEmpty={(data) => data.content.length === 0}
        empty={<EmptyState title="No reviews yet" hint="Be the first to review this book." />}
      >
        {(data) => (
          <>
            <ul className="divide-y divide-line">
              {data.content.map((review) => (
                <li key={review.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={review.rating} />
                    <span className="text-sm font-medium">{review.user.displayName}</span>
                    <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
                    {/* Authors delete their own review in the form above; this is the admin's moderation control. */}
                    {user?.role === 'ADMIN' && review.user.id !== user.id && (
                      <button
                        type="button"
                        className="text-xs text-red-700 underline"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm('Delete this review?')) remove.mutate(review.id)
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {review.comment && <p className="mt-2 text-sm whitespace-pre-line text-ink/80">{review.comment}</p>}
                </li>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </QueryState>
    </section>
  )
}
