'use strict';

// Layout refinements that intentionally keep the current editorial design.
// CC pages use content-sized status columns and a single dedicated license strip.
// Credit is treated as a first-class rule and gets its own horizontal strip.
// Contact is omitted entirely when the user leaves it blank.

drawPdf = function(){
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

  if(state.mode==='cc'){
    const ccY=statusLayout.bottom+24;
    drawCcLicenseStrip(ctx,theme,ccY);
    creditY=ccY+172;
    footerY=1498;
  }

  drawCreditStrip(ctx,theme,creditY);
  const bottomY=creditY+156;
  drawBottom(ctx,theme,bottomY,footerY);
};

drawStatusPanels = function(ctx,theme){
  const groups=getGroups();
  const y=468,w=349,gap=18;
  let h=620;

  if(state.mode==='cc'){
    const maxItems=Math.max(1,groups.allow.length,groups.ask.length,groups.deny.length);
    h=Math.max(270,Math.min(390,126+maxItems*66+28));
  }

  ['allow','ask','deny'].forEach((key,i)=>drawPanel(ctx,78+i*(w+gap),y,w,h,key,groups[key],theme));
  return { y, height:h, bottom:y+h };
};

// Final restrained panel renderer. It keeps the current editorial look while
// allowing the deny column to hold the extra detailed restrictions.
drawPanel = function(ctx,x,y,w,h,key,items,theme){
  const sc=EDITORIAL_STATUS[key];
  roundedFill(ctx,x,y,w,h,12,sc.tint);
  strokeRound(ctx,x,y,w,h,12,theme.line,1);

  drawStatusGlyph(ctx,key,x+34,y+43,sc.ink);
  ctx.fillStyle=theme.ink;
  ctx.font=weight(730,26);
  ctx.fillText(STATUS[key],x+65,y+50);
  ctx.fillStyle=theme.muted;
  ctx.font=weight(600,11.5);
  ctx.fillText(key==='allow'?'ALLOWED':key==='ask'?'ASK FIRST':'NOT ALLOWED',x+66,y+71);

  ctx.strokeStyle=hexAlpha(theme.ink,.09);
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x+22,y+94);
  ctx.lineTo(x+w-22,y+94);
  ctx.stroke();

  if(!items.length){
    ctx.fillStyle=theme.faint;
    ctx.font=weight(500,15);
    ctx.fillText('該当なし',x+24,y+142);
    return;
  }

  const available=h-118;
  const count=Math.min(items.length,12);
  const rowH=Math.max(39,Math.min(66,available/count));
  const iconX=x+38;
  const textX=x+65;

  items.slice(0,12).forEach((item,idx)=>{
    const yy=y+112+idx*rowH;
    if(idx>0){
      ctx.strokeStyle=hexAlpha(theme.ink,.065);
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(x+22,yy);
      ctx.lineTo(x+w-22,yy);
      ctx.stroke();
    }

    const centerY=yy+rowH/2-1;
    drawPolicyIcon(ctx,item,iconX,centerY,sc.icon);
    ctx.fillStyle=theme.ink;
    const fontSize=rowH<46?14.2:rowH<54?15.5:17;
    ctx.font=weight(620,fontSize);
    drawCenteredPolicyLabel(ctx,item.label,textX,centerY,w-89);
  });
};

function drawCcLicenseStrip(ctx,theme,y){
  const x=78,w=1084,h=148;
  const license=DATA.cc[state.ccLicense];

  roundedFill(ctx,x,y,w,h,10,theme.wash);
  strokeRound(ctx,x,y,w,h,10,theme.line,1);

  ctx.fillStyle=theme.muted;
  ctx.font=weight(650,12);
  ctx.fillText('CREATIVE COMMONS LICENSE',x+24,y+31);

  const badgeX=x+24;
  const badgeY=y+51;
  const badgeW=176;

  if(typeof ccOfficialBadge!=='undefined'&&ccOfficialBadge){
    const ratio=(ccOfficialBadge.naturalHeight/ccOfficialBadge.naturalWidth)||31/88;
    const badgeH=Math.round(badgeW*ratio);
    ctx.drawImage(ccOfficialBadge,badgeX,badgeY,badgeW,badgeH);
  }else{
    roundedFill(ctx,badgeX,badgeY,badgeW,62,6,'#111111');
    ctx.fillStyle='#ffffff';
    ctx.font=weight(750,22);
    ctx.fillText(state.ccLicense,badgeX+16,badgeY+38);
  }

  const textX=x+234;
  ctx.fillStyle=theme.ink;
  ctx.font=weight(700,21);
  ctx.fillText(state.ccLicense,textX,y+66);
  ctx.fillStyle=theme.muted;
  ctx.font=weight(500,13.5);
  drawBalancedText(ctx,license.url,textX,y+94,560,20,2);

  ctx.fillStyle=theme.faint;
  ctx.font=weight(500,11.5);
  ctx.textAlign='right';
  ctx.fillText('Official Creative Commons license',x+w-24,y+66);
  ctx.textAlign='left';
};

function fitSingleLine(ctx,text,maxWidth,startSize=14.5,minSize=11.5){
  for(let size=startSize;size>=minSize;size-=.5){
    ctx.font=weight(500,size);
    if(ctx.measureText(text).width<=maxWidth) return size;
  }
  return null;
}

function drawCreditNaturally(ctx,text,x,y,maxWidth){
  const value=String(text||'').replace(/\s+/g,' ').trim();
  const match=value.match(/^(.*?)(?:\s*)(例[:：].*)$/);

  if(match){
    const intro=match[1].trim();
    const example=match[2].trim();
    ctx.font=weight(500,14.5);
    drawBalancedText(ctx,intro,x,y,maxWidth,22,2);

    const exampleY=y+27;
    const fitted=fitSingleLine(ctx,example,maxWidth,14,11);
    if(fitted){
      ctx.font=weight(500,fitted);
      ctx.fillText(example,x,exampleY);
    }else{
      ctx.font=weight(500,11);
      drawBalancedText(ctx,example,x,exampleY,maxWidth,18,2);
    }
    return;
  }

  const fitted=fitSingleLine(ctx,value,maxWidth,14.5,12);
  if(fitted){
    ctx.font=weight(500,fitted);
    ctx.fillText(value,x,y);
  }else{
    ctx.font=weight(500,13.5);
    drawBalancedText(ctx,value,x,y,maxWidth,22,3);
  }
}

function drawFlexibleBlock(ctx,text,x,y,maxWidth,maxLines=6){
  const value=String(text||'').replace(/\s+/g,' ').trim();
  if(!value) return;
  const fitted=fitSingleLine(ctx,value,maxWidth,14.5,12.5);
  if(fitted){
    ctx.font=weight(500,fitted);
    ctx.fillText(value,x,y);
    return;
  }
  ctx.font=weight(500,14);
  drawBalancedText(ctx,value,x,y,maxWidth,23,maxLines);
}

function creditStripContent(){
  const raw=String(creditSentence()||'').replace(/\s+/g,' ').trim();
  const match=raw.match(/^(.*?)(?:\s*)(例[:：].*)$/);
  return {
    headline:(match?match[1]:raw).trim(),
    detail:(match?match[2]:'').trim()
  };
}

function creditStripStatusLabel(){
  const raw=String(creditSentence()||'');
  if(state.mode==='software') return 'LICENSE NOTICE';
  if(/不要/.test(raw)) return 'NOT REQUIRED';
  if(/推奨/.test(raw)) return 'RECOMMENDED';
  return 'REQUIRED';
}

function drawCreditStrip(ctx,theme,y){
  const x=78,w=1084,h=132;
  const content=creditStripContent();

  roundedFill(ctx,x,y,w,h,10,'#f8fafc');
  strokeRound(ctx,x,y,w,h,10,theme.line,1);

  ctx.fillStyle=theme.muted;
  ctx.font=weight(650,12);
  ctx.fillText('CREDIT / ATTRIBUTION',x+24,y+29);

  const iconX=x+50;
  const iconY=y+79;
  roundedFill(ctx,x+24,y+48,54,54,8,'#ffffff');
  strokeRound(ctx,x+24,y+48,54,54,8,theme.line,1);
  drawBottomIcon(ctx,'credit',iconX,iconY,theme);

  const textX=x+104;
  ctx.fillStyle=theme.ink;
  ctx.font=weight(700,20);
  drawBalancedText(ctx,content.headline||'クレジット表記',textX,y+69,680,25,2);

  if(content.detail){
    ctx.fillStyle=theme.muted;
    ctx.font=weight(500,13.5);
    drawBalancedText(ctx,content.detail,textX,y+101,680,19,2);
  }

  ctx.fillStyle=theme.faint;
  ctx.font=weight(600,11.5);
  ctx.textAlign='right';
  ctx.fillText(creditStripStatusLabel(),x+w-24,y+73);
  ctx.textAlign='left';
};

drawBottom = function(ctx,theme,y=1268,footerY=1608){
  const x=78,w=1084;
  ctx.strokeStyle=theme.lineStrong;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x+w,y);
  ctx.stroke();

  const hasContact=Boolean(String(state.contact||'').trim());
  const sections=buildBottomSections(x,w,hasContact);

  sections.forEach((s,i)=>{
    if(i>0){
      ctx.strokeStyle=theme.line;
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(s.x,y+28);
      ctx.lineTo(s.x,y+222);
      ctx.stroke();
    }

    const px=s.x+20;
    drawBottomIcon(ctx,s.kind,px+9,y+40,theme);
    ctx.fillStyle=theme.ink;
    ctx.font=weight(650,13);
    ctx.fillText(s.title,px,y+76);

    ctx.fillStyle=theme.muted;
    if(s.kind==='note'){
      drawFlexibleBlock(ctx,bottomNote(),px,y+110,s.w-42,6);
    }else if(s.kind==='contact'){
      drawFlexibleBlock(ctx,String(state.contact).trim(),px,y+110,s.w-40,6);
    }
  });

  ctx.strokeStyle=theme.line;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x,footerY);
  ctx.lineTo(x+w,footerY);
  ctx.stroke();

  ctx.fillStyle='#a0a8b3';
  ctx.font=weight(500,11.5);
  ctx.fillText('Created with License Creator',x,footerY+31);
  ctx.textAlign='right';
  ctx.fillText('https://fugu0141.github.io/License_Creator/',x+w,footerY+31);
  ctx.textAlign='left';
};

function buildBottomSections(x,w,hasContact){
  if(hasContact){
    return [
      {x,w:760,title:'NOTE',kind:'note'},
      {x:x+760,w:324,title:'CONTACT',kind:'contact'}
    ];
  }

  return [
    {x,w:1084,title:'NOTE',kind:'note'}
  ];
}
