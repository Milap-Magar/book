import { ClayBook } from '@/components/clay/ClayBook'
import { Mallow } from '@/components/illustrations/Mallow'
import type { BookSummary } from '@/types/api'

type Cover = Pick<BookSummary, 'id' | 'title' | 'coverUrl'>

// Shown until the real covers arrive, and for good if the API has no books yet.
const DRAWN: Cover[] = [
  { id: 0, title: 'Algorithms', coverUrl: null },
  { id: 5, title: 'Calculus, made soft', coverUrl: null },
  { id: 3, title: 'Lab notes', coverUrl: null },
]

// Fanned out, overlapping, each tilted a little. The tilt uses the `rotate` property and the
// float animation uses `transform`, so the two never overwrite each other.
const FAN = [
  'left-[4%] top-[16%] w-[34%] -rotate-12 animate-float-slow',
  'left-[30%] top-[2%] z-10 w-[38%] rotate-2 animate-float',
  'left-[60%] top-[18%] w-[34%] rotate-13 animate-float-slow [animation-delay:-3s]',
]

/** The hero illustration: three clay books on a shelf, with Mallow sitting in front. Decorative. */
export function HeroShelf({ books }: { books?: Cover[] }) {
  const covers = books && books.length === 3 ? books : DRAWN
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[10/9] w-full max-w-md lg:max-w-none">
      <span className="clay-blob tint-pink absolute top-0 left-0 size-[13%] animate-float bg-pink" />
      <span className="clay-blob tint-butter absolute top-[8%] right-[2%] size-[9%] animate-float-slow bg-butter" />
      <span className="clay-blob tint-mint absolute bottom-[22%] left-[-3%] size-[10%] animate-float-slow bg-mint [animation-delay:-4s]" />

      {covers.map((book, index) => (
        <div key={book.id} className={`absolute ${FAN[index]}`}>
          <ClayBook book={book} eager className="tint-ink" />
        </div>
      ))}

      {/* The shelf */}
      <div className="clay tint-peach absolute inset-x-[2%] bottom-[8%] z-20 h-[9%] rounded-full bg-[#ffe9d6]" />
      <Mallow className="absolute right-[3%] bottom-[10%] z-30 w-[32%]" />
    </div>
  )
}
