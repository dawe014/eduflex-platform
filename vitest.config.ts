import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use global APIs like `describe`, `it`, `expect`
    environment: "jsdom", // Simulate a browser environment
    setupFiles: "./src/lib/setupTests.ts", // A file to run before each test file
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // This allows using '@/' imports in tests
    },
  },
});
