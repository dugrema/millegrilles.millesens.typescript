import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useDevicesStore } from "../state/devicesStore";
import { DevicePickList } from "../components/DevicePickList";

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
  const [localArgs, setLocalArgs] = useState<ProgramArgs>(program.args);

  // Retrieve the current device id from the route and get its internal id
  const { deviceId } = useParams<{ deviceId: string }>();
  const device = useDevicesStore((s) =>
    s.devices.find((d) => d.id === deviceId),
  );
  const deviceInternalId = device?.internalId ?? "";

  // Keep local copy in sync with prop changes only when the program itself changes
  useEffect(() => {
    console.debug("Loading program args: %O", program.args);
    let changed = false;
    if (deviceInternalId && program.class) {
      const newArgs = { ...program.args } as any;
      switch (program.class) {
        case "programmes.environnement.Humidificateur":
          if (!newArgs["switches_humidificateurs"]) {
            changed = true;
            newArgs["switches_humidificateurs"] = [deviceInternalId];
          }
        default:
          if (!newArgs.switches) {
            changed = true;
            newArgs.switches = [deviceInternalId];
          }
      }
      setLocalArgs(newArgs);
      if (changed) onChange(newArgs);
    } else {
      setLocalArgs(program.args);
    }
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
                className="border rounded p-2 mb-2 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <label>
                    Etat:
                    <select
                      value={item.etat}
                      onChange={(e) =>
                        updateSchedule(idx, "etat", Number(e.target.value))
                      }
                      className="border rounded p-1"
                    >
                      <option value={0}>0</option>
                      <option value={1}>1</option>
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
                      className="w-16 border rounded p-1"
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
                      className="w-16 border rounded p-1"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label>
                    Jour (0-6):
                    <input
                      type="number"
                      min={0}
                      max={6}
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
                      className="w-20 border rounded p-1"
                    />
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
                      className="border rounded p-1"
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

                <button
                  type="button"
                  onClick={() => removeSchedule(idx)}
                  className="self-start text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
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
          <label>
            Humidité target:
            <input
              type="number"
              value={args.humidite ?? 0}
              onChange={(e) => update("humidite", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Precision:
            <input
              type="number"
              value={args.precision ?? 0}
              onChange={(e) => update("precision", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Duree_off_min:
            <input
              type="number"
              value={args.duree_off_min ?? 0}
              onChange={(e) => update("duree_off_min", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Senseurs:
            <DevicePickList
              value={args.senseurs_humidite?.[0] ?? ""}
              onChange={(e) =>
                update(
                  "senseurs_humidite",
                  e.target.value ? [e.target.value] : [],
                )
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Duree_on_min:
            <input
              type="number"
              value={args.duree_on_min ?? 0}
              onChange={(e) => update("duree_on_min", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>
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
          <label>
            Temperature:
            <input
              type="number"
              value={args.temperature ?? 0}
              onChange={(e) => update("temperature", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Precision:
            <input
              type="number"
              value={args.precision ?? 0}
              onChange={(e) => update("precision", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Duree_off_min:
            <input
              type="number"
              value={args.duree_off_min ?? 0}
              onChange={(e) => update("duree_off_min", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Senseurs:
            <DevicePickList
              value={args.senseurs?.[0] ?? ""}
              onChange={(e) =>
                update("senseurs", e.target.value ? [e.target.value] : [])
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Duree_on_min:
            <input
              type="number"
              value={args.duree_on_min ?? 0}
              onChange={(e) => update("duree_on_min", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>
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
          <label>
            Temperature:
            <input
              type="number"
              value={args.temperature ?? 0}
              onChange={(e) => update("temperature", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Precision:
            <input
              type="number"
              value={args.precision ?? 0}
              onChange={(e) => update("precision", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Duree_off_min:
            <input
              type="number"
              value={args.duree_off_min ?? 0}
              onChange={(e) => update("duree_off_min", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Senseurs:
            <DevicePickList
              value={args.senseurs?.[0] ?? ""}
              onChange={(e) =>
                update("senseurs", e.target.value ? [e.target.value] : [])
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Duree_on_min:
            <input
              type="number"
              value={args.duree_on_min ?? 0}
              onChange={(e) => update("duree_on_min", Number(e.target.value))}
              className="w-full border rounded p-1"
            />
          </label>
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
