import type { MessageResponse } from "millegrilles.reactdeps.typescript";

/** Domain name for the SenseursPassifs service. */
export const DOMAIN_SENSEURS_PASSIFS_NAME = "SenseursPassifs";
export const DOMAINE_SENSEURSPASSIFS_RELAI_NAME = "senseurspassifs_relai";

/** Domain name for the CoreTopologie service. */
export const DOMAINE_CORETOPOLOGIE = "CoreTopologie";

/**
 * Represents a file host managed by the MilleGrilles system.
 */
export type Filehost = {
  /** Unique identifier of the file host. */
  filehost_id: string;
  /** Optional instance identifier. */
  instance_id?: string | null;
  /** TLS external URL, if any. */
  tls_external?: string | null;
  /** External URL accessible from the Internet. */
  url_external?: string | null;
  /** Internal URL used within the system. */
  url_internal?: string | null;
};

/**
 * Extended file host information returned by the `getFilehosts` request.
 */
export type FilehostDirType = Filehost & {
  /** Full URL (if available). */
  url?: string | null;
  /** JWT for accessing the host. */
  jwt?: string | null;
  /** Whether the host is authenticated. */
  authenticated?: boolean | null;
  /** Last known ping timestamp in milliseconds. */
  lastPing?: number | null;
};

/**
 * Response type for `getFilehosts` API calls.
 */
export type GetFilehostsResponse = MessageResponse & {
  /** List of file hosts, or null if none. */
  list?: Filehost[] | null;
};

export type DeviceReadingValue = {
  timestamp: number;
  type: string;
  valeur?: number;
  valeur_str?: string;
};

export type GeopositionConfiguration = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type DisplayConfigurationLine = {
  variable: string;
  masque: string;
  duree: number;
};

export type DisplayConfiguration = {
  afficher_date_duree?: number;
  lignes?: Array<DisplayConfigurationLine>;
};

export type ProgramConfiguration = {
  programme_id: string;
  actif: boolean;
  class: string;
  descriptif?: string;
  args?: {
    [key: string]: string | number | Array<string | number | Object> | Object;
  };
};

export type ProgramsConfiguration = { [key: string]: ProgramConfiguration };

export type DeviceConfiguration = {
  cacher_senseurs?: Array<string>;
  descriptif?: string;
  descriptif_senseurs?: { [key: string]: string };
  displays?: { [key: string]: DisplayConfiguration };
  geoposition?: GeopositionConfiguration;
  timezone?: string;
  programmes?: ProgramsConfiguration;
  filtres_senseurs?: { [key: string]: string[] };
};

export type DisplayInformation = {
  name: string;
  format: string;
  width?: number;
  height?: number;
};

export type DeviceReadings = {
  uuid_appareil: string;
  instance_id: string;
  derniere_lecture: number;
  senseurs?: { [key: string]: DeviceReadingValue };
  types_donnees?: { [key: string]: string };
  configuration?: DeviceConfiguration;
  csr_present: boolean;
  connecte?: boolean;
  version?: string;
  supprime?: boolean;
  displays?: Array<DisplayInformation>;
};

export type GetUserDevicesResponse = MessageResponse & {
  instance_id: string;
  content?: MessageResponse;
  appareils: Array<DeviceReadings>;
};

export type StatisticsRequestType = {
  senseur_id: string;
  uuid_appareil: string;
  timezone: string;
  custom_grouping?: string;
  custom_intervalle_min?: number;
  custom_intervalle_max?: number;
};

export type SenseursPassifsStatistiquesItem = {
  heure: number;
  avg?: number;
  max?: number;
  min?: number;
};

export type SenseursPassifsStatistiquesResponse = MessageResponse & {
  periode31j?: Array<SenseursPassifsStatistiquesItem>;
  periode72h?: Array<SenseursPassifsStatistiquesItem>;
  custom?: Array<SenseursPassifsStatistiquesItem>;
};

export type SenseursPassifsConfigurationResponse = MessageResponse & {
  geoposition?: Object;
  timezone?: string;
  user_id: string;
};

export type SenseursPassifsConfigurationUpdate = {
  timezone?: string | null;
};
