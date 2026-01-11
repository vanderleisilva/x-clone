import type { User, Post } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Users
  getUsers: () => fetchAPI<User[]>('/users'),
  getUser: (id: string) => fetchAPI<User>(`/users/${id}`),

  // Posts
  getPosts: (userId?: string) => {
    const url = userId ? `/posts?userId=${userId}` : '/posts';
    return fetchAPI<Post[]>(url);
  },
  getPost: (id: string) => fetchAPI<Post>(`/posts/${id}`),
  createPost: (data: { content: string; userId: string }) =>
    fetchAPI<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePost: (id: string, data: { content: string }) =>
    fetchAPI<Post>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deletePost: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return;
    }
    return response.json();
  },
};

