import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import path from 'path';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    resolve: {
      alias: {
        // Intercept imports to use the correct files during build
        '@apiMapping-json': isBuild
          ? path.resolve(__dirname, 'app/workers/apiMapping.signed.json')
          : path.resolve(__dirname, 'app/workers/apiMapping.json'),
        '@manifest-build-json': isBuild 
          ? path.resolve(__dirname, 'build_assets/manifest.build.json')
          : path.resolve(__dirname, 'src/manifest.build.json'),
      },
    },
    base: "/millesens/",
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    define: {
      __APP_VERSION__: JSON.stringify("0.0.0-placeholder"),
      __APP_BUILD_DATE__: JSON.stringify("placeholder-date"),
    },
    server: { port: 5273, allowedHosts: true },
    build: { ssr: false },
  };

});
