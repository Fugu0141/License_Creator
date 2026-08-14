# License Studio

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
- 上部: タイトル / 作者 / 作品名 / 更新日 / イラスト
- 中央: 許可 / 要相談 / 禁止 の3カラム
- 下部: クレジット / 追加禁止 / 補足 / 問い合わせ
- デフォルトのキャラクターイラストを同梱
- ユーザー画像への差し替え対応
- Blue / Mint / Lavender / Warm テーマ

## ファイル構成

```text
.
├── index.html
├── style.css
├── app.js
├── presets.js
├── assets.js
├── README.md
└── LICENSE
```

## GitHub Pages

`main` ブランチの `/ (root)` をGitHub Pagesで公開すれば、そのまま動作します。ビルド工程はありません。

## 注意

このツールは利用条件を分かりやすく伝えるための作成補助ツールです。カスタム規約は法的助言ではありません。Creative CommonsやOSSの標準ライセンスについては、PDFより公式のライセンス本文が優先されます。
