import { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useParams } from "react-router";
import { useDevicesStore } from "~/state/devicesStore";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import { Button } from "~/components/Button";
import { DateTime } from "luxon";
import { useConfigurationStore } from "~/state/configurationStore";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * 3‑day (hourly) dummy data – kept unchanged for the default view.
 */
const threeDayData = [
  { timestamp: "2023-12-31T23:00:00Z", min: 10, avg: 20, max: 30 },
  { timestamp: "2024-01-01T00:00:00Z", min: 10, avg: 20, max: 30 },
  { timestamp: "2024-01-01T01:00:00Z", min: 12, avg: 22, max: 32 },
  { timestamp: "2024-01-01T02:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T03:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T04:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T05:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T06:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T07:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T08:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T09:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T10:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T11:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T12:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T13:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T14:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T15:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T16:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T17:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T18:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T19:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T20:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T21:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T22:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-01T23:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-02T00:00:00Z", min: 11, avg: 21, max: 31 },
  // … more hourly points can be added here
];

/**
 * Sample month data – a few daily points to illustrate the monthly view.
 */
const monthData = [
  { timestamp: "2024-01-01T00:00:00Z", min: 8, avg: 18, max: 28 },
  { timestamp: "2024-01-05T00:00:00Z", min: 9, avg: 19, max: 29 },
  { timestamp: "2024-01-10T00:00:00Z", min: 7, avg: 17, max: 27 },
  { timestamp: "2024-01-15T00:00:00Z", min: 10, avg: 20, max: 30 },
  { timestamp: "2024-01-20T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-21T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-22T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-23T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-24T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-25T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-26T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-27T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-28T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-29T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-30T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-01-31T00:00:00Z", min: 11, avg: 21, max: 31 },
  { timestamp: "2024-02-01T00:00:00Z", min: 11, avg: 21, max: 31 },
];

/**
 * Possible dataset types that a user can pick.
 */
type DatasetType = "3days" | "month" | "custom";

export default function DeviceChart() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const device = useDevicesStore((s) =>
    s.devices.find((d) => d.id === deviceId),
  );
  const groupName = useDeviceGroupsStore((s) => {
    const g = s.groups.find((g) => g.id === device?.deviceGroup);
    return g?.name ?? "Unknown group";
  });

  const [showChart, setShowChart] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>("3days");
  const [chartData, setChartData] = useState<
    Array<{ timestamp: string; min: number; avg: number; max: number }>
  >([]);

  const { preferences } = useConfigurationStore();
  const tz =
    preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const mins = chartData.map((d) => d.min);
    const maxs = chartData.map((d) => d.max);
    const min = Math.min(...mins);
    const max = Math.max(...maxs);
    return [min, max];
  }, [chartData]);

  const workers = useMilleGrillesWorkers();
  useEffect(() => {
    if (!workers || !device) return;
    const request = {
      senseur_id: device.internalId ?? "",
      uuid_appareil: device.deviceGroup ?? "",
      timezone: tz,
    };
    workers.connection
      ?.getComponentStatistics(request)
      .then((res: any) => {
        const period =
          selectedDataset === "month" ? "periode31j" : "periode72h";
        const mapped =
          (res as any)[period]?.map((item: any) => ({
            timestamp: new Date(item.heure * 1000).toISOString(),
            min: item.min,
            max: item.max,
            avg: item.avg,
          })) ?? [];
        setChartData(mapped);
        console.log(`Component statistics (${period}):`, mapped);
      })
      .catch((err: any) =>
        console.error("Error fetching component statistics:", err),
      );
  }, [workers, tz, selectedDataset, device]);

  if (!device) {
    return (
      <div className="p-4">
        <p className="text-red-600">Device not found.</p>
        <NavLink
          to="/devices"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to devices
        </NavLink>
      </div>
    );
  }

  const toggleView = () => setShowChart((prev) => !prev);

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(e.target.value as DatasetType);
  };

  // Data from component statistics
  const data = chartData;
  // XAxis formatter with day change labeling for 3‑day view
  const prevDateRef = useRef<string | null>(null);
  const xAxisFormatter = (t: string) => {
    const dt = DateTime.fromISO(t).setZone(tz);
    if (selectedDataset === "month") {
      return dt.toFormat("yyyy-LL-dd");
    }
    const dateStr = dt.toFormat("yyyy-LL-dd");
    const timeStr = dt.toFormat("HH:mm");
    if (dateStr !== prevDateRef.current) {
      prevDateRef.current = dateStr;
      return dateStr;
    }
    return timeStr;
  };
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">
        {device.name} – {groupName}
      </h2>

      {/* Dataset selector */}
      <div className="flex items-center space-x-4 mb-4">
        <label htmlFor="dataset-select" className="text-sm font-medium">
          Dataset:
        </label>
        <select
          id="dataset-select"
          value={selectedDataset}
          onChange={handleDatasetChange}
          className="border rounded px-2 py-1"
        >
          <option value="3days">3‑day (hourly)</option>
          <option value="month">Month (daily)</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="flex justify-end mb-2">
        <Button variant="secondary" onClick={toggleView}>
          {showChart ? "Show Table" : "Show Chart"}
        </Button>
      </div>

      {showChart ? (
        data ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid
                stroke="#e5e7eb" // light‑gray grid line colour
                strokeDasharray="2 2" // dashed lines
                vertical={false} // draw vertical grid lines
                horizontal={true} // draw horizontal grid lines
                opacity={0.7}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={xAxisFormatter}
                angle={0}
                textAnchor="middle"
              />
              <YAxis
                domain={yDomain}
                tickCount={5}
                tickFormatter={(value: number, index: number) =>
                  "" + Math.round(value)
                }
              />
              <Tooltip
                labelFormatter={(label) =>
                  DateTime.fromISO(label)
                    .setZone(tz)
                    .toFormat("yyyy-LL-dd HH:mm:ss")
                }
                wrapperStyle={{ backgroundColor: "#1f2937", color: "#fff" }}
                contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line type="monotone" dataKey="min" stroke="#60a5fa" />
              <Line type="monotone" dataKey="avg" stroke="#34d399" />
              <Line type="monotone" dataKey="max" stroke="#f87171" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center py-8 text-gray-500">
            Custom dataset not yet implemented.
          </p>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200">
                <th className="px-4 py-2 dark:text-gray-200">Timestamp</th>
                <th className="px-4 py-2 dark:text-gray-200">Min</th>
                <th className="px-4 py-2 dark:text-gray-200">Avg</th>
                <th className="px-4 py-2 dark:text-gray-200">Max</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row, i) => (
                <tr
                  key={i}
                  className={
                    i % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700"
                  }
                >
                  <td className="px-4 py-2">
                    {DateTime.fromISO(row.timestamp)
                      .setZone(tz)
                      .toFormat("yyyy-LL-dd HH:mm:ss")}
                  </td>
                  <td className="px-4 py-2 dark:text-white">{row.min}</td>
                  <td className="px-4 py-2 dark:text-white">{row.avg}</td>
                  <td className="px-4 py-2 dark:text-white">{row.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NavLink to={`/devices/device/${device.id}`}>
        <Button variant="secondary">Back to Device</Button>
      </NavLink>
    </div>
  );
}
