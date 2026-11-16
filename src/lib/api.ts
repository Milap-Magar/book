import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { session } from '@/lib/session'
import type { ApiErrorBody, AuthResponse } from '@/types/api'

// Trailing slash stripped so `${API_BASE}/auth/refresh` never becomes `/v1//auth/refresh`.
export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/+$/, '')

// A sleeping free-tier server needs up to a minute to wake, so the limit is generous.
export const api = axios.create({ baseURL: API_BASE, timeout: 90_000 })

/**
 * A static host answers a path it does not know with index.html and status 200. When the API
 * address is wrong, that page arrives here looking like a successful answer. It is turned into
 * a failure, so a web page is never rendered, or kept in the cache, as if it were data.
 */
function rejectWebPage<T>(response: AxiosResponse<T>): AxiosResponse<T> {
  const type = String(response.headers['content-type'] ?? '')
  if (typeof response.data === 'string' && type.includes('text/html')) {
    throw new AxiosError('The API answered with a web page instead of data. Check VITE_API_URL.', AxiosError.ERR_BAD_RESPONSE, response.config, response.request, response)
  }
  return response
}

api.interceptors.response.use(rejectWebPage)

/** Renew this long before the token really expires, to allow for the request's travel time. */
const EXPIRY_MARGIN_MS = 10_000

api.interceptors.request.use(async (config) => {
  // A token that is about to expire is renewed before the request goes out. Sending it anyway
  // would cost three requests (the 401, the refresh, the retry) instead of two.
  const { status, expiresAt } = session.get()
  if (status === 'authenticated' && expiresAt - Date.now() < EXPIRY_MARGIN_MS && !config.url?.startsWith('/auth/')) {
    await refreshSession().catch(() => undefined)
  }

  const { token } = session.get()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

// Single flight: however many requests need a new token at once, only one refresh call is made.
// Refresh tokens rotate, so a second parallel call would be sent with an already-used token.
let refreshing: Promise<AuthResponse> | null = null

export function refreshSession(): Promise<AuthResponse> {
  refreshing ??= axios
    .post<AuthResponse>(`${API_BASE}/auth/refresh`, null, { withCredentials: true, timeout: 90_000 })
    .then(rejectWebPage)
    .then((response) => {
      session.set(response.data)
      return response.data
    })
    .catch((error: unknown) => {
      // Only an answer from the server ("that cookie is no good") signs the user out for good.
      // No answer at all is a network problem: the cookie may be fine, so it is tried again later.
      session.clear({ forget: errorStatus(error) !== undefined })
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

/**
 * Called once, before React renders. Exchanges the refresh cookie for an access token, but only
 * in a browser that has signed in before: everyone else is anonymous without asking the server.
 */
export function restoreSession(): void {
  if (!session.mayHaveCookie()) {
    session.clear()
    return
  }
  // A failure just means "not logged in"; refreshSession already marked the session anonymous.
  refreshSession().catch(() => undefined)
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

// Safety net for a token the server rejects although the clock said it was still good
// (the API restarted with a new signing key, or this computer's clock is off).
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as RetriableConfig | undefined
  const expired =
    error.response?.status === 401 &&
    original !== undefined &&
    !original._retried &&
    !original.url?.startsWith('/auth/') &&
    session.get().status === 'authenticated'

  if (!expired) throw error

  original._retried = true
  try {
    await refreshSession()
  } catch {
    throw error
  }
  // The request interceptor runs again and attaches the new token.
  return api(original)
})

function errorBody(error: unknown): Partial<ApiErrorBody> | undefined {
  if (!axios.isAxiosError(error)) return undefined
  const data: unknown = error.response?.data
  return typeof data === 'object' && data !== null ? (data as Partial<ApiErrorBody>) : undefined
}

export function errorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error) && !error.response) {
    return error.code === 'ECONNABORTED'
      ? 'The server took too long to answer. It may still be waking up; try again in a moment.'
      : 'Cannot reach the server. Check your connection and try again.'
  }
  const message = errorBody(error)?.message
  // Spring answers an unmapped URL with 404 "No static resource ...". That means the endpoint
  // has not been built yet, which is not something to show a user word for word.
  if (errorStatus(error) === 404 && message?.startsWith('No static resource')) {
    return 'This feature is not available on the server yet.'
  }
  return message ?? fallback
}

/** True when the server has no such endpoint at all (as opposed to "this item was not found"). */
export function isMissingEndpoint(error: unknown): boolean {
  return errorStatus(error) === 404 && (errorBody(error)?.message?.startsWith('No static resource') ?? false)
}

/** Copies the backend's `fieldErrors` onto the matching form fields. Returns true if any were set. */
export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  const fieldErrors = errorBody(error)?.fieldErrors
  if (!fieldErrors) return false
  for (const [field, message] of Object.entries(fieldErrors)) {
    setError(field as Path<T>, { type: 'server', message })
  }
  return Object.keys(fieldErrors).length > 0
}
