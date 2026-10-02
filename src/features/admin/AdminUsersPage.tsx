import { Badge, PageHeader } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { useAdminUsers, useUpdateUser } from '@/features/admin/api'
import { formatDate } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useListParams } from '@/lib/useListParams'
import type { Role } from '@/types/api'

export function AdminUsersPage() {
  const { user: me } = useSession()
  const { page, get, set } = useListParams()
  const search = get('search')
  const users = useAdminUsers({ search, page, size: 20 })
  const update = useUpdateUser()

  return (
    <>
      <PageHeader title="Users" />
      <div className="mb-4 max-w-sm">
        <SearchInput label="Search users" placeholder="Search by name or email" value={search} onChange={(value) => set({ search: value })} />
      </div>
      <FormError error={update.error} />

      <QueryState query={users} isEmpty={(data) => data.content.length === 0} empty={<EmptyState title="No users found" />}>
        {(data) => (
          <>
            <div className="overflow-x-auto clay">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-xs text-ink/60 uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Name</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Joined</th>
                    <th scope="col" className="px-4 py-3">Role</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.content.map((user) => {
                    // The backend refuses self-demotion and self-disable (409); don't offer them.
                    const isMe = user.id === me?.id
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 font-medium">
                          {user.displayName} {isMe && <span className="font-normal text-ink/50">(you)</span>}
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <select
                            aria-label={`Role for ${user.displayName}`}
                            className="clay-input clay-input-sm"
                            value={user.role}
                            disabled={isMe || update.isPending}
                            onChange={(event) => update.mutate({ id: user.id, role: event.target.value as Role })}
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge tone={user.enabled ? 'green' : 'red'}>{user.enabled ? 'Active' : 'Disabled'}</Badge>
                          {!isMe && (
                            <button
                              type="button"
                              className="ml-3 text-brand-700 underline disabled:opacity-60"
                              disabled={update.isPending}
                              onClick={() => update.mutate({ id: user.id, enabled: !user.enabled })}
                            >
                              {user.enabled ? 'Disable' : 'Enable'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
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
