import { useUsers } from "../api/queries";
import Posts from "../components/Posts";

export default function ProfilePage() {
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const firstUser = users?.[0];

  if (usersLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading profile: {usersError.message}
        </p>
      </div>
    );
  }

  if (!firstUser) {
    return (
      <div className="p-8 text-center">
        <p>No users found. Please create a user first.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <div className="flex items-center gap-4 mt-4">
          {firstUser.avatar ? (
            <img
              src={firstUser.avatar}
              alt={firstUser.username}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
              {firstUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="m-0 text-xl font-semibold">@{firstUser.username}</h2>
            <p className="text-gray-400 m-0">
              Joined {new Date(firstUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <Posts username={firstUser.username} readOnly={false} />
    </div>
  );
}
