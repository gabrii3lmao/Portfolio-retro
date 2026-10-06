import { type CollectionEntry, getCollection } from "astro:content";
import { defaultLocale, type Locale } from "./i18n";

/**
 * Shortens a string by removing words at the end until it fits within a certain length.
 * @param content the content to shorten
 * @param maxLength the maximum length of the shortened content (default is 20)
 * @returns a shortened version of the content
 */
export const getShortDescription = (content: string, maxLength = 20) => {
  const splitByWord = content.split(" ");
  const length = splitByWord.length;
  return length > maxLength
    ? `${splitByWord.slice(0, maxLength).join(" ")}...`
    : content;
};

/**
 * Processes the date of an article and returns a string representing the processed date.
 * The month name follows the active locale, the layout stays `MMM D, YYYY`.
 * @param timestamp the timestamp to process
 * @param locale the active locale
 * @returns a string representing the processed timestamp
 */
export const processArticleDate = (
  date: Date,
  locale: Locale = defaultLocale,
) => {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const monthSmall = date.toLocaleString(tag, { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${monthSmall} ${day}, ${year}`;
};

const configCache = new Map<Locale, CollectionEntry<"configuration">>();

/**
 * Retrieves the configuration entry for the given locale from the content directory.
 * The configuration file holds one table per locale, so entries are keyed by locale
 * (`pt`, `en`). Falls back to the default locale when a translation is missing.
 * Results are cached per locale to avoid repeated reads.
 * @param locale the active locale
 */
export const getConfigurationCollection = async (
  locale: Locale = defaultLocale,
): Promise<CollectionEntry<"configuration">> => {
  const cached = configCache.get(locale);
  if (cached) return cached;

  const configs = await getCollection("configuration");
  const entry =
    configs.find((candidate) => candidate.id === locale) ??
    configs.find((candidate) => candidate.id === defaultLocale);

  if (!entry) {
    throw new Error(
      `Configuration file not found for locale "${locale}" (or for the default locale).`,
    );
  }

  configCache.set(locale, entry);
  return entry;
};

/**
 * Returns the content entries (blog posts or projects) rendered for a locale.
 *
 * Every entry of the default locale is always present: when the requested
 * locale has no translation for a slug, the original entry is used as a
 * fallback instead of leaving a hole in the listing.
 *
 * @param collection the content collection to read
 * @param locale the active locale
 */
export const getLocalizedEntries = async <
  C extends "blog" | "project",
  L extends Locale = Locale,
>(
  collection: C,
  locale: L,
): Promise<CollectionEntry<C>[]> => {
  const all = await getCollection(collection);
  const base = all.filter((entry) => entry.data.locale === defaultLocale);

  if (locale === defaultLocale) return base;

  const translated = new Map(
    all
      .filter((entry) => entry.data.locale === locale)
      .map((entry) => [entry.data.slug, entry]),
  );

  return base.map((entry) => translated.get(entry.data.slug) ?? entry);
};
