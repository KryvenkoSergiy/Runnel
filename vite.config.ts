import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative URLs, so the same build works at a domain root and under GitHub Pages' /Runnel/.
  base: './',
  plugins: [react()],
})
