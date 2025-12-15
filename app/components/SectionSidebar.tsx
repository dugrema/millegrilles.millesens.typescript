import { useSidebar } from "./SidebarContext";
import type { ReactNode } from "react";

/**
 * A responsive sidebar that behaves the same way as the global mobile sidebar
 * but is used for section‑specific navigation (Devices, Settings, …).
 *
 * Usage:
 * ```tsx
 * <SectionSidebar>
 *   <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
 *   <nav className="space-y-2">
 *     <a href="#" className="block py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Home</a>
 *     …
 *   </nav>
 * </SectionSidebar>
 * ```
 *
 * The component reads the `isOpen` state from `SidebarContext`. On screens
 * smaller than `md` it is hidden by default and slides in when `isOpen`
 * becomes `true`. On larger screens it is always visible.
 */
export const SectionSidebar = ({ children }: { children: ReactNode }) => {
  const { isOpen, close } = useSidebar();

  return (
    <aside
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
          `}
      aria-label="Section navigation"
    >
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        MilleSens
      </h1>
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
      {children}
    </aside>
  );
};
