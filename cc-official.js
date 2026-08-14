'use strict';

const CC_BADGES = {
  'CC BY 4.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/CC_BY_icon.svg'
  },
  'CC BY-SA 4.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/CC_BY-SA_icon.svg'
  },
  'CC BY-NC 4.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Cc_by-nc_icon.svg'
  },
  'CC BY-NC-SA 4.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Cc-by-nc-sa_icon.svg'
  },
  'CC BY-ND 4.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nd.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Cc_by-nd_icon.svg'
  },
  'CC BY-NC-ND 4.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Cc_by-nc-nd_icon.svg'
  },
  'CC0 1.0': {
    official: 'https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg',
    canvas: 'https://upload.wikimedia.org/wikipedia/commons/6/69/CC0_button.svg'
  }
};

let ccOfficialBadge = null;
let ccOfficialBadgeKey = '';
let ccBadgePromise = null;

function ccBadgeInfo(){
  return CC_BADGES[state.ccLicense] || null;
}

function loadImageForCanvas(url){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function loadCcOfficialBadge(force = false){
  if(state.mode !== 'cc'){
    ccOfficialBadge = null;
    ccOfficialBadgeKey = '';
    ccBadgePromise = null;
    return Promise.resolve(null);
  }

  const key = state.ccLicense;
  const info = ccBadgeInfo();
  if(!info) return Promise.resolve(null);
  if(!force && ccOfficialBadgeKey === key && ccOfficialBadge) return Promise.resolve(ccOfficialBadge);
  if(!force && ccOfficialBadgeKey === key && ccBadgePromise) return ccBadgePromise;

  ccOfficialBadgeKey = key;
  ccOfficialBadge = null;

  ccBadgePromise = (async () => {
    for(const url of [info.official, info.canvas]){
      try{
        const img = await loadImageForCanvas(url);
        if(state.mode === 'cc' && state.ccLicense === key){
          ccOfficialBadge = img;
          queueRender();
        }
        return img;
      }catch(err){
        console.warn(`CC badge source could not be used in Canvas: ${url}`, err);
      }
    }
    return null;
  })().finally(() => {
    if(ccOfficialBadgeKey === key) ccBadgePromise = null;
  });

  return ccBadgePromise;
}

async function ensureCcOfficialBadge(){
  if(state.mode !== 'cc') return null;
  if(ccOfficialBadge && ccOfficialBadgeKey === state.ccLicense) return ccOfficialBadge;
  return loadCcOfficialBadge(true);
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
  const badge = ccBadgeInfo()?.official || '';
  el.ccResult.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <img src="${badge}" width="88" height="31" alt="${state.ccLicense} Creative Commons license button" style="display:block;width:88px;height:31px;object-fit:contain;">
      <div style="min-width:0;">
        <strong>${state.ccLicense}</strong>
        <p style="margin:.3rem 0 0;">${license.allow.join(' / ')}${license.deny.length ? `　禁止: ${license.deny.join(' / ')}` : ''}</p>
      </div>
    </div>
    <a href="${license.url}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:.6rem;font-size:.8rem;overflow-wrap:anywhere;">${license.url}</a>
  `;
};

const baseExportPdfWithOfficialCc = exportPdf;
exportPdf = async function(){
  if(state.mode === 'cc'){
    setStatus('Creative Commonsバッジを準備しています…');
    await ensureCcOfficialBadge();
    drawPdf();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  return baseExportPdfWithOfficialCc();
};

document.addEventListener('DOMContentLoaded', () => {
  loadCcOfficialBadge();
  renderResults();
});