import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createIDBStorage } from "../utils/idbStorage";
import { useDeviceValuesStore } from "./deviceValueStore";
import { useDevicesStore } from "./devicesStore";
import { useDeviceGroupsStore } from "./deviceGroupsStore";

/** User preferences model */
export interface UserPreferences {
  /** User timezone */
  timezone?: string;
}

/** Zustand store shape for configuration */
export interface ConfigurationState {
  /** Current preferences */
  preferences: UserPreferences;
  /** Current user ID */
  userId?: string;
  /** Merge new preferences into the current state */
  setPreferences: (prefs: UserPreferences) => void;
  /** Set the current user ID */
  setUserId: (id: string) => void;
  /** Reset to an empty preferences object */
  resetPreferences: () => void;
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

export const useConfigurationStore = create<ConfigurationState>()(
  persist(
    (set, get) => ({
      preferences: {},
      userId: undefined,
      setPreferences: (prefs) =>
        set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
      resetPreferences: () => set({ preferences: {} }),
      setUserId: (id: string) => {
        const currentId = get().userId;
        if (currentId !== id) {
          console.info("Changing userId to ", id);
          useDeviceValuesStore.getState().setDeviceValues([]);
          useDevicesStore.getState().setDevices([]);
          useDeviceGroupsStore.getState().setGroups([]);
          set({ userId: id });
        } else {
          // console.log("Keeping userId ", currentId);
        }
      },
    }),

    {
      name: "configurationStore",
      storage: createJSONStorage(() => idbStringStorage),
    },
  ),
);
