import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useDevicesStore } from "../state/devicesStore";
import { DevicePickList } from "../components/DevicePickList";
import { ConfirmButton } from "~/components/ConfirmButton";

interface Horaire {
  etat: 0 | 1;
  heure: number;
  minute: number;
  jour?: number;
  solaire?: string;
}

interface HoraireHebdomadaireArgs {
  activationInitiale: boolean;
  switches: string[];
  horaire: Horaire[];
}

interface HumidificateurArgs {
  humidite: number;
  precision: number;
  duree_off_min: number;
  senseurs_humidite: string[];
  switches_humidificateurs: string[];
  duree_on_min: number;
}

interface ChauffageArgs {
  temperature: number;
  precision: number;
  duree_off_min: number;
  senseurs: string[];
  switches: string[];
  duree_on_min: number;
}

interface ClimatisationArgs {
  temperature: number;
  precision: number;
  duree_off_min: number;
  senseurs: string[];
  switches: string[];
  duree_on_min: number;
}

type ProgramArgs =
  | HoraireHebdomadaireArgs
  | HumidificateurArgs
  | ChauffageArgs
  | ClimatisationArgs;

const DEFAULT_HORAIRE_ARGS: HoraireHebdomadaireArgs = {
  activationInitiale: false,
  switches: [],
  horaire: [],
};

const DEFAULT_HUMIDITE_ARGS: HumidificateurArgs = {
  humidite: 40,
  precision: 2,
  duree_off_min: 30,
  senseurs_humidite: [],
  switches_humidificateurs: [],
  duree_on_min: 30,
};

const DEFAULT_CHAUFFAGE_ARGS: ChauffageArgs = {
  temperature: 20,
  precision: 1,
  duree_off_min: 30,
  senseurs: [],
  switches: [],
  duree_on_min: 10,
};

const DEFAULT_CLIMA_ARGS: ClimatisationArgs = {
  temperature: 20,
  precision: 1,
  duree_off_min: 60,
  senseurs: [],
  switches: [],
  duree_on_min: 10,
};

interface Program {
  programme_id: string;
  class: string;
  descriptif: string;
  actif: boolean;
  args: ProgramArgs;
}

interface Props {
  program: Program;
  onChange: (args: ProgramArgs) => void;
}

export function DeviceProgramArgsEditor({ program, onChange }: Props) {
  // Retrieve the current device id from the route and get its internal id
  const { deviceId } = useParams<{ deviceId: string }>();
  const device = useDevicesStore((s) =>
    s.devices.find((d) => d.id === deviceId),
  );
  const deviceInternalId = device?.internalId ?? "";

  // Create default values for the program class - include the switch device.
  const defaultForClass = (): ProgramArgs => {
    switch (program.class) {
      case "programmes.horaire.HoraireHebdomadaire":
        return { ...DEFAULT_HORAIRE_ARGS, switches: [deviceInternalId] };
      case "programmes.environnement.Humidificateur":
        return {
          ...DEFAULT_HUMIDITE_ARGS,
          switches: [deviceInternalId],
          switches_humidificateurs: [deviceInternalId],
        };
      case "programmes.environnement.Chauffage":
        return { ...DEFAULT_CHAUFFAGE_ARGS, switches: [deviceInternalId] };
      case "programmes.environnement.Climatisation":
        return { ...DEFAULT_CLIMA_ARGS, switches: [deviceInternalId] };
      default:
        return {} as ProgramArgs;
    }
  };

  const [localArgs, setLocalArgs] = useState<ProgramArgs>(() => {
    const defaults = defaultForClass();
    return { ...defaults, ...program.args };
  });

  const initLoadingDone = useRef(false);
  // Keep local copy in sync with prop changes only when the program itself changes
  useEffect(() => {
    if (!program.class || initLoadingDone.current) return; // Prevent looping

    const defaults = defaultForClass();
    const merged = { ...defaults, ...program.args } as any;
    setLocalArgs(merged);
    onChange(merged);
    initLoadingDone.current = true; // Prevent infinite looping
  }, [program.args, program.class, deviceInternalId]);

  // Notify parent of any arg changes
  const update = (field: string, value: any) => {
    const updated = { ...localArgs, [field]: value };
    setLocalArgs(updated as any);
    onChange(updated as any);
  };

  // Safe helpers for list inputs
  const stringListToArray = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const arrayToStringList = (arr?: string[]) => (arr ?? []).join(", ");

  // Render specific UI based on program class
  switch (program.class) {
    case "programmes.horaire.HoraireHebdomadaire": {
      const args = localArgs as HoraireHebdomadaireArgs;
      const horaire = args.horaire ?? [];

      // Update a specific schedule entry
      const updateSchedule = (
        index: number,
        field: keyof Horaire,
        value: any,
      ) => {
        const newSchedule = { ...horaire[index], [field]: value };
        const newHoraire = [...horaire];
        newHoraire[index] = newSchedule;
        update("horaire", newHoraire);
      };

      // Remove a schedule entry
      const removeSchedule = (index: number) => {
        const newHoraire = horaire.filter((_, i) => i !== index);
        update("horaire", newHoraire);
      };

      // Add a blank schedule entry
      const addSchedule = () => {
        const newEntry: Horaire = { etat: 0, heure: 0, minute: 0 };
        update("horaire", [...horaire, newEntry]);
      };

      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={args.activationInitiale ?? false}
              onChange={(e) => update("activationInitiale", e.target.checked)}
            />
            Activation initiale
          </label>
          <input
            type="hidden"
            name="switches"
            value={arrayToStringList(args.switches)}
          />

          <fieldset className="border p-3 rounded">
            <legend className="font-medium mb-2">Horaire</legend>
            {horaire.map((item, idx) => (
              <div
                key={idx}
                className="border rounded p-2 4 mb-2 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-4"
              >
                <div className="flex items-center gap-2">
                  <label>
                    Etat:
                    <select
                      value={item.etat}
                      onChange={(e) =>
                        updateSchedule(idx, "etat", Number(e.target.value))
                      }
                      className="border rounded p-1 ml-1 dark:bg-gray-800"
                    >
                      <option value={0}>OFF</option>
                      <option value={1}>ON</option>
                    </select>
                  </label>

                  <label>
                    Heure:
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={item.heure}
                      onChange={(e) =>
                        updateSchedule(idx, "heure", Number(e.target.value))
                      }
                      className={`w-16 border rounded p-1 ml-1 ${item.solaire ? "bg-gray-200" : ""}`}
                      disabled={!!item.solaire}
                    />
                  </label>

                  <label>
                    Minute:
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={item.minute}
                      onChange={(e) =>
                        updateSchedule(idx, "minute", Number(e.target.value))
                      }
                      className="w-16 border rounded p-1 ml-1"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label>
                    Jour:
                    <select
                      value={item.jour ?? ""}
                      onChange={(e) =>
                        updateSchedule(
                          idx,
                          "jour",
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                      className="w-28 border rounded p-1 ml-1 dark:bg-gray-800"
                    >
                      <option value="">None</option>
                      <option value="6">Sunday</option>
                      <option value="0">Monday</option>
                      <option value="1">Tuesday</option>
                      <option value="2">Wednesday</option>
                      <option value="3">Thursday</option>
                      <option value="4">Friday</option>
                      <option value="5">Saturday</option>
                    </select>
                  </label>

                  <label>
                    Solaire:
                    <select
                      value={item.solaire ?? ""}
                      onChange={(e) =>
                        updateSchedule(
                          idx,
                          "solaire",
                          e.target.value === "" ? undefined : e.target.value,
                        )
                      }
                      className="border rounded p-1 ml-1 dark:bg-gray-800"
                    >
                      <option value="">None</option>
                      <option value="sunset">Sunset</option>
                      <option value="dusk">Dusk</option>
                      <option value="noon">Noon</option>
                      <option value="dawn">Dawn</option>
                      <option value="sunrise">Sunrise</option>
                    </select>
                  </label>
                </div>

                <ConfirmButton
                  variant="secondary"
                  onClick={() => removeSchedule(idx)}
                  className="self-start text-red-600 hover:text-red-800 hover:bg-red-500"
                >
                  Remove
                </ConfirmButton>
              </div>
            ))}

            <button
              type="button"
              onClick={addSchedule}
              className="bg-green-600 text-white rounded p-2 hover:bg-green-700"
            >
              Add Schedule
            </button>
          </fieldset>
        </div>
      );
    }

    case "programmes.environnement.Humidificateur": {
      const args = localArgs as HumidificateurArgs;
      return (
        <div className="space-y-3">
          <label className="flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full">
            <span className="lg:w-1/5">Senseurs:</span>
            <DevicePickList
              value={args.senseurs_humidite?.[0] ?? ""}
              onChange={(e) =>
                update(
                  "senseurs_humidite",
                  e.target.value ? [e.target.value] : [],
                )
              }
              className="flex-1 border rounded p-1"
              deviceType="Humidity"
              currentDeviceGroup={device?.deviceGroup}
            />
          </label>

          <div className="flex flex-col lg:flex-row lg:gap-4 w-full">
            <label className="flex-1">
              Humidité target:
              <input
                type="number"
                value={args.humidite ?? 40}
                onChange={(e) => update("humidite", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Precision:
              <input
                type="number"
                value={args.precision ?? 2}
                onChange={(e) => update("precision", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Duree_off_min:
              <input
                type="number"
                value={args.duree_off_min ?? 30}
                onChange={(e) =>
                  update("duree_off_min", Number(e.target.value))
                }
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Duree_on_min:
              <input
                type="number"
                value={args.duree_on_min ?? 30}
                onChange={(e) => update("duree_on_min", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>
          </div>

          <input
            type="hidden"
            name="switches_humidificateurs"
            value={arrayToStringList(args.switches_humidificateurs)}
          />
        </div>
      );
    }

    case "programmes.environnement.Chauffage": {
      const args = localArgs as ChauffageArgs;
      return (
        <div className="space-y-3">
          <label className="flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full">
            <span className="lg:w-1/5">Senseurs:</span>
            <DevicePickList
              value={args.senseurs?.[0] ?? ""}
              onChange={(e) =>
                update("senseurs", e.target.value ? [e.target.value] : [])
              }
              className="flex-1 border rounded p-1"
              deviceType="Temperature"
              currentDeviceGroup={device?.deviceGroup}
            />
          </label>

          <div className="flex flex-col lg:flex-row lg:gap-4 w-full">
            <label className="flex-1">
              Temperature:
              <input
                type="number"
                value={args.temperature ?? 20}
                onChange={(e) => update("temperature", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Precision:
              <input
                type="number"
                value={args.precision ?? 1}
                onChange={(e) => update("precision", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Duree_off_min:
              <input
                type="number"
                value={args.duree_off_min ?? 30}
                onChange={(e) =>
                  update("duree_off_min", Number(e.target.value))
                }
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Duree_on_min:
              <input
                type="number"
                value={args.duree_on_min ?? 10}
                onChange={(e) => update("duree_on_min", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>
          </div>

          <input
            type="hidden"
            name="switches"
            value={arrayToStringList(args.switches)}
          />
        </div>
      );
    }

    case "programmes.environnement.Climatisation": {
      const args = localArgs as ClimatisationArgs;
      return (
        <div className="space-y-3">
          <label className="flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full">
            <span className="lg:w-1/5">Senseurs:</span>
            <DevicePickList
              currentDeviceGroup={device?.deviceGroup}
              value={args.senseurs?.[0] ?? ""}
              onChange={(e) =>
                update("senseurs", e.target.value ? [e.target.value] : [])
              }
              className="flex-1 border rounded p-1"
              deviceType="Temperature"
            />
          </label>

          <div className="flex flex-col lg:flex-row lg:gap-4 w-full">
            <label className="flex-1">
              Temperature:
              <input
                type="number"
                value={args.temperature ?? 20}
                onChange={(e) => update("temperature", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Precision:
              <input
                type="number"
                value={args.precision ?? 1}
                onChange={(e) => update("precision", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Duree_off_min:
              <input
                type="number"
                value={args.duree_off_min ?? 60}
                onChange={(e) =>
                  update("duree_off_min", Number(e.target.value))
                }
                className="w-full border rounded p-1"
              />
            </label>

            <label className="flex-1">
              Duree_on_min:
              <input
                type="number"
                value={args.duree_on_min ?? 10}
                onChange={(e) => update("duree_on_min", Number(e.target.value))}
                className="w-full border rounded p-1"
              />
            </label>
          </div>

          <input
            type="hidden"
            name="switches"
            value={arrayToStringList(args.switches)}
          />
        </div>
      );
    }

    default:
      return <p>Unsupported program class: {program.class}</p>;
  }
}
