import { useState } from 'react'
import { Button } from '@/components/Button'
import { ConfirmButton, Toolbar } from '@/components/Clay'
import { ClayIcon } from '@/components/illustrations/ClayIcon'
import { genreGlyph, TONES } from '@/components/illustrations/genres'
import { PageHeader } from '@/components/Misc'
import { EmptyState, FormError, QueryState } from '@/components/States'
import { useCategories, useDeleteCategory, useSaveCategory } from '@/features/categories/api'
import type { Category } from '@/types/api'

const inputClass = 'block w-full min-w-0 clay-input placeholder:text-muted/70'

function CategoryRow({ category, index }: { category: Category; index: number }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const save = useSaveCategory()
  const remove = useDeleteCategory()

  return (
    <li className="clay-sm p-3 sm:p-4">
      {editing ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (name.trim()) save.mutate({ id: category.id, name: name.trim() }, { onSuccess: () => setEditing(false) })
          }}
        >
          <input aria-label="Category name" autoFocus maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={`${inputClass} flex-1 basis-48`} />
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
          <div className="flex min-w-0 items-center gap-3">
            <ClayIcon name={genreGlyph(category.slug)} tone={TONES[index % TONES.length]} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-bold">{category.name}</p>
              <p className="truncate text-xs text-muted">/{category.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Rename
            </Button>
            <ConfirmButton loading={remove.isPending} onConfirm={() => remove.mutate(category.id)} />
          </div>
        </div>
      )}
      {/* e.g. 409 when books still use this category */}
      <div className="mt-2 empty:hidden">
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
      <PageHeader icon="flask" tone="mint" title="Subjects" subtitle="The genres books are filed under." />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) create.mutate({ name: name.trim() }, { onSuccess: () => setName('') })
        }}
      >
        <Toolbar className="grid-cols-[1fr_auto]">
          <input aria-label="New subject name" placeholder="New subject name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          <Button type="submit" loading={create.isPending} disabled={!name.trim()}>
            Add
          </Button>
        </Toolbar>
      </form>
      <div className="mb-6 empty:hidden">
        <FormError error={create.error} />
      </div>

      <QueryState query={categories} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No subjects yet" hint="Add the first one above." />}>
        {(data) => (
          <ul className="space-y-3">
            {data.map((category, index) => (
              <CategoryRow key={category.id} category={category} index={index} />
            ))}
          </ul>
        )}
      </QueryState>
    </div>
  )
}
