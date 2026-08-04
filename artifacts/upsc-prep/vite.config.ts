import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { cartographer } from "@replit/vite-plugin-cartographer";

export default defineConfig({
  plugins: [react(), tailwindcss(), cartographer()],
  define: {
    // Firebase's web API key is a client-side identifier. Keep its source in
    // Replit Secrets while exposing it to the browser bundle as Firebase expects.
    "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
      process.env.GOOGLE_API_KEY ?? "",
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});