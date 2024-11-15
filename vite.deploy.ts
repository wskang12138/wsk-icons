import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteLegacyPlugin from "@vitejs/plugin-legacy"

export default defineConfig({
  server: {
    port: 4000
  },
  plugins: [
    react(),
    viteLegacyPlugin({
      renderModernChunks: false,
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 确保包含 polyfill
    })
  ],
  base: './',
  build: {
    outDir: 'docs'
  }
})
