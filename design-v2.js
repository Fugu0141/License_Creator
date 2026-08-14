'use strict';

const EDITORIAL_STATUS = {
  allow: { line:'#86cfa8', ink:'#166534', pale:'#f0fdf4' },
  ask:  { line:'#e8be62', ink:'#92400e', pale:'#fffbeb' },
  deny: { line:'#df8b8b', ink:'#991b1b', pale:'#fef2f2' }
};

function editorialTheme(){
  return {
    bg:'#ffffff', ink:'#172033', muted:'#667085', faint:'#98a2b3', line:'#e4e7ec', lineStrong:'#d0d5dd', soft:'#f8fafc', accent: state.accent || '#5b7fb7'
  };
}

drawPdf = function(){
  const c=el.canvas, ctx=c.getContext('2d');
  c.width=W; c.height=H;
  const theme=editorialTheme();
  ctx.clearRect(0,0,W,H); ctx.fillStyle=theme.bg; ctx.fillRect(0,0,W,H);
  drawHeader(ctx,theme); drawMeta(ctx,theme); drawStatusPanels(ctx,theme); drawBottom(ctx,theme);
};

drawSoftDecoration = function(){};

drawHeader = function(ctx,theme){
  const left=78;
  ctx.fillStyle=theme.accent; ctx.fillRect(left,58,3,45);
  ctx.fillStyle=theme.ink; ctx.font=weight(750,17); ctx.fillText('LICENSE / TERMS OF USE',left+22,86);
  ctx.font=weight(800,55); ctx.fillText(state.title || '作品利用ガイド',left,157);
  ctx.fillStyle=theme.muted; ctx.font=weight(500,21);
  wrapText(ctx,`「${state.workName || 'この作品'}」を使うときのルールを、ひと目で確認できるようにまとめています。`,left,211,700,32,2);
  if(illustration){
    const x=940,y=58,w=220,h=220; ctx.save(); roundedPath(ctx,x,y,w,h,18); ctx.clip(); drawImageCover(ctx,illustration,x,y,w,h); ctx.restore();
    strokeRound(ctx,x,y,w,h,18,theme.line,1.5);
  }
};

drawMeta = function(ctx,theme){
  const x=78,y=326,w=1084,h=108;
  ctx.strokeStyle=theme.lineStrong; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.stroke();
  const items=[['作者',state.creator||'—'],['作品',state.workName||'—'],['更新',state.updatedAt||'—']]; const colW=w/3;
  items.forEach((it,i)=>{ const xx=x+i*colW+24; if(i>0){ctx.strokeStyle=theme.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+i*colW,y+23);ctx.lineTo(x+i*colW,y+h-23);ctx.stroke();}
    ctx.fillStyle=theme.muted;ctx.font=weight(650,14);ctx.fillText(it[0],xx,y+34); ctx.fillStyle=theme.ink;ctx.font=weight(700,21);ctx.fillText(short(it[1],23),xx,y+70); });
};

drawStatusPanels = function(ctx,theme){
  const groups=getGroups(); const y=480,w=349,h=625,gap=18;
  ['allow','ask','deny'].forEach((key,i)=>drawPanel(ctx,78+i*(w+gap),y,w,h,key,groups[key],theme));
};

drawPanel = function(ctx,x,y,w,h,key,items,theme){
  const sc=EDITORIAL_STATUS[key]; roundedFill(ctx,x,y,w,h,14,'#ffffff'); strokeRound(ctx,x,y,w,h,14,theme.line,1.2); ctx.fillStyle=sc.line; ctx.fillRect(x+1,y+1,w-2,4);
  ctx.strokeStyle=sc.ink;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';
  if(key==='allow'){ctx.beginPath();ctx.moveTo(x+28,y+55);ctx.lineTo(x+35,y+62);ctx.lineTo(x+50,y+44);ctx.stroke();}
  else if(key==='ask'){ctx.beginPath();ctx.moveTo(x+39,y+42);ctx.lineTo(x+39,y+57);ctx.stroke();ctx.beginPath();ctx.arc(x+39,y+65,1.6,0,Math.PI*2);ctx.fillStyle=sc.ink;ctx.fill();}
  else{ctx.beginPath();ctx.moveTo(x+30,y+45);ctx.lineTo(x+48,y+63);ctx.moveTo(x+48,y+45);ctx.lineTo(x+30,y+63);ctx.stroke();}
  ctx.fillStyle=theme.ink;ctx.font=weight(760,28);ctx.fillText(STATUS[key],x+67,y+61); ctx.fillStyle=sc.ink;ctx.font=weight(600,13);ctx.fillText(key==='allow'?'ALLOWED':key==='ask'?'ASK FIRST':'NOT ALLOWED',x+68,y+84);
  ctx.strokeStyle=theme.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+24,y+108);ctx.lineTo(x+w-24,y+108);ctx.stroke();
  const startY=y+126,rowH=67;
  if(!items.length){ctx.fillStyle=theme.faint;ctx.font=weight(500,16);ctx.fillText('該当なし',x+25,startY+32);return;}
  items.slice(0,7).forEach((item,idx)=>{const yy=startY+idx*rowH;if(idx>0){ctx.strokeStyle='#f0f2f5';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+24,yy);ctx.lineTo(x+w-24,yy);ctx.stroke();}
    roundedFill(ctx,x+24,yy+15,34,34,9,sc.pale);drawPolicyIcon(ctx,item,x+41,yy+32,sc.ink);ctx.fillStyle=theme.ink;ctx.font=weight(650,17.5);wrapText(ctx,item.label,x+73,yy+24,w-101,23,2);});
};

drawBottom = function(ctx,theme){
  const x=78,y=1160,w=1084;ctx.strokeStyle=theme.lineStrong;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();
  const sections=[{x,w:235,title:'CREDIT',kind:'credit'},{x:x+235,w:235,title:state.mode==='cc'?'LICENSE':'NG',kind:state.mode==='cc'?'license':'ng'},{x:x+470,w:390,title:'NOTE',kind:'note'},{x:x+860,w:224,title:'CONTACT',kind:'contact'}];
  sections.forEach((s,i)=>{if(i>0){ctx.strokeStyle=theme.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(s.x,y+28);ctx.lineTo(s.x,y+250);ctx.stroke();}const px=s.x+22;drawBottomIcon(ctx,s.kind,px+10,y+45,theme);ctx.fillStyle=theme.ink;ctx.font=weight(700,14);ctx.fillText(s.title,px,y+87);ctx.fillStyle=theme.accent;ctx.fillRect(px,y+101,32,2);
    if(s.kind==='credit'){ctx.fillStyle=theme.muted;ctx.font=weight(500,15.5);wrapText(ctx,creditSentence(),px,y+138,s.w-42,24,4);}
    else if(s.kind==='ng'){const r=restrictionLabels();ctx.fillStyle=theme.muted;ctx.font=weight(500,15.5);wrapText(ctx,r.length?r.join(' / '):'特になし',px,y+138,s.w-42,24,4);}
    else if(s.kind==='license'){const license=DATA.cc[state.ccLicense];if(typeof ccOfficialBadge!=='undefined'&&ccOfficialBadge){const bw=108,bh=Math.round(bw*((ccOfficialBadge.naturalHeight/ccOfficialBadge.naturalWidth)||31/88));ctx.drawImage(ccOfficialBadge,px,y+127,bw,bh);ctx.fillStyle=theme.ink;ctx.font=weight(650,14);ctx.fillText(state.ccLicense,px,y+190);ctx.fillStyle=theme.muted;ctx.font=weight(500,10.5);wrapText(ctx,license.url,px,y+213,s.w-42,16,2);}else{ctx.fillStyle=theme.ink;ctx.font=weight(650,15);ctx.fillText(state.ccLicense,px,y+142);ctx.fillStyle=theme.muted;ctx.font=weight(500,11);wrapText(ctx,license.url,px,y+168,s.w-42,17,3);}}
    else if(s.kind==='note'){ctx.fillStyle=theme.muted;ctx.font=weight(500,15.5);wrapText(ctx,bottomNote(),px,y+138,s.w-44,25,5);}
    else{const contact=state.contact||`${state.creator||'—'} / ${state.workName||''}`;ctx.fillStyle=theme.muted;ctx.font=weight(500,15.5);wrapText(ctx,contact,px,y+138,s.w-42,24,5);}});
  const fy=1518;ctx.strokeStyle=theme.lineStrong;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,fy);ctx.lineTo(x+w,fy);ctx.stroke();ctx.fillStyle=theme.muted;ctx.font=weight(500,14);ctx.fillText('ご利用ありがとうございます',x,fy+42);ctx.textAlign='right';ctx.fillText(`${state.creator||'—'} / ${state.workName||''}`,x+w,fy+42);ctx.textAlign='left';
};

function drawBottomIcon(ctx,kind,cx,cy,theme){
  ctx.save();ctx.strokeStyle=theme.ink;ctx.fillStyle=theme.ink;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';
  if(kind==='credit'){ctx.strokeRect(cx-8,cy-10,14,18);ctx.beginPath();ctx.moveTo(cx-4,cy-5);ctx.lineTo(cx+3,cy-5);ctx.moveTo(cx-4,cy);ctx.lineTo(cx+3,cy);ctx.moveTo(cx-4,cy+5);ctx.lineTo(cx+1,cy+5);ctx.stroke();}
  else if(kind==='ng'){ctx.beginPath();ctx.moveTo(cx,cy-10);ctx.lineTo(cx+9,cy-5);ctx.lineTo(cx+7,cy+7);ctx.lineTo(cx,cy+11);ctx.lineTo(cx-7,cy+7);ctx.lineTo(cx-9,cy-5);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy-4);ctx.lineTo(cx,cy+3);ctx.stroke();}
  else if(kind==='note'){ctx.beginPath();ctx.arc(cx,cy,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-4,cy+7);ctx.lineTo(cx-7,cy+12);ctx.lineTo(cx-1,cy+9);ctx.stroke();}
  else if(kind==='contact'){ctx.strokeRect(cx-10,cy-7,20,14);ctx.beginPath();ctx.moveTo(cx-10,cy-7);ctx.lineTo(cx,cy+1);ctx.lineTo(cx+10,cy-7);ctx.stroke();}
  else if(kind==='license'){ctx.beginPath();ctx.arc(cx,cy,10,0,Math.PI*2);ctx.stroke();ctx.font=weight(800,10);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('CC',cx,cy+1);}ctx.restore();
}
