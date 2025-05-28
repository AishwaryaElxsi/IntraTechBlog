import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter } from "react-router-dom";

// Helper: Mock BlogProvider wrapper to allow for user state control
function AppTestWrapper({ initialRoute = "/", children }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <BlogProvider>{children || <App />}</BlogProvider>
    </MemoryRouter>
  );
}
describe("App routing and navigation", () => {
  it("renders navbar links for anon user", () => {
    render(<AppTestWrapper />);
    expect(screen.getByText("IntraTech Blog")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });
  it("redirects to login for protected pages as anon", () => {
    render(<AppTestWrapper initialRoute="/profile" />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
  it("shows 'Admin' dashboard link for admin user", () => {
    // Log in as Alice (admin)
    render(<AppTestWrapper />);
    // Simulate login via UI
    fireEvent.click(screen.getByText("Login"));
    // Fill login form and submit
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "alicepass" } });
    fireEvent.click(screen.getByText("Login"));

    // Should be redirected to home (navbar present)
    expect(screen.getByText("IntraTech Blog")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("shows only profile/logout links for non-admin user", () => {
    // Log in as Bob (not admin)
    render(<AppTestWrapper />);
    fireEvent.click(screen.getByText("Login"));
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "bob" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "bobpass" } });
    fireEvent.click(screen.getByText("Login"));
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("denies direct admin route to normal user", () => {
    render(<AppTestWrapper />);
    fireEvent.click(screen.getByText("Login"));
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "bob" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "bobpass" } });
    fireEvent.click(screen.getByText("Login"));
    // Try to visit /admin
    render(<AppTestWrapper initialRoute="/admin" />);
    // Should redirect or show home page, not dashboard
    expect(screen.getByText("All Blog Posts")).toBeInTheDocument();
  });

  it("shows 404 for unknown routes", () => {
    render(<AppTestWrapper initialRoute="/noSuchRoute" />);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
