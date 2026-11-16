import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { ActionTile, Avatar, Notice, Panel, StatTile } from '@/components/Clay'
import { Input } from '@/components/Field'
import { Glyph, type GlyphName, type Tone } from '@/components/illustrations/ClayIcon'
import { WelcomeArt } from '@/components/illustrations/Scenes'
import { Badge, PageHeader, StatusBadge } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { BookGridSkeleton, Skeleton } from '@/components/Skeleton'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useMyDownloads, useUpdateProfile } from '@/features/account/api'
import { useLatestBooks } from '@/features/books/api'
import { BookGrid } from '@/features/books/BookCard'
import { useCategories } from '@/features/categories/api'
import { useMyResources } from '@/features/resources/api'
import { applyFieldErrors } from '@/lib/api'
import { features } from '@/lib/features'
import { formatDate } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useListParams } from '@/lib/useListParams'
import type { DownloadRecord } from '@/types/api'

const panelLoading = (
  <div role="status" aria-label="Loading" className="space-y-2">
    <Skeleton className="h-12" />
    <Skeleton className="h-12" />
    <Skeleton className="h-12" />
  </div>
)

const viewAll = (to: string) => (
  <Link to={to} className={buttonClass('ghost', 'sm')}>
    View all
  </Link>
)

const ACTIONS: { to: string; label: string; hint: string; icon: GlyphName; tone: Tone; needsFiles?: boolean }[] = [
  { to: '/books', label: 'Browse books', hint: 'Search the library', icon: 'search', tone: 'sky' },
  { to: '/genres', label: 'Pick a subject', hint: 'Start from a genre', icon: 'flask', tone: 'mint' },
  { to: '/resources', label: 'Notes and papers', hint: 'Shared by students', icon: 'notes', tone: 'pink', needsFiles: true },
  { to: '/profile', label: 'Edit profile', hint: 'Change your name', icon: 'user', tone: 'peach' },
]

/** Uploads and downloads. Only rendered when the API has file storage. */
function ActivityDashboard() {
  // The five newest rows; `totalElements` on the same response gives the totals.
  const uploads = useMyResources({ size: 5 })
  const downloads = useMyDownloads({ size: 5 })
  // size=1: only the total is needed here, not the rows.
  const pending = useMyResources({ size: 1, status: 'PENDING' })

  return (
    <>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <StatTile label="My uploads" value={uploads.data?.totalElements} to="/uploads" icon="notes" tone="brand" />
        <StatTile label="Waiting for review" value={pending.data?.totalElements} to="/uploads" icon="clock" tone="butter" />
        <StatTile label="My downloads" value={downloads.data?.totalElements} to="/downloads" icon="download" tone="mint" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Recent uploads" action={viewAll('/uploads')}>
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

        <Panel title="Recent downloads" action={viewAll('/downloads')}>
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
                  <DownloadRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>
      </div>
    </>
  )
}

/**
 * What the dashboard shows while the API has books, subjects and reviews but no files yet.
 * Both queries are the ones the landing page and the Books page use, so arriving here from
 * either costs the server nothing.
 */
function ShelfDashboard({ memberSince }: { memberSince: string }) {
  const books = useLatestBooks()
  const categories = useCategories()

  return (
    <>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <StatTile label="Books on the shelf" value={books.data?.totalElements} to="/books" icon="book" tone="brand" />
        <StatTile label="Subjects" value={categories.data?.length} to="/genres" icon="flask" tone="mint" />
        <StatTile label="Member since" value={<span className="text-2xl">{memberSince}</span>} to="/profile" icon="heart" tone="pink" />
      </div>

      <Panel title="New on the shelf" action={viewAll('/books')} className="mt-6">
        <QueryState
          query={books}
          loading={<BookGridSkeleton count={5} />}
          isEmpty={(data) => data.content.length === 0}
          empty={<EmptyState title="No books yet" hint="Books added by an admin will appear here." />}
        >
          {(data) => <BookGrid books={data.content.slice(0, 5)} />}
        </QueryState>
      </Panel>
    </>
  )
}

export function DashboardPage() {
  const { user } = useSession()

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
        {features.files ? (
          <Link to="/uploads/new" className={buttonClass('secondary', 'lg', 'relative')}>
            <Glyph name="upload" className="size-5" />
            Upload a resource
          </Link>
        ) : (
          <Link to="/books" className={buttonClass('secondary', 'lg', 'relative')}>
            <Glyph name="search" className="size-5" />
            Browse books
          </Link>
        )}
      </section>

      {features.files ? <ActivityDashboard /> : <ShelfDashboard memberSince={user ? formatDate(user.createdAt) : ''} />}

      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {ACTIONS.filter((action) => features.files || !action.needsFiles)
          .slice(0, 3)
          .map((action) => (
            <li key={action.to}>
              <ActionTile {...action} />
            </li>
          ))}
      </ul>
    </>
  )
}

function DownloadRow({ item }: { item: DownloadRecord }) {
  return (
    <li className="clay-well flex flex-wrap items-center justify-between gap-2 px-4 py-3">
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
        className="clay space-y-4 p-6"
        onSubmit={form.handleSubmit((values) =>
          update.mutate(values, {
            onSuccess: (saved) => form.reset({ displayName: saved.displayName }),
            onError: (error) => applyFieldErrors(error, form.setError),
          }),
        )}
      >
        <div className="clay-well flex items-center gap-4 p-4">
          <Avatar name={user.displayName} seed={user.id} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-medium">{user.displayName}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge tone={user.role === 'ADMIN' ? 'amber' : 'neutral'}>{user.role === 'ADMIN' ? 'Administrator' : 'Member'}</Badge>
              since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <Input label="Email" value={user.email} disabled readOnly hint="Your email cannot be changed." />
        <Input label="Name" error={form.formState.errors.displayName?.message} {...form.register('displayName')} />
        <FormError error={update.error} />
        {update.isSuccess && !form.formState.isDirty && <Notice tone="success">Saved.</Notice>}
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
      <PageHeader icon="download" tone="mint" title="My downloads" subtitle="Books and resources you have opened or downloaded." />
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
            <ul className="clay space-y-2 p-3">
              {data.content.map((item) => (
                <DownloadRow key={item.id} item={item} />
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </>
        )}
      </QueryState>
    </>
  )
}
