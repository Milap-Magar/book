import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/Button'
import { buttonClass, type ButtonSize } from '@/components/buttonStyles'
import { errorMessage } from '@/lib/api'
import { openSignedUrl } from '@/lib/download'
import { useSession } from '@/lib/session'
import type { Disposition, DownloadLink } from '@/types/api'

interface DownloadButtonsProps {
  request: (disposition: Disposition) => Promise<DownloadLink>
  size?: ButtonSize
}

/** "Read" opens the PDF in a new tab, "Download" saves it. Both need a signed-in user. */
export function DownloadButtons({ request, size = 'md' }: DownloadButtonsProps) {
  const { status } = useSession()
  const location = useLocation()
  const [busy, setBusy] = useState<Disposition | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (status !== 'authenticated') {
    return (
      <Link
        to="/login"
        state={{ from: location.pathname + location.search }}
        className={buttonClass('secondary', size)}
      >
        Log in to read or download
      </Link>
    )
  }

  async function run(disposition: Disposition) {
    setBusy(disposition)
    setError(null)
    try {
      await openSignedUrl(disposition, () => request(disposition))
    } catch (caught) {
      setError(errorMessage(caught, 'Could not get the file. Please try again.'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button size={size} loading={busy === 'inline'} disabled={busy !== null} onClick={() => void run('inline')}>
          Read
        </Button>
        <Button
          size={size}
          variant="secondary"
          loading={busy === 'attachment'}
          disabled={busy !== null}
          onClick={() => void run('attachment')}
        >
          Download
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
