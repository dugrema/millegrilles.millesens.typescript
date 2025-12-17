import { useState, useEffect, ChangeEvent } from "react";

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

  // Keep local copy in sync with prop changes
  useEffect(() => {
    setLocalArgs(program.args);
  }, [program.args]);

  // Notify parent of any arg changes
  const update = (field: keyof ProgramArgs, value: any) => {
    const updated = { ...localArgs, [field]: value };
    setLocalArgs(updated as ProgramArgs);
    onChange(updated as ProgramArgs);
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

          <label>
            Switches (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.switches)}
              onChange={(e) =>
                update("switches", stringListToArray(e.target.value))
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Horaire (JSON):
            <textarea
              value={JSON.stringify(args.horaire ?? [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  update("horaire", parsed);
                } catch {
                  // ignore parse errors
                }
              }}
              className="w-full border rounded p-1"
              rows={6}
            />
          </label>
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
            Senseurs_humidite (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.senseurs_humidite)}
              onChange={(e) =>
                update("senseurs_humidite", stringListToArray(e.target.value))
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Switches_humidificateurs (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.switches_humidificateurs)}
              onChange={(e) =>
                update(
                  "switches_humidificateurs",
                  stringListToArray(e.target.value),
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
            Senseurs (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.senseurs)}
              onChange={(e) =>
                update("senseurs", stringListToArray(e.target.value))
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Switches (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.switches)}
              onChange={(e) =>
                update("switches", stringListToArray(e.target.value))
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
            Senseurs (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.senseurs)}
              onChange={(e) =>
                update("senseurs", stringListToArray(e.target.value))
              }
              className="w-full border rounded p-1"
            />
          </label>

          <label>
            Switches (comma separated):
            <input
              type="text"
              value={arrayToStringList(args.switches)}
              onChange={(e) =>
                update("switches", stringListToArray(e.target.value))
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
        </div>
      );
    }

    default:
      return <p>Unsupported program class: {program.class}</p>;
  }
}
