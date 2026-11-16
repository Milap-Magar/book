import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import { MOCK_ACCOUNTS, mockApi } from './mock/api.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // `npm run dev:mock` → the API is answered in-process by mock/api.ts, no backend needed.
  const mock = mode === 'mock'

  // The browser only ever talks to the Vite origin; Vite forwards /api to the Spring Boot API.
  // Same origin means no CORS in development and the refresh cookie is first-party.
  const proxy: Record<string, ProxyOptions> | undefined = mock
    ? undefined
    : {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          configure(server) {
            // The call now comes from this dev server, not from a page on another site, so the
            // browser's Origin header is dropped. With it, the API would check its CORS list
            // and refuse any dev URL that is not on it (a second Vite on port 5174, a LAN address).
            server.on('proxyReq', (request) => request.removeHeader('origin'))
            // An https API marks the refresh cookie Secure. This page is plain http://localhost,
            // where not every browser stores a Secure cookie, so the flag is removed on the way back.
            server.on('proxyRes', (response) => {
              const cookies = response.headers['set-cookie']
              if (cookies) response.headers['set-cookie'] = cookies.map((cookie) => cookie.replace(/;\s*Secure/gi, ''))
            })
          },
        },
      }

  return {
    plugins: [react(), tailwindcss(), ...(mock ? [mockApi()] : [])],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    define: {
      // Lets the login page offer the demo accounts, and only in mock mode.
      __MOCK_ACCOUNTS__: JSON.stringify(mock ? MOCK_ACCOUNTS : null),
    },
    server: { proxy },
    // `npm run preview` serves the production build with the same forwarding.
    preview: { proxy },
  }
})
