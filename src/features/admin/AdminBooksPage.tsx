import { Link } from 'react-router'
import { ConfirmButton, TableCard, Th, Toolbar } from '@/components/Clay'
import { Badge, PageHeader, Stars } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { NEWEST_FIRST, PAGE_SIZE, useBooks, useDeleteBook } from '@/features/books/api'
import { features } from '@/lib/features'
import { useListParams } from '@/lib/useListParams'

export function AdminBooksPage() {
  const { page, get, set } = useListParams()
  const search = get('search')
  const books = useBooks({ search, page, size: PAGE_SIZE, sort: NEWEST_FIRST })
  const remove = useDeleteBook()

  return (
    <>
      <PageHeader
        icon="book"
        title="Books"
        action={
          <Link to="/admin/books/new" className={buttonClass('primary')}>
            Add a book
          </Link>
        }
      />
      <Toolbar className="max-w-md">
        <SearchInput label="Search books" placeholder="Search by title or author" value={search} onChange={(value) => set({ search: value })} />
      </Toolbar>
      <div className="mb-4 empty:hidden">
        <FormError error={remove.error} />
      </div>

      <QueryState
        query={books}
        isEmpty={(data) => data.content.length === 0}
        empty={<EmptyState title={search ? 'No books match your search' : 'No books yet'} />}
      >
        {(data) => (
          <div className={books.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
            <TableCard>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Author</Th>
                  <Th>Subject</Th>
                  <Th>Rating</Th>
                  {features.files && <Th>File</Th>}
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <Link to={`/books/${book.id}`} className="font-bold hover:text-brand-700 hover:underline">
                        {book.title}
                      </Link>
                    </td>
                    <td>{book.author}</td>
                    <td>{book.category ? <Badge>{book.category.name}</Badge> : '–'}</td>
                    <td className="whitespace-nowrap">
                      {book.ratingCount > 0 ? <Stars value={book.ratingAvg} count={book.ratingCount} /> : <span className="text-muted">–</span>}
                    </td>
                    {features.files && <td>{book.hasFile ? <Badge tone="green">Attached</Badge> : <Badge tone="amber">None</Badge>}</td>}
                    <td>
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <Link to={`/admin/books/${book.id}/edit`} className={buttonClass('secondary', 'sm')}>
                          Edit
                        </Link>
                        <ConfirmButton disabled={remove.isPending} onConfirm={() => remove.mutate(book.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableCard>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </div>
        )}
      </QueryState>
    </>
  )
}
