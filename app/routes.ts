import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./devices/layout.tsx", [
    index("./redirect.tsx"),
    ...prefix("devices", [
      route("all", "./devices/index.tsx"),
      route("hidden", "./devices/devicesFilterHidden.tsx"),
      route("group/:group?", "./devices/devicesFilterGroup.tsx"),
      route("device/:deviceId", "./devices/devicePage.tsx"),
      route("deviceGroup/:groupId", "./devices/deviceGroupPage.tsx"),
      route("chart/:deviceId", "./devices/deviceChart.tsx"),
      route("programs/:groupId", "./devices/devicePrograms.tsx"),
      route("programs/:groupId/:programId", "./devices/deviceProgramsEdit.tsx"),
    ]),
  ]),
  ...prefix("settings", [
    layout("./settings/layout.tsx", [
      index("./settings/index.tsx"),
      route("bluetooth", "./settings/bluetooth.tsx"),
      route("dev", "./settings/dev.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
