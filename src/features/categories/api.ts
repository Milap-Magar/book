import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Category } from '@/types/api'

const categoryKeys = { all: ['categories'] as const }

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
    staleTime: 5 * 60_000,
  })
}

export function useSaveCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id?: number; name: string }) => {
      const response = id
        ? await api.put<Category>(`/categories/${id}`, { name })
        : await api.post<Category>('/categories', { name })
      return response.data
    },
    onSuccess: () => client.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useDeleteCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}
