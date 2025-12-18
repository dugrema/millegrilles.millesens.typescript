import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "../state/devicesStore";
import { Button } from "~/components/Button";
import { useParams } from "react-router";

interface Program {
  programme_id: string;
  class: string;
  descriptif: string;
  actif: boolean;
  args: any;
}

/* Program class options – kept for potential future UI use */
const PROGRAM_CLASS_OPTIONS = [
  {
    value: "programmes.horaire.HoraireHebdomadaire",
    label: "Horaire Hebdomadaire",
  },
  { value: "programmes.environnement.Humidificateur", label: "Humidificateur" },
  { value: "programmes.environnement.Chauffage", label: "Chauffage" },
  { value: "programmes.environnement.Climatisation", label: "Climatisation" },
] as const;

/**
 * DevicePrograms – list view only.
 * Renders an "Add Program" link and a clickable list of programs.
 * Clicking a program navigates to the edit page for that program.
 * A delete button is also provided to remove the program from the group.
 */
export default function DevicePrograms() {
  const { deviceId } = useParams<{ deviceId: string }>();

  const device = useDevicesStore((state) =>
    state.devices.find((d) => d.id === deviceId),
  );
  const group = useDeviceGroupsStore((state) =>
    state.groups.find((g) => g.id === device?.deviceGroup),
  );
  const updateGroup = useDeviceGroupsStore((state) => state.updateGroup);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    console.debug("Loading device id %O programs: %O", deviceId, group);
    if (!group || !device) {
      setPrograms([]);
      return;
    }
    const allPrograms: Program[] = [];
    if (group.programmes) {
      Object.values(group.programmes).forEach((p: any) => {
        const targetSwitches = p.args?.switches ?? [];
        if (
          Array.isArray(targetSwitches) &&
          targetSwitches.includes(device.internalId)
        ) {
          allPrograms.push({
            programme_id: p.programme_id,
            class: p.class,
            descriptif: p.descriptif ?? "",
            actif: p.actif,
            args: p.args ?? {},
          });
        }
      });
    }
    setPrograms(allPrograms);
  }, [group, deviceId, device]);

  const deleteProgram = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!group) return;
    const updatedProgrammes = group.programmes ? { ...group.programmes } : {};
    delete updatedProgrammes[programId];
    const updatedGroup = { ...group, programmes: updatedProgrammes };
    updateGroup(updatedGroup);
    setPrograms((prev) => prev.filter((p) => p.programme_id !== programId));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Device Programs</h1>

      {/* Add Program button – navigates to the dedicated add page */}
      <Link to={`/devices/programs/${deviceId}/add`}>
        <Button variant="primary" className="mb-4">
          Add Program
        </Button>
      </Link>

      {programs.length === 0 ? (
        <p>No programs defined.</p>
      ) : (
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={p.programme_id}
              className="p-2 border rounded cursor-pointer relative"
            >
              {/* Linking each program to its edit page */}
              <Link
                to={`/devices/programs/${deviceId}/${p.programme_id}`}
                className="block w-full hover:bg-blue-100"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {p.descriptif || "Untitled"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Class:</span> {p.class}
                  <br />
                  <span className="font-medium">Active:</span>{" "}
                  {p.actif ? "Yes" : "No"}
                </div>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => deleteProgram(p.programme_id, e)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
