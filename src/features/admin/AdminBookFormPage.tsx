import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Notice } from '@/components/Clay'
import { Input, Select, Textarea } from '@/components/Field'
import { PageHeader } from '@/components/Misc'
import { FormError, QueryState } from '@/components/States'
import { useBook, useSaveBook, useUploadBookFile } from '@/features/books/api'
import { useCategories } from '@/features/categories/api'
import { buttonClass } from '@/components/buttonStyles'
import { applyFieldErrors } from '@/lib/api'
import { features } from '@/lib/features'
import type { BookDetail } from '@/types/api'

// Every field is a string here because that is what inputs produce; numbers are converted on submit.
const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'At most 255 characters'),
  author: z.string().trim().min(1, 'Author is required').max(255, 'At most 255 characters'),
  publisher: z.string().trim().max(255, 'At most 255 characters'),
  publishedYear: z.string().trim().regex(/^(\d{4})?$/, 'Use a 4-digit year'),
  // Same rule as the backend's BookRequest: empty, or 10 to 17 digits, X and hyphens.
  isbn: z.string().trim().regex(/^$|^[0-9Xx-]{10,17}$/, 'An ISBN is 10 to 17 digits or hyphens'),
  description: z.string().trim().max(5000, 'At most 5000 characters'),
  categoryId: z.string().min(1, 'Choose a category'),
})

type Values = z.infer<typeof schema>

function toValues(book: BookDetail | undefined): Values {
  return {
    title: book?.title ?? '',
    author: book?.author ?? '',
    publisher: book?.publisher ?? '',
    publishedYear: book?.publishedYear ? String(book.publishedYear) : '',
    isbn: book?.isbn ?? '',
    description: book?.description ?? '',
    categoryId: book?.category ? String(book.category.id) : '',
  }
}

function BookForm({ book }: { book?: BookDetail }) {
  const navigate = useNavigate()
  const categories = useCategories()
  const save = useSaveBook()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(book) })
  const { errors } = form.formState

  function submit(values: Values) {
    save.mutate(
      {
        id: book?.id,
        book: {
          title: values.title,
          author: values.author,
          publisher: values.publisher || undefined,
          publishedYear: values.publishedYear ? Number(values.publishedYear) : undefined,
          isbn: values.isbn || undefined,
          description: values.description || undefined,
          categoryId: Number(values.categoryId),
        },
      },
      {
        onSuccess: (saved) => {
          if (book) form.reset(toValues(saved))
          // A new book goes to its edit page, which is where the PDF and cover are attached.
          // Until the API stores files there is nothing more to do there: back to the list.
          else void navigate(features.files ? `/admin/books/${saved.id}/edit` : '/admin/books', { replace: true })
        },
        onError: (error) => applyFieldErrors(error, form.setError),
      },
    )
  }

  return (
    <form noValidate className="clay space-y-4 p-6" onSubmit={form.handleSubmit(submit)}>
      <Input label="Title" error={errors.title?.message} {...form.register('title')} />
      <Input label="Author" error={errors.author?.message} {...form.register('author')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Publisher (optional)" error={errors.publisher?.message} {...form.register('publisher')} />
        <Input label="Year published (optional)" inputMode="numeric" error={errors.publishedYear?.message} {...form.register('publishedYear')} />
        <Input label="ISBN (optional)" error={errors.isbn?.message} {...form.register('isbn')} />
        {/* The key re-applies the saved value once the options have loaded. */}
        <Select
          key={categories.isSuccess ? 'ready' : 'loading'}
          label="Category"
          disabled={categories.isPending}
          error={errors.categoryId?.message ?? (categories.isError ? 'Could not load categories' : undefined)}
          {...form.register('categoryId')}
        >
          <option value="">Choose…</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea label="Description (optional)" rows={6} error={errors.description?.message} {...form.register('description')} />

      <FormError error={save.error} />
      {save.isSuccess && !form.formState.isDirty && <Notice tone="success">Saved.</Notice>}
      <Button type="submit" loading={save.isPending}>
        {book ? 'Save changes' : 'Create book'}
      </Button>
    </form>
  )
}

interface FileUploadProps {
  bookId: number
  kind: 'file' | 'cover'
  label: string
  accept: string
  hint: string
  current: string
}

function FileUpload({ bookId, kind, label, accept, hint, current }: FileUploadProps) {
  const upload = useUploadBookFile(bookId, kind)

  return (
    <div>
      <Input
        label={label}
        type="file"
        accept={accept}
        hint={`${hint} ${current}`}
        disabled={upload.isPending}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) upload.mutate(file)
          // Reset so choosing the same file again still triggers onChange.
          event.target.value = ''
        }}
      />
      {upload.isPending && <p className="mt-1 text-xs text-muted">Uploading…</p>}
      {upload.isSuccess && <Notice tone="success" className="mt-2">Uploaded.</Notice>}
      <div className="mt-2 empty:hidden">
        <FormError error={upload.error} />
      </div>
    </div>
  )
}

export function AdminBookFormPage() {
  const params = useParams()
  const editing = params.id !== undefined
  const id = Number(params.id)
  const book = useBook(editing ? id : Number.NaN)

  const back = (
    <Link to="/admin/books" className={buttonClass('ghost', 'sm')}>
      <span aria-hidden="true">←</span> Back to books
    </Link>
  )

  if (!editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader icon="book" title="Add a book" action={back} />
        <BookForm />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader icon="book" title="Edit book" action={back} />
      <QueryState query={book}>
        {(data) => (
          <>
            <BookForm key={data.id} book={data} />
            {features.files && (
              <section className="clay mt-6 space-y-4 p-6">
                <h2 className="text-xl">Files</h2>
                <FileUpload
                  bookId={data.id}
                  kind="file"
                  label="Book PDF"
                  accept="application/pdf,.pdf"
                  hint="PDF, up to 25 MB."
                  current={data.hasFile ? 'A file is attached; uploading replaces it.' : 'No file attached yet.'}
                />
                <FileUpload
                  bookId={data.id}
                  kind="cover"
                  label="Cover image"
                  accept="image/jpeg,image/png,image/webp"
                  hint="JPEG, PNG or WebP, up to 2 MB."
                  current={data.coverUrl ? 'A cover is set; uploading replaces it.' : 'No cover yet.'}
                />
              </section>
            )}
          </>
        )}
      </QueryState>
    </div>
  )
}
