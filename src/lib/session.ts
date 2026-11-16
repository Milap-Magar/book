import { useSyncExternalStore } from 'react'
import type { AuthResponse, User } from '@/types/api'

// The access token lives only in memory: a page reload loses it and the refresh cookie restores it.
// It is kept outside React so the axios interceptors can read it.

export interface SessionState {
  status: 'loading' | 'authenticated' | 'anonymous'
  user: User | null
  token: string | null
  /** When the access token stops working, in epoch milliseconds. 0 when there is no token. */
  expiresAt: number
}

let state: SessionState = { status: 'loading', user: null, token: null, expiresAt: 0 }
const listeners = new Set<() => void>()

function update(next: SessionState) {
  state = next
  listeners.forEach((listener) => listener())
}

// The refresh cookie is httpOnly, so JavaScript cannot see whether one exists. This flag is the
// next best thing: "this browser signed in and has not signed out". It holds no secret. Without
// it, every visitor would cost the API a refresh call on every page load just to hear "no".
const HINT_KEY = 'shelfmallow.signed-in'

function setHint(on: boolean) {
  try {
    if (on) localStorage.setItem(HINT_KEY, '1')
    else localStorage.removeItem(HINT_KEY)
  } catch {
    // Storage can be blocked (private mode). The session then lasts until the tab reloads.
  }
}

export const session = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  /** True when this browser signed in before, so a refresh cookie probably exists. */
  mayHaveCookie(): boolean {
    try {
      return localStorage.getItem(HINT_KEY) === '1'
    } catch {
      return false
    }
  },
  set(auth: AuthResponse) {
    setHint(true)
    update({
      status: 'authenticated',
      user: auth.user,
      token: auth.accessToken,
      expiresAt: Date.now() + auth.expiresIn * 1000,
    })
  },
  setUser(user: User) {
    update({ ...state, user })
  },
  /**
   * `forget: false` keeps the signed-in hint: used when the server could not be reached, so the
   * next page load tries the refresh cookie again instead of treating the user as signed out.
   */
  clear({ forget = true }: { forget?: boolean } = {}) {
    if (forget) setHint(false)
    update({ status: 'anonymous', user: null, token: null, expiresAt: 0 })
  },
}

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get)
}
