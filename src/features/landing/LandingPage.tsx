import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { ClayIcon, type GlyphName, type Tone } from '@/components/illustrations/ClayIcon'
import { WelcomeArt } from '@/components/illustrations/Scenes'
import { Reveal } from '@/components/motion/Reveal'
import { BookGridSkeleton } from '@/components/Skeleton'
import { EmptyState, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useBooks } from '@/features/books/api'
import { BookGrid } from '@/features/books/BookCard'
import { useCategories } from '@/features/categories/api'
import { HeroShelf } from '@/features/landing/HeroShelf'
import { Eyebrow, GenreTile, SectionHeading } from '@/features/landing/parts'
import { useSession } from '@/lib/session'

const FEATURES: { icon: GlyphName; tone: Tone; title: string; text: string }[] = [
  { icon: 'book', tone: 'brand', title: 'Read or download', text: 'Open a course book in your browser, or save the PDF for the bus ride home.' },
  { icon: 'notes', tone: 'pink', title: 'Share what helped', text: 'Upload your notes, past papers and slides so the next class starts ahead.' },
  { icon: 'shield', tone: 'mint', title: 'Checked before it is public', text: 'Every upload is reviewed by a moderator, so the shelf stays useful.' },
]

const STEPS = [
  { title: 'Find your subject', text: 'Search by title or author, or start from a genre.' },
  { title: 'Read and download', text: 'Books, notes and past papers, one click each.' },
  { title: 'Give something back', text: 'Upload a PDF. Once it is approved, everyone can use it.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { status } = useSession()
  const [search, setSearch] = useState('')
  const latest = useBooks({ sort: 'createdAt,desc', size: 5 })
  const topRated = useBooks({ sort: 'ratingAvg,desc', size: 3 })
  const categories = useCategories()

  const stats = [
    { value: latest.data?.totalElements ?? '–', label: 'books on the shelf' },
    { value: categories.data?.length ?? '–', label: 'subjects' },
    { value: 'Every', label: 'upload reviewed' },
    { value: 'Free', label: 'to read and share' },
  ]

  return (
    <>
      <section aria-labelledby="hero-heading" className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        <div>
          <Eyebrow>Free for students</Eyebrow>
          <h1 id="hero-heading" className="mt-4 text-hero">
            Books and notes on one <span className="text-brand-600">soft shelf.</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-muted">
            Read and download course books, and share the notes and past papers that got you through.
          </p>

          <form
            role="search"
            className="clay mt-8 flex max-w-lg items-center gap-2 p-2"
            onSubmit={(event) => {
              event.preventDefault()
              const query = search.trim()
              void navigate(query ? `/books?search=${encodeURIComponent(query)}` : '/books')
            }}
          >
            <input
              type="search"
              aria-label="Search books"
              placeholder="Search by title or author"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="clay-input block min-w-0 flex-1 placeholder:text-muted/70"
            />
            <Button type="submit">Search</Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/books" className="flex min-h-11 items-center text-sm font-bold text-brand-700 underline decoration-2 underline-offset-4">
              Browse all books
            </Link>
            {status === 'anonymous' && (
              <Link to="/register" className="flex min-h-11 items-center text-sm font-bold text-brand-700 underline decoration-2 underline-offset-4">
                Create a free account
              </Link>
            )}
          </div>
        </div>

        <HeroShelf books={topRated.data?.content} />
      </section>

      <Reveal>
        <dl className="clay-well mt-14 grid grid-cols-2 gap-y-6 px-6 py-7 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse text-center">
              <dt className="text-sm font-bold text-muted">{stat.label}</dt>
              <dd className="font-display text-4xl font-semibold text-brand-700">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* Genres are a nice-to-have here: if they fail to load, the page works without them. */}
      {categories.data && categories.data.length > 0 && (
        <section aria-labelledby="genres-heading" className="mt-24">
          <SectionHeading
            id="genres-heading"
            eyebrow="Genres"
            title="Start from your subject"
            action={
              <Link to="/genres" className={buttonClass('secondary')}>
                All genres
              </Link>
            }
          />
          <ul className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {categories.data.slice(0, 6).map((category, index) => (
              <Reveal as="li" key={category.id} delay={index * 0.06}>
                <GenreTile category={category} index={index} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="features-heading" className="mt-24">
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title="Small, soft and useful"
          lead="Shelfmallow does three things, and tries to do them well."
          action={
            <Link to="/features" className={buttonClass('secondary')}>
              See every feature
            </Link>
          }
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal as="li" key={feature.title} delay={index * 0.08} className="clay p-7">
              <ClayIcon name={feature.icon} tone={feature.tone} size="lg" />
              <h3 className="mt-5 text-2xl">{feature.title}</h3>
              <p className="mt-2 text-muted">{feature.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-labelledby="latest-heading" className="mt-24">
        <SectionHeading
          id="latest-heading"
          eyebrow="Fresh"
          title="Recently added"
          action={
            <Link to="/books" className={buttonClass('secondary')}>
              View all books
            </Link>
          }
        />
        <QueryState
          query={latest}
          loading={<BookGridSkeleton count={5} />}
          isEmpty={(data) => data.content.length === 0}
          empty={<EmptyState title="No books yet" hint="Books added by an admin will appear here." />}
        >
          {(data) => <BookGrid books={data.content} />}
        </QueryState>
      </section>

      <section aria-labelledby="how-heading" className="mt-24">
        <SectionHeading id="how-heading" eyebrow="How it works" title="Three steps, no fuss" />
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 0.08} className="clay-well p-7">
              <span aria-hidden="true" className="clay-sm tint-butter grid size-12 place-items-center bg-butter font-display text-2xl font-semibold">
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl">{step.title}</h3>
              <p className="mt-1 text-muted">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <Reveal>
        <section
          aria-labelledby="cta-heading"
          className="clay-lg tint-brand relative mt-24 grid items-center gap-6 overflow-hidden bg-brand-600 px-7 py-12 text-white sm:px-12 md:grid-cols-[1fr_auto]"
        >
          <span aria-hidden="true" className="clay-blob tint-pink absolute -top-10 -left-10 size-28 bg-pink" />
          <span aria-hidden="true" className="clay-blob tint-butter absolute right-1/3 -bottom-10 size-20 bg-butter" />
          <div className="relative">
            <h2 id="cta-heading" className="text-title">
              Free for students. No catch.
            </h2>
            <p className="mt-3 max-w-[48ch] text-lg text-brand-100">
              Reading, downloading and sharing cost nothing. A Pro plan is on the way for people who want more, and the free shelf stays free.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={status === 'authenticated' ? '/dashboard' : '/register'} className={buttonClass('secondary', 'lg')}>
                {status === 'authenticated' ? 'Open your dashboard' : 'Create a free account'}
              </Link>
              <Link to="/pricing" className="flex min-h-13 items-center rounded-[1.375rem] px-5 font-bold text-white underline decoration-2 underline-offset-4 hover:bg-white/10">
                See pricing
              </Link>
            </div>
          </div>
          <WelcomeArt className="relative hidden w-52 md:block" />
        </section>
      </Reveal>
    </>
  )
}
