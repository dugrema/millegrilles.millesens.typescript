import React from "react";
import { Button } from "./Button";
import { useTime } from "./TimeContext";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useTranslation } from "react-i18next";

/** Map of unit suffixes for device types. */
export const UNIT_MAP: Record<string, string> = {
  Temperature: "°C",
  Humidity: "%",
  AtmPressure: " hPa",
  AtmPressurePa: " Pa",
  Number: "",
  String: "",
  Switch: "",
};

/** Props for the {@link DeviceCard} component. */
export interface DeviceCardProps {
  /** Display name of the device. */
  name: string;
  /** Device identifier. */
  id: string;
  /** Grouping for the device, can be location or virtual grouping. */
  deviceGroup: string;
  /** Device type (one of "Temperature", "Humidity", "Switch", "Number" or "String"). */
  type: string;
  /** Current numeric value for sensors (e.g., temperature, humidity). */
  numberValue?: number;
  /** Current string value for sensors (e.g., text or status messages). */
  stringValue?: string;
  /** Current status for switches. */
  status?: boolean;
  /** Callback invoked when the toggle button is pressed. */
  onToggle?: () => void;
  /** Indicates whether the device is currently connected. */
  connected?: boolean;
  /** Indicates whether the device has a notification. */
  notification?: boolean;
  /** Indicates whether a change is pending. */
  changePending?: boolean;
  /** Epoch seconds (Unix timestamp) when the device last reported a value. */
  lastUpdate: number;
  /** Any additional children to render in the card body. */
  children?: React.ReactNode;
}

/** Inline SVG Wi‑Fi icon that accepts Tailwind classes. */
const WifiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
    />
  </svg>
);

/** Inline SVG bell alert icon that accepts Tailwind classes. */
const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
    />
  </svg>
);

/** SVG used as a spinner while a change is pending. */
const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

/**
 * UI component that displays a device's state and controls.
 *
 * The button is disabled when the device is disconnected or when a
 * change is pending. While pending, a spinning icon is shown in place
 * of the text label.
 */
export const DeviceCard: React.FC<DeviceCardProps> = ({
  name,
  id,
  deviceGroup,
  type,
  numberValue,
  stringValue,
  status,
  onToggle,
  connected,
  notification,
  lastUpdate,
  children,
  changePending,
}) => {
  const { t } = useTranslation();
  const now = useTime(); // seconds
  const delta = now - lastUpdate;

  const valueColor =
    delta > 1800
      ? "text-red-500"
      : delta > 300
        ? "text-yellow-500"
        : "text-gray-900 dark:text-gray-100";

  const switchVariant = status ? "secondary" : "outline";
  const group = useDeviceGroupsStore((s) =>
    s.groups.find((g) => g.id === deviceGroup),
  );

  // --------------------------------------------------------------------
  // Switch button class handling
  // --------------------------------------------------------------------
  const isOn = status === true;
  const isDisabled = !connected || !!changePending;

  const baseSwitchClasses =
    "mt-4 w-full flex items-center justify-center rounded-md px-4 py-2";

  const stateClasses = isDisabled
    ? // Disabled: medium gray background, subdued text, no hover
      "bg-gray-400 text-gray-500 hover:bg-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400 hover:dark:bg-gray-600"
    : isOn
      ? // ON: light gray → medium gray on hover
        "bg-gray-200 text-gray-700 hover:bg-gray-400 cursor-pointer"
      : // OFF: dark gray → medium gray on hover
        "bg-gray-600 text-gray-200 hover:bg-gray-400 cursor-pointer";

  const switchButtonClasses = `${baseSwitchClasses} ${stateClasses}`;
  // --------------------------------------------------------------------

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col justify-between h-full">
      <div>
        <div className="grid grid-cols-4 items-start gap-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 col-span-3 max-h-14 wrap-break-word overflow-hidden">
            {name}
          </h3>
          <div className="flex justify-end gap-2">
            {connected !== undefined && (
              <WifiIcon
                className={
                  connected
                    ? "size-6 text-green-500 shrink-0"
                    : "size-6 text-red-500 shrink-0"
                }
              />
            )}
            {notification !== undefined && (
              <BellIcon
                className={
                  notification
                    ? "size-6 text-yellow-500 shrink-0"
                    : "size-6 text-green-500 shrink-0"
                }
              />
            )}
          </div>
        </div>
        {type && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {group?.name || deviceGroup}
          </p>
        )}
        {children}
      </div>

      {type === "Temperature" && numberValue !== undefined && (
        <div className="mt-4 text-center">
          <span className={`text-4xl font-semibold ${valueColor}`}>
            {Number(numberValue).toFixed(1)}°
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-300">
            {t("deviceCard.celsius")}
          </span>
        </div>
      )}

      {type === "Humidity" && numberValue !== undefined && (
        <div className="mt-4 text-center">
          <span className={`text-4xl font-semibold ${valueColor}`}>
            {numberValue}%
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-300 min-h-5"></span>
        </div>
      )}

      {type === "AtmPressure" && numberValue !== undefined && (
        <div className="mt-4 text-center">
          <span className={`text-4xl font-semibold ${valueColor}`}>
            {numberValue}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-300">
            hPa
          </span>
        </div>
      )}

      {type === "AtmPressurePa" && numberValue !== undefined && (
        <div className="mt-4 text-center">
          <span className={`text-4xl font-semibold ${valueColor}`}>
            {numberValue}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-300">
            Pa
          </span>
        </div>
      )}

      {type === "String" && stringValue !== undefined && (
        <div className="mt-4 text-center truncate">
          <span className={`text-xl font-semibold ${valueColor}`}>
            {stringValue}
          </span>
        </div>
      )}

      {type === "Switch" && onToggle && (
        <Button
          disabled={isDisabled}
          type="button"
          variant={switchVariant}
          className={switchButtonClasses}
          aria-label={
            changePending
              ? t("deviceCard.toggling")
              : status
                ? t("deviceCard.on")
                : t("deviceCard.off")
          }
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggle && onToggle();
          }}
        >
          {changePending ? (
            <SpinnerIcon className="animate-spin size-6" />
          ) : status === undefined ? (
            t("deviceCard.toggle")
          ) : status ? (
            t("deviceCard.on")
          ) : (
            t("deviceCard.off")
          )}
        </Button>
      )}
    </div>
  );
};
