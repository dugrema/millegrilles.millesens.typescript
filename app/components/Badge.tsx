import type { FC } from "react";
import { useTranslation } from "react-i18next";

interface BadgeProps {
  /** The numeric value to display. The badge is rendered only when this is greater than 0. */
  count: number;
  /** Optional additional Tailwind classes to customize the badge appearance. */
  className?: string;
  /** Optional accessibility label. If not provided, a default will be used. */
  ariaLabel?: string;
}

export const Badge: FC<BadgeProps> = ({ count, className = "", ariaLabel }) => {
  if (count <= 0) return null;

  const { t } = useTranslation();
  const defaultAriaLabel = t("badge.ariaLabel", {
    count,
    type: count === 1 ? "notification" : "notifications",
  });

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        bg-red-600
        text-white
        text-xs
        font-medium
        px-2
        py-0.5
        ml-2
        ${className}
      `}
      aria-label={ariaLabel ?? defaultAriaLabel}
    >
      {count}
    </span>
  );
};
