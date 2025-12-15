# MilleGrilles API Reference

This document provides a quick reference to the public API exposed by the two custom dependencies that are part of the MilleSens project:

1. **`millegrilles_cryptography`** – Cryptographic utilities and message helpers for MilleGrilles.  
2. **`millegrilles.reactdeps.typescript`** – React‑specific types and state helpers for MilleGrilles.

---

## 1. `millegrilles_cryptography`

The package exports a namespace of modules that encapsulate common cryptographic operations used by the application. All modules re‑export their public functions and types, so consumers can import directly from the root of the package.

| Module | Exported Symbols | Description |
|--------|------------------|-------------|
| `certificates` | `parseX509Certificate`, `certificateToPem`, `certificateFromPem`, `verifySignature` | Functions for parsing, serializing and validating X.509 certificates. |
| `digest` | `sha256`, `sha512`, `digestBase64` | Helper functions that compute SHA‑2 digests and return results in hex or Base64. |
| `ed25519` | `generateKeyPair`, `sign`, `verify`, `publicKeyFromSecretKey` | Ed25519 key generation and signature primitives. |
| `encryptionMgs4` | `encryptMgs4`, `decryptMgs4` | MGS4 (MilleGrilles Secure) encryption and decryption helpers. |
| `encryption` | `encrypt`, `decrypt` | General symmetric encryption using AES‑GCM. |
| `keymaster` | `Keymaster`, `generateMasterKey`, `exportPrivateKey`, `importPrivateKey` | High‑level key‑master abstraction for managing multiple keys. |
| `messageStruct` | `Message`, `DeviceMessage`, `CommandMessage` | TypeScript interfaces that describe the shape of messages exchanged in the system. |
| `multiencoding` | `toBase64`, `fromBase64`, `toHex`, `fromHex`, `multibaseEncode`, `multibaseDecode` | Helpers for common base encodings (Base64, Base58, hex) and Multibase support. |
| `random` | `randomBytes`, `randomInt` | Random number generation utilities. |
| `x25519` | `diffieHellman`, `x25519KeyPair` | Diffie‑Hellman key agreement using the X25519 curve. |
| `forgeCsr` | `createCsr`, `parseCsr` | Functions for creating and parsing Certificate Signing Requests. |
| `forgePrivateKey` | `createPrivateKey`, `exportPrivateKey`, `importPrivateKey` | Utilities for handling private keys in PEM / DER formats. |

> **Tip**: Import the entire namespace for convenience:  
> ```ts
> import * as crypt from 'millegrilles_cryptography';
> ```

---

## 2. `millegrilles.reactdeps.typescript`

This package contains React‑specific utilities and state managers that simplify integration with MilleGrilles in a React/TypeScript environment.

| Module | Exported Symbols | Description |
|--------|------------------|-------------|
| `connectionV3` | `ConnectionV3`, `useConnection` | TypeScript interfaces and a custom hook for establishing and managing a V3 connection. |
| `userStoreIdb` | `userStore`, `useUserStore` | Zustand‑based IndexedDB store for persisting user data (e.g., tokens, preferences). |
| `CommonTypes` | `DeviceInfo`, `DeviceCommand`, `DeviceState` | Shared type definitions for device metadata and state. |
| `Formatters` | `formatDate`, `formatTime`, `formatSize` | Simple formatting helpers for dates, times, and byte sizes. |
| `ConditionalFormatters` | `conditionalFormat`, `useConditionalFormatter` | Utilities that apply formatting based on conditions, useful for rendering status badges. |

> **Tip**: The `userStoreIdb` can be used as a global state, e.g.:
> ```ts
> const user = useUserStore(state => state.user);
> ```

---

### How to Use

```ts
import * as crypto from 'millegrilles_cryptography';
import * as reactDeps from 'millegrilles.reactdeps.typescript';

// Example: Sign a message
const keyPair = crypto.ed25519.generateKeyPair();
const signature = crypto.ed25519.sign('Hello', keyPair.secretKey);
```

For detailed API docs, refer to the source files in each package or the generated TypeScript type definitions (`dist/index.d.ts`).