import { Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import PostsPage from "./pages/PostsPage";
import Navigation from "./components/Navigation";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/posts/:username" element={<PostsPage />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
}

export default App;
