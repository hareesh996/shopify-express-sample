import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve as pathResolve, resolve } from 'path';


// https://vite.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: pathResolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        CustomerWidget: resolve(__dirname, 'src', 'CustomerWidget', 'index.html'),
      },
      output: {
         dir: pathResolve(__dirname, 'dist'),
         assetFileNames: '[name]-assets.js',
         chunkFileNames: '[name]-chunks.js',
         entryFileNames: '[name]-index.js',
      }
    }
  }
})

