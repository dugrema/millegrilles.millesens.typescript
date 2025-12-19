import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RegistrationButton } from "./RegistrationButton";
import { vi } from "vitest";

describe("RegistrationButton", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  test("renders initial label", () => {
    render(<RegistrationButton onRegister={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("Register");
  });

  test("first click shows code and confirm prompt", async () => {
    render(<RegistrationButton onRegister={vi.fn()} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    const codeElement = screen.getByText(/Code:/i);
    expect(codeElement).toBeInTheDocument();
    expect(screen.getByText(/Click again to confirm/i)).toBeInTheDocument();
  });

  test("second click calls onRegister and shows success state", async () => {
    const onRegister = vi.fn().mockResolvedValue(true);
    render(<RegistrationButton onRegister={onRegister} />);
    const button = screen.getByRole("button");

    // First click: show code
    fireEvent.click(button);
    // Second click: confirm registration
    fireEvent.click(button);

    // onRegister should have been called
    expect(onRegister).toHaveBeenCalledTimes(1);
    // Success state should show ✅
    expect(screen.getByText("✅ Registered")).toBeInTheDocument();
    // Button should be disabled after success
    expect(button).toBeDisabled();
  });

  test("second click shows error state when onRegister returns false", async () => {
    const onRegister = vi.fn().mockResolvedValue(false);
    render(<RegistrationButton onRegister={onRegister} />);
    const button = screen.getByRole("button");

    fireEvent.click(button); // first
    fireEvent.click(button); // second

    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(screen.getByText("❌ Error")).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test("timeout after 60s shows error state", async () => {
    vi.useFakeTimers();
    const onRegister = vi.fn().mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    render(<RegistrationButton onRegister={onRegister} />);
    const button = screen.getByRole("button");

    fireEvent.click(button); // first
    fireEvent.click(button); // second triggers waiting

    // Fast-forward 61 seconds
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(screen.getByText("❌ Error")).toBeInTheDocument();
    expect(button).toBeEnabled();

    vi.useRealTimers();
  });

  test("shows waiting state during async registration", async () => {
    const promise = new Promise((resolve) =>
      setTimeout(() => resolve(true), 100),
    );
    const onRegister = vi.fn().mockReturnValue(promise);
    render(<RegistrationButton onRegister={onRegister} />);
    const button = screen.getByRole("button");

    fireEvent.click(button); // first
    fireEvent.click(button); // second

    expect(screen.getByText("Waiting...")).toBeInTheDocument();
    expect(button).toBeDisabled();

    // wait for promise to resolve
    await promise;
    expect(screen.getByText("✅ Registered")).toBeInTheDocument();
  });
});
