import { useState } from 'react'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/Misc'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { useCategories, useDeleteCategory, useSaveCategory } from '@/features/categories/api'
import type { Category } from '@/types/api'

const inputClass = 'block w-full clay-input'

function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const save = useSaveCategory()
  const remove = useDeleteCategory()

  return (
    <li className="px-4 py-3">
      {editing ? (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (name.trim()) save.mutate({ id: category.id, name: name.trim() }, { onSuccess: () => setEditing(false) })
          }}
        >
          <input aria-label="Category name" autoFocus value={name} onChange={(event) => setName(event.target.value)} className={`${inputClass} max-w-xs`} />
          <Button type="submit" size="sm" loading={save.isPending}>
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setName(category.name)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-medium">{category.name}</span>
            <span className="ml-2 text-xs text-muted">{category.slug}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <button type="button" className="text-brand-700 underline" onClick={() => setEditing(true)}>
              Rename
            </button>
            <button
              type="button"
              className="text-red-700 underline disabled:opacity-60"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(`Delete the category "${category.name}"?`)) remove.mutate(category.id)
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {/* e.g. 409 when books still use this category */}
      <div className="mt-1">
        <FormError error={save.error ?? remove.error} />
      </div>
    </li>
  )
}

export function AdminCategoriesPage() {
  const categories = useCategories()
  const create = useSaveCategory()
  const [name, setName] = useState('')

  return (
    <div className="max-w-2xl">
      <PageHeader title="Categories" />

      <form
        className="mb-2 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) create.mutate({ name: name.trim() }, { onSuccess: () => setName('') })
        }}
      >
        <input aria-label="New category name" placeholder="New category name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
        <Button type="submit" loading={create.isPending} disabled={!name.trim()}>
          Add
        </Button>
      </form>
      <div className="mb-6">
        <FormError error={create.error} />
      </div>

      <QueryState query={categories} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No categories yet" hint="Add the first one above." />}>
        {(data) => (
          <ul className="divide-y divide-line clay overflow-hidden">
            {data.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  )
}
