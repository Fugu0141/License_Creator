'use strict';

const OSS_LICENSE_META = {
  MIT: { name:'MIT License', spdx:'MIT' },
  'Apache-2.0': { name:'Apache License 2.0', spdx:'Apache-2.0' },
  'BSD-3-Clause': { name:'BSD 3-Clause License', spdx:'BSD-3-Clause' },
  'MPL-2.0': { name:'Mozilla Public License 2.0', spdx:'MPL-2.0' },
  'GPL-3.0': { name:'GNU General Public License v3.0', spdx:'GPL-3.0-only' }
};

function ossMeta(){
  return OSS_LICENSE_META[state.softwareLicense] || {
    name:String(state.softwareLicense || 'Open Source License'),
    spdx:String(state.softwareLicense || '')
  };
}

// Make the OSS result card explicit about the actual license name.
const baseRenderResultsWithOss = renderResults;
renderResults = function(){
  baseRenderResultsWithOss();
  const sw = DATA.software[state.softwareLicense];
  if(!sw || !el.softwareResult) return;
  const meta = ossMeta();
  el.softwareResult.innerHTML = `
    <strong>${meta.name}</strong>
    <p>${sw.note}</p>
    <small style="display:block;margin-top:.45rem;color:#667085;">SPDX: ${meta.spdx}</small>
  `;
};

// Allow a user-authored NOTE in OSS mode. If empty, retain the automatic
// one-line explanation for the selected standard license.
const baseBottomNoteWithOss = bottomNote;
bottomNote = function(){
  if(state.mode === 'software'){
    const custom = String(state.softwareNotes || '').trim();
    if(custom) return custom;
    return DATA.software[state.softwareLicense]?.note || '';
  }
  return baseBottomNoteWithOss();
};

// OSS columns usually contain only a handful of items. Size them to content so
// the license identity and notes can use the freed space, just like CC mode.
const baseDrawStatusPanelsWithOss = drawStatusPanels;
drawStatusPanels = function(ctx,theme){
  if(state.mode !== 'software') return baseDrawStatusPanelsWithOss(ctx,theme);

  const groups = getGroups();
  const y = 468, w = 349, gap = 18;
  const maxItems = Math.max(1, groups.allow.length, groups.ask.length, groups.deny.length);
  const h = Math.max(285, Math.min(430, 126 + maxItems * 66 + 28));

  ['allow','ask','deny'].forEach((key,i)=>{
    drawPanel(ctx,78+i*(w+gap),y,w,h,key,groups[key],theme);
  });
  return { y, height:h, bottom:y+h };
};

function drawSoftwareLicenseStrip(ctx,theme,y){
  const x = 78, w = 1084, h = 146;
  const license = DATA.software[state.softwareLicense];
  const meta = ossMeta();
  const scope = String(state.softwareScope || '').trim();

  roundedFill(ctx,x,y,w,h,10,theme.wash);
  strokeRound(ctx,x,y,w,h,10,theme.line,1);

  ctx.fillStyle = theme.muted;
  ctx.font = weight(650,12);
  ctx.fillText('OPEN SOURCE LICENSE',x+24,y+30);

  // Restrained code mark matching the existing editorial icon language.
  roundedFill(ctx,x+24,y+49,58,58,8,'#ffffff');
  strokeRound(ctx,x+24,y+49,58,58,8,theme.line,1);
  ctx.fillStyle = theme.muted;
  ctx.font = weight(700,15);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>',x+53,y+78);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const textX = x + 108;
  ctx.fillStyle = theme.ink;
  ctx.font = weight(720,22);
  ctx.fillText(meta.name,textX,y+68);

  ctx.fillStyle = theme.muted;
  ctx.font = weight(520,12.5);
  ctx.fillText(`SPDX: ${meta.spdx}`,textX,y+94);

  if(license?.url){
    ctx.fillStyle = theme.faint;
    ctx.font = weight(500,11.5);
    drawBalancedText(ctx,license.url,textX,y+118,520,17,2);
  }

  if(scope){
    const rightX = x + 745;
    ctx.fillStyle = theme.muted;
    ctx.font = weight(650,11.5);
    ctx.fillText('適用範囲',rightX,y+52);
    ctx.fillStyle = theme.ink;
    ctx.font = weight(520,12.5);
    drawBalancedText(ctx,scope,rightX,y+78,w-(rightX-x)-24,19,3);
  }else{
    ctx.fillStyle = theme.faint;
    ctx.font = weight(500,11.5);
    ctx.textAlign = 'right';
    ctx.fillText('Standard open-source license',x+w-24,y+70);
    ctx.textAlign = 'left';
  }
}

// Preserve the current custom and CC layouts, and add a dedicated OSS license
// strip before the existing license-notice/attribution strip.
const baseDrawPdfWithOss = drawPdf;
drawPdf = function(){
  if(state.mode !== 'software'){
    return baseDrawPdfWithOss();
  }

  const c = el.canvas, ctx = c.getContext('2d');
  c.width = W; c.height = H;
  const theme = editorialTheme();
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0,0,W,H);

  drawHeader(ctx,theme);
  drawMeta(ctx,theme);
  const statusLayout = drawStatusPanels(ctx,theme);

  const licenseY = statusLayout.bottom + 24;
  drawSoftwareLicenseStrip(ctx,theme,licenseY);

  const creditY = licenseY + 170;
  drawCreditStrip(ctx,theme,creditY);

  const bottomY = creditY + 156;
  drawBottom(ctx,theme,bottomY,1668);
};

function installOssNotesEditor(){
  const section = document.querySelector('#softwareSection');
  if(!section || document.querySelector('#softwareNotesInput')) return;

  section.insertAdjacentHTML('beforeend', `
    <details class="details-box" id="softwareNotesDetails">
      <summary>補足・メモ</summary>
      <div class="details-body">
        <label class="field">
          <span>PDFのNOTEに表示する文章（任意）</span>
          <textarea id="softwareNotesInput" rows="4" placeholder="空欄なら選択したライセンスの概要を自動表示します"></textarea>
        </label>
        <small style="color:#667085;line-height:1.55;">説明や利用上の補足を書く欄です。標準OSSライセンスそのものの条件は変更しません。</small>
      </div>
    </details>
  `);

  const input = document.querySelector('#softwareNotesInput');
  if(typeof state.softwareNotes !== 'string') state.softwareNotes = '';
  input.value = state.softwareNotes;
  input.addEventListener('input',()=>{
    state.softwareNotes = input.value;
    changed();
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  if(typeof state.softwareNotes !== 'string') state.softwareNotes = '';
  installOssNotesEditor();
  renderResults();
  queueRender();
});
