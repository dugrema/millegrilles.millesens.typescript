import { useEffect, useRef } from "react";
import { useConnectionStore } from "~/state/connectionStore";
import {
  useDeviceValuesStore,
  loadAllDeviceValues,
} from "../state/deviceValueStore";
import {
  useConfigurationStore,
  type UserPreferences,
} from "~/state/configurationStore";
import {
  useMilleGrillesWorkers,
  type AppWorkers,
} from "~/workers/MilleGrillesWorkerContext";
import * as Comlink from "comlink";
import {
  mapDeviceReadingsToDevice,
  mapDeviceReadingsToDeviceValues,
  mapDeviceReadingsArrayToDeviceGroups,
  mapDeviceReadingsToDeviceGroup,
} from "../utils/deviceMapping";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "~/state/devicesStore";
import type { DeviceReadings } from "~/workers/connection.worker";

/**
 * Hook that synchronises the application state when the connection becomes ready.
 *
 * - Loads persisted device values from IndexedDB.
 * - Keeps the user id in sync between the connection and configuration stores.
 * - When ready, fetches user preferences and device data once.
 * - Subscribes to device events from the worker; in particular handles
 *   `presenceAppareil` to mark all sensors of a device as connected.
 */
export function useSyncWhenReady() {
  const { ready, userId } = useConnectionStore();
  const workers = useMilleGrillesWorkers();
  const hasSynced = useRef(false);

  const { mergeGroup } = useDeviceGroupsStore();
  const { setDeviceValues, updateDeviceValue, touchDeviceGroupPresence } =
    useDeviceValuesStore();
  const { setUserId: setUserIdPersist, setPreferences } =
    useConfigurationStore();

  // Receive device messages from the worker
  const receivedDeviceMessage = Comlink.proxy((msg: any) => {
    if (!msg) return;
    const messageType = msg.routingKey.split(".").pop();

    console.debug("receivedDeviceMessage: ", msg);

    // Partial update of a device group (sensor values)
    if (messageType === "lectureConfirmee") {
      msg.message.connecte = true; // Force connected flag
      const group = mapDeviceReadingsToDeviceGroup(msg.message);
      group.name = "";
      mergeGroup(group);
      // console.debug(
      //   "receivedDeviceMessage lectureConfirmee deviceGroup",
      //   group,
      // );
      const values = mapDeviceReadingsToDeviceValues(
        msg.message as DeviceReadings,
      );
      values.forEach(updateDeviceValue);
    }

    // Presence event – mark all sensors of the device as connected
    else if (messageType === "presenceAppareil") {
      const uuid = msg.message.uuid_appareil;
      // Update the store in bulk: keep other properties unchanged
      const connected = !!msg.message.connecte;
      touchDeviceGroupPresence(uuid, connected);
    }
  });

  // 1. Load persisted values on mount
  useEffect(() => {
    loadAllDeviceValues()
      .then(setDeviceValues)
      .catch((err) =>
        console.error("Error loading device values from IDB: ", err),
      );
  }, []);

  // 2. Sync userId
  useEffect(() => {
    if (userId) setUserIdPersist(userId);
  }, [userId]);

  // 3. Once ready, fetch preferences and devices once
  useEffect(() => {
    if (!ready || hasSynced.current || !workers) return;

    async function sync() {
      try {
        if (!workers) throw new Error("Workers not initialized");
        await fetchUserConfiguration(workers, setPreferences);
        await fetchDevices(workers);
      } catch (e) {
        console.error("[useSyncWhenReady] sync error:", e);
      }
    }
    sync();
    hasSynced.current = true;
  }, [ready, workers, userId]);

  // Subscribe/unsubscribe to device events when ready
  useEffect(() => {
    if (!ready || !workers) return;
    workers.connection?.subscribeUserDevices(receivedDeviceMessage);
    return () => {
      workers.connection?.unsubscribeUserDevices(receivedDeviceMessage);
    };
  }, [ready, workers, receivedDeviceMessage]);

  // Reset flag when not ready
  useEffect(() => {
    if (!ready) hasSynced.current = false;
  }, [ready]);
}

/**
 * Fetch user configuration from the worker.
 */
async function fetchUserConfiguration(
  workers: AppWorkers,
  setPreferences: (prefs: UserPreferences) => void,
) {
  const resp = await workers.connection?.getUserConfiguration();
  if (resp?.ok && resp.timezone) {
    setPreferences({ timezone: resp.timezone });
  } else if (resp?.err) {
    console.error("Error fetching user configuration:", resp.err);
  }
}

/**
 * Fetch user devices from the worker and populate zustand stores.
 */
async function fetchDevices(workers: AppWorkers) {
  const resp = await workers.connection?.getUserDevices();
  if (!resp?.ok) {
    console.error("Failed to fetch devices:", resp?.err);
    return;
  }

  console.debug("fetchDevices Response", resp);

  const deviceReadings = resp.appareils ?? [];
  const groups = mapDeviceReadingsArrayToDeviceGroups(deviceReadings);
  const devices = deviceReadings.map(mapDeviceReadingsToDevice).flat();

  const values = deviceReadings.flatMap(mapDeviceReadingsToDeviceValues);

  useDeviceGroupsStore.getState().setGroups(groups);
  useDevicesStore.getState().setDevices(devices);
  useDeviceValuesStore.getState().setDeviceValues(values);
}
