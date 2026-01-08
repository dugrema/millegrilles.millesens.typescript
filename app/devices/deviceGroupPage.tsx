import { useParams, NavLink } from "react-router";
import { useState, useEffect } from "react";
import { useDevicesStore } from "~/state/devicesStore";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import { useDeviceValuesStore } from "~/state/deviceValueStore";
import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { DeviceCard } from "~/components/DeviceCard";
import { Button } from "~/components/Button";
import { useConfigurationStore } from "~/state/configurationStore";
import { DateTime } from "luxon";
import { useToggleSwitch } from "~/hooks/useToggleSwitch";
import { RegistrationButton } from "~/components/RegistrationButton";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";
import type { GeopositionConfiguration } from "~/workers/connection.worker";

export default function DeviceGroup() {
  const { groupId } = useParams<{ groupId: string }>();

  const workers = useMilleGrillesWorkers();
  const toggleSwitch = useToggleSwitch();

  const group = useDeviceGroupsStore((state) =>
    state.groups.find((g) => g.id === groupId),
  );
  const [localTimezone, setLocalTimezone] = useState(group?.timezone ?? "");
  const [localName, setLocalName] = useState(group?.name ?? "");
  const [localLatitude, setLocalLatitude] = useState<
    number | string | undefined
  >(group?.latitude ?? undefined);
  const [localLongitude, setLocalLongitude] = useState<
    number | string | undefined
  >(group?.longitude ?? undefined);

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
            {group.displays && group.displays.length > 0 && (
              <NavLink to={`/devices/displays/${groupId}`} className="ml-2">
                <Button variant="secondary">Displays</Button>
              </NavLink>
            )}
            {group.version && (
              <div>
                <strong>Microcode version:</strong> {group.version}
              </div>
            )}

            <div>
              <strong>Timezone:</strong>{" "}
              <input
                type="text"
                value={localTimezone}
                onChange={(e) => setLocalTimezone(e.target.value)}
                className="border rounded p-1 ml-2"
              />
            </div>
            <div>
              <strong>Name:</strong>{" "}
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
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
                value={localLatitude ?? ""}
                onChange={(e) =>
                  setLocalLatitude(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className="border rounded p-1 w-20"
              />
              <input
                type="number"
                placeholder="Lon"
                value={localLongitude ?? ""}
                onChange={(e) =>
                  setLocalLongitude(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className="border rounded p-1 w-20"
              />
            </div>
          </div>

          <div className="flex space-x-2 mt-4 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (group && workers) {
                  let geoposition = undefined as
                    | GeopositionConfiguration
                    | undefined;
                  if (
                    typeof localLatitude === "number" &&
                    typeof localLongitude === "number"
                  ) {
                    geoposition = {
                      latitude: localLatitude,
                      longitude: localLongitude,
                    };
                  }
                  const configuration = {
                    descriptif: localName,
                    timezone: localTimezone,
                    geoposition,
                  };

                  workers.connection
                    ?.updateDeviceConfiguration(group.id, configuration)
                    .then((result) => {
                      if (!result.persiste)
                        throw new Error(`Error saving changes: ${result.err}`);
                      updateGroup({
                        ...group,
                        timezone: localTimezone,
                        name: localName,
                        latitude:
                          typeof localLatitude === "number"
                            ? localLatitude
                            : undefined,
                        longitude:
                          typeof localLongitude === "number"
                            ? localLongitude
                            : undefined,
                      });
                    });
                }
              }}
              disabled={
                group &&
                group.timezone === localTimezone &&
                group.name === localName &&
                group.latitude ===
                  (typeof localLatitude === "number"
                    ? localLatitude
                    : undefined) &&
                group.longitude ===
                  (typeof localLongitude === "number"
                    ? localLongitude
                    : undefined)
              }
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (group) {
                  setLocalTimezone(group.timezone ?? "");
                  setLocalName(group.name ?? "");
                  setLocalLatitude(group.latitude ?? "");
                  setLocalLongitude(group.longitude ?? "");
                }
              }}
              disabled={
                group &&
                group.timezone === localTimezone &&
                group.name === localName &&
                group.latitude ===
                  (typeof localLatitude === "number"
                    ? localLatitude
                    : undefined) &&
                group.longitude ===
                  (typeof localLongitude === "number"
                    ? localLongitude
                    : undefined)
              }
            >
              Cancel
            </Button>
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
                      changePending={value?.changePending}
                      onToggle={
                        device.type === "Switch" && value?.status !== undefined
                          ? () => {
                              if (!group) return;
                              toggleSwitch(group, device, !value.status);
                            }
                          : undefined
                      }
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
