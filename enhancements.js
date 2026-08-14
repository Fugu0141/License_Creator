'use strict';

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if(!saved || typeof saved !== 'object') return;
    state = { ...structuredClone(DATA.defaultState), ...saved };
    state.policies = { ...DATA.defaultState.policies, ...(saved.policies || {}) };
    state.restrictions = { ...DATA.defaultState.restrictions, ...(saved.restrictions || {}) };
    if(!saved.policies || !Object.prototype.hasOwnProperty.call(saved.policies,'ai')){
      if(typeof saved.restrictions?.ai === 'boolean') state.policies.ai = saved.restrictions.ai ? 'deny' : 'allow';
    }
    delete state.restrictions.ai;
  }catch(err){ console.warn(err); }
}

function bind(){
  $$('.mode-tab').forEach(b=>b.addEventListener('click',()=>{ state.mode=b.dataset.mode; changed(); }));
  bindInput(el.title,'title'); bindInput(el.creator,'creator'); bindInput(el.workName,'workName'); bindInput(el.workType,'workType','change'); bindInput(el.updatedAt,'updatedAt','change'); bindInput(el.contact,'contact');
  bindInput(el.creditText,'creditText'); bindInput(el.notes,'notes'); bindInput(el.theme,'theme','change'); bindInput(el.accent,'accent','input'); bindInput(el.softwareScope,'softwareScope');
  bindCheck(el.adult,'adult'); bindCheck(el.political,'political'); bindCheck(el.nft,'nft'); bindCheck(el.harmful,'harmful'); bindCheck(el.impersonation,'impersonation');
  el.preset.addEventListener('change',()=>{
    const p=DATA.presets[el.preset.value];
    state.preset=el.preset.value;
    state.policies={...p.policies};
    state.credit=p.credit;
    state.restrictions={...p.restrictions};
    syncControls(); changed();
  });
  el.matrix.addEventListener('click',e=>{
    const b=e.target.closest('button[data-value]'); if(!b)return;
    const row=b.closest('[data-policy]'); state.policies[row.dataset.policy]=b.dataset.value; changed();
  });
  document.querySelector('[data-segment="credit"]').addEventListener('click',e=>{
    const b=e.target.closest('button[data-value]'); if(!b)return; state.credit=b.dataset.value; changed();
  });
  el.ccLicense.addEventListener('change',()=>{ state.ccLicense=el.ccLicense.value; changed(); });
  el.softwareLicense.addEventListener('change',()=>{ state.softwareLicense=el.softwareLicense.value; changed(); });
  el.imageInput.addEventListener('change',handleImage);
  el.resetImage.addEventListener('click',async()=>{ state.customImage=''; el.imageInput.value=''; el.imageLabel.textContent='生成イラストを使用中'; await loadIllustration(); changed(); });
  el.download.addEventListener('click',exportPdf);
}

function syncControls(){
  el.title.value=state.title; el.creator.value=state.creator; el.workName.value=state.workName; el.workType.value=state.workType; el.updatedAt.value=state.updatedAt; el.contact.value=state.contact;
  el.preset.value=state.preset; el.creditText.value=state.creditText; el.notes.value=state.notes; el.theme.value=state.theme; el.accent.value=state.accent; el.ccLicense.value=state.ccLicense; el.softwareLicense.value=state.softwareLicense; el.softwareScope.value=state.softwareScope || '';
  el.adult.checked=Boolean(state.restrictions.adult); el.political.checked=Boolean(state.restrictions.political); el.nft.checked=Boolean(state.restrictions.nft); el.harmful.checked=Boolean(state.restrictions.harmful); el.impersonation.checked=Boolean(state.restrictions.impersonation);
  syncMode(); syncPolicyButtons(); syncSegment(); renderResults();
}

function drawPanel(ctx,x,y,w,h,key,items,theme){
  const sc=STATUS_COLORS[key];
  roundedFill(ctx,x,y,w,h,30,sc.pale); strokeRound(ctx,x,y,w,h,30,sc.main,5);
  ctx.fillStyle=sc.main; ctx.font=weight(900,46); ctx.fillText(key==='allow'?'✓':key==='ask'?'!':'×',x+27,y+65);
  ctx.fillStyle=sc.ink; ctx.font=weight(900,31); ctx.fillText(STATUS[key],x+82,y+62);
  ctx.font=weight(700,14); ctx.fillStyle=hexAlpha(sc.ink,.65); ctx.fillText(key==='allow'?'Allowed':key==='ask'?'Ask First':'Not Allowed',x+84,y+87);
  const top=y+124, rowH=66, gap=8;
  if(!items.length){ ctx.fillStyle=hexAlpha(theme.muted,.75); ctx.font=weight(700,19); ctx.fillText('なし',x+26,top+38); return; }
  items.slice(0,7).forEach((item,idx)=>{
    const yy=top+idx*(rowH+gap);
    roundedFill(ctx,x+22,yy,w-44,rowH,17,theme.panel); strokeRound(ctx,x+22,yy,w-44,rowH,17,hexAlpha(sc.main,.18),2);
    roundedFill(ctx,x+36,yy+14,38,38,12,hexAlpha(sc.main,.12));
    drawPolicyIcon(ctx,item,x+55,yy+33,sc.ink);
    ctx.fillStyle=theme.ink; ctx.font=weight(850,18); wrapText(ctx,item.label,x+86,yy+23,w-124,22,2);
  });
}

function semanticKey(label){
  const s=String(label||'');
  if(/商用/.test(s)) return 'commercial';
  if(/改変|翻案|変更点/.test(s)) return 'modification';
  if(/共有|再配布/.test(s)) return 'redistribution';
  if(/同じ条件|同一条件|継承/.test(s)) return 'sharealike';
  if(/ソース公開|ソース/.test(s)) return 'source';
  if(/著作権表示|ライセンス文|条件文/.test(s)) return 'copyright';
  if(/特許/.test(s)) return 'patent';
  if(/私的/.test(s)) return 'private';
  if(/推薦/.test(s)) return 'recommendation';
  if(/AI|機械学習|生成AI/.test(s)) return 'ai';
  return 'generic';
}
function semanticItem(label){ return { label, key:semanticKey(label), icon:'' }; }

function getGroups(){
  if(state.mode==='cc'){
    const d=DATA.cc[state.ccLicense];
    return { allow:d.allow.map(semanticItem), ask:d.ask.map(semanticItem), deny:d.deny.map(semanticItem) };
  }
  if(state.mode==='software'){
    const d=DATA.software[state.softwareLicense];
    return { allow:d.allow.map(semanticItem), ask:d.ask.map(semanticItem), deny:d.deny.map(semanticItem) };
  }
  const groups={allow:[],ask:[],deny:[]};
  DATA.policyItems.forEach(item=>groups[state.policies[item.key]].push(item));
  return groups;
}

function drawPolicyIcon(ctx,item,cx,cy,color){
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.lineJoin='round';
  const key=item.key || semanticKey(item.label);
  if(key==='commercial') iconText(ctx,'¥',cx,cy,17);
  else if(key==='monetized'){ ctx.beginPath(); ctx.moveTo(cx-6,cy-8); ctx.lineTo(cx+8,cy); ctx.lineTo(cx-6,cy+8); ctx.closePath(); ctx.fill(); }
  else if(key==='modification'){ ctx.beginPath(); ctx.moveTo(cx-8,cy+7); ctx.lineTo(cx+7,cy-8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+4,cy-9); ctx.lineTo(cx+9,cy-4); ctx.stroke(); }
  else if(key==='project'){ ctx.beginPath(); ctx.moveTo(cx-8,cy); ctx.lineTo(cx+8,cy); ctx.moveTo(cx,cy-8); ctx.lineTo(cx,cy+8); ctx.stroke(); }
  else if(key==='merchandise'){ ctx.strokeRect(cx-8,cy-7,16,14); ctx.beginPath(); ctx.moveTo(cx,cy-7); ctx.lineTo(cx,cy+7); ctx.moveTo(cx-8,cy); ctx.lineTo(cx+8,cy); ctx.stroke(); }
  else if(key==='redistribution'){ ctx.beginPath(); ctx.moveTo(cx-8,cy+7); ctx.lineTo(cx+7,cy-8); ctx.lineTo(cx+7,cy); ctx.moveTo(cx+7,cy-8); ctx.lineTo(cx-1,cy-8); ctx.stroke(); }
  else if(key==='ai') iconText(ctx,'AI',cx,cy,12);
  else if(key==='sharealike'){ ctx.beginPath(); ctx.arc(cx,cy,8,-.8,2.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+7,cy-6);ctx.lineTo(cx+9,cy-1);ctx.lineTo(cx+4,cy-2);ctx.stroke(); }
  else if(key==='source') iconText(ctx,'</>',cx,cy,10);
  else if(key==='copyright'){ ctx.strokeRect(cx-7,cy-9,14,18); ctx.beginPath(); ctx.moveTo(cx-4,cy-4);ctx.lineTo(cx+4,cy-4);ctx.moveTo(cx-4,cy);ctx.lineTo(cx+4,cy);ctx.moveTo(cx-4,cy+4);ctx.lineTo(cx+2,cy+4);ctx.stroke(); }
  else if(key==='patent') iconText(ctx,'P',cx,cy,16);
  else if(key==='private'){ ctx.beginPath();ctx.arc(cx,cy-4,5,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy+8,9,Math.PI,0);ctx.stroke(); }
  else if(key==='recommendation'){ ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx+3,cy-3);ctx.lineTo(cx+9,cy-2);ctx.lineTo(cx+4,cy+3);ctx.lineTo(cx+6,cy+9);ctx.lineTo(cx,cy+6);ctx.lineTo(cx-6,cy+9);ctx.lineTo(cx-4,cy+3);ctx.lineTo(cx-9,cy-2);ctx.lineTo(cx-3,cy-3);ctx.closePath();ctx.stroke(); }
  else iconText(ctx,item.icon||'•',cx,cy,16);
  ctx.restore();
}
function iconText(ctx,text,cx,cy,size){ ctx.font=weight(900,size); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,cx,cy+1); }

function restrictionLabels(){
  if(state.mode!=='custom') return [];
  const labels={adult:'成人向け',political:'政治・宗教',nft:'NFT',harmful:'違法・中傷',impersonation:'公式を装う利用'};
  return Object.entries(state.restrictions).filter(([,v])=>v).map(([k])=>labels[k]).filter(Boolean);
}
