import { useId, type ReactNode } from 'react'

export type Mood = 'happy' | 'reading' | 'puzzled' | 'sleepy'

interface MallowProps {
  mood?: Mood
  className?: string
  /** Extra SVG drawn in the same 160×160 space, in front of the body (a book, a sign...). */
  children?: ReactNode
}

/**
 * Mallow, the Shelfmallow mascot: a marshmallow with a face. Every illustration in the app
 * is this character plus a prop, so the set stays consistent. Decorative: always aria-hidden.
 */
export function Mallow({ mood = 'happy', className = 'w-40', children }: MallowProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#fff6ea" />
          <stop offset="1" stopColor="#f0dcc4" />
        </linearGradient>
        <radialGradient id={`${id}-shade`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#684e96" stopOpacity="0.35" />
          <stop offset="1" stopColor="#684e96" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="146" rx="52" ry="9" fill={`url(#${id}-shade)`} />

      {/* Feet */}
      <ellipse cx="62" cy="138" rx="12" ry="7" fill="#efd9bf" />
      <ellipse cx="98" cy="138" rx="12" ry="7" fill="#efd9bf" />

      {/* Body: a slightly squashed cylinder */}
      <rect x="30" y="34" width="100" height="104" rx="34" fill={`url(#${id}-body)`} />
      <path d="M30 104c0 19 15 34 34 34h32c19 0 34-15 34-34 0 12-22 20-50 20s-50-8-50-20z" fill="#e6cdb0" opacity="0.45" />
      <ellipse cx="62" cy="52" rx="20" ry="8" fill="#fff" opacity="0.9" transform="rotate(-10 62 52)" />

      {/* Cheeks */}
      <ellipse cx="54" cy="96" rx="9" ry="6" fill="#ffb3cc" opacity="0.75" />
      <ellipse cx="106" cy="96" rx="9" ry="6" fill="#ffb3cc" opacity="0.75" />

      <Face mood={mood} />
      {children}
    </svg>
  )
}

const stroke = { fill: 'none', stroke: '#33263f', strokeWidth: 4, strokeLinecap: 'round' } as const

function Face({ mood }: { mood: Mood }) {
  if (mood === 'sleepy') {
    return (
      <>
        <path d="M58 84q6 5 12 0M90 84q6 5 12 0" {...stroke} />
        <ellipse cx="80" cy="100" rx="4" ry="3" fill="#33263f" />
      </>
    )
  }
  if (mood === 'reading') {
    // Looking down at the book.
    return (
      <>
        <path d="M58 86q6-5 12 0M90 86q6-5 12 0" {...stroke} />
        <path d="M74 98q6 4 12 0" {...stroke} />
      </>
    )
  }
  if (mood === 'puzzled') {
    return (
      <>
        <circle cx="64" cy="84" r="5" fill="#33263f" />
        <circle cx="96" cy="82" r="5" fill="#33263f" />
        <path d="M56 72l12-3M90 67l13 4" {...stroke} strokeWidth={3.500} />
        <path d="M73 102q7-4 14 1" {...stroke} />
      </>
    )
  }
  return (
    <>
      <circle cx="64" cy="84" r="5" fill="#33263f" />
      <circle cx="96" cy="84" r="5" fill="#33263f" />
      <circle cx="65.500" cy="82.500" r="1.600" fill="#fff" />
      <circle cx="97.500" cy="82.500" r="1.600" fill="#fff" />
      <path d="M71 96q9 9 18 0" {...stroke} />
    </>
  )
}
