import React from "react";
import { useParams } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * Detail page for a single blog post (placeholder).
 */
function PostDetailPage() {
  const { id } = useParams();
  return (
    <div style={{ padding: 40 }}>
      <h2>Blog Post Detail</h2>
      <p>Viewing post with ID: {id}</p>
      <p>Blog content will be shown here. (Coming soon)</p>
    </div>
  );
}

export default PostDetailPage;
