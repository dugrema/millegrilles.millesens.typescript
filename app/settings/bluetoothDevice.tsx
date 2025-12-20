import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useBluetoothStore } from "~/state/bluetoothStore";
import { DeviceConnection } from "~/components/Bluetooth";

/**
 * Page that displays the selected Bluetooth device and allows configuration.
 *
 * The device is expected to be passed via React Router location state when
 * navigating from the SettingsBluetooth page.  If no device is present, the
 * page shows a message and offers a button to return to the device list.
 */
export default function BluetoothDevicePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { wifiSSID, wifiPassword, serviceUrl, selectedDevice } =
    useBluetoothStore();

  if (!selectedDevice) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Bluetooth Device</h1>
        <p>No device selected. Please go back and scan a device first.</p>
        <button
          onClick={() => navigate("/settings/bluetooth")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back to Devices
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Bluetooth Device</h1>
      <DeviceConnection
        selectedDevice={selectedDevice}
        wifi={wifiSSID}
        wifiPassword={wifiPassword}
        relayUrl={serviceUrl}
      />
    </div>
  );
}
