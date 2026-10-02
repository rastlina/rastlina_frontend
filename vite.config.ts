import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imageAssets } from './build/imageAssets';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    // ✅ ADD THIS
    allowedHosts: [
      "unmistaking-unsymbolic-jadiel.ngrok-free.dev",
      ".ngrok-free.dev", // optional but recommended for dev
    ],

    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    imageAssets(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
