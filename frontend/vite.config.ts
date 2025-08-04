import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // supaya asset (png/js/css) di‐serve relatif ke HREF saat hosting
  plugins: [react()],
  resolve: {
    alias: {
      // kadang perlu alias ini supaya impor leaflet core JS konsisten
      leaflet$: "leaflet/dist/leaflet.js",
    },
  },
  build: {
    rollupOptions: {
      output: {
        // simpan file asset di folder assets agar path-nya predictable
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
  },
});
