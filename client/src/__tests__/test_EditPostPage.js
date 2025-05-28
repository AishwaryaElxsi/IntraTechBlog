import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditPostPage from "../pages/EditPostPage";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";

function renderEditPostPage({ postId = 1 }) {
  window.history.pushState({}, "EditPost", `/edit/${postId}`);
  return render(
    <MemoryRouter initialEntries={[`/edit/${postId}`]}>
      <BlogProvider>
        <Routes>
          <Route path="/edit/:postId" element={<EditPostPage />} />
        </Routes>
      </BlogProvider>
    </MemoryRouter>
  );
}

describe("EditPostPage", () => {
  it("renders edit post form and allows update", () => {
    renderEditPostPage({ postId: 1 });
    expect(screen.getByLabelText(/Title/i)).toHaveValue("Welcome to IntraTech Blog");
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Updated Title" } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: "Updated content here" } });
    fireEvent.click(screen.getByText(/Update Post/i));
    // Should redirect: form gone
    expect(screen.queryByLabelText(/Title/i)).not.toBeInTheDocument();
  });

  it("shows post not found for missing/invalid id", () => {
    renderEditPostPage({ postId: 999 });
    expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
  });
});
