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

  document.addEventListener('DOMContentLoaded',()=>{
    syncLanguageAria();
    document.querySelector('#uiLanguageSelect')?.addEventListener('change',syncLanguageAria);
    renderResults();
    queueRender();
  });
})();
