import React from "react";
import { Link } from "react-router-dom";
import { useBlogContext } from "../state/BlogContext";

function HomePage() {
  const { state } = useBlogContext();
  const posts = state.posts;
  const users = state.users;

  return (
    <div>
      <h2>All Blog Posts</h2>
      {posts.length === 0 && <p>No posts yet. Be the first to create one!</p>}
      <ul>
        {posts.map((post) => {
          const author = users.find((u) => u.id === post.authorId);
          return (
            <li key={post.id}>
              <h3>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <p>
                by {author ? author.username : "Unknown"} on{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p>{post.content.substring(0, 100)}...</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default HomePage;
