import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TooltipOverlay } from "./TooltipOverlay";

describe("TooltipOverlay component", () => {
  test("shows tooltip on mouse hover and hides on mouse leave", async () => {
    render(
      <TooltipOverlay content="Hello, world!" placement="bottom" delay={0}>
        <button>Hover me</button>
      </TooltipOverlay>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    await waitFor(() =>
      expect(screen.getByText("Hello, world!")).toBeInTheDocument(),
    );
    fireEvent.mouseLeave(button);

    await waitFor(() =>
      expect(screen.queryByText("Hello, world!")).not.toBeInTheDocument(),
    );
  });

  // test("positions tooltip above the trigger when placement='top'", async () => {
  //   render(
  //     <TooltipOverlay
  //       content="Top tooltip"
  //       placement="top"
  //       offset={8}
  //       delay={0}
  //     >
  //       <button data-testid="trigger">Trigger</button>
  //     </TooltipOverlay>,
  //   );

  //   const trigger = screen.getByTestId("trigger");
  //   fireEvent.mouseEnter(trigger);

  //   const tooltip = await screen.findByText("Top tooltip");

  //   const triggerRect = trigger.getBoundingClientRect();
  //   const tooltipRect = tooltip.getBoundingClientRect();

  //   // Tooltip should be above the trigger
  //   expect(tooltipRect.bottom).toBeLessThanOrEqual(triggerRect.top - 8);

  //   // Tooltip should be centered horizontally
  //   const expectedLeft =
  //     triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
  //   expect(Math.abs(tooltipRect.left - expectedLeft)).toBeLessThanOrEqual(3);
  // });
});
