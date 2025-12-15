import React, { createContext, useContext, useEffect, useState } from "react";

export interface TimeContextValue {
  /** Current epoch time in seconds. */
  now: number;
}

/**
 * Context that provides the current epoch time (seconds since the UNIX epoch).
 * The provider updates the value every second. Components can consume the
 * context to trigger re-renders or to calculate time‑based UI logic.
 */
export const TimeContext = createContext<TimeContextValue | undefined>(
  undefined,
);

/**
 * Provider component that should wrap the part of the application that needs
 * access to the global timestamp. It updates `now` every 5 seconds so that
 * consuming components react to the passage of time.
 */
export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <TimeContext.Provider value={{ now }}>{children}</TimeContext.Provider>
  );
};

/**
 * Hook that returns the current epoch time (seconds). It throws an error
 * if used outside of a <TimeProvider>.
 */
export const useTime = (): number => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error("useTime must be used within a TimeProvider");
  }
  return context.now;
};
