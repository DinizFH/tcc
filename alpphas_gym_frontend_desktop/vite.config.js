import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // IMPORTANTE

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // DEFINE O ALIAS "@"
    },
  },
  server: {
    port: 5173,
    host: true,                // opcional (acesso em rede local)
    open: false,               // 🚫 não abre mais o navegador sozinho
    fs: {
      strict: true
    },
    // 🔥 aqui o fallback que resolve o refresh nas rotas
    historyApiFallback: true
  }
})
