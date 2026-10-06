import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { buttonClass } from '@/components/buttonStyles'
import { useLogout } from '@/features/auth/api'
import { useSession } from '@/lib/session'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const MARKETING: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/genres', label: 'Genres' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
]

function navClass({ isActive }: { isActive: boolean }) {
  // The current page looks pressed in; the others are flat until hovered.
  return `flex min-h-11 items-center rounded-2xl px-4 text-[0.9375rem] font-bold transition-colors ${
    isActive
      ? 'bg-brand-100 text-brand-700 shadow-[inset_0_3px_5px_rgb(var(--clay-tint)/0.22),inset_0_-2px_3px_rgb(255_255_255/0.9)]'
      : 'text-ink/70 hover:bg-brand-50 hover:text-ink'
  }`
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.600" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

/**
 * The floating clay bar at the top of every page. The landing pages show the marketing
 * links; inside the app the same bar shows the library links instead.
 */
export function SiteHeader({ variant }: { variant: 'marketing' | 'app' }) {
  const { status, user } = useSession()
  const logout = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Close the mobile menu after a navigation.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const items: NavItem[] =
    variant === 'marketing'
      ? MARKETING
      : [
          { to: '/books', label: 'Books' },
          { to: '/resources', label: 'Resources' },
          ...(status === 'authenticated' ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
          ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin' }] : []),
        ]

  const links = items.map((item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
      {item.label}
    </NavLink>
  ))

  // Nothing is shown while the session is being restored, to avoid a Log in → name flicker.
  const account =
    status === 'authenticated' && user ? (
      <>
        {variant === 'marketing' && (
          <Link to="/dashboard" className={buttonClass('primary')}>
            Open dashboard
          </Link>
        )}
        <Link to="/profile" className="flex min-h-11 items-center gap-2 text-sm font-bold text-ink/80 hover:text-ink">
          <span aria-hidden="true" className="clay-sm tint-peach grid size-10 place-items-center bg-peach font-display text-lg text-ink">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
          <span className={variant === 'marketing' ? 'sr-only' : 'max-w-32 truncate'}>{user.displayName}</span>
        </Link>
        {variant === 'app' && (
          <button
            type="button"
            className={buttonClass('secondary')}
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => void navigate('/') })}
          >
            Log out
          </button>
        )}
      </>
    ) : status === 'anonymous' ? (
      <>
        <Link to="/login" className={buttonClass('ghost')}>
          Log in
        </Link>
        <Link to="/register" className={buttonClass('primary')}>
          Sign up
        </Link>
      </>
    ) : null

  return (
    <div className="sticky top-0 z-30 px-4 pt-4">
      <header className="clay relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5 sm:px-5">
        <Link to="/" aria-label="Shelfmallow home" className="rounded-2xl">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {links}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">{account}</div>

        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-2xl text-ink hover:bg-brand-50 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <MenuIcon open={open} />
        </button>

        {open && (
          <div id="mobile-menu" className="clay absolute inset-x-0 top-full mt-2 animate-pop p-3 md:hidden">
            <nav aria-label="Main" className="flex flex-col gap-1">
              {links}
            </nav>
            {account && <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-line pt-3">{account}</div>}
          </div>
        )}
      </header>
    </div>
  )
}
