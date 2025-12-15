import { DeviceCard } from "../components/DeviceCard";
import { useDevicesStore } from "../state/devicesStore";
import type { Device } from "../state/devicesStore";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDeviceValuesStore } from "../state/deviceValueStore";
import { NavLink } from "react-router";
import { useParams } from "react-router";

export default function DevicesGroupFilter() {
  // The group name comes from the route parameter; it is `undefined` if the
  // link was rendered for an unassigned group (no `group` in the URL).
  const { group } = useParams<{ group?: string }>();

  // Retrieve devices and device values from the Zustand store
  const devices = useDevicesStore((state) => state.devices);
  const deviceValues = useDeviceValuesStore((state) => state.deviceValues);
  const updateDeviceValue = useDeviceValuesStore(
    (state) => state.updateDeviceValue,
  );

  // Filter out deleted devices and apply group filtering
  const filteredDevices = devices.filter((device: Device) => {
    if (device.deleted) return false;
    const deviceGroup = device.group?.trim();
    if (!group) {
      // Show unassigned devices when no group parameter is present
      return !deviceGroup;
    }
    return deviceGroup === group;
  });

  // Retrieve group names for sorting
  const groups = useDeviceGroupsStore((state) => state.groups);
  // Sort by deviceGroup name, then name, then id
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    const groupA =
      groups.find((g) => g.id === a.deviceGroup)?.name || a.deviceGroup;
    const groupB =
      groups.find((g) => g.id === b.deviceGroup)?.name || b.deviceGroup;
    if (groupA !== groupB) {
      return groupA.localeCompare(groupB);
    }
    return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  });

  const heading = group ? `Devices in group: ${group}` : "Unassigned Devices";

  return (
    <>
      <h1 className="text-2xl font-semibold">{heading}</h1>
      {sortedDevices.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">
          {group
            ? `No devices are in the "${group}" group.`
            : "No devices are unassigned."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-2">
          {sortedDevices.map((device: Device) => {
            const value = deviceValues.find((v) => v.id === device.id);
            return (
              <NavLink
                key={device.id}
                to={`/devices/device/${device.id}`}
                className="block"
              >
                <DeviceCard
                  id={device.id}
                  name={device.name}
                  deviceGroup={device.deviceGroup}
                  type={device.type}
                  numberValue={value?.numberValue}
                  stringValue={value?.stringValue}
                  status={value?.status}
                  onToggle={
                    device.type === "Switch" && value?.status !== undefined
                      ? () =>
                          updateDeviceValue({
                            ...value,
                            status: !value.status,
                          })
                      : undefined
                  }
                  connected={value?.connected}
                  notification={value?.notification}
                  lastUpdate={value?.lastUpdate ?? 0}
                />
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
}
