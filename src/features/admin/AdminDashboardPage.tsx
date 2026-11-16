import { ActionTile, StatTile } from '@/components/Clay'
import { PageHeader } from '@/components/Misc'
import { QueryState } from '@/components/States'
import { TileGridSkeleton } from '@/components/Skeleton'
import { useAdminStats } from '@/features/admin/api'
import { useCategories } from '@/features/categories/api'
import { features } from '@/lib/features'

export function AdminDashboardPage() {
  const stats = useAdminStats()
  // Already in the cache on most visits (30 minutes fresh); only its length is used here.
  const categories = useCategories()

  return (
    <>
      <PageHeader icon="chart" title="Admin overview" subtitle="The library at a glance." />
      <QueryState query={stats} loading={<TileGridSkeleton count={3} />}>
        {(data) => (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Books" value={data.books} to="/admin/books" icon="book" tone="brand" />
            <StatTile label="Subjects" value={categories.data?.length} to="/admin/categories" icon="flask" tone="mint" />
            <StatTile label="Users" value={data.users} to="/admin/users" icon="user" tone="peach" />
            {/* The API reports zeros for these until it has file storage, so they are left out until then. */}
            {features.files && (
              <>
                <StatTile label="Waiting for review" value={data.resources.pending} to="/admin/resources" icon="clock" tone="butter" />
                <StatTile label="Approved resources" value={data.resources.approved} to="/admin/resources?status=APPROVED" icon="shield" tone="sky" />
                <StatTile label="Rejected resources" value={data.resources.rejected} to="/admin/resources?status=REJECTED" icon="notes" tone="pink" />
                <StatTile label="Downloads" value={data.downloads} icon="download" tone="mint" />
              </>
            )}
          </div>
        )}
      </QueryState>

      <h2 className="mt-10 mb-4 text-2xl">Shortcuts</h2>
      <ul className="grid gap-5 sm:grid-cols-3">
        <li>
          <ActionTile to="/admin/books/new" label="Add a book" hint="Title, author, subject" icon="book" tone="brand" />
        </li>
        <li>
          <ActionTile to="/admin/categories" label="Manage subjects" hint="Add, rename, remove" icon="quill" tone="sky" />
        </li>
        <li>
          <ActionTile to="/admin/users" label="Manage users" hint="Roles and access" icon="user" tone="peach" />
        </li>
      </ul>
    </>
  )
}
