import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Input } from '@/components/Field'
import { ClayIcon, Glyph, type GlyphName, type Tone } from '@/components/illustrations/ClayIcon'
import { WelcomeArt } from '@/components/illustrations/Scenes'
import { PageHeader, StatusBadge } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useMyDownloads, useUpdateProfile } from '@/features/account/api'
import { useMyResources } from '@/features/resources/api'
import { applyFieldErrors } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useListParams } from '@/lib/useListParams'

interface StatTileProps {
  label: string
  count: number | undefined
  to: string
  icon: GlyphName
  tone: Tone
}

function StatTile({ label, count, to, icon, tone }: StatTileProps) {
  return (
    <Link to={to} className="clay clay-lift flex items-center gap-4 p-5">
      <ClayIcon name={icon} tone={tone} size="md" />
      <div>
        <div className="font-display text-4xl leading-none font-semibold">{count ?? <Skeleton className="h-9 w-10" />}</div>
        <p className="mt-1 text-sm font-bold text-muted">{label}</p>
      </div>
    </Link>
  )
}

function Panel({ title, to, children }: { title: string; to: string; children: ReactNode }) {
  return (
    <section className="clay p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl">{title}</h2>
        <Link to={to} className={buttonClass('ghost', 'sm')}>
          View all
        </Link>
      </div>
      {children}
    </section>
  )
}

const panelLoading = (
  <div role="status" aria-label="Loading" className="space-y-2">
    <Skeleton className="h-12" />
    <Skeleton className="h-12" />
    <Skeleton className="h-12" />
  </div>
)

const ACTIONS: { to: string; label: string; hint: string; icon: GlyphName; tone: Tone }[] = [
  { to: '/books', label: 'Browse books', hint: 'Search the library', icon: 'search', tone: 'sky' },
  { to: '/resources', label: 'Notes and papers', hint: 'Shared by students', icon: 'notes', tone: 'pink' },
  { to: '/profile', label: 'Edit profile', hint: 'Change your name', icon: 'user', tone: 'peach' },
]

export function DashboardPage() {
  const { user } = useSession()
  // The five newest rows; `totalElements` on the same response gives the totals.
  const uploads = useMyResources({ size: 5 })
  const downloads = useMyDownloads({ size: 5 })
  // size=1: only the total is needed here, not the rows.
  const pending = useMyResources({ size: 1, status: 'PENDING' })

  return (
    <>
      <section className="clay-lg tint-brand relative flex flex-wrap items-center gap-x-8 gap-y-4 overflow-hidden bg-brand-600 px-6 py-7 text-white sm:px-10">
        <span aria-hidden="true" className="clay-blob tint-pink absolute -top-8 right-1/4 size-20 bg-pink" />
        <span aria-hidden="true" className="clay-blob tint-butter absolute -bottom-6 left-1/2 size-14 bg-butter" />
        <WelcomeArt className="relative w-28 shrink-0 sm:w-36" />
        <div className="relative min-w-0 flex-1 basis-64">
          <h1 className="text-title">Hello, {user?.displayName ?? 'there'}</h1>
          <p className="mt-1 text-lg text-brand-100">Here is what is on your shelf.</p>
        </div>
        <Link to="/uploads/new" className={buttonClass('secondary', 'lg', 'relative')}>
          <Glyph name="upload" className="size-5" />
          Upload a resource
        </Link>
      </section>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <StatTile label="My uploads" count={uploads.data?.totalElements} to="/uploads" icon="notes" tone="brand" />
        <StatTile label="Waiting for review" count={pending.data?.totalElements} to="/uploads" icon="clock" tone="butter" />
        <StatTile label="My downloads" count={downloads.data?.totalElements} to="/downloads" icon="download" tone="mint" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Recent uploads" to="/uploads">
          <QueryState
            query={uploads}
            loading={panelLoading}
            isEmpty={(data) => data.content.length === 0}
            empty={
              <EmptyState
                title="Nothing shared yet"
                hint="Upload notes or a past paper to help the next class."
                action={
                  <Link to="/uploads/new" className={buttonClass('secondary')}>
                    Upload a resource
                  </Link>
                }
              />
            }
          >
            {(data) => (
              <ul className="space-y-2">
                {data.content.map((resource) => (
                  <li key={resource.id} className="clay-well flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{resource.title}</p>
                      <p className="text-xs text-muted">{formatDate(resource.createdAt)}</p>
                    </div>
                    <StatusBadge status={resource.status} />
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>

        <Panel title="Recent downloads" to="/downloads">
          <QueryState
            query={downloads}
            loading={panelLoading}
            isEmpty={(data) => data.content.length === 0}
            empty={
              <EmptyState
                title="No downloads yet"
                hint="Books and notes you open will be listed here."
                action={
                  <Link to="/books" className={buttonClass('secondary')}>
                    Browse books
                  </Link>
                }
              />
            }
          >
            {(data) => (
              <ul className="space-y-2">
                {data.content.map((item) => (
                  <li key={item.id} className="clay-well flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      {item.type === 'BOOK' ? (
                        <Link to={`/books/${item.targetId}`} className="block truncate font-bold text-brand-700 hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        <p className="truncate font-bold">{item.title}</p>
                      )}
                      <p className="text-xs text-muted">{item.type === 'BOOK' ? 'Book' : 'Resource'}</p>
                    </div>
                    <span className="text-sm text-muted">{formatDate(item.downloadedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {ACTIONS.map((action) => (
          <li key={action.to}>
            <Link to={action.to} className="clay-sm clay-lift flex items-center gap-3 p-4">
              <ClayIcon name={action.icon} tone={action.tone} size="sm" />
              <span>
                <span className="block font-bold">{action.label}</span>
                <span className="block text-xs text-muted">{action.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
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
        <p className="text-xs text-muted">
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
                    <p className="text-xs text-muted">{item.type === 'BOOK' ? 'Book' : 'Resource'}</p>
                  </div>
                  <span className="text-sm text-muted">{formatDate(item.downloadedAt)}</span>
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
