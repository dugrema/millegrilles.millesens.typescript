import { NavLink } from "react-router";
import { Badge } from "~/components/Badge";
import { SectionSidebar } from "~/components/SectionSidebar";
import { useDevicesStore } from "~/state/devicesStore";

export default function DevicesSidebar() {
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

  return (
    <SectionSidebar>
      <h2 className="text-xl font-semibold mb-4">Devices</h2>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          All Devices
        </NavLink>

        <NavLink
          to="devices/hidden"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Hidden devices
        </NavLink>

        <NavLink
          to="#"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Notices <Badge count={2} />
        </NavLink>
      </nav>

      <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

      <h3 className="text-lg font-semibold mb-2">Filters</h3>

      <nav className="space-y-2">
        <NavLink
          to="devices/group"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Unassigned
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
