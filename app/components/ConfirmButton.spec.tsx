import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConfirmButton } from "./ConfirmButton";
import { vi } from "vitest";
import { describe, it, expect } from "vitest";

describe("ConfirmButton", () => {
  test("renders default label and changes to confirmLabel after first click", async () => {
    const handleClick = vi.fn();
    render(
      <ConfirmButton
        onClick={handleClick}
        confirmLabel="Sure?"
        children="Proceed"
      />,
    );

    const button = screen.getByRole("button", { name: /proceed/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Proceed");

    // First click activates confirmation state
    fireEvent.click(button);
    expect(button).toHaveTextContent("Sure?");

    // onClick should not have been called yet
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("calls onClick on second click and resets state", async () => {
    const handleClick = vi.fn();
    render(
      <ConfirmButton
        onClick={handleClick}
        confirmLabel="Confirm"
        children="Do it"
      />,
    );

    const button = screen.getByRole("button", { name: /do it/i });

    // First click
    fireEvent.click(button);
    expect(button).toHaveTextContent("Confirm");

    // Second click triggers handler
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent("Do it");
  });

  test("resets confirmation after timeout", async () => {
    vi.useFakeTimers();
    const handleClick = vi.fn();
    render(
      <ConfirmButton
        onClick={handleClick}
        confirmLabel="Confirm"
        timeoutMs={200}
        children="Go"
      />,
    );

    const button = screen.getByRole("button", { name: /go/i });

    // Activate confirmation
    fireEvent.click(button);
    expect(button).toHaveTextContent("Confirm");

    // Advance timers beyond timeout
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should reset to original label
    expect(button).toHaveTextContent("Go");
    expect(handleClick).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  test("passes additional props to underlying Button", () => {
    render(
      <ConfirmButton
        onClick={() => {}}
        variant="outline"
        className="my-class"
        children="Click"
      />,
    );

    const button = screen.getByRole("button", { name: /click/i });
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("my-class");
  });
});
