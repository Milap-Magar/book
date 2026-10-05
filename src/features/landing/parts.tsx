import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ClayIcon } from '@/components/illustrations/ClayIcon'
import { genreGlyph, TONES } from '@/components/illustrations/genres'
import type { Category } from '@/types/api'

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="clay-sm tint-brand inline-flex items-center gap-2 bg-brand-100 px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-brand-700 uppercase">
      {children}
    </p>
  )
}

interface SectionHeadingProps {
  id?: string
  eyebrow?: string
  title: string
  lead?: string
  action?: ReactNode
  /** `h1` on a page's first heading, `h2` everywhere else. */
  level?: 'h1' | 'h2'
}

export function SectionHeading({ id, eyebrow, title, lead, action, level: Heading = 'h2' }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading id={id} className={`mt-3 ${Heading === 'h1' ? 'text-hero' : 'text-title'}`}>
          {title}
        </Heading>
        {lead && <p className="mt-3 max-w-[60ch] text-lg text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  )
}

// One line per subject the app ships with. Categories added later by an admin get the generic line.
const blurbs: Record<string, string> = {
  programming: 'Languages, clean code and the craft of building software.',
  'computer-science': 'Algorithms, operating systems, networks and theory.',
  mathematics: 'Calculus, linear algebra, statistics and proofs.',
  science: 'Physics, chemistry and biology, from first year up.',
  business: 'Economics, management, accounting and marketing.',
  literature: 'Novels, poetry and the criticism around them.',
}

export function GenreTile({ category, index, detailed = false }: { category: Category; index: number; detailed?: boolean }) {
  const tone = TONES[index % TONES.length]
  return (
    <Link to={`/books?category=${category.slug}`} className="group clay clay-lift flex h-full flex-col p-5 sm:p-6">
      <ClayIcon name={genreGlyph(category.slug)} tone={tone} size={detailed ? 'lg' : 'md'} />
      <h3 className="mt-4 text-xl group-hover:text-brand-700">{category.name}</h3>
      {detailed && <p className="mt-1 text-sm text-muted">{blurbs[category.slug] ?? `Books and notes filed under ${category.name}.`}</p>}
      <span className="mt-auto pt-3 text-sm font-bold text-brand-700">
        Browse <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  )
}
