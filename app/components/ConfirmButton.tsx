import { useState, useEffect, useRef } from "react";
import type { FC, MouseEvent } from "react";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export interface ConfirmButtonProps extends ButtonProps {
  /** Action performed after the second click. */
  onClick?: (e: MouseEvent) => void;
  /** Label shown after the first click until the timeout. */
  confirmLabel?: string;
  /** Timeout in milliseconds for confirmation state reset. */
  timeoutMs?: number;
}

/**
 * A button that requires two clicks to trigger the real action.
 *
 * The first click activates a confirmation state. The button label
 * changes to `confirmLabel` (defaults to “Confirm”). If the user
 * clicks again within the timeout, the `onClick` handler is called;
 * otherwise the state resets automatically.
 *
 * The outline variant is styled with higher contrast:
 * - In light mode: a thicker border, darker text, and a subtle
 *   red hover background (`hover:bg-red-100`).
 * - In dark mode: a darker border, muted text, and a subdued red
 *   hover background (`dark:hover:bg-red-900`).
 */
export const ConfirmButton: FC<ConfirmButtonProps> = ({
  onClick,
  confirmLabel = "Confirm",
  timeoutMs = 3000,
  children,
  variant = "primary",
  className = "",
  ...rest
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    setConfirmed(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const handleClick = (e: MouseEvent) => {
    if (!confirmed) {
      setConfirmed(true);
      timerRef.current = setTimeout(reset, timeoutMs);
    } else {
      reset();
      onClick?.(e);
    }
  };

  useEffect(() => () => reset(), []);

  // Dark‑mode overrides for the outline variant
  const darkClasses =
    variant === "outline"
      ? "dark:border-gray-600 dark:text-gray-400 dark:hover:bg-red-900 dark:focus:ring-gray-500"
      : "";

  // Additional contrast for the outline variant in light mode
  const lightClasses =
    variant === "outline"
      ? "border-2 border-gray-400 text-gray-700 hover:bg-red-200 focus:ring-gray-300"
      : "";

  return (
    <Button
      variant={variant}
      className={`${className} ${lightClasses} ${darkClasses}`.trim()}
      onClick={handleClick}
      {...rest}
    >
      {confirmed ? confirmLabel : children}
    </Button>
  );
};
