// Builds a single self-contained HTML file of the app in demo mode,
// for trying it out without any setup.
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  resolve: { alias: [{ find: /^\.\/firebaseStore\.js$/, replacement: fileURLToPath(new URL('./src/demo/firebaseStub.js', import.meta.url)) }] },
  build: { outDir: 'dist-demo', assetsInlineLimit: 100000000 },
});
