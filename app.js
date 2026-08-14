'use strict';

const SOFTWARE_LICENSES = {
  mit: 'MIT License',
  'apache-2.0': 'Apache License 2.0',
  'gpl-3.0': 'GNU GPL v3',
  'agpl-3.0': 'GNU AGPL v3',
  'lgpl-3.0': 'GNU LGPL v3',
  'bsd-3-clause': 'BSD 3-Clause',
  'bsd-2-clause': 'BSD 2-Clause',
  'mpl-2.0': 'Mozilla Public License 2.0',
  unlicense: 'The Unlicense'
};

const CREATIVE_LICENSES = {
  'cc-by-4.0': {
    name: 'Creative Commons Attribution 4.0 International',
    shortName: 'CC BY 4.0',
    spdx: 'CC-BY-4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    description: 'クレジット表示を条件に、共有・改変・商用利用を幅広く許可するCreative Commonsライセンスです。',
    permissions: ['共有・再配布', '改変・翻案', '商用利用'],
    conditions: ['クレジット表示', 'ライセンスへのリンク', '変更した場合はその旨を表示'],
    limitations: ['追加の法的・技術的制限を課さない']
  },
  'cc-by-sa-4.0': {
    name: 'Creative Commons Attribution-ShareAlike 4.0 International',
    shortName: 'CC BY-SA 4.0',
    spdx: 'CC-BY-SA-4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    description: 'クレジット表示に加え、改変作品を同じライセンスで共有することを求めるライセンスです。',
    permissions: ['共有・再配布', '改変・翻案', '商用利用'],
    conditions: ['クレジット表示', '同一ライセンスで継承', 'ライセンスへのリンク', '変更した場合はその旨を表示'],
    limitations: ['追加の法的・技術的制限を課さない']
  },
  'cc-by-nd-4.0': {
    name: 'Creative Commons Attribution-NoDerivatives 4.0 International',
    shortName: 'CC BY-ND 4.0',
    spdx: 'CC-BY-ND-4.0',
    url: 'https://creativecommons.org/licenses/by-nd/4.0/',
    description: 'クレジット表示を条件に共有と商用利用を許可しますが、改変した作品を共有することは認めません。',
    permissions: ['共有・再配布', '商用利用'],
    conditions: ['クレジット表示', 'ライセンスへのリンク'],
    limitations: ['改変物の共有不可']
  },
  'cc-by-nc-4.0': {
    name: 'Creative Commons Attribution-NonCommercial 4.0 International',
    shortName: 'CC BY-NC 4.0',
    spdx: 'CC-BY-NC-4.0',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    description: 'クレジット表示を条件に共有・改変を許可しますが、商用利用は認めません。',
    permissions: ['共有・再配布', '改変・翻案', '非商用利用'],
    conditions: ['クレジット表示', 'ライセンスへのリンク', '変更した場合はその旨を表示'],
    limitations: ['商用利用不可']
  },
  'cc-by-nc-sa-4.0': {
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International',
    shortName: 'CC BY-NC-SA 4.0',
    spdx: 'CC-BY-NC-SA-4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    description: '非商用での共有・改変を許可し、クレジット表示と同一ライセンスでの継承を求めます。',
    permissions: ['共有・再配布', '改変・翻案', '非商用利用'],
    conditions: ['クレジット表示', '同一ライセンスで継承', 'ライセンスへのリンク', '変更した場合はその旨を表示'],
    limitations: ['商用利用不可']
  },
  'cc-by-nc-nd-4.0': {
    name: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International',
    shortName: 'CC BY-NC-ND 4.0',
    spdx: 'CC-BY-NC-ND-4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    description: 'クレジット表示を条件に、改変していない作品の非商用共有のみを許可する最も制限の強いCCライセンスです。',
    permissions: ['共有・再配布', '非商用利用'],
    conditions: ['クレジット表示', 'ライセンスへのリンク'],
    limitations: ['商用利用不可', '改変物の共有不可']
  },
  'cc0-1.0': {
    name: 'CC0 1.0 Universal Public Domain Dedication',
    shortName: 'CC0 1.0',
    spdx: 'CC0-1.0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    description: '可能な限り著作権・関連権を放棄し、作品を非常に自由に再利用できる状態にするためのパブリックドメイン提供ツールです。',
    permissions: ['共有・再配布', '改変・翻案', '商用利用', 'クレジット不要'],
    conditions: ['可能な範囲で権利を放棄'],
    limitations: ['商標・特許・プライバシー等は別途', '保証なし']
  }
};

const RIGHTS_RESERVED = {
  name: 'All Rights Reserved',
  shortName: 'All Rights Reserved',
  spdx: 'ARR',
  description: '公開はするものの、このツールから再利用許諾を与えない構成です。必要な利用条件がある場合は個別の利用規約を用意してください。',
  permissions: ['著作権法上当然に認められる利用'],
  conditions: ['それ以外の利用は個別許可'],
  limitations: ['再配布の許諾なし', '改変の許諾なし', '商用利用の許諾なし']
};

const FEATURE_LABELS = {
  'commercial-use': '商用利用', modifications: '改変', distribution: '再配布', 'private-use': '私的利用', 'patent-use': '特許利用',
  'include-copyright': '著作権表示を含める', 'include-license': 'ライセンスを含める', 'disclose-source': 'ソース公開',
  'document-changes': '変更点を明示', 'same-license': '同一ライセンス', 'same-license--file': 'ファイル単位で同一ライセンス',
  'same-license--library': 'ライブラリ部分を同一条件で維持', 'network-use-disclose': 'ネットワーク利用時もソース公開',
  liability: '責任を負わない', warranty: '保証なし', 'trademark-use': '商標利用は別扱い'
};

const SOFTWARE_POLICY_MAP = { permissive: 'mit', patent: 'apache-2.0', file: 'mpl-2.0', library: 'lgpl-3.0', project: 'gpl-3.0', network: 'agpl-3.0' };
const WORK_TYPE_LABELS = { software: 'ソースコード', illustration: 'イラスト・画像', model: '3Dモデル', audio: '音楽・音声', video: '動画', document: '文章・文書', composite: 'ゲーム・複合作品', other: 'その他の創作物' };

const elements = {
  wizardPanel: document.querySelector('#wizardPanel'), wizardProgress: document.querySelector('#wizardProgress'), manualLicenseField: document.querySelector('#manualLicenseField'), licenseSelect: document.querySelector('#licenseSelect'),
  softwareQuestions: document.querySelector('#softwareQuestions'), creativeQuestions: document.querySelector('#creativeQuestions'), compositeQuestions: document.querySelector('#compositeQuestions'), patentQuestion: document.querySelector('#patentQuestion'), shareAlikeQuestion: document.querySelector('#shareAlikeQuestion'),
  compositeSoftwarePolicy: document.querySelector('#compositeSoftwarePolicy'), compositeCreativeLicense: document.querySelector('#compositeCreativeLicense'), recommendationTitle: document.querySelector('#recommendationTitle'), recommendationReason: document.querySelector('#recommendationReason'), applyRecommendation: document.querySelector('#applyRecommendation'),
  projectName: document.querySelector('#projectName'), ownerName: document.querySelector('#ownerName'), copyrightYear: document.querySelector('#copyrightYear'), licenseName: document.querySelector('#licenseName'), licenseDescription: document.querySelector('#licenseDescription'), sourceLink: document.querySelector('#sourceLink'), scopeBanner: document.querySelector('#scopeBanner'), permissionsList: document.querySelector('#permissionsList'), conditionsList: document.querySelector('#conditionsList'), limitationsList: document.querySelector('#limitationsList'), licensePreview: document.querySelector('#licensePreview'), spdxBadge: document.querySelector('#spdxBadge'), statusMessage: document.querySelector('#statusMessage'), copyButton: document.querySelector('#copyButton'), noticeTitle: document.querySelector('#noticeTitle'), noticeText: document.querySelector('#noticeText')
};

const state = { mode: 'wizard', workType: 'software', recommendation: { type: 'single', key: 'mit' }, current: null, renderedText: '', softwareCache: new Map(), loading: false };

function init() {
  elements.copyrightYear.value = String(new Date().getFullYear());
  elements.projectName.value = 'License Creator';
  buildLicenseSelect();
  bindEvents();
  updateWizard();
  loadSingleLicense('mit');
}

function buildLicenseSelect() {
  const softwareGroup = document.createElement('optgroup'); softwareGroup.label = 'Software licenses';
  for (const [key, label] of Object.entries(SOFTWARE_LICENSES)) softwareGroup.appendChild(createOption(key, label));
  const creativeGroup = document.createElement('optgroup'); creativeGroup.label = 'Creative Commons / creative works';
  for (const [key, data] of Object.entries(CREATIVE_LICENSES)) creativeGroup.appendChild(createOption(key, data.shortName));
  creativeGroup.appendChild(createOption('rights-reserved', 'All Rights Reserved'));
  elements.licenseSelect.append(softwareGroup, creativeGroup); elements.licenseSelect.value = 'mit';
}
function createOption(value, label) { const option = document.createElement('option'); option.value = value; option.textContent = label; return option; }

function bindEvents() {
  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
  document.querySelectorAll('[data-work-type]').forEach((button) => button.addEventListener('click', () => { state.workType = button.dataset.workType; document.querySelectorAll('[data-work-type]').forEach((item) => item.classList.toggle('selected', item === button)); updateWizard(); }));
  document.querySelectorAll('#wizardPanel input[type="radio"]').forEach((input) => input.addEventListener('change', updateWizard));
  elements.compositeSoftwarePolicy.addEventListener('change', updateWizard); elements.compositeCreativeLicense.addEventListener('change', updateWizard);
  elements.applyRecommendation.addEventListener('click', applyRecommendation); elements.licenseSelect.addEventListener('change', () => loadSingleLicense(elements.licenseSelect.value));
  [elements.projectName, elements.ownerName, elements.copyrightYear].forEach((input) => input.addEventListener('input', renderCurrentText));
  document.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', () => runExport(button.dataset.export)));
  elements.copyButton.addEventListener('click', copyLicenseText);
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('[data-mode]').forEach((button) => { const active = button.dataset.mode === mode; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  const wizard = mode === 'wizard'; elements.wizardPanel.hidden = !wizard; elements.manualLicenseField.hidden = wizard;
  if (!wizard) elements.licenseSelect.value = getCurrentPrimaryKey();
}

function getChecked(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value; }

function updateWizard() {
  const software = state.workType === 'software'; const composite = state.workType === 'composite'; const creative = !software && !composite;
  elements.softwareQuestions.hidden = !software; elements.creativeQuestions.hidden = !creative; elements.compositeQuestions.hidden = !composite;
  elements.wizardProgress.textContent = '2 / 2';

  if (software) {
    const policy = getChecked('softwarePolicy') || 'permissive'; const patent = getChecked('patentPolicy') === 'yes';
    elements.patentQuestion.hidden = policy !== 'permissive'; const key = policy === 'permissive' && patent ? 'apache-2.0' : SOFTWARE_POLICY_MAP[policy];
    state.recommendation = { type: 'single', key };
    const reasons = { mit: '自由度が高く、条件が比較的シンプルです。', 'apache-2.0': '寛容な利用条件に加えて、明示的な特許ライセンス条項を持ちます。', 'mpl-2.0': '変更したMPL対象ファイルを公開しつつ、他のコードへの波及を抑えたい場合に向きます。', 'lgpl-3.0': 'ライブラリ自体の自由を守りつつ、別ライセンスのアプリから利用される余地を残します。', 'gpl-3.0': '派生作品を配布する場合にもGPLの自由を維持したい場合に向きます。', 'agpl-3.0': 'Webサービスなどネットワーク越しの利用でもソース提供を求めたい場合に向きます。' };
    setRecommendation(SOFTWARE_LICENSES[key], reasons[key]); return;
  }

  if (composite) {
    const softwareKey = SOFTWARE_POLICY_MAP[elements.compositeSoftwarePolicy.value] || 'mit'; const creativeKey = elements.compositeCreativeLicense.value;
    state.recommendation = { type: 'composite', softwareKey, creativeKey };
    setRecommendation(`${SOFTWARE_LICENSES[softwareKey]} + ${getCreativeData(creativeKey).shortName}`, 'ソースコードと創作素材の適用範囲を分けたMulti-License構成です。第三者素材はこの指定で上書きされません。'); return;
  }

  const allowSharing = getChecked('allowSharing') !== 'no'; document.querySelectorAll('.creative-dependent').forEach((item) => { item.hidden = !allowSharing; });
  if (!allowSharing) { state.recommendation = { type: 'single', key: 'rights-reserved' }; setRecommendation('All Rights Reserved', '一般的な再利用許諾を与えない構成です。個別の利用規約を用意する場合にも使えます。'); return; }

  const attribution = getChecked('requireAttribution') !== 'no'; document.querySelectorAll('.attribution-dependent').forEach((item) => { item.hidden = !attribution; });
  if (!attribution) { state.recommendation = { type: 'single', key: 'cc0-1.0' }; setRecommendation('CC0 1.0', 'クレジットを要求せず、可能な限り自由な再利用を望む場合のCreative Commons公式ツールです。'); return; }

  const commercial = getChecked('allowCommercial') !== 'no'; const adaptation = getChecked('allowAdaptation') !== 'no'; const shareAlike = getChecked('shareAlike') === 'yes';
  elements.shareAlikeQuestion.hidden = !adaptation;
  let key;
  if (!adaptation) key = commercial ? 'cc-by-nd-4.0' : 'cc-by-nc-nd-4.0';
  else if (commercial) key = shareAlike ? 'cc-by-sa-4.0' : 'cc-by-4.0';
  else key = shareAlike ? 'cc-by-nc-sa-4.0' : 'cc-by-nc-4.0';
  state.recommendation = { type: 'single', key };
  setRecommendation(CREATIVE_LICENSES[key].shortName, CREATIVE_LICENSES[key].description);
}

function setRecommendation(title, reason) { elements.recommendationTitle.textContent = title; elements.recommendationReason.textContent = reason; }
async function applyRecommendation() { if (state.recommendation.type === 'composite') await loadCompositeLicense(state.recommendation.softwareKey, state.recommendation.creativeKey); else await loadSingleLicense(state.recommendation.key); document.querySelector('.layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

function getCurrentPrimaryKey() { return state.current?.type === 'single' ? state.current.key : (state.current?.softwareKey || 'mit'); }
function getCreativeData(key) { return key === 'rights-reserved' ? RIGHTS_RESERVED : CREATIVE_LICENSES[key]; }
function isSoftwareKey(key) { return Object.hasOwn(SOFTWARE_LICENSES, key); }

async function fetchSoftwareLicense(key) {
  if (state.softwareCache.has(key)) return state.softwareCache.get(key);
  const response = await fetch(`https://api.github.com/licenses/${encodeURIComponent(key)}`, { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
  if (!response.ok) throw new Error(`GitHub License API: ${response.status}`);
  const data = await response.json(); state.softwareCache.set(key, data); return data;
}

async function loadSingleLicense(key) {
  setStatus('ライセンス情報を準備しています…'); state.loading = true; setExportDisabled(true);
  try {
    if (isSoftwareKey(key)) {
      const data = await fetchSoftwareLicense(key); state.current = { type: 'single', category: 'software', key, data }; renderSoftwareSummary(data, `対象: ${WORK_TYPE_LABELS[state.workType] || 'ソフトウェア'}`);
    } else {
      const data = getCreativeData(key); state.current = { type: 'single', category: 'creative', key, data }; renderCreativeSummary(data, `対象: ${WORK_TYPE_LABELS[state.workType] || '創作物'}`);
    }
    elements.licenseSelect.value = key; renderCurrentText(); setStatus('準備できました。');
  } catch (error) { handleLoadError(error); }
  finally { state.loading = false; setExportDisabled(false); }
}

async function loadCompositeLicense(softwareKey, creativeKey) {
  setStatus('複合作品のライセンス情報を準備しています…'); state.loading = true; setExportDisabled(true);
  try {
    const softwareData = await fetchSoftwareLicense(softwareKey); const creativeData = getCreativeData(creativeKey);
    state.current = { type: 'composite', softwareKey, creativeKey, softwareData, creativeData };
    elements.licenseName.textContent = 'Multi-License Notice'; elements.licenseDescription.textContent = `${SOFTWARE_LICENSES[softwareKey]} をソースコードに、${creativeData.shortName} をオリジナル創作素材に適用する構成です。`;
    elements.spdxBadge.textContent = 'MULTI'; elements.sourceLink.href = creativeData.url || 'https://creativecommons.org/'; elements.sourceLink.hidden = false;
    elements.scopeBanner.hidden = false; elements.scopeBanner.textContent = `Source code: ${SOFTWARE_LICENSES[softwareKey]} ／ Original creative assets: ${creativeData.shortName}`;
    const permissions = [...new Set([...(softwareData.permissions || []).map(labelFeature), ...creativeData.permissions])]; const conditions = [...new Set([...(softwareData.conditions || []).map(labelFeature), ...creativeData.conditions])]; const limitations = [...new Set([...(softwareData.limitations || []).map(labelFeature), ...creativeData.limitations, '第三者素材は各素材の条件を優先'])];
    renderFeatureList(elements.permissionsList, permissions); renderFeatureList(elements.conditionsList, conditions); renderFeatureList(elements.limitationsList, limitations);
    elements.noticeTitle.textContent = '複合作品は適用範囲を分けています。'; elements.noticeText.textContent = '生成文書ではソースコードとオリジナル創作素材の範囲を分離します。第三者素材・フォント・ライブラリ等の既存ライセンスは変更しません。';
    renderCurrentText(); setStatus('準備できました。');
  } catch (error) { handleLoadError(error); }
  finally { state.loading = false; setExportDisabled(false); }
}

function renderSoftwareSummary(data, scope) {
  elements.licenseName.textContent = data.name || 'Unknown license'; elements.licenseDescription.textContent = data.description || '説明はありません。'; elements.spdxBadge.textContent = data.spdx_id || 'SPDX';
  elements.sourceLink.href = data.html_url || '#'; elements.sourceLink.hidden = !data.html_url; elements.scopeBanner.hidden = false; elements.scopeBanner.textContent = scope;
  renderFeatureList(elements.permissionsList, (data.permissions || []).map(labelFeature)); renderFeatureList(elements.conditionsList, (data.conditions || []).map(labelFeature)); renderFeatureList(elements.limitationsList, (data.limitations || []).map(labelFeature));
  elements.noticeTitle.textContent = '標準ソフトウェアライセンス本文はそのまま使います。'; elements.noticeText.textContent = 'GitHub License APIから標準本文を取得し、テンプレート化された年・著作者名のみ補完します。';
}
function renderCreativeSummary(data, scope) {
  elements.licenseName.textContent = data.name; elements.licenseDescription.textContent = data.description; elements.spdxBadge.textContent = data.spdx; elements.sourceLink.href = data.url || 'https://creativecommons.org/'; elements.sourceLink.hidden = false; elements.scopeBanner.hidden = false; elements.scopeBanner.textContent = scope;
  renderFeatureList(elements.permissionsList, data.permissions); renderFeatureList(elements.conditionsList, data.conditions); renderFeatureList(elements.limitationsList, data.limitations);
  elements.noticeTitle.textContent = data === RIGHTS_RESERVED ? '再利用許諾を与えない構成です。' : 'Creative Commonsの適用通知を生成します。';
  elements.noticeText.textContent = data === RIGHTS_RESERVED ? 'All Rights Reservedはオープンライセンスではありません。個別条件を付ける場合は別途利用規約を用意してください。' : 'CCの法的文書を改変せず、作品情報・選択したライセンス・公式URLを明示する適用通知を書き出します。';
}
function labelFeature(value) { return FEATURE_LABELS[value] || String(value).replace(/[_-]+/g, ' '); }
function renderFeatureList(container, items) { container.replaceChildren(); if (!items.length) { const empty = document.createElement('span'); empty.className = 'empty-chip'; empty.textContent = '記載なし'; container.appendChild(empty); return; } for (const item of items) { const chip = document.createElement('span'); chip.className = 'chip'; chip.textContent = item; container.appendChild(chip); } }

function renderCurrentText() {
  if (!state.current) return;
  if (state.current.type === 'composite') state.renderedText = buildCompositeNotice(state.current);
  else if (state.current.category === 'software') state.renderedText = buildSoftwareText(state.current.data);
  else state.renderedText = buildCreativeNotice(state.current.key, state.current.data);
  state.renderedText = normalizeLineEndings(state.renderedText).trimEnd() + '\n'; elements.licensePreview.textContent = state.renderedText;
}
function buildSoftwareText(data) { const year = getYear(); const owner = getOwner(); return personalizeLicense(data.body || '', { year, owner }); }
function buildCreativeNotice(key, data) {
  const project = getProject(); const owner = getOwner(); const year = getYear();
  if (key === 'rights-reserved') return `${project}\n\nCopyright (c) ${year} ${owner}\nAll Rights Reserved.\n\nNo permission is granted by this notice to reproduce, distribute, modify, or commercially use this work beyond rights already provided by applicable law.\nFor additional permission, contact the copyright holder.\n`;
  if (key === 'cc0-1.0') return `${project}\n\nCreator: ${owner}\nYear: ${year}\n\nThis work is dedicated under CC0 1.0 Universal.\nTo the extent possible under law, the creator has waived copyright and related or neighboring rights in this work.\n\nOfficial CC0 information:\n${data.url}\n\nThis dedication does not automatically waive rights that CC0 does not cover, such as certain trademark, patent, privacy, or publicity rights.\n`;
  return `${project}\n\nCreator: ${owner}\nYear: ${year}\nLicense: ${data.name} (${data.shortName})\n\nThis work is licensed under ${data.name}.\nYou may use the work according to the terms of that license.\n\nOfficial license information:\n${data.url}\n\nAttribution suggestion:\n"${project}" by ${owner}, licensed under ${data.shortName}.\n\nWhen required by the license, indicate if changes were made and include a link to the license.\n`;
}
function buildCompositeNotice(current) {
  const project = getProject(); const owner = getOwner(); const year = getYear(); const creative = buildCreativeNotice(current.creativeKey, current.creativeData);
  const softwareBody = personalizeLicense(current.softwareData.body || '', { year, owner });
  return `${project} — Multi-License Notice\n\nCopyright (c) ${year} ${owner}\n\n1. SOURCE CODE\n\nUnless a file or directory states otherwise, the original source code in this project is licensed under ${SOFTWARE_LICENSES[current.softwareKey]}.\n\n----- BEGIN SOFTWARE LICENSE -----\n${softwareBody.trim()}\n----- END SOFTWARE LICENSE -----\n\n2. ORIGINAL CREATIVE ASSETS\n\nUnless a specific asset states otherwise, original illustrations, audio, video, 3D models, textures, documentation, and other creative assets created for this project use the following terms:\n\n${creative.trim()}\n\n3. THIRD-PARTY MATERIALS\n\nThird-party libraries, fonts, images, audio, models, and other materials remain under their respective licenses. This notice does not replace or override those terms.\n`;
}
function getProject() { return elements.projectName.value.trim() || '[作品名]'; } function getOwner() { return elements.ownerName.value.trim() || '[著作者名]'; } function getYear() { return elements.copyrightYear.value.trim() || String(new Date().getFullYear()); }
function personalizeLicense(body, { year, owner }) { let result = normalizeLineEndings(body); const replacements = [[/\[year\]/gi, year],[/\[yyyy\]/gi,year],[/<year>/gi,year],[/\{year\}/gi,year],[/\[fullname\]/gi,owner],[/\[full name\]/gi,owner],[/\[name of copyright owner\]/gi,owner],[/\[copyright holder\]/gi,owner],[/\[copyright holders\]/gi,owner],[/<name of author>/gi,owner],[/<copyright holders>/gi,owner]]; for (const [pattern,replacement] of replacements) result=result.replace(pattern,replacement); return result; }
function normalizeLineEndings(text) { return String(text).replace(/\r\n?/g, '\n'); }
function getLicenseText() { if (!state.renderedText) throw new Error('ライセンス文書がまだ準備できていません。'); return state.renderedText; }

async function runExport(type) {
  if (state.loading) return;
  try { setStatus('ファイルを作成しています…'); if (type === 'license') exportPlainText('LICENSE'); else if (type === 'txt') exportPlainText('LICENSE.txt'); else if (type === 'pdf') await exportPdf(); else if (type === 'docx') await exportDocx(); else throw new Error('未対応のエクスポート形式です。'); setStatus(`${type.toUpperCase()}を書き出しました。`); }
  catch (error) { console.error(error); setStatus(error.message || 'エクスポートに失敗しました。', true); }
}
function exportPlainText(filename) { downloadBlob(new Blob([getLicenseText()], { type: 'text/plain;charset=utf-8' }), filename); }
async function exportDocx() {
  if (!window.docx) throw new Error('DOCX生成ライブラリを読み込めませんでした。');
  const { Document, Packer, Paragraph, TextRun } = window.docx; const lines = normalizeLineEndings(getLicenseText()).split('\n');
  const children = lines.map((line) => new Paragraph({ spacing: { after: line === '' ? 120 : 0, line: 276 }, children: line === '' ? [] : [new TextRun({ text: line, font: 'Aptos', size: 20 })] }));
  const documentFile = new Document({ creator: getOwner(), title: `${getProject()} License`, description: 'Generated by License Creator', sections: [{ properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } }, children }] });
  downloadBlob(await Packer.toBlob(documentFile), 'LICENSE.docx');
}
async function exportPdf() {
  if (!window.jspdf?.jsPDF) throw new Error('PDF生成ライブラリを読み込めませんでした。');
  const { jsPDF } = window.jspdf; const pages = renderTextToCanvasPages(getLicenseText()); const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pages.forEach((canvas, index) => { if (index > 0) pdf.addPage('a4','portrait'); pdf.addImage(canvas.toDataURL('image/jpeg',0.9),'JPEG',0,0,210,297,undefined,'FAST'); });
  pdf.setProperties({ title: `${getProject()} License`, author: getOwner(), creator: 'License Creator' }); pdf.save('LICENSE.pdf');
}
function renderTextToCanvasPages(text) {
  const width=1240,height=1754,marginX=92,marginTop=88,marginBottom=88,fontSize=20,lineHeight=31,font=`${fontSize}px ui-monospace, SFMono-Regular, Consolas, "Noto Sans Mono", "Noto Sans JP", monospace`,maxTextWidth=width-marginX*2;
  const measureCanvas=document.createElement('canvas'),measureContext=measureCanvas.getContext('2d'); measureContext.font=font; const wrappedLines=[];
  for (const rawLine of normalizeLineEndings(text).split('\n')) wrappedLines.push(...wrapCanvasLine(measureContext,rawLine,maxTextWidth));
  const linesPerPage=Math.max(1,Math.floor((height-marginTop-marginBottom)/lineHeight)),pageCount=Math.max(1,Math.ceil(wrappedLines.length/linesPerPage)),pages=[];
  for(let pageIndex=0;pageIndex<pageCount;pageIndex+=1){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,width,height);context.fillStyle='#111827';context.font=font;context.textBaseline='top';const start=pageIndex*linesPerPage,end=Math.min(start+linesPerPage,wrappedLines.length);let y=marginTop;for(let index=start;index<end;index+=1){context.fillText(wrappedLines[index],marginX,y);y+=lineHeight;}context.fillStyle='#7b8497';context.font='16px system-ui, sans-serif';context.textAlign='right';context.fillText(`${pageIndex+1} / ${pageCount}`,width-marginX,height-48);pages.push(canvas);}return pages;
}
function wrapCanvasLine(context,rawLine,maxWidth){if(rawLine==='')return[''];if(context.measureText(rawLine).width<=maxWidth)return[rawLine];const leading=rawLine.match(/^\s*/)?.[0]||'',content=rawLine.slice(leading.length),words=content.split(/(\s+)/).filter(Boolean),lines=[];let current=leading;for(const word of words){const candidate=current+word;if(context.measureText(candidate).width<=maxWidth||current.trim()===''){current=candidate;continue;}lines.push(current.trimEnd());current=`${leading}${word.trimStart()}`;if(context.measureText(current).width>maxWidth){const hard=hardWrapCanvasText(context,current,maxWidth,leading);lines.push(...hard.slice(0,-1));current=hard.at(-1)||leading;}}if(current!=='')lines.push(current.trimEnd());return lines.length?lines:[''];}
function hardWrapCanvasText(context,text,maxWidth,leading){const lines=[];let current='';for(const char of Array.from(text)){const candidate=current+char;if(context.measureText(candidate).width>maxWidth&&current){lines.push(current);current=`${leading}${char}`;}else current=candidate;}if(current)lines.push(current);return lines;}
async function copyLicenseText(){try{await navigator.clipboard.writeText(getLicenseText());setStatus('文書全文をコピーしました。');}catch(error){console.error(error);setStatus('コピーできませんでした。',true);}}
function downloadBlob(blob,filename){const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function setExportDisabled(disabled){document.querySelectorAll('[data-export]').forEach((button)=>{button.disabled=disabled;});elements.copyButton.disabled=disabled;}
function setStatus(message,isError=false){elements.statusMessage.textContent=message;elements.statusMessage.classList.toggle('error',isError);}
function handleLoadError(error){console.error(error);state.current=null;state.renderedText='';elements.licenseName.textContent='取得できませんでした';elements.licenseDescription.textContent='ライセンス情報の取得に失敗しました。通信状態またはAPI制限を確認してください。';elements.licensePreview.textContent='文書を生成できませんでした。';elements.spdxBadge.textContent='ERROR';elements.scopeBanner.hidden=true;renderFeatureList(elements.permissionsList,[]);renderFeatureList(elements.conditionsList,[]);renderFeatureList(elements.limitationsList,[]);setStatus('ライセンス情報の取得に失敗しました。',true);}

document.addEventListener('DOMContentLoaded', init);
