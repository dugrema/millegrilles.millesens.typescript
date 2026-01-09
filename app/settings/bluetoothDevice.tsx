import React from "react";
import { useNavigate } from "react-router";
import { useBluetoothStore } from "~/state/bluetoothStore";
import { DeviceConnection } from "~/components/Bluetooth";
import { useTranslation } from "react-i18next";

export default function BluetoothDevicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { wifiSSID, wifiPassword, serviceUrl, selectedDevice } =
    useBluetoothStore();

  if (!selectedDevice) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">
          {t("bluetoothDevice.title")}
        </h1>
        <p className="mb-4">{t("bluetoothDevice.noDevice")}</p>
        <button
          onClick={() => navigate("/settings/bluetooth")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {t("bluetoothDevice.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {t("bluetoothDevice.title")}
      </h1>
      <DeviceConnection
        selectedDevice={selectedDevice}
        wifi={wifiSSID}
        wifiPassword={wifiPassword}
        relayUrl={serviceUrl}
      />
    </div>
  );
}
