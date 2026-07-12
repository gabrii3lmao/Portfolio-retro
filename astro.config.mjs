// @ts-check

import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://gabrii3lportfolio.vercel.app",
  adapter: vercel(),
  integrations: [icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
