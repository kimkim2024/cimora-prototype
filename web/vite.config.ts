import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // the design tokens and self-hosted fonts live one level up, in the repo root
    fs: { allow: ['..'] },
  },
  build: { outDir: 'dist', sourcemap: false },
});
