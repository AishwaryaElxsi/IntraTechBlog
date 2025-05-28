import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useBlogContext } from "./state/BlogContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BlogPostPage from "./pages/BlogPostPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import NotFoundPage from "./pages/NotFoundPage";

// PUBLIC_INTERFACE
function App() {
  const { state, logout } = useBlogContext();
  const { currentUser } = state;
  const isAdmin = currentUser && currentUser.isAdmin;

  return (
    <Router>
      <nav className="navbar">
        <Link to="/">IntraTech Blog</Link>
        <div>
          {currentUser ? (
            <>
              <Link to="/profile">{currentUser.username}</Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts/:postId" element={<BlogPostPage />} />
          <Route path="/profile" element={currentUser ? <UserProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} />
          <Route path="/new" element={currentUser ? <NewPostPage /> : <Navigate to="/login" replace />} />
          <Route path="/edit/:postId" element={currentUser ? <EditPostPage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
