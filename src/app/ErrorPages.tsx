import { Link, useRouteError } from 'react-router'
import { EmptyArt, NotFoundArt } from '@/components/illustrations/Scenes'
import { EmptyState } from '@/components/States'
import { buttonClass } from '@/components/buttonStyles'

const homeLink = (
  <Link to="/" className={buttonClass('secondary')}>
    Go to the home page
  </Link>
)

export function NotFoundPage() {
  return <EmptyState art={<NotFoundArt className="w-36" />} title="This page is not on the shelf" hint="The address may be wrong, or the page may have moved." action={homeLink} />
}

/** Shown when a page throws while rendering, instead of a blank screen. */
export function RouteErrorPage() {
  const error = useRouteError()
  console.error(error)
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState art={<NotFoundArt className="w-36" />} title="Something went wrong" hint="Reload the page. If it keeps happening, try again later." action={homeLink} />
    </div>
  )
}

/**
 * Stands in for the pages that need file storage on the server (resources, uploads, downloads)
 * until the API has it. Old links and bookmarks land here instead of on a page full of errors.
 */
export function ComingSoonPage() {
  return (
    <EmptyState
      art={<EmptyArt className="w-36" />}
      title="This shelf is still being built"
      hint="Sharing notes and downloading files are on the way. Books, subjects and reviews are open now."
      action={
        <Link to="/books" className={buttonClass('primary')}>
          Browse books
        </Link>
      }
    />
  )
}
