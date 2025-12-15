import type { DeviceGroup } from "../state/deviceGroupsStore";
import type { DeviceValue } from "../state/deviceValueStore";
import type { DeviceReadings } from "../workers/connection.worker";
import type { Device } from "../state/devicesStore";

/**
 * Convert a `DeviceReadings` object (the raw response from the backend)
 * into a {@link DeviceGroup}.
 *
 * The backend returns a single logical device that includes all sensor readings.
 * In the UI we want a *group* that represents that physical device.
 *
 * Only properties that actually exist on the backend `DeviceConfiguration`
 * are mapped: the IANA `timezone` string and the optional `geoposition`
 * coordinates.  All other group properties are left to their default values.
 */
export function mapDeviceReadingsToDeviceGroup(
  readings: DeviceReadings,
): DeviceGroup {
  return {
    id: readings.uuid_appareil,
    instance_id: readings.instance_id,
    name: readings.configuration?.descriptif ?? readings.uuid_appareil,
    timezone: readings.configuration?.timezone ?? undefined,
    latitude: readings.configuration?.geoposition?.latitude ?? undefined,
    longitude: readings.configuration?.geoposition?.longitude ?? undefined,
    registrationPending: !!readings.csr_present,
    registrationRequested: false,
  };
}

/**
 * Convert an array of {@link DeviceReadings} into an array of
 * {@link DeviceGroup}s.
 */
export function mapDeviceReadingsArrayToDeviceGroups(
  readingsArr: DeviceReadings[],
): DeviceGroup[] {
  return readingsArr.map(mapDeviceReadingsToDeviceGroup);
}

/**
 * Convert a single {@link DeviceReadings} into an array of {@link Device}s.
 * Each entry in {@link DeviceReadings.types_donnees} becomes a separate
 * {@link Device}. The `id` is `${uuid_appareil}/${key}`.
 *
 * The `name` is taken from `configuration.descriptif_senseurs[key]` if
 * available, otherwise the key itself is used.
 *
 * Types are normalised:
 *   - `"ip"`          → `"string"`
 *   - `"pression_tendance"` → `"pression_tendance"` (kept as‑is)
 *   - `"temperature"`, `"humidite"`, `"pression"` → `"number"`
 *   - any other value is kept unchanged.
 */
export function mapDeviceReadingsToDevice(readings: DeviceReadings): Device[] {
  const devices: Device[] = [];
  const { uuid_appareil, configuration, senseurs } = readings;

  if (!senseurs) return devices;

  Object.entries(senseurs).forEach(([key, value]) => {
    const rawType = value.type;
    const sanitizedKey = key.replaceAll("/", "_");
    const id = `${uuid_appareil}__${sanitizedKey}`;

    let type: string;
    if (rawType === "temperature") {
      type = "Temperature";
    } else if (rawType === "humidite") {
      type = "Humidity";
    } else if (rawType === "pression") {
      type = "AtmPressure";
    } else if (rawType === "pression_tendance") {
      type = "AtmPressurePa";
    } else if (rawType === "switch") {
      type = "Switch";
    } else {
      type = "String";
    }

    const name = configuration?.descriptif_senseurs?.[key] ?? key;

    const deleted = configuration?.cacher_senseurs?.includes(key) ?? false;
    devices.push({
      id,
      internalId: key,
      name,
      deviceGroup: uuid_appareil,
      type,
      notification: false,
      deleted,
    });
  });

  return devices;
}

/**
 * Convert a single {@link DeviceReadings} into an array of {@link DeviceValue}s.
 * Each sensor reading becomes a {@link DeviceValue}.  The `id` is constructed from
 * the device UUID and the sensor key so that it is globally unique.
 */
export function mapDeviceReadingsToDeviceValues(
  readings: DeviceReadings,
): DeviceValue[] {
  const sensorEntries = Object.entries(readings.senseurs ?? {});
  return sensorEntries.map(([key, reading]) => {
    const sanitizedKey = key.replaceAll("/", "_");
    const id = `${readings.uuid_appareil}__${sanitizedKey}`;
    const status =
      reading.type === "switch" && typeof reading.valeur === "number"
        ? Boolean(reading.valeur)
        : undefined;

    return {
      id,
      numberValue:
        typeof reading.valeur === "number" ? reading.valeur : undefined,
      stringValue:
        typeof reading.valeur_str === "string" ? reading.valeur_str : undefined,
      status,
      connected: readings.connecte ?? false,
      notification: undefined,
      lastUpdate: reading.timestamp,
    };
  });
}

/**
 * Convert an array of {@link DeviceReadings} into an array of
 * {@link DeviceValue}s.
 */
export function mapDeviceReadingsArrayToDeviceValues(
  readingsArr: DeviceReadings[],
): DeviceValue[] {
  return readingsArr.flatMap(mapDeviceReadingsToDeviceValues);
}
