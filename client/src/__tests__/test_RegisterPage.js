import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";
import { BlogProvider } from "../state/BlogContext";
import { MemoryRouter } from "react-router-dom";

function RegisterPageTestWrapper({ children }) {
  return (
    <MemoryRouter>
      <BlogProvider>{children || <RegisterPage />}</BlogProvider>
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  it("renders registration form", () => {
    render(<RegisterPageTestWrapper />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("shows error for duplicate username", () => {
    render(<RegisterPageTestWrapper />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "anypass" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "new@x.com" } });
    fireEvent.click(screen.getByText("Register"));
    expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
  });

  it("allows successful registration (navigates - indirectly tested: no error)", () => {
    render(<RegisterPageTestWrapper />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "eva" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "evapass" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "eva@example.com" } });
    fireEvent.click(screen.getByText("Register"));
    // Should not see error
    expect(screen.queryByText(/Username already exists/i)).not.toBeInTheDocument();
  });
});
