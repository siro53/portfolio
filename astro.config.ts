import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { rehypeTableWrapper } from "./src/utils/rehypeTableWrapper";
import config from "./astro-paper.config";

// 本番の base パス。GitHub Pages のリポジトリ名に合わせる（リポジトリ名を変えたら
// ここと astro-paper.config.ts の url を変更する）
const PRODUCTION_BASE = "/portfolio";

// PR プレビュー用。.github/workflows/preview.yml が
// PREVIEW_BASE_PATH="/portfolio/pr-preview/pr-<番号>" を渡すと、その配下で動くように
// base と site を差し替えてビルドする。未指定（通常のビルド・本番）なら本番設定になる
const previewBasePath = process.env.PREVIEW_BASE_PATH?.replace(/\/+$/, "");
const base = previewBasePath || PRODUCTION_BASE;
const site = new URL(`${base}/`, config.site.url).href;

export default defineConfig({
  site,
  base,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["ja"],
    defaultLocale: "ja",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkMath,
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts, rehypeKatex, rehypeTableWrapper],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
    {
      // 動的 OG 画像 (satori) で日本語を描画するためのフォント
      name: "Noto Sans JP",
      cssVariable: "--font-noto-sans-jp",
      provider: fontProviders.google(),
      fallbacks: ["sans-serif"],
      weights: [400, 700],
      styles: ["normal"],
      formats: ["ttf", "woff"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      // PR プレビューのビルドかどうかの判定に使う（Layout.astro で noindex を付ける）
      PREVIEW_BASE_PATH: envField.string({
        access: "public",
        context: "server",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
