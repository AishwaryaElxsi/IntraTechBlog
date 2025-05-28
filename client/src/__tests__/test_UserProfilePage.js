import React from "react";
import { render, screen } from "@testing-library/react";
import UserProfilePage from "../pages/UserProfilePage";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter } from "react-router-dom";

// By default, Alice is the currentUser at startup
function UserProfileTestWrapper({ children }) {
  return (
    <MemoryRouter>
      <BlogProvider>{children || <UserProfilePage />}</BlogProvider>
    </MemoryRouter>
  );
}

describe("UserProfilePage", () => {
  it("renders current user's profile and their posts", () => {
    render(<UserProfileTestWrapper />);
    expect(screen.getByText(/alice's Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
    // Alice authored a post in mock data
    expect(screen.getByText("Welcome to IntraTech Blog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Write a New Post/i })).toHaveAttribute("href", "/new");
  });
});
