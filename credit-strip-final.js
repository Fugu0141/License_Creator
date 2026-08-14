'use strict';

function shouldShowCreditStrip(){
  // OSS uses this area as a license notice, so it always remains visible.
  if(state.mode === 'software') return true;

  // Custom licenses should not waste space on an explicit "not required" card.
  if(state.mode === 'custom') return state.credit !== 'none';

  // CC0 is the only bundled CC option whose attribution text is unnecessary.
  if(state.mode === 'cc'){
    return !/不要/.test(DATA.cc[state.ccLicense]?.credit || '');
  }

  return true;
}

// Preserve the specialized OSS PDF renderer. For custom / CC modes, place the
// lower sections conditionally so no empty gap remains when attribution is off.
const baseDrawPdfWithCreditVisibility = drawPdf;
drawPdf = function(){
  if(state.mode === 'software'){
    return baseDrawPdfWithCreditVisibility();
  }

  const c=el.canvas, ctx=c.getContext('2d');
  c.width=W; c.height=H;
  const theme=editorialTheme();
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=theme.bg;
  ctx.fillRect(0,0,W,H);

  drawHeader(ctx,theme);
  drawMeta(ctx,theme);
  const statusLayout=drawStatusPanels(ctx,theme);

  let creditY=statusLayout.bottom+24;
  let footerY=1608;

  if(state.mode === 'cc'){
    const ccY=statusLayout.bottom+24;
    drawCcLicenseStrip(ctx,theme,ccY);
    creditY=ccY+172;
    footerY=1498;
  }

  let bottomY=creditY;
  if(shouldShowCreditStrip()){
    drawCreditStrip(ctx,theme,creditY);
    bottomY=creditY+156;
  }

  drawBottom(ctx,theme,bottomY,footerY);
};

// Final credit strip pass: preserve the current priority colors while aligning
// the icon, text block and status label around the same vertical center.
drawCreditStrip = function(ctx,theme,y){
  const x=78,w=1084,h=132;
  const content=creditStripContent();
  const tone=creditTone();

  roundedFill(ctx,x,y,w,h,10,tone.fill);
  strokeRound(ctx,x,y,w,h,10,tone.border,1);

  if(tone.railWidth>0){
    ctx.save();
    ctx.strokeStyle=tone.accent;
    ctx.lineWidth=tone.railWidth;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x+tone.railWidth/2,y+22);
    ctx.lineTo(x+tone.railWidth/2,y+h-22);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle=tone.kicker;
  ctx.font=weight(650,12);
  ctx.fillText('CREDIT / ATTRIBUTION',x+24,y+29);

  const centerY=y+76;
  const iconX=x+50;
  const iconSize=54;
  const iconTop=centerY-iconSize/2;
  roundedFill(ctx,x+24,iconTop,iconSize,iconSize,8,tone.iconFill);
  strokeRound(ctx,x+24,iconTop,iconSize,iconSize,8,tone.iconBorder,1);

  const iconTheme={...theme,muted:tone.accent};
  drawBottomIcon(ctx,'credit',iconX,centerY,iconTheme);

  const textX=x+104;
  const maxTextWidth=680;

  ctx.font=weight(700,20);
  const headlineLines=balancedTextLines(ctx,content.headline||'クレジット表記',maxTextWidth,2);

  let detailLines=[];
  if(content.detail){
    ctx.font=weight(500,13.5);
    detailLines=balancedTextLines(ctx,content.detail,maxTextWidth,2);
  }

  const headlineLineHeight=24;
  const detailLineHeight=18;
  const blockGap=detailLines.length ? 6 : 0;
  const totalHeight=
    headlineLines.length*headlineLineHeight +
    blockGap +
    detailLines.length*detailLineHeight;
  let cursorY=centerY-totalHeight/2;

  ctx.save();
  ctx.textBaseline='middle';
  ctx.fillStyle=theme.ink;
  ctx.font=weight(700,20);
  headlineLines.forEach((line,i)=>{
    ctx.fillText(line,textX,cursorY+headlineLineHeight/2+i*headlineLineHeight);
  });
  cursorY+=headlineLines.length*headlineLineHeight+blockGap;

  if(detailLines.length){
    ctx.fillStyle=theme.muted;
    ctx.font=weight(500,13.5);
    detailLines.forEach((line,i)=>{
      ctx.fillText(line,textX,cursorY+detailLineHeight/2+i*detailLineHeight);
    });
  }
  ctx.restore();

  ctx.fillStyle=tone.label;
  ctx.font=weight(tone.railWidth===4?700:650,11.5);
  ctx.textAlign='right';
  ctx.textBaseline='middle';
  ctx.fillText(creditStripStatusLabel(),x+w-24,centerY);
  ctx.textAlign='left';
  ctx.textBaseline='alphabetic';
};
