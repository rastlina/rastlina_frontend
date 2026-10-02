import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react(), {
    name: 'test-hero-module',
    resolveId(id) { if (id === 'virtual:rastlina-hero') return '\0test-hero'; },
    load(id) { if (id === '\0test-hero') return 'export default [];'; },
  }],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
