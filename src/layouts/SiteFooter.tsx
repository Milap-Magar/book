import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'

const columns = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/genres', label: 'Genres' },
      { to: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Library',
    links: [
      { to: '/books', label: 'Books' },
      { to: '/resources', label: 'Notes and papers' },
      { to: '/uploads/new', label: 'Share a resource' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Log in' },
      { to: '/register', label: 'Sign up' },
      { to: '/dashboard', label: 'Dashboard' },
    ],
  },
]

const YEAR = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="mt-20 px-4 pb-6">
      <div className="clay-well mx-auto grid max-w-6xl gap-10 px-6 py-10 sm:px-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Books, notes and past papers, shared by students and checked before they go public.</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-sans text-xs font-extrabold tracking-wider text-muted uppercase">{column.title}</h2>
            <ul className="mt-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="flex min-h-9 items-center text-sm font-bold text-ink/80 hover:text-brand-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mt-5 text-center text-xs font-semibold text-muted">© {YEAR} Shelfmallow. Made for students.</p>
    </footer>
  )
}
