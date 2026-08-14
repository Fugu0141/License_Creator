# 多言語対応 設計方針

> Status: **Planning / 未実装**  
> 対象: License Creator / License Studio のエディタUIとPDF出力

## 1. 目的

License Creator を次の4言語で利用できるようにする。

- 日本語 (`ja`)
- English (`en`)
- 简体中文 (`zh-CN`)
- 한국어 (`ko`)

多言語化は、**エディタの表示言語**と**PDFの出力言語**を独立した設定として扱う。

最重要ルールは次の通り。

> **翻訳するのは、License Creator が意味を把握している固定情報だけ。ユーザーが入力した内容は翻訳しない。**

機械翻訳APIなどを使って、作者名・作品名・補足・連絡先などを書き換えることはしない。

---

## 2. 言語設定

### 2.1 エディタ表示言語

エディタ全体の固定UIを切り替える。

対象例:

- 作品
- 作者
- 作品名
- 種類
- 更新日
- 使い方
- クレジット
- デザイン
- PDFを書き出す
- 許可 / 要相談 / 禁止
- 入力欄の説明・プレースホルダー
- 画像編集画面
- 各種ボタン・ステータスメッセージ

入力済みのユーザーデータは変更しない。

例:

```text
作者: Fugu0141
```

UIを英語へ変更しても値は `Fugu0141` のままにする。

### 2.2 PDF出力言語

エディタ表示言語とは別に設定できるようにする。

候補:

- エディタと同じ (`same`)
- 日本語 (`ja`)
- English (`en`)
- 简体中文 (`zh-CN`)
- 한국어 (`ko`)

初期値は `same` とする。

---

## 3. PDFで翻訳するもの / しないもの

### 3.1 翻訳するもの

License Creator が生成する固定文・固定ラベル。

例:

| 内部キー | 日本語 | English |
|---|---|---|
| `status.allow` | 許可 | Allowed |
| `status.ask` | 要相談 | Ask First |
| `status.deny` | 禁止 | Not Allowed |
| `meta.creator` | 作者 | Creator |
| `meta.work` | 作品 | Work |
| `meta.updated` | 更新 | Updated |
| `section.note` | 補足 | Note |
| `policy.commercial` | 商用利用 | Commercial use |
| `policy.modification` | 改変・加工 | Modification |
| `policy.redistribution` | 素材の再配布 | Redistribution |
| `policy.ai` | AI学習・生成AI利用 | AI training / Generative AI use |

以下も翻訳対象とする。

- 作品種類の選択肢
- カスタム規約の各利用条件
- 細かい禁止事項
- クレジット要否の説明
- `例:` / `Example:` のようなシステム側接頭辞
- NOTE / CONTACT 等のセクション名
- CC / OSS から生成される利用条件ラベル
- PDF内の補助的な固定説明

### 3.2 翻訳しないもの

ユーザー入力は原文をそのまま保持・出力する。

- 作者名
- 作品名
- 連絡先 / URL
- クレジット表記本体
- カスタム補足
- OSSのユーザー入力NOTE
- OSSの適用範囲
- ユーザーが独自に変更したタイトル

例:

日本語で次の補足を入力する。

```text
二次配布を行う場合は連絡してください。
```

英語PDFでは次のようにする。

```text
NOTE
二次配布を行う場合は連絡してください。
```

中国語PDFでも本文は翻訳しない。

```text
备注
二次配布を行う場合は連絡してください。
```

---

## 4. クレジット表記

クレジット欄は、システム文とユーザー入力を分離する。

保存データ例:

```js
creditText: '© 2026 Example Creator / Example Work'
```

PDF描画時に言語別の接頭辞を付ける。

```text
例: © 2026 Example Creator / Example Work
Example: © 2026 Example Creator / Example Work
```

`creditText` 自体へ `例:` を保存しない。

クレジット要否の固定文は翻訳する。

```text
クレジット表記が必要です
Credit attribution is required
```

---

## 5. タイトルの扱い

デフォルトタイトルはシステム文として翻訳可能にする。

例:

- 日本語: `作品利用ガイド`
- English: `Usage Guide`
- 简体中文: `作品使用指南`
- 한국어: `작품 이용 가이드`

ただし、ユーザーがタイトルを編集した場合は**ユーザー入力**として扱い、その後はPDF言語を変更しても翻訳しない。

実装では文字列比較ではなく、明示的なフラグを持つ。

```js
titleCustomized: false
```

ユーザーがタイトル欄を編集した時点で `true` にする。

---

## 6. Creative Commons / OSS

### 6.1 翻訳しない固有名

正式なライセンス名や識別子は原文のまま保持する。

例:

- `CC BY-SA 4.0`
- `CC0 1.0`
- `MIT License`
- `Apache License 2.0`
- `Mozilla Public License 2.0`
- `SPDX: MIT`
- URL

### 6.2 翻訳する説明

ライセンスから導出して表示している利用条件は翻訳する。

例:

```text
商用利用 → Commercial use
改変 → Modification
再配布 → Redistribution
私的利用 → Private use
著作権表示とライセンス文を保持 → Keep copyright and license notices
```

つまり、**正式名称・識別子は固定、License Creator が説明用に生成するラベルはローカライズ**する。

---

## 7. 内部データ設計

表示文字列を保存データやロジックの識別子として使わない。

既存のような安定した内部キーを利用する。

```js
commercial
monetized
modification
project
merchandise
redistribution
ai
adult
political
nft
harmful
impersonation
```

翻訳辞書側で表示文字列へ変換する。

```js
I18N.en.policy.commercial = 'Commercial use';
I18N.ja.policy.commercial = '商用利用';
```

これにより、保存済みデータは言語に依存しない。

---

## 8. 翻訳辞書

ビルド工程を増やさない方針を維持するため、初期実装では `i18n.js` 1ファイルにまとめる。

概念例:

```js
const I18N = {
  ja: {
    ui: {},
    pdf: {},
    policy: {},
    workType: {}
  },
  en: {},
  'zh-CN': {},
  ko: {}
};
```

規模が大きくなった場合のみ、次のように分割する。

```text
i18n/
├── ja.js
├── en.js
├── zh-cn.js
└── ko.js
```

### 翻訳関数

UI用とPDF用を意味的に分ける。

```js
t('ui.work')
pdfT('status.allow')
```

不足キーがある場合は日本語へフォールバックし、開発時に `console.warn` を出す。

---

## 9. state / localStorage

追加予定:

```js
uiLanguage: 'ja',
pdfLanguage: 'same',
titleCustomized: false
```

既存保存データにこれらが存在しない場合は自動補完する。

```js
uiLanguage ??= 'ja';
pdfLanguage ??= 'same';
titleCustomized ??= false;
```

既存ユーザーの作品データ・利用条件・画像などをリセットしてはいけない。

---

## 10. 初期言語

既存挙動との互換性を優先し、初期エディタ言語は日本語 (`ja`) とする。

ブラウザ言語による自動判定は将来追加可能だが、初回実装では行わない。

PDF言語の初期値は `same` とする。

---

## 11. 日付

初回実装では、現在の `YYYY-MM-DD` 表記を維持する。

理由:

- 言語間で曖昧になりにくい
- 入力値とPDF表示が一致する
- 地域別フォーマットによる混乱を避けられる

将来、ロケール別日付表示を追加する場合も内部値はISO形式のまま保持する。

---

## 12. PDFレイアウト

英語・中国語・韓国語では文字列長が変わるため、現在の自動文字組みを多言語でも利用する。

必須要件:

- 1行に収まる場合は1行を優先
- 必要に応じてフォントサイズを縮小
- それでも収まらない場合のみ自然な位置で改行
- 最大行数を超える場合の安全な縮小処理
- 3カラムの高さは従来通り共通化
- タイトル・クレジット・NOTE等もオーバーフローしない

日本語向け `Intl.Segmenter('ja')` を固定利用せず、PDF言語に応じたlocaleを渡す。

```js
new Intl.Segmenter(pdfLocale, { granularity: 'word' });
```

---

## 13. フォント

Canvas描画で、日本語・簡体字中国語・韓国語を確実に表示できるフォントスタックを使用する。

初回実装ではブラウザ / OSのCJK対応フォントを優先し、PDFはCanvas画像として出力する現在の方式を維持する。

Webフォントを追加する場合は、配布ライセンスと読み込み失敗時のフォールバックを別途確認する。

---

## 14. 実装フェーズ

### Phase 1: 基盤

1. `uiLanguage` / `pdfLanguage` をstateへ追加
2. `i18n.js` を追加
3. `t()` / `pdfT()` を実装
4. 既存保存データのマイグレーション

### Phase 2: エディタUI

1. 言語切替UIを追加
2. 固定HTML文言を翻訳キー化
3. JSで生成されるUI文言を翻訳キー化
4. 画像編集モーダル等も対応

### Phase 3: PDF

1. PDF言語選択を追加
2. メタ情報・3カラム・クレジット・NOTE等を翻訳キー化
3. カスタム利用条件を内部キーから翻訳
4. CC / OSSの説明用ラベルを内部キー化
5. 多言語文字組みを確認

### Phase 4: QA

4言語 × 3モード（カスタム / CC / OSS）を確認する。

最低でも次のケースをテストする。

- UI日本語 + PDF英語
- UI英語 + PDF日本語
- UI中国語 + PDF韓国語
- 日本語NOTEを英語PDFへ出力し、NOTE本文が日本語のまま
- 英語作者名を中国語PDFへ出力し、作者名が変更されない
- 長い中国語タイトル / 長い英語項目でもPDFが崩れない
- 既存localStorageから正常に復元できる

---

## 15. 受け入れ条件

多言語対応は、次をすべて満たした時点で完了とする。

- 4言語でエディタの固定UIが切り替わる
- UI言語変更でユーザー入力が一切書き換わらない
- PDF言語をUI言語とは独立して選択できる
- PDF内の固定ラベルだけが選択言語へ切り替わる
- ユーザー入力は原文のまま出力される
- CC / OSSの正式ライセンス名・SPDX・URLを翻訳しない
- 既存保存データとの互換性を維持する
- 4言語すべてで1ページPDFのレイアウトが破綻しない
- 翻訳キー不足時に安全なフォールバックがある

---

## 16. 設計原則まとめ

多言語化では、文字列を次の3種類へ明確に分離する。

1. **UI固定文** — エディタ表示言語で翻訳する
2. **PDF固定文** — PDF出力言語で翻訳する
3. **ユーザー入力** — 絶対に自動翻訳しない

この境界を崩さないことを、今後言語を追加する際の基本ルールとする。
