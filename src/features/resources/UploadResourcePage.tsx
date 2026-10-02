import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import { PageHeader } from '@/components/Misc'
import { FormError } from '@/components/States'
import { useBook } from '@/features/books/api'
import { useCategories } from '@/features/categories/api'
import { RESOURCE_TYPES, useUploadResource } from '@/features/resources/api'
import { applyFieldErrors } from '@/lib/api'
import { formatBytes } from '@/lib/format'

// Same limits as the backend. These checks only save the user a wasted upload; the server re-checks the real bytes.
const MAX_BYTES = 25 * 1024 * 1024

const schema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters').max(150, 'At most 150 characters'),
  description: z.string().trim().max(2000, 'At most 2000 characters'),
  type: z.enum(['NOTES', 'PAST_PAPER', 'SLIDES', 'OTHER'], 'Choose a type'),
  categoryId: z.string().min(1, 'Choose a category'),
})

type Values = z.infer<typeof schema>

function checkFile(file: File | null): string | null {
  if (!file) return 'Choose a PDF file'
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are accepted'
  if (file.size > MAX_BYTES) return `The file is ${formatBytes(file.size)}; the limit is 25 MB`
  return null
}

export function UploadResourcePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Arriving from a book page (/uploads/new?bookId=10) attaches the upload to that book.
  const bookIdParam = Number(searchParams.get('bookId'))
  const bookId = Number.isInteger(bookIdParam) && bookIdParam > 0 ? bookIdParam : undefined
  const book = useBook(bookId ?? Number.NaN)

  const categories = useCategories()
  const upload = useUploadResource()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { description: '' } })
  const { errors } = form.formState

  function submit(values: Values) {
    const problem = checkFile(file)
    setFileError(problem)
    if (problem || !file) return

    setProgress(0)
    upload.mutate(
      {
        file,
        metadata: {
          title: values.title,
          description: values.description || undefined,
          type: values.type,
          categoryId: Number(values.categoryId),
          bookId,
        },
        onProgress: setProgress,
      },
      {
        onSuccess: () => void navigate('/uploads'),
        onError: (error) => applyFieldErrors(error, form.setError),
      },
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Upload a resource" subtitle="A moderator reviews every upload before it becomes public." />

      {bookId && book.data && (
        <p className="mb-4 rounded-2xl bg-brand-50 px-3 py-2 text-sm">
          This upload will be attached to{' '}
          <Link to={`/books/${book.data.id}`} className="font-medium text-brand-700 underline">
            {book.data.title}
          </Link>
          .
        </p>
      )}

      <form noValidate className="space-y-4 clay p-6" 
        onSubmit={(event) => {
          // The file is not a react-hook-form field, so check it here: handleSubmit skips
          // `submit` when another field is invalid, and the file error would never show.
          setFileError(checkFile(file))
          void form.handleSubmit(submit)(event)
        }}
      >
        <Input label="Title" error={errors.title?.message} {...form.register('title')} />
        <Textarea label="Description (optional)" error={errors.description?.message} {...form.register('description')} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Type" defaultValue="" error={errors.type?.message} {...form.register('type')}>
            <option value="" disabled>
              Choose…
            </option>
            {RESOURCE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            defaultValue=""
            disabled={categories.isPending}
            error={errors.categoryId?.message ?? (categories.isError ? 'Could not load categories' : undefined)}
            {...form.register('categoryId')}
          >
            <option value="" disabled>
              Choose…
            </option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="File"
          type="file"
          accept="application/pdf,.pdf"
          hint="PDF only, up to 25 MB."
          error={fileError ?? undefined}
          onChange={(event) => {
            const chosen = event.target.files?.[0] ?? null
            setFile(chosen)
            setFileError(chosen ? checkFile(chosen) : null)
          }}
        />

        {upload.isPending && (
          <div>
            <div
              role="progressbar"
              aria-label="Upload progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-brand-100"
            >
              <div className="h-full bg-brand-600 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-ink/60">{progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}</p>
          </div>
        )}

        <FormError error={upload.error} />
        <Button type="submit" loading={upload.isPending}>
          Upload
        </Button>
      </form>
    </div>
  )
}
