import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub repo name for GitHub Pages project sites:
// https://<user>.github.io/<repo>/
export default defineConfig({
  base: '/land-acquisition-delay-predictor/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
