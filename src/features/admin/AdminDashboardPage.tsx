import { Link } from 'react-router'
import { PageHeader } from '@/components/Misc'
import { QueryState } from '@/components/States'
import { useAdminStats } from '@/features/admin/api'

function StatCard({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="clay clay-lift block p-5">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold text-brand-700">{value}</p>
    </Link>
  )
}

export function AdminDashboardPage() {
  const stats = useAdminStats()

  return (
    <>
      <PageHeader title="Admin overview" />
      <QueryState query={stats}>
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Waiting for review" value={data.resources.pending} to="/admin/resources" />
            <StatCard label="Approved resources" value={data.resources.approved} to="/admin/resources?status=APPROVED" />
            <StatCard label="Rejected resources" value={data.resources.rejected} to="/admin/resources?status=REJECTED" />
            <StatCard label="Books" value={data.books} to="/admin/books" />
            <StatCard label="Users" value={data.users} to="/admin/users" />
            <StatCard label="Downloads" value={data.downloads} to="/admin" />
          </div>
        )}
      </QueryState>
    </>
  )
}
