import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from '@/app/router'
import { ServerWakeNotice } from '@/components/ServerWakeNotice'
import { restoreSession } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import './index.css'

// Restore the session once, before React renders (see restoreSession for when it is skipped).
restoreSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ServerWakeNotice />
    </QueryClientProvider>
  </StrictMode>,
)
