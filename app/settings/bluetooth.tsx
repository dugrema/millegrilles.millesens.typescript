import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useBluetoothStore } from "../state/bluetoothStore";
import {
  checkBluetoothAvailable,
  requestDevice,
} from "~/utils/bluetooth/commands";

export default function SettingsBluetooth() {
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
  } = useBluetoothStore();

  const navigate = useNavigate();
  console.log({ wifiSSID, wifiPassword, serviceUrl });

  let [selectedDevice, setSelectedDevice] = useState(
    undefined as BluetoothDevice | undefined,
  );

  // Lifecycle handling for the GATT server of a device.
  useEffect(() => {
    if (!selectedDevice?.gatt) return;
    selectedDevice.addEventListener("gattserverdisconnected", () => {
      console.warn("GATT server disconnected");
      setSelectedDevice(undefined);
    });
  }, [selectedDevice, setSelectedDevice]);

  const handleScan = async () => {
    setScanning(true);
    // Scan Bluetooth BLE devices and select one
    try {
      const selectedDevice = await requestDevice();
      setSelectedDevice(selectedDevice);
      if (selectedDevice) {
        // Navigate to device detail page after selection
        navigate("/settings/bluetoothDevice");
      }
    } catch (err) {
      console.error("Error selecting device", err);
    } finally {
      setScanning(false);
    }
  };
  const handleDisconnect = () => {
    if (selectedDevice?.gatt?.connected) {
      selectedDevice.gatt.disconnect();
    }
    setSelectedDevice(undefined);
  };

  useEffect(() => {
    const check = async () => {
      const available = await checkBluetoothAvailable();
      console.debug("Bluetooth available?", available);
      setAvailable(available);
    };
    check();
  }, [setAvailable]);

  if (!available) {
    return <p>Bluetooth is not available</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Bluetooth</h1>
      <form className="mb-4 space-y-2">
        <div>
          <label className="block mb-1 font-medium">Wi‑Fi SSID</label>
          <input
            type="text"
            value={wifiSSID}
            onChange={(e) => setWifiSSID(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder="Enter SSID"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Wi‑Fi Password</label>
          <input
            type="password"
            value={wifiPassword}
            onChange={(e) => setWifiPassword(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder="Enter Password"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Service Connection URL
          </label>
          <input
            type="url"
            value={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
            className="w-full rounded border px-2 py-1"
            placeholder="https://example.com/"
          />
        </div>
      </form>
      <button
        onClick={handleScan}
        disabled={scanning}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {scanning ? "Scanning..." : "Scan"}
      </button>
      <button
        onClick={handleDisconnect}
        disabled={!selectedDevice}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 ml-2"
      >
        Disconnect
      </button>
      {selectedDevice && <p>Device is selected - TODO</p>}
    </div>
  );
}
