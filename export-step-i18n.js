'use strict';

(() => {
  const COPY={
    ja:{title:'書き出し',subtitle:'PDFの言語を選んで保存します',about:'このツールについて'},
    en:{title:'Export',subtitle:'Choose the PDF language and save your file',about:'About this tool'},
    'zh-CN':{title:'导出',subtitle:'选择 PDF 语言并保存文件',about:'关于本工具'},
    ko:{title:'내보내기',subtitle:'PDF 언어를 선택하고 파일을 저장합니다',about:'이 도구에 대해'}
  };
  const SUPPORTED=['ja','en','zh-CN','ko'];

  function language(){
    return SUPPORTED.includes(state?.uiLanguage) ? state.uiLanguage : 'ja';
  }

  function applyRequestedLanguage(){
    const requested=new URLSearchParams(location.search).get('lang');
    if(!SUPPORTED.includes(requested)) return;
    const select=document.querySelector('#uiLanguageSelect');
    if(!select || select.value===requested) return;
    select.value=requested;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function syncExportStepCopy(){
    const copy=COPY[language()] || COPY.ja;
    const title=document.querySelector('#exportCardTitle');
    const subtitle=document.querySelector('#exportCardSubtitle');
    if(title) title.textContent=copy.title;
    if(subtitle) subtitle.textContent=copy.subtitle;
  }

  function installAboutLink(){
    const actions=document.querySelector('.topbar-actions');
    if(!actions || document.querySelector('#aboutToolLink')) return;

    if(!document.querySelector('#aboutToolLinkStyles')){
      const style=document.createElement('style');
      style.id='aboutToolLinkStyles';
      style.textContent=`
        .about-tool-link{display:inline-flex;align-items:center;gap:6px;color:#59636e;text-decoration:none;font-size:.72rem;font-weight:680;white-space:nowrap;padding:7px 9px;border:1px solid transparent;border-radius:7px;transition:background .15s ease,border-color .15s ease,color .15s ease}
        .about-tool-link:hover{background:#f6f8fa;border-color:#d8dee4;color:#24292f}
        .about-tool-link:focus-visible{outline:3px solid rgba(91,127,183,.18);outline-offset:2px}
        .about-tool-link-icon{font-size:.9rem;line-height:1;color:#7a8795}
        @media(max-width:720px){.about-tool-link-label{display:none}.about-tool-link{padding:7px}}
      `;
      document.head.appendChild(style);
    }

    const link=document.createElement('a');
    link.id='aboutToolLink';
    link.className='about-tool-link';
    link.innerHTML='<span class="about-tool-link-icon" aria-hidden="true">ⓘ</span><span class="about-tool-link-label"></span>';
    actions.insertBefore(link,actions.firstChild);
  }

  function syncAboutLink(){
    installAboutLink();
    const lang=language();
    const copy=COPY[lang] || COPY.ja;
    const link=document.querySelector('#aboutToolLink');
    if(!link) return;
    link.href=`about.html?lang=${encodeURIComponent(lang)}`;
    link.setAttribute('aria-label',copy.about);
    const label=link.querySelector('.about-tool-link-label');
    if(label) label.textContent=copy.about;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    applyRequestedLanguage();
    syncExportStepCopy();
    syncAboutLink();
    document.querySelector('#uiLanguageSelect')?.addEventListener('change',()=>{
      syncExportStepCopy();
      syncAboutLink();
    });
  });
})();
