import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { MOCK_ACCOUNTS, mockApi } from './mock/api.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // `npm run dev:mock` → the API is answered in-process by mock/api.ts, no backend needed.
  const mock = mode === 'mock'

  return {
    plugins: [react(), tailwindcss(), ...(mock ? [mockApi()] : [])],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    define: {
      // Lets the login page offer the demo accounts, and only in mock mode.
      __MOCK_ACCOUNTS__: JSON.stringify(mock ? MOCK_ACCOUNTS : null),
    },
    server: {
      // The browser only ever talks to the Vite origin; Vite forwards /api to Spring Boot.
      // Same origin means no CORS in development and the refresh cookie is first-party.
      proxy: mock
        ? undefined
        : {
            '/api': {
              target: env.API_PROXY_TARGET || 'http://localhost:8080',
              changeOrigin: true,
            },
          },
    },
  }
})
