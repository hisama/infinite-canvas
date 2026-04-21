import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const analyze = process.env.ANALYZE === "true";

export default defineConfig({
  base: "./",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    analyze &&
      visualizer({
        open: true,
        filename: "dist/bundle-stats.html",
        gzipSize: true,
        brotliSize: true,
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
          // Three.js core in its own chunk — largest dependency
          three: ["three"],
          // React ecosystem together
          "react-vendor": ["react", "react-dom"],
          // R3F separately so it can be cached independently
          r3f: ["@react-three/fiber", "@react-three/drei"],
          // Fancybox lightbox
          fancybox: ["@fancyapps/ui"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
