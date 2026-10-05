import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { PageSkeleton } from '@/components/Skeleton'
import { SiteFooter } from '@/layouts/SiteFooter'
import { SiteHeader } from '@/layouts/SiteHeader'

/** Landing pages and sign-in: wide sections, scroll animation, full footer. */
export function MarketingLayout() {
  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <SiteHeader variant="marketing" />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 sm:pt-12">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <SiteFooter />
        <ScrollRestoration />
      </div>
    </MotionProvider>
  )
}
