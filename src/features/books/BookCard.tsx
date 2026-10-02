import { Link } from 'react-router'
import { Stars } from '@/components/Misc'
import type { BookSummary } from '@/types/api'

// Books without a cover get one of these, picked by id so a book always keeps its colour.
const PLACEHOLDER_TINTS = ['bg-mint', 'bg-peach', 'bg-sky', 'bg-pink', 'bg-butter', 'bg-brand-100']

// A cover is a thick clay slab: a soft drop shadow underneath...
const slab = 'relative aspect-[2/3] w-full overflow-hidden rounded-[1.4rem] shadow-[0_18px_26px_-16px_rgb(var(--clay-tint)/0.75)]'
// ...and a highlight along the top edge with shading along the bottom. This is a separate layer
// on top, because an inset shadow on the slab itself would be hidden behind the cover image.
const gloss =
  'pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-9px_10px_-6px_rgb(0_0_0/0.22),inset_0_7px_8px_-5px_rgb(255_255_255/0.65),inset_0_0_0_1px_rgb(0_0_0/0.05)]'

interface BookCoverProps {
  book: Pick<BookSummary, 'id' | 'title' | 'coverUrl'>
  className?: string
}

export function BookCover({ book, className = '' }: BookCoverProps) {
  return (
    <div aria-hidden="true" className={`${slab} ${PLACEHOLDER_TINTS[book.id % PLACEHOLDER_TINTS.length]} ${className}`}>
      {book.coverUrl ? (
        <img src={book.coverUrl} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        // No cover uploaded: the title on a pastel slab instead of a broken image.
        <div className="flex size-full items-center justify-center p-4 text-center font-display font-medium text-ink/80">
          <span className="line-clamp-4">{book.title}</span>
        </div>
      )}
      <div className={gloss} />
    </div>
  )
}

export function BookCard({ book }: { book: BookSummary }) {
  return (
    <Link to={`/books/${book.id}`} className="group clay clay-lift block h-full p-3 pb-4">
      <BookCover book={book} />
      <h3 className="mt-3 line-clamp-2 px-1 text-base leading-snug font-medium group-hover:text-brand-700">{book.title}</h3>
      <p className="truncate px-1 text-sm text-ink/60">{book.author}</p>
      <div className="mt-1 flex min-h-5 items-center justify-between gap-2 px-1">
        {book.ratingCount > 0 ? <Stars value={book.ratingAvg} count={book.ratingCount} /> : <span className="text-xs text-ink/40">No ratings yet</span>}
      </div>
    </Link>
  )
}

export function BookGrid({ books }: { books: BookSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  )
}
