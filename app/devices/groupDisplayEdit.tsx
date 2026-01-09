import { useParams, NavLink, useNavigate } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { useDeviceGroupsStore } from "~/state/deviceGroupsStore";
import type { DeviceGroup } from "~/state/deviceGroupsStore";
import { Button } from "~/components/Button";
import { DevicePickList } from "~/components/DevicePickList";
import { ScreenDisplay } from "~/components/ScreenDisplay";
import { useDeviceValuesStore } from "~/state/deviceValueStore";
import type { DeviceValue } from "~/state/deviceValueStore";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";
import { useTranslation } from "react-i18next";

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

  const workers = useMilleGrillesWorkers();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Guard against missing params
  if (!groupId || !displayName) {
    return (
      <div className="p-4">
        <p className="text-red-600">
          {t("groupDisplayEdit.missingGroupOrDisplay")}
        </p>
      </div>
    );
  }

  const group = useDeviceGroupsStore((s) =>
    s.groups.find((g) => g.id === groupId),
  );

  if (!group) {
    return (
      <div className="p-4">
        <p className="text-red-600">{t("groupDisplayEdit.groupNotFound")}</p>
      </div>
    );
  }

  const display = group.displays?.find((d) => d.name === displayName);
  if (!display) {
    return (
      <div className="p-4">
        <p className="text-red-600">{t("groupDisplayEdit.displayNotFound")}</p>
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
  const [pageIndex, setPageIndex] = useState<number>(0);
  const totalPages = Math.ceil(lines.length / pageSize);
  const startIdx = pageIndex * pageSize;
  const visibleLines = lines.slice(startIdx, startIdx + pageSize);

  /* ---------- Page‑level duration ---------- */
  const [pageDuree, setPageDuree] = useState<number>(0);

  // Sync pageDuree with the first line of the current page
  useEffect(() => {
    const first = visibleLines[0];
    setPageDuree(first?.duree ?? 0);
  }, [visibleLines]);

  // When the pageDuree changes, propagate to all lines on the page
  const handlePageDureeChange = (value: number) => {
    setPageDuree(value);
    setLines((prev) =>
      prev.map((l, i) =>
        i >= startIdx && i < startIdx + pageSize ? { ...l, duree: value } : l,
      ),
    );
  };

  /* ---------- Page add/remove ---------- */
  const handleAddPage = () => {
    setLines((prev) => [
      ...prev,
      ...Array.from({ length: pageSize }, () => ({
        variable: "",
        masque: "",
        duree: pageDuree,
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

  /* ---------- Save ---------- */
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

    const updateCommand = { displays: updatedDisplayConfiguration };
    workers?.connection
      ?.updateDeviceConfiguration(updatedGroup.id, updateCommand)
      .then((response) => {
        if (!response.persiste)
          throw new Error(`Error updating device: ${response.err}`);
        // Return to the list view
        navigate(`/devices/displays/${group.id}`);
      })
      .catch((err) =>
        console.error("handleSave Error updating device group", err),
      );
  };

  /* ---------- Build values map ---------- */
  const deviceValues = useDeviceValuesStore((s) => s.deviceValues);
  const valuesMap = useMemo(() => {
    const map: Record<string, DeviceValue> = {};
    deviceValues.forEach((v) => {
      map[v.id] = v;
    });
    return map;
  }, [deviceValues]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {t("groupDisplayEdit.title", { displayName })}
      </h1>

      {/* Display information */}
      <div className="mb-4">
        <h3 className="font-medium mb-1">
          {t("groupDisplayEdit.displayInfoHeader")}
        </h3>
        <p>
          {t("groupDisplayEdit.nameLabel")}: {displayName}
        </p>
        <p>
          {t("groupDisplayEdit.formatLabel")}: {display.format}
        </p>
        <p>
          {t("groupDisplayEdit.sizeLabel")}: {display.width} × {display.height}
        </p>
      </div>

      {/* Display configuration */}
      <div className="mb-4">
        <h3 className="font-medium mb-1">
          {t("groupDisplayEdit.displayConfigHeader")}
        </h3>

        <div className="mb-2">
          <label className="block font-medium mb-1">
            {t("groupDisplayEdit.afficherDateDureeLabel")}
          </label>
          <input
            type="number"
            value={afficherDateDuree}
            onChange={(e) => setAfficherDateDuree(parseInt(e.target.value, 10))}
            className="w-full border rounded p-1"
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          {/* Lines, paginated */}
          <h4 className="font-medium mb-1">
            {t("groupDisplayEdit.page", {
              current: pageIndex + 1,
              total: totalPages,
            })}
          </h4>

          {/* Page level controls */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleAddPage}>
              {t("groupDisplayEdit.addPage")}
            </Button>
            <Button
              variant="outline"
              onClick={handleRemovePage}
              disabled={lines.length === 0}
            >
              {t("groupDisplayEdit.removePage")}
            </Button>
          </div>
        </div>

        {/* Page‑level duration input */}
        {visibleLines.length > 0 && (
          <div className="mb-2">
            <label className="block font-medium mb-1">
              {t("groupDisplayEdit.durationLabel")}
            </label>
            <input
              type="number"
              value={pageDuree}
              onChange={(e) =>
                handlePageDureeChange(parseInt(e.target.value, 10))
              }
              className="w-full border rounded p-1"
            />
          </div>
        )}

        <div className="md:flex md:items-center md:justify-between md:space-x-2">
          <div>
            <div className="mb-1">{t("groupDisplayEdit.linesLabel")}</div>

            {visibleLines.map((line, idx) => {
              const globalIdx = startIdx + idx;
              return (
                <div key={globalIdx} className="border rounded p-2 mb-2">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium mb-1">
                        {t("groupDisplayEdit.variableLabel")}
                      </label>
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
                      <label className="block font-medium mb-1">
                        {t("groupDisplayEdit.masqueLabel")}
                      </label>
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
                        disabled={!line.variable}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Screen preview */}
          <div className="mt-1">
            <p>{t("groupDisplayEdit.samplePage")}</p>
            <ScreenDisplay
              declaration={display}
              configuration={{ lignes: lines }}
              values={valuesMap}
              page={pageIndex}
              onPageChange={setPageIndex}
              preview={true}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button onClick={handleSave} variant="primary">
          {t("groupDisplayEdit.save")}
        </Button>
        <NavLink to={`/devices/displays/${groupId}`}>
          <Button variant="outline">{t("groupDisplayEdit.cancel")}</Button>
        </NavLink>
      </div>
    </div>
  );
}
