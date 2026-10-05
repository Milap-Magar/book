import { useId } from 'react'

/**
 * The Shelfmallow mark: a marshmallow pressed into the shape of a closed book.
 * Grape cover, cream pages along the bottom edge, a strawberry bookmark.
 * public/favicon.svg is the same drawing; change them together.
 */
export function LogoMark({ className = 'size-10' }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-cover`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a82f8" />
          <stop offset="1" stopColor="#5f41d8" />
        </linearGradient>
        <linearGradient id={`${id}-pages`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#f1e1c9" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="36.5" rx="13" ry="2.5" fill="#5f41d8" opacity="0.22" />
      <rect x="4" y="4" width="32" height="31" rx="10" fill={`url(#${id}-cover)`} />
      {/* Spine crease */}
      <rect x="9.5" y="7" width="2" height="25" rx="1" fill="#4a30b8" opacity="0.35" />
      <rect x="13" y="24.5" width="23" height="6.5" rx="3.25" fill={`url(#${id}-pages)`} />
      <path d="M24.500 4h6.500v13.500l-3.250-2.800-3.250 2.800z" fill="#ff7fa8" />
      {/* Where the light lands */}
      <ellipse cx="16" cy="10.500" rx="6.500" ry="3" fill="#fff" opacity="0.38" transform="rotate(-14 16 10.500)" />
    </svg>
  )
}

export function Logo({ variant = 'full', className = '' }: { variant?: 'full' | 'mark'; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink ${className}`}>
      <LogoMark />
      {variant === 'full' ? (
        <span>
          Shelf<span className="text-brand-600">mallow</span>
        </span>
      ) : (
        <span className="sr-only">Shelfmallow</span>
      )}
    </span>
  )
}
