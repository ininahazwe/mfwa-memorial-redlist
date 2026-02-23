import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'antd': [
            'antd',
            '@refinedev/antd',
            '@refinedev/core',
          ],
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});