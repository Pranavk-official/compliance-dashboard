import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: '/compliance-dashboard/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit to 600kb (from default 500kb)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom'],
          // Chart library (typically large)
          'recharts': ['recharts'],
          // Excel processing library
          'xlsx': ['xlsx', 'file-saver'],
          // Radix UI components
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
  },
})
