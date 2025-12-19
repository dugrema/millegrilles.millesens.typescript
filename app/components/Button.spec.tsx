import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { describe, it, expect } from "vitest";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders with primary variant by default", () => {
    render(<Button onClick={() => {}}>Primary</Button>);
    const button = screen.getByRole("button", { name: /primary/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-indigo-700");
    expect(button).toHaveClass("text-white");
  });

  it("renders with secondary variant correctly", () => {
    render(
      <Button variant="secondary" onClick={() => {}}>
        Secondary
      </Button>,
    );
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveClass("bg-gray-200");
    expect(button).toHaveClass("text-gray-700");
  });

  it("renders with outline variant correctly", () => {
    render(
      <Button variant="outline" onClick={() => {}}>
        Outline
      </Button>,
    );
    const button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("border-gray-300");
    expect(button).toHaveClass("text-gray-300");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: /disabled/i });
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
