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
        <p role="status" aria-live="polite">Loading profile...</p>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500" role="alert">
          Error loading profile: {usersError.message}
        </p>
      </div>
    );
  }

  if (!firstUser) {
    return (
      <div className="p-8 text-center">
        <p role="status">No users found. Please create a user first.</p>
      </div>
    );
  }

  return (
    <article className="p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <div className="flex items-center gap-4 mt-4">
          {firstUser.avatar ? (
            <img
              src={firstUser.avatar}
              alt={`Avatar of ${firstUser.username}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold"
              aria-label={`${firstUser.username} avatar placeholder`}
            >
              {firstUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="m-0 text-xl font-semibold">@{firstUser.username}</h2>
            <time
              className="text-gray-400 m-0"
              dateTime={firstUser.createdAt}
              aria-label={`Joined on ${new Date(firstUser.createdAt).toLocaleDateString()}`}
            >
              Joined {new Date(firstUser.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      </header>

      <Posts username={firstUser.username} readOnly={false} />
    </article>
  );
}
