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
    return (
      <p role="status" aria-live="polite">
        Loading posts...
      </p>
    );
  }

  if (postsLoading) {
    return (
      <p role="status" aria-live="polite">
        Loading posts...
      </p>
    );
  }

  if (postsError) {
    return (
      <p className="text-red-500" role="alert">
        Error loading posts: {postsError.message}
      </p>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Posts</h2>

      {!readOnly && user?.id && (
        <form
          className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreatePost();
          }}
          aria-label="Create new post"
        >
          <label htmlFor="new-post-content" className="sr-only">
            Post content
          </label>
          <textarea
            id="new-post-content"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
            className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            aria-label="Post content"
            aria-describedby="char-count-new"
          />
          <div className="flex justify-between items-center mt-2">
            <span
              id="char-count-new"
              className="text-sm text-gray-400"
              aria-live="polite"
            >
              {newPostContent.length}/280
            </span>
            <button
              type="submit"
              disabled={!newPostContent.trim() || createPost.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={createPost.isPending ? "Posting..." : "Post"}
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      {posts && posts.length === 0 && (
        <p role="status">No posts yet.</p>
      )}
      {posts && posts.length > 0 && (
        <ol className="flex flex-col gap-4" aria-label="Posts list">
          {posts.map((post) => (
            <li key={post.id}>
              <article
                className="border border-gray-700 rounded-lg p-4 bg-gray-800"
                aria-labelledby={`post-${post.id}`}
              >
                {editingId === post.id && !readOnly ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdatePost(post.id);
                    }}
                    aria-label={`Edit post ${post.id}`}
                  >
                    <label htmlFor={`edit-post-${post.id}`} className="sr-only">
                      Edit post content
                    </label>
                    <textarea
                      id={`edit-post-${post.id}`}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      maxLength={280}
                      className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      aria-label="Edit post content"
                      aria-describedby={`char-count-edit-${post.id}`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span
                        id={`char-count-edit-${post.id}`}
                        className="text-sm text-gray-400"
                        aria-live="polite"
                      >
                        {editContent.length}/280
                      </span>
                      <div className="flex gap-2" role="group" aria-label="Edit actions">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!editContent.trim() || updatePost.isPending}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={updatePost.isPending ? "Updating..." : "Save changes"}
                        >
                          {updatePost.isPending ? "Updating..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <p id={`post-${post.id}`} className="m-0 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <footer className="flex justify-between items-center mt-2">
                      <time
                        className="text-sm text-gray-400 m-0"
                        dateTime={post.createdAt}
                        aria-label={`Posted on ${new Date(post.createdAt).toLocaleString()}`}
                      >
                        {new Date(post.createdAt).toLocaleString()}
                      </time>
                      {!readOnly && (
                        <div
                          className="flex gap-2"
                          role="group"
                          aria-label={`Actions for post ${post.id}`}
                        >
                          <button
                            onClick={() => handleStartEdit(post)}
                            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                            aria-label={`Edit post ${post.id}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletePost.isPending}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete post ${post.id}`}
                          >
                            {deletePost.isPending ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </footer>
                  </>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
