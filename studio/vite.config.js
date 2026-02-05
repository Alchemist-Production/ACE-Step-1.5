import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/v1': 'http://localhost:7860',
      '/release_task': 'http://localhost:7860',
      '/query_result': 'http://localhost:7860',
      '/create_random_sample': 'http://localhost:7860',
      '/format_input': 'http://localhost:7860'
    }
  }
})
