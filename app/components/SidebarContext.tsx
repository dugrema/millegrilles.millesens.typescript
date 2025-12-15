import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface SidebarContextProps {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

/**
 * SidebarProvider manages the open/closed state of the mobile sidebar.
 * Wrap the app (or a large portion of it) in this provider to
 * allow any descendant to read or modify the sidebar state.
 */
export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook that gives components access to the sidebar state.
 *
 * @throws Error if used outside of a SidebarProvider.
 */
export const useSidebar = (): SidebarContextProps => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebar must be used within a SidebarProvider component"
    );
  }
  return context;
};
