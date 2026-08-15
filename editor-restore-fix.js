'use strict';

// Final editor/state synchronization layer.
// Keep restoration synchronous at DOMContentLoaded so a delayed animation
// frame can never overwrite a user's first interaction with a select control.
function restoreEditorFromState(){
  if(typeof syncControls !== 'function' || !state) return;

  syncControls();

  // Fields added by optional feature layers are not all handled by the base
  // syncControls(), so restore them here when present.
  const softwareNotes=document.querySelector('#softwareNotesInput');
  if(softwareNotes) softwareNotes.value=String(state.softwareNotes || '');

  // Keep neutral public placeholders available whenever values are empty.
  const creator=document.querySelector('#creatorInput');
  const workName=document.querySelector('#workNameInput');
  const credit=document.querySelector('#creditTextInput');
  const notes=document.querySelector('#notesInput');
  if(creator) creator.placeholder='例: 作者名 / サークル名';
  if(workName) workName.placeholder='例: 作品名';
  if(credit) credit.placeholder='例: © 2026 作者名 / 作品名';
  if(notes) notes.placeholder='必要に応じて、利用時の補足や注意事項を入力';
}

function installFinalSelectHandler(select, onChange){
  if(!select || select.dataset.finalSelectHandler) return;
  select.dataset.finalSelectHandler='true';

  // Handle these state-bearing selects once, in capture phase. Older feature
  // layers also registered bubbling listeners; stopping them here prevents
  // duplicate/stale updates and guarantees the PDF uses the visible choice.
  select.addEventListener('change',event=>{
    event.stopPropagation();
    event.stopImmediatePropagation();
    onChange(select.value);
  },true);
}

function installLicenseSelectHandlers(){
  installFinalSelectHandler(document.querySelector('#presetSelect'),value=>{
    const preset=DATA.presets[value];
    if(!preset) return;

    state.preset=value;
    state.policies={...preset.policies};
    state.credit=preset.credit;
    state.restrictions={...preset.restrictions};

    // The preset changes several controls at once, so repaint the editor first
    // and then run the normal render/save pipeline.
    syncControls();
    changed();
  });

  installFinalSelectHandler(document.querySelector('#ccLicenseSelect'),value=>{
    if(!DATA.cc[value]) return;
    state.ccLicense=value;
    changed();
  });

  installFinalSelectHandler(document.querySelector('#softwareLicenseSelect'),value=>{
    if(!DATA.software[value]) return;
    state.softwareLicense=value;
    changed();
  });
}

// The internal allow / ask / deny keys are kept for backwards compatibility
// with saved state and presets. Their visible meaning changes by license mode.
const MODE_STATUS_LABELS = {
  custom: {
    allow: { title:'許可', subtitle:'ALLOWED' },
    ask: { title:'要相談', subtitle:'ASK FIRST' },
    deny: { title:'禁止', subtitle:'NOT ALLOWED' }
  },
  cc: {
    allow: { title:'利用できます', subtitle:'PERMITTED' },
    ask: { title:'条件', subtitle:'CONDITIONS' },
    deny: { title:'ライセンス外', subtitle:'OUTSIDE LICENSE' }
  },
  software: {
    allow: { title:'利用できます', subtitle:'PERMITTED' },
    ask: { title:'条件', subtitle:'REQUIREMENTS' },
    deny: { title:'制限あり', subtitle:'RESTRICTIONS' }
  }
};

function statusLabelForMode(key){
  const labels=MODE_STATUS_LABELS[state.mode] || MODE_STATUS_LABELS.custom;
  return labels[key] || MODE_STATUS_LABELS.custom[key];
}

// Final PDF panel renderer: keep the existing layout, but use wording that
// reflects whether the user is authoring custom terms, CC, or OSS.
drawPanel = function(ctx,x,y,w,h,key,items,theme){
  const sc=EDITORIAL_STATUS[key];
  const label=statusLabelForMode(key);

  roundedFill(ctx,x,y,w,h,12,sc.tint);
  strokeRound(ctx,x,y,w,h,12,theme.line,1);

  drawStatusGlyph(ctx,key,x+34,y+43,sc.ink);
  ctx.fillStyle=theme.ink;
  ctx.font=weight(730,26);
  ctx.fillText(label.title,x+65,y+50);
  ctx.fillStyle=theme.muted;
  ctx.font=weight(600,11.5);
  ctx.fillText(label.subtitle,x+66,y+71);

  ctx.strokeStyle=hexAlpha(theme.ink,.09);
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x+22,y+94);
  ctx.lineTo(x+w-22,y+94);
  ctx.stroke();

  const startY=y+112;
  const rowH=66;

  if(!items.length){
    ctx.fillStyle=theme.faint;
    ctx.font=weight(500,15);
    ctx.fillText('該当なし',x+24,startY+30);
    return;
  }

  items.slice(0,7).forEach((item,idx)=>{
    const yy=startY+idx*rowH;
    if(idx>0){
      ctx.strokeStyle=hexAlpha(theme.ink,.065);
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(x+22,yy);
      ctx.lineTo(x+w-22,yy);
      ctx.stroke();
    }

    const centerY=yy+31;
    drawPolicyIcon(ctx,item,x+38,centerY,sc.icon);
    ctx.fillStyle=theme.ink;
    drawCenteredPolicyLabel(ctx,item.label,x+65,centerY,w-89);
  });
};

// In the CC selector card, "禁止" sounded like an absolute creator-level
// prohibition. These entries are simply outside the permissions of that CC
// license, so describe them that way instead.
const baseRenderResultsWithModeLabels=renderResults;
renderResults=function(){
  baseRenderResultsWithModeLabels();
  if(state.mode!=='cc' || !el.ccResult) return;
  el.ccResult.querySelectorAll('p').forEach(node=>{
    node.textContent=node.textContent.replace('禁止:', 'ライセンス外:');
  });
};

function updateGeneralIntroCopy(){
  const intro=document.querySelector('.intro p:not(.eyebrow)');
  if(!intro) return;
  intro.innerHTML='長い説明は減らして、<b>できること・必要な条件・できないこと</b>を一目で伝えるPDFにします。';
}

document.addEventListener('DOMContentLoaded',()=>{
  // This file is loaded last. All deferred scripts and all earlier
  // DOMContentLoaded installers are already registered; because listeners run
  // in registration order, an immediate final sync is sufficient and avoids a
  // late-rAF race with user input.
  restoreEditorFromState();
  installLicenseSelectHandlers();
  updateGeneralIntroCopy();
  renderResults();
  queueRender();
});
