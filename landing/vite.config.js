import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// Dos páginas, cada una con su propio <head> (título, OG, íconos) para que
// el link compartido por WhatsApp muestre la marca correcta:
//   /          → home de Master Snacks (index.html)
//   /chitopo/  → página de Chitopo (chitopo/index.html)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  // Sin esto, en dev /chitopo (sin barra) cae en silencio en la home.
  appType: 'mpa',
  // El dev server tiene que poder servir shared/ (fuentes del CSS compartido).
  server: { port: 5174, fs: { allow: ['..'] } },
  build: {
    rolldownOptions: {
      input: {
        home: r('./index.html'),
        chitopo: r('./chitopo/index.html'),
      },
    },
  },
})
