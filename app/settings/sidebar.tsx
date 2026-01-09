import { NavLink } from "react-router";
import { SectionSidebar } from "~/components/SectionSidebar";
import { useTranslation } from "react-i18next";

export default function SettingsSidebar() {
  const { t } = useTranslation();

  return (
    <SectionSidebar>
      <h2 className="text-xl font-semibold mb-4">{t("settingsPage.title")}</h2>
      <nav className="space-y-2">
        <NavLink
          to="/settings"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("settingsSidebar.General")}
        </NavLink>
        <NavLink
          to="/settings/bluetooth"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("settingsSidebar.Bluetooth")}
        </NavLink>
        <NavLink
          to="/settings/dev"
          className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {t("settingsSidebar.DEV")}
        </NavLink>
      </nav>
    </SectionSidebar>
  );
}
