import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const env = loadEnv('', rootDir, '');

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@drivesmart/shared': path.resolve(rootDir, 'packages/shared'),
    },
  },
  build: {
    outDir: path.resolve(rootDir, 'dist-tablet'),
    emptyOutDir: true,
  },
  server: {
    port: 3002,
    strictPort: true,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});