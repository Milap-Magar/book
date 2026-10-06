import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { NotFoundPage, RouteErrorPage } from '@/app/ErrorPages'
import { PageSkeleton } from '@/components/Skeleton'
import { AppLayout } from '@/layouts/AppLayout'
import { RequireAdmin, RequireAuth } from '@/layouts/guards'
import { MarketingLayout } from '@/layouts/MarketingLayout'

/**
 * Every page is its own chunk, fetched when its route is first visited: a visitor on the
 * landing page never downloads the admin screens. `page` adapts a module with named
 * exports to what React Router's `lazy` expects.
 */
function page<Name extends string>(load: () => Promise<Record<Name, ComponentType>>, name: Name) {
  return async () => ({ Component: (await load())[name] })
}

const landing = () => import('@/features/landing/LandingPage')
const auth = () => import('@/features/auth/AuthPages')
const account = () => import('@/features/account/AccountPages')

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    HydrateFallback: () => (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageSkeleton />
      </div>
    ),
    children: [
      // Landing pages and sign-in
      {
        element: <MarketingLayout />,
        children: [
          { index: true, lazy: page(landing, 'LandingPage') },
          { path: 'genres', lazy: page(() => import('@/features/landing/GenresPage'), 'GenresPage') },
          { path: 'features', lazy: page(() => import('@/features/landing/FeaturesPage'), 'FeaturesPage') },
          { path: 'pricing', lazy: page(() => import('@/features/landing/PricingPage'), 'PricingPage') },
          { path: 'login', lazy: page(auth, 'LoginPage') },
          { path: 'register', lazy: page(auth, 'RegisterPage') },
        ],
      },

      {
        element: <AppLayout />,
        children: [
          // Public library
          { path: 'books', lazy: page(() => import('@/features/books/BooksPage'), 'BooksPage') },
          { path: 'books/:id', lazy: page(() => import('@/features/books/BookDetailPage'), 'BookDetailPage') },
          { path: 'resources', lazy: page(() => import('@/features/resources/ResourcesPage'), 'ResourcesPage') },

          // Signed-in users
          {
            element: <RequireAuth />,
            children: [
              { path: 'dashboard', lazy: page(account, 'DashboardPage') },
              { path: 'profile', lazy: page(account, 'ProfilePage') },
              { path: 'downloads', lazy: page(account, 'MyDownloadsPage') },
              { path: 'uploads', lazy: page(() => import('@/features/resources/MyUploadsPage'), 'MyUploadsPage') },
              { path: 'uploads/new', lazy: page(() => import('@/features/resources/UploadResourcePage'), 'UploadResourcePage') },

              // Admins
              {
                path: 'admin',
                element: <RequireAdmin />,
                children: [
                  {
                    lazy: page(() => import('@/layouts/AdminLayout'), 'AdminLayout'),
                    children: [
                      { index: true, lazy: page(() => import('@/features/admin/AdminDashboardPage'), 'AdminDashboardPage') },
                      { path: 'resources', lazy: page(() => import('@/features/admin/AdminResourcesPage'), 'AdminResourcesPage') },
                      { path: 'books', lazy: page(() => import('@/features/admin/AdminBooksPage'), 'AdminBooksPage') },
                      { path: 'books/new', lazy: page(() => import('@/features/admin/AdminBookFormPage'), 'AdminBookFormPage') },
                      { path: 'books/:id/edit', lazy: page(() => import('@/features/admin/AdminBookFormPage'), 'AdminBookFormPage') },
                      { path: 'categories', lazy: page(() => import('@/features/admin/AdminCategoriesPage'), 'AdminCategoriesPage') },
                      { path: 'users', lazy: page(() => import('@/features/admin/AdminUsersPage'), 'AdminUsersPage') },
                    ],
                  },
                ],
              },
            ],
          },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
