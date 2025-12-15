# Project Overview – MilleSens

This repository contains a progressive web application (PWA) that mimics a Home Assistant‑style interface for viewing and controlling smart devices.

## Technology Stack
- **React 19** with Vite and TypeScript
- **React Router v7.10** (declarative routing)
- **Tailwind 4** (with optional Sass/SCSS)
- **Zustand 5** + **IDB 8** for state management and persistence
- **Luxon 3.7** for date handling

## Architecture
- **`app/`** – source code (instead of `src/`)
- **`public/`** – static assets (`index.html`, `styles.css`, `favicon.ico`)
- Routing is defined in `app/root.tsx` and `app/routes.ts`
- A common header/footer is rendered in `app/layout.tsx`; each route is an `<Outlet />`
- Section‑specific sidebars are implemented via `app/components/SectionSidebar.tsx` (Devices, Settings)
- Zustand stores live in `app/state`; the IDB persistence wrapper is in `app/utils/idbStorage.ts`
- All stores are persisted in IndexedDB under the database name **`millesensStore`**.

## File Structure (high‑level)
```
react-view5/
├─ .dockerignore
├─ .gitignore
├─ AGENTS.md
├─ Dockerfile
├─ README.md
├─ luxon.d.ts
├─ memory.md            ← this file
├─ package-lock.json
├─ package.json
├─ react-router.config.ts
├─ tasks.md
├─ tsconfig.json
├─ vite.config.ts
├─ app/
│  ├─ app.css
│  ├─ layout.tsx
│  ├─ root.tsx
│  ├─ routes.ts
│  ├─ devices/
│  │  ├─ deviceGroupPage.tsx
│  │  ├─ devicePage.tsx
│  │  ├─ devicesFilterGroup.tsx
│  │  ├─ devicesFilterHidden.tsx
│  │  ├─ index.tsx
│  │  ├─ layout.tsx
│  │  └─ sidebar.tsx
│  ├─ settings/
│  │  ├─ dev.tsx
│  │  ├─ index.tsx
│  │  ├─ layout.tsx
│  │  └─ sidebar.tsx
│  ├─ icons/
│  │  ├─ bell-alert.svg
│  │  ├─ hamburger.svg
│  │  └─ wifi.svg
│  ├─ components/
│  │  ├─ Badge.tsx
│  │  ├─ Button.tsx
│  │  ├─ DeviceCard.tsx
│  │  ├─ SectionSidebar.tsx
│  │  ├─ SidebarContext.tsx
│  │  └─ TimeContext.tsx
│  ├─ state/
│  │  ├─ configurationStore.ts
│  │  ├─ deviceGroupsStore.ts
│  │  ├─ deviceValueStore.ts
│  │  └─ devicesStore.ts
│  └─ utils/
│     └─ idbStorage.ts
├─ public/
│  ├─ index.html
│  ├─ favicon.ico
│  └─ styles.css
└─ node_modules/
```

### Notes
- The **`app/layout.tsx`** file renders the global header/footer and manages the sidebar context.
- **`app/root.tsx`** provides the top‑level provider and error handling.
- The **`SectionSidebar`** component is used by Devices, and Settings routes.
- **`DeviceCard`** is shown on the Devices page.
- State is kept in `app/state`; persistence is handled by `app/utils/idbStorage.ts`.
- The project does **not** contain a `welcome/` directory; that entry was removed from the file list.
- The `public/styles.css` file holds global styles that complement Tailwind utilities.

Feel free to update this file and `tasks.md` as the project evolves.
