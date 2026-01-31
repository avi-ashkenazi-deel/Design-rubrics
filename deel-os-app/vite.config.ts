import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root base for Vercel, '/Design-rubrics/' for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/Design-rubrics/' : '/',
})
