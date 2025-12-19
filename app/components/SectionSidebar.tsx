import { useSidebar } from "./SidebarContext";
import { useRef, useEffect } from "react";
import type { ReactNode } from "react";

export const SectionSidebar = ({ children }: { children: ReactNode }) => {
  const { isOpen, close } = useSidebar();
  const sidebarRef = useRef<HTMLElement | null>(null);
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
      aria-label="Section navigation"
    >
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          MilleSens
        </h1>
        <a href="/" className="flex items-center p-1">
          <img
            src="/millesens/icons/logout-svgrepo-com.svg"
            alt="Logout"
            className="h-6 w-6"
          />
        </a>
      </div>
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Menu
        </span>
        <button
          onClick={close}
          className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto" onClick={close}>
        {children}
      </div>
    </aside>
  );
};
export default SectionSidebar;
