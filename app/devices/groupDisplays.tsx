import { useParams, NavLink } from "react-router";
import { Button } from "~/components/Button";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { useTranslation } from "react-i18next";

/* Component that displays list of configured displays for a device group. */

export default function GroupDisplays() {
  const { t } = useTranslation();
  const { groupId } = useParams<{ groupId: string }>();

  const group = useDeviceGroupsStore((state) =>
    state.groups.find((g) => g.id === groupId),
  );

  if (!group) {
    return (
      <div className="p-4">
        <p className="text-red-600">{t("groupDisplays.notFound")}</p>
      </div>
    );
  }

  // The `displays` field is optional in the group structure.
  const displays: Array<{
    name: string;
    format: string;
    width: number;
    height: number;
  }> = (group as DeviceGroup & { displays?: any[] }).displays ?? [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {t("groupDisplays.title", { groupName: group.name ?? group.id })}
      </h1>

      <div className="mb-2 space-x-2">
        <Button variant="secondary">
          <NavLink to={`/devices/deviceGroup/${group.id}`}>
            {t("groupDisplays.groupButton")}
          </NavLink>
        </Button>
      </div>

      {displays.length === 0 ? (
        <p>{t("groupDisplays.noDisplays")}</p>
      ) : (
        <ul className="space-y-4">
          {displays.map((d) => (
            <NavLink key={d.name} to={`/devices/displays/${groupId}/${d.name}`}>
              <li className="border rounded p-4 shadow-sm hover:shadow-md transition">
                <h2 className="text-lg font-medium mb-2">{d.name}</h2>
                <p className="mb-1">
                  <span className="font-semibold">
                    {t("groupDisplays.format")}
                  </span>{" "}
                  {d.format}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">
                    {t("groupDisplays.size")}
                  </span>{" "}
                  {d.width}×{d.height}
                </p>
                <p className="text-sm text-gray-600">
                  {t("groupDisplays.description", { name: d.name })}
                </p>
              </li>
            </NavLink>
          ))}
        </ul>
      )}
    </div>
  );
}
