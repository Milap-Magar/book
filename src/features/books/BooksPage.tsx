import { Button } from '@/components/Button'
import { PageHeader } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { BookGridSkeleton } from '@/components/Skeleton'
import { EmptyState, QueryState } from '@/components/States'
import { useBooks } from '@/features/books/api'
import { BookGrid } from '@/features/books/BookCard'
import { useCategories } from '@/features/categories/api'
import { useListParams } from '@/lib/useListParams'

// Must match the backend's sort whitelist.
const SORTS = [
  { value: 'createdAt,desc', label: 'Newest' },
  { value: 'title,asc', label: 'Title A–Z' },
  { value: 'ratingAvg,desc', label: 'Top rated' },
  { value: 'publishedYear,desc', label: 'Year published' },
]

const selectClass = 'clay-input'

/** Also the search results page: /books?search=java&category=programming&sort=title,asc&page=1 */
export function BooksPage() {
  const { page, get, set } = useListParams()
  const search = get('search')
  const category = get('category')
  const sort = get('sort') || SORTS[0].value

  const books = useBooks({ search, category, sort, page, size: 20 })
  const categories = useCategories()
  const filtered = search !== '' || category !== ''

  return (
    <>
      <PageHeader
        title="Books"
        subtitle={books.data ? `${books.data.totalElements} ${books.data.totalElements === 1 ? 'book' : 'books'}` : undefined}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <SearchInput
          label="Search books"
          placeholder="Search by title or author"
          value={search}
          onChange={(value) => set({ search: value })}
        />
        <select aria-label="Category" className={selectClass} value={category} onChange={(event) => set({ category: event.target.value })}>
          <option value="">All categories</option>
          {categories.data?.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select aria-label="Sort by" className={selectClass} value={sort} onChange={(event) => set({ sort: event.target.value })}>
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        query={books}
        loading={<BookGridSkeleton />}
        isEmpty={(data) => data.content.length === 0}
        empty={
          filtered ? (
            <EmptyState
              title="No books match your search"
              hint="Try a different word or remove a filter."
              action={
                <Button variant="secondary" onClick={() => set({ search: '', category: '' })}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState title="No books yet" hint="Books added by an admin will appear here." />
          )
        }
      >
        {(data) => (
          // Dimmed while the next page loads; the previous page stays visible.
          <div className={books.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
            <BookGrid books={data.content} />
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </div>
        )}
      </QueryState>
    </>
  )
}
