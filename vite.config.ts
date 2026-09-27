import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // GEMINI_API_KEY is intentionally NOT exposed to the client bundle here.
  // It's read server-side only, in server/index.ts.
  loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // The API server (server/index.ts) runs separately in dev; this
        // forwards /api requests to it so the browser only ever talks to
        // one origin.
        '/api': 'http://localhost:8787',
      },
    },
  };
});
