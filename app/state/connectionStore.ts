import { create } from "zustand";

export type LoadFicheResult = {
  ca: string;
  idmg: string;
  chiffrage: Array<Array<string>>;
};

/** Zustand store for connection state */
export interface ConnectionState {
  connected: boolean;
  authenticated: boolean;
  ready: boolean;
  fiche: LoadFicheResult | null;
  idmg: string;
  userId: string;
  username: string;
  setConnected: (value: boolean) => void;
  setAuthenticated: (value: boolean) => void;
  setFiche: (value: LoadFicheResult | null) => void;
  setIdmg: (value: string) => void;
  setUserId: (value: string) => void;
  setUsername: (value: string) => void;
}

export const useConnectionStore = create<ConnectionState>()((set) => ({
  connected: false,
  authenticated: false,
  ready: false,
  fiche: null,
  idmg: "",
  userId: "",
  username: "",
  setConnected: (value: boolean) =>
    set((state) => ({ connected: value, ready: value && state.authenticated })),
  setAuthenticated: (value: boolean) =>
    set((state) => ({ authenticated: value, ready: value && state.connected })),
  setFiche: (value: LoadFicheResult | null) => set(() => ({ fiche: value })),
  setIdmg: (value: string) => set(() => ({ idmg: value })),
  setUserId: (value: string) => set(() => ({ userId: value })),
  setUsername: (value: string) => set(() => ({ username: value })),
}));
