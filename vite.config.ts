import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Return development config with proxy
    return {
      plugins: [react()],
      base: '/',
      server: {
        proxy: {
          '/api': 'http://localhost:3000',
        }
      }
    }
  } else {
    // Return production config without proxy
    return {
      plugins: [react()],
      base: '/',
    }
  }
})
