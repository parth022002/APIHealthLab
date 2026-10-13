import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'node-builtins-stub',
      resolveId(id) {
        if (id === 'node:fs' || id === 'node:path') {
          return id;
        }
        return null;
      },
      load(id) {
        if (id === 'node:fs') {
          return 'export function existsSync() { return false; } export function lstatSync() { return {}; } export function readFileSync() { return ""; } export default {};';
        }
        if (id === 'node:path') {
          return 'export function resolve(...args) { return args.join("/"); } export default { resolve };';
        }
        return null;
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
