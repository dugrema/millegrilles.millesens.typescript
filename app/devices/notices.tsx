import React, { useState, useCallback } from "react";
import { useDeviceGroupsStore } from "../state/deviceGroupsStore";
import type { DeviceGroup } from "../state/deviceGroupsStore";
import { useMilleGrillesWorkers } from "~/workers/MilleGrillesWorkerContext";
import { useTranslation } from "react-i18next";

/** A minimal two‑step registration flow:
 *
 *  1. Generate a 4‑digit code, send it to the backend.
 *  2. Once the user confirms the device answered, notify the backend
 *     and mark the group as requested.
 *
 *  The component keeps a local map of groupId → {code, submitted} so
 *  each pending group can be processed independently.
 */

export default function NoticesPage() {
  const { t } = useTranslation();
  const workers = useMilleGrillesWorkers();
  const groups = useDeviceGroupsStore((s) => s.groups);
  const pending = groups.filter((g) => g.registrationPending);
  const updateGroup = useDeviceGroupsStore((s) => s.updateGroup);

  /* Map: groupId → { code: number[], submitted: boolean } */
  const [steps, setSteps] = useState<
    Record<string, { code: number[]; submitted: boolean }>
  >({});

  const [code, setCode] = useState<number[] | null>(null);

  /** Generate a 4‑digit code (1‑4) and return as array of numbers */
  const generateRegistrationCode = useCallback(async (): Promise<number[]> => {
    const code = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 4) + 1,
    );
    return code;
  }, []);

  /** Stub: send the code to the backend for the given group */
  const submitRegistrationCode = useCallback(
    async (groupId: string, code: number[]): Promise<void> => {
      if (!workers) throw new Error("Workers not initialized");

      const group = groups.find((g) => g.id === groupId);
      if (!group) throw new Error(`Unknown device group: ${groupId}`);
      const command = { uuid_appareil: group.id, challenge: code };
      workers.connection
        .challengeDevice(command)
        .then((response) => {
          if (response.ok) {
            console.log(`Submitted code ${code.join("")} for group ${groupId}`);
          } else {
            console.error(
              "There was an error submitting the registration code, try again",
            );
          }
        })
        .catch((err) => {
          console.error(
            "There was an error submitting the registration code: %O",
            err,
          );
        });
    },
    [],
  );

  /** Stub: confirm the device responded to the registration code */
  const confirmRegistration = useCallback(
    async (groupId: string, code: number[]): Promise<void> => {
      if (!workers) throw new Error("Workers not initialized");
      const group = groups.find((g) => g.id === groupId);
      if (!group) throw new Error(`Unknown device group: ${groupId}`);

      workers.connection
        .confirmDevice({ uuid_appareil: group.id, challenge: code })
        .then((response) => {
          if (response.ok) {
            console.log(
              `Device ${group.id} registered succesfully. It may take a few minutes for it to update.`,
            );
          } else {
            console.error("Confirmation error", response.err);
          }
        })
        .catch((err) => {
          console.error("Confirmation error", err);
          setCode(null);
        });
    },
    [],
  );

  /* Handle clicking "Register" */
  const handleRegister = useCallback(
    async (group: DeviceGroup) => {
      const code = await generateRegistrationCode();
      setCode(code);
      await submitRegistrationCode(group.id, code);
      setSteps((prev) => ({
        ...prev,
        [group.id]: { code, submitted: true },
      }));
    },
    [generateRegistrationCode, submitRegistrationCode],
  );

  /* Handle clicking "Confirm" */
  const handleConfirm = useCallback(
    async (group: DeviceGroup, code: number[] | null) => {
      if (!code) throw new Error("Code not provided");
      await confirmRegistration(group.id, code);
      updateGroup({ ...group, registrationPending: false });
      // Remove the local step once confirmed
      setSteps((prev) => {
        const { [group.id]: _, ...rest } = prev;
        return rest;
      });
    },
    [confirmRegistration, updateGroup],
  );

  if (pending.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400">
          {t("noticesPage.noPendingRegistrations")}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4 p-4">
      {pending.map((g) => (
        <li key={g.id}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {g.name}
            </h3>
            {g.microcode && (
              <p className="text-gray-700 dark:text-gray-300">
                {t("noticesPage.microcode")}: {g.microcode}
              </p>
            )}
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200">
              {t("noticesPage.pendingRegistration")}
            </span>

            <div className="mt-4 flex items-center space-x-2">
              {steps[g.id]?.submitted ? (
                <>
                  <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {t("noticesPage.code")}: {steps[g.id].code.join("")}
                  </span>
                  <button
                    className="px-3 py-1 rounded text-sm bg-blue-500 dark:bg-blue-600 text-white"
                    onClick={() => handleConfirm(g, code)}
                  >
                    {t("noticesPage.confirm")}
                  </button>
                </>
              ) : (
                <button
                  className="px-3 py-1 rounded text-sm bg-green-500 dark:bg-green-600 text-white"
                  onClick={() => handleRegister(g)}
                >
                  {t("noticesPage.register")}
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
