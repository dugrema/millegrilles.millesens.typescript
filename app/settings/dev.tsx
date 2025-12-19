import { Button } from "~/components/Button";
import { useDevicesStore } from "~/state/devicesStore";
import { useDeviceValuesStore } from "~/state/deviceValueStore";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import { useEffect } from "react";
import { useConfigurationStore } from "~/state/configurationStore";
import { STORAGE_KEY_LASTGROUP } from "~/utils/constants";

export default function SettingsPage() {
  /* ---------------------------------------------
   * Dummy static device data (persisted in DevicesStore)
   * --------------------------------------------- */
  const dummyStatic = [
    {
      id: "1",
      name: "Deck light",
      deviceGroup: "10-Backyard",
      type: "Switch",
      group: "Outside",
      deleted: undefined,
    },
    {
      id: "2",
      name: "Outdoor",
      deviceGroup: "10-Backyard",
      type: "Temperature",
      group: "Outside",
      deleted: undefined,
    },
    {
      id: "3",
      name: "Light",
      deviceGroup: "11-Living room",
      type: "Switch",
      group: "House",
      deleted: undefined,
    },
    {
      id: "4",
      name: "House",
      deviceGroup: "12-Kitchen",
      type: "Temperature",
      group: "House",
      deleted: undefined,
    },
    {
      id: "8",
      name: "Outdoor Humidity",
      deviceGroup: "10-Backyard",
      type: "Humidity",
      group: "Outside",
      deleted: undefined,
    },
    {
      id: "9",
      name: "Atmospheric Pressure",
      deviceGroup: "11-Living room",
      type: "AtmPressure",
      group: "House",
      deleted: undefined,
    },
    {
      id: "5",
      name: "Mobile thermometer",
      deviceGroup: "00-Sensors",
      type: "Temperature",
      group: undefined,
      deleted: undefined,
    },
    {
      id: "6",
      name: "Deleted thermometer",
      deviceGroup: "00-Deleted",
      type: "Temperature",
      group: undefined,
      deleted: true,
    },
    {
      id: "7",
      name: "IP",
      deviceGroup: "12-Kitchen",
      type: "String",
      group: undefined,
      deleted: true,
    },
  ] as const;

  /* ---------------------------------------------
   * Dummy dynamic values (persisted in DeviceValuesStore)
   * --------------------------------------------- */
  const dummyValues = [
    {
      id: "1",
      status: true,
      connected: true,
      lastUpdate: 1765558615,
    },
    { id: "2", numberValue: -15, connected: true, lastUpdate: 1765556915 },
    { id: "3", status: false, connected: true, lastUpdate: 1765558615 },
    {
      id: "4",
      numberValue: 21,
      connected: false,
      lastUpdate: 1765558435,
      notification: true,
    },
    { id: "8", numberValue: 55, connected: true, lastUpdate: 1765558600 },
    { id: "9", numberValue: 1013, connected: true, lastUpdate: 1765558601 },
    { id: "5", numberValue: 18, connected: true, lastUpdate: 1775558435 },
    { id: "6", numberValue: 41, connected: true, lastUpdate: 1765558435 },
    {
      id: "7",
      stringValue: "192.168.2.19",
      connected: true,
      lastUpdate: 1765558435,
    },
  ] as const;

  /* ---------------------------------------------
   * Dummy group data (persisted in DeviceGroupsStore)
   * --------------------------------------------- */
  const dummyGroups = [
    {
      id: "10-Backyard",
      name: "Backyard",
      microcode: "v1.0.3",
      timezone: "America/Chicago",
      latitude: 39.7392,
      longitude: -104.9903,
    },
    {
      id: "11-Living room",
      name: "Living Room",
      microcode: "v1.0.1",
      timezone: "America/Chicago",
      latitude: 39.7395,
      longitude: -104.991,
    },
    {
      id: "12-Kitchen",
      name: "Kitchen",
      microcode: "v1.0.2",
      timezone: "America/Chicago",
      latitude: 39.7398,
      longitude: -104.9915,
      registrationRequested: true,
    },
    {
      id: "00-Sensors",
      name: "Sensors",
      microcode: "v1.0.0",
      timezone: "America/Chicago",
      latitude: 39.74,
      longitude: -104.992,
    },
  ] as const;

  /* ---------------------------------------------
   * Store setters
   * --------------------------------------------- */
  const setDevices = useDevicesStore((state) => state.setDevices);
  const setDeviceValues = useDeviceValuesStore(
    (state) => state.setDeviceValues,
  );
  const setGroups = useDeviceGroupsStore((state) => state.setGroups);
  const devices = useDevicesStore((state) => state.devices);
  const deviceValues = useDeviceValuesStore((state) => state.deviceValues);
  const groups = useDeviceGroupsStore((state) => state.groups);
  const setUserId = useConfigurationStore((s) => s.setUserId);

  /* ---------------------------------------------
   * Populate button handler
   * --------------------------------------------- */
  const handlePopulate = () => {
    setUserId("dev");
    localStorage.removeItem(STORAGE_KEY_LASTGROUP);

    const devices = dummyStatic.map((d) => ({
      ...d,
      internalId: d.id,
      id: `${d.deviceGroup}__${d.id}`,
      group: d.group ? [d.group] : undefined,
    })) as any;

    const groups = dummyGroups.map((g) => ({
      ...g,
      instance_id: `dev_${g.id}`,
    })) as any;

    const values = dummyValues.map((v) => {
      const device = dummyStatic.find((d) => d.id === v.id);
      if (!device) return v;
      const newId = `${device.deviceGroup}__${device.id}`;
      return {
        ...v,
        id: newId,
      };
    }) as any;

    setDevices(devices);
    setDeviceValues(values);
    setGroups(groups);
  };

  /* ---------------------------------------------
   * UI
   * --------------------------------------------- */
  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">DEV</h1>

      <div className="space-y-2">
        <Button
          onClick={handlePopulate}
          className="block py-1 px-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Repopulate Dummy Devices &amp; Groups
        </Button>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Devices</h2>
        {devices.map((d) => {
          const value = deviceValues.find((v) => v.id === d.id);
          const group = groups.find((g) => g.id === d.deviceGroup);
          return (
            <div key={d.id} className="p-2 border rounded mb-2">
              <div>
                <strong>{d.name}</strong> (id: {d.id})
              </div>
              <div>Type: {d.type}</div>
              <div>Group: {group?.name || d.group || "N/A"}</div>
              <div>
                Status:{" "}
                {value?.status !== undefined ? String(value.status) : "N/A"}
              </div>
              <div>
                Number:{" "}
                {value?.numberValue !== undefined ? value.numberValue : "N/A"}
              </div>
              <div>String: {value?.stringValue ?? "N/A"}</div>
              <div>
                Connected:{" "}
                {value?.connected !== undefined
                  ? String(value.connected)
                  : "N/A"}
              </div>
              <div>Last Update: {value?.lastUpdate ?? "N/A"}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
