import { NavLink, Outlet } from 'react-router'

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/resources', label: 'Moderation' },
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Users' },
]

export function AdminLayout() {
  return (
    <div>
      {/* A pressed-in track with the current section raised out of it. */}
      <nav aria-label="Admin" className="clay-well mb-8 inline-flex max-w-full flex-wrap gap-1 p-1.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-4 py-1.5 text-sm font-bold ${isActive ? 'clay-sm text-brand-700' : 'rounded-2xl text-muted hover:text-ink'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
