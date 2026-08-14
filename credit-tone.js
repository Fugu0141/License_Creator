'use strict';

function creditTone(){
  // OSS uses this strip as a neutral license notice rather than an attribution priority.
  if(state.mode === 'software'){
    return {
      fill:'#f8fafc',
      border:'#e4e7ec',
      accent:'#98a2b3',
      iconFill:'#ffffff',
      iconBorder:'#e4e7ec',
      label:'#98a2b3',
      kicker:'#667085',
      railWidth:0
    };
  }

  let level='required';
  if(state.mode === 'custom'){
    level = state.credit === 'recommended'
      ? 'recommended'
      : state.credit === 'none'
        ? 'none'
        : 'required';
  }else if(state.mode === 'cc'){
    level = /不要/.test(DATA.cc[state.ccLicense]?.credit || '') ? 'none' : 'required';
  }

  // Highest priority: stronger cool-blue contrast and the thickest status rail.
  if(level === 'required'){
    return {
      fill:'#edf4fb',
      border:'#adc2d8',
      accent:'#315f89',
      iconFill:'#f8fbff',
      iconBorder:'#adc2d8',
      label:'#315f89',
      kicker:'#456783',
      railWidth:4
    };
  }

  // Middle priority: deliberately muted sand/taupe rather than bright yellow,
  // so it cannot visually overpower the required state.
  if(level === 'recommended'){
    return {
      fill:'#faf8f2',
      border:'#e2dccd',
      accent:'#8a7650',
      iconFill:'#fffdfa',
      iconBorder:'#e2dccd',
      label:'#7f6c49',
      kicker:'#76684f',
      railWidth:2
    };
  }

  // Lowest priority: almost neutral and without a status rail.
  return {
    fill:'#fafbfc',
    border:'#eaecf0',
    accent:'#aab2bd',
    iconFill:'#ffffff',
    iconBorder:'#eaecf0',
    label:'#98a2b3',
    kicker:'#7b8490',
    railWidth:0
  };
}

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
  ctx.font=weight(tone.railWidth===4?700:650,11.5);
  ctx.textAlign='right';
  ctx.fillText(creditStripStatusLabel(),x+w-24,y+73);
  ctx.textAlign='left';
};
