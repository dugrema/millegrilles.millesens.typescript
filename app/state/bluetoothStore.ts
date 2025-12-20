// Old store from legacy application

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createIDBStorage } from "../utils/idbStorage";
import type { DeviceState } from "~/utils/bluetooth/commands";

export interface BluetoothState {
  available: boolean;
  wifiSSID: string;
  serviceUrl: string;
  wifiPassword: string;
  selectedDevice?: BluetoothDevice;
  deviceState: DeviceState;
  stateLoaded: boolean;
  mergeDeviceState: (update: DeviceState) => void;
  setAvailable: (available: boolean) => void;
  setWifiSSID: (ssid: string) => void;
  setServiceUrl: (url: string) => void;
  setWifiPassword: (pw: string) => void;
  setSelectedDevice: (selectedDevice?: BluetoothDevice) => void;
  reset: () => void;
}

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

export const useBluetoothStore = create<BluetoothState>()(
  persist(
    (set) => ({
      available: false,
      wifiSSID: "",
      serviceUrl: window.location.origin,
      wifiPassword: sessionStorage.getItem("millesens.wifiPassword") ?? "",
      selectedDevice: undefined,
      deviceState: {},
      stateLoaded: false,
      setAvailable: (available: boolean) => set({ available }),
      setWifiSSID: (ssid) => set({ wifiSSID: ssid }),
      setServiceUrl: (url) => set({ serviceUrl: url }),
      setWifiPassword: (pw) => {
        set({ wifiPassword: pw });
        sessionStorage.setItem("millesens.wifiPassword", pw);
      },
      setSelectedDevice: (selectedDevice?: BluetoothDevice) =>
        set({ selectedDevice }),
      mergeDeviceState: (update) => {
        set((state) => ({
          stateLoaded: true,
          deviceState: { ...state.deviceState, ...update },
        }));
      },
      reset: () => {
        set({
          wifiSSID: "",
          serviceUrl: window.location.origin,
          wifiPassword: "",
          selectedDevice: undefined,
          stateLoaded: false,
          deviceState: {},
        });
        sessionStorage.removeItem("millesens.wifiPassword");
      },
    }),
    {
      name: "bluetoothStore",
      storage: createJSONStorage(() => idbStringStorage),
      partialize: (state) => ({
        wifiSSID: state.wifiSSID,
        serviceUrl: state.serviceUrl,
      }),
    },
  ),
);
