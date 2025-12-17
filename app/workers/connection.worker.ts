import {
  ConnectionWorker,
  type MessageResponse,
  type SubscriptionCallback,
} from "millegrilles.reactdeps.typescript";

import apiMapping from "./apiMapping.json";
import { expose } from "comlink";

/** Domain name for the SenseursPassifs service. */
const DOMAIN_SENSEURS_PASSIFS_NAME = "SenseursPassifs";
const DOMAINE_SENSEURSPASSIFS_RELAI_NAME = "senseurspassifs_relai";

/** Domain name for the CoreTopologie service. */
const DOMAINE_CORETOPOLOGIE = "CoreTopologie";

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

/**
 * Worker implementation for the MilleGrilles connection.
 * Extends the generic {@link ConnectionWorker} and exposes a minimal set of
 * convenience methods used by the application.
 */
export class AppsConnectionWorker extends ConnectionWorker {
  /**
   * Authenticates the worker against the MilleGrilles server.
   *
   * @param reconnect Optional flag to force reconnection if already connected.
   * @returns Promise that resolves to `true` when authentication succeeds.
   */
  async authenticate(reconnect?: boolean): Promise<boolean> {
    if (!this.connection) {
      throw new Error("Connection is not initialized");
    }
    return await this.connection.authenticate(apiMapping, reconnect);
  }

  /**
   * Retrieves the list of file hosts from the CoreTopologie domain.
   *
   * @returns Promise that resolves to {@link GetFilehostsResponse}.
   */
  async getFilehosts(): Promise<GetFilehostsResponse> {
    if (!this.connection) {
      throw new Error("Connection is not initialized");
    }
    return (await this.connection.sendRequest(
      {},
      DOMAINE_CORETOPOLOGIE,
      "getFilehosts",
    )) as GetFilehostsResponse;
  }

  /**
   * Retrieves the public key of the message factory.
   *
   * @returns Promise resolving to the certificate data.
   */
  async getCertificate(): Promise<any> {
    if (!this.connection) {
      throw new Error("Connection is not initialized");
    }
    return this.connection.getMessageFactoryCertificate();
  }

  async getUserDevices(): Promise<GetUserDevicesResponse> {
    if (!this.connection) throw new Error("Connection is not initialized");
    return (await this.connection.sendRequest(
      {},
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "getAppareilsUsager",
    )) as GetUserDevicesResponse;
  }

  async subscribeUserDevices(cb: SubscriptionCallback): Promise<void> {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.subscribe("userDeviceEvents", cb);
  }

  async unsubscribeUserDevices(cb: SubscriptionCallback): Promise<void> {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.unsubscribe("userDeviceEvents", cb);
  }

  async challengeDevice(params: {
    uuid_appareil: string;
    challenge: Array<number>;
  }): Promise<MessageResponse> {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      params,
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "challengeAppareil",
    );
  }

  async confirmDevice(params: {
    uuid_appareil: string;
    challenge: Array<number>;
  }): Promise<MessageResponse> {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      params,
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "signerAppareil",
    );
  }

  async deviceCommand(
    instance_id: string,
    uuid_appareil: string,
    senseur_id: string,
    valeur: string | number,
    commande_action: string,
  ) {
    if (!this.connection) throw new Error("Connection is not initialized");
    let partition = instance_id;
    const command = {
      instance_id,
      uuid_appareil,
      senseur_id,
      valeur,
      commande_action,
    };

    return await this.connection.sendCommand(
      command,
      DOMAINE_SENSEURSPASSIFS_RELAI_NAME,
      "commandeAppareil",
      { partition, nowait: true },
    );
  }

  async updateDeviceConfiguration(
    uuid_appareil: string,
    configuration: DeviceConfiguration,
  ) {
    if (!this.connection) throw new Error("Connection is not initialized");
    const command = { uuid_appareil, configuration };
    return (await this.connection.sendCommand(
      command,
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "majAppareil",
    )) as Promise<MessageResponse & { persiste?: boolean }>;
  }

  async deleteDeviceGroup(uuid_appareil: string) {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      { uuid_appareil },
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "supprimerAppareil",
    );
  }

  async restoreDeviceGroup(uuid_appareil: string) {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      { uuid_appareil },
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "restaurerAppareil",
    );
  }

  async deleteDevice(deviceGroupId: string, deviceId: string) {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      { uuid_appareil: deviceGroupId, senseur_id: deviceId, hide: true },
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "showHideSensor",
    );
  }

  async restoreDevice(deviceGroupId: string, deviceId: string) {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      { uuid_appareil: deviceGroupId, senseur_id: deviceId, show: true },
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "showHideSensor",
    );
  }

  async getComponentStatistics(request: StatisticsRequestType) {
    if (!this.connection) throw new Error("Connection is not initialized");
    return (await this.connection.sendRequest(
      request,
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "getStatistiquesSenseur",
    )) as SenseursPassifsStatistiquesResponse;
  }

  async getUserConfiguration() {
    if (!this.connection) throw new Error("Connection is not initialized");
    return (await this.connection.sendRequest(
      {},
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "getConfigurationUsager",
    )) as SenseursPassifsConfigurationResponse;
  }

  async updateUserConfiguration(
    configuration: SenseursPassifsConfigurationUpdate,
  ) {
    if (!this.connection) throw new Error("Connection is not initialized");
    return await this.connection.sendCommand(
      configuration,
      DOMAIN_SENSEURS_PASSIFS_NAME,
      "majConfigurationUsager",
    );
  }
}

/** The worker instance that will be exposed to the main thread. */
const WORKER = new AppsConnectionWorker();
expose(WORKER);
