

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      target: 'esnext'      
    },
    plugins: [react({
      jsxRuntime: 'classic'
    })],
  };
});