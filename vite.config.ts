import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
