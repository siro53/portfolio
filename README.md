# portfolio

[Astro](https://astro.build) 製のブログテーマ [AstroPaper](https://github.com/satnaing/astro-paper) をベースにした個人ブログです。GitHub Pages で公開しています。

- 公開 URL: https://siro53.github.io/portfolio/
- フレームワーク: Astro 7（TypeScript strict）
- テーマ: AstroPaper v7（Tailwind CSS v4）
- パッケージマネージャ: pnpm
- 記事形式: MDX
- 機能: ライト/ダークモード、全文検索（Pagefind）、タグ、アーカイブ、RSS、サイトマップ、動的 OG 画像、TeX 数式（KaTeX）

## 必要環境

- Node.js 22.23.4 以上（`.nvmrc` にバージョンを記載しています）
- pnpm 10

nvm を使っている場合は、リポジトリ直下で次を実行するとバージョンが切り替わります。

```sh
nvm use
```

## セットアップ

```sh
pnpm install
```

## コマンド

すべてリポジトリ直下で実行します。

| コマンド       | 内容                                                             |
| :------------- | :--------------------------------------------------------------- |
| `pnpm dev`     | 開発サーバーを起動します（`http://localhost:4321/portfolio/`）   |
| `pnpm build`   | 型チェック、静的ビルド、検索インデックス生成をまとめて実行します |
| `pnpm preview` | ビルド結果をローカルで確認します                                 |
| `pnpm check`   | Astro ファイルと TypeScript の型チェックのみ行います             |
| `pnpm lint`    | ESLint を実行します                                              |
| `pnpm format`  | Prettier でコードを整形します（`format:check` は確認のみ）       |

`pnpm build` は `astro check && astro build && pagefind --site dist && node copy-pagefind.mjs` を順に実行します。検索機能（Pagefind）のインデックスはビルド時に生成されるため、開発サーバーで検索を試す場合は先に一度 `pnpm build` を実行してください。

## 記事の書き方

`src/content/posts/` に MDX（`.mdx`）ファイルを置くと、ファイル名が URL（`/posts/<ファイル名>/`）になります。サブディレクトリに置くとそのディレクトリ名も URL に含まれます。先頭が `_` のファイルやディレクトリは無視されます。

先頭の frontmatter には次の項目を指定します（スキーマは `src/content.config.ts` で定義）。

```mdx
---
title: "記事タイトル"
description: "記事の概要（一覧や OGP に使われます）"
pubDatetime: 2026-11-01T12:00:00+09:00
modDatetime: 2026-11-02T12:00:00+09:00 # 任意。更新日
tags: ["astro", "メモ"] # 任意。省略時は "others"
featured: false # 任意。true でトップの「注目の記事」に表示
draft: false # 任意。true で非公開
ogImage: "../../assets/images/example.png" # 任意。省略時は自動生成
---

import Datetime from "@/components/Datetime.astro";

## 見出し

本文をここに書きます。通常の Markdown 記法に加えて、Astro コンポーネントを import して使えます。
```

- `pubDatetime` が未来の日付の記事は、その日になるまで一覧に表示されません。
- OG 画像を省略すると、タイトルから自動生成されます（日本語フォントは Noto Sans JP）。
- `## Table of contents` という見出しを書くと、その位置に目次が自動挿入されます。
- コードブロックは言語名を付けると Shiki でシンタックスハイライトされます（ライト: min-light、ダーク: night-owl）。`file=` でファイル名ラベル、`// [!code highlight]` や `// [!code ++]` / `// [!code --]` で行の強調や差分表示ができます。

````mdx
```ts file=src/example.ts
const a = 1;
const b = a + 1; // [!code highlight]
const c = b; // [!code ++]
```
````

- 数式は TeX 記法で書けます（remark-math + rehype-katex）。インラインは `$E = mc^2$`、ブロックは `$$` で囲んだ行で記述します。

```mdx
インライン数式: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

## ディレクトリ構成

```text
├── .github/workflows/deploy.yml   GitHub Pages へのデプロイ用ワークフロー
├── astro-paper.config.ts          サイト名・著者・SNS リンクなどテーマの設定
├── astro.config.ts                Astro の設定（base、i18n、フォント、Markdown プラグイン）
├── public/                        そのまま配信する静的ファイル（favicon、デフォルト OG 画像）
├── src/
│   ├── assets/icons/              UI アイコンと SNS アイコン（SVG）
│   ├── components/                共通コンポーネント
│   ├── content/posts/             ブログ記事（MDX）
│   ├── i18n/lang/ja.ts            画面に表示する UI 文言（日本語）
│   ├── layouts/                   ページと記事のレイアウト
│   ├── pages/                     ルーティング（ファイル名が URL になる）
│   ├── styles/                    Tailwind の読み込み、カラーテーマ、記事本文の装飾
│   ├── utils/                     記事の取得・並び替え・URL 生成などのヘルパー
│   └── content.config.ts          記事 frontmatter のスキーマ
├── copy-pagefind.mjs              ビルド後に検索インデックスを public/ にコピーするスクリプト
└── package.json
```

## サイト設定

- サイト名、説明文、著者名、SNS リンクは `astro-paper.config.ts` で変更します。
- `astro.config.ts` の `base` と `astro-paper.config.ts` の `site.url` はリポジトリ名（`portfolio`）に合わせています。リポジトリ名を変更した場合は両方を合わせて変更してください。
- 内部リンクを自分で書く場合は、`astro:i18n` の `getRelativeLocaleUrl(locale, "posts")` か `src/utils/withBase.ts` の `getAssetPath()` を使うと base パスが自動で付きます。
- 配色は `src/styles/theme.css` で変更できます。AstroPaper には複数の配色プリセットがあり、[公式ドキュメント](https://github.com/satnaing/astro-paper#readme)で確認できます。

## デプロイ

`main` ブランチに push すると、GitHub Actions（`.github/workflows/deploy.yml`）がビルドして GitHub Pages に自動でデプロイします。

初回のみ、GitHub リポジトリの **Settings → Pages** で Source を **GitHub Actions** に設定してください。

## クレジット

テーマは [AstroPaper](https://github.com/satnaing/astro-paper)（MIT License）をベースにしています。ライセンス全文は `LICENSE` を参照してください。
