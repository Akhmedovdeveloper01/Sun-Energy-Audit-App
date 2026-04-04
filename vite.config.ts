import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  define: {
    'process.env': {}
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Ngrok uchun maxsus sozlama
  server: {
    host: true,
    // allowedHosts ni bu tarzda yozamiz
    allowedHosts: true,
  } as any,   // ← bu qator muhim

  preview: {
    allowedHosts: true,
  } as any,
})