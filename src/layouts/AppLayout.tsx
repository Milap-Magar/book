import { Link, NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router'
import { buttonClass } from '@/components/buttonStyles'
import { useLogout } from '@/features/auth/api'
import { useSession } from '@/lib/session'

function navClass({ isActive }: { isActive: boolean }) {
  // The current page looks pressed in; the others are flat until hovered.
  return `rounded-2xl px-3.5 py-1.5 text-sm font-bold transition-colors ${
    isActive
      ? 'bg-brand-100 text-brand-700 shadow-[inset_0_3px_5px_rgb(var(--clay-tint)/0.22),inset_0_-2px_3px_rgb(255_255_255/0.9)]'
      : 'text-ink/60 hover:bg-brand-50 hover:text-ink'
  }`
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-brand-700">
      <span
        aria-hidden="true"
        className="clay-btn grid size-9 place-items-center bg-brand-600 text-lg text-white [--clay-tint:108_77_230]"
      >
        B
      </span>
      BookHub
    </Link>
  )
}

export function AppLayout() {
  const { status, user } = useSession()
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <div className="top-0 z-20 px-4 pt-4 sm:sticky">
        <header className="clay mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3">
          <Logo />

          <nav aria-label="Main" className="order-last flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto sm:flex-1">
            <NavLink to="/books" className={navClass}>
              Books
            </NavLink>
            <NavLink to="/resources" className={navClass}>
              Resources
            </NavLink>
            {status === 'authenticated' && (
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Nothing is shown while the session is being restored, to avoid a Login → name flicker. */}
          {status === 'authenticated' && user && (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink">
                <span aria-hidden="true" className="clay-sm grid size-8 place-items-center bg-peach font-display text-ink">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="sr-only sm:not-sr-only">{user.displayName}</span>
              </Link>
              <button
                type="button"
                className={buttonClass('secondary', 'sm')}
                disabled={logout.isPending}
                onClick={() => logout.mutate(undefined, { onSettled: () => void navigate('/') })}
              >
                Log out
              </button>
            </div>
          )}
          {status === 'anonymous' && (
            <div className="flex items-center gap-2">
              <Link to="/login" className={buttonClass('ghost', 'sm')}>
                Log in
              </Link>
              <Link to="/register" className={buttonClass('primary', 'sm')}>
                Sign up
              </Link>
            </div>
          )}
        </header>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-xs font-semibold text-ink/50">
        BookHub: books and study resources shared by students.
      </footer>
      <ScrollRestoration />
    </div>
  )
}
