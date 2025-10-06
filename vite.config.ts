import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig({
  base: '/kanban/',
  plugins: [react()],
  server: {
    port: 8080,
    host: true
  }
});
