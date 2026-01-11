import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { User, Post } from '../types';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery<User | null>({
    queryKey: ['user-by-username', username],
    queryFn: async () => {
      const users = await api.getUsers();
      return users.find((user) => user.username === username) || null;
    },
    enabled: !!username,
  });
};

export const usePosts = (userId?: string) => {
  return useQuery<Post[]>({
    queryKey: userId ? ['posts', userId] : ['posts'],
    queryFn: () => api.getPosts(userId),
  });
};

export const usePost = (id: string) => {
  return useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => api.getPost(id),
    enabled: !!id,
  });
};

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

