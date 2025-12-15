import { Outlet } from "react-router";
import type { Route } from "./+types/home";
import DevicesSidebar from "./sidebar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Devices" },
    { name: "description", content: "Devices page" },
  ];
}

export default function SettingsLayout() {
  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <DevicesSidebar />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
