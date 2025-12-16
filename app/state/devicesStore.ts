import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createIDBStorage } from "../utils/idbStorage";

/** Device model used throughout the app */
export interface Device {
  /** Unique device id made of: deviceGroupId__internalId */
  id: string;
  /** Device id under the deviceGroup */
  internalId: string;
  /** User assigned device name */
  name: string;
  /** Grouping by physical device. */
  deviceGroup: string;
  /** Type, one of: Temperature, Humidity, Switch */
  type: string;
  /** Optional notification flag */
  notification?: boolean;
  /** Optional group(s) used for filtering. */
  group?: string[];
  /** Optional flag for deleted devices. */
  deleted?: boolean;
}

/** Zustand store shape for the device list */
export interface DevicesState {
  devices: Device[];
  addDevice: (d: Device) => void;
  removeDevice: (id: string) => void;
  setDevices: (ds: Device[]) => void;
  updateDevice: (d: Device) => void;
}

/** Persist to IndexedDB using a string‑based storage wrapper */
const idb = createIDBStorage();
const idbStringStorage = {
  async getItem(key: string): Promise<string | null> {
    const v = await idb.getItem(key);
    return v === undefined ? null : JSON.stringify(v);
  },
  async setItem(key: string, value: string): Promise<void> {
    const parsed = JSON.parse(value);
    await idb.setItem(key, parsed);
  },
  async removeItem(key: string): Promise<void> {
    await idb.removeItem(key);
  },
};

export const useDevicesStore = create<DevicesState>()(
  persist(
    (set) => ({
      devices: [],
      addDevice: (d) => set((s) => ({ devices: [...s.devices, d] })),
      removeDevice: (id) =>
        set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),
      setDevices: (ds) => set({ devices: ds }),
      updateDevice: (d) =>
        set((s) => ({
          devices: s.devices.map((dev) => (dev.id === d.id ? d : dev)),
        })),
    }),
    {
      name: "devicesStore",
      storage: createJSONStorage(() => idbStringStorage),
    },
  ),
);
