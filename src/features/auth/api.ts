import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { session } from '@/lib/session'
import type { AuthResponse, User } from '@/types/api'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  displayName: string
}

// withCredentials lets the browser store and send the refresh cookie when the API is on another origin.
const withCookie = { withCredentials: true }

async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input, withCookie)
  return data
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (auth) => session.set(auth),
  })
}

/** Registering returns the user but no token, so we log in straight after. */
export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await api.post<User>('/auth/register', input)
      return login({ email: input.email, password: input.password })
    },
    onSuccess: (auth) => session.set(auth),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api.post('/auth/logout', null, withCookie),
    // Clear locally even if the request failed: the user asked to be logged out.
    onSettled: () => {
      session.clear()
      queryClient.clear()
    },
  })
}
