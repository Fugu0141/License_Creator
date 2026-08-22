'use strict';

(() => {
  const TERM_META = {
    '共有・再配布': { path:'term.shareRedistribute', key:'redistribution' },
    '改変・翻案': { path:'term.adapt', key:'modification' },
    '商用利用': { path:'policy.commercial', key:'commercial' },
    '改変物は同じ条件で共有': { path:'term.shareAlike', key:'sharealike' },
    '改変物の共有': { path:'term.shareAdaptations', key:'modification' },
    '改変': { path:'term.modify', key:'modification' },
    '再配布': { path:'term.redistribute', key:'redistribution' },
    '私的利用': { path:'term.privateUse', key:'private' },
    '特許利用': { path:'term.patentUse', key:'patent' },
    '著作権表示とライセンス文を保持': { path:'term.keepCopyrightLicense', key:'copyright' },
    'ライセンス文の保持': { path:'term.keepLicenseText', key:'copyright' },
    '変更点の明示': { path:'term.stateChanges', key:'modification' },
    '著作権表示と条件文を保持': { path:'term.keepCopyrightConditions', key:'copyright' },
    '作者名による推薦を装う利用': { path:'term.noEndorsement', key:'recommendation' },
    '変更した対象ファイルのソース公開': { path:'term.discloseChangedFiles', key:'source' },
    '派生作品のソース公開': { path:'term.discloseSource', key:'source' },
    '同一条件の継承': { path:'term.sameLicense', key:'sharealike' }
  };

  const DETAIL_RESTRICTIONS = {
    ja:{adult:'成人向け利用',political:'政治・宗教利用',nft:'NFT・暗号資産利用',harmful:'違法・中傷・有害利用',impersonation:'公式を装う利用'},
    en:{adult:'Adult-content use',political:'Political / religious use',nft:'NFT / crypto-asset use',harmful:'Illegal / abusive / harmful use',impersonation:'Use that impersonates an official source'},
    'zh-CN':{adult:'成人内容用途',political:'政治 / 宗教用途',nft:'NFT / 加密资产用途',harmful:'违法 / 诽谤 / 有害用途',impersonation:'冒充官方的用途'},
    ko:{adult:'성인용 이용',political:'정치 / 종교 이용',nft:'NFT / 암호자산 이용',harmful:'불법 / 비방 / 유해 이용',impersonation:'공식 사칭 이용'}
  };

  const UI_PLACEHOLDERS = {
    ja:{creator:'例: 作者名 / サークル名',work:'例: 作品名',credit:'例: © 2026 作者名 / 作品名',notes:'必要に応じて、利用時の補足や注意事項を入力'},
    en:{creator:'Example: Creator / circle name',work:'Example: Work title',credit:'Example: © 2026 Creator / Work title',notes:'Add any usage notes or cautions if needed'},
    'zh-CN':{creator:'例如：作者名 / 社团名',work:'例如：作品名称',credit:'例如：© 2026 作者名 / 作品名称',notes:'可根据需要填写使用补充说明或注意事项'},
    ko:{creator:'예: 제작자명 / 서클명',work:'예: 작품명',credit:'예: © 2026 제작자명 / 작품명',notes:'필요한 경우 이용 관련 보충 설명이나 주의 사항을 입력'}
  };

  function supportedLanguage(value){
    return ['ja','en','zh-CN','ko'].includes(value) ? value : 'ja';
  }

  function currentUiLanguage(){
    return supportedLanguage(state?.uiLanguage);
  }

  function currentPdfLanguage(){
    return state?.pdfLanguage === 'same'
      ? currentUiLanguage()
      : supportedLanguage(state?.pdfLanguage);
  }

  function softwareNoteFor(lang,license){
    const dictionary=window.LICENSE_I18N?.[supportedLanguage(lang)]?.softwareNote;
    return dictionary?.[license]
      || window.LICENSE_I18N?.ja?.softwareNote?.[license]
      || DATA.software?.[license]?.note
      || '';
  }

  function localizedSemanticItem(label,icon=''){
    const meta=TERM_META[String(label || '')];
    if(meta){
      return {
        label:window.licensePdfT?.(meta.path) || label,
        key:meta.key,
        icon
      };
    }
    return {
      label:String(label || ''),
      key:typeof semanticKey==='function' ? semanticKey(label) : 'generic',
      icon
    };
  }

  // Preserve the semantic keys/icons and the detailed custom restrictions from
  // enhancements.js while replacing only the system-owned labels for export.
  getGroups=function(){
    if(state.mode==='cc'){
      const d=DATA.cc[state.ccLicense];
      return {
        allow:d.allow.map(label=>localizedSemanticItem(label,'✓')),
        ask:d.ask.map(label=>localizedSemanticItem(label,'!')),
        deny:d.deny.map(label=>localizedSemanticItem(label,'×'))
      };
    }
    if(state.mode==='software'){
      const d=DATA.software[state.softwareLicense];
      return {
        allow:d.allow.map(label=>localizedSemanticItem(label,'✓')),
        ask:d.ask.map(label=>localizedSemanticItem(label,'!')),
        deny:d.deny.map(label=>localizedSemanticItem(label,'×'))
      };
    }

    const groups={allow:[],ask:[],deny:[]};
    DATA.policyItems.forEach(item=>{
      groups[state.policies[item.key]].push({
        ...item,
        label:window.licensePdfT?.(`policy.${item.key}`) || item.label
      });
    });

    const lang=currentPdfLanguage();
    Object.entries(DETAIL_RESTRICTIONS[lang] || DETAIL_RESTRICTIONS.ja).forEach(([key,label])=>{
      if(state.restrictions?.[key]) groups.deny.push({key,label,icon:''});
    });
    return groups;
  };

  restrictionLabels=function(){
    if(state.mode!=='custom') return [];
    const labels=DETAIL_RESTRICTIONS[currentPdfLanguage()] || DETAIL_RESTRICTIONS.ja;
    return Object.entries(labels)
      .filter(([key])=>Boolean(state.restrictions?.[key]))
      .map(([,label])=>label);
  };

  // Restore the content-sized panel behavior from custom-panel-auto.js for all
  // modes, while keeping the vertical balance shift introduced later.
  drawStatusPanels=function(ctx,theme){
    const groups=getGroups();
    const shift=typeof PDF_CONTENT_SHIFT_Y==='number' ? PDF_CONTENT_SHIFT_Y : 36;
    const y=468+shift,w=349,gap=18;
    const maxItems=Math.max(1,groups.allow.length,groups.ask.length,groups.deny.length);
    const calculated=126+maxItems*66+28;
    let h;
    if(state.mode==='custom') h=Math.max(270,Math.min(620,calculated));
    else if(state.mode==='cc') h=Math.max(270,Math.min(390,calculated));
    else h=Math.max(285,Math.min(430,calculated));
    ['allow','ask','deny'].forEach((key,i)=>drawPanel(ctx,78+i*(w+gap),y,w,h,key,groups[key],theme));
    return {y,height:h,bottom:y+h};
  };

  // Keep header-polish.js' long-title safety while localizing only system text.
  titleBreakCandidates=function(text){
    const value=String(text||'');
    const candidates=new Map();
    try{
      if(typeof Intl!=='undefined' && Intl.Segmenter){
        const segs=Array.from(new Intl.Segmenter(currentPdfLanguage(),{granularity:'word'}).segment(value));
        let pos=0;
        segs.forEach(seg=>{
          pos+=seg.segment.length;
          if(pos>0 && pos<value.length) candidates.set(pos,0);
        });
      }
    }catch(err){ /* character fallback below */ }
    for(let i=1;i<value.length;i++){
      const prev=value[i-1];
      if(/\s/.test(prev) || /[・／/｜|:：―—–-]/.test(prev)) candidates.set(i,Math.min(candidates.get(i)??Infinity,0));
      else if(/[、。，．,.!?！？]/.test(prev)) candidates.set(i,Math.min(candidates.get(i)??Infinity,4));
    }
    for(let i=1;i<value.length;i++) if(!candidates.has(i)) candidates.set(i,18);
    return [...candidates.entries()].map(([index,penalty])=>({index,penalty}));
  };

  drawHeader=function(ctx,theme){
    const left=78;
    const titleMaxWidth=810;
    const shift=typeof PDF_CONTENT_SHIFT_Y==='number' ? PDF_CONTENT_SHIFT_Y : 36;

    ctx.fillStyle=theme.muted;
    ctx.font=weight(700,15);
    ctx.letterSpacing='1px';
    ctx.fillText(window.licensePdfT?.('pdf.kicker') || 'LICENSE / TERMS OF USE',left,78+shift);
    ctx.letterSpacing='0px';

    const rawTitle=(state.titleCustomized && String(state.title || '').trim())
      ? String(state.title).trim()
      : (window.licensePdfT?.('pdf.defaultTitle') || '作品利用ガイド');
    const title=fitHeaderTitle(ctx,rawTitle,titleMaxWidth);
    const titleTop=116+shift;
    ctx.fillStyle=theme.ink;
    ctx.font=weight(800,title.size);
    ctx.textBaseline='top';
    title.lines.forEach((line,i)=>ctx.fillText(line,left,titleTop+i*title.lineHeight));
    ctx.textBaseline='alphabetic';

    const titleBottom=titleTop+title.lines.length*title.lineHeight;
    const descriptionY=Math.max(207+shift,titleBottom+23);
    const work=String(state.workName || '').trim() || (window.licensePdfT?.('pdf.thisWork') || 'この作品');
    const description=window.licensePdfT?.('pdf.description',{work}) || work;
    ctx.fillStyle=theme.muted;
    let drawn=false;
    for(let size=20;size>=16.5;size-=.5){
      ctx.font=weight(500,size);
      if(ctx.measureText(description).width<=titleMaxWidth){
        ctx.fillText(description,left,descriptionY);
        drawn=true;
        break;
      }
    }
    if(!drawn){
      ctx.font=weight(500,18.5);
      drawBalancedText(ctx,description,left,descriptionY,titleMaxWidth,29,2);
    }

    if(illustration){
      const x=958,y=61+shift,w=202,h=202;
      ctx.save(); roundedPath(ctx,x,y,w,h,12); ctx.clip(); drawImageCover(ctx,illustration,x,y,w,h); ctx.restore();
      strokeRound(ctx,x,y,w,h,12,theme.lineStrong,1);
    }
  };

  // License IDs such as Apache-2.0 contain periods, so they must be looked up
  // as literal object keys rather than as dotted translation paths.
  const baseRenderResultsWithLiteralLicenseIds=renderResults;
  renderResults=function(){
    baseRenderResultsWithLiteralLicenseIds();
    if(!el.softwareResult) return;
    const paragraph=el.softwareResult.querySelector('p');
    if(paragraph) paragraph.textContent=softwareNoteFor(currentUiLanguage(),state.softwareLicense);
  };

  const baseBottomNoteWithLiteralLicenseIds=bottomNote;
  bottomNote=function(){
    if(state.mode==='software' && !String(state.softwareNotes || '').trim()){
      return softwareNoteFor(currentPdfLanguage(),state.softwareLicense);
    }
    return baseBottomNoteWithLiteralLicenseIds();
  };

  function syncLanguageAria(){
    const uiSelect=document.querySelector('#uiLanguageSelect');
    const pdfSelect=document.querySelector('#pdfLanguageSelect');
    const autosave=document.querySelector('#autosaveToggle');
    if(uiSelect) uiSelect.setAttribute('aria-label',window.licenseT?.('ui.language') || 'Language');
    if(pdfSelect) pdfSelect.setAttribute('aria-label',window.licenseT?.('ui.pdfLanguage') || 'PDF language');
    if(autosave) autosave.setAttribute('aria-label',window.licenseT?.('ui.autosave') || 'Autosave');
  }

  function syncPublicPlaceholders(){
    const placeholders=UI_PLACEHOLDERS[currentUiLanguage()] || UI_PLACEHOLDERS.ja;
    const creator=document.querySelector('#creatorInput');
    const work=document.querySelector('#workNameInput');
    const credit=document.querySelector('#creditTextInput');
    const notes=document.querySelector('#notesInput');
    if(creator) creator.placeholder=placeholders.creator;
    if(work) work.placeholder=placeholders.work;
    if(credit) credit.placeholder=placeholders.credit;
    if(notes) notes.placeholder=placeholders.notes;
  }

  function syncLateUi(){
    syncLanguageAria();
    syncPublicPlaceholders();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    syncLateUi();
    document.querySelector('#uiLanguageSelect')?.addEventListener('change',syncLateUi);
    renderResults();
    queueRender();
  });
})();
