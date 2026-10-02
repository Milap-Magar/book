import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Input } from '@/components/Field'
import { FormError } from '@/components/States'
import { useLogin, useRegister } from '@/features/auth/api'
import { applyFieldErrors } from '@/lib/api'
import { useSession } from '@/lib/session'

// Same limits as the backend (docs/BACKEND_TASKS.md → Auth). The backend still validates everything.
const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'At least 2 characters').max(50, 'At most 50 characters'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters').max(72, 'At most 72 characters'),
})

const demoAccounts = __MOCK_ACCOUNTS__

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

/** Where to go after signing in: the page that sent the user here, or the dashboard. */
function useReturnPath(): string {
  const state: unknown = useLocation().state
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from
  }
  return '/dashboard'
}

function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-center text-3xl">{title}</h1>
      <div className="clay p-7">{children}</div>
      <p className="mt-4 text-center text-sm text-ink/70">{footer}</p>
    </div>
  )
}

export function LoginPage() {
  const { status } = useSession()
  const returnPath = useReturnPath()
  const location = useLocation()
  const login = useLogin()
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  // Covers both "already signed in" and "just signed in".
  if (status === 'authenticated') return <Navigate to={returnPath} replace />

  return (
    <AuthCard
      title="Log in"
      footer={
        <>
          New here?{' '}
          <Link to="/register" state={location.state} className="font-medium text-brand-700 underline">
            Create an account
          </Link>
        </>
      }
    >
      <form noValidate className="space-y-4" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
        <Input label="Email" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <FormError error={login.error} />
        <Button type="submit" loading={login.isPending} className="w-full">
          Log in
        </Button>
      </form>

      {/* Only rendered by `npm run dev:mock`; the constant is null in every other mode. */}
      {demoAccounts && (
        <div className="clay-well mt-6 p-4 text-center">
          <p className="mb-3 text-xs font-bold text-ink/60">Mock data is on. Sign in as a demo user:</p>
          <div className="flex justify-center gap-2">
            <Button size="sm" variant="secondary" disabled={login.isPending} onClick={() => login.mutate(demoAccounts.student)}>
              Student
            </Button>
            <Button size="sm" variant="secondary" disabled={login.isPending} onClick={() => login.mutate(demoAccounts.admin)}>
              Admin
            </Button>
          </div>
        </div>
      )}
    </AuthCard>
  )
}

export function RegisterPage() {
  const { status } = useSession()
  const returnPath = useReturnPath()
  const location = useLocation()
  const register = useRegister()
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })
  const { errors } = form.formState

  if (status === 'authenticated') return <Navigate to={returnPath} replace />

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-medium text-brand-700 underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          register.mutate(values, { onError: (error) => applyFieldErrors(error, form.setError) }),
        )}
      >
        <Input label="Name" autoComplete="name" error={errors.displayName?.message} {...form.register('displayName')} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register('email')} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...form.register('password')}
        />
        <FormError error={register.error} />
        <Button type="submit" loading={register.isPending} className="w-full">
          Sign up
        </Button>
      </form>
    </AuthCard>
  )
}
