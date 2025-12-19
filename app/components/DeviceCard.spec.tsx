import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { describe, it, expect, test } from "vitest";

// Mock the zustand store for device groups before importing DeviceCard
vi.mock("../state/deviceGroupsStore", () => ({
  useDeviceGroupsStore: (selector: any) =>
    selector({
      groups: [
        { id: "group1", name: "Living Room" },
        { id: "group2", name: "Bedroom" },
      ],
    }),
}));

import { DeviceCard } from "./DeviceCard";
import { TimeProvider } from "./TimeContext";

describe("DeviceCard component", () => {
  const baseProps = {
    name: "Thermostat",
    id: "group1__001",
    deviceGroup: "group1",
    type: "Temperature",
    numberValue: 22.5,
    connected: true,
    notification: false,
    lastUpdate: Math.floor(Date.now() / 1000) - 60,
    children: null,
  };

  const renderCard = (props = {}) =>
    render(
      <TimeProvider>
        <DeviceCard {...baseProps} {...props} />
      </TimeProvider>,
    );

  test("renders name and group label", () => {
    renderCard();
    expect(screen.getByText("Thermostat")).toBeInTheDocument();
    expect(screen.getByText("Living Room")).toBeInTheDocument();
  });

  test("renders temperature value with unit", () => {
    renderCard();
    const value = screen.getByText(/22\.5/);
    expect(value).toBeInTheDocument();
    expect(value).toHaveTextContent("22.5°");
  });

  test("renders humidity value correctly", () => {
    renderCard({
      type: "Humidity",
      numberValue: 55,
    });
    expect(screen.getByText("55%")).toBeInTheDocument();
  });

  test("renders string value correctly", () => {
    renderCard({
      type: "String",
      stringValue: "Hello",
    });
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("renders switch button with correct label and disabled state", () => {
    const mockToggle = vi.fn();
    renderCard({
      type: "Switch",
      status: false,
      onToggle: mockToggle,
      connected: true,
      changePending: false,
    });

    const button = screen.getByRole("button", { name: /Turn On/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  test("disables switch button when changePending", () => {
    const mockToggle = vi.fn();
    renderCard({
      type: "Switch",
      status: true,
      onToggle: mockToggle,
      changePending: true,
    });

    const button = screen.getByRole("button", { name: /Turn Off/i });
    expect(button).toBeDisabled();
  });
});
