// millegrilles.millesens.typescript/app/settings/__tests__/dev.spec.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Mock Zustand stores
// ---------------------------------------------------------------------------
const mockSetDevices = vi.fn();
const mockSetDeviceValues = vi.fn();
const mockSetGroups = vi.fn();

vi.mock("app/state/devicesStore", () => ({
  useDevicesStore: (selector: any) =>
    selector({
      devices: [],
      setDevices: mockSetDevices,
    }),
}));

vi.mock("app/state/deviceValueStore", () => ({
  useDeviceValuesStore: (selector: any) =>
    selector({
      deviceValues: [],
      setDeviceValues: mockSetDeviceValues,
    }),
}));

vi.mock("app/state/deviceGroupsStore", () => ({
  useDeviceGroupsStore: (selector: any) =>
    selector({
      groups: [],
      setGroups: mockSetGroups,
    }),
}));
vi.mock("app/state/configurationStore", () => ({
  useConfigurationStore: (selector: any) =>
    selector({
      setUserId: () => {},
    }),
}));
import SettingsPage from "app/settings/dev";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("SettingsPage – populate logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("populates the stores with transformed data", () => {
    render(<SettingsPage />);

    // Find the Repopulate button
    const btn = screen.getByRole("button", {
      name: /repopulate dummy devices & groups/i,
    });
    expect(btn).toBeInTheDocument();

    // Click the button
    fireEvent.click(btn);

    // Verify each store setter was called once
    expect(mockSetDevices).toHaveBeenCalledTimes(1);
    expect(mockSetDeviceValues).toHaveBeenCalledTimes(1);
    expect(mockSetGroups).toHaveBeenCalledTimes(1);

    // Grab the arguments passed to each setter
    const [devicesArg] = mockSetDevices.mock.calls[0];
    const [valuesArg] = mockSetDeviceValues.mock.calls[0];
    const [groupsArg] = mockSetGroups.mock.calls[0];

    // 1️⃣ Devices – id contains "__"
    expect(devicesArg[0].id).toMatch(/^[^_]+__\d+$/);
    // group is array or undefined
    expect(devicesArg[0].group).toEqual(["Outside"]);

    // 2️⃣ Values – id matches the corresponding device id
    expect(valuesArg[0].id).toEqual(devicesArg[0].id);

    // 3️⃣ Groups – instance_id exists
    expect(groupsArg[0].instance_id).toBeDefined();
  });
});
