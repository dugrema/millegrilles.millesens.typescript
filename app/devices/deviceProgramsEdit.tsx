import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Button } from "~/components/Button";
import { DeviceProgramArgsEditor } from "./deviceProgramArgsEditor";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";

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

export default function DeviceProgramsEdit() {
  const { groupId, programId } = useParams<{
    groupId: string;
    programId?: string;
  }>();

  // Find the group that contains the program with the given ID
  const groupWithProgram = useDeviceGroupsStore((s) =>
    s.groups.find((g) => g.id === groupId),
  );
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  /* --------------------------------------------------------------
   * Load the program that matches `programId` from the store.
   * If no `programId` is provided or the program cannot be found,
   * initialise a brand‑new empty program object.
   * -------------------------------------------------------------- */
  useEffect(() => {
    if (!groupWithProgram) {
      setEditProgram(null);
      return;
    }

    // No programId → creating a new program
    if (!programId) {
      setEditProgram({
        programme_id: crypto.randomUUID(),
        class: "",
        descriptif: "",
        actif: true,
        args: {},
      });
      return;
    }

    if (!groupWithProgram) {
      // Program not found → treat as a new program
      setEditProgram({
        programme_id: crypto.randomUUID(),
        class: "",
        descriptif: "",
        actif: true,
        args: {},
      });
      return;
    }

    // Extract the matching program object
    const prog = Object.values(groupWithProgram.programmes).find(
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
  }, [groupWithProgram, programId]);

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
    if (!editProgram) return;

    if (!groupWithProgram || !groupWithProgram.programmes) {
      // Should never happen – fallback navigation
      window.history.back();
      return;
    }

    // Build the updated programmes map
    const updatedProgrammes = {
      ...groupWithProgram.programmes,
      [editProgram.programme_id]: editProgram,
    };

    // Persist using the store's mergeGroup action
    useDeviceGroupsStore.getState().mergeGroup({
      id: groupWithProgram.id,
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
        {editProgram ? "Edit Program" : "Add Program"}
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
          program={editProgram ?? { args: {} }}
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
