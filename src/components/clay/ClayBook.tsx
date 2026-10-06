import { useState } from 'react'
import type { BookSummary } from '@/types/api'

// Books without a cover get one of these, picked by id so a book always keeps its colour.
// [cover colour, shadow tint]
const TINTS = [
  ['bg-mint', 'tint-mint'],
  ['bg-peach', 'tint-peach'],
  ['bg-sky', 'tint-sky'],
  ['bg-pink', 'tint-pink'],
  ['bg-butter', 'tint-butter'],
  ['bg-brand-200', 'tint-brand'],
]

// Corner radii are percentages so the book keeps its shape at any size: tight on the spine
// side, round on the side that opens.
const COVER_RADIUS = 'rounded-[5%_11%_11%_5%/3.500%_7.500%_7.500%_3.500%]'

interface ClayBookProps {
  book: Pick<BookSummary, 'id' | 'title' | 'coverUrl'>
  className?: string
  /** For covers above the fold. Everything else loads lazily. */
  eager?: boolean
}

/**
 * A book modelled in clay. The cover art comes from the API (`coverUrl`); everything that
 * makes it look like an object is drawn here: the block of pages showing on the right,
 * the spine crease, the gloss and the coloured shadow.
 */
export function ClayBook({ book, className = '', eager = false }: ClayBookProps) {
  const [failed, setFailed] = useState(false)
  const showImage = book.coverUrl && !failed
  const [fill, tint] = TINTS[book.id % TINTS.length]

  return (
    <div aria-hidden="true" className={`@container relative aspect-[2/3] w-full ${tint} ${className}`}>
      {/* Page block: sits behind the cover and peeks out on the right and bottom. */}
      <div className="absolute top-[3%] right-0 bottom-[1.500%] left-[8%] rounded-[4%_9%_9%_4%/3%_6%_6%_3%] bg-cream bg-[repeating-linear-gradient(90deg,transparent_0_2px,rgb(0_0_0/0.05)_2px_3px)] shadow-[inset_-2px_-2px_4px_rgb(0_0_0/0.12),0_16px_22px_-14px_rgb(var(--clay-tint)/0.8)]" />

      <div className={`absolute inset-y-0 right-[4.500%] left-0 overflow-hidden ${fill} ${COVER_RADIUS}`}>
        {showImage ? (
          <img
            src={book.coverUrl!}
            alt=""
            width={320}
            height={480}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            onError={() => setFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          // No cover (or it failed to load): the title on a pastel slab instead of a broken image.
          <div className="flex size-full items-center justify-center p-[10%] pl-[16%] text-center font-display text-[11cqw] leading-tight font-medium text-ink/80">
            <span className="line-clamp-4">{book.title}</span>
          </div>
        )}
        {/* Spine: a soft crease down the left edge. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[9%] bg-linear-to-r from-black/25 via-white/15 via-60% to-transparent" />
        {/* Gloss. A separate layer, because an inset shadow on the cover itself would be
            hidden behind the image. */}
        <div
          className={`pointer-events-none absolute inset-0 shadow-[inset_0_-9px_10px_-6px_rgb(0_0_0/0.25),inset_0_7px_8px_-5px_rgb(255_255_255/0.7),inset_-5px_0_8px_-5px_rgb(0_0_0/0.18),inset_0_0_0_1px_rgb(0_0_0/0.05)] ${COVER_RADIUS}`}
        />
      </div>
    </div>
  )
}
