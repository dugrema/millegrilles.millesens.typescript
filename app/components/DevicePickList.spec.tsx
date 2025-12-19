import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DevicePickList } from "./DevicePickList";
import { vi } from "vitest";

/* Mock the zustand stores used by DevicePickList */
vi.mock("../state/devicesStore", () => ({
  useDevicesStore: (selector: any) =>
    selector({
      devices: [
        {
          id: "group1__001",
          deviceGroup: "group1",
          internalId: "001",
          name: "Thermostat",
          type: "Temperature",
        },
        {
          id: "group1__002",
          deviceGroup: "group1",
          internalId: "002",
          name: "Humidity Sensor",
          type: "Humidity",
        },
        {
          id: "group2__001",
          deviceGroup: "group2",
          internalId: "001",
          name: "Pressure Sensor",
          type: "AtmPressure",
        },
      ],
    }),
}));

vi.mock("../state/deviceGroupsStore", () => ({
  useDeviceGroupsStore: (selector: any) =>
    selector({
      groups: [
        { id: "group1", name: "Living Room" },
        { id: "group2", name: "Bedroom" },
      ],
    }),
}));

describe("DevicePickList component", () => {
  const baseProps = {
    currentDeviceGroup: "group1",
    onChange: vi.fn(),
    name: "device",
    id: "device-select",
  };

  test("renders a select with a placeholder option", () => {
    render(<DevicePickList {...baseProps} />);
    const select = screen.getByRole("combobox", { name: /device/i });
    expect(select).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /select a device/i }),
    ).toBeInTheDocument();
  });

  test("renders options for all devices sorted by group and name", () => {
    render(<DevicePickList {...baseProps} />);
    // After placeholder, the options should be sorted alphabetically
    const options = screen.getAllByRole("option");
    // Skip placeholder
    const labels = options.slice(1).map((o) => o.textContent);
    expect(labels).toEqual([
      "Living Room / Humidity Sensor",
      "Living Room / Thermostat",
      "Bedroom / Pressure Sensor",
    ]);
  });

  test("option values respect currentDeviceGroup prop", () => {
    render(<DevicePickList {...baseProps} />);
    const humidityOption = screen.getByRole("option", {
      name: /Living Room \/ Humidity Sensor/i,
    });
    expect(humidityOption).toHaveValue("002"); // same group -> internalId only

    const pressureOption = screen.getByRole("option", {
      name: /Bedroom \/ Pressure Sensor/i,
    });
    expect(pressureOption).toHaveValue("group2:001"); // different group -> group:internalId
  });

  test("calls onChange with event when selection changes", () => {
    const onChange = vi.fn();
    render(<DevicePickList {...baseProps} onChange={onChange} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "002" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("filters devices by deviceType prop", () => {
    render(<DevicePickList {...baseProps} deviceType="Humidity" />);
    const options = screen.getAllByRole("option");
    // Only Humidity sensor should be present after placeholder
    expect(options[1]).toHaveTextContent(/Humidity Sensor/);
    expect(options.length).toBe(2); // placeholder + one device
  });
});
