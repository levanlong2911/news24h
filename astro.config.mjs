import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import compression from 'vite-plugin-compression'; 

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PUBLIC_API_WEB,
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  experimental: {
    session: true,
  },
  integrations: [
    tailwind(),
    sitemap(),
  ],
  compressHTML: true,
  server: {
    port: 3000, 
    host: true,
  },
  vite: {
    plugins: [
      compression({
        verbose: true,    
        disable: false,   
        threshold: 10240, 
      }),
    ],
  },
});
