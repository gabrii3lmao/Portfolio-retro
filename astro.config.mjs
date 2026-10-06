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
  integrations: [
    icon(),
    sitemap({
      // Emits `xhtml:link hreflang` alternates for every localized page.
      i18n: {
        defaultLocale: "pt",
        locales: {
          pt: "pt-BR",
          en: "en-US",
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: "pt",
    locales: ["pt", "en"],
    routing: {
      // Portuguese keeps its original URLs (`/blog`, `/projects`), English
      // lives under the `/en` prefix.
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
