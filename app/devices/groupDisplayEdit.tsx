// File: millegrilles.millesens.typescript/app/devices/groupDisplayEdit.tsx

import { useParams, NavLink } from "react-router";
import { useState } from "react";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { Button } from "~/components/Button";
import { DevicePickList } from "~/components/DevicePickList";

/**
 * Edit a display configuration inside a device group.
 *
 * The editor shows:
 *  • The group displays list (plain text).
 *  • The display information (name, format, size).
 *  • The display configuration: `afficher_date_duree` and a list of lines.
 *
 * Lines are paginated according to the display height.  Each page shows
 * `height` lines and page‑level add/remove buttons are provided.
 *
 * The variable field of a line is a device; it is edited with {@link DevicePickList}.
 */
export default function GroupDisplayEdit() {
  const { groupId, displayName } = useParams<{
    groupId: string;
    displayName: string;
  }>();

  // Guard against missing params
  if (!groupId || !displayName) {
    return (
      <div className="p-4">
        <p className="text-red-600">Missing group or display name.</p>
      </div>
    );
  }

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

  const display = group.displays?.find((d) => d.name === displayName);
  if (!display) {
    return (
      <div className="p-4">
        <p className="text-red-600">Display not found.</p>
      </div>
    );
  }

  // Initial configuration values
  const initialConfig = group.displayConfiguration?.[displayName] ?? {};
  const [afficherDateDuree, setAfficherDateDuree] = useState<
    number | undefined
  >(initialConfig.afficher_date_duree);
  const [lines, setLines] = useState<
    Array<{ variable: string; masque: string; duree: number }>
  >(initialConfig.lignes ?? []);

  const updateGroup = useDeviceGroupsStore((s) => s.updateGroup);

  // Pagination
  const pageSize = display.height ?? 1;
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = Math.ceil(lines.length / pageSize);

  const startIdx = pageIndex * pageSize;
  const visibleLines = lines.slice(startIdx, startIdx + pageSize);

  const handleAddPage = () => {
    setLines((prev) => [
      ...prev,
      ...Array.from({ length: pageSize }, () => ({
        variable: "",
        masque: "",
        duree: 0,
      })),
    ]);
  };

  const handleRemovePage = () => {
    setLines((prev) => {
      const newLines = prev.slice(0, Math.max(prev.length - pageSize, 0));
      // Adjust page index if we removed the last page
      const newTotal = Math.ceil(newLines.length / pageSize);
      if (pageIndex >= newTotal) setPageIndex(Math.max(newTotal - 1, 0));
      return newLines;
    });
  };

  const handleSave = () => {
    const updatedConfig = {
      afficher_date_duree: afficherDateDuree,
      lignes: lines,
    };
    const updatedDisplayConfiguration = group.displayConfiguration
      ? { ...group.displayConfiguration, [displayName]: updatedConfig }
      : { [displayName]: updatedConfig };

    const updatedGroup: DeviceGroup = {
      ...group,
      displayConfiguration: updatedDisplayConfiguration,
    };
    updateGroup(updatedGroup);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Edit Display: {displayName}
      </h1>

      {/* Group displays list */}
      <div className="mb-4">
        <h3 className="font-medium mb-1">Group Displays</h3>
        <ul className="list-disc pl-4">
          {group.displays?.map((d) => (
            <li key={d.name}>
              {d.name} – {d.format} – {d.width}×{d.height}
            </li>
          ))}
        </ul>
      </div>

      {/* Display information */}
      <div className="mb-4">
        <h3 className="font-medium mb-1">Display Information</h3>
        <p>Name: {displayName}</p>
        <p>Format: {display.format}</p>
        <p>
          Size: {display.width} × {display.height}
        </p>
      </div>

      {/* Display configuration */}
      <div className="mb-4">
        <h3 className="font-medium mb-1">Display Configuration</h3>

        <div className="mb-2">
          <label className="block font-medium mb-1">Afficher date durée</label>
          <input
            type="number"
            value={afficherDateDuree}
            onChange={(e) => setAfficherDateDuree(parseInt(e.target.value, 10))}
            className="w-full border rounded p-1"
          />
        </div>

        {/* Lines, paginated */}
        <h4 className="font-medium mb-1">
          Lines (page {pageIndex + 1} of {totalPages})
        </h4>
        {visibleLines.map((line, idx) => {
          const globalIdx = startIdx + idx;
          return (
            <div key={globalIdx} className="border rounded p-2 mb-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium mb-1">Variable</label>
                  <DevicePickList
                    currentDeviceGroup={group.id}
                    value={line.variable}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, i) =>
                          i === globalIdx
                            ? { ...l, variable: e.target.value }
                            : l,
                        ),
                      )
                    }
                    className="w-full border rounded p-1"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Masque</label>
                  <input
                    type="text"
                    value={line.masque}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, i) =>
                          i === globalIdx
                            ? { ...l, masque: e.target.value }
                            : l,
                        ),
                      )
                    }
                    className="w-full border rounded p-1"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Duree</label>
                  <input
                    type="number"
                    value={line.duree}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, i) =>
                          i === globalIdx
                            ? { ...l, duree: parseInt(e.target.value, 10) }
                            : l,
                        ),
                      )
                    }
                    className="w-full border rounded p-1"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Page level controls */}
        <div className="flex space-x-2 mt-2">
          <Button variant="outline" onClick={handleAddPage} disabled={false}>
            Add page
          </Button>
          <Button
            variant="outline"
            onClick={handleRemovePage}
            disabled={lines.length === 0}
          >
            Remove page
          </Button>
        </div>

        {/* Page navigation */}
        <div className="flex space-x-2 mt-2">
          <Button
            variant="outline"
            onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            disabled={pageIndex === 0}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
            disabled={pageIndex >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button onClick={handleSave} variant="primary">
          Save
        </Button>
        <NavLink to={`/devices/group/${groupId}`}>
          <Button variant="outline">Cancel</Button>
        </NavLink>
      </div>
    </div>
  );
}
