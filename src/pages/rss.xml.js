import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getConfigurationCollection } from "../lib/utils";

export async function GET(context) {
  const { data: config } = await getConfigurationCollection();
  const posts = await getCollection("blog");

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
