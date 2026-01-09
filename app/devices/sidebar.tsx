import { NavLink } from "react-router";
import { Badge } from "~/components/Badge";
import { SectionSidebar } from "~/components/SectionSidebar";
import { useDevicesStore } from "~/state/devicesStore";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import { useTranslation } from "react-i18next";

export default function DevicesSidebar() {
  const { t } = useTranslation();
  const devices = useDevicesStore((state) => state.devices);

  // Collect unique group names from array group filters
  const groupSet = new Set<string>();
  devices.forEach((d) => {
    d.group?.forEach((g) => {
      const trimmed = g?.trim();
      if (trimmed) {
        groupSet.add(trimmed);
      }
    });
  });

  const groupList = Array.from(groupSet).sort((a, b) => a.localeCompare(b));
  const pendingCount = useDeviceGroupsStore(
    (state) => state.groups.filter((g) => g.registrationPending).length,
  );

  return (
    <SectionSidebar>
      <h2 className="text-xl font-semibold mb-4">{t("sidebar.title")}</h2>

      <nav className="space-y-2">
        <NavLink
          to="/devices/all"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("sidebar.all")}
        </NavLink>

        <NavLink
          to="devices/hidden"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("sidebar.hidden")}
        </NavLink>

        <NavLink
          to="devices/programs"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("sidebar.programs")}
        </NavLink>

        <NavLink
          to="devices/notices"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("sidebar.notices")} <Badge count={pendingCount} />
        </NavLink>
      </nav>

      <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

      <h3 className="text-lg font-semibold mb-2">{t("sidebar.filters")}</h3>

      <nav className="space-y-2">
        <NavLink
          to="devices/group"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("sidebar.unassigned")}
        </NavLink>

        {groupList.map((group) => (
          <NavLink
            key={group}
            to={`devices/group/${group}`}
            className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {group}
          </NavLink>
        ))}
      </nav>
    </SectionSidebar>
  );
}
