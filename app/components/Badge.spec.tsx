import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge } from "./Badge";
import { describe, it, expect } from "vitest";

describe("Badge component", () => {
  it("renders nothing when count is 0", () => {
    const { container } = render(<Badge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the count when count is positive", () => {
    render(<Badge count={5} />);
    const badge = screen.getByText("5");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      "bg-red-600",
      "text-white",
      "text-xs",
      "font-medium",
    );
  });

  it("applies custom className", () => {
    render(<Badge count={3} className="text-sm" />);
    const badge = screen.getByText("3");
    expect(badge).toHaveClass("text-sm");
  });

  it("sets a default aria-label based on count", () => {
    render(<Badge count={2} />);
    const badge = screen.getByText("2");
    expect(badge).toHaveAttribute("aria-label", "You have 2 new notifications");
  });

  it("uses provided ariaLabel when supplied", () => {
    render(<Badge count={1} ariaLabel="One new message" />);
    const badge = screen.getByText("1");
    expect(badge).toHaveAttribute("aria-label", "One new message");
  });
});
