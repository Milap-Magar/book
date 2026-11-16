import { Button } from '@/components/Button'
import { Avatar, TableCard, Th, Toolbar } from '@/components/Clay'
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
      <PageHeader icon="user" tone="peach" title="Users" subtitle={users.data ? `${users.data.totalElements} accounts` : undefined} />
      <Toolbar className="max-w-md">
        <SearchInput label="Search users" placeholder="Search by name or email" value={search} onChange={(value) => set({ search: value })} />
      </Toolbar>
      <div className="mb-4 empty:hidden">
        <FormError error={update.error} />
      </div>

      <QueryState query={users} isEmpty={(data) => data.content.length === 0} empty={<EmptyState title="No users found" />}>
        {(data) => (
          <div className={users.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
            <TableCard>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Joined</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((user) => {
                  // The backend refuses self-demotion and self-disable (409); don't offer them.
                  const isMe = user.id === me?.id
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={user.displayName} seed={user.id} />
                          <div className="min-w-0">
                            <p className="font-bold">
                              {user.displayName} {isMe && <span className="font-normal text-muted">(you)</span>}
                            </p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td>
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
                      <td>
                        <Badge tone={user.enabled ? 'green' : 'red'}>{user.enabled ? 'Active' : 'Disabled'}</Badge>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        {!isMe && (
                          <Button
                            variant={user.enabled ? 'ghostDanger' : 'secondary'}
                            size="sm"
                            disabled={update.isPending}
                            onClick={() => update.mutate({ id: user.id, enabled: !user.enabled })}
                          >
                            {user.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </TableCard>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </div>
        )}
      </QueryState>
    </>
  )
}
