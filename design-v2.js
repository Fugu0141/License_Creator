'use strict';

const EDITORIAL_STATUS = {
  allow: { tint:'#f0fdf4', ink:'#166534', icon:'#3f7c5a' },
  ask:  { tint:'#fffbeb', ink:'#92400e', icon:'#9a6b22' },
  deny: { tint:'#fef2f2', ink:'#991b1b', icon:'#9b4a4a' }
};

const EDITORIAL_THEMES = {
  blue:     { paper:'#ffffff', wash:'#f8fafc', accent:'#667085' },
  mint:     { paper:'#ffffff', wash:'#f7faf9', accent:'#61756f' },
  lavender: { paper:'#ffffff', wash:'#faf9fc', accent:'#716b7d' },
  warm:     { paper:'#ffffff', wash:'#fbfaf8', accent:'#776c63' }
};

function editorialTheme(){
  const t = EDITORIAL_THEMES[state.theme] || EDITORIAL_THEMES.blue;
  return {
    bg:t.paper,
    wash:t.wash,
    ink:'#1f2937',
    muted:'#667085',
    faint:'#98a2b3',
    line:'#e4e7ec',
    lineStrong:'#d0d5dd',
    accent:t.accent
  };
}

drawPdf = function(){
  const c=el.canvas, ctx=c.getContext('2d');
  c.width=W; c.height=H;
  const theme=editorialTheme();
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=theme.bg;
  ctx.fillRect(0,0,W,H);
  drawHeader(ctx,theme);
  drawMeta(ctx,theme);
  drawStatusPanels(ctx,theme);
  drawBottom(ctx,theme);
};

drawSoftDecoration = function(){};

drawHeader = function(ctx,theme){
  const left=78;

  ctx.fillStyle=theme.muted;
  ctx.font=weight(700,15);
  ctx.letterSpacing='1px';
  ctx.fillText('LICENSE / TERMS OF USE',left,78);
  ctx.letterSpacing='0px';

  ctx.fillStyle=theme.ink;
  ctx.font=weight(800,53);
  ctx.fillText(state.title || '作品利用ガイド',left,151);

  ctx.fillStyle=theme.muted;
  ctx.font=weight(500,20);
  wrapText(ctx,`「${state.workName || 'この作品'}」を使うときのルールを、ひと目で確認できるようにまとめています。`,left,207,710,31,2);

  if(illustration){
    const x=958,y=61,w=202,h=202;
    ctx.save();
    roundedPath(ctx,x,y,w,h,12);
    ctx.clip();
    drawImageCover(ctx,illustration,x,y,w,h);
    ctx.restore();
    strokeRound(ctx,x,y,w,h,12,theme.lineStrong,1);
  }
};

drawMeta = function(ctx,theme){
  const x=78,y=316,w=1084,h=104;
  ctx.fillStyle=theme.wash;
  ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=theme.lineStrong;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x,y); ctx.lineTo(x+w,y);
  ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h);
  ctx.stroke();

  const typeLabel=DATA.workTypes[state.workType] || state.workType || '—';
  const items=[['作者',state.creator||'—'],['作品',state.workName||'—'],['種類',typeLabel],['更新',state.updatedAt||'—']];
  const colW=w/4;

  items.forEach((it,i)=>{
    const xx=x+i*colW+20;
    if(i>0){
      ctx.strokeStyle=theme.line;
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(x+i*colW,y+22);
      ctx.lineTo(x+i*colW,y+h-22);
      ctx.stroke();
    }
    ctx.fillStyle=theme.muted;
    ctx.font=weight(600,13);
    ctx.fillText(it[0],xx,y+32);
    ctx.fillStyle=theme.ink;
    ctx.font=weight(700,19);
    ctx.fillText(short(it[1],18),xx,y+67);
  });
};

drawStatusPanels = function(ctx,theme){
  const groups=getGroups();
  const y=468,w=349,h=620,gap=18;
  ['allow','ask','deny'].forEach((key,i)=>drawPanel(ctx,78+i*(w+gap),y,w,h,key,groups[key],theme));
};

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

    drawPolicyIcon(ctx,item,x+38,yy+31,sc.icon);
    ctx.fillStyle=theme.ink;
    ctx.font=weight(620,17);
    wrapText(ctx,item.label,x+65,yy+21,w-89,23,2);
  });
};

function drawStatusGlyph(ctx,key,cx,cy,color){
  ctx.save();
  ctx.strokeStyle=color;
  ctx.fillStyle=color;
  ctx.lineWidth=2;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  if(key==='allow'){
    ctx.beginPath();ctx.moveTo(cx-8,cy);ctx.lineTo(cx-2,cy+6);ctx.lineTo(cx+10,cy-8);ctx.stroke();
  }else if(key==='ask'){
    ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx,cy+3);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy+9,1.5,0,Math.PI*2);ctx.fill();
  }else{
    ctx.beginPath();ctx.moveTo(cx-8,cy-8);ctx.lineTo(cx+8,cy+8);ctx.moveTo(cx+8,cy-8);ctx.lineTo(cx-8,cy+8);ctx.stroke();
  }
  ctx.restore();
}

drawBottom = function(ctx,theme){
  const x=78,y=1138,w=1084;
  ctx.strokeStyle=theme.lineStrong;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x+w,y);
  ctx.stroke();

  const sections=[
    {x,w:235,title:'CREDIT',kind:'credit'},
    {x:x+235,w:235,title:state.mode==='cc'?'LICENSE':'NG',kind:state.mode==='cc'?'license':'ng'},
    {x:x+470,w:390,title:'NOTE',kind:'note'},
    {x:x+860,w:224,title:'CONTACT',kind:'contact'}
  ];

  sections.forEach((s,i)=>{
    if(i>0){
      ctx.strokeStyle=theme.line;
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(s.x,y+26);
      ctx.lineTo(s.x,y+236);
      ctx.stroke();
    }

    const px=s.x+20;
    drawBottomIcon(ctx,s.kind,px+9,y+42,theme);
    ctx.fillStyle=theme.ink;
    ctx.font=weight(650,13);
    ctx.fillText(s.title,px,y+78);

    if(s.kind==='credit'){
      ctx.fillStyle=theme.muted;
      ctx.font=weight(500,14.5);
      wrapText(ctx,creditSentence(),px,y+112,s.w-40,23,5);
    }else if(s.kind==='ng'){
      const r=restrictionLabels();
      ctx.fillStyle=theme.muted;
      ctx.font=weight(500,14.5);
      wrapText(ctx,r.length?r.join(' / '):'特になし',px,y+112,s.w-40,23,5);
    }else if(s.kind==='license'){
      const license=DATA.cc[state.ccLicense];
      if(typeof ccOfficialBadge!=='undefined'&&ccOfficialBadge){
        const bw=104;
        const bh=Math.round(bw*((ccOfficialBadge.naturalHeight/ccOfficialBadge.naturalWidth)||31/88));
        ctx.drawImage(ccOfficialBadge,px,y+105,bw,bh);
        ctx.fillStyle=theme.ink;
        ctx.font=weight(600,13);
        ctx.fillText(state.ccLicense,px,y+163);
        ctx.fillStyle=theme.muted;
        ctx.font=weight(500,10);
        wrapText(ctx,license.url,px,y+184,s.w-40,15,3);
      }else{
        ctx.fillStyle=theme.ink;
        ctx.font=weight(600,14);
        ctx.fillText(state.ccLicense,px,y+118);
        ctx.fillStyle=theme.muted;
        ctx.font=weight(500,10.5);
        wrapText(ctx,license.url,px,y+143,s.w-40,16,4);
      }
    }else if(s.kind==='note'){
      ctx.fillStyle=theme.muted;
      ctx.font=weight(500,14.5);
      wrapText(ctx,bottomNote(),px,y+112,s.w-42,23,6);
    }else{
      const contact=state.contact||`${state.creator||'—'} / ${state.workName||''}`;
      ctx.fillStyle=theme.muted;
      ctx.font=weight(500,14.5);
      wrapText(ctx,contact,px,y+112,s.w-40,23,6);
    }
  });

  const fy=1608;
  ctx.strokeStyle=theme.line;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x,fy);
  ctx.lineTo(x+w,fy);
  ctx.stroke();

  ctx.fillStyle='#a0a8b3';
  ctx.font=weight(500,11.5);
  ctx.fillText('Created with License Creator',x,fy+31);
  ctx.textAlign='right';
  ctx.fillText('https://fugu0141.github.io/License_Creator/',x+w,fy+31);
  ctx.textAlign='left';
};

function drawBottomIcon(ctx,kind,cx,cy,theme){
  ctx.save();
  ctx.strokeStyle=theme.muted;
  ctx.fillStyle=theme.muted;
  ctx.lineWidth=1.5;
  ctx.lineCap='round';
  ctx.lineJoin='round';

  if(kind==='credit'){
    ctx.strokeRect(cx-7,cy-9,13,17);
    ctx.beginPath();ctx.moveTo(cx-3,cy-4);ctx.lineTo(cx+3,cy-4);ctx.moveTo(cx-3,cy);ctx.lineTo(cx+3,cy);ctx.moveTo(cx-3,cy+4);ctx.lineTo(cx+1,cy+4);ctx.stroke();
  }else if(kind==='ng'){
    ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx+8,cy-4);ctx.lineTo(cx+6,cy+6);ctx.lineTo(cx,cy+10);ctx.lineTo(cx-6,cy+6);ctx.lineTo(cx-8,cy-4);ctx.closePath();ctx.stroke();
  }else if(kind==='note'){
    ctx.beginPath();ctx.arc(cx,cy,8,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-3,cy+6);ctx.lineTo(cx-6,cy+10);ctx.lineTo(cx-1,cy+8);ctx.stroke();
  }else if(kind==='contact'){
    ctx.strokeRect(cx-9,cy-6,18,12);ctx.beginPath();ctx.moveTo(cx-9,cy-6);ctx.lineTo(cx,cy);ctx.lineTo(cx+9,cy-6);ctx.stroke();
  }else if(kind==='license'){
    ctx.beginPath();ctx.arc(cx,cy,9,0,Math.PI*2);ctx.stroke();ctx.font=weight(700,8.5);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('CC',cx,cy+.5);
  }
  ctx.restore();
}
