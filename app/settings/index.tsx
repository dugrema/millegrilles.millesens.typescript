import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfigurationStore } from "../state/configurationStore";

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
    </>
  );
}
