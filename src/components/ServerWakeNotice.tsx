import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Mallow } from '@/components/illustrations/Mallow'
import { useSession } from '@/lib/session'

/** How long a request may run before the notice appears. A server that is awake answers well inside this. */
const PATIENCE_MS = 4000

/**
 * The API is on free hosting that goes to sleep when nobody uses it; the first request after a
 * nap can take most of a minute. This says so, instead of leaving a skeleton on screen with no
 * explanation. It only watches requests the app was making anyway and never sends one itself.
 */
export function ServerWakeNotice() {
  const requests = useIsFetching() + useIsMutating()
  const restoring = useSession().status === 'loading'
  const busy = requests > 0 || restoring
  const [slow, setSlow] = useState(false)

  if (!busy && slow) setSlow(false)

  useEffect(() => {
    if (!busy) return
    const timer = setTimeout(() => setSlow(true), PATIENCE_MS)
    return () => clearTimeout(timer)
  }, [busy])

  if (!slow) return null

  return (
    <div role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex justify-center">
      <div className="clay tint-brand flex max-w-md animate-pop items-center gap-3 py-3 pr-5 pl-3">
        <Mallow mood="sleepy" className="w-14 shrink-0" />
        <p className="text-sm">
          <span className="block font-display text-base font-medium">Waking the shelf up…</span>
          <span className="text-muted">The server naps when nobody is reading. The first page can take up to a minute.</span>
        </p>
      </div>
    </div>
  )
}
