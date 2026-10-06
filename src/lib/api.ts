import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { session } from '@/lib/session'
import type { ApiErrorBody, AuthResponse } from '@/types/api'

// Trailing slash stripped so `${API_BASE}/auth/refresh` never becomes `/v1//auth/refresh`.
export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/+$/, '')

export const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const { token } = session.get()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

// Single flight: however many requests fail with 401 at once, only one refresh call is made.
// Refresh tokens rotate, so a second parallel call would be sent with an already-used token.
let refreshing: Promise<AuthResponse> | null = null

export function refreshSession(): Promise<AuthResponse> {
  refreshing ??= axios
    .post<AuthResponse>(`${API_BASE}/auth/refresh`, null, { withCredentials: true })
    .then((response) => {
      session.set(response.data)
      return response.data
    })
    .catch((error: unknown) => {
      session.clear()
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

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
    return 'Cannot reach the server. Check your connection and try again.'
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
