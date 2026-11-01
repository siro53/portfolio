# AGENTS.md

AI コーディングエージェント向けのプロジェクト指針です。人間向けの概要は [README.md](./README.md) を参照してください。

## プロジェクト概要

- Astro 7 + TypeScript（strict）製のブログテーマ **AstroPaper v7** をベースにした個人ブログ
- スタイリングは Tailwind CSS v4（`@tailwindcss/vite`）と `@tailwindcss/typography`
- GitHub Pages（`https://siro53.github.io/portfolio/`）で公開。base パスは `/portfolio`。配信元は `gh-pages` ブランチで、GitHub Actions がビルド結果を push する（詳細は「デプロイと PR プレビュー」）
- パッケージマネージャは **pnpm**（npm / yarn は使わない）
- Node.js は 22.23.4 以上が必須（`.nvmrc` 参照）。nvm 利用時は作業前に `nvm use` を実行する

## コマンド

| コマンド            | 内容                                                              |
| :------------------ | :---------------------------------------------------------------- |
| `pnpm install`      | 依存関係のインストール                                            |
| `pnpm dev`          | 開発サーバー起動（`http://localhost:4321/portfolio/`）            |
| `pnpm build`        | `astro check` → `astro build` → Pagefind インデックス生成         |
| `pnpm check`        | Astro / TypeScript の型チェックのみ                               |
| `pnpm lint`         | ESLint                                                            |
| `pnpm format`       | Prettier で整形（`pnpm format:check` は確認のみ）                 |

変更後は必ず `pnpm build` を実行し、成功することを確認してください（型チェックを含みます）。

## 開発サーバー

開発サーバーを起動するときはバックグラウンドモードを使用します。

```
astro dev --background
```

バックグラウンドのサーバーは `astro dev stop`、`astro dev status`、`astro dev logs` で操作します。

## 守るべきルール

### 内部リンクには base パスを付ける

このサイトは `base: "/portfolio"` 付きで配信されます。`href="/posts"` のようにルート絶対パスを直接書くと GitHub Pages 上でリンク切れになります。

- ページへのリンクは `astro:i18n` の `getRelativeLocaleUrl(locale, "posts")` を使う（テーマ内の既存コードと同じ方法）
- 静的ファイル（`rss.xml`、`favicon.svg` など）へのパスは `src/utils/withBase.ts` の `getAssetPath("rss.xml")` を使う
- 現在のパスと比較するときは `stripBase()` で base を取り除いてから比較する

### 記事（コンテンツ）の扱い

- 記事は `src/content/posts/` に **MDX（`.mdx`）** で置く。`.md` は読み込まれない（`content.config.ts` の glob パターンが `**/[^_]*.mdx` のため）
- 先頭が `_` のファイル・ディレクトリは記事として読み込まれない
- frontmatter のスキーマは `src/content.config.ts` で定義されている。項目を追加・変更する場合はスキーマも更新する
- 必須項目: `title`、`description`、`pubDatetime`（Date 型なので `2026-11-01T12:00:00+09:00` のように引用符なしで書く）
- 任意項目: `modDatetime`、`tags`、`featured`、`draft`、`ogImage`、`canonicalURL`、`timezone`
- 記事の取得は `getCollection("posts")` と `src/utils/getSortedPosts.ts` を使う（下書きと未来日の記事を除外してくれる）
- 記事は原則日本語で書く
- 数式は TeX 記法（`$...$` でインライン、`$$` 行で囲んでブロック）で書ける。`remark-math` と `rehype-katex` を `astro.config.ts` の Markdown プロセッサに登録し、KaTeX の CSS は `src/layouts/Layout.astro` で読み込んでいる。`katex` は `rehype-katex` に合わせて 0.16 系に固定しているので、安易にメジャーバージョンを上げない

### 日本語対応

- サイトの言語は `astro-paper.config.ts` の `site.lang: "ja"` と `astro.config.ts` の `i18n.locales: ["ja"]` で設定している。両方を揃えること
- 画面に表示する UI 文言は `src/i18n/lang/ja.ts` にある。文言を追加する場合は `src/i18n/types.ts` の型と `en.ts` にも同じキーを追加する
- 日付は `src/components/Datetime.astro` で `YYYY年M月D日` 形式にしている
- 動的 OG 画像（`src/pages/og.png.ts`、`src/pages/posts/[...slug]/index.png.ts`）は日本語描画のため Noto Sans JP を使う。フォントは `astro.config.ts` の `fonts` で定義している

### 設定ファイル

- サイト名・説明・著者・SNS リンク・機能の ON/OFF は `astro-paper.config.ts` で管理する。`src/config.ts` は直接編集しない
- `astro.config.ts` の `PRODUCTION_BASE` と `astro-paper.config.ts` の `site.url` はリポジトリ名に合わせている。リポジトリ名を変えない限り変更しない。`base` と `site` は環境変数 `PREVIEW_BASE_PATH` があればそれを使い、無ければ本番値になる（PR プレビュー用。下記参照）
- SNS アイコンは `src/assets/icons/socials/` の SVG ファイル名と `socials[].name` を一致させる
- About ページはこのサイトでは使わないため削除済み（`src/pages/about.astro` と `pages` コレクションは存在しない）
- `.github/workflows/deploy.yml`（本番）と `.github/workflows/preview.yml`（PR プレビュー）は `.nvmrc` と `package.json` の `packageManager` から Node / pnpm のバージョンを読む。バージョンを変える場合はその 2 ファイルを更新する

### デプロイと PR プレビュー

- GitHub Pages は **`gh-pages` ブランチ**（Settings → Pages → Deploy from a branch）から配信する。`gh-pages` は GitHub Actions が書き込む専用ブランチなので、手で編集・コミットしない
- `main` への push で `deploy.yml` が `pnpm build` の結果を `gh-pages` の直下に配置する。このとき `pr-preview/` は `clean-exclude` で残し、`force: false` で rebase する。この 2 つの設定を外すと進行中の PR プレビューが消える
- PR（同一リポジトリのブランチから）を開く・更新すると `preview.yml` が `PREVIEW_BASE_PATH=/portfolio/pr-preview/pr-<番号>` を付けてビルドし、`gh-pages` の `pr-preview/pr-<番号>/` に配置して PR にプレビュー URL をコメントする。PR を閉じるとプレビューは削除される
- `PREVIEW_BASE_PATH` の値は `rossjrw/pr-preview-action` の配置先（`umbrella-dir` / `pr-<番号>`）と一致していなければならない。片方を変えるときは必ずもう片方も変える
- プレビューのビルドでは `src/layouts/Layout.astro` が `<meta name="robots" content="noindex, nofollow">` を出力する。`PREVIEW_BASE_PATH` は `astro.config.ts` の `env.schema` に登録してあり、`astro:env/server` から読む
- `public/.nojekyll` はブランチ配信時に GitHub Pages の Jekyll 処理を止めるためのファイル。これが無いと `_astro/` 配下が配信されない。削除しない
- ローカルでプレビューと同じ条件のビルドを確認するには `PREVIEW_BASE_PATH=/portfolio/pr-preview/pr-0 pnpm build` を実行する

### スタイリング（Tailwind CSS v4）

- 設定ファイルは無く、`src/styles/global.css` がエントリポイント。配色トークンは `src/styles/theme.css`、記事本文の装飾は `src/styles/typography.css`
- 新しいスタイルは原則 Tailwind のユーティリティクラスで書く。色は `text-foreground`、`bg-background`、`text-accent`、`border-border`、`text-muted-foreground` などテーマのトークンを使う
- ダークモードは `[data-theme=dark]` 属性で切り替わる。`dark:` バリアントが使える

### コードスタイル

- Prettier（`.prettierrc`）と ESLint（`eslint.config.js`）の設定に従う。インデントはスペース 2 つ、ダブルクォート
- コミット前に `pnpm format` と `pnpm lint` を通す
- 依存関係の追加は `pnpm add`（devDependencies は `pnpm add -D`）で行い、`pnpm-lock.yaml` も併せてコミットする。`pnpm-workspace.yaml` があるためワークスペースルート警告が出るが、`.npmrc` の `ignore-workspace-root-check=true` で抑止している

## ディレクトリ構成

```text
├── .github/workflows/deploy.yml   本番デプロイ（main → gh-pages 直下）
├── .github/workflows/preview.yml  PR プレビュー（PR → gh-pages の pr-preview/pr-<番号>/）
├── astro-paper.config.ts          テーマ設定（サイト名、SNS、機能フラグ）
├── astro.config.ts                Astro 設定（base、i18n、フォント、Markdown プラグイン）
├── public/                        静的ファイル（favicon、デフォルト OG 画像、.nojekyll）
├── src/
│   ├── assets/icons/              UI / SNS アイコン（SVG）
│   ├── components/                共通コンポーネント
│   ├── content/posts/             ブログ記事（MDX）
│   ├── i18n/                      UI 文言（lang/ja.ts、lang/en.ts）
│   ├── layouts/                   Layout.astro、PostLayout.astro
│   ├── pages/                     ルーティング（posts、tags、archives、search、rss、og）
│   ├── styles/                    global.css、theme.css、typography.css
│   ├── utils/                     記事取得・URL 生成・base 処理などのヘルパー
│   ├── config.ts                  astro-paper.config.ts にデフォルトを適用した内部設定
│   └── content.config.ts          記事 frontmatter のスキーマ
└── copy-pagefind.mjs              検索インデックスを public/ にコピーするビルド後処理
```

## ドキュメント

- AstroPaper: https://github.com/satnaing/astro-paper#readme
- Astro 公式ドキュメント: https://docs.astro.build

関連する作業の前に以下のガイドを参照してください。

- [ページ・動的ルート・ミドルウェアの追加](https://docs.astro.build/en/guides/routing/)
- [Astro コンポーネントの書き方](https://docs.astro.build/en/basics/astro-components/)
- [コンテンツ（Content Collections）の追加・管理](https://docs.astro.build/en/guides/content-collections/)
- [スタイリングと Tailwind の利用](https://docs.astro.build/en/guides/styling/)
- [多言語対応（i18n）](https://docs.astro.build/en/guides/internationalization/)
- [GitHub Pages へのデプロイ](https://docs.astro.build/en/guides/deploy/github/)
