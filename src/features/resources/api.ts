import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cleanParams } from '@/lib/format'
import type {
  Disposition,
  DownloadLink,
  PageParams,
  PageResponse,
  Resource,
  ResourceMetadata,
  ResourceStatus,
  ResourceType,
} from '@/types/api'

export interface ResourceListParams extends PageParams {
  search?: string
  bookId?: number
  category?: string
  type?: ResourceType | ''
}

export const resourceKeys = {
  all: ['resources'] as const,
  public: (params: ResourceListParams) => ['resources', 'public', params] as const,
  mine: (params: PageParams & { status?: ResourceStatus }) => ['resources', 'mine', params] as const,
  admin: (params: PageParams & { status: ResourceStatus }) => ['resources', 'admin', params] as const,
}

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'NOTES', label: 'Notes' },
  { value: 'PAST_PAPER', label: 'Past paper' },
  { value: 'SLIDES', label: 'Slides' },
  { value: 'OTHER', label: 'Other' },
]

export function resourceTypeLabel(type: ResourceType): string {
  return RESOURCE_TYPES.find((option) => option.value === type)?.label ?? type
}

/** Approved resources only; this is the public listing. */
export function useResources(params: ResourceListParams) {
  const clean = cleanParams(params)
  return useQuery({
    queryKey: resourceKeys.public(clean),
    queryFn: async () => (await api.get<PageResponse<Resource>>('/resources', { params: clean })).data,
    placeholderData: keepPreviousData,
  })
}

/** The signed-in user's uploads, in every status. */
export function useMyResources(params: PageParams & { status?: ResourceStatus }) {
  const clean = cleanParams(params)
  return useQuery({
    queryKey: resourceKeys.mine(clean),
    queryFn: async () => (await api.get<PageResponse<Resource>>('/users/me/resources', { params: clean })).data,
    placeholderData: keepPreviousData,
  })
}

export interface UploadInput {
  file: File
  metadata: ResourceMetadata
  onProgress?: (percent: number) => void
}

export function useUploadResource() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, metadata, onProgress }: UploadInput) => {
      const form = new FormData()
      form.append('file', file)
      // The backend reads this part with @RequestPart, which needs the JSON content type on the part.
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      const { data } = await api.post<Resource>('/resources', form, {
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100))
        },
      })
      return data
    },
    onSuccess: () => client.invalidateQueries({ queryKey: resourceKeys.all }),
  })
}

export function useDeleteResource() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/resources/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: resourceKeys.all }),
  })
}

export async function requestResourceDownload(id: number, disposition: Disposition): Promise<DownloadLink> {
  const { data } = await api.post<DownloadLink>(`/resources/${id}/download`, null, { params: { disposition } })
  return data
}
