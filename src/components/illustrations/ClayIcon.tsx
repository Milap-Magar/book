import type { ReactNode } from 'react'

/*
 * Chunky two-tone glyphs on a 48×48 grid: a solid shape in `currentColor` plus white
 * details. They sit inside a tinted clay tile, which supplies the depth.
 */

const white = { fill: '#fff' } as const
const line = { fill: 'none', stroke: '#fff', strokeWidth: 3.500, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const glyphs = {
  book: (
    <>
      <path d="M8 12q8-4 16 1 8-5 16-1v24q-8-4-16 1-8-5-16-1z" />
      <path d="M24 14v22" {...line} strokeWidth={2.500} />
      <path d="M13 19q4-1 7 .5M13 25q4-1 7 .5M28 19.500q4-1.500 7-.5M28 25.500q4-1.500 7-.5" {...line} strokeWidth={2.200} />
    </>
  ),
  code: (
    <>
      <rect x="6" y="9" width="36" height="30" rx="9" />
      <path d="M19 19l-5 5 5 5M29 19l5 5-5 5M26 17l-4 14" {...line} strokeWidth={3} />
    </>
  ),
  chip: (
    <>
      <path d="M17 4v6M24 4v6M31 4v6M17 38v6M24 38v6M31 38v6M4 17h6M4 24h6M4 31h6M38 17h6M38 24h6M38 31h6" fill="none" stroke="currentColor" strokeWidth="3.500" strokeLinecap="round" />
      <rect x="9" y="9" width="30" height="30" rx="8" />
      <rect x="18" y="18" width="12" height="12" rx="3.500" {...white} />
    </>
  ),
  math: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="11" />
      <path d="M13 17h8M17 13v8M27 17h8M14 28l6 6M20 28l-6 6M27 29h8M27 34h8" {...line} strokeWidth={3} />
    </>
  ),
  flask: (
    <>
      <path d="M19 6h10v3.500h-1.500V18l10.500 17.500a4.500 4.500 0 0 1-3.900 6.500H13.900A4.500 4.500 0 0 1 10 35.500L20.500 18V9.500H19z" />
      <path d="M16 31h16l3.500 6a1.500 1.500 0 0 1-1.300 2H13.800a1.500 1.500 0 0 1-1.300-2z" {...white} opacity="0.9" />
      <circle cx="22" cy="35" r="1.800" />
      <circle cx="28" cy="33.500" r="1.200" />
    </>
  ),
  chart: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="11" />
      <rect x="13" y="25" width="5.500" height="10" rx="2.500" {...white} />
      <rect x="21.200" y="19" width="5.500" height="16" rx="2.500" {...white} />
      <rect x="29.500" y="13" width="5.500" height="22" rx="2.500" {...white} />
    </>
  ),
  quill: (
    <>
      <path d="M40 6C24 7 13 17 11 33l-4 9 9-4c15-2 23-14 24-32z" />
      <path d="M11 37L31 15M18 30l8-.5M23 24l7-.5" {...line} strokeWidth={2.600} />
    </>
  ),
  notes: (
    <>
      <path d="M12 5h17l9 9v25a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z" />
      <path d="M29 5v6a3 3 0 0 0 3 3h6z" {...white} opacity="0.55" />
      <path d="M15 22h16M15 28h16M15 34h10" {...line} strokeWidth={3} />
    </>
  ),
  shield: (
    <>
      <path d="M24 4l15 5.500v11.500c0 10-6.200 17.800-15 21.500C15.200 38.800 9 31 9 21V9.500z" />
      <path d="M17 23.500l5 5 9.500-10" {...line} strokeWidth={4} />
    </>
  ),
  download: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="12" />
      <path d="M24 13v14M17.500 21.500L24 28l6.500-6.500M15 34h18" {...line} strokeWidth={3.600} />
    </>
  ),
  star: (
    <>
      <path d="M24 4.500l5.700 11.600 12.800 1.900-9.300 9 2.200 12.700L24 33.700l-11.400 6 2.200-12.700-9.300-9 12.800-1.900z" strokeLinejoin="round" stroke="currentColor" strokeWidth="3" />
      <ellipse cx="19" cy="17" rx="4" ry="2.200" {...white} opacity="0.55" transform="rotate(-24 19 17)" />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="19" />
      <path d="M24 13v11l7 5" {...line} strokeWidth={4} />
    </>
  ),
  search: (
    <>
      <circle cx="21" cy="21" r="15" />
      <circle cx="21" cy="21" r="8" {...white} opacity="0.9" />
      <path d="M32.500 32.500L42 42" fill="none" stroke="currentColor" strokeWidth="6.500" strokeLinecap="round" />
    </>
  ),
  upload: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="12" />
      <path d="M24 28V14M17.500 19.500L24 13l6.500 6.500M15 34h18" {...line} strokeWidth={3.600} />
    </>
  ),
  user: (
    <>
      <circle cx="24" cy="16" r="10" />
      <path d="M6 42c1-10 8.500-15 18-15s17 5 18 15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <ellipse cx="20.500" cy="12.500" rx="3.500" ry="2" {...white} opacity="0.5" transform="rotate(-20 20.500 12.500)" />
    </>
  ),
  heart: (
    <>
      <path d="M24 42S6 31 6 18.500A9.500 9.500 0 0 1 24 13a9.500 9.500 0 0 1 18 5.500C42 31 24 42 24 42z" />
      <ellipse cx="15.500" cy="16" rx="4" ry="2.400" {...white} opacity="0.55" transform="rotate(-30 15.500 16)" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type GlyphName = keyof typeof glyphs

export type Tone = 'brand' | 'pink' | 'butter' | 'mint' | 'sky' | 'peach'

// Tile colour, glyph colour (a dark shade of the same hue) and matching shadow tint.
const tones: Record<Tone, string> = {
  brand: 'bg-brand-200 text-brand-700 tint-brand',
  pink: 'bg-pink text-[#c2386e] tint-pink',
  butter: 'bg-butter text-[#a8790a] tint-butter',
  mint: 'bg-mint text-[#1c8663] tint-mint',
  sky: 'bg-sky text-[#2a6fc0] tint-sky',
  peach: 'bg-peach text-[#c4612c] tint-peach',
}

export function Glyph({ name, className = 'size-6' }: { name: GlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      {glyphs[name]}
    </svg>
  )
}

const sizes = {
  sm: ['size-11 rounded-2xl', 'size-6'],
  md: ['size-14 rounded-[1.25rem]', 'size-8'],
  lg: ['size-20 rounded-[1.75rem]', 'size-11'],
  xl: ['size-28 rounded-[2.250rem]', 'size-16'],
} as const

interface ClayIconProps {
  name: GlyphName
  tone?: Tone
  size?: keyof typeof sizes
  className?: string
}

/** A glyph pressed onto a puffy clay tile. */
export function ClayIcon({ name, tone = 'brand', size = 'md', className = '' }: ClayIconProps) {
  const [tile, glyph] = sizes[size]
  return (
    <span aria-hidden="true" className={`clay-sm inline-grid shrink-0 place-items-center ${tile} ${tones[tone]} ${className}`}>
      <Glyph name={name} className={glyph} />
    </span>
  )
}
