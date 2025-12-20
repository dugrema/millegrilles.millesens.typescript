import { NavLink } from "react-router";
import { SectionSidebar } from "~/components/SectionSidebar";

export default function SettingsSidebar() {
  return (
    <SectionSidebar>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <nav className="space-y-2">
        <NavLink
          to="/settings"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          General
        </NavLink>
        <NavLink
          to="/settings/bluetooth"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Bluetooth
        </NavLink>
        <NavLink
          to="/settings/dev"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          DEV
        </NavLink>
      </nav>
    </SectionSidebar>
  );
}
