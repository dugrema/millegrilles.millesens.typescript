import { create } from "zustand";
import { createIDBStorage, getDBForStore } from "../utils/idbStorage";

/** Value model for device properties that change frequently */
export interface DeviceValue {
  id: string;
  numberValue?: number;
  stringValue?: string;
  status?: boolean;
  connected?: boolean;
  notification?: boolean;
  /** Indicates if a change to this value is pending synchronization with the device. */
  changePending?: boolean;
  lastUpdate: number;
}

/** Zustand store shape for the device values */
export interface DeviceValuesState {
  deviceValues: DeviceValue[];
  addDeviceValue: (d: DeviceValue) => void;
  removeDeviceValue: (id: string) => void;
  setDeviceValues: (ds: DeviceValue[]) => void;
  updateDeviceValue: (d: DeviceValue) => void;
  updateDeviceStatusAndPending: (
    id: string,
    status?: boolean,
    changePending?: boolean,
  ) => void;
  /** Update all values belonging to a device group by setting them as connected and refreshing their timestamp. */
  touchDeviceGroupPresence: (deviceGroup: string, connected?: boolean) => void;
}

/* --------------------------------------------------------------------------- */
/* ---------- IndexedDB helper that gives us a “per‑device” store ------------- */
/* --------------------------------------------------------------------------- */

const idb = createIDBStorage<DeviceValue>({ storeName: "deviceValues" });

/**
 * Load all device rows from the `deviceValues` object store.
 */
export async function loadAllDeviceValues(): Promise<DeviceValue[]> {
  const db = await getDBForStore("deviceValues");

  const tx = db.transaction("deviceValues", "readonly");
  const store = tx.objectStore("deviceValues");
  const keys = await store.getAllKeys();
  const values = await Promise.all((keys as string[]).map((k) => store.get(k)));

  await tx.done;
  return values.filter((v): v is DeviceValue => !!v);
}

/* --------------------------------------------------------------------------- */
/* -------------------------- Zustand store --------------------------------- */
/* --------------------------------------------------------------------------- */

export const useDeviceValuesStore = create<DeviceValuesState>((set) => ({
  deviceValues: [],

  addDeviceValue: (d) => {
    set((s) => ({ deviceValues: [...s.deviceValues, d] }));
    idb.setItem(d.id, d);
  },

  removeDeviceValue: (id) => {
    set((s) => ({
      deviceValues: s.deviceValues.filter((d) => d.id !== id),
    }));
    idb.removeItem(id);
  },

  setDeviceValues: (ds) => {
    set({ deviceValues: ds });
    Promise.all(ds.map((d) => idb.setItem(d.id, d)));
  },

  updateDeviceValue: (d) => {
    let updated: DeviceValue | null = null;
    set((s) => {
      const mergedList = s.deviceValues.map((dev) => {
        if (dev.id !== d.id) return dev;
        const mergedDev: DeviceValue = {
          ...dev,
          ...d,
          changePending: false,
          // lastUpdate: Math.floor(Date.now() / 1000),
          lastUpdate: d.lastUpdate || Math.floor(Date.now() / 1000),
        };
        updated = mergedDev;
        if (updated) idb.setItem(updated.id, updated);
        return mergedDev;
      });
      return { deviceValues: mergedList };
    });
  },

  updateDeviceStatusAndPending: (id, status, changePending) => {
    let updatedDevice: DeviceValue | undefined;
    set((s) => {
      const existing = s.deviceValues.find((dev) => dev.id === id);
      if (!existing) return { deviceValues: s.deviceValues };
      const updated: DeviceValue = { ...existing };
      if (status !== undefined) updated.status = status;
      if (changePending !== undefined) updated.changePending = changePending;
      updatedDevice = updated;
      return {
        deviceValues: s.deviceValues.map((dev) =>
          dev.id === id ? updated : dev,
        ),
      };
    });
    if (updatedDevice) idb.setItem(updatedDevice.id, updatedDevice);
  },

  /** Update all values of a specific device group to be connected and refresh timestamp */
  touchDeviceGroupPresence: (deviceGroup, connected?: boolean) => {
    const now = Math.floor(Date.now() / 1000);
    const prefix = `${deviceGroup}__`;
    set((s) => {
      const updatedList = s.deviceValues.map((dv) => {
        if (!dv.id.startsWith(prefix)) return dv;
        const updated: DeviceValue = {
          ...dv,
          connected,
          // lastUpdate: now,
        };
        idb.setItem(updated.id, updated);
        return updated;
      });
      return { deviceValues: updatedList };
    });
  },
}));

/* --------------------------------------------------------------------------- */
/* --------------------------- Hydration ------------------------------------- */
/* --------------------------------------------------------------------------- */

// loadAllDeviceValues().then((saved) => {
//   useDeviceValuesStore.getState().setDeviceValues(saved);
// });

/* --------------------------------------------------------------------------- */
/* ---------------------------- Exported helpers --------------------------- */
/* --------------------------------------------------------------------------- */

// export const deviceValuesStorage = idb;
