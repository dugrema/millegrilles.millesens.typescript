import {
  ConnectionWorker,
  type MessageResponse,
  type SubscriptionCallback,
} from "millegrilles.reactdeps.typescript";

import apiMapping from "./apiMapping.json";
import { expose } from "comlink";

import {
  DOMAIN_SENSEURS_PASSIFS_NAME,
  DOMAINE_SENSEURSPASSIFS_RELAI_NAME,
  DOMAINE_CORETOPOLOGIE,
} from "../types/connection.types";

import type {
  GetFilehostsResponse,
  DeviceConfiguration,
  GetUserDevicesResponse,
  StatisticsRequestType,
  SenseursPassifsStatistiquesResponse,
  SenseursPassifsConfigurationResponse,
  SenseursPassifsConfigurationUpdate,
} from "../types/connection.types";

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
