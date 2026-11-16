import { NavLink, Outlet } from 'react-router'
import { segmentClass } from '@/components/buttonStyles'
import { features } from '@/lib/features'

const links = [
  { to: '/admin', label: 'Overview', end: true },
  // Moderation needs uploads, which need file storage on the server.
  ...(features.files ? [{ to: '/admin/resources', label: 'Moderation' }] : []),
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/categories', label: 'Subjects' },
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
            className={({ isActive }) => segmentClass(isActive)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
