import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { EmptyArt } from '@/components/illustrations/Scenes'
import { errorMessage } from '@/lib/api'

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
      <Spinner />
      {label}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  hint?: string
  action?: ReactNode
  /** Replaces the sleeping mascot, e.g. on the 404 page. */
  art?: ReactNode
}

export function EmptyState({ title, hint, action, art }: EmptyStateProps) {
  return (
    <div className="clay-well flex flex-col items-center px-6 py-12 text-center">
      {art ?? <EmptyArt className="w-28" />}
      <p className="mt-3 font-display text-xl font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="clay-well bg-red-50 px-6 py-8 text-center">
      <p className="text-sm text-red-800">{errorMessage(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-1 min-h-11 px-3 text-sm font-bold text-red-800 underline">
          Try again
        </button>
      )}
    </div>
  )
}

/** Inline form-level error, shown above the submit button. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-800">
      {errorMessage(error)}
    </p>
  )
}

interface QueryStateProps<T> {
  query: UseQueryResult<T>
  children: (data: T) => ReactNode
  /** Rendered instead of `children` when this returns true. */
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  /** Replaces the spinner, usually with a skeleton of what is about to appear. */
  loading?: ReactNode
}

/** One place for the loading / error / empty / data branches of a query. */
export function QueryState<T>({ query, children, isEmpty, empty, loading }: QueryStateProps<T>) {
  if (query.isPending) return <>{loading ?? <LoadingState />}</>
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  if (isEmpty?.(query.data)) return <>{empty}</>
  return <>{children(query.data)}</>
}
