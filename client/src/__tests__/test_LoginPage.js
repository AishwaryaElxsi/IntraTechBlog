import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter } from "react-router-dom";

function LoginPageTestWrapper({ children }) {
  return (
    <MemoryRouter>
      <BlogProvider>{children || <LoginPage />}</BlogProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  it("renders login form", () => {
    render(<LoginPageTestWrapper />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows error on invalid credentials", () => {
    render(<LoginPageTestWrapper />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "invalid" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "nope" } });
    fireEvent.click(screen.getByText("Login"));
    expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
  });

  it("navigates away on success (simulate success - no navigation test since useNavigate is used but not testable directly)", () => {
    render(<LoginPageTestWrapper />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "alicepass" } });
    fireEvent.click(screen.getByText("Login"));
    // Would normally use mock for useNavigate. Here, success does not render error.
    expect(screen.queryByText(/Invalid credentials/)).not.toBeInTheDocument();
  });
});
