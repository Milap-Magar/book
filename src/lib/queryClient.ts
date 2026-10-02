import { QueryClient } from '@tanstack/react-query'
import { errorStatus } from '@/lib/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // A 4xx will not fix itself on retry; network errors and 5xx get two more attempts.
      retry: (failureCount, error) => {
        const status = errorStatus(error)
        if (status !== undefined && status < 500) return false
        return failureCount < 2
      },
    },
  },
})
