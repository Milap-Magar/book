import { useSyncExternalStore } from 'react'
import type { AuthResponse, User } from '@/types/api'

// The access token lives only in memory: a page reload loses it and the refresh cookie restores it.
// It is kept outside React so the axios interceptors can read it.

export interface SessionState {
  status: 'loading' | 'authenticated' | 'anonymous'
  user: User | null
  token: string | null
}

let state: SessionState = { status: 'loading', user: null, token: null }
const listeners = new Set<() => void>()

function update(next: SessionState) {
  state = next
  listeners.forEach((listener) => listener())
}

export const session = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  set(auth: AuthResponse) {
    update({ status: 'authenticated', user: auth.user, token: auth.accessToken })
  },
  setUser(user: User) {
    update({ ...state, user })
  },
  clear() {
    update({ status: 'anonymous', user: null, token: null })
  },
}

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get)
}
