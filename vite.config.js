import { fileURLToPath, URL } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env.* files based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: "3000",
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: fileURLToPath(new URL("./src", import.meta.url)),
        },
        {
          find: "lib",
          replacement: resolve(__dirname, "lib"),
        },
      ],
    },
    define: {
      'process.env': {
        ...env, // Spread the loaded environment variables into process.env
      },
    },
  };
});
