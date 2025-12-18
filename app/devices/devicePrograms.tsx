import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "../state/devicesStore";
import { Button } from "~/components/Button";
import { ConfirmButton } from "~/components/ConfirmButton";
import { useParams } from "react-router";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";

interface Program {
  programme_id: string;
  class: string;
  descriptif: string;
  actif: boolean;
  args: any;
}

/**
 * DevicePrograms – list view only.
 * Renders an "Add Program" link and a clickable list of programs.
 * Clicking a program navigates to the edit page for that program.
 * A delete button is also provided to remove the program from the group.
 */
export default function DevicePrograms() {
  const { deviceId } = useParams<{ deviceId: string }>();

  const workers = useMilleGrillesWorkers();

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
    setPrograms(
      allPrograms.sort((a, b) =>
        (a.descriptif ?? "").localeCompare(b.descriptif ?? ""),
      ),
    );
  }, [group, deviceId, device]);

  const deleteProgram = (programId: string) => {
    if (!group) return;
    const updatedProgrammes = group.programmes ? { ...group.programmes } : {};
    delete updatedProgrammes[programId];
    const updatedGroup = { ...group, programmes: updatedProgrammes };
    if (!updatedGroup) throw new Error("Unable to load group to edit");
    updateGroup(updatedGroup);

    useDeviceGroupsStore.getState().mergeGroup({
      id: group.id,
      programmes: updatedProgrammes,
    });

    const updateCommand = { programmes: updatedGroup.programmes };
    workers?.connection
      ?.updateDeviceConfiguration(updatedGroup.id, updateCommand)
      .then((response) => {
        if (!response.persiste)
          throw new Error(`Error updating device: ${response.err}`);
      })
      .catch((err) =>
        console.error("handleSave Error updating device group", err),
      );

    setPrograms((prev) => prev.filter((p) => p.programme_id !== programId));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Programs for device{" "}
        <strong>
          {group?.name ?? group?.id} / {device?.name}
        </strong>
      </h1>

      <div className="space-x-2">
        <NavLink to={`/devices/device/${deviceId}`}>
          <Button variant="secondary" className="mb-4">
            Back
          </Button>
        </NavLink>
        {/* Add Program button – navigates to the dedicated add page */}
        <Link to={`/devices/programs/${deviceId}/add`}>
          <Button variant="primary" className="mb-4">
            Add Program
          </Button>
        </Link>
      </div>

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
              <ConfirmButton
                variant="outline"
                confirmLabel="Confirm delete"
                className="absolute top-2 right-2"
                onClick={() => deleteProgram(p.programme_id)}
              >
                Delete
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
