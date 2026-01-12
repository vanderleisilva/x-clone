import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "../api/queries";

export default function Navigation() {
  const { data: users, isLoading } = useUsers();
  const navigate = useNavigate();

  return (
    <nav
      className="w-64 bg-gray-800 border-l border-gray-700 min-h-screen p-4 sticky top-0"
      aria-label="Main navigation"
    >
      <div className="mb-6">
        <Link
          to="/"
          className="block text-lg font-semibold text-indigo-400 hover:text-indigo-300 mb-4 transition-colors"
          aria-label="Go to profile page"
        >
          Profile
        </Link>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Users
        </h2>
        {isLoading && (
          <p className="text-gray-500 text-sm" role="status" aria-live="polite">
            Loading users...
          </p>
        )}
        {users && users.length === 0 && (
          <p className="text-gray-500 text-sm" role="status">
            No users found
          </p>
        )}
        {users && users.length > 0 && (
          <ul className="space-y-2" role="list">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => navigate(`/posts/${user.username}`)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center gap-3"
                  aria-label={`View posts by ${user.username}`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`Avatar of ${user.username}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      aria-label={`${user.username} avatar placeholder`}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm truncate">@{user.username}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </nav>
  );
}

