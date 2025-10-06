import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const fallbackBasePath = "/kanban/";

const normalizeBasePath = (basePath?: string | null) => {
  if (!basePath) return undefined;

  const trimmed = basePath.trim();
  if (!trimmed) return undefined;
  if (trimmed === "./") return "./";

  let normalized = trimmed;
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (!normalized.endsWith("/")) {
    normalized = `${normalized}/`;
  }

  return normalized;
};

export default defineConfig(({ mode }) => {
  const basePath =
    mode === "production"
      ? normalizeBasePath(process.env.VITE_BASE_PATH) ?? fallbackBasePath
      : "/";

  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
