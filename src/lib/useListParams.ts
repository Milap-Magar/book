import { useSearchParams } from 'react-router'

/**
 * List filters live in the URL, not in component state: a filtered page can be
 * bookmarked, shared, and survives the back button and a reload.
 */
export function useListParams() {
  const [params, setParams] = useSearchParams()

  const page = Math.max(0, Number(params.get('page') ?? 0) || 0)
  const get = (key: string) => params.get(key) ?? ''

  /** Changing a filter goes back to the first page; pass `page` to change only the page. */
  function set(changes: Record<string, string | number | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (!('page' in changes)) next.delete('page')
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || value === '' || (key === 'page' && value === 0)) next.delete(key)
          else next.set(key, String(value))
        }
        return next
      },
      { replace: true },
    )
  }

  return { page, get, set }
}
