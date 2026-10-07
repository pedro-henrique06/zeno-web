import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tagApi from '@/api/tag';
import type { CreateTagRequest, UpdateTagRequest } from '@/types';

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: tagApi.getTags });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagApi.createTag(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTagRequest) => tagApi.updateTag(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagApi.deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });
}
