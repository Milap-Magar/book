interface ImportMetaEnv {
  /** Base URL for API calls. Unset means `/api/v1` on the page's own origin (see README, Deploying). */
  readonly VITE_API_URL?: string
  /** "true" once the API has file storage: resources, downloads, book PDFs and covers. */
  readonly VITE_FEATURE_FILES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface MockAccount {
  email: string
  password: string
}

/** Set by vite.config.ts. Null unless the app runs with `npm run dev:mock`. */
declare const __MOCK_ACCOUNTS__: { admin: MockAccount; student: MockAccount } | null
