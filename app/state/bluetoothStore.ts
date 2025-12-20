import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createIDBStorage } from "../utils/idbStorage";

export interface BluetoothState {
  wifiSSID: string;
  serviceUrl: string;
  wifiPassword: string;
  setWifiSSID: (ssid: string) => void;
  setServiceUrl: (url: string) => void;
  setWifiPassword: (pw: string) => void;
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
      wifiSSID: "",
      serviceUrl: window.location.origin,
      wifiPassword: sessionStorage.getItem("millesens.wifiPassword") ?? "",
      setWifiSSID: (ssid) => set({ wifiSSID: ssid }),
      setServiceUrl: (url) => set({ serviceUrl: url }),
      setWifiPassword: (pw) => {
        set({ wifiPassword: pw });
        sessionStorage.setItem("millesens.wifiPassword", pw);
      },
      reset: () => {
        set({
          wifiSSID: "",
          serviceUrl: window.location.origin,
          wifiPassword: "",
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
