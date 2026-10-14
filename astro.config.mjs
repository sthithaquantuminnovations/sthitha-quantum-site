import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sthithaquantum.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/blog') })],
  // Whitespace between inline elements matters for the word-by-word reveals.
  compressHTML: false,
});
