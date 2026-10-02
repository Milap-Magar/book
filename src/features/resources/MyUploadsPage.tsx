import { Link } from 'react-router'
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
      <PageHeader title="My uploads" subtitle="Everything you have shared, with its review status." action={uploadLink} />
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
                    <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-800">
                      <span className="font-medium">Reason:</span> {resource.rejectionReason}
                    </p>
                  )}
                  <div className="mt-3 border-t border-line pt-3">
                    <button
                      type="button"
                      className="text-sm text-red-700 underline disabled:opacity-60"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) remove.mutate(resource.id)
                      }}
                    >
                      Delete
                    </button>
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
