# License Creator — アプリ構造・保守ドキュメント

> 対象: 現行の `main` ブランチ構成  
> 目的: License Creator の内部構造、データフロー、PDF描画、ファイル間の依存関係を把握し、安全に保守・拡張できるようにする。

---

## 1. アプリ概要

License Creator は、創作物の利用条件を **「許可 / 要相談 / 禁止」** の3分類で整理し、A4縦1ページのPDFとして出力する静的Webアプリである。

主な特徴:

- GitHub Pagesでそのまま配信できる
- ビルド工程なし
- フレームワークなし
- 状態はブラウザの `localStorage` に保存
- PDFはHTMLを画像化せず、Canvasへ直接描画
- CanvasをJPEG化し、jsPDFでA4 PDFへ格納
- カスタム規約 / Creative Commons / OSS の3モード
- 任意画像の読み込み、位置調整、ズーム、トリミングに対応
- OGP / X Card対応

外部ライブラリは、PDF生成に利用する **jsPDF** をCDNから読み込んでいる。

---

## 2. 全体構造

現在の実装は、`app.js` を基礎実装として、後から読み込まれる複数のJavaScriptファイルが関数を段階的に拡張・上書きする構造になっている。

概念的には次の形で動作する。

```text
index.html
   │
   ├─ presets.js
   │    └─ ライセンス / プリセット / 初期state定義
   │
   ├─ app.js
   │    ├─ state
   │    ├─ localStorage
   │    ├─ UI初期化
   │    ├─ 基本イベント
   │    ├─ Canvas描画の基礎実装
   │    └─ jsPDF書き出し
   │
   └─ 後続スクリプト群
        ├─ 状態互換・UI改善
        ├─ CC対応
        ├─ PDFデザイン刷新
        ├─ PDFレイアウト改善
        ├─ OSS専用表示
        ├─ クレジット表示
        ├─ 長文タイトル対応
        ├─ ページ上下バランス
        ├─ 画像編集モーダル
        └─ 最終UI同期
```

### 重要

**後続スクリプトの読み込み順そのものが現在のアプリ仕様の一部になっている。**

たとえば `drawPdf`、`drawHeader`、`drawStatusPanels`、`changed`、`renderResults` などは、複数ファイルで上書きまたはラップされる。

そのため、`index.html` の `<script>` を見た目だけで並び替えないこと。

---

## 3. 現在の読み込み順

`index.html` では次の順でJavaScriptを読み込む。

```text
1.  presets.js
2.  jsPDF (CDN)
3.  app.js
4.  enhancements.js
5.  cc-official.js
6.  design-v2.js
7.  ui-fix.js
8.  layout-v3.js
9.  credit-copy-fix.js
10. oss-polish.js
11. custom-panel-auto.js
12. credit-tone.js
13. credit-strip-final.js
14. header-polish.js
15. page-balance.js
16. image-editor.js
17. public-defaults-ui.js
18. editor-restore-fix.js
```

`app.js` 以降は `defer` で読み込まれ、HTML解析完了後に記述順で実行される。

この順序により、後のスクリプトほど「最終調整レイヤー」として強い。

---

## 4. ファイル構成

```text
.
├── index.html
├── style.css
├── download-cta.css
├── workflow-flow.css
├── image-editor.css
│
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
├── assets.js
│
├── images/
│   └── Top.png
│
├── docs/
│   ├── architecture.md
│   └── i18n-plan.md
│
├── README.md
└── LICENSE
```

### `assets.js` について

`assets.js` はリポジトリには残っているが、**現在の `index.html` からは読み込まれていない**。

過去のデフォルト画像等に由来するレガシー資産であり、現行ランタイムの必須ファイルではない。

削除する場合は、他ファイルから参照が復活していないことを確認してから行う。

---

## 5. 各ファイルの役割

### `index.html`

アプリのDOM構造とスクリプト読み込み順を定義する。

主なUI:

```text
Header
 └─ License Creator / 自動保存状態

Editor
 ├─ モード切替
 │   ├─ カスタム
 │   ├─ CC
 │   └─ OSS
 │
 ├─ 1. 作品
 ├─ 2. 使い方 / ライセンス
 ├─ 3. デザイン
 └─ PDFを書き出す

Preview
 └─ <canvas id="previewCanvas">
```

また、OGPとX Cardのメタタグもここで管理する。

現在のOGP画像:

```text
images/Top.png
1200 × 630
```

公開URL:

```text
https://fugu0141.github.io/License_Creator/images/Top.png
```

---

### `presets.js`

アプリの静的データを `window.LICENSE_DATA` として定義する。

含まれるデータ:

- 作品種類
- カスタム規約の7項目
- プリセット
- Creative Commonsライセンス一覧
- OSSライセンス一覧
- `defaultState`

UI表示名とは別に、内部では次のような安定したキーを使用している。

```text
commercial
monetized
modification
project
merchandise
redistribution
ai
```

この内部キーは、将来の多言語対応でも維持する。

---

### `app.js`

アプリの基礎となるコア実装。

主な責務:

- グローバル `state`
- DOM参照 `el`
- 初期化 `init()`
- `localStorage` 読み書き
- selectの選択肢生成
- カスタムポリシーUI生成
- 基本イベント登録
- UIとstateの同期
- Canvas描画の基礎実装
- 画像ロード
- PDF書き出し
- 共通描画ヘルパー

基本的な変更フロー:

```text
ユーザー操作
   ↓
state を変更
   ↓
changed()
   ├─ UI状態更新
   ├─ PDF再描画予約
   └─ localStorage保存
```

PDF再描画は `requestAnimationFrame` を利用してまとめて処理する。

```js
queueRender()
  → requestAnimationFrame(...)
  → drawPdf()
```

---

### `enhancements.js`

初期実装から追加された互換性・詳細表示レイヤー。

主な役割:

- 古い保存データから現在のAI利用設定への移行
- `loadState()` の補強
- DOM要素が存在しない場合でも安全なイベント処理
- 禁止事項をPDFの「禁止」カラムへ統合
- CC / OSSの文字列から意味を推定し、対応アイコンを割り当てる
- `getGroups()` の拡張

カスタムの細かい禁止事項:

```text
adult
political
nft
harmful
impersonation
```

は、ONの場合 `deny` グループへ追加される。

---

### `cc-official.js`

Creative Commonsモード専用レイヤー。

主な役割:

- CC公式バッジURL管理
- バッジ画像の非同期読み込み
- CORS対応Canvas用画像のフォールバック
- エディタ内CC結果カードへの公式バッジ表示
- PDF出力前にCCバッジの読み込みを待つ

画像取得は主に次の外部ソースを使用する。

- Creative Commons公式Press Kit
- Wikimedia Commons

バッジ取得に失敗しても、PDF側にはテキストベースのフォールバック表示がある。

---

### `design-v2.js`

現在のPDFデザインの基礎となる「Editorial」デザインレイヤー。

ここで旧PDFデザインを大きく置き換えている。

主な役割:

- 白・薄灰ベースのテーマ
- 許可 / 要相談 / 禁止の淡色パネル
- 日本語を考慮した文字折返し
- `Intl.Segmenter` による自然な行分割
- 文章のバランスを見た2行折返し
- PDF各セクションの基本描画

重要な共通関数:

```text
editorialTheme()
textSegments()
balancedTextLines()
drawBalancedText()
drawAdaptiveSentence()
drawCenteredPolicyLabel()
```

後続のPDFレイヤーもこれらを利用する。

---

### `ui-fix.js`

エディタUIの操作安定化レイヤー。

主な役割:

- `changed()` 後にクレジットボタンの見た目を再同期
- クレジット3択のイベント競合をcapture phaseで一本化
- 1 → 2 → 3 → PDF出力の流れを示す `▼` UIを追加
- `workflow-flow.css` を動的ロード

クレジット操作では既存の重複イベントを止めるため、次を使用している。

```js
e.stopPropagation();
e.stopImmediatePropagation();
```

このイベント処理を変更する場合は、`app.js` 側のイベントとの二重実行に注意する。

---

### `layout-v3.js`

現在のPDFレイアウト構造を決定する主要レイヤー。

主な役割:

- 3カラムの配置
- CCモードの高さ自動調整
- Creative Commons専用ライセンス帯
- クレジット専用帯
- NOTE / CONTACTの下部構成
- Contact未入力時の自動非表示
- License Creatorクレジットのフッター表示

下部はContactの有無によって変化する。

Contactあり:

```text
┌───────────────────┬─────────┐
│ NOTE              │ CONTACT │
└───────────────────┴─────────┘
```

Contactなし:

```text
┌─────────────────────────────┐
│ NOTE                        │
└─────────────────────────────┘
```

PDF最下部には次を表示する。

```text
Created with License Creator
https://fugu0141.github.io/License_Creator/
```

---

### `credit-copy-fix.js`

カスタム規約のクレジット文言を明示的にする。

状態:

```text
required    → クレジット表記が必要です
recommended → クレジット表記を推奨します
none        → クレジット表記は不要です
```

表記例が空欄の場合は次から自動生成する。

```text
© {年} {作者名} / {作品名}
```

作者・作品が未入力の場合は汎用プレースホルダーを利用する。

---

### `oss-polish.js`

OSSモード専用レイヤー。

主な役割:

- 正式ライセンス名表示
- SPDX ID表示
- OSS結果カード拡張
- OSS専用ライセンス帯
- OSSモードの3カラム高さ自動調整
- OSS用NOTE入力欄を動的追加
- `softwareNotes` の管理

例:

```text
MIT
→ MIT License
→ SPDX: MIT
```

`softwareNotes` は現時点では `presets.js` の `defaultState` に定義されず、OSSレイヤーで必要時に追加される拡張stateである。

---

### `custom-panel-auto.js`

カスタムモードの3カラム高さを内容量に合わせる。

ルール:

- 3カラムは必ず同じ高さ
- 最も項目数が多いカラムを基準にする
- 最小 270px
- 最大 620px
- 内容が少ない場合のみ縮小

これにより、空きスペースが過剰に残るのを防いでいる。

---

### `credit-tone.js`

クレジット重要度に応じて色と強調度を変更する。

優先度:

```text
必要 > 推奨 > 不要
```

表示差:

- 必要: 青系、強いサイドレール
- 推奨: 落ち着いたサンド系
- 不要: ほぼニュートラル
- OSS: ライセンス通知用途なので中立表示

---

### `credit-strip-final.js`

クレジット帯の最終描画レイヤー。

主な役割:

- `none` の場合にクレジット帯自体を消す
- CC0でもクレジット帯を消す
- OSSはLicense Noticeとして残す
- クレジット帯を消した場合、空白も残さず下部を詰める
- アイコン、本文、右端ステータスを縦中央で揃える

このファイルは `credit-tone.js` より後に読み込む必要がある。

---

### `header-polish.js`

PDFタイトルと説明文の長文対応。

タイトル処理の優先順位:

```text
1. 通常サイズで1行
2. 少しずつ縮小
3. 自然な位置で最大2行
4. さらに縮小
5. 最終フォールバック
```

`Intl.Segmenter`、空白、句読点などを利用し、1〜2文字だけ次行へ残るような不自然な改行を避ける。

説明文はタイトルが2行になった場合、自動的に下へ移動する。

---

### `page-balance.js`

PDF全体の縦方向バランスを調整する最終レイヤー。

現在:

```js
PDF_CONTENT_SHIFT_Y = 36
```

ヘッダー・メタ情報・3カラムを36px下へ移動する。

フッターは固定し、下側の余白を利用して紙面の重心を整える。

`drawStatusPanels()` が返す `bottom` も36px補正するため、後続セクションの位置計算は維持される。

---

### `image-editor.js`

画像読み込み時の編集モーダルを提供する。

フロー:

```text
画像を選択
   ↓
changeイベントをcapture phaseで取得
   ↓
編集モーダル
   ├─ ドラッグ移動
   ├─ ズーム 100〜300%
   ├─ ホイールズーム
   ├─ リセット
   ├─ キャンセル
   └─ 決定
   ↓
700 × 700 Canvasへ確定
   ↓
JPEG Data URL
   ↓
state.customImage
   ↓
PDF再描画 + localStorage保存
```

旧 `app.js` の即時画像読込より先に処理するため、画像inputの `change` をcapture phaseで取得している。

画像編集UIのCSSは `image-editor.css` を動的に読み込む。

ショートカット:

- `Esc` → キャンセル
- `Ctrl / Cmd + Enter` → 決定

---

### `public-defaults-ui.js`

公開版向けの中立な入力例を設定する。

例:

```text
作者: 例: 作者名 / サークル名
作品名: 例: 作品名
クレジット: 例: © 2026 作者名 / 作品名
```

これらは値ではなく `placeholder` なので、実際の作品情報として保存されない。

---

### `editor-restore-fix.js`

保存済みstateをエディタUIへ確実に復元する最終同期レイヤー。

主な役割:

- `syncControls()` を最終段階で再実行
- `softwareNotes` の復元
- プレースホルダー再設定
- プリセット / CC / OSS selectの最終changeハンドラ

対象select:

```text
#presetSelect
#ccLicenseSelect
#softwareLicenseSelect
```

これらはcapture phaseで処理し、古い重複changeハンドラによる競合を防いでいる。

---

## 6. state構造

中心となる状態はグローバル変数 `state` に保持する。

概略:

```js
state = {
  mode: 'custom' | 'cc' | 'software',

  title: '',
  creator: '',
  workName: '',
  workType: 'other',
  updatedAt: '',
  contact: '',

  theme: 'blue',
  accent: '#5b8def',
  customImage: '',

  preset: 'creator',
  policies: {
    commercial: 'allow' | 'ask' | 'deny',
    monetized: 'allow' | 'ask' | 'deny',
    modification: 'allow' | 'ask' | 'deny',
    project: 'allow' | 'ask' | 'deny',
    merchandise: 'allow' | 'ask' | 'deny',
    redistribution: 'allow' | 'ask' | 'deny',
    ai: 'allow' | 'ask' | 'deny'
  },

  credit: 'required' | 'recommended' | 'none',
  creditText: '',

  restrictions: {
    adult: false,
    political: false,
    nft: false,
    harmful: false,
    impersonation: false
  },

  notes: '',

  ccLicense: 'CC BY 4.0',

  softwareLicense: 'MIT',
  softwareScope: '',
  softwareNotes: '' // OSSレイヤーで追加
}
```

### state変更の原則

可能な限り次の順序を守る。

```text
stateを変更
→ sync系処理
→ queueRender()
→ saveState()
```

通常は `changed()` を呼べばよい。

---

## 7. 保存と復元

保存先:

```text
localStorage
```

キー:

```text
license-studio-simple-v1
```

アプリ名は現在 **License Creator** だが、保存キーは既存ユーザーとの互換性のため旧名称のまま維持している。

### 保存

`saveState()` で `JSON.stringify(state)` を保存する。

### 復元

基本:

```text
DATA.defaultState
   +
保存済みstate
```

をマージする。

さらに `policies` と `restrictions` はネストを個別マージし、古い保存データに新しい項目がない場合でも初期値を補完する。

### 注意

**STORAGE_KEYを安易に変更しないこと。**

変更すると、既存ユーザーの保存済み作業が突然復元されなくなる。

キーを変更する場合は明示的なマイグレーション処理を入れる。

---

## 8. UIイベント構造

基本イベントは `app.js` で設定するが、現在はいくつかのイベントを後続レイヤーがcapture phaseで先に処理している。

### capture phaseを利用する主要箇所

#### クレジット3択

`ui-fix.js`

```text
必須 / 推奨 / 不要
```

既存の重複クリックイベントを止め、1回だけstateを更新する。

#### プリセット / CC / OSS select

`editor-restore-fix.js`

選択された値を確実にstateへ反映してからPDF再描画する。

#### 画像input

`image-editor.js`

旧 `handleImage()` が即確定する前に画像を奪い、編集モーダルへ渡す。

### 保守上の注意

同じDOMに新しいイベントを追加する場合、既存コードが次を使用していないか確認する。

```js
capture: true
stopPropagation()
stopImmediatePropagation()
```

「イベントを追加したのに動かない」場合は、まずこの競合を疑う。

---

## 9. PDF生成フロー

PDFはHTML/CSSのスクリーンショットではない。

```text
state
  ↓
drawPdf()
  ↓
previewCanvas (1240 × 1754)
  ↓
canvas.toDataURL('image/jpeg')
  ↓
jsPDF
  ↓
A4縦 210 × 297 mm
  ↓
ダウンロード
```

基準Canvas:

```text
1240 × 1754 px
```

これはA4比率に近い縦長Canvasとして利用される。

### なぜCanvas直描画なのか

- html2canvas等のCSS解釈差を避ける
- unsupported color function等の問題を避ける
- PDFの見た目をブラウザ差から切り離す
- 1ページ固定レイアウトを制御しやすい

---

## 10. PDF描画の上書きチェーン

現在の保守で最も重要な部分。

### `drawPdf`

概略として次の順に実装が更新される。

```text
app.js
  ↓
design-v2.js
  ↓
layout-v3.js
  ↓
oss-polish.js
  ↓
credit-strip-final.js
```

最終的にはモードによって分岐する。

#### カスタム

```text
credit-strip-final.js の drawPdf
```

#### CC

```text
credit-strip-final.js の drawPdf
+ drawCcLicenseStrip()
```

#### OSS

```text
oss-polish.js が保持している専用 drawPdf
```

`credit-strip-final.js` はOSS時のみ前段のOSS描画へ委譲する。

### `drawStatusPanels`

```text
基礎
 ↓
layout-v3.js
 ↓
oss-polish.js
 ↓
custom-panel-auto.js
 ↓
page-balance.js
```

最終的には:

- custom → `custom-panel-auto.js` の自動高さ
- cc → `layout-v3.js` のCC向け高さ
- software → `oss-polish.js` のOSS向け高さ

を使用し、その結果全体を `page-balance.js` が36px下へ移動する。

### `drawHeader`

```text
app.js
 ↓
design-v2.js
 ↓
header-polish.js
 ↓
page-balance.js
```

つまり、タイトル処理を変更するときは `app.js` ではなく、通常 **`header-polish.js` が実質的な最終実装**になる。

---

## 11. モード別PDF構成

### カスタム

```text
Header
Meta
許可 / 要相談 / 禁止
Credit（必要・推奨の場合のみ）
NOTE / CONTACT
Footer
```

`credit = none` の場合、Credit帯を完全に省略する。

### Creative Commons

```text
Header
Meta
許可 / 要相談 / 禁止
Creative Commons License帯
Credit（CC0以外）
NOTE / CONTACT
Footer
```

CC0の場合はクレジット帯を省略する。

### OSS

```text
Header
Meta
許可 / 要相談 / 禁止
Open Source License帯
License Notice
NOTE / CONTACT
Footer
```

OSSのLicense Noticeはクレジット要否ではなく、ライセンス条件の注意欄として常に表示する。

---

## 12. 画像処理

### ユーザー画像

保存形式:

```text
Data URL
```

state:

```js
state.customImage
```

確定時は700×700 Canvasへトリミングし、JPEGへ変換する。

### PDF表示

PDF右上は正方形の画像領域。

編集画面も正方形なので、基本的に

```text
編集画面で見えている範囲
=
PDFに表示される範囲
```

になる。

---

## 13. CSS構成

### `style.css`

エディタ全体の基本スタイル。

- レイアウト
- カード
- フォーム
- mode tabs
- policy rows
- preview
- レスポンシブ

### `download-cta.css`

「PDFを書き出す」最終ボタン専用。

周囲の設定UIから分離し、ユーザーが最後に押す主要アクションとして強調する。

### `workflow-flow.css`

1 → 2 → 3 → PDF出力の間に表示する `▼` ガイド。

`ui-fix.js` が動的ロードする。

### `image-editor.css`

画像調整モーダル専用。

`image-editor.js` が動的ロードする。

---

## 14. OGP / SNS表示

OGP設定は `index.html` の `<head>` にある。

主なタグ:

```text
og:type
og:site_name
og:locale
og:title
og:description
og:url
og:image
og:image:secure_url
og:image:type
og:image:width
og:image:height
og:image:alt
```

X用:

```text
twitter:card = summary_large_image
twitter:title
twitter:description
twitter:image
twitter:image:alt
```

OGP画像:

```text
images/Top.png
1200 × 630
```

画像を置き換える場合は、ファイル名を維持すればHTML変更なしでも更新できる。ただしSNS側にOGPキャッシュが残ることがある。

---

## 15. 外部依存

### jsPDF

CDN:

```text
cdn.jsdelivr.net
```

PDF出力に必須。

jsPDFが読み込めない環境ではPDFダウンロードは動作しない。

### Creative Commons公式バッジ

CCモードで外部画像を取得する。

ネットワーク・CORS等で取得できない場合はPDF描画にフォールバックを持つ。

---

## 16. GitHub Pages

公開方法:

```text
Branch: main
Path: / (root)
```

ビルド工程はない。

つまり、基本的には `main` へPushした静的ファイルがそのまま公開される。

### 連続Pushについて

GitHub PagesのLegacy Buildでは、非常に短い間隔で連続Pushした場合に途中コミットのビルドが失敗・取りこぼされることがある。

公開直前は:

1. 最終コミットをPush
2. GitHub Pagesのbuild statusを確認
3. `built` になったことを確認

まで行うのが安全。

---

## 17. よくあるバグの原因

### 1. ボタンを押しても反応しない

確認順:

1. DOM IDが存在するか
2. `null.addEventListener` で初期化が止まっていないか
3. capture phaseのイベントに止められていないか
4. `stopImmediatePropagation()` がないか

### 2. stateは変わるが見た目が変わらない

確認:

```text
syncControls()
syncPolicyButtons()
syncSegment()
```

### 3. UIは変わるがPDFへ反映されない

確認:

```text
stateが更新されているか
changed() が呼ばれているか
queueRender() が動いているか
最終 drawPdf() がどのファイル由来か
```

### 4. PDFを直したのに何も変わらない

最も多い原因は、**後のスクリプトに同名関数を上書きされていること**。

例:

`app.js` の `drawHeader()` を修正しても、最終的には `header-polish.js` の実装が使われる。

### 5. 保存状態はPDFにあるのに入力欄が空

stateとフォームの同期問題。

`editor-restore-fix.js` と `syncControls()` を確認する。

### 6. CC画像がPDFに出ない

- 外部画像ロード
- CORS
- `ccOfficialBadge`
- `ensureCcOfficialBadge()`

を確認する。

---

## 18. 機能追加時の推奨手順

### 新しいカスタム利用項目

1. `presets.js` の `policyItems` へ追加
2. `defaultState.policies` へ追加
3. 各presetへ値を追加
4. `drawPolicyIcon()` へアイコン追加
5. 保存データの後方互換を確認
6. PDF 3カラムの最大項目数を確認

### 新しいCCライセンス

1. `presets.js` の `cc` へ追加
2. `cc-official.js` にバッジURL追加
3. PDF表示確認
4. クレジット要否確認

### 新しいOSSライセンス

1. `presets.js` の `software` へ追加
2. `oss-polish.js` の `OSS_LICENSE_META` へ追加
3. SPDX確認
4. 利用条件分類を確認

### PDFデザイン修正

最初に「最終実装がどのファイルにあるか」を確認する。

現在の目安:

| 対象 | 主に修正するファイル |
|---|---|
| タイトル | `header-polish.js` |
| 全体縦位置 | `page-balance.js` |
| 3カラム | `layout-v3.js` / `custom-panel-auto.js` / `oss-polish.js` |
| クレジット | `credit-copy-fix.js` / `credit-tone.js` / `credit-strip-final.js` |
| CC帯 | `layout-v3.js` / `cc-official.js` |
| OSS帯 | `oss-polish.js` |
| NOTE / CONTACT / Footer | `layout-v3.js` |
| 基本タイポグラフィ | `design-v2.js` |

---

## 19. 多言語化との関係

多言語対応の詳細方針は次を参照。

- [`i18n-plan.md`](./i18n-plan.md)

現在は日本語の固定文字列が各JSに分散しているため、多言語化時にはこれらを翻訳キーへ移行する。

ただし、内部stateキーや `allow / ask / deny` は言語に依存しないため、そのまま維持する。

---

## 20. 将来的なリファクタリング候補

現行構造は段階的な改善を安全に積み重ねて完成したため、**関数上書きレイヤーが多い**。

現在は正常に動作しているので、公開版で急いで統合する必要はない。

ただし大規模機能追加を続ける場合は、将来的に次のような整理が考えられる。

```text
src/
├── state.js
├── data.js
├── ui/
│   ├── editor.js
│   └── image-editor.js
├── pdf/
│   ├── renderer.js
│   ├── header.js
│   ├── policies.js
│   ├── credit.js
│   ├── cc.js
│   └── oss.js
└── storage.js
```

ただし、このリファクタリングを行う場合は「見た目を変えずに構造だけ置換する」工程として独立させること。

機能追加と同時に大規模統合すると、PDFレイアウト・イベント・保存互換性を同時に壊すリスクが高い。

---

## 21. 公開前チェックリスト

変更後は最低限次を確認する。

### カスタム

- モード切替
- プリセット変更
- 7項目の許可 / 要相談 / 禁止
- クレジット 必須 / 推奨 / 不要
- 細かい禁止事項
- NOTE

### CC

- CCライセンスselect
- 公式バッジ
- PDFライセンス帯
- CC0のクレジット非表示

### OSS

- OSSライセンスselect
- 正式名称 / SPDX
- 適用範囲
- NOTE入力

### 共通

- 作者 / 作品 / 種類 / 日付
- ページ再読込後の復元
- 画像選択
- 画像位置調整
- 画像再調整
- 画像削除
- 長いタイトル
- 長いNOTE
- Contactあり / なし
- PDFダウンロード
- OGP画像URL
- GitHub Pages build status

---

## 22. 設計上の原則

License Creatorを保守するうえで、現在特に重要な原則は次の5つ。

1. **stateを唯一の表示元として扱う**
2. **ユーザー操作後はPDFとlocalStorageを同期する**
3. **PDFはCanvas直接描画を維持する**
4. **後続スクリプトの上書き順を壊さない**
5. **既存ユーザーの保存データ互換性を維持する**

この5点を守れば、現在の公開版を大きく崩さずに機能追加しやすい。
