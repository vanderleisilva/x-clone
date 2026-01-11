import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const useCreatePost = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string }) => api.createPost({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', userId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUpdatePost = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.updatePost(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', userId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useDeletePost = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', userId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

