import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { EmptyState, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useBooks } from '@/features/books/api'
import { BookCover, BookGrid } from '@/features/books/BookCard'
import { useCategories } from '@/features/categories/api'

const CHIP_TINTS = ['bg-mint', 'bg-peach', 'bg-sky', 'bg-pink', 'bg-butter', 'bg-brand-100']

// Where the three hero covers sit: fanned out, overlapping, each tilted a little.
const FAN = ['-rotate-12 translate-x-10 translate-y-4', 'z-10 -translate-y-2', 'rotate-12 -translate-x-10 translate-y-4']

export function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const latest = useBooks({ sort: 'createdAt,desc', size: 10 })
  const topRated = useBooks({ sort: 'ratingAvg,desc', size: 3 })
  const categories = useCategories()

  return (
    <>
      <section className="clay relative overflow-hidden bg-brand-600 px-6 py-12 text-white [--clay-tint:108_77_230] sm:px-12 sm:py-14">
        {/* Decorative clay balls. */}
        <span aria-hidden="true" className="clay-sm absolute -top-14 -left-14 size-28 rounded-full bg-pink [--clay-tint:190_60_120]" />
        <span aria-hidden="true" className="clay-sm absolute right-10 -bottom-12 size-24 lg:right-1/3 rounded-full bg-butter [--clay-tint:170_130_20]" />
        <span aria-hidden="true" className="clay-sm absolute top-6 right-8 hidden size-12 rounded-full bg-mint [--clay-tint:30_140_100] sm:block" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className="text-4xl leading-[1.1] sm:text-5xl">Books and notes, shared by students.</h1>
            <p className="mt-4 max-w-md text-lg text-brand-100">
              Read and download course books, and share the notes and past papers that helped you.
            </p>
            <form
              role="search"
              className="mt-8 flex max-w-md gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                const query = search.trim()
                void navigate(query ? `/books?search=${encodeURIComponent(query)}` : '/books')
              }}
            >
              <input
                type="search"
                aria-label="Search books"
                placeholder="Search by title or author"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="clay-input block w-full text-ink placeholder:text-ink/40"
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          </div>

          {/* Purely decorative, so it is hidden from screen readers and not focusable. */}
          {topRated.data && topRated.data.content.length === 3 && (
            <div aria-hidden="true" className="hidden justify-center lg:flex">
              {topRated.data.content.map((book, index) => (
                <BookCover key={book.id} book={book} className={`w-36 [--clay-tint:30_20_80] ${FAN[index]}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories are a nice-to-have here: if they fail to load, the page works without them. */}
      {categories.data && categories.data.length > 0 && (
        <section aria-labelledby="categories-heading" className="mt-12">
          <h2 id="categories-heading" className="mb-4 text-2xl">
            Browse by category
          </h2>
          <ul className="flex flex-wrap gap-3">
            {categories.data.map((category, index) => (
              <li key={category.id}>
                <Link
                  to={`/books?category=${category.slug}`}
                  className={`clay-sm clay-lift block px-5 py-2.5 text-sm font-bold ${CHIP_TINTS[index % CHIP_TINTS.length]}`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="latest-heading" className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="latest-heading" className="text-2xl">
            Recently added
          </h2>
          <Link to="/books" className={buttonClass('ghost', 'sm')}>
            View all books
          </Link>
        </div>
        <QueryState
          query={latest}
          isEmpty={(data) => data.content.length === 0}
          empty={<EmptyState title="No books yet" hint="Books added by an admin will appear here." />}
        >
          {(data) => <BookGrid books={data.content} />}
        </QueryState>
      </section>
    </>
  )
}
