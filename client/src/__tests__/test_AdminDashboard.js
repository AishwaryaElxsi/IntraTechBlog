import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "../pages/AdminDashboard";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter } from "react-router-dom";

function AdminDashboardTestWrapper({ children }) {
  return (
    <MemoryRouter>
      <BlogProvider>{children || <AdminDashboard />}</BlogProvider>
    </MemoryRouter>
  );
}

describe("AdminDashboard", () => {
  it("renders user and posts lists", () => {
    render(<AdminDashboardTestWrapper />);
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    // Check users
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    // Check for post
    expect(screen.getByText("Welcome to IntraTech Blog")).toBeInTheDocument();
  });
});
