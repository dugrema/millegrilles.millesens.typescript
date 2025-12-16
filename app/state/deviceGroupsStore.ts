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
  /** Instance identifier (from backend). */
  instance_id: string;
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
      /** Merge an incoming group with the existing one.  Any undefined
       *  properties are ignored, leaving the original values untouched. */
      mergeGroup: (g: Partial<DeviceGroup> & Pick<DeviceGroup, "id">) =>
        set((s) => {
          const merged = s.groups.map((x) => {
            if (x.id !== g.id) return x;
            // Only overwrite fields that are defined in the payload.
            if (g.name === "") delete g.name;
            if (
              typeof g.latitude !== "number" ||
              typeof g.longitude !== "number"
            ) {
              delete g.latitude;
              delete g.longitude;
            }
            if (!g.timezone) delete g.timezone;
            const updated: DeviceGroup = { ...x, ...g };
            // Persist the merged group.
            idb.setItem(updated.id, updated);
            return updated;
          });
          return { groups: merged };
        }),
    }),
    {
      name: "deviceGroupsStore",
      storage: createJSONStorage(() => idbStringStorage),
    },
  ),
);
