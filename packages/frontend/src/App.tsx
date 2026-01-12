import { Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import PostsPage from "./pages/PostsPage";
import Navigation from "./components/Navigation";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/posts/:username" element={<PostsPage />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  );
}

export default App;
