import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

const BASE = "/simi-sb-events.shakespeare.wtf/";

export default defineConfig(() => ({
  base: BASE,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      base: BASE,
      includeAssets: ["icon.svg", "apple-touch-icon.png", "icon-180.png", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Simi Valley to Santa Barbara Events",
        short_name: "SV-SB Events",
        description: "Discover events from Simi Valley to Santa Barbara",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        orientation: "portrait-primary",
        icons: [
          { src: `${BASE}icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: `${BASE}icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: `${BASE}icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/calendar\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-calendar-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    onConsoleLog(log) { return !log.includes("React Router Future Flag Warning"); },
    env: { DEBUG_PRINT_LIMIT: "0" },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
