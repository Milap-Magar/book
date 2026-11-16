import { Link } from 'react-router'
import { ConfirmButton, Notice } from '@/components/Clay'
import { PageHeader, StatusBadge } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useDeleteResource, useMyResources } from '@/features/resources/api'
import { ResourceItem } from '@/features/resources/ResourceList'
import { useListParams } from '@/lib/useListParams'

export function MyUploadsPage() {
  const { page, set } = useListParams()
  const uploads = useMyResources({ page, size: 20 })
  const remove = useDeleteResource()

  const uploadLink = (
    <Link to="/uploads/new" className={buttonClass('primary')}>
      Upload a resource
    </Link>
  )

  return (
    <>
      <PageHeader icon="upload" tone="sky" title="My uploads" subtitle="Everything you have shared, with its review status." action={uploadLink} />
      <FormError error={remove.error} />

      <QueryState
        query={uploads}
        isEmpty={(data) => data.content.length === 0}
        empty={<EmptyState title="You have not uploaded anything yet" hint="Share notes or past papers with other students." action={uploadLink} />}
      >
        {(data) => (
          <>
            <ul className="space-y-3">
              {data.content.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} badges={<StatusBadge status={resource.status} />}>
                  {resource.status === 'REJECTED' && resource.rejectionReason && (
                    <Notice tone="danger" className="mt-3">
                      Reason: <span className="font-normal">{resource.rejectionReason}</span>
                    </Notice>
                  )}
                  <div className="mt-4 border-t-2 border-line pt-3">
                    <ConfirmButton disabled={remove.isPending} onConfirm={() => remove.mutate(resource.id)} />
                  </div>
                </ResourceItem>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </>
        )}
      </QueryState>
    </>
  )
}
