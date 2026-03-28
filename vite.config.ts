import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Suppress unresolved import warnings and treat as errors only for real issues
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message?.includes('lovable')) return;
        warn(warning);
      }
    }
  }
});
