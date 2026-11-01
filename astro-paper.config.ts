import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // GitHub Pages (リポジトリページ)。base は astro.config.ts 側で設定する
    url: "https://siro53.github.io/portfolio/",
    title: "siro53's Blog",
    description: "siro53 の個人ブログ",
    author: "siro53",
    profile: "https://github.com/siro53",
    ogImage: "default-og.jpg",
    lang: "ja",
    timezone: "Asia/Tokyo",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 5,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/siro53", linkTitle: "GitHub" },
    { name: "x", url: "https://x.com/shiro537", linkTitle: "X" },
  ],
  shareLinks: [
    {
      name: "x",
      url: "https://x.com/intent/post?url=",
      linkTitle: "X でシェア",
    },
  ],
});
