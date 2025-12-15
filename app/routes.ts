import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./devices/layout.tsx", [
    index("./devices/index.tsx"),
    ...prefix("devices", [
      route("hidden", "./devices/devicesFilterHidden.tsx"),
      // New route to filter devices by group. The group parameter is optional
      // to handle the "unassigned" group case.
      route("group/:group?", "./devices/devicesFilterGroup.tsx"),
      route("device/:deviceId", "./devices/devicePage.tsx"),
      route("deviceGroup/:groupId", "./devices/deviceGroupPage.tsx"),
      route("chart/:deviceId", "./devices/deviceChart.tsx"),
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
