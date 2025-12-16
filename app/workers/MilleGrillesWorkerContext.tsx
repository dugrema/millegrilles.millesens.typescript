import React, { createContext, useContext, useEffect, useState } from "react";
import * as Comlink from "comlink";
import { certificates } from "millegrilles.cryptography";

import type { AppsConnectionWorker } from "./connection.worker";
import {
  userStoreIdb,
  type CommonTypes,
  type ConnectionCallbackParameters,
} from "millegrilles.reactdeps.typescript";
import type { LoadFicheResult } from "~/state/connectionStore";
import { useConnectionStore } from "~/state/connectionStore";
import { useSyncWhenReady } from "~/hooks/useSyncWhenReady";

const SOCKETIO_PATH = "/millegrilles/socket.io";

export type AppWorkers = { connection: Comlink.Remote<AppsConnectionWorker> };

type MilleGrillesContextType = {
  workers: AppWorkers | null;
};

/**
 * The worker exported from `connection.worker.ts` exposes an instance of
 * `AppsConnectionWorker` via `Comlink.expose`.  The proxy type returned by
 * `Comlink.wrap` implements the same public API, so we can store it in a
 * context and expose it to any component that needs to talk to the worker.
 */
const MilleGrillesWorkerContext = createContext<MilleGrillesContextType | null>(
  null,
);

/**
 * Provider that instantiates the worker once when the component tree mounts,
 * exposes a Comlink proxy, and cleans up when the component unmounts.
 *
 * The worker file is in the same directory as this context file, so the
 * worker script can be loaded with a relative URL resolved by Vite.
 */
export const MilleGrillesWorkerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    connected,
    authenticated,
    username,
    setConnected,
    setAuthenticated,
    setFiche,
    setIdmg,
    setUserId,
    setUsername,
  } = useConnectionStore();
  const [authenticating, setAuthenticating] = useState(false);
  const [workers, setWorkers] = useState(null as AppWorkers | null);

  useEffect(() => {
    /* ----------------------------------------------------------------- */
    /* 1️⃣  Callback that the worker will call back to the main thread     */
    /* ----------------------------------------------------------------- */
    const setConnectionCallbackParams = (
      params: ConnectionCallbackParameters,
    ) => {
      // Example: update some local state or trigger a UI refresh
      // You can also forward the params to other contexts or services
      console.log("[Worker] callback received:", params);
      setConnected(params.connected);
      setAuthenticated(params.authenticated ?? false);
      setIdmg(params.idmg ?? "");
      setUserId(params.userId ?? "");
      if (params.username) setUsername(params.username ?? "");
    };
    const setConnectionProxy = Comlink.proxy(setConnectionCallbackParams);

    var workerInstances = null as Worker[] | null;
    initializeWorkers(setConnectionProxy)
      .then((result) => {
        // Triggers a refresh of consuming states on initial loading.
        setUsername(result.username || "");
        setWorkers(result.workers);
        setFiche(result.fiche);
        workerInstances = result.instances;
      })
      .catch((err) => {
        console.error("Error initializing proxy", err);
      });

    // Cleanup on unmount.
    return () => {
      setWorkers(null);
      if (workerInstances) {
        workerInstances.forEach((worker) => worker.terminate());
      }
    };
  }, []);

  useEffect(() => {
    if (workers && username && connected && !authenticated) {
      // Prevent quick loop
      setAuthenticating(true);
      setTimeout(() => setAuthenticating(false), 5_000); // retry every 5 seconds

      // Authenticate
      console.debug("Authenticating");
      authenticateConnectionWorker(workers, username, true, false)
        .then((result) => {
          console.debug("Authenticated ", result);
        })
        .catch((err) => console.error("Authentication error: ", err));
    }
  }, [workers, username, connected, authenticating, authenticated]);

  return (
    <MilleGrillesWorkerContext.Provider value={{ workers }}>
      {children}
    </MilleGrillesWorkerContext.Provider>
  );
};

/**
 * Hook for accessing the worker proxy.  It throws if called outside of
 * `MilleGrillesWorkerProvider`.
 */
export const useMilleGrillesWorkers = (): AppWorkers | null => {
  const context = useContext(MilleGrillesWorkerContext);
  if (!context) {
    throw new Error(
      "useMilleGrillesWorker must be used within a MilleGrillesWorkerProvider",
    );
  }
  return context.workers;
};

async function loadFiche(): Promise<LoadFicheResult> {
  const ficheResponse = await fetch("/fiche.json");
  if (ficheResponse.status !== 200) {
    throw new Error(
      `Loading fiche.json, invalid response (${ficheResponse.status})`,
    );
  }
  const fiche = await ficheResponse.json();

  const content = JSON.parse(fiche["contenu"]);
  const { idmg, ca, chiffrage } = content;

  // Verify IDMG with CA
  const idmgVerif = await certificates.getIdmg(ca);
  if (idmgVerif !== idmg) throw new Error("Mismatch IDMG/CA certificate");

  console.info("IDMG: ", idmg);

  // Verify the signature.
  const store = new certificates.CertificateStore(ca);
  let result: certificates.CertificateWrapper | boolean = false;
  try {
    result = await store.verifyMessage(fiche);
  } catch (error) {
    console.error("error verifying message", error);
    throw error;
  }
  if (!result)
    throw new Error("While loading fiche.json: signature was rejected."); // Throws Error if invalid

  // Return the content
  return { idmg, ca, chiffrage };
}

export type InitWorkersResult = {
  username: string | null;
  fiche: LoadFicheResult;
  workers: AppWorkers;
  instances: Worker[];
};

export async function initializeWorkers(
  setConnectionCallbackParams: (params: ConnectionCallbackParameters) => void,
): Promise<InitWorkersResult> {
  const fiche = await loadFiche();

  const username = await verifyAuthentication();
  console.debug("Username %s", username);
  if (!username) {
    throw new Error("User is not authenticated");
  }

  // Create a new worker instance.
  const connectionWorker = new Worker(
    new URL("./connection.worker.ts", import.meta.url),
    { type: "module" },
  );

  // Wrap the worker with Comlink to obtain a proxy that can be used like a
  // normal object in the main thread.
  const connectionWrapper =
    Comlink.wrap<Comlink.Remote<AppsConnectionWorker>>(connectionWorker);

  // Set-up the workers
  const serverUrl = new URL(window.location.href);
  serverUrl.pathname = SOCKETIO_PATH;
  console.info("Connect to server url ", serverUrl.href);

  const setConnectionProxy = Comlink.proxy(setConnectionCallbackParams);
  const response = await connectionWrapper.initialize(
    serverUrl.href,
    fiche.ca,
    setConnectionProxy,
    { reconnectionDelay: 7500 },
  );

  if (response) {
    console.debug("Connection initialized %s, connecting", response);
    await connectionWrapper.connect();
  } else {
    throw new Error("Error initializing workers");
  }

  const workers = {
    connection: connectionWrapper,
  };

  return { username, fiche, workers, instances: [connectionWorker] };
}

export async function verifyAuthentication() {
  const response = await fetch("/auth/verifier_usager");
  // console.debug("Response authentication", response);
  const userStatus = response.status;
  const username = response.headers.get("x-user-name");
  if (userStatus === 200 && username) {
    // console.debug("User %s is propertly authenticated", username);
    return username;
  } else {
    console.warn("User is not propertly authenticated");
    return null;
  }
}

/**
 * Connect using socket-io.
 * @param workers
 * @param username
 * @param userSessionActive
 * @param reconnect
 * @returns
 */
export async function authenticateConnectionWorker(
  workers: AppWorkers,
  username: string,
  userSessionActive: boolean,
  reconnect?: boolean,
): Promise<CommonTypes.PerformLoginResult> {
  if (!workers) return {}; // Waiting for a connection
  if (reconnect !== false) reconnect = true;

  if (!userSessionActive || !username) {
    // User session is not active. We need to manually authenticate.
    // setMustManuallyAuthenticate(true);
    return { mustManuallyAuthenticate: true };
  }

  // There is a user session (cookie) and a username in the server session.
  // Check if we have a valid signing key/certificate for this user.
  const userDbInfo = await userStoreIdb.getUser(username);
  if (!userDbInfo) {
    // No local information (certificate).
    return { mustManuallyAuthenticate: true };
  }

  const certificateInfo = userDbInfo.certificate;
  if (!certificateInfo) {
    // No certificate. The user must authenticate manually.
    return { mustManuallyAuthenticate: true };
  }

  const wrapper = new certificates.CertificateWrapper(
    certificateInfo.certificate,
  );

  // Check if the certificate is expired
  const expiration = wrapper.certificate.notAfter;
  const now = new Date();
  if (now > expiration) {
    throw new Error("User certificate is expired");
  }

  // Initialize the message factory with the user's information.
  const { privateKey, certificate } = certificateInfo;
  await workers.connection.prepareMessageFactory(privateKey, certificate);

  // Authenticate the connection
  if (!(await workers.connection.authenticate(reconnect)))
    throw new Error("Authentication failed (api mapping)");

  return { authenticated: true };
}
