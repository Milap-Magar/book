import type { ReactNode } from 'react'
import type { ResourceStatus } from '@/types/api'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

type Tone = 'neutral' | 'green' | 'amber' | 'red'

const tones: Record<Tone, string> = {
  neutral: 'bg-brand-100 text-brand-900',
  green: 'bg-mint text-emerald-900',
  amber: 'bg-butter text-amber-900',
  red: 'bg-pink text-rose-900',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold shadow-[inset_0_-2px_3px_rgb(0_0_0/0.08),inset_0_2px_3px_rgb(255_255_255/0.8)] ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

const statusTone: Record<ResourceStatus, Tone> = { PENDING: 'amber', APPROVED: 'green', REJECTED: 'red' }
const statusLabel: Record<ResourceStatus, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export function StatusBadge({ status }: { status: ResourceStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
}

export function Stars({ value, count }: { value: number; count?: number }) {
  // Clamped so an unexpected value from the API still draws between 0 and 5 stars.
  const rounded = Math.min(5, Math.max(0, Math.round(value) || 0))
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} viewBox="0 0 20 20" className={`size-4 ${star <= rounded ? 'fill-amber-400' : 'fill-brand-200'}`}>
            <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
          </svg>
        ))}
      </span>
      <span className="sr-only">{value.toFixed(1)} out of 5</span>
      {count !== undefined && <span className="font-semibold text-muted">({count})</span>}
    </span>
  )
}
