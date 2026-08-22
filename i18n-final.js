'use strict';

(() => {
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
