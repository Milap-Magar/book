import { useId, type ComponentProps, type ReactNode } from 'react'

const control =
  'block w-full clay-input placeholder:text-muted/70'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

interface Extra {
  label: string
  error?: string
  hint?: string
}

// React 19 passes `ref` as a normal prop, so {...register('name')} works without forwardRef.

export function Input({ label, error, hint, className = '', ...props }: ComponentProps<'input'> & Extra) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} ${className}`}
        {...props}
      />
    </FieldShell>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }: ComponentProps<'textarea'> & Extra) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} ${className}`}
        {...props}
      />
    </FieldShell>
  )
}

export function Select({ label, error, hint, className = '', children, ...props }: ComponentProps<'select'> & Extra) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
}
