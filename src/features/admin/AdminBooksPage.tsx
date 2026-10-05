import { Link } from 'react-router'
import { PageHeader } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useBooks, useDeleteBook } from '@/features/books/api'
import { useListParams } from '@/lib/useListParams'

export function AdminBooksPage() {
  const { page, get, set } = useListParams()
  const search = get('search')
  const books = useBooks({ search, page, size: 20, sort: 'createdAt,desc' })
  const remove = useDeleteBook()

  return (
    <>
      <PageHeader
        title="Books"
        action={
          <Link to="/admin/books/new" className={buttonClass('primary')}>
            Add a book
          </Link>
        }
      />
      <div className="mb-4 max-w-sm">
        <SearchInput label="Search books" placeholder="Search by title or author" value={search} onChange={(value) => set({ search: value })} />
      </div>
      <FormError error={remove.error} />

      <QueryState
        query={books}
        isEmpty={(data) => data.content.length === 0}
        empty={<EmptyState title={search ? 'No books match your search' : 'No books yet'} />}
      >
        {(data) => (
          <>
            <div className="overflow-x-auto clay">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-xs text-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Title</th>
                    <th scope="col" className="px-4 py-3">Author</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">File</th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.content.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-3">
                        <Link to={`/books/${book.id}`} className="font-medium hover:underline">
                          {book.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{book.author}</td>
                      <td className="px-4 py-3">{book.category?.name ?? '–'}</td>
                      <td className="px-4 py-3">{book.hasFile ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link to={`/admin/books/${book.id}/edit`} className="text-brand-700 underline">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="ml-4 text-red-700 underline disabled:opacity-60"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (window.confirm(`Delete "${book.title}"? This cannot be undone.`)) remove.mutate(book.id)
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </>
        )}
      </QueryState>
    </>
  )
}
