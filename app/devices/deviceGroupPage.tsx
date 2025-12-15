import { useParams, NavLink } from "react-router";
import { useDevicesStore } from "~/state/devicesStore";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import { useDeviceValuesStore } from "~/state/deviceValueStore";
import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { DeviceCard } from "~/components/DeviceCard";
import { Button } from "~/components/Button";
import { useConfigurationStore } from "~/state/configurationStore";
import { DateTime } from "luxon";
import { RegistrationButton } from "~/components/RegistrationButton";

export default function DeviceGroup() {
  const { groupId } = useParams<{ groupId: string }>();

  const group = useDeviceGroupsStore((state) =>
    state.groups.find((g) => g.id === groupId),
  );
  const updateGroup = useDeviceGroupsStore((state) => state.updateGroup);
  const { preferences } = useConfigurationStore();
  const tz =
    preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const devices = useDevicesStore((state) => state.devices);
  const deviceValues = useDeviceValuesStore((state) => state.deviceValues);

  const groupDevices = devices
    .filter((d) => d.deviceGroup === groupId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const lastUpdated = Math.max(
    0,
    ...groupDevices.map((d) => {
      const v = deviceValues.find((v) => v.id === d.id);
      return v?.lastUpdate ?? 0;
    }),
  );

  const setGroupField = (field: keyof DeviceGroup, value: any) => {
    if (!group) return;
    updateGroup({ ...group, [field]: value });
  };

  // Registration flow – toggles a persistent registrationPending flag.
  const handleRegister = async (): Promise<boolean> => {
    if (!group) return false;
    updateGroup({ ...group, registrationPending: true });
    try {
      await new Promise((r) => setTimeout(r, 2000)); // Simulate async registration
      updateGroup({ ...group, registrationPending: false });
      return true;
    } catch {
      updateGroup({ ...group, registrationPending: false });
      return false;
    }
  };

  const handleUseLocation = () => {
    if (!group) return;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateGroup({ ...group, latitude, longitude });
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve location.");
      },
    );
  };

  const handleClearLocation = () => {
    if (!group) return;
    updateGroup({ ...group, latitude: undefined, longitude: undefined });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Group: {group?.name ?? groupId}
      </h1>

      {group && (
        <>
          <div className="mb-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>ID:</strong> {group.id}
            </div>
            <RegistrationButton onRegister={handleRegister} className="ml-2" />
            {group.microcode && (
              <div>
                <strong>Microcode:</strong> {group.microcode}
              </div>
            )}
            <div>
              <strong>Timezone:</strong>{" "}
              <input
                type="text"
                value={group.timezone ?? ""}
                onChange={(e) => setGroupField("timezone", e.target.value)}
                className="border rounded p-1 ml-2"
              />
            </div>
            <div>
              <strong>Name:</strong>{" "}
              <input
                type="text"
                value={group.name}
                onChange={(e) => setGroupField("name", e.target.value)}
                className="border rounded p-1 ml-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <strong>Location:</strong>{" "}
              {(group.latitude ?? group.longitude) ? (
                <span>
                  {group.latitude?.toFixed(4)}, {group.longitude?.toFixed(4)}
                </span>
              ) : (
                <span className="italic text-gray-500">Not set</span>
              )}
              <Button
                variant="outline"
                onClick={handleUseLocation}
                className="ml-2"
              >
                Use my location
              </Button>
              <Button
                variant="outline"
                onClick={handleClearLocation}
                className="ml-1"
              >
                Clear
              </Button>
              <input
                type="number"
                placeholder="Lat"
                value={group.latitude ?? ""}
                onChange={(e) =>
                  setGroupField(
                    "latitude",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className="border rounded p-1 w-20"
              />
              <input
                type="number"
                placeholder="Lon"
                value={group.longitude ?? ""}
                onChange={(e) =>
                  setGroupField(
                    "longitude",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className="border rounded p-1 w-20"
              />
            </div>
          </div>

          {groupDevices.length === 0 ? (
            <p className="text-gray-500">No devices in this group.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupDevices.map((device) => {
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
                      connected={value?.connected}
                      notification={value?.notification}
                      lastUpdate={value?.lastUpdate ?? 0}
                    />
                  </NavLink>
                );
              })}
            </div>
          )}

          {lastUpdated && (
            <p className="mt-4 text-sm text-gray-600">
              Last updated:{" "}
              {DateTime.fromSeconds(lastUpdated)
                .setZone(tz)
                .toFormat("yyyy-MM-dd HH:mm:ss")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
