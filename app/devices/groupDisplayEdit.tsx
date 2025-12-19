// File: millegrilles.millesens.typescript/app/devices/groupDisplayEdit.tsx

import { useParams, NavLink } from "react-router";
import { useState } from "react";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { Button } from "~/components/Button";

/**
 * Page for editing a single display configuration inside a device group.
 *
 * Currently only updates the local store; the backend sync will be added later.
 */
export default function GroupDisplayEdit() {
  const { groupId, displayName } = useParams<{
    groupId: string;
    displayName: string;
  }>();

  const group = useDeviceGroupsStore((s) =>
    s.groups.find((g) => g.id === groupId),
  );

  if (!group) {
    return (
      <div className="p-4">
        <p className="text-red-600">Group not found.</p>
      </div>
    );
  }

  // Find the display to edit
  const display = group.displays?.find((d) => d.name === displayName);
  if (!display) {
    return (
      <div className="p-4">
        <p className="text-red-600">Display not found.</p>
      </div>
    );
  }

  // Local form state
  const [format, setFormat] = useState(display.format ?? "text");
  const [width, setWidth] = useState(display.width ?? 0);
  const [height, setHeight] = useState(display.height ?? 0);

  const updateGroup = useDeviceGroupsStore((s) => s.updateGroup);

  const handleSave = () => {
    // Build updated display configuration
    const updatedDisplay = { ...display, format, width, height };

    // Update displays array
    const updatedDisplays = group.displays?.map((d) =>
      d.name === displayName ? updatedDisplay : d,
    );

    // Update displayConfiguration mapping if it exists
    // No displayConfiguration update for now

    const updatedGroup: DeviceGroup = {
      ...group,
      displays: updatedDisplays,
    };

    updateGroup(updatedGroup);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Edit Display: {displayName}
      </h1>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            value={displayName}
            readOnly
            className="w-full border rounded p-1 bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Format</label>
          <input
            type="text"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full border rounded p-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10))}
              className="w-full border rounded p-1"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value, 10))}
              className="w-full border rounded p-1"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
          <NavLink to={`/devices/group/${groupId}`}>
            <Button variant="outline">Cancel</Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
