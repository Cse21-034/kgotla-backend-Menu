import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './public'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});