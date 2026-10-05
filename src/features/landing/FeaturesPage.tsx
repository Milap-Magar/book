import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ClayBook } from '@/components/clay/ClayBook'
import { ClayIcon, type GlyphName, type Tone } from '@/components/illustrations/ClayIcon'
import { Badge, Stars, StatusBadge } from '@/components/Misc'
import { Reveal } from '@/components/motion/Reveal'
import { buttonClass } from '@/components/buttonStyles'
import { SectionHeading } from '@/features/landing/parts'

// Each panel is a small still life built from the app's real components, so the page shows
// what the product looks like instead of describing it. All of them are decorative.

function Panel({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <div aria-hidden="true" className={`clay-lg relative grid min-h-72 place-items-center overflow-hidden p-8 ${tone}`}>
      {children}
    </div>
  )
}

function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`clay-sm flex items-center gap-3 px-4 py-3 text-sm font-bold ${className}`}>{children}</div>
}

const readArt = (
  <Panel tone="bg-brand-100 tint-brand">
    <span className="clay-blob absolute -top-8 -right-6 size-24 bg-brand-200" />
    <div className="flex items-end gap-5">
      <ClayBook book={{ id: 2, title: 'Operating Systems', coverUrl: null }} className="w-32 -rotate-6" />
      <div className="mb-4 space-y-2.5">
        <span className={buttonClass('primary', 'md', 'pointer-events-none')}>Read online</span>
        <span className={buttonClass('secondary', 'md', 'pointer-events-none flex')}>Download</span>
      </div>
    </div>
  </Panel>
)

const shareArt = (
  <Panel tone="bg-pink tint-pink">
    <div className="w-full max-w-xs space-y-3">
      <Row className="-rotate-2">
        <ClayIcon name="notes" tone="pink" size="sm" /> Week 4 lecture notes <Badge>Notes</Badge>
      </Row>
      <Row className="translate-x-4 rotate-1">
        <ClayIcon name="clock" tone="butter" size="sm" /> 2025 final exam <Badge>Past paper</Badge>
      </Row>
      <Row className="-rotate-1">
        <ClayIcon name="chart" tone="sky" size="sm" /> Revision deck <Badge>Slides</Badge>
      </Row>
    </div>
  </Panel>
)

const checkArt = (
  <Panel tone="bg-mint tint-mint">
    <div className="flex flex-col items-center gap-4">
      <ClayIcon name="shield" tone="mint" size="xl" className="bg-white" />
      <div className="flex flex-wrap items-center justify-center gap-2">
        <StatusBadge status="PENDING" />
        <span className="font-bold">→</span>
        <StatusBadge status="APPROVED" />
      </div>
    </div>
  </Panel>
)

const rateArt = (
  <Panel tone="bg-butter tint-butter">
    <div className="w-full max-w-xs space-y-3">
      <div className="clay-sm -rotate-1 p-4">
        <Stars value={5} />
        <p className="mt-1 text-sm font-semibold">“Chapter 6 finally made recursion click.”</p>
      </div>
      <div className="clay-sm translate-x-5 rotate-2 p-4">
        <Stars value={4} />
        <p className="mt-1 text-sm font-semibold">“Dense, but the exercises are worth it.”</p>
      </div>
    </div>
  </Panel>
)

const historyArt = (
  <Panel tone="bg-sky tint-sky">
    <div className="w-full max-w-xs space-y-3">
      <Row>
        <ClayIcon name="download" tone="sky" size="sm" />
        <span className="flex-1">Linear Algebra Done Right</span>
        <span className="text-xs text-muted">Today</span>
      </Row>
      <Row>
        <ClayIcon name="download" tone="sky" size="sm" />
        <span className="flex-1">Thermodynamics notes</span>
        <span className="text-xs text-muted">Mon</span>
      </Row>
      <Row>
        <ClayIcon name="download" tone="sky" size="sm" />
        <span className="flex-1">2024 midterm</span>
        <span className="text-xs text-muted">Last week</span>
      </Row>
    </div>
  </Panel>
)

interface Feature {
  icon: GlyphName
  tone: Tone
  title: string
  text: string
  points: string[]
  art: ReactNode
}

const FEATURES: Feature[] = [
  {
    icon: 'book',
    tone: 'brand',
    title: 'A library that opens in one click',
    text: 'Every book has a page with its details, its cover and its file. Read it in the browser or keep the PDF.',
    points: ['Search by title or author', 'Filter by genre, sort by rating or year', 'Read online or download'],
    art: readArt,
  },
  {
    icon: 'notes',
    tone: 'pink',
    title: 'Notes, past papers and slides',
    text: 'The things that never make it into the textbook. Upload a PDF, tag it with a subject and, if you like, the book it belongs to.',
    points: ['Notes, past papers, slides and more', 'PDF files up to 25 MB', 'Linked to the book they help with'],
    art: shareArt,
  },
  {
    icon: 'shield',
    tone: 'mint',
    title: 'Reviewed before it goes public',
    text: 'New uploads wait for a moderator. You can see the status of each of yours, and if one is turned down you are told why.',
    points: ['Pending, approved or rejected at a glance', 'A reason with every rejection', 'Nothing unreviewed reaches the shelf'],
    art: checkArt,
  },
  {
    icon: 'star',
    tone: 'butter',
    title: 'Ratings from people who read it',
    text: 'Leave a star rating and a short review on any book, and see the average before you spend an evening on it.',
    points: ['One review per reader, editable', 'Sort the library by top rated'],
    art: rateArt,
  },
  {
    icon: 'clock',
    tone: 'sky',
    title: 'Everything you opened, kept',
    text: 'Your dashboard remembers what you downloaded and what you shared, so last term’s reading is never lost.',
    points: ['Download history', 'Your uploads and their status'],
    art: historyArt,
  },
]

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <path d="M5.500 10.500l3 3 6-6.500" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FeaturesPage() {
  return (
    <>
      <SectionHeading
        level="h1"
        eyebrow="Features"
        title="Everything on the shelf"
        lead="No feeds, no streaks, no ads. Just the books and the notes, and a few tools to find and share them."
      />

      <div className="space-y-16 sm:space-y-24">
        {FEATURES.map((feature, index) => (
          <Reveal as="section" key={feature.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
            <div className={index % 2 === 1 ? 'md:order-last' : undefined}>{feature.art}</div>
            <div>
              <ClayIcon name={feature.icon} tone={feature.tone} />
              <h2 className="mt-4 text-3xl sm:text-4xl">{feature.title}</h2>
              <p className="mt-3 max-w-[52ch] text-lg text-muted">{feature.text}</p>
              <ul className="mt-5 space-y-2">
                {feature.points.map((point) => (
                  <li key={point} className="flex gap-2.5 font-semibold">
                    <Check />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="clay mt-20 flex flex-wrap items-center justify-between gap-5 px-7 py-8 sm:px-10">
        <div>
          <h2 className="text-3xl">Ready to look around?</h2>
          <p className="mt-1 text-muted">Browsing needs no account. Downloading and sharing take a free one.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/books" className={buttonClass('secondary', 'lg')}>
            Browse books
          </Link>
          <Link to="/register" className={buttonClass('primary', 'lg')}>
            Sign up free
          </Link>
        </div>
      </div>
    </>
  )
}
