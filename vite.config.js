import { defineConfig } from 'vite';

export default defineConfig({
  base: '/hedgehog-game/',
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'vite.config.js',
        '*.config.js'
      ]
    }
  }
});

