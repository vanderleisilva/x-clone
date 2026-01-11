import { useState } from "react";
import { usePosts, useUserByUsername } from "../api/queries";
import { useCreatePost, useUpdatePost, useDeletePost } from "../api/commands";

interface PostsProps {
  username: string;
  readOnly?: boolean;
}

export default function Posts({ username, readOnly = false }: PostsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const { data: user, isLoading: userLoading } = useUserByUsername(username);
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts(user?.id);

  const createPost = useCreatePost(user?.id || "");
  const updatePost = useUpdatePost(user?.id || "");
  const deletePost = useDeletePost(user?.id || "");

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user?.id) return;
    try {
      await createPost.mutateAsync({ content: newPostContent.trim() });
      setNewPostContent("");
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleStartEdit = (post: { id: string; content: string }) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdatePost = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      await updatePost.mutateAsync({ id, content: editContent.trim() });
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (userLoading) {
    return <p>Loading posts...</p>;
  }

  if (postsLoading) {
    return <p>Loading posts...</p>;
  }

  if (postsError) {
    return (
      <p className="text-red-500">Error loading posts: {postsError.message}</p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Posts</h2>

      {!readOnly && user?.id && (
        <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-400">
              {newPostContent.length}/280
            </span>
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || createPost.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {posts && posts.length === 0 && <p>No posts yet.</p>}
      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-700 rounded-lg p-4 bg-gray-800"
            >
              {editingId === post.id && !readOnly ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={280}
                    className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">
                      {editContent.length}/280
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        disabled={!editContent.trim() || updatePost.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatePost.isPending ? "Updating..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="m-0 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400 m-0">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                    {!readOnly && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(post)}
                          className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletePost.isPending}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletePost.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
