'use strict';

const MODE_STATUS_LABELS = {
  custom: {
    allow: { title:'許可', subtitle:'ALLOWED' },
    ask: { title:'要相談', subtitle:'ASK FIRST' },
    deny: { title:'禁止', subtitle:'NOT ALLOWED' }
  },
  cc: {
    allow: { title:'利用できます', subtitle:'PERMITTED' },
    ask: { title:'条件あり', subtitle:'CONDITIONS' },
    deny: { title:'ライセンス外', subtitle:'OUTSIDE LICENSE' }
  },
  software: {
    allow: { title:'利用できます', subtitle:'PERMITTED' },
    ask: { title:'条件あり', subtitle:'REQUIREMENTS' },
    deny: { title:'制限あり', subtitle:'RESTRICTIONS' }
  }
};

function statusLabelForMode(key){
  const labels = MODE_STATUS_LABELS[state.mode] || MODE_STATUS_LABELS.custom;
  return labels[key] || MODE_STATUS_LABELS.custom[key];
}

// The underlying data intentionally keeps allow / ask / deny for backwards
// compatibility. Only the wording changes by mode so existing saved data and
// preset definitions continue to work unchanged.
drawPanel = function(ctx,x,y,w,h,key,items,theme){
  const sc = EDITORIAL_STATUS[key];
  const label = statusLabelForMode(key);

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

// In the CC selector card, "禁止" implied a creator-level prohibition.
// These entries are simply outside the permissions granted by that CC license.
const baseRenderResultsWithStatusLabels = renderResults;
renderResults = function(){
  baseRenderResultsWithStatusLabels();
  if(state.mode !== 'cc' || !el.ccResult) return;
  el.ccResult.querySelectorAll('p').forEach((node)=>{
    node.textContent = node.textContent.replace('禁止:', 'ライセンス外:');
  });
};

document.addEventListener('DOMContentLoaded',()=>{
  renderResults();
  queueRender();
});
