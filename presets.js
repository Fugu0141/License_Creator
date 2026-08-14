'use strict';

window.LICENSE_DATA = {
  workTypes: {
    illustration: 'イラスト・画像', model: '3Dモデル', music: '音楽・音声', video: '動画・映像',
    game: 'ゲーム・ゲーム素材', character: 'キャラクター・立ち絵', document: '文章・資料', font: 'フォント・デザイン素材', other: 'その他'
  },
  policyItems: [
    { key: 'commercial', label: '商用利用', icon: '¥' },
    { key: 'monetized', label: '収益化コンテンツ', icon: '▶' },
    { key: 'modification', label: '改変・加工', icon: '✎' },
    { key: 'project', label: '作品への組み込み', icon: '+' },
    { key: 'merchandise', label: 'グッズ・商品化', icon: '□' },
    { key: 'redistribution', label: '素材の再配布', icon: '↗' },
    { key: 'ai', label: 'AI学習・生成AI利用', icon: 'AI' }
  ],
  presets: {
    creator: {
      name: 'クリエイター向け標準',
      policies: { commercial:'ask', monetized:'allow', modification:'allow', project:'allow', merchandise:'ask', redistribution:'deny', ai:'deny' },
      credit:'required', restrictions:{ adult:false, political:false, nft:true, harmful:true, impersonation:true }
    },
    open: {
      name: '自由に使ってOK',
      policies: { commercial:'allow', monetized:'allow', modification:'allow', project:'allow', merchandise:'allow', redistribution:'ask', ai:'allow' },
      credit:'recommended', restrictions:{ adult:false, political:false, nft:false, harmful:true, impersonation:true }
    },
    marketplace: {
      name: '素材販売向け',
      policies: { commercial:'allow', monetized:'allow', modification:'allow', project:'allow', merchandise:'ask', redistribution:'deny', ai:'deny' },
      credit:'recommended', restrictions:{ adult:false, political:true, nft:true, harmful:true, impersonation:true }
    },
    strict: {
      name: '許可制・厳格',
      policies: { commercial:'ask', monetized:'ask', modification:'ask', project:'ask', merchandise:'ask', redistribution:'deny', ai:'deny' },
      credit:'required', restrictions:{ adult:true, political:true, nft:true, harmful:true, impersonation:true }
    }
  },
  cc: {
    'CC BY 4.0': { allow:['共有・再配布','改変・翻案','商用利用'], ask:[], deny:[], credit:'クレジット表記が必要です', url:'https://creativecommons.org/licenses/by/4.0/' },
    'CC BY-SA 4.0': { allow:['共有・再配布','改変・翻案','商用利用'], ask:['改変物は同じ条件で共有'], deny:[], credit:'クレジット表記が必要です', url:'https://creativecommons.org/licenses/by-sa/4.0/' },
    'CC BY-NC 4.0': { allow:['共有・再配布','改変・翻案'], ask:[], deny:['商用利用'], credit:'クレジット表記が必要です', url:'https://creativecommons.org/licenses/by-nc/4.0/' },
    'CC BY-NC-SA 4.0': { allow:['共有・再配布','改変・翻案'], ask:['改変物は同じ条件で共有'], deny:['商用利用'], credit:'クレジット表記が必要です', url:'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
    'CC BY-ND 4.0': { allow:['共有・再配布','商用利用'], ask:[], deny:['改変物の共有'], credit:'クレジット表記が必要です', url:'https://creativecommons.org/licenses/by-nd/4.0/' },
    'CC BY-NC-ND 4.0': { allow:['共有・再配布'], ask:[], deny:['商用利用','改変物の共有'], credit:'クレジット表記が必要です', url:'https://creativecommons.org/licenses/by-nc-nd/4.0/' },
    'CC0 1.0': { allow:['共有・再配布','改変・翻案','商用利用'], ask:[], deny:[], credit:'クレジット不要です', url:'https://creativecommons.org/publicdomain/zero/1.0/' }
  },
  software: {
    MIT: { allow:['商用利用','改変','再配布','私的利用'], ask:['著作権表示とライセンス文を保持'], deny:[], note:'短く自由度の高いOSSライセンスです。', url:'https://spdx.org/licenses/MIT.html' },
    'Apache-2.0': { allow:['商用利用','改変','再配布','特許利用'], ask:['ライセンス文の保持','変更点の明示'], deny:[], note:'特許条項を含む寛容型ライセンスです。', url:'https://spdx.org/licenses/Apache-2.0.html' },
    'BSD-3-Clause': { allow:['商用利用','改変','再配布'], ask:['著作権表示と条件文を保持'], deny:['作者名による推薦を装う利用'], note:'シンプルな寛容型ライセンスです。', url:'https://spdx.org/licenses/BSD-3-Clause.html' },
    'MPL-2.0': { allow:['商用利用','改変','再配布'], ask:['変更した対象ファイルのソース公開'], deny:[], note:'ファイル単位の弱いコピーレフトです。', url:'https://spdx.org/licenses/MPL-2.0.html' },
    'GPL-3.0': { allow:['商用利用','改変','再配布'], ask:['派生作品のソース公開','同一条件の継承'], deny:[], note:'強いコピーレフトのライセンスです。', url:'https://spdx.org/licenses/GPL-3.0-only.html' }
  },
  defaultState: {
    mode:'custom', title:'作品利用ガイド', creator:'', workName:'', workType:'other',
    updatedAt:'', contact:'', theme:'blue', accent:'#5b8def', customImage:'', preset:'creator',
    policies:{ commercial:'ask', monetized:'allow', modification:'allow', project:'allow', merchandise:'ask', redistribution:'deny', ai:'deny' },
    credit:'required', creditText:'',
    restrictions:{ adult:false, political:false, nft:true, harmful:true, impersonation:true },
    notes:'',
    ccLicense:'CC BY 4.0', softwareLicense:'MIT', softwareScope:''
  }
};