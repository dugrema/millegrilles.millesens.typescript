import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useBluetoothStore } from "~/state/bluetoothStore";
import {
  checkBluetoothAvailable,
  requestDevice,
} from "~/utils/bluetooth/commands";
import { useTranslation } from "react-i18next";

export default function SettingsBluetooth() {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);

  const {
    available,
    wifiSSID,
    wifiPassword,
    serviceUrl,
    setAvailable,
    setWifiSSID,
    setWifiPassword,
    setServiceUrl,
    selectedDevice,
    setSelectedDevice,
  } = useBluetoothStore();

  const navigate = useNavigate();

  /* Handle GATT server disconnect and cleanup */
  useEffect(() => {
    if (!selectedDevice?.gatt) return;
    const handler = () => {
      console.warn("GATT server disconnected");
      setSelectedDevice(undefined);
    };
    // @ts-ignore: addEventListener is not typed on BluetoothDevice
    selectedDevice.addEventListener("gattserverdisconnected", handler);
    return () => {
      // @ts-ignore: removeEventListener is not typed on BluetoothDevice
      selectedDevice.removeEventListener("gattserverdisconnected", handler);
    };
  }, [selectedDevice, setSelectedDevice]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const device = await requestDevice();
      setSelectedDevice(device ?? undefined);
      if (device) navigate("/settings/bluetoothDevice");
    } catch (err) {
      console.error("Error selecting device", err);
    } finally {
      setScanning(false);
    }
  };

  const handleDisconnect = () => {
    if (selectedDevice?.gatt?.connected) selectedDevice.gatt.disconnect();
    setSelectedDevice(undefined);
  };

  /* Check Bluetooth availability on mount */
  useEffect(() => {
    const check = async () => {
      const avail = await checkBluetoothAvailable();
      console.debug("Bluetooth available?", avail);
      setAvailable(avail);
    };
    check();
  }, [setAvailable]);

  if (!available) {
    return <p>{t("bluetooth.notAvailable")}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">{t("bluetooth.title")}</h1>

      <form className="mb-4 space-y-2">
        <div>
          <label className="block mb-1 font-medium">
            {t("bluetooth.wifiLabel")}
          </label>
          <input
            type="text"
            value={wifiSSID}
            onChange={(e) => setWifiSSID(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder={t("bluetooth.wifiLabel")}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            {t("bluetooth.wifiPasswordLabel")}
          </label>
          <input
            type="password"
            value={wifiPassword}
            onChange={(e) => setWifiPassword(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder={t("bluetooth.wifiPasswordLabel")}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            {t("bluetooth.serverConnectionUrlLabel")}
          </label>
          <input
            type="url"
            value={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder={t("bluetooth.serverConnectionUrlLabel")}
          />
        </div>
      </form>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {scanning ? t("bluetooth.scanning") : t("bluetooth.deviceScan.scan")}
      </button>

      <button
        onClick={handleDisconnect}
        disabled={!selectedDevice}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 ml-2"
      >
        {t("bluetooth.deviceScan.disconnect")}
      </button>

      {selectedDevice && (
        <p className="mt-2 text-sm text-gray-500">
          {t("bluetooth.selectedDevice", {
            device:
              (selectedDevice as any).name ?? t("bluetooth.unknownDevice"),
          })}
        </p>
      )}
    </div>
  );
}
