import { Suspense } from 'react'
import { Link, Outlet, ScrollRestoration } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { PageSkeleton } from '@/components/Skeleton'

/** Sign-in and sign-up: no header or footer, just the logo home and the card, centred. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 overflow-x-clip px-4 py-10">
      <Link to="/" aria-label="Shelfmallow home" className="rounded-2xl">
        <Logo />
      </Link>
      <main className="w-full">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollRestoration />
    </div>
  )
}
