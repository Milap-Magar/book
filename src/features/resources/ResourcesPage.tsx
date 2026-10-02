import { Link } from 'react-router'
import { PageHeader } from '@/components/Misc'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { EmptyState, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useCategories } from '@/features/categories/api'
import { RESOURCE_TYPES, useResources } from '@/features/resources/api'
import { ResourceList } from '@/features/resources/ResourceList'
import { useListParams } from '@/lib/useListParams'
import type { ResourceType } from '@/types/api'

const selectClass = 'clay-input'

export function ResourcesPage() {
  const { page, get, set } = useListParams()
  const search = get('search')
  const category = get('category')
  // Only accept a type the API knows; anything else typed into the URL is ignored.
  const type = RESOURCE_TYPES.find((option) => option.value === get('type'))?.value ?? ''

  const resources = useResources({ search, category, type, page, size: 20 })
  const categories = useCategories()

  return (
    <>
      <PageHeader
        title="Study resources"
        subtitle="Notes, slides and past papers shared by students and approved by moderators."
        action={
          <Link to="/uploads/new" className={buttonClass('primary')}>
            Upload a resource
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <SearchInput label="Search resources" placeholder="Search by title" value={search} onChange={(value) => set({ search: value })} />
        <select aria-label="Category" className={selectClass} value={category} onChange={(event) => set({ category: event.target.value })}>
          <option value="">All categories</option>
          {categories.data?.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Type"
          className={selectClass}
          value={type}
          onChange={(event) => set({ type: event.target.value as ResourceType | '' })}
        >
          <option value="">All types</option>
          {RESOURCE_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        query={resources}
        isEmpty={(data) => data.content.length === 0}
        empty={<EmptyState title="No resources found" hint="Try another search, or be the first to share something." />}
      >
        {(data) => (
          <div className={resources.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
            <ResourceList resources={data.content} />
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(next) => set({ page: next })} />
          </div>
        )}
      </QueryState>
    </>
  )
}
