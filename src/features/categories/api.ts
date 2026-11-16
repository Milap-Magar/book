import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { bookKeys } from '@/features/books/api'
import type { Category } from '@/types/api'

const categoryKeys = { all: ['categories'] as const }

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name)

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
    // Subjects change a few times a year, and this list is on almost every page.
    staleTime: 30 * 60_000,
  })
}

// The mutations below edit the cached list with the server's answer instead of fetching the
// whole list again. Book lists embed category names, so they are marked stale (not refetched:
// only a list that is on screen right now reloads).

export function useSaveCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id?: number; name: string }) => {
      const response = id
        ? await api.put<Category>(`/categories/${id}`, { name })
        : await api.post<Category>('/categories', { name })
      return response.data
    },
    onSuccess: (saved) => {
      client.setQueryData<Category[]>(categoryKeys.all, (list) =>
        list ? [...list.filter((category) => category.id !== saved.id), saved].sort(byName) : list,
      )
      return client.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: (_response, id) => {
      client.setQueryData<Category[]>(categoryKeys.all, (list) => list?.filter((category) => category.id !== id))
    },
  })
}
