import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/Button'
import type { ButtonSize } from '@/components/buttonStyles'
import { ClayIcon, type GlyphName, type Tone } from '@/components/illustrations/ClayIcon'
import { TONES } from '@/components/illustrations/genres'
import { Skeleton } from '@/components/Skeleton'

/*
 * The clay pieces the pages inside the app are built from. The surfaces themselves
 * (clay, clay-well, clay-pill...) are CSS utilities in styles/clay.css; these components are
 * the handful of arrangements of them that more than one page needs.
 */

interface PanelProps {
  title?: string
  /** Sits on the right of the title: a link, a button, a count. */
  action?: ReactNode
  children: ReactNode
  className?: string
  /** For aria-labelledby on a surrounding element. */
  headingId?: string
}

/** A raised card with an optional title row. The default container for a block of content. */
export function Panel({ title, action, children, className = '', headingId }: PanelProps) {
  return (
    <section aria-labelledby={headingId} className={`clay p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 id={headingId} className="text-xl">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** The raised bar that holds a list's search box and filters. */
export function Toolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`clay-sm mb-6 grid gap-2.5 p-2.5 ${className}`}>{children}</div>
}

type NoticeTone = 'info' | 'success' | 'danger'

const noticeTones: Record<NoticeTone, string> = {
  info: 'bg-brand-50 text-brand-900 tint-brand',
  success: 'bg-[#e9f9f2] text-emerald-900 tint-mint',
  danger: 'bg-rose-50 text-rose-900 tint-rose',
}

/** A message pressed into the page: a rejection reason, "saved", a hint. */
export function Notice({ tone = 'info', children, className = '' }: { tone?: NoticeTone; children: ReactNode; className?: string }) {
  return (
    <p role={tone === 'danger' ? 'alert' : 'status'} className={`clay-well px-4 py-2.5 text-sm font-semibold ${noticeTones[tone]} ${className}`}>
      {children}
    </p>
  )
}

const avatarFill: Record<Tone, string> = {
  brand: 'bg-brand-200 tint-brand',
  pink: 'bg-pink tint-pink',
  butter: 'bg-butter tint-butter',
  mint: 'bg-mint tint-mint',
  sky: 'bg-sky tint-sky',
  peach: 'bg-peach tint-peach',
}

const avatarSizes = {
  sm: 'size-10 text-lg',
  lg: 'size-20 rounded-[1.75rem] text-4xl',
} as const

/** A person as a clay tile with their initial. `seed` (their id) picks the colour, so it never changes. */
export function Avatar({ name, seed = 0, size = 'sm' }: { name: string; seed?: number; size?: keyof typeof avatarSizes }) {
  return (
    <span
      aria-hidden="true"
      className={`clay-sm grid shrink-0 place-items-center font-display font-medium text-ink ${avatarSizes[size]} ${avatarFill[TONES[seed % TONES.length]]}`}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}

interface StatTileProps {
  label: string
  /** `undefined` while loading. */
  value: ReactNode | undefined
  icon: GlyphName
  tone: Tone
  to?: string
}

/** One number with an icon. A link when `to` is given. */
export function StatTile({ label, value, icon, tone, to }: StatTileProps) {
  const body = (
    <>
      <ClayIcon name={icon} tone={tone} size="md" />
      <div className="min-w-0">
        <div className="truncate font-display text-4xl leading-none font-semibold">{value ?? <Skeleton className="h-9 w-12" />}</div>
        <p className="mt-1 text-sm font-bold text-muted">{label}</p>
      </div>
    </>
  )
  return to ? (
    <Link to={to} className="clay clay-lift flex items-center gap-4 p-5">
      {body}
    </Link>
  ) : (
    <div className="clay flex items-center gap-4 p-5">{body}</div>
  )
}

interface ActionTileProps {
  to: string
  label: string
  hint: string
  icon: GlyphName
  tone: Tone
}

/** A small shortcut card: icon, label and one line of explanation. */
export function ActionTile({ to, label, hint, icon, tone }: ActionTileProps) {
  return (
    <Link to={to} className="clay-sm clay-lift flex h-full items-center gap-3 p-4">
      <ClayIcon name={icon} tone={tone} size="sm" />
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </Link>
  )
}

interface ConfirmButtonProps {
  /** The first, harmless-looking button. */
  label?: string
  /** The button that really does it. */
  confirmLabel?: string
  onConfirm: () => void
  loading?: boolean
  disabled?: boolean
  size?: ButtonSize
}

/**
 * Two steps for anything that cannot be undone: the first press opens a small well with the
 * real button and a way out. It closes again by itself after a few seconds. Replaces the
 * browser's own confirm box, which no amount of CSS can make look like the rest of the app.
 */
export function ConfirmButton({ label = 'Delete', confirmLabel = 'Yes, delete', onConfirm, loading, disabled, size = 'sm' }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 6000)
    return () => clearTimeout(timer)
  }, [armed])

  if (!armed) {
    return (
      <Button variant="ghostDanger" size={size} loading={loading} disabled={disabled} onClick={() => setArmed(true)}>
        {label}
      </Button>
    )
  }

  return (
    <span role="group" aria-label="Please confirm" className="clay-well tint-rose inline-flex animate-pop items-center gap-1 p-1">
      <Button
        variant="danger"
        size={size}
        autoFocus
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  )
}

/** Column headings and rows for the two admin tables. */
export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="clay overflow-x-auto p-2">
      <table className="w-full border-separate border-spacing-0 text-left text-sm [&_tbody_td]:border-t-2 [&_tbody_td]:border-line [&_tbody_tr:first-child_td]:border-t-0 [&_tbody_tr:hover_td]:bg-brand-50/60 [&_td]:px-4 [&_td]:py-3">
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`bg-brand-50 px-4 py-3 text-xs font-extrabold tracking-wide whitespace-nowrap text-muted uppercase first:rounded-l-2xl last:rounded-r-2xl ${className}`}
    >
      {children}
    </th>
  )
}
