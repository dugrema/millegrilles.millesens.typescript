import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import SectionSidebar from "./SectionSidebar";
import { useSidebar } from "./SidebarContext";

vi.mock("./SidebarContext", () => ({
  useSidebar: vi.fn(),
}));

describe("SectionSidebar component", () => {
  const mockClose = vi.fn();

  const renderSidebar = (isOpen: boolean) => {
    (useSidebar as any).mockReturnValue({
      isOpen,
      close: mockClose,
      toggle: vi.fn(),
      open: vi.fn(),
    });

    return render(
      <SectionSidebar>
        <div data-testid="child">Content</div>
      </SectionSidebar>,
    );
  };

  beforeEach(() => {
    mockClose.mockReset();
    (useSidebar as any).mockReset();
  });

  it("renders with the sidebar open when isOpen is true", () => {
    renderSidebar(true);
    const aside = screen.getByLabelText("Section navigation");
    expect(aside).toBeInTheDocument();
    // When open, the transform class should not include -translate-x-full
    expect(aside).not.toHaveClass("-translate-x-full");
  });

  it("renders with the sidebar closed when isOpen is false", () => {
    renderSidebar(false);
    const aside = screen.getByLabelText("Section navigation");
    expect(aside).toBeInTheDocument();
    // When closed, the transform class should include -translate-x-full
    expect(aside).toHaveClass("-translate-x-full");
  });

  it("calls close when the close button is clicked", () => {
    renderSidebar(true);
    const closeButton = screen.getByRole("button", { name: /close sidebar/i });
    fireEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("calls close when clicking outside the sidebar", () => {
    renderSidebar(true);
    const outside = document.createElement("div");
    document.body.appendChild(outside);
    fireEvent.mouseDown(outside);
    expect(mockClose).toHaveBeenCalledTimes(1);
    document.body.removeChild(outside);
  });

  it("does not call close when clicking inside the sidebar", () => {
    renderSidebar(true);
    const inside = screen.getByText("Content");
    fireEvent.mouseDown(inside);
    expect(mockClose).not.toHaveBeenCalled();
  });
});
