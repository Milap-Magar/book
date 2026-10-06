import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { DownloadButtons } from '@/components/DownloadButtons'
import { Badge } from '@/components/Misc'
import { requestResourceDownload, resourceTypeLabel } from '@/features/resources/api'
import { formatBytes, formatDate } from '@/lib/format'
import type { Resource } from '@/types/api'

interface ResourceItemProps {
  resource: Resource
  /** Extra badges next to the title, e.g. the moderation status. */
  badges?: ReactNode
  /** Extra content under the details, e.g. owner or admin actions. */
  children?: ReactNode
}

export function ResourceItem({ resource, badges, children }: ResourceItemProps) {
  return (
    <li className="clay p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg">{resource.title}</h3>
            <Badge>{resourceTypeLabel(resource.type)}</Badge>
            {badges}
          </div>
          <p className="mt-1 text-xs text-muted">
            {resource.category.name} · {resource.uploader.displayName} · {formatDate(resource.createdAt)} ·{' '}
            {formatBytes(resource.file.sizeBytes)}
          </p>
          {resource.book && (
            <p className="mt-1 text-sm">
              For{' '}
              <Link to={`/books/${resource.book.id}`} className="text-brand-700 underline">
                {resource.book.title}
              </Link>
            </p>
          )}
          {resource.description && <p className="mt-2 text-sm whitespace-pre-line text-ink/80">{resource.description}</p>}
        </div>
        <DownloadButtons size="sm" request={(disposition) => requestResourceDownload(resource.id, disposition)} />
      </div>
      {children}
    </li>
  )
}

export function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <ul className="space-y-3">
      {resources.map((resource) => (
        <ResourceItem key={resource.id} resource={resource} />
      ))}
    </ul>
  )
}
