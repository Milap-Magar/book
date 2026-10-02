import { createBrowserRouter } from 'react-router'
import { NotFoundPage, RouteErrorPage } from '@/app/ErrorPages'
import { DashboardPage, MyDownloadsPage, ProfilePage } from '@/features/account/AccountPages'
import { AdminBookFormPage } from '@/features/admin/AdminBookFormPage'
import { AdminBooksPage } from '@/features/admin/AdminBooksPage'
import { AdminCategoriesPage } from '@/features/admin/AdminCategoriesPage'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'
import { AdminResourcesPage } from '@/features/admin/AdminResourcesPage'
import { AdminUsersPage } from '@/features/admin/AdminUsersPage'
import { LoginPage, RegisterPage } from '@/features/auth/AuthPages'
import { BookDetailPage } from '@/features/books/BookDetailPage'
import { BooksPage } from '@/features/books/BooksPage'
import { HomePage } from '@/features/home/HomePage'
import { MyUploadsPage } from '@/features/resources/MyUploadsPage'
import { ResourcesPage } from '@/features/resources/ResourcesPage'
import { UploadResourcePage } from '@/features/resources/UploadResourcePage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { RequireAdmin, RequireAuth } from '@/layouts/guards'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      // Public
      { index: true, element: <HomePage /> },
      { path: 'books', element: <BooksPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // Signed-in users
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'uploads', element: <MyUploadsPage /> },
          { path: 'uploads/new', element: <UploadResourcePage /> },
          { path: 'downloads', element: <MyDownloadsPage /> },

          // Admins
          {
            path: 'admin',
            element: <RequireAdmin />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminDashboardPage /> },
                  { path: 'resources', element: <AdminResourcesPage /> },
                  { path: 'books', element: <AdminBooksPage /> },
                  { path: 'books/new', element: <AdminBookFormPage /> },
                  { path: 'books/:id/edit', element: <AdminBookFormPage /> },
                  { path: 'categories', element: <AdminCategoriesPage /> },
                  { path: 'users', element: <AdminUsersPage /> },
                ],
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
