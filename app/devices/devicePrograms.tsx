import { useState, ChangeEvent } from "react";
import { Button } from "~/components/Button";
import { DeviceProgramArgsEditor } from "./deviceProgramArgsEditor";

interface Program {
  programme_id: string;
  class: string;
  descriptif: string;
  actif: boolean;
  args: any;
}

const PROGRAM_CLASS_OPTIONS = [
  {
    value: "programmes.horaire.HoraireHebdomadaire",
    label: "Horaire Hebdomadaire",
  },
  { value: "programmes.environnement.Humidificateur", label: "Humidificateur" },
  { value: "programmes.environnement.Chauffage", label: "Chauffage" },
  { value: "programmes.environnement.Climatisation", label: "Climatisation" },
];

export default function DevicePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  const resetEdit = () => {
    setSelectedId(null);
    setEditProgram(null);
  };

  const handleAdd = () => {
    const newProg: Program = {
      programme_id: crypto.randomUUID(),
      class: "",
      descriptif: "",
      actif: true,
      args: {},
    };
    setPrograms((prev) => [...prev, newProg]);
    setSelectedId(newProg.programme_id);
    setEditProgram(newProg);
  };

  const handleDelete = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.programme_id !== id));
    if (selectedId === id) resetEdit();
  };

  const handleChange =
    (field: keyof Program) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      if (!editProgram) return;
      const value =
        field === "actif"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setEditProgram({ ...editProgram, [field]: value });
    };

  const handleSave = () => {
    if (!editProgram) return;
    setPrograms((prev) =>
      prev.map((p) =>
        p.programme_id === editProgram.programme_id ? editProgram : p,
      ),
    );
    resetEdit();
  };

  const handleCancel = () => {
    if (
      editProgram &&
      !programs.some((p) => p.programme_id === editProgram.programme_id)
    ) {
      handleDelete(editProgram.programme_id);
    }
    resetEdit();
  };

  const renderEditor = () => {
    if (!editProgram) return null;
    return (
      <div className="p-4 border rounded mt-4">
        <h2 className="text-xl font-semibold mb-2">Edit Program</h2>
        <div className="space-y-2">
          <label>
            Description:
            <input
              type="text"
              value={editProgram.descriptif}
              onChange={handleChange("descriptif")}
              className="w-full border rounded p-1"
            />
          </label>
          <label>
            Class:
            <select
              value={editProgram.class}
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
              checked={editProgram.actif}
              onChange={handleChange("actif")}
              className="ml-2"
            />
          </label>
          <DeviceProgramArgsEditor
            program={editProgram}
            onChange={(newArgs) =>
              setEditProgram({ ...editProgram, args: newArgs })
            }
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
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Device Programs</h1>
      <Button variant="primary" onClick={handleAdd} className="mb-4">
        Add Program
      </Button>

      {programs.length === 0 ? (
        <p>No programs defined.</p>
      ) : (
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={p.programme_id}
              className={`p-2 border rounded cursor-pointer ${
                selectedId === p.programme_id ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                setSelectedId(p.programme_id);
                setEditProgram(p);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {p.descriptif || "Untitled"}
                </span>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.programme_id);
                  }}
                >
                  Delete
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Class:</span> {p.class}
                <br />
                <span className="font-medium">Active:</span>{" "}
                {p.actif ? "Yes" : "No"}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedId && renderEditor()}
    </div>
  );
}
