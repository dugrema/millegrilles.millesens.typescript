import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TimeProvider, useTime } from "./TimeContext";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { act, useEffect, useState } from "react";

describe("TimeContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws an error when useTime is called outside of TimeProvider", () => {
    const TestComponent = () => {
      useTime();
      return null;
    };

    // The hook should throw, so we catch the error
    const renderResult = () => render(<TestComponent />);
    expect(renderResult).toThrowError(
      /useTime must be used within a TimeProvider/,
    );
  });

  it("provides the current epoch time in seconds and updates every 5 seconds", () => {
    const TestComponent = () => {
      const [now, setNow] = useState(0);
      const time = useTime();
      useEffect(() => setNow(time), [time]);
      return <div data-testid="time">{now}</div>;
    };

    const initialTime = Math.floor(Date.now() / 1000);
    render(
      <TimeProvider>
        <TestComponent />
      </TimeProvider>,
    );

    const timeEl = screen.getByTestId("time");
    expect(timeEl).toHaveTextContent(String(initialTime));

    // Advance the fake timers by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const updatedTime = initialTime + 5;
    expect(timeEl).toHaveTextContent(String(updatedTime));
  });
});
