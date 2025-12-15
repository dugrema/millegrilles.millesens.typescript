import { Outlet } from "react-router";
import SettingsSidebar from "./sidebar";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings" },
    { name: "description", content: "Settings page" },
  ];
}

export default function SettingsLayout() {
  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <SettingsSidebar />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
