import React from "react";
import { useBlogContext } from "../state/BlogContext";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const { state } = useBlogContext();

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>All Users</h3>
      <ul>
        {state.users.map((u) => (
          <li key={u.id}>
            {u.username} - {u.email} {u.isAdmin && "(admin)"}
          </li>
        ))}
      </ul>
      <h3>All Posts</h3>
      <ul>
        {state.posts.map((p) => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link> by{" "}
            {state.users.find((u) => u.id === p.authorId)?.username || "Unknown"}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default AdminDashboard;
