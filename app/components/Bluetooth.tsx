import React, { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, Dispatch } from "react";
import { Formatters } from "millegrilles.reactdeps.typescript";
import { useTranslation } from "react-i18next";

import { useBluetoothStore } from "~/state/bluetoothStore";
import { useConnectionStore } from "../state/connectionStore";
import { useMilleGrillesWorkers } from "../workers/MilleGrillesWorkerContext";

import type { SwitchState } from "../utils/bluetooth/commands";
import {
  chargerEtatAppareil,
  checkBluetoothAvailable,
  requestDevice,
  submitConfiguration as bleSubmitConfiguration,
  submitWifi as bleSubmitWifi,
  transmettreDictChiffre,
  authentifier as bleAuthentifier,
  decoderLectures as bleDecoderLectures,
  decoderWifi as bleDecoderWifi,
  addEventListener as bleAddEventListener,
  removeEventListener as bleRemoveEventListener,
} from "../utils/bluetooth/commands";
import CONST_BLUETOOTH_SERVICES from "../utils/bluetooth/services.json";

declare global {
  interface BluetoothDevice {
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(
      event: string,
      handler: EventListenerOrEventListenerObject,
    ): void;
  }
  interface BluetoothRemoteGATTServer {
    connected: boolean;
    disconnect(): void;
    connect(): Promise<BluetoothRemoteGATTServer>;
  }
}

/* ---------- Devices section ---------- */
export function BluetoothDevicesSection() {
  const { t } = useTranslation();
  const clearDeviceState = useBluetoothStore((state) => state.reset);

  const [wifi, setWifi] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [relayUrl, setRelayUrl] = useState("");

  const wifiChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setWifi(e.currentTarget.value),
    [setWifi],
  );
  const wifiPasswordChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setWifiPassword(e.currentTarget.value),
    [setWifiPassword],
  );
  const relayUrlChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setRelayUrl(e.currentTarget.value),
    [setRelayUrl],
  );

  const [selectedDevice, setSelectedDevice] = useState<
    BluetoothDevice | undefined
  >(undefined);

  useEffect(() => {
    const relayUrl = new URL(window.location.href);
    relayUrl.pathname = "";
    setRelayUrl(relayUrl.href);
  }, [setRelayUrl]);

  useEffect(() => {
    if (!selectedDevice?.gatt) return;
    selectedDevice.addEventListener("gattserverdisconnected", () => {
      console.warn("GATT server disconnected");
      setSelectedDevice(undefined);
    });
  }, [selectedDevice]);

  useEffect(() => {
    return () => {
      clearDeviceState();
    };
  }, [clearDeviceState]);

  return (
    <>
      <h1>{t("bluetooth.title")}</h1>
      <section>
        <h2>{t("bluetooth.connectionHeader")}</h2>
        <div className="grid grid-cols-12">
          <label htmlFor="wifissid" className="col-span-3">
            {t("bluetooth.wifiLabel")}
          </label>
          <input
            id="wifissid"
            type="text"
            onChange={wifiChangeHandler}
            value={wifi}
            className="col-span-6 text-black"
          />
          <div className="col-span-3"></div>
          <label htmlFor="wifipassword" className="col-span-3">
            {t("bluetooth.wifiPasswordLabel")}
          </label>
          <input
            id="wifipassword"
            type="password"
            onChange={wifiPasswordChangeHandler}
            value={wifiPassword}
            className="col-span-6 text-black"
          />
          <div className="col-span-3"></div>
          <p className="col-span-12">
            {t("bluetooth.serverConnectionUrlLabel")}
          </p>
          <label htmlFor="serverurl" className="col-span-3">
            {t("bluetooth.serverUrlLabel")}
          </label>
          <input
            id="serverurl"
            type="url"
            onChange={relayUrlChangeHandler}
            value={relayUrl}
            className="col-span-6 text-black"
          />
          <div className="col-span-3"></div>
        </div>
      </section>

      <section>
        <h2>{t("bluetooth.deviceHeader")}</h2>

        <DeviceScan
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
        />

        <DeviceConnection
          selectedDevice={selectedDevice}
          wifi={wifi}
          wifiPassword={wifiPassword}
          relayUrl={relayUrl}
        />
      </section>
    </>
  );
}

/* ---------- Device scan component ---------- */
type DeviceScanProps = {
  selectedDevice?: BluetoothDevice;
  setSelectedDevice: Dispatch<BluetoothDevice | undefined>;
};

export function DeviceScan(props: DeviceScanProps) {
  const { t } = useTranslation();
  const { setSelectedDevice } = props;
  const scanCb = useCallback(() => {
    requestDevice()
      .then((device) => {
        if (!device) return; // Cancelled
        setSelectedDevice(device);
      })
      .catch((err) => console.error("Erreur chargement device ", err));
  }, [setSelectedDevice]);

  const disconnectHandler = useCallback(
    () => setSelectedDevice(undefined),
    [setSelectedDevice],
  );

  if (props.selectedDevice)
    return (
      <>
        <button
          onClick={disconnectHandler}
          className="btn bg-indigo-800 hover:bg-indigo-600 active:bg-indigo-500"
        >
          {t("bluetooth.deviceScan.disconnect")}
        </button>
      </>
    );

  return (
    <>
      <p>{t("bluetooth.deviceScan.foundDeviceText")}</p>
      <div>
        <button
          onClick={scanCb}
          className="btn bg-indigo-800 hover:bg-indigo-600 active:bg-indigo-500"
        >
          {t("bluetooth.deviceScan.scan")}
        </button>
      </div>
    </>
  );
}

/* ---------- Device connection component ---------- */
type DeviceConnectionProps = {
  selectedDevice?: BluetoothDevice;
  wifi: string;
  wifiPassword: string;
  relayUrl: string;
};

export function DeviceConnection(props: DeviceConnectionProps) {
  const { selectedDevice, wifi, wifiPassword, relayUrl } = props;

  const [bluetoothGattServer, setBluetoothGattServer] = useState<
    BluetoothRemoteGATTServer | undefined
  >(undefined);

  useEffect(() => {
    let server: BluetoothRemoteGATTServer;
    if (selectedDevice?.gatt) {
      console.debug("Connecting server");
      selectedDevice.gatt
        .connect()
        .then((gattServer) => {
          console.debug("GATT connected", gattServer);
          setBluetoothGattServer(gattServer);
          server = gattServer;
        })
        .catch((err) => console.error("Erreur connexion bluetooth", err));

      return () => {
        if (server) {
          console.warn(" ... Disconnect GATT server ... ");
          setBluetoothGattServer(undefined);
          server.disconnect();
        }
      };
    }
  }, [selectedDevice]);

  if (!bluetoothGattServer) return <></>;

  return (
    <>
      <DeviceDetail server={bluetoothGattServer} />
      <SubmitConfiguration
        server={bluetoothGattServer}
        ssid={wifi}
        wifiPassword={wifiPassword}
        relayUrl={relayUrl}
      />
    </>
  );
}

/* ---------- Device detail component ---------- */
type DeviceDetailProps = {
  server: BluetoothRemoteGATTServer;
};

export function DeviceDetail(props: DeviceDetailProps) {
  const { server } = props;
  const workers = useMilleGrillesWorkers();

  const [listenersRegistered, setListenersRegistered] = useState(false);
  const [sharedSecret, setAuthSharedSecret] = useState<Uint8Array | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const mergeDeviceState = useBluetoothStore((state) => state.mergeDeviceState);
  const stateLoaded = useBluetoothStore((state) => state.stateLoaded);

  const refreshDevice = useCallback(() => {
    if (!server.connected) {
      console.warn("Connexion bluetooth coupee");
      return;
    }
    setRefreshing(true);
    chargerEtatAppareil(server)
      .then((etat) => {
        mergeDeviceState(etat);
      })
      .catch((err) => {
        console.info("Erreur chargement etat appareil ", err);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [server, mergeDeviceState]);

  const updateLecturesHandler = useCallback(
    (e: any) => {
      try {
        const valeur = e.target.value;
        const etatLectures = bleDecoderLectures(valeur);
        mergeDeviceState(etatLectures);
      } catch (err) {
        console.error("Erreur decodage lectures ", err);
      }
    },
    [mergeDeviceState],
  );

  const updateWifiHandler = useCallback(
    (e: any) => {
      try {
        const valeur = e.target.value;
        const etatWifi = bleDecoderWifi(valeur);
        mergeDeviceState(etatWifi);
      } catch (err) {
        console.error("Erreur decodage lectures ", err);
      }
    },
    [mergeDeviceState],
  );

  useEffect(() => {
    if (listenersRegistered) return;

    refreshDevice();
    const intervalRefresh = setInterval(refreshDevice, 7_500);
    return () => {
      if (intervalRefresh) clearInterval(intervalRefresh);
    };
  }, [refreshDevice, listenersRegistered]);

  useEffect(() => {
    if (server?.connected && stateLoaded) {
      const etatUuid = CONST_BLUETOOTH_SERVICES.services.etat.uuid;
      const lecturesUuid =
        CONST_BLUETOOTH_SERVICES.services.etat.characteristics.getLectures;
      const wifiUuid =
        CONST_BLUETOOTH_SERVICES.services.etat.characteristics.getWifi;
      bleAddEventListener(server, etatUuid, lecturesUuid, updateLecturesHandler)
        .then(() =>
          bleAddEventListener(server, etatUuid, wifiUuid, updateWifiHandler),
        )
        .then(() => setListenersRegistered(true))
        .catch((err) =>
          console.error("Erreur ajout listener sur lectures/wifi", err),
        );

      return () => {
        setListenersRegistered(false);
        bleRemoveEventListener(
          server,
          etatUuid,
          lecturesUuid,
          updateLecturesHandler,
        ).catch((err) =>
          console.error("Erreur retrait listener sur lectures", err),
        );
        bleRemoveEventListener(
          server,
          etatUuid,
          wifiUuid,
          updateWifiHandler,
        ).catch((err) =>
          console.error("Erreur retrait listener sur lectures", err),
        );
      };
    }
  }, [
    server,
    stateLoaded,
    updateLecturesHandler,
    updateWifiHandler,
    setListenersRegistered,
  ]);

  const authentifierHandler = useCallback(() => {
    if (!workers) throw new Error("Workers not initialized");
    if (!listenersRegistered || refreshing) return;

    setAuthSharedSecret(null);
    bleAuthentifier(workers, server)
      .then((result) => {
        if (result && result.sharedSecret) {
          setAuthSharedSecret(result.sharedSecret);
        } else {
          setAuthSharedSecret(null);
        }
      })
      .catch((err) => {
        console.error("Erreur BLE authentifier ", err);
        setAuthSharedSecret(null);
      });
  }, [workers, server, refreshing, listenersRegistered]);

  useEffect(() => {
    if (server && server.connected) authentifierHandler();
  }, [server, authentifierHandler]);

  return (
    <>
      <ShowDeviceState />
      <ShowDeviceReadings server={server} authSharedSecret={sharedSecret} />
      <hr />
      <RebootButton server={server} authSharedSecret={sharedSecret} />
    </>
  );
}

/* ---------- Device state display ---------- */
export function ShowDeviceState() {
  const deviceState = useBluetoothStore((state) => state.deviceState);
  if (!deviceState.userId) return <></>;

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-3">Idmg</div>
      <div className="col-span-9">{deviceState.idmg}</div>

      <div className="col-span-3">User id</div>
      <div className="col-span-9">{deviceState.userId}</div>

      <div className="col-span-3">WIFI</div>
      <div className="col-span-9">{deviceState.ssid}</div>

      <div className="col-span-3">Ip address</div>
      <div className="col-span-9">{deviceState.ip}</div>

      <div className="col-span-3">Subnet</div>
      <div className="col-span-9">{deviceState.subnet}</div>

      <div className="col-span-3">Gateway</div>
      <div className="col-span-9">{deviceState.gateway}</div>

      <div className="col-span-3">DNS</div>
      <div className="col-span-9">{deviceState.dns}</div>
    </div>
  );
}

/* ---------- Device readings display ---------- */
type DeviceReadingsProps = {
  server: BluetoothRemoteGATTServer;
  authSharedSecret: Uint8Array | null;
};

export function ShowDeviceReadings(props: DeviceReadingsProps) {
  const { t } = useTranslation();
  const { server, authSharedSecret } = props;

  const deviceState = useBluetoothStore((state) => state.deviceState);
  if (!deviceState?.userId) return <></>;

  return (
    <div>
      <p></p>

      <div>{t("bluetooth.showDeviceReadings.ntpSyncLabel")}</div>
      <div>{deviceState.ntp ? "Oui" : "Non"}</div>
      <div>{t("bluetooth.showDeviceReadings.timeLabel")}</div>
      <div>
        <Formatters.FormatterDate value={deviceState.time} />
      </div>
      <Temperature value={deviceState.temp1} label="Temperature 1" />
      <Temperature value={deviceState.temp2} label="Temperature 2" />
      <Humidity value={deviceState.hum} />
      {deviceState.switches ? (
        <>
          <SwitchBluetooth
            value={deviceState.switches[0]}
            idx={0}
            label="Switch 1"
            server={server}
            authSharedSecret={authSharedSecret}
          />
          <SwitchBluetooth
            value={deviceState.switches[1]}
            idx={1}
            label="Switch 2"
            server={server}
            authSharedSecret={authSharedSecret}
          />
          <SwitchBluetooth
            value={deviceState.switches[2]}
            idx={2}
            label="Switch 3"
            server={server}
            authSharedSecret={authSharedSecret}
          />
          <SwitchBluetooth
            value={deviceState.switches[3]}
            idx={3}
            label="Switch 4"
            server={server}
            authSharedSecret={authSharedSecret}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

/* ---------- Helper components ---------- */
type ReadingProps = { value?: number; label?: string };

export function Temperature(props: ReadingProps) {
  const { value, label } = props;

  if (!value) return <></>;

  return (
    <>
      <div>{label || "Temperature"}</div>
      <div>{value}&deg;C</div>
    </>
  );
}

export function Humidity(props: ReadingProps) {
  const { value, label } = props;

  if (!value) return <></>;

  return (
    <>
      <div>{label || "Humidity"}</div>
      <div>{value}%</div>
    </>
  );
}

type SwitchReadingProps = {
  value: SwitchState;
  label: string;
  server: BluetoothRemoteGATTServer;
  idx: number;
  authSharedSecret?: Uint8Array | null;
};

export function SwitchBluetooth(props: SwitchReadingProps) {
  const { t } = useTranslation();
  const { value, label, idx, server, authSharedSecret } = props;

  const workers = useMilleGrillesWorkers();

  const commandeSwitchCb = useCallback(
    (e: any) => {
      if (!workers) throw new Error("Workers not initialized");
      if (!authSharedSecret) throw new Error("Not authorized to toggle switch");
      const { name, value } = e.currentTarget;
      const idx = Number.parseInt(name);
      const valeur = value === "1";
      const commande = { commande: "setSwitchValue", idx, valeur };
      transmettreDictChiffre(workers, server, authSharedSecret, commande)
        .then(() => {
          console.debug("Commande switch transmise");
        })
        .catch((err) => console.error("Erreur switch BLE : ", err));
    },
    [workers, server, authSharedSecret],
  );

  if (!value.present) return <></>;

  return (
    <>
      <div>{label || "Switch"}</div>
      <div>
        {value.valeur
          ? t("bluetooth.switchBluetooth.on")
          : t("bluetooth.switchBluetooth.off")}
      </div>
      <div>
        <button
          name={"" + idx}
          value="1"
          onClick={commandeSwitchCb}
          disabled={!authSharedSecret}
          className="btn inline-block text-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500"
        >
          {t("bluetooth.switchBluetooth.on")}
        </button>
        <button
          name={"" + idx}
          value="0"
          onClick={commandeSwitchCb}
          disabled={!authSharedSecret}
          className="btn inline-block text-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500"
        >
          {t("bluetooth.switchBluetooth.off")}
        </button>
      </div>
    </>
  );
}

/* ---------- Configuration submission ---------- */
type SubmitConfigurationProps = {
  server: BluetoothRemoteGATTServer;
  ssid: string;
  wifiPassword: string;
  relayUrl: string;
};

export function SubmitConfiguration(props: SubmitConfigurationProps) {
  const { t } = useTranslation();
  const { server, ssid, wifiPassword, relayUrl } = props;

  const workers = useMilleGrillesWorkers();

  const idmg = useConnectionStore((state) => state.idmg);

  const [userId, setUserId] = useState("");
  useEffect(() => {
    workers?.connection
      .getMessageFactoryCertificate()
      .then((certificate) => {
        const userId = certificate.extensions?.userId;
        if (userId) setUserId(userId);
      })
      .catch((err) =>
        console.error("Error loading userId from certificate", err),
      );
  }, [workers]);

  const submitConfigurationServer = useCallback(
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();

      if (!idmg) throw new Error("IDMG missing");

      bleSubmitConfiguration(server, relayUrl, idmg, userId)
        .then(() => {
          console.debug("Params configuration envoyes");
        })
        .catch((err) => {
          console.error("Erreur sauvegarde parametres serveur", err);
        });
    },
    [server, idmg, userId, relayUrl],
  );

  const submitWifi = useCallback(
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();

      bleSubmitWifi(server, ssid, wifiPassword)
        .then(() => {})
        .catch((err) => {
          console.error("Erreur submit wifi ", err);
        });
    },
    [server, ssid, wifiPassword],
  );

  return (
    <div>
      <br />
      <p>{t("bluetooth.submitConfiguration.description")}</p>
      <button
        onClick={submitWifi}
        disabled={!ssid || !wifiPassword}
        className="btn inline-block text-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500"
      >
        {t("bluetooth.submitConfiguration.changeWifi")}
      </button>
      <button
        onClick={submitConfigurationServer}
        disabled={!relayUrl}
        className="btn inline-block text-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500"
      >
        {t("bluetooth.submitConfiguration.configureServer")}
      </button>
      <p></p>
    </div>
  );
}

/* ---------- Reboot button ---------- */
type RebootButtonProps = {
  server: BluetoothRemoteGATTServer;
  authSharedSecret: Uint8Array | null;
};

export function RebootButton(props: RebootButtonProps) {
  const { t } = useTranslation();
  const { server, authSharedSecret } = props;

  const workers = useMilleGrillesWorkers();

  const rebootCb = useCallback(() => {
    if (!workers) throw new Error("Workers not initialized");
    if (!authSharedSecret) throw new Error("Not authenticated");

    const command = { commande: "reboot" };
    transmettreDictChiffre(workers, server, authSharedSecret, command)
      .then(() => {
        console.debug("Reboot command transmitted");
      })
      .catch((err) => console.error("Erreur reboot ", err));
  }, [workers, server, authSharedSecret]);

  return (
    <button
      onClick={rebootCb}
      disabled={!authSharedSecret}
      className="btn inline-block text-center bg-red-700 hover:bg-red-600 active:bg-red-500"
    >
      {t("bluetooth.rebootButton")}
    </button>
  );
}
