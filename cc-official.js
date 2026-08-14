'use strict';

const CC_OFFICIAL_BADGES = {
  'CC BY 4.0': 'https://licensebuttons.net/l/by/4.0/88x31.png',
  'CC BY-SA 4.0': 'https://licensebuttons.net/l/by-sa/4.0/88x31.png',
  'CC BY-NC 4.0': 'https://licensebuttons.net/l/by-nc/4.0/88x31.png',
  'CC BY-NC-SA 4.0': 'https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png',
  'CC BY-ND 4.0': 'https://licensebuttons.net/l/by-nd/4.0/88x31.png',
  'CC BY-NC-ND 4.0': 'https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png',
  'CC0 1.0': 'https://licensebuttons.net/l/zero/1.0/88x31.png'
};

let ccOfficialBadge = null;
let ccOfficialBadgeKey = '';
let ccOfficialBadgeFailed = false;

function ccOfficialBadgeUrl(){
  return CC_OFFICIAL_BADGES[state.ccLicense] || '';
}

function loadCcOfficialBadge(){
  if(state.mode !== 'cc'){
    ccOfficialBadge = null;
    ccOfficialBadgeKey = '';
    ccOfficialBadgeFailed = false;
    return;
  }

  const key = state.ccLicense;
  const url = ccOfficialBadgeUrl();
  if(!url) return;
  if(ccOfficialBadgeKey === key && (ccOfficialBadge || ccOfficialBadgeFailed)) return;

  ccOfficialBadgeKey = key;
  ccOfficialBadge = null;
  ccOfficialBadgeFailed = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if(state.mode === 'cc' && state.ccLicense === key){
      ccOfficialBadge = img;
      ccOfficialBadgeFailed = false;
      queueRender();
    }
  };
  img.onerror = () => {
    ccOfficialBadge = null;
    ccOfficialBadgeFailed = true;
    console.warn(`Creative Commons official badge could not be loaded: ${url}`);
    queueRender();
  };
  img.src = url;
}

const baseChangedWithOfficialCc = changed;
changed = function(){
  baseChangedWithOfficialCc();
  loadCcOfficialBadge();
};

const baseRenderResultsWithOfficialCc = renderResults;
renderResults = function(){
  baseRenderResultsWithOfficialCc();
  if(state.mode !== 'cc') return;

  const license = DATA.cc[state.ccLicense];
  const badge = ccOfficialBadgeUrl();
  el.ccResult.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <img src="${badge}" width="88" height="31" alt="${state.ccLicense} official Creative Commons license button" style="display:block;width:88px;height:31px;object-fit:contain;image-rendering:auto;">
      <div style="min-width:0;">
        <strong>${state.ccLicense}</strong>
        <p style="margin:.35rem 0 0;">${license.allow.join(' / ')}${license.deny.length ? `　禁止: ${license.deny.join(' / ')}` : ''}</p>
      </div>
    </div>
    <a href="${license.url}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:.65rem;font-size:.82rem;overflow-wrap:anywhere;">${license.url}</a>
  `;
};

const baseDrawBottomWithOfficialCc = drawBottom;
drawBottom = function(ctx, theme){
  baseDrawBottomWithOfficialCc(ctx, theme);
  if(state.mode !== 'cc') return;

  const license = DATA.cc[state.ccLicense];
  const boxX = 620;
  const boxY = 1297;
  const boxW = 530;
  const boxH = 112;

  roundedFill(ctx, boxX, boxY, boxW, boxH, 20, theme.soft);
  ctx.fillStyle = theme.ink;
  ctx.font = weight(850, 19);
  ctx.fillText('公式 Creative Commons ライセンス', boxX + 22, boxY + 31);

  if(ccOfficialBadge){
    const badgeW = 132;
    const badgeH = Math.round(badgeW * 31 / 88);
    ctx.drawImage(ccOfficialBadge, boxX + 22, boxY + 47, badgeW, badgeH);
    ctx.fillStyle = theme.ink;
    ctx.font = weight(850, 17);
    ctx.fillText(state.ccLicense, boxX + 172, boxY + 67);
    ctx.fillStyle = theme.muted;
    ctx.font = weight(600, 12);
    wrapText(ctx, license.url, boxX + 172, boxY + 89, boxW - 196, 17, 2);
  }else{
    ctx.fillStyle = theme.ink;
    ctx.font = weight(900, 18);
    ctx.fillText(state.ccLicense, boxX + 22, boxY + 64);
    ctx.fillStyle = theme.muted;
    ctx.font = weight(600, 13);
    wrapText(ctx, license.url, boxX + 22, boxY + 88, boxW - 44, 18, 2);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadCcOfficialBadge();
  renderResults();
});