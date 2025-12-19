// File: millegrilles.millesens.typescript/app/components/ScreenDisplay.tsx

import { useMemo, useState, useEffect } from "react";
import python_format from "python-format-js";
import type {
  DisplayInformation,
  DisplayConfiguration,
} from "~/workers/connection.worker";
import type { DeviceValue } from "~/state/deviceValueStore";

/**
 * Props for the ScreenDisplay component.
 *
 * @param declaration   The screen declaration from the device group (`displays` array).
 * @param configuration The screen configuration for this display (`configuration.displays[<name>]`).
 * @param values        Map of device id → DeviceValue.  The key format is
 *                      `${groupId}__${internalId}`.
 * @param page          Optional page index (0‑based).  If omitted all pages are rendered.
 * @param onPageChange  Optional callback when the page changes.
 * @param preview       When true, fake values are generated instead of real ones.
 */
export interface ScreenDisplayProps {
  declaration: DisplayInformation;
  configuration: DisplayConfiguration;
  values: Record<string, DeviceValue>;
  page?: number;
  onPageChange?: (newPage: number) => void;
  preview?: boolean;
}

/**
 * ScreenDisplay renders a preview of a physical screen.
 *
 * The component:
 *  • Calculates pagination based on the screen height.
 *  • Formats each line with the mask and the corresponding device value.
 *  • Supports an optional page navigation UI.
 *  • Can operate in preview mode (random data instead of real values).
 */
export function ScreenDisplay({
  declaration,
  configuration,
  values,
  page,
  onPageChange,
  preview = false,
}: ScreenDisplayProps) {
  const pageSize = declaration.height ?? 1;
  const lines = configuration.lignes ?? [];
  const totalPages = Math.ceil(lines.length / pageSize);

  // If a specific page is requested we render all pages, otherwise we keep an
  // internal page index for navigation.
  const [pageIndex, setPageIndex] = useState<number>(page ?? 0);

  // Update page index when page prop changes (for external control).
  useEffect(() => {
    if (page !== undefined) setPageIndex(page);
  }, [page]);

  const startIdx = pageIndex * pageSize;
  const visibleLines = lines.slice(startIdx, startIdx + pageSize);

  /* ---------- Formatting logic ---------- */
  const formatMask = (mask: string, val?: DeviceValue): string => {
    if (!val) return "???";

    const value =
      val.numberValue !== undefined
        ? val.numberValue
        : val.stringValue !== undefined
          ? val.stringValue
          : val.status !== undefined
            ? val.status
            : null;

    if (value === null || value === "???") return "N??";

    // The python-format library supports placeholders like `{}` or `{0}`
    // in the same way as `str.format` in Python.
    try {
      const formattedValue = python_format(mask, value);
      console.debug("Formatted value", formattedValue);
      return formattedValue;
    } catch (err) {
      console.warn("Error rendering %O: %O", value, err);
      return `E?? -> ${val}`;
    }
  };

  /* ---------- Fake data for preview ---------- */
  const generateFakeValue = (key: string): DeviceValue => {
    // Simple heuristics based on key name
    if (/temperature/i.test(key)) {
      return {
        id: key,
        numberValue: Math.random() * 100 - 50,
        lastUpdate: 0,
        status: undefined,
        stringValue: undefined,
      };
    }
    if (/humidite/i.test(key)) {
      return {
        id: key,
        numberValue: Math.floor(Math.random() * 100),
        lastUpdate: 0,
        status: undefined,
        stringValue: undefined,
      };
    }
    if (/pression/i.test(key)) {
      return {
        id: key,
        numberValue: 950 + Math.floor(Math.random() * 20),
        lastUpdate: 0,
        status: undefined,
        stringValue: undefined,
      };
    }
    if (/switch/i.test(key)) {
      return {
        id: key,
        status: Math.random() < 0.5,
        lastUpdate: 0,
        numberValue: undefined,
        stringValue: undefined,
      };
    }
    return {
      id: key,
      lastUpdate: 0,
      status: undefined,
      numberValue: undefined,
      stringValue: "???",
    };
  };

  /* ---------- Rendering ---------- */
  const renderedLines = useMemo(() => {
    return visibleLines.map((ln, idx) => {
      const key = ln.variable;
      const val = preview ? generateFakeValue(key) : values[key];
      const formatted = formatMask(ln.masque, val);

      return (
        <pre
          key={idx}
          className="font-mono"
          style={{
            width: `${declaration.width}ch`,
            whiteSpace: "pre-wrap",
          }}
        >
          {formatted}
        </pre>
      );
    });
  }, [visibleLines, values, preview, configuration, declaration]);

  const handlePrev = () => {
    setPageIndex((p) => Math.max(p - 1, 0));
    onPageChange?.(Math.max(pageIndex - 1, 0));
  };

  const handleNext = () => {
    setPageIndex((p) => Math.min(p + 1, totalPages - 1));
    onPageChange?.(Math.min(pageIndex + 1, totalPages - 1));
  };

  return (
    <div className="border rounded p-2">
      {renderedLines}

      {totalPages > 1 && (
        <div className="mt-2 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={pageIndex === 0}
            className="px-2 py-1 rounded border"
          >
            Prev
          </button>
          <span>
            Page {pageIndex + 1} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={pageIndex >= totalPages - 1}
            className="px-2 py-1 rounded border"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
