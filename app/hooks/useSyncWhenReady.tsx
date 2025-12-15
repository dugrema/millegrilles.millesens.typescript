// react-view5/app/hooks/useSyncWhenReady.tsx
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
  mapDeviceReadingsArrayToDeviceGroups,
  mapDeviceReadingsToDevice,
  mapDeviceReadingsToDeviceValues,
} from "../utils/deviceMapping";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "~/state/devicesStore";
import type {
  DeviceReadings,
  DeviceReadingValue,
} from "~/workers/connection.worker";

/**
 * A hook that watches the `ready` state of the connection store.
 * When the connection becomes ready, it performs a one‑time sync to fetch the
 * user's preferences from the worker and stores them in the configuration store.
 *
 * The hook also loads all previously persisted device values into zustand
 * and keeps the userId in sync between the connection store and
 * configuration store.  The sync is guarded by a `hasSynced` ref so that
 * it only runs once per ready cycle.
 */
export function useSyncWhenReady() {
  // Destructure readiness flag and current user id from the connection store
  const { ready, userId } = useConnectionStore();

  // Access the worker proxy that exposes the backend API
  const workers = useMilleGrillesWorkers();

  // Prevent multiple syncs while the connection stays ready
  const hasSynced = useRef(false);

  // Access setters from zustand stores
  const { setDeviceValues, updateDeviceValue } = useDeviceValuesStore();
  const { setUserId: setUserIdPersist, setPreferences } =
    useConfigurationStore();

  const receivedDeviceMessage = Comlink.proxy((msg: any) => {
    console.debug("[useSyncWhenReady] received device message:", msg);
    if (!msg) return;
    console.debug("[useSyncWhenReady.receivedDeviceMessage] onMessage: ", msg);
    const messageType = msg.routingKey.split(".").pop();
    if (messageType === "lectureConfirmee") {
      msg.message.connecte = true; // Force value of connected
      const values = mapDeviceReadingsToDeviceValues(
        msg.message as DeviceReadings,
      );
      values.map((device) => updateDeviceValue(device));
    }
  });

  // -----------------------------------------------------------------------
  // 1. Load all persisted device values on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    loadAllDeviceValues()
      .then((devices) => setDeviceValues(devices))
      .catch((err) =>
        console.error("Error loading device values from IDB: ", err),
      );
  }, []);

  // -----------------------------------------------------------------------
  // 2. Keep configuration store's userId in sync with connection store
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (userId) setUserIdPersist(userId);
  }, [userId]);

  // -----------------------------------------------------------------------
  // 3. When the connection becomes ready, fetch user preferences once
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!ready) return; // Not ready yet
    if (hasSynced.current) return; // Already synced for this cycle

    async function sync() {
      try {
        console.debug("[useSyncWhenReady] syncing...");
        // `setPreferences` is typed as `(prefs: UserPreferences) => void`
        await fetchUserConfiguration(workers, setPreferences);
        await fetchDevices(workers);
      } catch (err) {
        console.error("[useSyncWhenReady] sync error:", err);
      }
    }

    sync();
    hasSynced.current = true;
  }, [ready, workers, userId]);

  // Reset the sync flag when the connection goes back to not ready
  useEffect(() => {
    if (!ready || !workers) return;
    // Subscribe to device events from the worker
    workers.connection?.subscribeUserDevices(receivedDeviceMessage);
    return () => {
      workers.connection?.unsubscribeUserDevices(receivedDeviceMessage);
    };
  }, [ready, workers, receivedDeviceMessage]);

  // Reset the sync flag when the connection goes back to not ready
  useEffect(() => {
    if (!ready) hasSynced.current = false;
  }, [ready]);
}

/**
 * Fetches the user's configuration from the worker.
 * The second argument is the setter returned by `useConfigurationStore`; it
 * accepts a `UserPreferences` object and merges it into the existing state.
 *
 * @param workers - The worker proxy that provides the `getUserConfiguration`
 *   method.
 * @param setPreferences - Function to update preferences in the zustand store.
 *   Expected signature: `(prefs: UserPreferences) => void`.
 */
async function fetchUserConfiguration(
  workers: AppWorkers,
  setPreferences: (prefs: UserPreferences) => void,
) {
  const userConfigurationResponse =
    await workers.connection?.getUserConfiguration();
  if (userConfigurationResponse.ok) {
    console.debug("User configuration: ", userConfigurationResponse);
    if (userConfigurationResponse.timezone)
      setPreferences({ timezone: userConfigurationResponse.timezone });
  } else {
    console.error(
      "Error fetching user configuration: ",
      userConfigurationResponse.err,
    );
  }
}

async function fetchDevices(workers: AppWorkers) {
  const deviceResponse = await workers.connection?.getUserDevices();
  console.debug("User devices: ", deviceResponse);
  if (!deviceResponse?.ok) {
    console.error("Failed to fetch devices: ", deviceResponse?.err);
    return;
  }
  const deviceReadings = deviceResponse.appareils ?? [];
  const groups = mapDeviceReadingsArrayToDeviceGroups(deviceReadings);
  const devicesSublist = deviceReadings.map((device) =>
    mapDeviceReadingsToDevice(device),
  );
  const devices = devicesSublist.flat();

  console.debug(
    "FETCH deviceGroupss: %O, deviceSublist: %O, devices: %O",
    groups,
    devicesSublist,
    devices,
  );

  useDeviceGroupsStore.getState().setGroups(groups);
  useDevicesStore.getState().setDevices(devices);
  const values = deviceReadings.flatMap(mapDeviceReadingsToDeviceValues);
  useDeviceValuesStore.getState().setDeviceValues(values);
}
