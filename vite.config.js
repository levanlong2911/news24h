import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['lifennew.com', 'www.lifennew.com']
  }
});
