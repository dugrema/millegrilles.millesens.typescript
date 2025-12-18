import React from "react";
import { useDevicesStore } from "../state/devicesStore";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";

export interface DevicePickListProps {
  /** The group id of the current device being edited. */
  currentDeviceGroup?: string;
  /** The selected option value, in the format "group:internalId". */
  value?: string;
  /** Called when the user changes the selection. */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Optional name attribute for the <select>. */
  name?: string;
  /** Optional id attribute for the <select>. */
  id?: string;
  /** Optional Tailwind / CSS class string. */
  className?: string;
  /** Optional device type filter (e.g., "Humidity", "Temperature", "AtmPressure"). */
  deviceType?: string;
}

/**
 * Renders a <select> containing all devices from the zustand store.
 *
 * Each <option> has:
 * - value = "deviceGroup:internalId"
 * - label = "Group name / Device name"
 * The first option is an empty selection labelled "Select a device".
 */
export const DevicePickList: React.FC<DevicePickListProps> = ({
  currentDeviceGroup,
  value,
  onChange,
  name,
  id,
  className,
  deviceType,
}) => {
  const devices = useDevicesStore((state) => state.devices);
  const groups = useDeviceGroupsStore((state) => state.groups);

  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group?.name ?? groupId;
  };

  const filteredDevices = deviceType
    ? devices.filter((d) => d.type === deviceType)
    : devices;

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    const labelA = `${getGroupName(a.deviceGroup)} / ${a.name}`;
    const labelB = `${getGroupName(b.deviceGroup)} / ${b.name}`;
    return labelA.localeCompare(labelB);
  });

  return (
    <select
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      className={className}
    >
      <option value="">Select a device</option>
      {sortedDevices.map((device) => (
        <option
          key={device.id}
          value={
            currentDeviceGroup && device.deviceGroup === currentDeviceGroup
              ? `${device.internalId}`
              : `${device.deviceGroup}:${device.internalId}`
          }
        >
          {`${getGroupName(device.deviceGroup)} / ${device.name}`}
        </option>
      ))}
    </select>
  );
};

export default DevicePickList;
