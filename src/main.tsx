import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from '@/app/router'
import { refreshSession } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import './index.css'

// Restore the session once, before React renders: the refresh cookie (if any) is exchanged
// for a new access token. A failure just means "not logged in", so it is ignored here;
// refreshSession already marks the session anonymous.
refreshSession().catch(() => undefined)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
