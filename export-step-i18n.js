'use strict';

(() => {
  const COPY={
    ja:{title:'書き出し',subtitle:'PDFの言語を選んで保存します'},
    en:{title:'Export',subtitle:'Choose the PDF language and save your file'},
    'zh-CN':{title:'导出',subtitle:'选择 PDF 语言并保存文件'},
    ko:{title:'내보내기',subtitle:'PDF 언어를 선택하고 파일을 저장합니다'}
  };

  function language(){
    return ['ja','en','zh-CN','ko'].includes(state?.uiLanguage) ? state.uiLanguage : 'ja';
  }

  function syncExportStepCopy(){
    const copy=COPY[language()] || COPY.ja;
    const title=document.querySelector('#exportCardTitle');
    const subtitle=document.querySelector('#exportCardSubtitle');
    if(title) title.textContent=copy.title;
    if(subtitle) subtitle.textContent=copy.subtitle;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    syncExportStepCopy();
    document.querySelector('#uiLanguageSelect')?.addEventListener('change',syncExportStepCopy);
  });
})();
