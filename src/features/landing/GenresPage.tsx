import { Link } from 'react-router'
import { Reveal } from '@/components/motion/Reveal'
import { TileGridSkeleton } from '@/components/Skeleton'
import { EmptyState, QueryState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'
import { useCategories } from '@/features/categories/api'
import { GenreTile, SectionHeading } from '@/features/landing/parts'

export function GenresPage() {
  const categories = useCategories()

  return (
    <>
      <SectionHeading
        level="h1"
        eyebrow="Genres"
        title="Pick a shelf"
        lead="Every book and resource is filed under one subject. Choose yours and see what other students are reading."
      />
      <QueryState
        query={categories}
        loading={<TileGridSkeleton />}
        isEmpty={(data) => data.length === 0}
        empty={
          <EmptyState
            title="No genres yet"
            hint="They appear here as soon as an admin adds the first one."
            action={
              <Link to="/books" className={buttonClass('secondary')}>
                Browse all books
              </Link>
            }
          />
        }
      >
        {(data) => (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((category, index) => (
              <Reveal as="li" key={category.id} delay={Math.min(index, 8) * 0.05}>
                <GenreTile category={category} index={index} detailed />
              </Reveal>
            ))}
          </ul>
        )}
      </QueryState>

      <div className="clay-well mt-12 flex flex-wrap items-center justify-between gap-4 px-7 py-6">
        <p className="font-display text-xl font-medium">Not sure where it is filed?</p>
        <Link to="/books" className={buttonClass('primary')}>
          Search every book
        </Link>
      </div>
    </>
  )
}
