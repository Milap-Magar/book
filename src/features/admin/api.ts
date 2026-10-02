import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cleanParams } from '@/lib/format'
import { resourceKeys } from '@/features/resources/api'
import type { AdminStats, PageParams, PageResponse, Resource, ResourceStatus, Role, User } from '@/types/api'

const adminKeys = {
  stats: ['admin', 'stats'] as const,
  users: ['admin', 'users'] as const,
  userList: (params: PageParams & { search?: string }) => ['admin', 'users', params] as const,
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => (await api.get<AdminStats>('/admin/stats')).data,
  })
}

export function useAdminUsers(params: PageParams & { search?: string }) {
  const clean = cleanParams(params)
  return useQuery({
    queryKey: adminKeys.userList(clean),
    queryFn: async () => (await api.get<PageResponse<User>>('/admin/users', { params: clean })).data,
    placeholderData: keepPreviousData,
  })
}

export function useUpdateUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...changes }: { id: number; role?: Role; enabled?: boolean }) =>
      (await api.patch<User>(`/admin/users/${id}`, changes)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.users }),
  })
}

export function useAdminResources(params: PageParams & { status: ResourceStatus }) {
  return useQuery({
    queryKey: resourceKeys.admin(params),
    queryFn: async () => (await api.get<PageResponse<Resource>>('/admin/resources', { params })).data,
    placeholderData: keepPreviousData,
  })
}

type Decision = { id: number; action: 'approve' } | { id: number; action: 'reject'; reason: string }

export function useModerateResource() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (decision: Decision) => {
      const body = decision.action === 'reject' ? { reason: decision.reason } : undefined
      return (await api.post<Resource>(`/admin/resources/${decision.id}/${decision.action}`, body)).data
    },
    // A decision moves the resource between queues and changes the public list and the stats.
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: resourceKeys.all }),
        client.invalidateQueries({ queryKey: adminKeys.stats }),
      ]),
  })
}
