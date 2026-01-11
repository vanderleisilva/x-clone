import { useParams } from "react-router-dom";
import { useUserByUsername } from "../api/queries";
import Posts from "../components/Posts";

export default function PostsPage() {
  const { username } = useParams<{ username: string }>();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useUserByUsername(username || "");

  if (userLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading user...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading user: {userError.message}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>User @{username} not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Posts by @{user.username}</h1>
        <div className="flex items-center gap-4 mt-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="m-0 text-xl font-semibold">@{user.username}</h2>
            <p className="text-gray-400 m-0">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <Posts username={user.username} readOnly={true} />
    </div>
  );
}
