import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['newsday.feji.io', 'www.newsday.feji.io']
  }
});
