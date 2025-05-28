import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlogContext } from "../state/BlogContext";

function EditPostPage() {
  const { postId } = useParams();
  const { state, dispatch } = useBlogContext();
  const post = state.posts.find((p) => p.id === parseInt(postId));
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const navigate = useNavigate();

  if (!post) return <p>Post not found</p>;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: "EDIT_POST",
      post: { ...post, title, content }
    });
    navigate(`/posts/${post.id}`);
  };

  return (
    <div>
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:
            <input value={title} onChange={e => setTitle(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>Content:
            <textarea value={content} onChange={e => setContent(e.target.value)} required />
          </label>
        </div>
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}

export default EditPostPage;
