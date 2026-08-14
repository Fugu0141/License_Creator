'use strict';

window.LICENSE_DATA = {
  workTypes: {
    illustration: { icon: '✦', label: 'イラスト・画像', en: 'Illustration / Image' },
    model: { icon: '◇', label: '3Dモデル', en: '3D Model' },
    music: { icon: '♪', label: '音楽・音声', en: 'Music / Audio' },
    video: { icon: '▶', label: '動画・映像', en: 'Video' },
    game: { icon: '◆', label: 'ゲーム・ゲーム素材', en: 'Game / Game Asset' },
    character: { icon: '★', label: 'キャラクター・立ち絵', en: 'Character / Avatar' },
    document: { icon: '▤', label: '文章・資料・同人誌', en: 'Document / Publication' },
    font: { icon: 'Aa', label: 'フォント・デザイン素材', en: 'Font / Design Asset' },
    software: { icon: '</>', label: 'ソフトウェア', en: 'Software' },
    other: { icon: '∞', label: 'その他の創作物', en: 'Other Creative Work' }
  },

  policyItems: [
    { key: 'personal', icon: '◯', label: '個人利用', en: 'Personal use', description: '個人の制作・鑑賞・趣味での利用' },
    { key: 'commercial', icon: '¥', label: '商用利用', en: 'Commercial use', description: '販売物・広告・有料案件などでの利用' },
    { key: 'monetized', icon: '▶', label: '収益化コンテンツ', en: 'Monetized content', description: '動画配信・配信サービス・広告収益を伴う投稿' },
    { key: 'modification', icon: '✎', label: '改変・加工', en: 'Modification', description: '色変更・編集・アレンジ・リミックスなど' },
    { key: 'project', icon: '＋', label: '作品への組み込み', en: 'Use in projects', description: 'ゲーム・動画・Web・印刷物などへの組み込み' },
    { key: 'client', icon: '◎', label: '依頼・受託制作', en: 'Client work', description: 'クライアントワークや業務制作での利用' },
    { key: 'merchandise', icon: '□', label: 'グッズ・商品化', en: 'Merchandise', description: 'グッズ・印刷物・商品としての展開' },
    { key: 'redistribution', icon: '↗', label: '素材の再配布', en: 'Redistribution', description: '元データまたは編集済み素材そのものの再配布' }
  ],

  customPresets: {
    creatorFriendly: {
      name: 'クリエイター向け標準',
      description: '作品への組み込みは広く許可しつつ、素材そのものの再配布は防ぐバランス型です。',
      policies: { personal: 'allow', commercial: 'ask', monetized: 'allow', modification: 'allow', project: 'allow', client: 'allow', merchandise: 'ask', redistribution: 'deny' },
      credit: 'required',
      shareAlike: false,
      noExtraction: true,
      restrictions: { adult: false, political: false, ai: true, nft: true, harmful: true, impersonation: true }
    },
    openAsset: {
      name: 'オープン素材寄り',
      description: '商用・改変・作品組み込みを広く許可する、自由度の高い配布向けです。',
      policies: { personal: 'allow', commercial: 'allow', monetized: 'allow', modification: 'allow', project: 'allow', client: 'allow', merchandise: 'allow', redistribution: 'ask' },
      credit: 'recommended',
      shareAlike: false,
      noExtraction: false,
      restrictions: { adult: false, political: false, ai: false, nft: false, harmful: true, impersonation: true }
    },
    marketplace: {
      name: '素材販売向け',
      description: '購入者の制作利用を許可しつつ、素材の横流し・再販売を厳しく制限します。',
      policies: { personal: 'allow', commercial: 'allow', monetized: 'allow', modification: 'allow', project: 'allow', client: 'allow', merchandise: 'ask', redistribution: 'deny' },
      credit: 'recommended',
      shareAlike: false,
      noExtraction: true,
      restrictions: { adult: false, political: true, ai: true, nft: true, harmful: true, impersonation: true }
    },
    music: {
      name: 'BGM・音声素材向け',
      description: '収益化動画で使いやすくしつつ、音源単体の再配布・販売を防ぎます。',
      policies: { personal: 'allow', commercial: 'ask', monetized: 'allow', modification: 'ask', project: 'allow', client: 'ask', merchandise: 'deny', redistribution: 'deny' },
      credit: 'required',
      shareAlike: false,
      noExtraction: true,
      restrictions: { adult: false, political: true, ai: true, nft: true, harmful: true, impersonation: true }
    },
    character: {
      name: 'キャラクター利用向け',
      description: 'ファン活動を想定しつつ、公式を装う利用や商品化をコントロールします。',
      policies: { personal: 'allow', commercial: 'ask', monetized: 'ask', modification: 'allow', project: 'ask', client: 'ask', merchandise: 'ask', redistribution: 'deny' },
      credit: 'required',
      shareAlike: false,
      noExtraction: true,
      restrictions: { adult: true, political: true, ai: true, nft: true, harmful: true, impersonation: true }
    },
    strict: {
      name: '許可制・厳格',
      description: '個人利用以外は原則として作者への確認を求める保守的な設定です。',
      policies: { personal: 'allow', commercial: 'ask', monetized: 'ask', modification: 'ask', project: 'ask', client: 'ask', merchandise: 'ask', redistribution: 'deny' },
      credit: 'required',
      shareAlike: false,
      noExtraction: true,
      restrictions: { adult: true, political: true, ai: true, nft: true, harmful: true, impersonation: true }
    }
  },

  ccLicenses: {
    'CC-BY-4.0': {
      name: 'Creative Commons Attribution 4.0 International', short: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/',
      allow: ['共有・再配布', '改変・翻案', '商用利用'], conditions: ['適切なクレジット', 'ライセンスへのリンク', '変更した場合の表示'], deny: [],
      enAllow: ['Share', 'Adapt', 'Commercial use'], enConditions: ['Attribution', 'License link', 'Indicate changes']
    },
    'CC-BY-SA-4.0': {
      name: 'Creative Commons Attribution-ShareAlike 4.0 International', short: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      allow: ['共有・再配布', '改変・翻案', '商用利用'], conditions: ['適切なクレジット', '改変物を同一条件で共有', 'ライセンスへのリンク'], deny: [],
      enAllow: ['Share', 'Adapt', 'Commercial use'], enConditions: ['Attribution', 'ShareAlike', 'License link']
    },
    'CC-BY-ND-4.0': {
      name: 'Creative Commons Attribution-NoDerivatives 4.0 International', short: 'CC BY-ND 4.0', url: 'https://creativecommons.org/licenses/by-nd/4.0/',
      allow: ['共有・再配布', '商用利用'], conditions: ['適切なクレジット', 'ライセンスへのリンク'], deny: ['改変物の共有'],
      enAllow: ['Share', 'Commercial use'], enConditions: ['Attribution', 'License link']
    },
    'CC-BY-NC-4.0': {
      name: 'Creative Commons Attribution-NonCommercial 4.0 International', short: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/',
      allow: ['共有・再配布', '改変・翻案'], conditions: ['適切なクレジット', '非営利利用のみ', 'ライセンスへのリンク'], deny: ['商用利用'],
      enAllow: ['Share', 'Adapt'], enConditions: ['Attribution', 'NonCommercial', 'License link']
    },
    'CC-BY-NC-SA-4.0': {
      name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International', short: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      allow: ['共有・再配布', '改変・翻案'], conditions: ['適切なクレジット', '非営利利用のみ', '改変物を同一条件で共有'], deny: ['商用利用'],
      enAllow: ['Share', 'Adapt'], enConditions: ['Attribution', 'NonCommercial', 'ShareAlike']
    },
    'CC-BY-NC-ND-4.0': {
      name: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International', short: 'CC BY-NC-ND 4.0', url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
      allow: ['共有・再配布'], conditions: ['適切なクレジット', '非営利利用のみ', 'ライセンスへのリンク'], deny: ['商用利用', '改変物の共有'],
      enAllow: ['Share'], enConditions: ['Attribution', 'NonCommercial', 'License link']
    },
    'CC0-1.0': {
      name: 'CC0 1.0 Universal', short: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      allow: ['複製・共有', '改変', '商用利用'], conditions: ['可能な範囲で著作権等を放棄'], deny: [],
      enAllow: ['Copy / share', 'Adapt', 'Commercial use'], enConditions: ['Rights waived to the extent possible']
    }
  },

  softwareLicenses: {
    MIT: {
      name: 'MIT License', short: 'MIT', spdx: 'MIT', url: 'https://spdx.org/licenses/MIT.html',
      description: '短く寛容なライセンス。著作権表示とライセンス文を保持すれば、利用・改変・再配布・商用利用を広く許可します。',
      allow: ['商用利用', '改変', '再配布', '私的利用'], conditions: ['著作権表示とライセンス文の保持'], limitations: ['無保証', '責任制限']
    },
    'Apache-2.0': {
      name: 'Apache License 2.0', short: 'Apache-2.0', spdx: 'Apache-2.0', url: 'https://spdx.org/licenses/Apache-2.0.html',
      description: '寛容型で、明示的な特許ライセンスや変更通知に関する条項を含みます。',
      allow: ['商用利用', '改変', '再配布', '特許利用'], conditions: ['ライセンス文の保持', '変更点の明示', 'NOTICEの扱い'], limitations: ['無保証', '商標権は別']
    },
    'BSD-3-Clause': {
      name: 'BSD 3-Clause License', short: 'BSD-3-Clause', spdx: 'BSD-3-Clause', url: 'https://spdx.org/licenses/BSD-3-Clause.html',
      description: '寛容型ライセンス。著作権表示などの保持に加え、作者名による推薦・宣伝を制限します。',
      allow: ['商用利用', '改変', '再配布', '私的利用'], conditions: ['著作権表示と条件文の保持'], limitations: ['作者名による推薦を禁止', '無保証']
    },
    'MPL-2.0': {
      name: 'Mozilla Public License 2.0', short: 'MPL-2.0', spdx: 'MPL-2.0', url: 'https://spdx.org/licenses/MPL-2.0.html',
      description: 'ファイル単位の弱いコピーレフト。MPL対象ファイルの変更部分はソース公開が必要です。',
      allow: ['商用利用', '改変', '再配布'], conditions: ['対象ファイルのソース公開', 'ライセンス文の保持'], limitations: ['無保証']
    },
    'LGPL-3.0-only': {
      name: 'GNU Lesser General Public License v3.0', short: 'LGPL-3.0', spdx: 'LGPL-3.0-only', url: 'https://spdx.org/licenses/LGPL-3.0-only.html',
      description: '主にライブラリ向け。ライブラリ自体の改変は共有しつつ、リンクするアプリへの波及を抑えます。',
      allow: ['商用利用', '改変', '再配布'], conditions: ['ライブラリ部分のソース公開', 'ライセンス文の保持'], limitations: ['無保証']
    },
    'GPL-3.0-only': {
      name: 'GNU General Public License v3.0', short: 'GPL-3.0', spdx: 'GPL-3.0-only', url: 'https://spdx.org/licenses/GPL-3.0-only.html',
      description: '強いコピーレフト。派生作品を配布する場合、同じ自由を受け継ぐ形でソース公開を求めます。',
      allow: ['商用利用', '改変', '再配布'], conditions: ['派生作品のソース公開', '同一条件での継承', 'ライセンス文の保持'], limitations: ['無保証']
    },
    'AGPL-3.0-only': {
      name: 'GNU Affero General Public License v3.0', short: 'AGPL-3.0', spdx: 'AGPL-3.0-only', url: 'https://spdx.org/licenses/AGPL-3.0-only.html',
      description: 'GPL系の条件に加え、ネットワーク越しに提供する改変版についてもソース提供を求めます。',
      allow: ['商用利用', '改変', '再配布', 'ネットワーク利用'], conditions: ['ソース公開', '同一条件での継承', 'ネットワーク利用時のソース提供'], limitations: ['無保証']
    }
  },

  defaultState: {
    mode: 'custom',
    title: '作品利用ガイド',
    creator: 'Fugu0141',
    workName: 'My Creative Work',
    workType: 'illustration',
    version: '1.0',
    updatedAt: '',
    workUrl: '',
    contact: '',
    language: 'ja',
    theme: 'midnight',
    accent: '#7c9cff',
    coverImage: '',
    coverImageName: '',
    preset: 'creatorFriendly',
    policies: { personal: 'allow', commercial: 'ask', monetized: 'allow', modification: 'allow', project: 'allow', client: 'allow', merchandise: 'ask', redistribution: 'deny' },
    credit: 'required',
    creditText: '© 2026 Fugu0141 / My Creative Work',
    shareAlike: false,
    noExtraction: true,
    restrictions: { adult: false, political: false, ai: true, nft: true, harmful: true, impersonation: true },
    notes: '作品のイメージを著しく損なう利用や、第三者に公式・公認であると誤認させる利用はできません。判断に迷う場合は事前にお問い合わせください。',
    customClauses: [],
    ccLicense: 'CC-BY-4.0',
    ccCommercial: true,
    ccAdaptation: 'yes',
    softwareLicense: 'MIT'
  }
};
