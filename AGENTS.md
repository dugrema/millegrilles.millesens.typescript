# MilleSens application

This is the development repository for the MilleSens home-assistant style application for the MilleGrilles system (millegrilles.com).

## Development environment
+ Basic technology stack: React 19, vite, React Router 7.10 declarative, tailwind 4, sass/scss.
+ Use typescript whenever possible.
+ The API to the MilleGrilles back-end is used through the web service loaded from `app/workers/connection.worker.ts`.

## Project description

This project is a progressive web application (PWA) that mimics a Home Assistant style interface for viewing and controlling smart devices. The layout includes a static top menu with the options **Devices** and **Settings**, as well as a static footer that appears on all routed pages. All routing is handled by React Router v7, and the UI is styled with Tailwind 4 and optional Sass/SCSS. The goal is to provide a responsive, installable experience that works offline and offers device discovery and control features typical of a home automation dashboard.

**Sidebar Layout**  
Each section (Devices, Settings) will feature a left sidebar whose options depend on the active section. The right (main) part of the screen will host the routed pages that change based on navigation within that section.

## Tool usage
+ When using tool **edit_file** to update an existing file, the tool will likely fail to apply the changes. When the tool fails to apply changes on the first try, switch to the **overwrite** operation.

> **Important:** All future modifications to the project should be performed with the `overwrite` mode of the `edit_file` tool.  The `edit` mode is unreliable for inserting new lines or making non‑trivial changes, so to avoid accidental omissions, always supply the complete file content when editing.

## Development

- **Source code**: Use `app/` instead of `src/`.
- **State Management** – notes on context, Redux, Zustand, or other patterns.
- **Routing** – recommended route structure for React Router v7.10, use file app/route.ts in declarative mode.
- **Styling** – guidance on using Tailwind 4, Sass/SCSS, and placing global styles in `public/styles.css`. The application supports a dark mode with the `dark:` selector.
- **Libraries**: 
  - The MilleGrilles connection API and utilities are described in file millegrilles.api.md.
  - luxon 3.7 for dates
  - zustand 5.0 and idb 8.0 for state management, using state/ for zustand store files and utils/idbStorage.ts.
- **Components**: Whenever applicable, use `app/components` for Buttons, Sidebars, etc.
- **Formats**: 
  - Date format is: YYYY-MM-DD
  - Time format is: HH:mm:ss  (24h time)
  - Use timezone from the configurationStore.

## Memory

Use files memory.md and tasks.md under the project directory to persist useful information. Ensure that the high level file listing and the tasks are up to date.
