import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NewPostPage from "../pages/NewPostPage";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter } from "react-router-dom";

function NewPostPageTestWrapper({ children }) {
  return (
    <MemoryRouter>
      <BlogProvider>{children || <NewPostPage />}</BlogProvider>
    </MemoryRouter>
  );
}

describe("NewPostPage", () => {
  it("renders new post form", () => {
    render(<NewPostPageTestWrapper />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Post/i })).toBeInTheDocument();
  });

  it("allows creation of a new post (navigate away, indirect test: no error)", () => {
    render(<NewPostPageTestWrapper />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Test Post" } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: "Hello world" } });
    fireEvent.click(screen.getByText(/Create Post/i));
    // Should not render new post page inputs anymore (since it would redirect)
    expect(screen.queryByLabelText(/Title/i)).not.toBeInTheDocument();
  });
});
