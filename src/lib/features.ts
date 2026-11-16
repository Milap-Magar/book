/**
 * Parts of the contract (docs/BACKEND_TASKS.md, stages 4 and 5) that need file storage on the
 * server: study resources, downloads, and the PDF and cover of a book. The Spring Boot API does
 * not have them yet, so by default the app hides them and, more importantly, never requests
 * them: a call that can only answer 404 is wasted work for a small server.
 *
 * `npm run dev:mock` has them all. Set VITE_FEATURE_FILES=true once the API does too
 * (or =false to see the app without them while running the mock).
 */
const flag = import.meta.env.VITE_FEATURE_FILES

export const features = {
  files: flag === undefined || flag === '' ? import.meta.env.MODE === 'mock' : flag === 'true',
}
