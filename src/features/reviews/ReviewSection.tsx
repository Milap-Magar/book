import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/Button'
import { Avatar, ConfirmButton } from '@/components/Clay'
import { Stars } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useDeleteReview, useMyReview, useReviews, useSaveReview } from '@/features/reviews/api'
import { isMissingEndpoint } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useSession } from '@/lib/session'
import type { Review } from '@/types/api'

const STAR_PATH = 'M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z'

function ReviewForm({ bookId, existing }: { bookId: number; existing: Review | null }) {
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const save = useSaveReview(bookId)
  const remove = useDeleteReview(bookId, true)

  return (
    <form
      className="clay p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault()
        if (rating > 0) save.mutate({ rating, comment: comment.trim() })
      }}
    >
      <p className="mb-3 font-display text-lg font-medium">{existing ? 'Your review' : 'Rate this book'}</p>

      {/* Five clay keys: the chosen ones stay pressed in. */}
      <div role="radiogroup" aria-label="Rating" className="mb-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const on = star <= rating
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
              onClick={() => setRating(star)}
              className={`grid size-11 place-items-center rounded-2xl transition-transform active:scale-95 ${
                on ? 'clay-pressed tint-butter bg-butter' : 'clay-sm hover:-translate-y-0.5'
              }`}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className={`size-6 ${on ? 'fill-amber-500' : 'fill-brand-200'}`}>
                <path d={STAR_PATH} />
              </svg>
            </button>
          )
        })}
      </div>

      <textarea
        aria-label="Comment (optional)"
        placeholder="What did you think? (optional)"
        rows={3}
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="mb-3 block w-full clay-input placeholder:text-muted/70"
      />

      <FormError error={save.error ?? remove.error} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="submit" loading={save.isPending} disabled={rating === 0}>
          {existing ? 'Update review' : 'Post review'}
        </Button>
        {existing && <ConfirmButton size="md" loading={remove.isPending} onConfirm={() => remove.mutate(existing.id)} />}
      </div>
    </form>
  )
}

function ReviewCard({ review, bookId }: { review: Review; bookId: number }) {
  const { user } = useSession()
  const remove = useDeleteReview(bookId, false)

  return (
    <li className="clay-sm p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar name={review.user.displayName} seed={review.user.id} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div>
              <p className="font-bold">{review.user.displayName}</p>
              <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
            </div>
            <Stars value={review.rating} />
          </div>
          {review.comment && <p className="mt-2 text-sm whitespace-pre-line text-ink/80">{review.comment}</p>}

          {/* Authors delete their own review in the form above; this is the admin's moderation control. */}
          {user?.role === 'ADMIN' && review.user.id !== user.id && (
            <div className="mt-2">
              <ConfirmButton label="Remove review" confirmLabel="Yes, remove" loading={remove.isPending} onConfirm={() => remove.mutate(review.id)} />
              <FormError error={remove.error} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

interface ReviewSectionProps {
  bookId: number
  /** From the book itself. Zero means there is nothing to fetch, so nothing is fetched. */
  ratingCount: number
}

export function ReviewSection({ bookId, ratingCount }: ReviewSectionProps) {
  const { status } = useSession()
  const location = useLocation()
  const [page, setPage] = useState(0)

  const hasReviews = ratingCount > 0
  const signedIn = status === 'authenticated'
  const reviews = useReviews(bookId, page, hasReviews)
  // If nobody has reviewed the book, this user has not either: no need to ask.
  const mine = useMyReview(bookId, signedIn && hasReviews)

  // No reviews endpoint on the server yet: leave the section out instead of showing an error.
  if (isMissingEndpoint(reviews.error)) return null

  return (
    <section aria-labelledby="reviews-heading" className="mt-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 id="reviews-heading" className="text-2xl">
          Reviews
        </h2>
        {hasReviews && <span className="clay-pill px-3 py-0.5 text-sm font-bold text-muted">{ratingCount}</span>}
      </div>

      <div className="mb-6">
        {status === 'anonymous' && (
          <div className="clay-well flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <p className="font-semibold">Read it? Tell the next student what you thought.</p>
            <Link to="/login" state={{ from: location.pathname }} className={buttonClass('secondary', 'sm')}>
              Log in to review
            </Link>
          </div>
        )}
        {/* The key remounts the form when the saved review changes, so its fields reset to the new values. */}
        {signedIn && (!hasReviews || mine.isSuccess) && (
          <ReviewForm key={mine.data?.updatedAt ?? 'new'} bookId={bookId} existing={mine.data ?? null} />
        )}
        {signedIn && mine.isError && <FormError error={mine.error} />}
      </div>

      {hasReviews ? (
        <QueryState
          query={reviews}
          isEmpty={(data) => data.content.length === 0}
          empty={<EmptyState title="No reviews yet" hint="Be the first to review this book." />}
        >
          {(data) => (
            <div className={reviews.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
              <ul className="space-y-3">
                {data.content.map((review) => (
                  <ReviewCard key={review.id} review={review} bookId={bookId} />
                ))}
              </ul>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </div>
          )}
        </QueryState>
      ) : (
        <EmptyState title="No reviews yet" hint="Be the first to review this book." />
      )}
    </section>
  )
}
