// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://latinuspro.com',
  adapter: cloudflare(),
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});