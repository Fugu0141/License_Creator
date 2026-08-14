# License Creator

ソフトウェアからイラスト・音楽・3Dモデル・ゲームまで、配布する作品に合うライセンスを選び、見やすい文書として書き出すためのGitHub Pages向けツールです。

ライセンス名を知っている人は直接選択でき、よく分からない場合は作品の種類と希望条件に答えることで候補を提案します。

## Features

### 質問から選ぶ

- ソースコード
- イラスト・画像
- 3Dモデル
- 音楽・音声
- 動画
- 文章・文書
- ゲーム・複合作品
- その他の創作物

ソフトウェアでは、派生物にどこまでソース公開・同一条件を求めるかなどから候補を提案します。

創作物では、再配布、クレジット、商用利用、改変、ShareAlikeの希望からCreative Commons系の候補を提案します。

ゲームなどの複合作品では、**ソースコードと創作素材に別々の条件を設定**し、1つのMulti-License Noticeとして出力できます。

### 直接選択

Software:

- MIT
- Apache-2.0
- GPL-3.0
- AGPL-3.0
- LGPL-3.0
- BSD 2-Clause / 3-Clause
- MPL-2.0
- Unlicense

Creative works:

- CC BY 4.0
- CC BY-SA 4.0
- CC BY-ND 4.0
- CC BY-NC 4.0
- CC BY-NC-SA 4.0
- CC BY-NC-ND 4.0
- CC0 1.0
- All Rights Reserved（一般ライセンスを付与しない場合）

Creative Commonsの6ライセンスはすべてクレジット表示（BY）を含みます。CC0はライセンスではなく、可能な範囲で権利を放棄するためのPublic Domain Dedicationです。

Creative Commonsはソフトウェア本体へのCCライセンス適用を推奨していないため、License Creatorでもソフトウェアにはソフトウェア専用ライセンスを提案します。ゲームの画像・音楽・ドキュメントなど、コードとは分離できる創作要素にはCCを選択できます。

## Export

現在は4形式に対応しています。

- `LICENSE`（拡張子なし）
- `LICENSE.txt`
- `LICENSE.pdf`
- `LICENSE.docx`（Microsoft Word）

ソフトウェアライセンスではGitHub License APIから取得した標準本文を使用し、テンプレート化された年・著作者名だけを補完します。

Creative Commonsではライセンス本文を独自に改変・複製するのではなく、作品名・作者名・選択したライセンス名・Creative Commons公式URLを含む適用通知を生成します。

## GitHub Pages

このリポジトリは静的ファイルだけで構成され、ビルドは不要です。

1. GitHubのリポジトリで **Settings** を開く
2. **Pages** を開く
3. **Build and deployment** の Source を `Deploy from a branch` にする
4. Branch を `main`、Folder を `/ (root)` にする
5. Save

## Local preview

```bash
python3 -m http.server 8000
```

その後 `http://localhost:8000` を開いてください。

## How it works

- ソフトウェアライセンス: GitHub License API (`api.github.com/licenses`)
- Creative Commons: License Creator内のメタデータとCreative Commons公式ライセンスURL
- PDF: jsPDF 4.2.1
- DOCX: docx 9.7.1

PDFはCanvasにテキストを描画してから書き出すため、日本語の作品名・著作者名でも文字化けしにくい方式です。

## Design policy

- MIT / Apache / GPLなどの標準ライセンス本文に独自条件を混ぜない
- CCライセンスを「改造」して独自ライセンスとして扱わない
- ソフトウェア本体には原則としてソフトウェア向けライセンスを案内する
- 複合作品では適用範囲を分離して文書化する
- 第三者製素材のライセンスを上書きしない

## Notes

- このツールは選択を補助するもので、法的助言を提供するものではありません。
- ライセンスを適用できる権利を自分が保有しているか確認してください。
- Creative CommonsのライセンスやCC0は、一度適用して相手がその条件で作品を受領した後に単純に取り消せるものではありません。適用前に公式情報を確認してください。
- GitHub License APIのレート制限や通信障害時はソフトウェアライセンス本文を取得できないことがあります。
- PDF / DOCXの生成にはCDNへの接続が必要です。

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE).
