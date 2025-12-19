import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, test, expect } from "vitest";
import { ScreenDisplay } from "./ScreenDisplay";

const declaration = { height: 2, width: 10 } as any;
const configuration = {
  lignes: [
    { variable: "temp", masque: "{0}C" },
    { variable: "humid", masque: "{0}%" },
    { variable: "long", masque: "1234567890" },
  ],
} as any;
const values = {
  temp: { id: "temp", numberValue: 25, lastUpdate: 0 },
  humid: { id: "humid", numberValue: 55, lastUpdate: 0 },
  long: { id: "long", stringValue: "longtext", lastUpdate: 0 },
};

describe("ScreenDisplay component", () => {
  test("renders the first page of lines and respects page size", () => {
    render(
      <ScreenDisplay
        declaration={declaration}
        configuration={configuration}
        values={values}
      />,
    );

    // pageSize = 2, so only first two lines should be visible
    expect(screen.getByText("25C")).toBeInTheDocument();
    expect(screen.getByText("55%")).toBeInTheDocument();
    // third line should not be rendered on first page
    expect(screen.queryByText("1234567890")).not.toBeInTheDocument();
  });

  test("pagination controls navigate between pages", () => {
    render(
      <ScreenDisplay
        declaration={declaration}
        configuration={configuration}
        values={values}
      />,
    );

    const nextBtn = screen.getByRole("button", { name: "Next" });
    const prevBtn = screen.getByRole("button", { name: "Prev" });

    // First page: Prev disabled, Next enabled
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Go to next page
    fireEvent.click(nextBtn);

    // Now Prev enabled, Next disabled (only 3 lines, 2 per page)
    expect(prevBtn).toBeEnabled();
    expect(nextBtn).toBeDisabled();

    // Check that the third line is now rendered
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  test("detects overflow and adds title attribute", () => {
    // Reduce width to trigger overflow
    const smallDecl = { ...declaration, width: 3 } as any;

    render(
      <ScreenDisplay
        declaration={smallDecl}
        configuration={configuration}
        values={values}
      />,
    );

    // The line with masque "1234567890" will overflow
    const overflowLine = screen.getByTitle("Text exceeds screen width");
    expect(overflowLine).toBeInTheDocument();
  });

  test("preview mode renders fake values and updates over time", async () => {
    vi.useFakeTimers();

    render(
      <ScreenDisplay
        declaration={declaration}
        configuration={configuration}
        values={values}
        preview
      />,
    );

    // In preview mode, the component should render something for each line
    const firstLine = screen.getByText(/C/);
    const secondLine = screen.getByText(/%/);
    expect(firstLine).toBeInTheDocument();
    expect(secondLine).toBeInTheDocument();

    // Advance time to trigger the interval that updates fake values
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // After the tick, component should re-render (content may change)
    const updatedFirst = screen.getByText(/C/);
    expect(updatedFirst).toBeInTheDocument();

    vi.useRealTimers();
  });
});
