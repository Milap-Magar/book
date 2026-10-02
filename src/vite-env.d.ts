interface ImportMetaEnv {
  readonly VITE_API_URL?: string
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
