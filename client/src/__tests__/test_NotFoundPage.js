import React from "react";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "../pages/NotFoundPage";

describe("NotFoundPage", () => {
  it("renders the 404 page message", () => {
    render(<NotFoundPage />);
    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorry, that page doesn’t exist./i)).toBeInTheDocument();
  });
});
