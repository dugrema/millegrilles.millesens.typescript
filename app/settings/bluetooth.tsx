import { useState } from "react";
import { useBluetoothStore } from "../state/bluetoothStore";

export default function SettingsBluetooth() {
  const [scanning, setScanning] = useState(false);
  const {
    wifiSSID,
    wifiPassword,
    serviceUrl,
    setWifiSSID,
    setWifiPassword,
    setServiceUrl,
  } = useBluetoothStore();
  console.log({ wifiSSID, wifiPassword, serviceUrl });
  const [devices, setDevices] = useState<string[]>([]);

  const handleScan = async () => {
    setScanning(true);
    // Placeholder: simulate scanning delay
    setTimeout(() => {
      setDevices(["Device A", "Device B"]);
      setScanning(false);
    }, 2000);
  };

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
      {devices.length > 0 && (
        <ul className="mt-4 space-y-2">
          {devices.map((d, i) => (
            <li key={i} className="p-2 border rounded">
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
