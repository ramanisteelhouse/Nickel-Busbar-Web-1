import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          /**
           * Split the libraries that never change away from the app code that changes weekly.
           *
           * Everything used to land in one ~613 kB entry chunk, so publishing a blog post or
           * editing a sentence produced a new hash for the whole thing and every returning
           * visitor re-downloaded React, the router and the animation library along with it.
           * These three groups are stable across deploys, so splitting them means a content
           * change invalidates only the small app chunk.
           *
           * Grouped rather than one-chunk-per-package: react-dom without react is useless, and
           * a dozen tiny chunks cost more in requests than they save in cache hits.
           */
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor-react';
            if (/[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/.test(id)) return 'vendor-router';
            if (/[\\/]node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/.test(id)) return 'vendor-motion';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
