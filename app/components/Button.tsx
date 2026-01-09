import type { FC, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional label for the button. */
  children?: React.ReactNode;
  /** Optional variant: primary, secondary, etc. */
  variant?: "primary" | "secondary" | "outline";
}

/**
 * A simple, reusable button component that accepts Tailwind utility classes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Submit
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...rest
}) => {
  const base =
    "p-2 inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-indigo-700 text-white hover:bg-indigo-800 focus:ring-indigo-500",
    secondary:
      "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
    outline:
      "border border-gray-300 text-gray-300 hover:bg-gray-100 focus:ring-indigo-500",
  };

  const classes = `${base} ${variants[variant]} ${className}`.trim();

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
