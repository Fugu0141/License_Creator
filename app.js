'use strict';

const DATA = window.LICENSE_DATA;
const DEFAULT_ILLUSTRATION = window.LICENSE_ASSETS?.defaultIllustration || '';
const STORAGE_KEY = 'license-studio-simple-v1';
const W = 1240;
const H = 1754;
const STATUS = { allow: '許可', ask: '要相談', deny: '禁止' };
const STATUS_COLORS = {
  allow: { main:'#22b889', pale:'#e9fbf5', ink:'#0d7355' },
  ask: { main:'#f1b93f', pale:'#fff7dc', ink:'#946400' },
  deny: { main:'#ef5d7b', pale:'#fff0f3', ink:'#a9344c' }
};
const THEMES = {
  blue: { bg:'#f3f8ff', ink:'#15305b', muted:'#657796', line:'#d8e5f4', panel:'#ffffff', soft:'#eaf3ff', footer:'#183563' },
  mint: { bg:'#f2fbf8', ink:'#173f38', muted:'#647c76', line:'#d4e9e2', panel:'#ffffff', soft:'#e6f6f1', footer:'#18483e' },
  lavender: { bg:'#f8f5ff', ink:'#34275e', muted:'#746b91', line:'#e3dcf2', panel:'#ffffff', soft:'#f0ebff', footer:'#3d316d' },
  warm: { bg:'#fff8f2', ink:'#553024', muted:'#8a7168', line:'#efddd2', panel:'#ffffff', soft:'#fff0e5', footer:'#5d382e' }
};

let state = structuredClone(DATA.defaultState);
let illustration = null;
let renderQueued = false;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const el = {
  saveStatus: $('#saveStatus'), title: $('#titleInput'), creator: $('#creatorInput'), workName: $('#workNameInput'), workType: $('#workTypeSelect'), updatedAt: $('#updatedAtInput'), contact: $('#contactInput'),
  customSection: $('#customSection'), ccSection: $('#ccSection'), softwareSection: $('#softwareSection'), preset: $('#presetSelect'), matrix: $('#policyMatrix'), creditText: $('#creditTextInput'), notes: $('#notesInput'),
  adult: $('#restrictionAdult'), political: $('#restrictionPolitical'), ai: $('#restrictionAi'), nft: $('#restrictionNft'), harmful: $('#restrictionHarmful'), impersonation: $('#restrictionImpersonation'),
  ccLicense: $('#ccLicenseSelect'), ccResult: $('#ccResultCard'), softwareLicense: $('#softwareLicenseSelect'), softwareResult: $('#softwareResultCard'), softwareScope: $('#softwareScopeInput'),
  theme: $('#themeSelect'), accent: $('#accentInput'), imageInput: $('#imageInput'), imageLabel: $('#imageLabel'), resetImage: $('#resetImageButton'), download: $('#downloadPdfButton'), status: $('#statusMessage'), canvas: $('#previewCanvas')
};

async function init(){
  loadState();
  if(!state.updatedAt) state.updatedAt = new Date().toISOString().slice(0,10);
  populate();
  buildPolicies();
  bind();
  syncControls();
  await loadIllustration();
  renderAll();
}

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if(saved && typeof saved === 'object'){
      state = { ...structuredClone(DATA.defaultState), ...saved };
      state.policies = { ...DATA.defaultState.policies, ...(saved.policies || {}) };
      state.restrictions = { ...DATA.defaultState.restrictions, ...(saved.restrictions || {}) };
    }
  }catch(err){ console.warn(err); }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); el.saveStatus.textContent='保存済み'; setTimeout(()=>el.saveStatus.textContent='自動保存',900); }catch(err){ console.warn(err); }
}
function populate(){
  el.workType.innerHTML = Object.entries(DATA.workTypes).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  el.preset.innerHTML = Object.entries(DATA.presets).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
  el.ccLicense.innerHTML = Object.keys(DATA.cc).map(k=>`<option value="${k}">${k}</option>`).join('');
  el.softwareLicense.innerHTML = Object.keys(DATA.software).map(k=>`<option value="${k}">${k}</option>`).join('');
}
function buildPolicies(){
  el.matrix.innerHTML = DATA.policyItems.map(item=>`<div class="policy-row" data-policy="${item.key}"><div class="policy-name"><span class="policy-icon">${item.icon}</span>${item.label}</div><div class="policy-options">${['allow','ask','deny'].map(v=>`<button type="button" data-value="${v}">${STATUS[v]}</button>`).join('')}</div></div>`).join('');
}
function bind(){
  $$('.mode-tab').forEach(b=>b.addEventListener('click',()=>{ state.mode=b.dataset.mode; changed(); }));
  bindInput(el.title,'title'); bindInput(el.creator,'creator'); bindInput(el.workName,'workName'); bindInput(el.workType,'workType','change'); bindInput(el.updatedAt,'updatedAt','change'); bindInput(el.contact,'contact');
  bindInput(el.creditText,'creditText'); bindInput(el.notes,'notes'); bindInput(el.theme,'theme','change'); bindInput(el.accent,'accent','input'); bindInput(el.softwareScope,'softwareScope');
  bindCheck(el.adult,'adult'); bindCheck(el.political,'political'); bindCheck(el.ai,'ai'); bindCheck(el.nft,'nft'); bindCheck(el.harmful,'harmful'); bindCheck(el.impersonation,'impersonation');
  el.preset.addEventListener('change',()=>{ const p=DATA.presets[el.preset.value]; state.preset=el.preset.value; state.policies={...p.policies}; state.credit=p.credit; state.restrictions={...p.restrictions}; syncControls(); changed(); });
  el.matrix.addEventListener('click',e=>{ const b=e.target.closest('button[data-value]'); if(!b)return; const row=b.closest('[data-policy]'); state.policies[row.dataset.policy]=b.dataset.value; changed(); });
  document.querySelector('[data-segment="credit"]').addEventListener('click',e=>{ const b=e.target.closest('button[data-value]'); if(!b)return; state.credit=b.dataset.value; changed(); });
  el.ccLicense.addEventListener('change',()=>{ state.ccLicense=el.ccLicense.value; changed(); });
  el.softwareLicense.addEventListener('change',()=>{ state.softwareLicense=el.softwareLicense.value; changed(); });
  el.imageInput.addEventListener('change',handleImage);
  el.resetImage.addEventListener('click',async()=>{ state.customImage=''; el.imageInput.value=''; el.imageLabel.textContent='生成イラストを使用中'; await loadIllustration(); changed(); });
  el.download.addEventListener('click',exportPdf);
}
function bindInput(node,key,event='input'){ node.addEventListener(event,()=>{ state[key]=node.value; changed(); }); }
function bindCheck(node,key){ node.addEventListener('change',()=>{ state.restrictions[key]=node.checked; changed(); }); }
function changed(){ syncMode(); syncPolicyButtons(); renderResults(); queueRender(); saveState(); }
function syncControls(){
  el.title.value=state.title; el.creator.value=state.creator; el.workName.value=state.workName; el.workType.value=state.workType; el.updatedAt.value=state.updatedAt; el.contact.value=state.contact;
  el.preset.value=state.preset; el.creditText.value=state.creditText; el.notes.value=state.notes; el.theme.value=state.theme; el.accent.value=state.accent; el.ccLicense.value=state.ccLicense; el.softwareLicense.value=state.softwareLicense; el.softwareScope.value=state.softwareScope || '';
  el.adult.checked=state.restrictions.adult; el.political.checked=state.restrictions.political; el.ai.checked=state.restrictions.ai; el.nft.checked=state.restrictions.nft; el.harmful.checked=state.restrictions.harmful; el.impersonation.checked=state.restrictions.impersonation;
  syncMode(); syncPolicyButtons(); syncSegment(); renderResults();
}
function syncMode(){
  $$('.mode-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
  el.customSection.hidden=state.mode!=='custom'; el.ccSection.hidden=state.mode!=='cc'; el.softwareSection.hidden=state.mode!=='software';
}
function syncPolicyButtons(){
  el.matrix.querySelectorAll('[data-policy]').forEach(row=>row.querySelectorAll('button').forEach(b=>b.classList.toggle('active', state.policies[row.dataset.policy]===b.dataset.value)));
}
function syncSegment(){ document.querySelectorAll('[data-segment="credit"] button').forEach(b=>b.classList.toggle('active',b.dataset.value===state.credit)); }
function renderResults(){
  const cc=DATA.cc[state.ccLicense]; el.ccResult.innerHTML=`<strong>${state.ccLicense}</strong><p>${cc.allow.join(' / ')}${cc.deny.length ? `　禁止: ${cc.deny.join(' / ')}`:''}</p>`;
  const sw=DATA.software[state.softwareLicense]; el.softwareResult.innerHTML=`<strong>${state.softwareLicense}</strong><p>${sw.note}</p>`;
}
function renderAll(){ syncControls(); queueRender(); }
function queueRender(){ if(renderQueued)return; renderQueued=true; requestAnimationFrame(()=>{ renderQueued=false; drawPdf(); }); }

async function loadIllustration(){
  illustration = await loadImage(state.customImage || DEFAULT_ILLUSTRATION).catch(()=>null);
}
function loadImage(src){ return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=src; }); }
async function handleImage(){
  const file=el.imageInput.files?.[0]; if(!file)return;
  try{ state.customImage=await resizeImageFile(file,700); el.imageLabel.textContent=file.name; await loadIllustration(); changed(); }
  catch(err){ setStatus('画像を読み込めませんでした。',true); }
}
function resizeImageFile(file,max){ return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onerror=reject; r.onload=()=>{ const img=new Image(); img.onerror=reject; img.onload=()=>{ const scale=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale); c.getContext('2d').drawImage(img,0,0,c.width,c.height); resolve(c.toDataURL('image/jpeg',.9)); }; img.src=String(r.result); }; r.readAsDataURL(file); }); }

function drawPdf(){
  const c=el.canvas, ctx=c.getContext('2d'); c.width=W; c.height=H;
  const theme=THEMES[state.theme] || THEMES.blue;
  ctx.clearRect(0,0,W,H); ctx.fillStyle=theme.bg; ctx.fillRect(0,0,W,H);
  drawSoftDecoration(ctx,theme);
  drawHeader(ctx,theme);
  drawMeta(ctx,theme);
  drawStatusPanels(ctx,theme);
  drawBottom(ctx,theme);
}

function drawSoftDecoration(ctx,theme){
  const g=ctx.createRadialGradient(1050,80,0,1050,80,380); g.addColorStop(0,hexAlpha(state.accent,.20)); g.addColorStop(1,hexAlpha(state.accent,0)); ctx.fillStyle=g; ctx.fillRect(700,0,540,430);
  const g2=ctx.createRadialGradient(90,1650,0,90,1650,300); g2.addColorStop(0,hexAlpha(state.accent,.10)); g2.addColorStop(1,hexAlpha(state.accent,0)); ctx.fillStyle=g2; ctx.fillRect(0,1350,450,404);
}
function drawHeader(ctx,theme){
  ctx.fillStyle=state.accent; ctx.font=weight(800,18); ctx.fillText('LICENSE / TERMS OF USE',72,70);
  ctx.fillStyle=theme.ink; ctx.font=weight(900,58); ctx.fillText(state.title || '作品利用ガイド',72,132);
  ctx.fillStyle=theme.muted; ctx.font=weight(600,22);
  wrapText(ctx, `「${state.workName || 'この作品'}」を使うときに必要なルールを、ひと目で分かるようにまとめています。`,72,190,710,34,2);
  if(illustration){
    const x=900,y=52,w=260,h=260; ctx.save(); roundedPath(ctx,x,y,w,h,52); ctx.clip(); drawImageCover(ctx,illustration,x,y,w,h); ctx.restore();
    ctx.strokeStyle=hexAlpha(state.accent,.25); ctx.lineWidth=5; roundedPath(ctx,x,y,w,h,52); ctx.stroke();
  }
}
function drawMeta(ctx,theme){
  const y=340,h=92; roundedFill(ctx,62,y,1116,h,28,theme.panel); strokeRound(ctx,62,y,1116,h,28,theme.line,2);
  const items=[['作者',state.creator||'—'],['作品',state.workName||'—'],['更新',state.updatedAt||'—']];
  items.forEach((it,i)=>{ const x=92+i*350; ctx.fillStyle=theme.muted; ctx.font=weight(700,15); ctx.fillText(it[0],x,y+28); ctx.fillStyle=theme.ink; ctx.font=weight(850,21); ctx.fillText(short(it[1],20),x,y+59); if(i<2){ctx.strokeStyle=theme.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+300,y+20);ctx.lineTo(x+300,y+72);ctx.stroke();} });
}
function drawStatusPanels(ctx,theme){
  const groups=getGroups();
  const y=490,w=344,h=650,gap=16;
  ['allow','ask','deny'].forEach((key,i)=>{ drawPanel(ctx,62+i*(w+gap),y,w,h,key,groups[key],theme); });
}
function drawPanel(ctx,x,y,w,h,key,items,theme){
  const sc=STATUS_COLORS[key];
  roundedFill(ctx,x,y,w,h,30,sc.pale); strokeRound(ctx,x,y,w,h,30,sc.main,5);
  ctx.fillStyle=sc.main; ctx.font=weight(900,46); ctx.fillText(key==='allow'?'✓':key==='ask'?'!':'×',x+27,y+65);
  ctx.fillStyle=sc.ink; ctx.font=weight(900,31); ctx.fillText(STATUS[key],x+82,y+62);
  ctx.font=weight(700,14); ctx.fillStyle=hexAlpha(sc.ink,.65); ctx.fillText(key==='allow'?'Allowed':key==='ask'?'Ask First':'Not Allowed',x+84,y+87);
  const top=y+128; const rowH=76;
  if(!items.length){ ctx.fillStyle=hexAlpha(theme.muted,.75); ctx.font=weight(700,19); ctx.fillText('なし',x+26,top+38); return; }
  items.slice(0,6).forEach((item,idx)=>{
    const yy=top+idx*(rowH+12); roundedFill(ctx,x+22,yy,w-44,rowH,18,theme.panel); strokeRound(ctx,x+22,yy,w-44,rowH,18,hexAlpha(sc.main,.18),2);
    roundedFill(ctx,x+36,yy+17,42,42,13,hexAlpha(sc.main,.12));
    drawPolicyIcon(ctx,item,x+57,yy+38,sc.ink);
    ctx.fillStyle=theme.ink; ctx.font=weight(850,20); wrapText(ctx,item.label,x+92,yy+26,w-132,25,2);
  });
}

function drawPolicyIcon(ctx,item,cx,cy,color){
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=3; ctx.lineCap='round'; ctx.lineJoin='round';
  const key=item.key;
  if(key==='commercial'){ ctx.font=weight(900,18); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('¥',cx,cy+1); }
  else if(key==='monetized'){ ctx.beginPath(); ctx.moveTo(cx-6,cy-9); ctx.lineTo(cx+9,cy); ctx.lineTo(cx-6,cy+9); ctx.closePath(); ctx.fill(); }
  else if(key==='modification'){ ctx.beginPath(); ctx.moveTo(cx-8,cy+7); ctx.lineTo(cx+7,cy-8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+4,cy-9); ctx.lineTo(cx+9,cy-4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx-9,cy+9); ctx.lineTo(cx-4,cy+8); ctx.stroke(); }
  else if(key==='project'){ ctx.beginPath(); ctx.moveTo(cx-8,cy); ctx.lineTo(cx+8,cy); ctx.moveTo(cx,cy-8); ctx.lineTo(cx,cy+8); ctx.stroke(); }
  else if(key==='merchandise'){ ctx.strokeRect(cx-9,cy-8,18,16); ctx.beginPath(); ctx.moveTo(cx,cy-8); ctx.lineTo(cx,cy+8); ctx.moveTo(cx-9,cy-1); ctx.lineTo(cx+9,cy-1); ctx.stroke(); }
  else if(key==='redistribution'){ ctx.beginPath(); ctx.moveTo(cx-8,cy+7); ctx.lineTo(cx+7,cy-8); ctx.lineTo(cx+7,cy); ctx.moveTo(cx+7,cy-8); ctx.lineTo(cx-1,cy-8); ctx.stroke(); }
  else { ctx.font=weight(900,18); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(item.icon||'•',cx,cy+1); }
  ctx.restore();
}

function drawBottom(ctx,theme){
  const x=62,y=1185,w=1116,h=430;
  roundedFill(ctx,x,y,w,h,30,theme.panel); strokeRound(ctx,x,y,w,h,30,theme.line,2);
  ctx.fillStyle=state.accent; ctx.font=weight(900,20); ctx.fillText('USE NOTES',x+30,y+43);
  ctx.fillStyle=theme.ink; ctx.font=weight(900,30); ctx.fillText('使うときのお願い',x+30,y+82);

  roundedFill(ctx,x+28,y+112,510,112,20,theme.soft);
  ctx.fillStyle=theme.ink;ctx.font=weight(850,20);ctx.fillText('クレジット',x+50,y+147);
  ctx.fillStyle=theme.muted;ctx.font=weight(600,17); const credit=creditSentence(); wrapText(ctx,credit,x+50,y+177,455,24,2);

  roundedFill(ctx,x+558,y+112,530,112,20,theme.soft);
  ctx.fillStyle=theme.ink;ctx.font=weight(850,20);ctx.fillText('追加の禁止',x+580,y+147);
  const restrictions=restrictionLabels(); ctx.fillStyle=theme.muted;ctx.font=weight(650,17); wrapText(ctx,restrictions.length?restrictions.join(' / '):'特になし',x+580,y+177,485,24,2);

  ctx.fillStyle=theme.ink;ctx.font=weight(850,20);ctx.fillText('補足',x+30,y+270);
  ctx.fillStyle=theme.muted;ctx.font=weight(600,17); wrapText(ctx,bottomNote(),x+30,y+302,w-60,26,3);

  roundedFill(ctx,62,1640,1116,74,24,theme.footer);
  ctx.fillStyle='#fff';ctx.font=weight(850,18);ctx.fillText('ご利用ありがとうございます',88,1682);
  ctx.font=weight(600,15);ctx.fillStyle='rgba(255,255,255,.72)';const contact=state.contact ? `問い合わせ: ${state.contact}` : `${state.creator || 'License Studio'} / ${state.workName || ''}`; ctx.textAlign='right';ctx.fillText(short(contact,58),1150,1682);ctx.textAlign='left';
}

function getGroups(){
  if(state.mode==='cc'){
    const d=DATA.cc[state.ccLicense]; return { allow:d.allow.map(label=>({label,icon:'✓'})), ask:d.ask.map(label=>({label,icon:'!'})), deny:d.deny.map(label=>({label,icon:'×'})) };
  }
  if(state.mode==='software'){
    const d=DATA.software[state.softwareLicense]; return { allow:d.allow.map(label=>({label,icon:'✓'})), ask:d.ask.map(label=>({label,icon:'!'})), deny:d.deny.map(label=>({label,icon:'×'})) };
  }
  const groups={allow:[],ask:[],deny:[]}; DATA.policyItems.forEach(item=>groups[state.policies[item.key]].push(item)); return groups;
}
function creditSentence(){
  if(state.mode==='cc') return DATA.cc[state.ccLicense].credit;
  if(state.mode==='software') return 'ライセンス本文・著作権表示など、選択したOSSライセンスの条件に従ってください。';
  if(state.credit==='none') return 'クレジット表記は不要です。';
  if(state.credit==='recommended') return `表記を推奨します。${state.creditText ? ` 例: ${state.creditText}`:''}`;
  return `表記が必要です。${state.creditText ? ` 例: ${state.creditText}`:''}`;
}
function restrictionLabels(){
  if(state.mode!=='custom') return [];
  const labels={adult:'成人向け',political:'政治・宗教',ai:'AI学習',nft:'NFT',harmful:'違法・中傷',impersonation:'公式を装う利用'};
  return Object.entries(state.restrictions).filter(([,v])=>v).map(([k])=>labels[k]);
}
function bottomNote(){
  if(state.mode==='cc') return `正式な条件は ${DATA.cc[state.ccLicense].url} を確認してください。`;
  if(state.mode==='software') return `${DATA.software[state.softwareLicense].note}${state.softwareScope ? ` 適用範囲: ${state.softwareScope}`:''}`;
  return state.notes || '判断に迷う利用は、事前に作者へお問い合わせください。';
}

async function exportPdf(){
  try{
    if(!window.jspdf?.jsPDF) throw new Error('PDFライブラリを読み込めませんでした。');
    el.download.disabled=true; setStatus('PDFを生成しています…'); drawPdf(); await new Promise(r=>requestAnimationFrame(r));
    const { jsPDF }=window.jspdf; const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    const image=el.canvas.toDataURL('image/jpeg',.96); pdf.addImage(image,'JPEG',0,0,210,297,undefined,'FAST');
    pdf.setProperties({title:state.title||'License',author:state.creator||'License Studio',subject:'License / Terms of Use',creator:'License Studio'});
    pdf.save(`${safeName(state.workName||'work')}-license.pdf`); setStatus('PDFを書き出しました。');
  }catch(err){ console.error(err); setStatus(err.message||'PDFの生成に失敗しました。',true); }
  finally{el.download.disabled=false;}
}

function setStatus(msg,error=false){el.status.textContent=msg;el.status.style.color=error?'#b23850':'';}
function safeName(s){return String(s).replace(/[\\/:*?"<>|]/g,'').trim().replace(/\s+/g,'-')||'license';}
function weight(w,size){return `${w} ${size}px "Noto Sans JP","Yu Gothic",Meiryo,sans-serif`;}
function roundedPath(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function roundedFill(ctx,x,y,w,h,r,color){ctx.fillStyle=color;roundedPath(ctx,x,y,w,h,r);ctx.fill();}
function strokeRound(ctx,x,y,w,h,r,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;roundedPath(ctx,x,y,w,h,r);ctx.stroke();}
function drawImageCover(ctx,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height);const sw=w/s,sh=h/s,sx=(img.width-sw)/2,sy=(img.height-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){
  const chars=Array.from(String(text||''));let line='';let lines=[];
  for(const ch of chars){ if(ch==='\n'){lines.push(line);line='';continue;} const test=line+ch; if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=ch;}else line=test; }
  if(line)lines.push(line); if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(ctx.measureText(last+'…').width>maxWidth && last.length>1)last=last.slice(0,-1);lines[maxLines-1]=last+'…';}
  lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight)); return lines.length;
}
function short(v,n){const s=String(v||'');return s.length>n?s.slice(0,n-1)+'…':s;}
function hexAlpha(hex,a){let h=hex.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}

document.addEventListener('DOMContentLoaded',init);
