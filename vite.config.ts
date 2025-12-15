import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/millesens/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: { port: 5273, allowedHosts: true },
  build: { ssr: false },
});
