import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";
import { useDeviceValuesStore } from "~/state/deviceValueStore";
import type { Device } from "~/state/devicesStore";
import type { AppWorkers } from "~/workers/MilleGrillesWorkerContext";

export function useToggleSwitch() {
  const workers = useMilleGrillesWorkers();
  const updateDeviceStatusAndPending = useDeviceValuesStore.getState()
    .updateDeviceStatusAndPending as any;

  return async (deviceGroup: DeviceGroup, device: any, status: boolean) => {
    if (!workers) return;
    await changeSwitchStatus(workers, deviceGroup, device, status);
    // Mark the change as pending in the store
    updateDeviceStatusAndPending(device.id, status, true);
  };
}

export async function changeSwitchStatus(
  workers: AppWorkers,
  deviceGroup: DeviceGroup,
  device: Device,
  status: boolean | null | undefined,
) {
  if (typeof status !== "boolean") return;

  const instanceId = deviceGroup.instance_id;
  if (!instanceId) throw new Error("Missing instanceId on the device");

  const statusValue = status ? 1 : 0;
  const response = await workers.connection?.deviceCommand(
    instanceId,
    deviceGroup.id,
    device.internalId,
    statusValue,
    "setSwitchValue",
  );

  if (!response.ok) {
    throw new Error(`Error toggling the switch: ${response.err}`);
  }

  // The caller will update the store pending status
}
