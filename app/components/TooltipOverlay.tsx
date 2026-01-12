import type { FC } from "react";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export interface TooltipOverlayProps {
  /** Content displayed inside the tooltip. */
  content: React.ReactNode;
  /** Preferred placement relative to the trigger. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Delay (ms) before the tooltip appears / disappears. */
  delay?: number;
  /** Extra spacing (px) between trigger and tooltip. */
  offset?: number;
  /** Tailwind / CSS classes for the wrapper element. */
  className?: string;
  /** Element type for the wrapper. Default is a `<span>`. */
  as?: React.ElementType;
  /** Children that trigger the tooltip when hovered / focused. */
  children?: React.ReactNode;
  /** Ref to the trigger element if you cannot wrap it. */
  triggerRef?: React.RefObject<HTMLElement>;
  /** Called when the tooltip becomes visible. */
  onShow?: () => void;
  /** Called when the tooltip hides. */
  onHide?: () => void;
}

export const TooltipOverlay: FC<TooltipOverlayProps> = ({
  content,
  placement = "top",
  delay = 0,
  offset = 8,
  className = "",
  as = "span",
  children,
  triggerRef,
  onShow,
  onHide,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const wrapperRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const targetEl = triggerRef?.current ?? wrapperRef.current;

  // Show / hide handlers – use a timeout if delay is set
  const show = () => {
    if (delay > 0) {
      setTimeout(() => {
        setOpen(true);
        onShow?.();
      }, delay);
    } else {
      setOpen(true);
      onShow?.();
    }
  };

  const hide = () => {
    if (delay > 0) {
      setTimeout(() => {
        setOpen(false);
        onHide?.();
        setCoords({ top: 0, left: 0 });
      }, delay);
    } else {
      setOpen(false);
      onHide?.();
      setCoords({ top: 0, left: 0 });
    }
  };

  // Position the tooltip after it has been rendered
  useLayoutEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const target = targetEl;
    if (!overlay || !target) return;

    const rect = target.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = rect.top - overlayRect.height - offset;
        left = rect.left + (rect.width - overlayRect.width) / 2;
        break;
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + (rect.width - overlayRect.width) / 2;
        break;
      case "left":
        top = rect.top + (rect.height - overlayRect.height) / 2;
        left = rect.left - overlayRect.width - offset;
        break;
      case "right":
        top = rect.top + (rect.height - overlayRect.height) / 2;
        left = rect.right + offset;
        break;
    }

    setCoords({ top, left });
  }, [open, placement, offset, targetEl]);

  // Expose ref to parent if provided
  useEffect(() => {
    if (triggerRef) triggerRef.current = targetEl!;
  }, [triggerRef, targetEl]);

  const Wrapper = as as React.ElementType;

  return (
    <>
      <Wrapper
        ref={wrapperRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={className}
        tabIndex={-1}
        aria-describedby={open ? "tooltip-overlay" : undefined}
      >
        {children}
      </Wrapper>

      {open &&
        createPortal(
          <div
            ref={overlayRef}
            role="tooltip"
            id="tooltip-overlay"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
            }}
            className="bg-gray-900 text-white rounded p-2 text-sm"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};
