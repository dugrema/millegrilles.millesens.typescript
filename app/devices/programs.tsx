// File: millegrilles.millesens.typescript/app/devices/programs.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "../state/devicesStore";
import { Button } from "~/components/Button";
import { ConfirmButton } from "~/components/ConfirmButton";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";

interface Program {
  programme_id: string;
  class: string;
  descriptif: string;
  actif: boolean;
  args: any;
}

interface ProgramWithGroup extends Program {
  groupId: string;
  groupName?: string;
  deviceId?: string;
}

export default function Programs() {
  const workers = useMilleGrillesWorkers();

  const groups = useDeviceGroupsStore((state) => state.groups);
  const updateGroup = useDeviceGroupsStore((state) => state.updateGroup);
  const devices = useDevicesStore((state) => state.devices);

  const [programs, setPrograms] = useState<ProgramWithGroup[]>([]);

  useEffect(() => {
    const all: ProgramWithGroup[] = [];
    groups.forEach((group) => {
      if (!group.programmes) return;
      Object.values(group.programmes).forEach((p: any) => {
        const targetSwitches =
          p.args?.switches ?? p.args?.switches_humidificateurs ?? [];
        let deviceId: string | undefined;
        if (Array.isArray(targetSwitches)) {
          for (const s of targetSwitches) {
            const dev = devices.find(
              (d) => d.internalId === s && d.deviceGroup === group.id,
            );
            if (dev) {
              deviceId = dev.id;
              break;
            }
          }
        }
        all.push({
          programme_id: p.programme_id,
          class: p.class,
          descriptif: p.descriptif ?? "",
          actif: p.actif,
          args: p.args ?? {},
          groupId: group.id,
          groupName: group.name,
          deviceId,
        });
      });
    });
    setPrograms(
      all.sort((a, b) =>
        (a.descriptif ?? "").localeCompare(b.descriptif ?? ""),
      ),
    );
  }, [groups, devices]);

  const deleteProgram = (groupId: string, programId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const updatedProgrammes = group.programmes ? { ...group.programmes } : {};
    delete updatedProgrammes[programId];
    const updatedGroup = { ...group, programmes: updatedProgrammes };
    updateGroup(updatedGroup);

    useDeviceGroupsStore.getState().mergeGroup({
      id: group.id,
      programmes: updatedProgrammes,
    });

    const updateCommand = { programmes: updatedGroup.programmes };
    workers?.connection
      ?.updateDeviceConfiguration(group.id, updateCommand)
      .then((response) => {
        if (!response.persiste)
          throw new Error(`Error updating group: ${response.err}`);
      })
      .catch((err) => console.error("Error updating group configuration", err));

    setPrograms((prev) =>
      prev.filter((p) => p.programme_id !== programId || p.groupId !== groupId),
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Programs</h1>

      <p className="pb-2">
        <span className="font-bold">Note:</span> to add a new program, go to a
        switch device and click the Programs button.
      </p>

      {programs.length === 0 ? (
        <p>No programs defined.</p>
      ) : (
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={`${p.groupId}-${p.programme_id}`}
              className="p-2 border rounded cursor-pointer relative"
            >
              {p.deviceId ? (
                <Link
                  to={`/devices/programs/${p.deviceId}/${p.programme_id}`}
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
                    <br />
                    <span className="font-medium">Group:</span> {p.groupName}
                  </div>
                </Link>
              ) : (
                <div className="block w-full">
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
                    <br />
                    <span className="font-medium">Group:</span> {p.groupName}
                  </div>
                </div>
              )}
              <ConfirmButton
                variant="outline"
                confirmLabel="Confirm delete"
                className="absolute top-2 right-2"
                onClick={() => deleteProgram(p.groupId, p.programme_id)}
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
