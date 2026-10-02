import type { Disposition, DownloadLink } from '@/types/api'

/**
 * Asks the API for a signed URL, then sends the browser to it.
 * For "inline" the tab is opened before the request: browsers block window.open
 * when it happens after an await, because it no longer counts as a user click.
 */
export async function openSignedUrl(disposition: Disposition, request: () => Promise<DownloadLink>): Promise<void> {
  if (disposition === 'attachment') {
    const { url } = await request()
    // An attachment response downloads the file without leaving the page.
    window.location.assign(url)
    return
  }

  const tab = window.open('', '_blank')
  try {
    const { url } = await request()
    if (tab) tab.location.href = url
    else window.location.assign(url)
  } catch (error) {
    tab?.close()
    throw error
  }
}
