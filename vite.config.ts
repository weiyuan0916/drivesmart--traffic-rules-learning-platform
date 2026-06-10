import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/listening': {
          target: 'http://localhost:3002',
          changeOrigin: true,
        },
        '/api': {
          target: env.VITE_API_URL || 'http://vinalisten.test',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'three-core': ['three'],
            'react-three': ['@react-three/fiber', '@react-three/drei'],
            'postprocessing': ['@react-three/postprocessing', 'postprocessing'],
            'gsap': ['gsap'],
            'motion': ['motion'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      globals: true,
      include: ['src/**/*.test.{ts,tsx}'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
