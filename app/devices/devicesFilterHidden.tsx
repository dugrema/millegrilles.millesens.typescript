// react-view5/app/devices/devicesFilterHidden.tsx

import { DeviceCard } from "../components/DeviceCard";
import { useDevicesStore } from "../state/devicesStore";
import type { Device } from "../state/devicesStore";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDeviceValuesStore } from "../state/deviceValueStore";
import { NavLink } from "react-router";

export default function Devices() {
  // Get static and dynamic data
  const devices = useDevicesStore((state) => state.devices);
  const groups = useDeviceGroupsStore((state) => state.groups);
  const deviceValues = useDeviceValuesStore((state) => state.deviceValues);
  const updateDeviceValue = useDeviceValuesStore(
    (state) => state.updateDeviceValue,
  );

  // Filter for hidden/deleted devices only
  const sortedDevices = [...devices]
    .filter((device: Device) => !!device.deleted)
    .sort((a, b) => {
      const groupA =
        groups.find((g) => g.id === a.deviceGroup)?.name || a.deviceGroup;
      const groupB =
        groups.find((g) => g.id === b.deviceGroup)?.name || b.deviceGroup;
      if (groupA !== groupB) {
        return groupA.localeCompare(groupB);
      }
      return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
    });

  return (
    <>
      <h1 className="text-2xl font-semibold">Hidden and deleted devices</h1>
      {sortedDevices.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No devices are hidden.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-2">
          {sortedDevices.map((device: Device) => {
            const value = deviceValues.find((v) => v.id === device.id);
            const group = groups.find((g) => g.id === device.deviceGroup);
            return (
              <NavLink key={device.id} to={`/devices/device/${device.id}`}>
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
                  notification={
                    (value?.notification ?? group?.registrationPending)
                      ? true
                      : undefined
                  }
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
