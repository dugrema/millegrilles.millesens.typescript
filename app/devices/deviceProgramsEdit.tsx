import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Button } from "~/components/Button";
import { DeviceProgramArgsEditor } from "./deviceProgramArgsEditor";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "../state/devicesStore";

export interface Program {
  programme_id: string;
  class: string;
  descriptif: string;
  actif: boolean;
  args: any;
}

/* Program class options – used for the selector */
const PROGRAM_CLASS_OPTIONS = [
  {
    value: "programmes.horaire.HoraireHebdomadaire",
    label: "Horaire Hebdomadaire",
  },
  { value: "programmes.environnement.Humidificateur", label: "Humidificateur" },
  { value: "programmes.environnement.Chauffage", label: "Chauffage" },
  { value: "programmes.environnement.Climatisation", label: "Climatisation" },
] as const;

const defaultProgram: Program = {
  programme_id: "",
  class: "",
  descriptif: "",
  actif: true,
  args: {},
};

export default function DeviceProgramsEdit() {
  const { deviceId, programId } = useParams<{
    deviceId: string;
    programId?: string;
  }>();

  // Get the device and its group
  const device = useDevicesStore((s) =>
    s.devices.find((d) => d.id === deviceId),
  );
  const group = useDeviceGroupsStore((s) =>
    s.groups.find((g) => g.id === device?.deviceGroup),
  );

  const [editProgram, setEditProgram] = useState<Program>(defaultProgram);

  /* --------------------------------------------------------------
   * Load the program that matches `programId` from the group.
   * If no `programId` is provided or the program cannot be found,
   * initialise a brand‑new empty program object.
   * -------------------------------------------------------------- */
  useEffect(() => {
    if (!group) {
      setEditProgram(defaultProgram);
      return;
    }

    // If editing an existing program, load it
    if (programId) {
      const prog = Object.values(group.programmes ?? {}).find(
        (p: any) => p.programme_id === programId,
      );

      if (prog) {
        setEditProgram({
          programme_id: prog.programme_id,
          class: prog.class,
          descriptif: prog.descriptif ?? "",
          actif: prog.actif,
          args: prog.args ?? {},
        });
      }
    } else {
      // Only set a new default if we don't already have one
      if (!editProgram || editProgram.programme_id === "") {
        setEditProgram({
          programme_id: crypto.randomUUID(),
          class: "",
          descriptif: "",
          actif: true,
          args: {},
        });
      }
    }
  }, [group, programId, editProgram]);

  /* --------------------------------------------------------------
   * Generic change handler for description, class and active fields
   * -------------------------------------------------------------- */
  const handleChange =
    (field: keyof Program) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      if (!editProgram) return;
      const value =
        field === "actif"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setEditProgram((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
    };

  /* --------------------------------------------------------------
   * Persist the edited program back to the store.
   * -------------------------------------------------------------- */
  const handleSave = () => {
    if (!editProgram || !group) return;

    const updatedProgrammes = {
      ...(group.programmes ?? {}),
      [editProgram.programme_id]: editProgram,
    };

    useDeviceGroupsStore.getState().mergeGroup({
      id: group.id,
      programmes: updatedProgrammes,
    });

    // Return to the list view
    window.history.back();
  };

  /* --------------------------------------------------------------
   * Cancel – simply navigate back to the list page
   * -------------------------------------------------------------- */
  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">
        {programId
          ? `Edit Program for ${group?.name} / ${device?.name}`
          : `Add Program for ${group?.name} / ${device?.name}`}
      </h2>

      <div className="space-y-2">
        <label>
          Description:
          <input
            type="text"
            value={editProgram?.descriptif ?? ""}
            onChange={handleChange("descriptif")}
            className="w-full border rounded p-1"
          />
        </label>

        <label>
          Class:
          <select
            value={editProgram?.class ?? ""}
            onChange={handleChange("class")}
            className="w-full border rounded p-1"
          >
            <option value="">Select class</option>
            {PROGRAM_CLASS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center">
          Active:
          <input
            type="checkbox"
            checked={editProgram?.actif ?? true}
            onChange={handleChange("actif")}
            className="ml-2"
          />
        </label>

        <DeviceProgramArgsEditor
          program={editProgram}
          onChange={(newArgs) => {
            if (editProgram) {
              setEditProgram({ ...editProgram, args: newArgs });
            }
          }}
        />

        <div className="flex space-x-2 mt-2">
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
