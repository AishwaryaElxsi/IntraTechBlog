import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogContext } from "../state/BlogContext";

function NewPostPage() {
  const { state, dispatch } = useBlogContext();
  const user = state.currentUser;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && content) {
      dispatch({
        type: "ADD_POST",
        post: { authorId: user.id, title, content }
      });
      navigate("/");
    }
  };

  return (
    <div>
      <h2>New Blog Post</h2>
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
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default NewPostPage;
