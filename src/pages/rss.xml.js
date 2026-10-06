import rss from "@astrojs/rss";
import { getConfigurationCollection, getLocalizedEntries } from "../lib/utils";

export async function GET(context) {
  const { data: config } = await getConfigurationCollection();
  // The feed stays in the default language: every entry appears once, even
  // when an English translation exists.
  const posts = await getLocalizedEntries("blog", "pt");

  return rss({
    title: `${config.personal.name} — Blog`,
    description: config.blogMeta.description,
    site: context.site ?? config.site.baseUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.timestamp,
      description: post.data.description,
      link: `/blog/${post.data.slug}/`,
    })),
  });
}
