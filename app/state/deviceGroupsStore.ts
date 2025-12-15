import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createIDBStorage } from "../utils/idbStorage";

/** Representation of a device group (physical platform). */
export interface DeviceGroup {
  /** Unique identifier for the group (used in URLs). */
  id: string;
  /** Human‑readable name. */
  name: string;
  /** Optional microcode version. */
  microcode?: string;
  /** Optional IANA timezone string. */
  timezone?: string;
  /** Optional geographic coordinates. */
  latitude?: number;
  longitude?: number;
  /** Optional instance identifier (from backend). */
  instance_id?: string;
  registrationPending?: boolean;
  registrationRequested?: boolean;
}

/** Zustand store shape for device groups. */
export interface DeviceGroupsState {
  groups: DeviceGroup[];
  addGroup: (g: DeviceGroup) => void;
  removeGroup: (id: string) => void;
  setGroups: (gs: DeviceGroup[]) => void;
  updateGroup: (g: DeviceGroup) => void;
}

/** Persist to IndexedDB using a string‑based storage wrapper. */
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

export const useDeviceGroupsStore = create<DeviceGroupsState>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (g) => set((s) => ({ groups: [...s.groups, g] })),
      removeGroup: (id) =>
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),
      setGroups: (gs) => set({ groups: gs }),
      updateGroup: (g) =>
        set((s) => ({
          groups: s.groups.map((x) => (x.id === g.id ? g : x)),
        })),
    }),
    {
      name: "deviceGroupsStore",
      storage: createJSONStorage(() => idbStringStorage),
    },
  ),
);
