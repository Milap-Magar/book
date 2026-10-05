import { Link } from 'react-router'
import { ClayBook } from '@/components/clay/ClayBook'
import { Stars } from '@/components/Misc'
import type { BookSummary } from '@/types/api'

/** The cover on its own. Kept under this name for the pages that already use it. */
export { ClayBook as BookCover }

export function BookCard({ book }: { book: BookSummary }) {
  return (
    <Link to={`/books/${book.id}`} className="group clay clay-lift block h-full p-3.5 pb-4">
      <ClayBook book={book} />
      <h3 className="mt-3 line-clamp-2 px-1 text-base leading-snug font-medium group-hover:text-brand-700">{book.title}</h3>
      <p className="truncate px-1 text-sm text-muted">{book.author}</p>
      <div className="mt-1 flex min-h-5 items-center justify-between gap-2 px-1">
        {book.ratingCount > 0 ? <Stars value={book.ratingAvg} count={book.ratingCount} /> : <span className="text-xs text-muted">No ratings yet</span>}
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
