import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    outDir: '.test-dist',
    target: 'node22',
    lib: { entry: 'tests/storage.test.ts', formats: ['es'], fileName: () => 'storage.test.js' },
    rolldownOptions: { external: ['node:test', 'node:assert/strict'] },
    minify: false,
  },
});
