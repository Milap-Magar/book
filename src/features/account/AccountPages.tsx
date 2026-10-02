import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Input } from '@/components/Field'
import { PageHeader } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useMyDownloads, useUpdateProfile } from '@/features/account/api'
import { useMyResources } from '@/features/resources/api'
import { applyFieldErrors } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useListParams } from '@/lib/useListParams'

function CountCard({ label, count, to }: { label: string; count: number | undefined; to: string }) {
  return (
    <Link to={to} className="clay clay-lift block p-5">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold text-brand-700">{count ?? '–'}</p>
    </Link>
  )
}

export function DashboardPage() {
  const { user } = useSession()
  // size=1: only the totals are needed here, not the rows.
  const uploads = useMyResources({ size: 1 })
  const pending = useMyResources({ size: 1, status: 'PENDING' })
  const downloads = useMyDownloads({ size: 1 })

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.displayName ?? 'there'}`}
        action={
          <Link to="/uploads/new" className={buttonClass('primary')}>
            Upload a resource
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <CountCard label="My uploads" count={uploads.data?.totalElements} to="/uploads" />
        <CountCard label="Waiting for review" count={pending.data?.totalElements} to="/uploads" />
        <CountCard label="My downloads" count={downloads.data?.totalElements} to="/downloads" />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/books" className={buttonClass('secondary')}>
          Browse books
        </Link>
        <Link to="/resources" className={buttonClass('secondary')}>
          Browse resources
        </Link>
        <Link to="/profile" className={buttonClass('secondary')}>
          Edit profile
        </Link>
      </div>
    </>
  )
}

const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'At least 2 characters').max(50, 'At most 50 characters'),
})
type ProfileValues = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user } = useSession()
  const update = useUpdateProfile()
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? '' },
  })

  if (!user) return null

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Profile" />
      <form
        noValidate
        className="space-y-4 clay p-6"
        onSubmit={form.handleSubmit((values) =>
          update.mutate(values, {
            onSuccess: (saved) => form.reset({ displayName: saved.displayName }),
            onError: (error) => applyFieldErrors(error, form.setError),
          }),
        )}
      >
        <Input label="Email" value={user.email} disabled readOnly hint="Your email cannot be changed." />
        <Input label="Name" error={form.formState.errors.displayName?.message} {...form.register('displayName')} />
        <p className="text-xs text-ink/60">
          {user.role === 'ADMIN' ? 'Administrator' : 'Member'} since {formatDate(user.createdAt)}
        </p>
        <FormError error={update.error} />
        {update.isSuccess && !form.formState.isDirty && (
          <p role="status" className="text-sm text-green-700">
            Saved.
          </p>
        )}
        <Button type="submit" loading={update.isPending} disabled={!form.formState.isDirty}>
          Save changes
        </Button>
      </form>
    </div>
  )
}

export function MyDownloadsPage() {
  const { page, set } = useListParams()
  const downloads = useMyDownloads({ page, size: 20 })

  return (
    <>
      <PageHeader title="My downloads" subtitle="Books and resources you have opened or downloaded." />
      <QueryState
        query={downloads}
        isEmpty={(data) => data.content.length === 0}
        empty={
          <EmptyState
            title="No downloads yet"
            action={
              <Link to="/books" className={buttonClass('secondary')}>
                Browse books
              </Link>
            }
          />
        }
      >
        {(data) => (
          <>
            <ul className="divide-y divide-line clay overflow-hidden">
              {data.content.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    {item.type === 'BOOK' ? (
                      <Link to={`/books/${item.targetId}`} className="font-medium text-brand-700 hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{item.title}</span>
                    )}
                    <p className="text-xs text-ink/60">{item.type === 'BOOK' ? 'Book' : 'Resource'}</p>
                  </div>
                  <span className="text-sm text-ink/60">{formatDate(item.downloadedAt)}</span>
                </li>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </>
        )}
      </QueryState>
    </>
  )
}
