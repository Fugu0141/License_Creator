'use strict';

// Layout refinements that intentionally keep the current editorial design.
// CC pages use content-sized status columns and a single dedicated license strip.
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

  let bottomY=1138;
  let footerY=1608;
  if(state.mode==='cc'){
    const stripY=statusLayout.bottom+24;
    drawCcLicenseStrip(ctx,theme,stripY);
    bottomY=stripY+174;
    footerY=1498;
  }

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

drawBottom = function(ctx,theme,y=1138,footerY=1608){
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
      ctx.moveTo(s.x,y+24);
      ctx.lineTo(s.x,y+228);
      ctx.stroke();
    }

    const px=s.x+20;
    drawBottomIcon(ctx,s.kind,px+9,y+40,theme);
    ctx.fillStyle=theme.ink;
    ctx.font=weight(650,13);
    ctx.fillText(s.title,px,y+76);

    ctx.fillStyle=theme.muted;
    if(s.kind==='credit'){
      drawCreditNaturally(ctx,creditSentence(),px,y+110,s.w-40);
    }else if(s.kind==='ng'){
      const r=restrictionLabels();
      drawFlexibleBlock(ctx,r.length?r.join(' / '):'特になし',px,y+110,s.w-40,5);
    }else if(s.kind==='note'){
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
  if(state.mode==='cc'){
    if(hasContact){
      return [
        {x,w:250,title:'CREDIT',kind:'credit'},
        {x:x+250,w:534,title:'NOTE',kind:'note'},
        {x:x+784,w:300,title:'CONTACT',kind:'contact'}
      ];
    }
    return [
      {x,w:300,title:'CREDIT',kind:'credit'},
      {x:x+300,w:784,title:'NOTE',kind:'note'}
    ];
  }

  if(hasContact){
    return [
      {x,w:235,title:'CREDIT',kind:'credit'},
      {x:x+235,w:235,title:'NG',kind:'ng'},
      {x:x+470,w:390,title:'NOTE',kind:'note'},
      {x:x+860,w:224,title:'CONTACT',kind:'contact'}
    ];
  }

  return [
    {x,w:250,title:'CREDIT',kind:'credit'},
    {x:x+250,w:280,title:'NG',kind:'ng'},
    {x:x+530,w:554,title:'NOTE',kind:'note'}
  ];
}
