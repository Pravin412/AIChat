import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
  },
  // Prebundle lazy CommonJS dependencies so first-use optimization cannot reset a chat.
  optimizeDeps: {
    include: [
      'react-markdown',
      'remark-gfm',
      'prismjs',
      'prismjs/components/prism-json.js',
      'prismjs/components/prism-typescript.js',
    ],
  },
});
