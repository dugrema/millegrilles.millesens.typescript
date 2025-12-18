import { useState, useEffect, useRef } from "react";
import type { FC, MouseEvent } from "react";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export interface ConfirmButtonProps extends ButtonProps {
  /** Action performed after the second click. */
  onClick?: (e: React.MouseEvent) => void;
  /** Label shown after the first click until the timeout. */
  confirmLabel?: string;
  /** Timeout in milliseconds for confirmation state reset. */
  timeoutMs?: number;
}

/**
 * A button that requires two clicks to trigger the real action.
 *
 * The first click activates a confirmation state.  The button label
 * changes to `confirmLabel` (defaults to “Confirm”).  If the user
 * clicks again within 3 seconds the `onClick` handler is called;
 * otherwise the state resets automatically.
 *
 * This component re‑uses the shared `Button` component for styling.
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
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!confirmed) {
      setConfirmed(true);
      timerRef.current = setTimeout(reset, timeoutMs);
    } else {
      reset();
      onClick?.(e);
    }
  };

  useEffect(() => {
    return () => reset();
  }, []);

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {confirmed ? confirmLabel : children}
    </Button>
  );
};
