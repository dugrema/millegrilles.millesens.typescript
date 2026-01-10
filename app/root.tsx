/// <reference path="../vite-env.d.ts" />
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
} from "react-router";
import i18n from "./i18n";
import { I18nextProvider, useTranslation } from "react-i18next";

import type { Route } from "./+types/root";
import { SidebarProvider, useSidebar } from "./components/SidebarContext";
import { MilleGrillesWorkerProvider } from "./workers/MilleGrillesWorkerContext";
import "./app.css";
import { TimeProvider } from "./components/TimeContext";
import { useConnectionStore } from "./state/connectionStore";
import { useSyncWhenReady } from "./hooks/useSyncWhenReady";

/* Hamburger icon (Heroicons) */
const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
    />
  </svg>
);

export const links: Route.LinksFunction = () => [
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
  // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // {
  //   rel: "stylesheet",
  //   href:
  //     "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  // },
];

/**
 * Root layout that provides the HTML structure, theme, and global
 * sidebar context. It also ensures the footer sticks to the bottom
 * when the content is short and follows the page when content is
 * longer.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <SidebarProvider>
          <div className="flex flex-col flex-1">
            <LayoutBody>{children}</LayoutBody>
          </div>
        </SidebarProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Layout component that renders the common header/footer and handles
 * the responsive sidebar.
 */
function LayoutBody({ children }: { children: React.ReactNode }) {
  const { toggle } = useSidebar();
  const ready = useConnectionStore((state) => state.ready);
  const { t } = useTranslation();

  return (
    <>
      <header
        className={`py-1 md:py-4 ${
          ready
            ? "bg-gray-200 dark:bg-gray-800"
            : "bg-pink-500 dark:bg-red-500 opacity-60"
        } flex items-center justify-between`}
      >
        {/* Desktop navigation */}
        <nav className="mx-auto space-x-4 sm:space-x-8">
          {/* Mobile toggle button */}
          <button
            onClick={toggle}
            className="lg:hidden md:p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
            aria-label="Open sidebar"
          >
            <HamburgerIcon />
          </button>

          <NavLink
            to="/"
            className={({ isActive }) =>
              "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 pl-2 pr-2" +
              (isActive ? " font-semibold underline" : "")
            }
          >
            {t("nav.devices")}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 pl-2 pr-2" +
              (isActive ? " font-semibold underline" : "")
            }
          >
            {t("nav.settings")}
          </NavLink>
        </nav>
        <a
          href="/"
          className="items-center p-1 hidden lg:inline-flex bg-gray-800 rounded-full dark:bg-transparent"
        >
          <img
            src="/millesens/icons/logout-svgrepo-com.svg"
            alt={t("header.logout")}
            className="h-6 w-6"
          />
        </a>
      </header>

      {children}

      <footer className="py-4 bg-gray-200 dark:bg-gray-800 text-center">
        {t("footer.text")}{" "}
        <span className="text-sm">
          {t("footer.version", { version: __APP_VERSION__ })}
        </span>
      </footer>
    </>
  );
}

/**
 * Root component that ensures the sidebar context is available
 * throughout the application.
 */
export default function App() {
  // Service worker registration for production
  // useEffect(() => {
  //   if ("serviceWorker" in navigator && !import.meta.env.DEV) {
  //     navigator.serviceWorker
  //       .register("/millesens/sw.js")
  //       .then((registration) => {
  //         console.log("Service worker registered:", registration);
  //       })
  //       .catch((error) => {
  //         console.error("Service worker registration failed:", error);
  //       });
  //   }
  // }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <TimeProvider>
        <MilleGrillesWorkerProvider>
          <SyncLayer>
            <Outlet />
          </SyncLayer>
        </MilleGrillesWorkerProvider>
      </TimeProvider>
    </I18nextProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

function SyncLayer({ children }: { children: React.ReactNode }) {
  useSyncWhenReady(); // triggers the sync once the connection is ready
  return children;
}
