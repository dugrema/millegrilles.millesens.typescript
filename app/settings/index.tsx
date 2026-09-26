import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfigurationStore } from "../state/configurationStore";
import { useMilleGrillesWorkers, type AppWorkers } from "~/workers/MilleGrillesWorkerContext";
import { useConnectionStore } from "~/state/connectionStore";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { preferences, setPreferences } = useConfigurationStore();

  // Use a local state to keep the <select> value in sync
  const [timezone, setTimezone] = useState(
    preferences.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
  );

  // When the store changes (e.g., after a page refresh), keep the UI in sync
  useEffect(() => {
    setTimezone(preferences.timezone || "");
  }, [preferences.timezone]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tz = e.target.value;
    setTimezone(tz);
    setPreferences({ timezone: tz });
  };

  const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);
  useEffect(() => {
    if (typeof Intl.supportedValuesOf === "function") {
      setAvailableTimezones(Intl.supportedValuesOf("timeZone"));
    } else {
      setAvailableTimezones([
        "UTC",
        "America/New_York",
        "Europe/Paris",
        "Asia/Tokyo",
        "Australia/Sydney",
      ]);
    }
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">{t("settingsPage.title")}</h1>

      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {t("settingsPage.timezoneLabel")}
          <select
            className="mt-1 block w-full rounded border px-2 py-1 dark:bg-gray-800"
            value={timezone}
            onChange={handleChange}
          >
            {availableTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
        {timezone && (
          <p className="text-sm text-gray-500">
            {t("settingsPage.currentSelection", { timezone })}{" "}
            <strong>{timezone}</strong>
          </p>
        )}
      </div>

      <ConfigurationForDevice />
    </>
  );
}

function ConfigurationForDevice() {
  const idmg = useConnectionStore((state) => state.idmg);
  const userId = useConnectionStore((state) => state.userId);

  const [userFile, relaisFile] = useMemo(()=>{
    const userFile = `{ "idmg":${idmg}, "userId":${userId} }`;
    const hostname = window.location.hostname;
    const relaisFile = `{"relais": ["https://${hostname}/senseurspassifs_relai"]}`;
    return [userFile, relaisFile];
  }, [idmg, userId]);

  if(!idmg || !userId) return <></>;

  return (
    <>
      <p className="mt-4 font-medium py-4">Content for device <span className="font-semibold">user.json</span> file</p>
      <p className='w-full overflow-x-auto bg-slate-800 p-2'>{userFile}</p>
      <p className="mt-4 font-medium py-4">Content for device <span className="font-semibold">relais.json</span> file</p>
      <p className='w-full overflow-x-auto bg-slate-800 p-2'>{relaisFile}</p>
      <p className="mt-4 font-medium py-4">Sample <span className="font-semibold">wifi.json</span> file</p>
      <p className='w-full overflow-x-auto bg-slate-800 p-2'>{SAMPLE_WIFI}</p>
      <p className="mt-4 font-medium py-4">Sample <span className="font-semibold">workarounds.json</span> file</p>
      <p className='w-full overflow-x-auto bg-slate-800 p-2'>{SAMPLE_WORKAROUNDS}</p>
      <p className="mt-4 font-medium py-4">Sample <span className="font-semibold">devices.json</span> file</p>
      <pre className='w-full overflow-x-auto bg-slate-800 p-2'>{SAMPLE_DEVICES}</pre>
    </>
  )
}

const SAMPLE_WIFI=`{"ssids": {"DUMMY_SSID": {"password": "DUMMY_PASSWORD"}}}`

const SAMPLE_WORKAROUNDS=`{"rebootInterval": 86400, "disableWatchdog": false, "enableBluetooth": false}`

const SAMPLE_DEVICES=`{
    "bus": [
        {"driver": "i2c", "bus": 0, "sda_pin": 8, "scl_pin": 9, "freq": 200000}
    ],
    "devices": [
        {"driver": "devices.rpipico.RPiPicoW", "ble": false},
        {"driver": "devices.dht.DriverDHT", "model": "DHT11", "pin": 28},
        {"driver": "devices.onewire.DriverOnewire", "models": ["DS18X20"], "pin": 22, "ble": "1W_"},
        {"driver": "devices.bmp.DriverBmp180", "bus": 0, "ble": false},
        {"driver": "devices.ssd1306.Ssd1306", "model": "i2c", "bus": 0, "height": 32, "lines": 4},
        {"driver": "devices.lcd1602.LCD1602", "model": "i2c", "bus": 0},
        {"driver": "devices.switch.DriverSwitchPin", "pin": 18},
        {"driver": "devices.switch.DriverSwitchPin", "pin": 19},
        {"driver": "devices.button.DriverButtonPin", "pin": 15, "short": {"did": "switch_p18", "action": "toggle"}, "long": {"action": "bleconfig"}}
    ]
}`