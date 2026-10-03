import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Configuração inline: impede o Vite de procurar um postcss.config em pastas acima de /frontend.
  // Este projeto usa CSS puro e não precisa de Tailwind/PostCSS.
  css: { postcss: { plugins: [] } },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
