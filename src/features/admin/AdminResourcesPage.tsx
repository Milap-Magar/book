import { useState } from 'react'
import { Button } from '@/components/Button'
import { Notice } from '@/components/Clay'
import { segmentClass } from '@/components/buttonStyles'
import { PageHeader, StatusBadge } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { useAdminResources, useModerateResource } from '@/features/admin/api'
import { ResourceItem } from '@/features/resources/ResourceList'
import { formatDate } from '@/lib/format'
import { useListParams } from '@/lib/useListParams'
import type { Resource, ResourceStatus } from '@/types/api'

const TABS: { status: ResourceStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'REJECTED', label: 'Rejected' },
]

function PendingActions({ resource }: { resource: Resource }) {
  const moderate = useModerateResource()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const reasonValid = reason.trim().length >= 5

  return (
    <div className="mt-4 border-t-2 border-line pt-4">
      {!rejecting ? (
        <div className="flex gap-2">
          <Button size="sm" loading={moderate.isPending} onClick={() => moderate.mutate({ id: resource.id, action: 'approve' })}>
            Approve
          </Button>
          <Button size="sm" variant="secondary" disabled={moderate.isPending} onClick={() => setRejecting(true)}>
            Reject…
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (reasonValid) moderate.mutate({ id: resource.id, action: 'reject', reason: reason.trim() })
          }}
        >
          <label htmlFor={`reason-${resource.id}`} className="mb-1.5 block text-sm font-bold">
            Reason shown to the uploader
          </label>
          <textarea
            id={`reason-${resource.id}`}
            rows={2}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mb-3 block w-full clay-input"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="danger" loading={moderate.isPending} disabled={!reasonValid}>
              Reject
            </Button>
            <Button size="sm" variant="ghost" disabled={moderate.isPending} onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div className="mt-2">
        <FormError error={moderate.error} />
      </div>
    </div>
  )
}

export function AdminResourcesPage() {
  const { page, get, set } = useListParams()
  const status = TABS.find((tab) => tab.status === get('status'))?.status ?? 'PENDING'
  const resources = useAdminResources({ status, page, size: 20 })

  return (
    <>
      <PageHeader icon="shield" tone="mint" title="Moderation" subtitle="Use Read to check a file before you decide." />

      <div role="tablist" aria-label="Status" className="clay-well mb-6 inline-flex gap-1 p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            role="tab"
            aria-selected={tab.status === status}
            onClick={() => set({ status: tab.status === 'PENDING' ? undefined : tab.status })}
            className={segmentClass(tab.status === status)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <QueryState
        query={resources}
        isEmpty={(data) => data.content.length === 0}
        empty={
          <EmptyState
            title={status === 'PENDING' ? 'Nothing waiting for review' : 'Nothing here'}
            hint={status === 'PENDING' ? 'New uploads will appear here.' : undefined}
          />
        }
      >
        {(data) => (
          <div className={resources.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
            <ul className="space-y-3">
              {data.content.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} badges={<StatusBadge status={resource.status} />}>
                  {resource.status === 'PENDING' && <PendingActions resource={resource} />}
                  {resource.status === 'REJECTED' && resource.rejectionReason && (
                    <Notice tone="danger" className="mt-3">
                      Reason: <span className="font-normal">{resource.rejectionReason}</span>
                    </Notice>
                  )}
                  {resource.reviewedAt && <p className="mt-2 text-xs text-muted">Reviewed {formatDate(resource.reviewedAt)}</p>}
                </ResourceItem>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </div>
        )}
      </QueryState>
    </>
  )
}
