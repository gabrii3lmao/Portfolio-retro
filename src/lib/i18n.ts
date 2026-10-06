/**
 * Locale configuration and the UI string dictionary.
 *
 * Every hard-coded label that lives inside a component belongs here so that
 * both locales stay in sync. Content (SEO metadata, menu labels, section
 * titles) lives in `content/configuration.toml` instead — one table per locale.
 */

export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

/** Human readable tag for a locale, e.g. `pt-BR` / `en-US`. */
export const htmlLang: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
};

const pt = {
  menuLabel: "Menu de navegação",
  resume: "Currículo",
  resumeAria: "Abrir currículo",
  switchLanguage: "Mudar idioma para inglês",
  switchLanguageShort: "EN",
  technologies: "Tecnologias",
  website: "Site",
  minutes: "min",
  rights: "Todos os direitos reservados.",
  githubAria: "Perfil do GitHub de {name}",
  linkedinAria: "Perfil do LinkedIn de {name}",
  xAria: "Perfil do X de {name}",
  notFoundTitle: "Bem, isso é constrangedor",
  notFoundHeading: "404 - Página não encontrada",
  notFoundBeforeLink:
    "Parece que esta página não existe. Se quiser voltar à segurança, ",
  notFoundLink: "clique aqui para voltar ao início",
} as const;

type Dictionary = { [K in keyof typeof pt]: string };

const strings: Record<Locale, Dictionary> = {
  pt,
  en: {
    menuLabel: "Navigation menu",
    resume: "Resume",
    resumeAria: "Open resume",
    switchLanguage: "Switch language to Portuguese",
    switchLanguageShort: "PT",
    technologies: "Technologies",
    website: "Website",
    minutes: "min",
    rights: "All rights reserved.",
    githubAria: "{name}'s GitHub profile",
    linkedinAria: "{name}'s LinkedIn profile",
    xAria: "{name}'s X profile",
    notFoundTitle: "Well, this is embarrassing",
    notFoundHeading: "404 - Page not found",
    notFoundBeforeLink:
      "Looks like this page doesn't exist. If you want to get back to safety, ",
    notFoundLink: "click here to go back to the homepage",
  },
};

export type UiKey = keyof Dictionary;

/**
 * Resolves a UI string for the given locale.
 * Unknown locales and missing keys fall back to the default locale.
 *
 * @param locale the active locale
 * @param key the dictionary key
 * @param vars optional placeholders, e.g. `{ name: "Gabriel" }` for `"{name}'s GitHub profile"`
 */
export const t = (
  locale: Locale,
  key: UiKey,
  vars?: Record<string, string>,
): string => {
  const value = strings[locale]?.[key] ?? strings[defaultLocale][key];
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    vars[name] !== undefined ? vars[name] : match,
  );
};

/**
 * Returns the locale-independent path for the current URL.
 * `/en/blog/post` → `/blog/post`, `/blog/post` → `/blog/post`.
 */
export const stripLocalePrefix = (pathname: string, locale: Locale): string => {
  if (locale !== "en") return pathname;
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
};

/**
 * Builds the URL of `locale` for a locale-independent path.
 * `/` + `en` → `/en`, `/blog/post` + `en` → `/en/blog/post`.
 */
export const localizePath = (pathname: string, locale: Locale): string => {
  const base = pathname === "/" ? "" : pathname;
  return locale === "en" ? `/en${base}` : base === "" ? "/" : base;
};

const EXTERNAL_HREF = /^(https?:)?\/\/|^mailto:|^tel:|^#/;

/**
 * Resolves an internal link for the active locale.
 *
 * - external links, anchors and static assets (anything with a file
 *   extension, like `/favicon.svg` or `/resume.pdf`) are returned as-is;
 * - every other root-relative link is prefixed with `/en` when the active
 *   locale is English, so navigation, "view all" links and CTAs keep working
 *   on both locales without every caller having to think about it.
 */
export const resolveHref = (url: string, locale: Locale): string => {
  if (!url.startsWith("/") || EXTERNAL_HREF.test(url)) return url;
  if (locale !== "en" || url.startsWith("/en")) return url;

  const lastSegment = url.split("/").pop() ?? "";
  if (lastSegment.includes(".")) return url;

  return localizePath(url, locale);
};
