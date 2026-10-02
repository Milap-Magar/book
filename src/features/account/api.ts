import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { session } from '@/lib/session'
import type { DownloadRecord, PageParams, PageResponse, User } from '@/types/api'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (input: { displayName: string }) => (await api.patch<User>('/users/me', input)).data,
    onSuccess: (user) => session.setUser(user),
  })
}

export function useMyDownloads(params: PageParams) {
  return useQuery({
    queryKey: ['downloads', 'mine', params] as const,
    queryFn: async () => (await api.get<PageResponse<DownloadRecord>>('/users/me/downloads', { params })).data,
    placeholderData: keepPreviousData,
  })
}
