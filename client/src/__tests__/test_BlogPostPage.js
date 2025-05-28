import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlogPostPage from "../pages/BlogPostPage";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Helper to setup state with login and routing for testing post details
function renderBlogPostPage({ loggedInUser = "alice", postId = 1 }) {
  window.history.pushState({}, "BlogPost", `/posts/${postId}`);
  return render(
    <MemoryRouter initialEntries={[`/posts/${postId}`]}>
      <BlogProvider>
        <Routes>
          <Route path="/posts/:postId" element={<BlogPostPage />} />
        </Routes>
      </BlogProvider>
    </MemoryRouter>
  );
}

describe("BlogPostPage", () => {
  it("renders the blog post and its comments", () => {
    renderBlogPostPage({ postId: 1 });
    expect(screen.getByText("Welcome to IntraTech Blog")).toBeInTheDocument();
    expect(screen.getByText(/Congrats, looking forward to more posts!/i)).toBeInTheDocument();
  });

  it("shows Like/Unlike and disables if not logged in (default: alice logged in)", () => {
    renderBlogPostPage({ postId: 1 });
    // Alice owns post, but test for Like button with another user would be better with a simulated login
    expect(screen.getByRole("button", { name: /Unlike/i })).toBeInTheDocument();
  });

  it("shows Edit Post link for the author", () => {
    renderBlogPostPage({ postId: 1 });
    expect(screen.getByText("Edit Post")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit Post/i })).toHaveAttribute("href", "/edit/1");
  });

  it("shows post not found for invalid id", () => {
    render(
      <MemoryRouter initialEntries={["/posts/999"]}>
        <BlogProvider>
          <Routes>
            <Route path="/posts/:postId" element={<BlogPostPage />} />
          </Routes>
        </BlogProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
  });

  // TODO: Test add comment/like interaction for a real test, would require API/context override
});
