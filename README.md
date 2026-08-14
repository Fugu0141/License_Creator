# License Creator

GitHub Pagesだけで動かせる、標準オープンソースライセンスの作成・確認ツールです。

長いライセンス本文をいきなり読むのではなく、GitHub License APIが提供する **許可 / 条件 / 制限** を先に見やすく表示し、その下で正式な全文を確認できます。

## Features

- MIT / Apache-2.0 / GPL-3.0 / AGPL-3.0 / LGPL-3.0 / BSD / MPL-2.0 / Unlicense に対応
- 著作者名と年のテンプレート部分を自動置換
- 標準ライセンス本文のプレビュー
- 許可・条件・制限のサマリー表示
- 4形式でエクスポート
  - `LICENSE`（拡張子なし・GitHub向け）
  - `LICENSE.txt`
  - `LICENSE.pdf`
  - `LICENSE.docx`（Microsoft Word）
- 全文コピー
- レスポンシブ対応
- ライト / ダークモード対応
- ビルド不要

## GitHub Pages

このリポジトリは静的ファイルだけで構成されています。

1. GitHubのリポジトリで **Settings** を開く
2. **Pages** を開く
3. **Build and deployment** の Source を `Deploy from a branch` にする
4. Branch を `main`、Folder を `/ (root)` にする
5. Save

これだけで公開できます。

## Local preview

`file://` で直接開くより、簡単なHTTPサーバー経由で確認するのがおすすめです。

```bash
python3 -m http.server 8000
```

その後 `http://localhost:8000` を開いてください。

## How it works

ライセンス本文とサマリー情報は、ブラウザから GitHub License API (`api.github.com/licenses`) を取得します。取得したデータはページを開いている間だけメモリにキャッシュします。

PDF生成には **jsPDF 4.2.1**、DOCX生成には **docx 9.7.1** を使用し、どちらもブラウザからCDN経由で読み込みます。PDFはCanvasに本文を描画してから書き出すため、日本語の著作者名でも文字化けしにくい方式です。

## Design policy

MIT、Apache、GPLなどの標準ライセンス本文に独自の禁止事項を混ぜることはしません。現在のバージョンでは、GitHubが提供する標準ライセンスを利用し、テンプレート化されている年・著作者名だけを補完します。

独自ライセンス作成機能は今後別機能として追加する想定です。

## Notes

- このツールはライセンス選択を補助するもので、法的助言を提供するものではありません。
- GitHub License APIのレート制限や通信障害時はライセンス本文を取得できないことがあります。
- PDF / DOCXの生成にはCDNへの接続が必要です。

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE).
