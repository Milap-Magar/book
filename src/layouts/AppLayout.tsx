import { Suspense } from 'react'
import { Link, Outlet, ScrollRestoration } from 'react-router'
import { PageSkeleton } from '@/components/Skeleton'
import { SiteHeader } from '@/layouts/SiteHeader'

/** The library and everything behind sign-in. */
const YEAR = new Date().getFullYear()

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="app" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-8 text-xs font-semibold text-muted">
        <span>© {YEAR} Shelfmallow</span>
        <Link to="/features" className="hover:text-brand-700">
          Features
        </Link>
        <Link to="/pricing" className="hover:text-brand-700">
          Pricing
        </Link>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
