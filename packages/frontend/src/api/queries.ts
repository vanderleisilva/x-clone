import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { User, Post } from "../types";

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery<User | null>({
    queryKey: ["user-by-username", username],
    queryFn: async () => {
      const users = await api.getUsers();
      return users.find((user) => user.username === username) || null;
    },
    enabled: !!username,
  });
};

export const usePosts = (userId?: string) => {
  return useQuery<Post[]>({
    queryKey: userId ? ["posts", userId] : ["posts"],
    queryFn: () => api.getPosts(userId),
  });
};

export const usePost = (id: string) => {
  return useQuery<Post>({
    queryKey: ["post", id],
    queryFn: () => api.getPost(id),
    enabled: !!id,
  });
};
