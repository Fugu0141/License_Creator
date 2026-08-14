'use strict';

function creditTone(){
  // OSS uses this strip as a license notice, not as an attribution priority.
  if(state.mode === 'software'){
    return {
      fill:'#f8fafc',
      border:'#e4e7ec',
      accent:'#98a2b3',
      iconFill:'#ffffff',
      iconBorder:'#e4e7ec',
      label:'#98a2b3',
      kicker:'#667085',
      rail:false
    };
  }

  let level = 'required';
  if(state.mode === 'custom'){
    level = state.credit === 'recommended' ? 'recommended' : state.credit === 'none' ? 'none' : 'required';
  }else if(state.mode === 'cc'){
    level = /不要/.test(DATA.cc[state.ccLicense]?.credit || '') ? 'none' : 'required';
  }

  if(level === 'required'){
    return {
      fill:'#f3f7fc',
      border:'#c8d6e7',
      accent:'#58779a',
      iconFill:'#ffffff',
      iconBorder:'#c8d6e7',
      label:'#58718d',
      kicker:'#58718d',
      rail:true
    };
  }

  if(level === 'recommended'){
    return {
      fill:'#fffaf0',
      border:'#eadfbd',
      accent:'#9a742f',
      iconFill:'#fffdf8',
      iconBorder:'#eadfbd',
      label:'#8b672b',
      kicker:'#8b672b',
      rail:true
    };
  }

  return {
    fill:'#f8fafc',
    border:'#e4e7ec',
    accent:'#aab2bd',
    iconFill:'#ffffff',
    iconBorder:'#e4e7ec',
    label:'#98a2b3',
    kicker:'#667085',
    rail:false
  };
}

drawCreditStrip = function(ctx,theme,y){
  const x=78,w=1084,h=132;
  const content=creditStripContent();
  const tone=creditTone();

  roundedFill(ctx,x,y,w,h,10,tone.fill);
  strokeRound(ctx,x,y,w,h,10,tone.border,1);

  // A restrained priority marker. Required/recommended get a short status rail;
  // not-required remains visually quiet.
  if(tone.rail){
    ctx.save();
    ctx.strokeStyle=tone.accent;
    ctx.lineWidth=3;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x+1.5,y+22);
    ctx.lineTo(x+1.5,y+h-22);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle=tone.kicker;
  ctx.font=weight(650,12);
  ctx.fillText('CREDIT / ATTRIBUTION',x+24,y+29);

  const iconX=x+50;
  const iconY=y+79;
  roundedFill(ctx,x+24,y+48,54,54,8,tone.iconFill);
  strokeRound(ctx,x+24,y+48,54,54,8,tone.iconBorder,1);

  const iconTheme={...theme,muted:tone.accent};
  drawBottomIcon(ctx,'credit',iconX,iconY,iconTheme);

  const textX=x+104;
  ctx.fillStyle=theme.ink;
  ctx.font=weight(700,20);
  drawBalancedText(ctx,content.headline||'クレジット表記',textX,y+69,680,25,2);

  if(content.detail){
    ctx.fillStyle=theme.muted;
    ctx.font=weight(500,13.5);
    drawBalancedText(ctx,content.detail,textX,y+101,680,19,2);
  }

  ctx.fillStyle=tone.label;
  ctx.font=weight(650,11.5);
  ctx.textAlign='right';
  ctx.fillText(creditStripStatusLabel(),x+w-24,y+73);
  ctx.textAlign='left';
};
