import { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import { useDevicesStore } from "../state/devicesStore";
import { Button } from "~/components/Button";
import { ConfirmButton } from "~/components/ConfirmButton";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        // Include both the new and legacy switch keys
        const targetSwitches =
          p.args?.switches ?? p.args?.switches_humidificateurs ?? [];
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
        {t("devicePrograms.heading")}{" "}
        <strong>
          {group?.name ?? group?.id} / {device?.name}
        </strong>
      </h1>

      <div className="space-x-2">
        <NavLink to={`/devices/device/${deviceId}`}>
          <Button variant="secondary" className="mb-4">
            {t("devicePrograms.back")}
          </Button>
        </NavLink>
        {/* Add Program button – navigates to the dedicated add page */}
        <Link to={`/devices/programs/${deviceId}/add`}>
          <Button variant="primary" className="mb-4">
            {t("devicePrograms.addProgram")}
          </Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <p>{t("devicePrograms.noPrograms")}</p>
      ) : (
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={p.programme_id}
              className="p-2 border rounded cursor-pointer relative dark:border-gray-700"
            >
              {/* Linking each program to its edit page */}
              <Link
                to={`/devices/programs/${deviceId}/${p.programme_id}`}
                className="block w-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {p.descriptif || t("devicePrograms.untitled")}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    {t("devicePrograms.classLabel")}:
                  </span>{" "}
                  {p.class}
                  <br />
                  <span className="font-medium">
                    {t("devicePrograms.activeLabel")}:
                  </span>{" "}
                  {p.actif ? t("devicePrograms.yes") : t("devicePrograms.no")}
                </div>
              </Link>
              <ConfirmButton
                variant="outline"
                confirmLabel={t("devicePrograms.confirmDelete")}
                className="absolute top-2 right-2"
                onClick={() => deleteProgram(p.programme_id)}
              >
                {t("devicePrograms.delete")}
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
