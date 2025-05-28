import React from "react";
import { useBlogContext } from "../state/BlogContext";
import { Link } from "react-router-dom";

function UserProfilePage() {
  const { state } = useBlogContext();
  const user = state.currentUser;
  const userPosts = state.posts.filter((p) => p.authorId === user.id);

  return (
    <div>
      <h2>{user.username}'s Profile</h2>
      <p>Email: {user.email}</p>
      <h3>Your Posts</h3>
      {userPosts.length === 0 ? (
        <p>You haven't written any posts yet.</p>
      ) : (
        <ul>
          {userPosts.map((p) => (
            <li key={p.id}>
              <Link to={`/posts/${p.id}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/new">Write a New Post</Link>
    </div>
  );
}

export default UserProfilePage;
