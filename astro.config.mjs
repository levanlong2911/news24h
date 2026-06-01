import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

export default defineConfig({
  site: process.env.PUBLIC_API_WEB || 'http://localhost:3000/',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    sitemap(),
  ],
  compressHTML: true,
  server: {
    port: 3000,
    host: true,
  },
});
