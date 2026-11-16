import { Button } from '@/components/Button'

interface PaginationProps {
  /** 0-based, as the API returns it. */
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center">
      {/* A pressed-in track: the two buttons are raised out of it, the page number sits in it. */}
      <div className="clay-well inline-flex items-center gap-1.5 p-1.5">
        <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          <span aria-hidden="true">←</span> Previous
        </Button>
        <span className="px-3 text-sm font-bold text-muted">
          Page <span className="text-ink">{page + 1}</span> of {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
          Next <span aria-hidden="true">→</span>
        </Button>
      </div>
    </nav>
  )
}
