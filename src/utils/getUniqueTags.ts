import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";
import { slugifyStr } from "./slugify";

type Tag = {
  tag: string;
  tagName: string;
  count: number;
};

/**
 * Builds a de-duplicated, sorted tag list from posts.
 *
 * - Drafts and scheduled posts are excluded via `postFilter()`
 * - `tag` is the slug used in URLs; `tagName` is the original label for display
 * - `count` is the number of posts that carry the tag (each post counted once)
 * - Uniqueness is based on the slug (so differently-cased labels collapse)
 */
export function getUniqueTags(posts: CollectionEntry<"posts">[]) {
  const tagMap = new Map<string, Tag>();

  for (const post of posts.filter(postFilter)) {
    const seen = new Set<string>();
    for (const tagName of post.data.tags) {
      const tag = slugifyStr(tagName);
      if (seen.has(tag)) continue;
      seen.add(tag);

      const entry = tagMap.get(tag);
      if (entry) {
        entry.count += 1;
      } else {
        tagMap.set(tag, { tag, tagName, count: 1 });
      }
    }
  }

  return [...tagMap.values()].sort((tagA, tagB) =>
    tagA.tag.localeCompare(tagB.tag)
  );
}
