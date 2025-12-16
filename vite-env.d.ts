/// <reference types="vite/client" />

/**
 * Vite injected constants
 *
 * These constants are injected by Vite during build time via the `define`
 * option in `vite.config.ts`. They are available in the global scope
 * and can be used in your TypeScript source without importing.
 *
 * Example usage:
 * ```tsx
 * <span>{__APP_VERSION__}</span>
 * ```
 */
declare const __APP_VERSION__: string;
