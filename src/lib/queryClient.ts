import { dehydrate, hydrate, QueryClient, type QueryKey } from '@tanstack/react-query'
import { errorStatus } from '@/lib/api'

const MINUTE = 60_000

/*
 * The API runs on a small free-tier server, so the rule here is: never ask twice for something
 * the browser already has.
 *   - Data counts as fresh for five minutes. Moving between pages inside that time is free.
 *   - Nothing is refetched just because the window got focus or the network came back.
 *   - The user's own changes still show at once: every mutation updates or invalidates the
 *     queries it touches. Only other people's changes can be up to five minutes late.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * MINUTE,
      gcTime: 30 * MINUTE,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // A 4xx will not fix itself on retry. A network error or 5xx gets one more attempt,
      // after a pause: a server that is waking up needs time, not more requests.
      retry: (failureCount, error) => {
        const status = errorStatus(error)
        if (status !== undefined && status < 500) return false
        return failureCount < 1
      },
      retryDelay: 4000,
    },
  },
})

// ── The public catalogue survives a page reload ─────────────────────────────
// Books, categories and review lists are the same for everyone, so they are safe to keep in
// sessionStorage. Each entry keeps the time it was fetched, so the five-minute rule above still
// applies after a reload. Anything tied to an account (my review, admin lists) is never stored.

const STORE_KEY = 'shelfmallow.cache.v2'

// A v1 snapshot can hold a web page saved as book data (see rejectWebPage in lib/api.ts), which
// broke every page that read it until the tab was closed. It is dropped, never read.
try {
  sessionStorage.removeItem('shelfmallow.cache.v1')
} catch {
  // Storage is blocked: there is no snapshot to drop.
}

function isPublic(key: QueryKey): boolean {
  return key[0] === 'books' || key[0] === 'categories' || (key[0] === 'reviews' && key[2] === 'list')
}

function save() {
  try {
    const snapshot = dehydrate(queryClient, {
      shouldDehydrateQuery: (query) => query.state.status === 'success' && isPublic(query.queryKey),
    })
    sessionStorage.setItem(STORE_KEY, JSON.stringify(snapshot))
  } catch {
    // Storage is full or blocked: the cache simply does not outlive the page.
  }
}

try {
  const stored = sessionStorage.getItem(STORE_KEY)
  if (stored) hydrate(queryClient, JSON.parse(stored))
} catch {
  // A snapshot that cannot be read is worth nothing; the data is fetched again.
}

let saveTimer: ReturnType<typeof setTimeout> | undefined

queryClient.getQueryCache().subscribe((event) => {
  const changed = event.type === 'removed' || (event.type === 'updated' && event.action.type === 'success')
  if (!changed || !isPublic(event.query.queryKey)) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 1000)
})
