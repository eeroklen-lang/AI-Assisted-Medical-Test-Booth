import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Resolve Figma-specific asset imports (figma:asset/<hash>.png)
    // to the actual files already present in src/assets/
    {
      name: 'figma-asset-resolver',
      resolveId(id: string) {
        if (id.startsWith('figma:asset/')) {
          const filename = id.replace('figma:asset/', '')
          return path.resolve(__dirname, `./src/assets/${filename}`)
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    allowedHosts: true,
    // Proxy all /api/* requests to the Express backend on port 3001
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
