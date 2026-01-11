export interface User {
  id: string;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  posts?: Post[];
}

export interface Post {
  id: string;
  content: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

