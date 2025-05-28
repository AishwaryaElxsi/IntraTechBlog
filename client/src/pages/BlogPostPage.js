import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBlogContext } from "../state/BlogContext";

function BlogPostPage() {
  const { postId } = useParams();
  const { state, dispatch } = useBlogContext();
  const post = state.posts.find((p) => p.id === parseInt(postId));
  const author = state.users.find((u) => u.id === post?.authorId);
  const postComments = post ? post.comments.map(cid => state.comments.find(c => c.id === cid)) : [];
  const user = state.currentUser;
  const [comment, setComment] = useState("");
  const hasLiked = user && post && post.likes.includes(user.id);

  const handleComment = (e) => {
    e.preventDefault();
    if (user && comment.trim()) {
      dispatch({
        type: "ADD_COMMENT",
        comment: {
          postId: post.id,
          authorId: user.id,
          content: comment,
        }
      });
      setComment("");
    }
  };

  const handleLike = () => {
    if (user) {
      dispatch({ type: "TOGGLE_LIKE", postId: post.id, userId: user.id });
    }
  };

  if (!post) return <p>Post not found</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>
        by {author ? author.username : "Unknown"} on{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div>{post.content}</div>
      <div>
        <button onClick={handleLike}>
          {hasLiked ? "Unlike" : "Like"} ({post.likes.length})
        </button>
      </div>
      <h4>Comments</h4>
      {postComments.length > 0 ? (
        <ul>
          {postComments.map(c => (
            <li key={c.id}>
              <b>{state.users.find(u => u.id === c.authorId)?.username}</b>:
              {" "}{c.content}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
      {user && (
        <form onSubmit={handleComment}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment"
            required
          />
          <button type="submit">Comment</button>
        </form>
      )}
      {user && post.authorId === user.id && (
        <Link to={`/edit/${post.id}`}>Edit Post</Link>
      )}
    </div>
  );
}

export default BlogPostPage;
