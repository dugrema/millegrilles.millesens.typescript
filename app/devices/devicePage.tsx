import { useParams, NavLink } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/Button";
import { RegistrationButton } from "~/components/RegistrationButton";
import { UNIT_MAP } from "~/components/DeviceCard";
import { DeviceCard } from "~/components/DeviceCard";
import { useDevicesStore } from "~/state/devicesStore";
import { useDeviceValuesStore } from "~/state/deviceValueStore";
import { useConfigurationStore } from "~/state/configurationStore";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import { DateTime } from "luxon";

export default function DevicePage() {
  const { deviceId } = useParams<{ deviceId: string }>();

  const device = useDevicesStore((state) =>
    state.devices.find((d) => d.id === deviceId),
  );
  const deviceValue = useDeviceValuesStore((state) =>
    state.deviceValues.find((v) => v.id === device?.id),
  );

  if (!device) {
    return (
      <div className="p-4">
        <p className="text-red-600">Device not found.</p>
        <NavLink
          to="/devices"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to devices
        </NavLink>
      </div>
    );
  }

  const {
    id,
    name: deviceName,
    deviceGroup,
    type,
    group: deviceGroupFilter,
    deleted,
  } = device;

  const groupInfo = useDeviceGroupsStore((state) =>
    state.groups.find((g) => g.id === deviceGroup),
  );
  const updateGroup = useDeviceGroupsStore((state) => state.updateGroup);

  const handleRegister = async (): Promise<boolean> => {
    if (!groupInfo) return false;
    updateGroup({ ...groupInfo, registrationPending: true });
    try {
      await new Promise((r) => setTimeout(r, 2000));
      updateGroup({ ...groupInfo, registrationPending: false });
      return true;
    } catch {
      updateGroup({ ...groupInfo, registrationPending: false });
      return false;
    }
  };

  const updateDeviceValue = useDeviceValuesStore(
    (state) => state.updateDeviceValue,
  );
  const updateDevice = useDevicesStore((state) => state.updateDevice);
  const toggleDelete = () =>
    updateDevice({ ...device, deleted: !device.deleted });

  const { preferences } = useConfigurationStore();
  const tz =
    preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Local state for editable fields
  const [localName, setLocalName] = useState(deviceName);
  const [localGroup, setLocalGroup] = useState(
    Array.isArray(deviceGroupFilter) ? deviceGroupFilter.join(",") : "",
  );

  // Keep local state in sync if device changes
  useEffect(() => {
    setLocalName(deviceName);
    setLocalGroup(
      Array.isArray(deviceGroupFilter) ? deviceGroupFilter.join(",") : "",
    );
  }, [deviceName, deviceGroupFilter]);

  const handleSave = () => {
    const groups = localGroup
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g !== "");
    updateDevice({
      ...device,
      name: localName,
      group: groups.length ? groups : undefined,
    });
  };

  const handleCancel = () => {
    setLocalName(deviceName);
    setLocalGroup(
      Array.isArray(deviceGroupFilter) ? deviceGroupFilter.join(",") : "",
    );
  };

  return (
    <div className="p-4">
      <DeviceCard
        key={id}
        id={id}
        name={localName}
        deviceGroup={deviceGroup}
        type={type}
        numberValue={deviceValue?.numberValue}
        stringValue={deviceValue?.stringValue}
        status={deviceValue?.status}
        connected={deviceValue?.connected}
        notification={deviceValue?.notification}
        lastUpdate={deviceValue?.lastUpdate ?? 0}
        onToggle={
          type === "Switch" && deviceValue?.status !== undefined
            ? () =>
                updateDeviceValue({
                  ...deviceValue,
                  status: !deviceValue.status,
                })
            : undefined
        }
      />
      <div className="mt-6 space-y-2 space-x-2">
        <NavLink
          to={`/devices/deviceGroup/${deviceGroup}`}
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          <Button variant="secondary">View Group</Button>
        </NavLink>
        {deviceValue?.numberValue !== undefined && (
          <NavLink
            to={`/devices/chart/${id}`}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            <Button variant="secondary">View Chart</Button>
          </NavLink>
        )}
        {groupInfo?.registrationRequested && (
          <RegistrationButton onRegister={handleRegister} className="ml-2" />
        )}
        <h2 className="text-xl font-semibold">Device details</h2>
        <dl className="grid grid-cols-2 gap-4">
          <dt className="font-medium">ID</dt>
          <dd>{id}</dd>

          <dt className="font-medium">Name</dt>
          <dd>
            <input
              className="border rounded p-1"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </dd>

          <dt className="font-medium">Group</dt>
          <dd>{deviceGroup}</dd>

          <dt className="font-medium">Group (filter)</dt>
          <dd>
            <input
              className="border rounded p-1"
              value={localGroup}
              onChange={(e) => setLocalGroup(e.target.value)}
            />
          </dd>

          <dt className="font-medium">Type</dt>
          <dd>{type}</dd>

          {deviceValue?.numberValue !== undefined && (
            <>
              <dt className="font-medium">Value</dt>
              <dd>
                {deviceValue.numberValue}
                {UNIT_MAP[type]}
              </dd>
            </>
          )}

          {deviceValue?.stringValue !== undefined && (
            <>
              <dt className="font-medium">Value</dt>
              <dd>{deviceValue.stringValue}</dd>
            </>
          )}

          {deviceValue?.status !== undefined && (
            <>
              <dt className="font-medium">Status</dt>
              <dd>{deviceValue.status ? "On" : "Off"}</dd>
            </>
          )}

          <dt className="font-medium">Last Update</dt>
          <dd>
            {DateTime.fromSeconds(deviceValue?.lastUpdate ?? 0)
              .setZone(tz)
              .toFormat("yyyy-LL-dd HH:mm:ss")}
          </dd>
        </dl>

        {/* Save / Cancel buttons for local edits */}
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={
              localName === deviceName &&
              localGroup === (deviceGroupFilter ?? "")
            }
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={
              localName === deviceName &&
              localGroup === (deviceGroupFilter ?? "")
            }
          >
            Cancel
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={toggleDelete}
        >
          {deleted ? "Restore" : "Hide"}
        </Button>
      </div>
    </div>
  );
}
