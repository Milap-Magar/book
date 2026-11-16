import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Panel } from '@/components/Clay'
import { DownloadButtons } from '@/components/DownloadButtons'
import { Badge, Stars } from '@/components/Misc'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { requestBookDownload, useBook } from '@/features/books/api'
import { BookCover } from '@/features/books/BookCard'
import { useResources } from '@/features/resources/api'
import { ResourceList } from '@/features/resources/ResourceList'
import { ReviewSection } from '@/features/reviews/ReviewSection'
import { errorStatus, isMissingEndpoint } from '@/lib/api'
import { features } from '@/lib/features'
import { useSession } from '@/lib/session'

function BookResources({ bookId }: { bookId: number }) {
  const { status } = useSession()
  const resources = useResources({ bookId, size: 10 })

  // No resources endpoint on the server yet: leave the section out instead of showing an error.
  if (isMissingEndpoint(resources.error)) return null

  return (
    <section aria-labelledby="resources-heading" className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="resources-heading" className="text-2xl">
          Study resources
        </h2>
        {status === 'authenticated' && (
          <Link to={`/uploads/new?bookId=${bookId}`} className={buttonClass('secondary', 'sm')}>
            Upload notes for this book
          </Link>
        )}
      </div>
      <QueryState
        query={resources}
        isEmpty={(data) => data.content.length === 0}
        empty={<EmptyState title="No resources yet" hint="Notes and past papers shared for this book will appear here." />}
      >
        {(data) => <ResourceList resources={data.content} />}
      </QueryState>
    </section>
  )
}

/** One fact about the book, pressed into the card. */
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="clay-well px-4 py-2.5">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="font-bold">{children}</dd>
    </div>
  )
}

const detailSkeleton = (
  <div role="status" aria-label="Loading book" className="clay-lg grid gap-8 p-6 sm:grid-cols-[minmax(0,240px)_1fr] sm:p-9">
    <Skeleton className="aspect-[2/3] w-full max-w-[240px] rounded-[1.5rem]" />
    <div>
      <Skeleton className="h-6 w-28 rounded-full" />
      <Skeleton className="mt-4 h-10 w-4/5" />
      <Skeleton className="mt-3 h-5 w-1/3" />
      <Skeleton className="mt-8 h-14 w-full max-w-sm" />
    </div>
  </div>
)

export function BookDetailPage() {
  const id = Number(useParams().id)
  const book = useBook(id)

  if (!Number.isFinite(id) || (book.isError && errorStatus(book.error) === 404 && !isMissingEndpoint(book.error))) {
    return (
      <EmptyState
        title="Book not found"
        hint="It may have been removed."
        action={
          <Link to="/books" className={buttonClass('secondary')}>
            Browse books
          </Link>
        }
      />
    )
  }

  return (
    <>
      <Link to="/books" className={buttonClass('ghost', 'sm', 'mb-4 -ml-2')}>
        <span aria-hidden="true">←</span> All books
      </Link>

      <QueryState query={book} loading={detailSkeleton}>
        {(data) => (
          <article>
            <div className="clay-lg grid gap-8 p-6 sm:grid-cols-[minmax(0,240px)_1fr] sm:p-9">
              {/* The cover stands in a pressed-in niche, like a book on display. */}
              <div className="clay-well grid place-items-center self-start p-6">
                <BookCover book={data} eager className="max-w-[200px]" />
              </div>

              <div className="min-w-0">
                {data.category && (
                  <Link to={`/books?category=${data.category.slug}`} className="inline-block rounded-full">
                    <Badge>{data.category.name}</Badge>
                  </Link>
                )}
                <h1 className="mt-2 text-title">{data.title}</h1>
                <p className="mt-1 text-lg text-muted">by {data.author}</p>

                <div className="clay-pill mt-4 inline-flex items-center gap-2 px-3.5 py-1.5">
                  {data.ratingCount > 0 ? (
                    <>
                      <Stars value={data.ratingAvg} count={data.ratingCount} />
                      <span className="text-sm font-bold">{data.ratingAvg.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-muted">Not rated yet</span>
                  )}
                </div>

                {(data.publisher || data.publishedYear || data.isbn) && (
                  <dl className="mt-5 flex flex-wrap gap-2.5 text-sm">
                    {data.publisher && <Fact label="Publisher">{data.publisher}</Fact>}
                    {data.publishedYear && <Fact label="Published">{data.publishedYear}</Fact>}
                    {data.isbn && <Fact label="ISBN">{data.isbn}</Fact>}
                  </dl>
                )}

                <div className="mt-6">
                  {features.files && data.hasFile ? (
                    <DownloadButtons request={(disposition) => requestBookDownload(data.id, disposition)} />
                  ) : (
                    <p className="text-sm font-semibold text-muted">
                      {features.files ? 'No file is available for this book yet.' : 'Reading and downloading in the browser are on the way.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {data.description && (
              <Panel title="About this book" className="mt-6">
                <p className="max-w-[75ch] whitespace-pre-line text-ink/80">{data.description}</p>
              </Panel>
            )}

            {features.files && <BookResources bookId={data.id} />}
            <ReviewSection bookId={data.id} ratingCount={data.ratingCount} />
          </article>
        )}
      </QueryState>
    </>
  )
}
