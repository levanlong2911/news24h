import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "https://news24h-pvi6.vercel.app/",
  integrations: [preact()]
});