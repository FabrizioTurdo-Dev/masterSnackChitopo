import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  // El dev server tiene que poder servir shared/ (fuentes del CSS compartido).
  server: { port: 5174, fs: { allow: ['..'] } },
})
