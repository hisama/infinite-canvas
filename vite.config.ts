import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "."),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          "react-vendor": ["react", "react-dom"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
          fancybox: ["@fancyapps/ui"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
