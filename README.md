# License Creator

見ただけで分かる **1ページのライセンス / 利用条件PDF** を作るGitHub Pages向けWebアプリです。

## コンセプト

長い法文や重複した説明を並べるのではなく、利用者が最初に知りたいことを

- 許可
- 要相談
- 禁止

の3つに分けて、色・アイコン・短いラベルで表示します。

PDFはHTMLのスクリーンショットではなく、**CanvasへA4レイアウトを直接描画**してからjsPDFへ渡します。これにより、CSSレンダラー由来の文字崩れやレイアウト崩れを避けています。

## 対応モード

- カスタム規約
  - 商用利用
  - 収益化コンテンツ
  - 改変・加工
  - 作品への組み込み
  - グッズ・商品化
  - 素材の再配布
  - AI学習・生成AI利用
- Creative Commons
  - CC BY 4.0
  - CC BY-SA 4.0
  - CC BY-NC 4.0
  - CC BY-NC-SA 4.0
  - CC BY-ND 4.0
  - CC BY-NC-ND 4.0
  - CC0 1.0
- OSS
  - MIT
  - Apache-2.0
  - BSD-3-Clause
  - MPL-2.0
  - GPL-3.0

## PDFデザイン

- A4縦・1ページ
- 上部: タイトル / 作者 / 作品名 / 種類 / 更新日 / イラスト
- 中央: 許可 / 要相談 / 禁止 の3カラム
- 下部: クレジット / ライセンス情報 / 補足 / 問い合わせ
- ユーザー画像の読み込み・位置調整に対応
- Blue / Mint / Lavender / Warm テーマ

## 設計ドキュメント

- [アプリ構造・保守ドキュメント](docs/architecture.md) — 現在のファイル構成、state、イベント、PDF描画レイヤー、保存・復元、OGP、保守時の注意点
- [多言語対応 設計方針](docs/i18n-plan.md) — 日本語 / 英語 / 簡体字中国語 / 韓国語のエディタUI・PDF出力に関する実装計画

## ファイル構成

```text
.
├── index.html
├── style.css
├── download-cta.css
├── workflow-flow.css
├── image-editor.css
├── presets.js
├── app.js
├── enhancements.js
├── cc-official.js
├── design-v2.js
├── ui-fix.js
├── layout-v3.js
├── credit-copy-fix.js
├── oss-polish.js
├── custom-panel-auto.js
├── credit-tone.js
├── credit-strip-final.js
├── header-polish.js
├── page-balance.js
├── image-editor.js
├── public-defaults-ui.js
├── editor-restore-fix.js
├── images/
│   └── Top.png
├── docs/
│   ├── architecture.md
│   └── i18n-plan.md
├── README.md
└── LICENSE
```

各ファイルの役割や読み込み順については [`docs/architecture.md`](docs/architecture.md) を参照してください。

## GitHub Pages

`main` ブランチの `/ (root)` をGitHub Pagesで公開すれば、そのまま動作します。ビルド工程はありません。

公開URL:

`https://fugu0141.github.io/License_Creator/`

## 注意

このツールは利用条件を分かりやすく伝えるための作成補助ツールです。カスタム規約は法的助言ではありません。Creative CommonsやOSSの標準ライセンスについては、PDFより公式のライセンス本文が優先されます。
