import { useSidebar } from "./SidebarContext";
import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

export const SectionSidebar = ({ children }: { children: ReactNode }) => {
  const { isOpen, close } = useSidebar();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [close]);

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed inset-y-0 left-0
        w-64
        bg-gray-100 dark:bg-gray-800
        p-4
        transform
        transition-transform
        duration-200 ease-out
        ${isOpen ? "" : "-translate-x-full"} lg:translate-x-0
        lg:static lg:shadow-none
        z-50
        flex flex-col h-full
      `}
      aria-label={t("sectionSidebar.navigation")}
    >
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {t("sectionSidebar.title")}
        </h1>
        <a
          href="/"
          className="flex items-center p-1 bg-gray-800 rounded-full dark:bg-transparent"
        >
          <img
            src="/millesens/icons/logout-svgrepo-com.svg"
            alt={t("sectionSidebar.logout")}
            className="h-6 w-6"
          />
        </a>
      </div>
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t("sectionSidebar.menu")}
        </span>
        <Button
          onClick={close}
          className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
          aria-label={t("sectionSidebar.close")}
        >
          ×
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto" onClick={close}>
        {children}
      </div>
    </aside>
  );
};
export default SectionSidebar;
