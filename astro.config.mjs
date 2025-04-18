import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import compression from 'vite-plugin-compression';  // Thêm plugin nén

// https://astro.build/config
export default defineConfig({
  site: 'https://lifennew.com', // ✅ URL chính thức để SEO, sitemap
  output: 'server', // Bắt buộc nếu bạn muốn dùng Node adapter để deploy server
  adapter: node({
    mode: "standalone", // deploy không cần middleware ngoài
  }),
  integrations: [
    tailwind(),
    sitemap(),
  ],
  compressHTML: true,
  server: {
    port: 3000, // hoặc cổng bạn muốn
    host: true,
  },
  vite: {
    plugins: [
      compression({
        verbose: true,    // Ghi log quá trình nén
        disable: false,   // Tắt hoặc bật nén
        threshold: 10240, // Chỉ nén các tệp có kích thước lớn hơn 10KB
      }),
    ],
  },
});
