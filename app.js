'use strict';

const DATA = window.LICENSE_DATA;
const STORAGE_KEY = 'license-studio-project-v3';
const STATE_LABELS = {
  ja: { allow: '許可', ask: '要相談', deny: '禁止' },
  en: { allow: 'Allowed', ask: 'Ask first', deny: 'Prohibited' }
};

let state = structuredClone(DATA.defaultState);
state.softwareScope = '';
state.includeCoverPage = true;
state.includeDisclaimer = true;
let zoom = 0.75;
let saveTimer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const el = {
  saveStatus: $('#saveStatus'), exportProjectButton: $('#exportProjectButton'), importProjectInput: $('#importProjectInput'),
  titleInput: $('#titleInput'), creatorInput: $('#creatorInput'), workNameInput: $('#workNameInput'), workTypeSelect: $('#workTypeSelect'), versionInput: $('#versionInput'), updatedAtInput: $('#updatedAtInput'), workUrlInput: $('#workUrlInput'), contactInput: $('#contactInput'),
  languageSelect: $('#languageSelect'), themeSelect: $('#themeSelect'), accentInput: $('#accentInput'), accentTextInput: $('#accentTextInput'), coverInput: $('#coverInput'), coverFileRow: $('#coverFileRow'), coverFileName: $('#coverFileName'), removeCoverButton: $('#removeCoverButton'),
  customSection: $('#customSection'), ccSection: $('#ccSection'), softwareSection: $('#softwareSection'), presetSelect: $('#presetSelect'), policyMatrix: $('#policyMatrix'), creditTextInput: $('#creditTextInput'), shareAlikeInput: $('#shareAlikeInput'), noExtractionInput: $('#noExtractionInput'), notesInput: $('#notesInput'), customClauses: $('#customClauses'), addClauseButton: $('#addClauseButton'),
  restrictionAdult: $('#restrictionAdult'), restrictionPolitical: $('#restrictionPolitical'), restrictionAi: $('#restrictionAi'), restrictionNft: $('#restrictionNft'), restrictionHarmful: $('#restrictionHarmful'), restrictionImpersonation: $('#restrictionImpersonation'),
  ccLicenseSelect: $('#ccLicenseSelect'), ccResultCard: $('#ccResultCard'), softwareLicenseSelect: $('#softwareLicenseSelect'), softwareResultCard: $('#softwareResultCard'), softwareScopeInput: $('#softwareScopeInput'),
  includeCoverPageInput: $('#includeCoverPageInput'), includeDisclaimerInput: $('#includeDisclaimerInput'), downloadPdfButton: $('#downloadPdfButton'), statusMessage: $('#statusMessage'), previewPageCount: $('#previewPageCount'), zoomLabel: $('#zoomLabel'), pdfDocument: $('#pdfDocument'), clauseTemplate: $('#clauseTemplate')
};

function init() {
  loadState();
  if (!state.updatedAt) state.updatedAt = new Date().toISOString().slice(0, 10);
  populateSelects();
  buildPolicyMatrix();
  bindEvents();
  syncControlsFromState();
  render();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') state = mergeState(DATA.defaultState, saved);
  } catch (error) { console.warn('Saved state could not be read.', error); }
}

function mergeState(base, incoming) {
  const merged = structuredClone(base);
  Object.assign(merged, incoming);
  merged.policies = { ...base.policies, ...(incoming.policies || {}) };
  merged.restrictions = { ...base.restrictions, ...(incoming.restrictions || {}) };
  merged.customClauses = Array.isArray(incoming.customClauses) ? incoming.customClauses : [];
  merged.softwareScope = incoming.softwareScope || '';
  merged.includeCoverPage = incoming.includeCoverPage !== false;
  merged.includeDisclaimer = incoming.includeDisclaimer !== false;
  return merged;
}

function populateSelects() {
  el.workTypeSelect.innerHTML = Object.entries(DATA.workTypes).map(([key, item]) => `<option value="${key}">${item.label}</option>`).join('');
  el.presetSelect.innerHTML = Object.entries(DATA.customPresets).map(([key, item]) => `<option value="${key}">${item.name}</option>`).join('');
  el.ccLicenseSelect.innerHTML = Object.entries(DATA.ccLicenses).map(([key, item]) => `<option value="${key}">${item.short}</option>`).join('');
  el.softwareLicenseSelect.innerHTML = Object.entries(DATA.softwareLicenses).map(([key, item]) => `<option value="${key}">${item.short}</option>`).join('');
}

function buildPolicyMatrix() {
  el.policyMatrix.innerHTML = DATA.policyItems.map(item => `
    <div class="policy-row" data-policy="${item.key}">
      <div class="policy-info"><span class="policy-icon">${item.icon}</span><span><strong>${item.label}</strong><small>${item.description}</small></span></div>
      <div class="policy-choices">
        <button class="policy-choice" type="button" data-state="allow">許可</button>
        <button class="policy-choice" type="button" data-state="ask">要相談</button>
        <button class="policy-choice" type="button" data-state="deny">禁止</button>
      </div>
    </div>`).join('');
}

function bindEvents() {
  $$('.mode-button').forEach(button => button.addEventListener('click', () => { state.mode = button.dataset.mode; renderAndSave(); }));
  bindValue(el.titleInput, 'title'); bindValue(el.creatorInput, 'creator'); bindValue(el.workNameInput, 'workName'); bindValue(el.workTypeSelect, 'workType', 'change'); bindValue(el.versionInput, 'version'); bindValue(el.updatedAtInput, 'updatedAt', 'change'); bindValue(el.workUrlInput, 'workUrl'); bindValue(el.contactInput, 'contact');
  bindValue(el.languageSelect, 'language', 'change'); bindValue(el.themeSelect, 'theme', 'change'); bindValue(el.creditTextInput, 'creditText'); bindValue(el.notesInput, 'notes'); bindValue(el.softwareScopeInput, 'softwareScope');
  el.accentInput.addEventListener('input', () => setAccent(el.accentInput.value));
  el.accentTextInput.addEventListener('change', () => setAccent(el.accentTextInput.value));
  el.coverInput.addEventListener('change', handleCoverUpload); el.removeCoverButton.addEventListener('click', removeCover);
  el.presetSelect.addEventListener('change', () => applyPreset(el.presetSelect.value));
  el.policyMatrix.addEventListener('click', event => { const button = event.target.closest('.policy-choice'); if (!button) return; const row = button.closest('[data-policy]'); state.policies[row.dataset.policy] = button.dataset.state; renderAndSave(); });
  $$('[data-segment]').forEach(group => group.addEventListener('click', event => { const button = event.target.closest('button[data-value]'); if (!button) return; handleSegment(group.dataset.segment, button.dataset.value); }));
  bindCheck(el.shareAlikeInput, 'shareAlike'); bindCheck(el.noExtractionInput, 'noExtraction');
  bindRestriction(el.restrictionAdult, 'adult'); bindRestriction(el.restrictionPolitical, 'political'); bindRestriction(el.restrictionAi, 'ai'); bindRestriction(el.restrictionNft, 'nft'); bindRestriction(el.restrictionHarmful, 'harmful'); bindRestriction(el.restrictionImpersonation, 'impersonation');
  el.addClauseButton.addEventListener('click', () => { state.customClauses.push({ title: '追加条項', body: '' }); syncClauseEditor(); renderAndSave(); });
  el.customClauses.addEventListener('input', updateClausesFromDom); el.customClauses.addEventListener('click', event => { const button = event.target.closest('.clause-remove'); if (!button) return; const index = Number(button.closest('.clause-item').dataset.index); state.customClauses.splice(index, 1); syncClauseEditor(); renderAndSave(); });
  el.ccLicenseSelect.addEventListener('change', () => { state.ccLicense = el.ccLicenseSelect.value; syncCCQuestionsFromLicense(); renderAndSave(); });
  el.softwareLicenseSelect.addEventListener('change', () => { state.softwareLicense = el.softwareLicenseSelect.value; renderAndSave(); });
  bindCheck(el.includeCoverPageInput, 'includeCoverPage'); bindCheck(el.includeDisclaimerInput, 'includeDisclaimer');
  el.downloadPdfButton.addEventListener('click', exportPdf);
  el.exportProjectButton.addEventListener('click', exportProject); el.importProjectInput.addEventListener('change', importProject);
  $$('[data-zoom]').forEach(button => button.addEventListener('click', () => changeZoom(button.dataset.zoom)));
}

function bindValue(input, key, eventName = 'input') { input.addEventListener(eventName, () => { state[key] = input.value; renderAndSave(); }); }
function bindCheck(input, key) { input.addEventListener('change', () => { state[key] = input.checked; renderAndSave(); }); }
function bindRestriction(input, key) { input.addEventListener('change', () => { state.restrictions[key] = input.checked; renderAndSave(); }); }

function setAccent(value) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) { el.accentTextInput.value = state.accent; return; }
  state.accent = value; el.accentInput.value = value; el.accentTextInput.value = value; document.documentElement.style.setProperty('--app-accent', value); renderAndSave();
}

function handleSegment(segment, value) {
  if (segment === 'credit') state.credit = value;
  if (segment === 'ccCommercial') { state.ccCommercial = value === 'yes'; state.ccLicense = recommendCC(); }
  if (segment === 'ccAdaptation') { state.ccAdaptation = value; state.ccLicense = recommendCC(); }
  renderAndSave();
}

function recommendCC() {
  if (!state.ccCommercial && state.ccAdaptation === 'no') return 'CC-BY-NC-ND-4.0';
  if (!state.ccCommercial && state.ccAdaptation === 'same') return 'CC-BY-NC-SA-4.0';
  if (!state.ccCommercial) return 'CC-BY-NC-4.0';
  if (state.ccAdaptation === 'no') return 'CC-BY-ND-4.0';
  if (state.ccAdaptation === 'same') return 'CC-BY-SA-4.0';
  return 'CC-BY-4.0';
}

function syncCCQuestionsFromLicense() {
  const key = state.ccLicense;
  if (key === 'CC0-1.0') { state.ccCommercial = true; state.ccAdaptation = 'yes'; return; }
  state.ccCommercial = !key.includes('-NC');
  state.ccAdaptation = key.includes('-ND') ? 'no' : key.includes('-SA') ? 'same' : 'yes';
}

function applyPreset(key) {
  const preset = DATA.customPresets[key]; if (!preset) return;
  state.preset = key; state.policies = structuredClone(preset.policies); state.credit = preset.credit; state.shareAlike = preset.shareAlike; state.noExtraction = preset.noExtraction; state.restrictions = structuredClone(preset.restrictions); renderAndSave();
}

function handleCoverUpload() {
  const file = el.coverInput.files?.[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { setStatus('画像は5MB以下にしてください。', true); return; }
  const reader = new FileReader();
  reader.onload = () => { state.coverImage = String(reader.result); state.coverImageName = file.name; renderAndSave(); };
  reader.readAsDataURL(file);
}
function removeCover() { state.coverImage = ''; state.coverImageName = ''; el.coverInput.value = ''; renderAndSave(); }

function updateClausesFromDom() {
  state.customClauses = $$('.clause-item').map(item => ({ title: item.querySelector('.clause-title').value, body: item.querySelector('.clause-body').value })); renderAndSave(false);
}

function syncControlsFromState() {
  el.titleInput.value = state.title; el.creatorInput.value = state.creator; el.workNameInput.value = state.workName; el.workTypeSelect.value = state.workType; el.versionInput.value = state.version; el.updatedAtInput.value = state.updatedAt; el.workUrlInput.value = state.workUrl; el.contactInput.value = state.contact;
  el.languageSelect.value = state.language; el.themeSelect.value = state.theme; el.accentInput.value = state.accent; el.accentTextInput.value = state.accent; el.presetSelect.value = state.preset; el.creditTextInput.value = state.creditText; el.shareAlikeInput.checked = state.shareAlike; el.noExtractionInput.checked = state.noExtraction; el.notesInput.value = state.notes;
  el.restrictionAdult.checked = state.restrictions.adult; el.restrictionPolitical.checked = state.restrictions.political; el.restrictionAi.checked = state.restrictions.ai; el.restrictionNft.checked = state.restrictions.nft; el.restrictionHarmful.checked = state.restrictions.harmful; el.restrictionImpersonation.checked = state.restrictions.impersonation;
  el.ccLicenseSelect.value = state.ccLicense; el.softwareLicenseSelect.value = state.softwareLicense; el.softwareScopeInput.value = state.softwareScope || ''; el.includeCoverPageInput.checked = state.includeCoverPage; el.includeDisclaimerInput.checked = state.includeDisclaimer;
  syncClauseEditor(); document.documentElement.style.setProperty('--app-accent', state.accent);
}

function syncClauseEditor() {
  el.customClauses.replaceChildren();
  state.customClauses.forEach((clause, index) => {
    const node = el.clauseTemplate.content.firstElementChild.cloneNode(true); node.dataset.index = index; node.querySelector('.clause-title').value = clause.title || ''; node.querySelector('.clause-body').value = clause.body || ''; el.customClauses.appendChild(node);
  });
}

function renderAndSave(syncEditor = true) { if (syncEditor) syncControlsFromState(); render(); scheduleSave(); }
function scheduleSave() { clearTimeout(saveTimer); el.saveStatus.textContent = '保存中…'; saveTimer = setTimeout(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); el.saveStatus.textContent = '保存済み'; } catch { el.saveStatus.textContent = '保存できません'; } }, 250); }

function render() {
  renderMode(); renderEditorState(); renderStandardResults(); renderPreview();
}

function renderMode() {
  $$('.mode-button').forEach(button => button.classList.toggle('active', button.dataset.mode === state.mode));
  el.customSection.hidden = state.mode !== 'custom'; el.ccSection.hidden = state.mode !== 'cc'; el.softwareSection.hidden = state.mode !== 'software';
}

function renderEditorState() {
  $$('.policy-row').forEach(row => row.querySelectorAll('.policy-choice').forEach(button => button.classList.toggle('active', button.dataset.state === state.policies[row.dataset.policy])));
  setSegment('credit', state.credit); setSegment('ccCommercial', state.ccCommercial ? 'yes' : 'no'); setSegment('ccAdaptation', state.ccAdaptation); el.ccLicenseSelect.value = state.ccLicense; el.softwareLicenseSelect.value = state.softwareLicense;
  el.coverFileRow.hidden = !state.coverImage; el.coverFileName.textContent = state.coverImageName || '選択中の画像';
}
function setSegment(name, value) { const group = document.querySelector(`[data-segment="${name}"]`); if (!group) return; group.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.value === value)); }

function renderStandardResults() {
  const cc = DATA.ccLicenses[state.ccLicense];
  el.ccResultCard.innerHTML = `<h4>${escapeHTML(cc.short)}</h4><p>${escapeHTML(cc.name)}</p><div class="result-tags">${[...cc.allow,...cc.conditions].slice(0,6).map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div>`;
  const sw = DATA.softwareLicenses[state.softwareLicense];
  el.softwareResultCard.innerHTML = `<h4>${escapeHTML(sw.short)}</h4><p>${escapeHTML(sw.description)}</p><div class="result-tags">${[...sw.allow,...sw.conditions].slice(0,6).map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div>`;
}

function renderPreview() {
  const pages = [];
  if (state.includeCoverPage) pages.push(renderCoverPage());
  pages.push(state.mode === 'custom' ? renderCustomPage() : renderStandardPage());
  if (state.mode === 'custom' && (state.customClauses.length > 2 || state.notes.length > 380)) pages.push(renderDetailsPage());
  el.pdfDocument.innerHTML = pages.join('');
  el.previewPageCount.textContent = `${pages.length} page${pages.length === 1 ? '' : 's'}`;
  el.pdfDocument.style.setProperty('--preview-scale', zoom);
  el.zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
}

function pageShell(content, pageClass = '', pageNumber = '') {
  return `<article class="pdf-page theme-${state.theme} ${pageClass}" style="--pdf-accent:${state.accent}"><div class="pdf-decoration a"></div><div class="pdf-decoration b"></div><div class="pdf-inner">${content}${pageNumber ? pdfFooter(pageNumber) : ''}</div></article>`;
}

function renderCoverPage() {
  const work = DATA.workTypes[state.workType] || DATA.workTypes.other;
  const title = localized(state.title, state.title || 'License Guide');
  const modeLabel = state.mode === 'custom' ? (state.language === 'en' ? 'Custom Terms of Use' : 'カスタム利用規約') : state.mode === 'cc' ? DATA.ccLicenses[state.ccLicense].short : DATA.softwareLicenses[state.softwareLicense].short;
  const visual = state.coverImage ? `<div class="cover-art has-image"><img src="${state.coverImage}" alt=""></div>` : `<div class="cover-art"><div class="cover-placeholder"><span class="visual-icon">${work.icon}</span><strong>${escapeHTML(work.label)}</strong><span>${escapeHTML(work.en)}</span></div></div>`;
  return pageShell(`<div class="cover-head"><div><p class="pdf-kicker">LICENSE / TERMS OF USE</p><h1 class="pdf-title">${escapeHTML(title)}</h1><p class="pdf-subtitle">${escapeHTML(coverSubtitle())}</p></div><div class="cover-badge">${escapeHTML(modeLabel)}</div></div><div class="cover-visual">${visual}</div><div class="cover-meta"><div><span>${t('Creator','作者')}</span><strong>${escapeHTML(state.creator || '—')}</strong></div><div><span>${t('Work','作品')}</span><strong>${escapeHTML(state.workName || '—')}</strong></div><div><span>${t('Updated','更新')}</span><strong>${escapeHTML(state.updatedAt || '—')}</strong></div></div>`, 'pdf-cover');
}

function coverSubtitle() {
  if (state.language === 'en') return `A clear, visual guide to how “${state.workName || 'this work'}” may be used.`;
  if (state.language === 'both') return `「${state.workName || 'この作品'}」の利用条件をわかりやすくまとめたガイドです。 / A clear visual guide to permitted use.`;
  return `「${state.workName || 'この作品'}」をどのように使えるか、許可・条件・禁止事項をわかりやすくまとめたガイドです。`;
}

function renderCustomPage() {
  const groups = groupPolicies();
  const policyRows = DATA.policyItems.map(item => { const status = state.policies[item.key]; return `<div class="pdf-policy-row"><span class="pdf-policy-icon">${item.icon}</span><span><strong>${escapeHTML(languageItem(item,'label','en'))}</strong><small>${escapeHTML(state.language==='en'?item.en:item.description)}</small></span><span class="pdf-state ${status}">${escapeHTML(stateText(status))}</span></div>`; }).join('');
  const restrictions = restrictionLabels();
  const clauses = state.customClauses.slice(0,2).filter(x=>x.title||x.body).map(x=>`<div class="pdf-clause"><strong>${escapeHTML(x.title || t('Additional clause','追加条項'))}</strong><p>${escapeHTML(x.body || '—')}</p></div>`).join('');
  return pageShell(`<div class="pdf-page-header"><div><p class="pdf-kicker">TERMS AT A GLANCE</p><h2>${escapeHTML(t('Usage guide','利用ガイド'))}</h2><p>${escapeHTML(summaryIntro())}</p></div><div class="pdf-page-number">${escapeHTML(state.version ? `v${state.version}` : '')}</div></div><div class="pdf-summary-grid">${summaryCard('allow','✓',t('Allowed','できること'),groups.allow)}${summaryCard('ask','!',t('Ask first','要相談'),groups.ask)}${summaryCard('deny','×',t('Prohibited','禁止'),groups.deny)}</div><section class="pdf-section"><div class="pdf-section-title"><span>01</span><h3>${escapeHTML(t('Permission matrix','用途別の利用条件'))}</h3></div><div class="pdf-policy-grid">${policyRows}</div></section><section class="pdf-section"><div class="pdf-section-title"><span>02</span><h3>${escapeHTML(t('Credit & conditions','クレジット・条件'))}</h3></div><div class="pdf-info-box pdf-credit-box"><p>${escapeHTML(creditDescription())}</p><div><span class="pdf-badge">${escapeHTML(creditStateText())}</span>${state.creditText ? `<div class="pdf-credit-example">${escapeHTML(state.creditText)}</div>`:''}</div></div></section>${restrictions.length ? `<section class="pdf-section"><div class="pdf-section-title"><span>03</span><h3>${escapeHTML(t('Restrictions','追加の禁止事項'))}</h3></div><div class="pdf-restrictions">${restrictions.map(x=>`<span>${escapeHTML(x)}</span>`).join('')}</div></section>`:''}${clauses ? `<section class="pdf-section"><div class="pdf-section-title"><span>04</span><h3>${escapeHTML(t('Additional clauses','独自条項'))}</h3></div><div class="pdf-clauses">${clauses}</div></section>`:''}${state.notes ? `<section class="pdf-section"><div class="pdf-section-title"><span>05</span><h3>${escapeHTML(t('Notes','補足'))}</h3></div><div class="pdf-info-box"><p>${escapeHTML(shorten(state.notes,380))}</p></div></section>`:''}`, '', state.includeCoverPage ? '2' : '1');
}

function renderDetailsPage() {
  const clauses = state.customClauses.filter(x=>x.title||x.body).map(x=>`<div class="pdf-clause"><strong>${escapeHTML(x.title || t('Additional clause','追加条項'))}</strong><p>${escapeHTML(x.body || '—')}</p></div>`).join('');
  return pageShell(`<div class="pdf-page-header"><div><p class="pdf-kicker">DETAILS</p><h2>${escapeHTML(t('Detailed terms','詳細条件'))}</h2><p>${escapeHTML(t('Additional notes and custom clauses for this work.','この作品に関する補足事項と独自条項です。'))}</p></div></div>${state.notes ? `<section class="pdf-section"><div class="pdf-section-title"><span>01</span><h3>${escapeHTML(t('Notes','補足・注意事項'))}</h3></div><div class="pdf-info-box"><p>${escapeHTML(state.notes)}</p></div></section>`:''}${clauses ? `<section class="pdf-section"><div class="pdf-section-title"><span>02</span><h3>${escapeHTML(t('Custom clauses','独自条項'))}</h3></div><div class="pdf-clauses">${clauses}</div></section>`:''}${contactSection()}${disclaimer()}`, '', state.includeCoverPage ? '3' : '2');
}

function renderStandardPage() {
  if (state.mode === 'cc') return renderCCPage();
  return renderSoftwarePage();
}

function renderCCPage() {
  const cc = DATA.ccLicenses[state.ccLicense];
  const allow = state.language==='en' ? cc.enAllow : cc.allow;
  const conditions = state.language==='en' ? cc.enConditions : cc.conditions;
  const deny = state.language==='en' ? cc.deny.map(x=>x==='商用利用'?'Commercial use':x==='改変物の共有'?'Sharing adaptations':x) : cc.deny;
  return pageShell(`<div class="pdf-page-header"><div><p class="pdf-kicker">CREATIVE COMMONS</p><h2>${escapeHTML(cc.short)}</h2><p>${escapeHTML(cc.name)}</p></div><div class="pdf-page-number">CC</div></div><div class="pdf-standard-hero"><div><h3>${escapeHTML(state.workName || t('Licensed work','対象作品'))}</h3><p>${escapeHTML(ccNotice(cc))}</p></div><div class="standard-mark">${escapeHTML(cc.short.replace(' 4.0',''))}</div></div><div class="pdf-three-cols">${listBox(t('You may','できること'),allow)}${listBox(t('Conditions','条件'),conditions)}${listBox(t('Not permitted','制限'),deny.length?deny:[t('No extra restrictions','追加の制限なし')])}</div><section class="pdf-section"><div class="pdf-section-title"><span>01</span><h3>${escapeHTML(t('Attribution','表示例'))}</h3></div><div class="pdf-info-box"><p>${escapeHTML(`${state.workName || 'Work'} © ${state.creator || 'Creator'} — ${cc.short}`)}</p></div></section><section class="pdf-section"><div class="pdf-section-title"><span>02</span><h3>${escapeHTML(t('Official license','公式ライセンス'))}</h3></div><div class="pdf-info-box"><p class="pdf-link">${escapeHTML(cc.url)}</p></div></section>${contactSection()}${disclaimer(true)}`, '', state.includeCoverPage ? '2' : '1');
}

function renderSoftwarePage() {
  const sw = DATA.softwareLicenses[state.softwareLicense];
  return pageShell(`<div class="pdf-page-header"><div><p class="pdf-kicker">SOFTWARE LICENSE</p><h2>${escapeHTML(sw.short)}</h2><p>${escapeHTML(sw.name)}</p></div><div class="pdf-page-number">SPDX: ${escapeHTML(sw.spdx)}</div></div><div class="pdf-standard-hero"><div><h3>${escapeHTML(state.workName || t('Software project','ソフトウェア'))}</h3><p>${escapeHTML(sw.description)}</p></div><div class="standard-mark">${escapeHTML(sw.short)}</div></div><div class="pdf-three-cols">${listBox(t('Permissions','許可'),sw.allow)}${listBox(t('Conditions','条件'),sw.conditions)}${listBox(t('Limitations','制限'),sw.limitations)}</div>${state.softwareScope ? `<section class="pdf-section"><div class="pdf-section-title"><span>01</span><h3>${escapeHTML(t('Scope','適用範囲'))}</h3></div><div class="pdf-info-box"><p>${escapeHTML(state.softwareScope)}</p></div></section>`:''}<section class="pdf-section"><div class="pdf-section-title"><span>02</span><h3>${escapeHTML(t('License reference','ライセンス参照先'))}</h3></div><div class="pdf-info-box"><p class="pdf-link">${escapeHTML(sw.url)}</p></div></section>${contactSection()}${disclaimer(true)}`, '', state.includeCoverPage ? '2' : '1');
}

function summaryCard(kind,symbol,title,items){ return `<div class="pdf-summary-card ${kind}"><span class="summary-symbol">${symbol}</span><h3>${escapeHTML(title)}</h3><ul>${items.length?items.slice(0,5).map(x=>`<li>${escapeHTML(x)}</li>`).join(''):`<li>${escapeHTML(t('None','なし'))}</li>`}</ul></div>`; }
function listBox(title,items){ return `<div class="pdf-list-box"><h4>${escapeHTML(title)}</h4><ul>${items.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>`; }
function groupPolicies(){ const groups={allow:[],ask:[],deny:[]}; DATA.policyItems.forEach(item=>groups[state.policies[item.key]].push(languageItem(item,'label','en'))); return groups; }
function restrictionLabels(){ const map={adult:t('Adult content','成人向け利用'),political:t('Political / religious use','政治・宗教活動'),ai:t('AI / ML training','AI・機械学習'),nft:t('NFT / crypto assets','NFT・暗号資産'),harmful:t('Illegal / harmful use','違法・中傷・有害利用'),impersonation:t('Impersonating official use','公式・公認を装う利用')}; return Object.entries(state.restrictions).filter(([,v])=>v).map(([k])=>map[k]); }
function stateText(status){ return state.language==='en'?STATE_LABELS.en[status]:STATE_LABELS.ja[status]; }
function creditStateText(){ if(state.credit==='required')return t('Required','必須'); if(state.credit==='recommended')return t('Recommended','推奨'); return t('Not required','不要'); }
function creditDescription(){ if(state.credit==='required')return t('Credit must be displayed when using this work.','この作品を利用する場合、クレジット表記が必要です。'); if(state.credit==='recommended')return t('Credit is appreciated but not mandatory.','クレジット表記を推奨しますが、必須ではありません。'); return t('Credit is not required.','クレジット表記は不要です。'); }
function summaryIntro(){ return t(`Usage conditions for “${state.workName || 'this work'}”. Check the status for each type of use before using it.`,`「${state.workName || 'この作品'}」の利用条件です。用途ごとの「許可・要相談・禁止」を確認してからご利用ください。`); }
function ccNotice(cc){ return state.language==='en' ? `“${state.workName || 'This work'}” by ${state.creator || 'the creator'} is made available under ${cc.name}. Follow the official license terms at the URL below.` : `「${state.workName || 'この作品'}」は、${state.creator || '著作者'}により ${cc.name} の条件で提供されます。正式な条件は下記の公式ライセンスを確認してください。`; }
function contactSection(){ if(!state.contact&&!state.workUrl)return ''; return `<section class="pdf-section"><div class="pdf-section-title"><span>03</span><h3>${escapeHTML(t('Contact / source','問い合わせ・配布元'))}</h3></div><div class="pdf-info-box"><p>${escapeHTML([state.contact,state.workUrl].filter(Boolean).join('\n'))}</p></div></section>`; }
function disclaimer(standard=false){ if(!state.includeDisclaimer)return ''; const text= standard ? t('This PDF is a human-readable summary. The official standard license text controls if there is any conflict.','このPDFは人が読みやすい要約です。標準ライセンスについて内容が矛盾する場合は、公式のライセンス本文が優先されます。') : t('This document is a creator-provided terms-of-use guide and is not legal advice. Rights belonging to third parties are not granted by this document.','この文書は著作者が提示する利用条件のガイドであり、法的助言ではありません。第三者が有する権利まで許諾するものではありません。'); return `<div class="pdf-disclaimer">${escapeHTML(text)}</div>`; }
function pdfFooter(number){ return `<div class="pdf-footer"><span>${escapeHTML(state.creator || 'License Studio')} · ${escapeHTML(state.workName || '')}</span><span>${escapeHTML(number)}</span></div>`; }
function t(en,ja){ if(state.language==='en')return en; if(state.language==='both')return `${ja} / ${en}`; return ja; }
function languageItem(item,jaKey,enKey){ if(state.language==='en')return item[enKey]; if(state.language==='both')return `${item[jaKey]} / ${item[enKey]}`; return item[jaKey]; }
function localized(ja,en){ return state.language==='en'?en:ja; }
function shorten(value,max){ return value.length>max?`${value.slice(0,max-1)}…`:value; }
function escapeHTML(value){ return String(value??'').replace(/[&<>'"]/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[ch])); }

function changeZoom(direction){ zoom = Math.min(1.1, Math.max(.4, zoom + (direction==='in'?.1:-.1))); renderPreview(); }

async function exportPdf(){
  try {
    if(!window.html2canvas||!window.jspdf?.jsPDF) throw new Error('PDF生成ライブラリを読み込めませんでした。');
    setStatus('PDFを生成しています…'); el.downloadPdfButton.disabled=true;
    const pages=$$('.pdf-page'); if(!pages.length) throw new Error('出力するページがありません。');
    const { jsPDF }=window.jspdf; const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    for(let i=0;i<pages.length;i+=1){ if(i>0)pdf.addPage('a4','portrait'); const canvas=await html2canvas(pages[i],{scale:2,useCORS:true,backgroundColor:null,logging:false}); const image=canvas.toDataURL('image/jpeg',.96); pdf.addImage(image,'JPEG',0,0,210,297,undefined,'FAST'); }
    pdf.setProperties({title:state.title||'License',subject:'License / Terms of Use',author:state.creator||'License Studio',creator:'License Studio'});
    pdf.save(`${safeFilename(state.workName||state.title||'license')}-license.pdf`); setStatus('PDFを書き出しました。');
  } catch(error){ console.error(error); setStatus(error.message||'PDFの生成に失敗しました。',true); }
  finally { el.downloadPdfButton.disabled=false; }
}

function exportProject(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json;charset=utf-8'}); downloadBlob(blob,`${safeFilename(state.workName||'license-project')}.license-studio.json`); }
function importProject(){ const file=el.importProjectInput.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try{ const parsed=JSON.parse(String(reader.result)); state=mergeState(DATA.defaultState,parsed); syncControlsFromState(); renderAndSave(); setStatus('設定を読み込みました。'); }catch{ setStatus('設定ファイルを読み込めませんでした。',true); } finally{ el.importProjectInput.value=''; } }; reader.readAsText(file); }
function downloadBlob(blob,name){ const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500); }
function safeFilename(value){ return String(value).replace(/[\\/:*?"<>|]/g,'').trim().replace(/\s+/g,'-')||'license'; }
function setStatus(message,error=false){ el.statusMessage.textContent=message;el.statusMessage.classList.toggle('error',Boolean(error)); }

document.addEventListener('DOMContentLoaded',init);
