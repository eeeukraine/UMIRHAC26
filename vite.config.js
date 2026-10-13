import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'



export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Change this to your desired host
    port: 3000, // Change this to your desired port number
  },
})