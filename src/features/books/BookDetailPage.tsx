import { Link, useParams } from 'react-router'
import { DownloadButtons } from '@/components/DownloadButtons'
import { Badge, Stars } from '@/components/Misc'
import { EmptyState, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { requestBookDownload, useBook } from '@/features/books/api'
import { BookCover } from '@/features/books/BookCard'
import { useResources } from '@/features/resources/api'
import { ResourceList } from '@/features/resources/ResourceList'
import { ReviewSection } from '@/features/reviews/ReviewSection'
import { errorStatus, isMissingEndpoint } from '@/lib/api'
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
    <QueryState query={book}>
      {(data) => (
        <article>
          <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
            <BookCover book={data} className="max-w-[220px]" />
            <div>
              {data.category && (
                <Link to={`/books?category=${data.category.slug}`}>
                  <Badge>{data.category.name}</Badge>
                </Link>
              )}
              <h1 className="mt-2 text-4xl leading-tight">{data.title}</h1>
              <p className="mt-1 text-lg text-ink/70">{data.author}</p>

              <div className="mt-3">
                {data.ratingCount > 0 ? (
                  <Stars value={data.ratingAvg} count={data.ratingCount} />
                ) : (
                  <span className="text-sm text-ink/50">Not rated yet</span>
                )}
              </div>

              <dl className="mt-5 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                {data.publisher && (
                  <>
                    <dt className="text-ink/50">Publisher</dt>
                    <dd>{data.publisher}</dd>
                  </>
                )}
                {data.publishedYear && (
                  <>
                    <dt className="text-ink/50">Published</dt>
                    <dd>{data.publishedYear}</dd>
                  </>
                )}
                {data.isbn && (
                  <>
                    <dt className="text-ink/50">ISBN</dt>
                    <dd>{data.isbn}</dd>
                  </>
                )}
              </dl>

              <div className="mt-6">
                {data.hasFile ? (
                  <DownloadButtons request={(disposition) => requestBookDownload(data.id, disposition)} />
                ) : (
                  <p className="text-sm text-ink/60">No file is available for this book yet.</p>
                )}
              </div>
            </div>
          </div>

          {data.description && (
            <section className="mt-10 max-w-3xl">
              <h2 className="mb-2 text-2xl">About this book</h2>
              <p className="whitespace-pre-line text-ink/80">{data.description}</p>
            </section>
          )}

          <BookResources bookId={data.id} />
          <ReviewSection bookId={data.id} />
        </article>
      )}
    </QueryState>
  )
}
