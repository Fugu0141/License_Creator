'use strict';

(() => {
  const COPY={
    ja:{brand:'Visual license PDF builder',back:'ツールに戻る',eyebrow:'ABOUT LICENSE CREATOR',title:'このツールについて',description:'License Creatorは、作品の利用条件を「許可・条件・禁止」に整理し、見やすい1ページPDFとして書き出すためのWebツールです。',repoTitle:'リポジトリ',repoDescription:'ソースコードはGitHubで公開しています。MIT Licenseのもと、著作権表示と許諾文を残すことで、利用・改変・再配布などができます。',repoNote:'このMIT LicenseはLicense Creator本体のソースコードに適用され、作成したPDFの利用条件を決めるものではありません。',authorTitle:'作者',authorDescription:'License Creatorの開発者、Fugu0141のGitHubプロフィールです。ほかの公開プロジェクトも確認できます。',supportTitle:'開発を支援する',supportDescription:'License CreatorやほかのOSS開発を応援していただける場合は、GitHub Sponsorsから支援できます。',noticeTitle:'利用時の注意',noticeText:'License Creatorは利用条件を分かりやすく整理するための作成補助ツールです。カスタム規約は法的助言ではありません。Creative CommonsやOSSの標準ライセンスでは、生成PDFより公式のライセンス本文が優先されます。'},
    en:{brand:'Visual license PDF builder',back:'Back to the tool',eyebrow:'ABOUT LICENSE CREATOR',title:'About this tool',description:'License Creator is a web tool for organizing usage rules into allowed, conditional, and not allowed categories, then exporting them as a clear one-page PDF.',repoTitle:'Repository',repoDescription:'The source code is available on GitHub under the MIT License. You may use, modify, and redistribute it as long as the copyright notice and permission notice are retained.',repoNote:'The MIT License applies to the License Creator source code itself. It does not determine the usage terms of PDFs you create with the tool.',authorTitle:'Author',authorDescription:'This is the GitHub profile of Fugu0141, the developer of License Creator. You can also find other public projects there.',supportTitle:'Support development',supportDescription:'If you would like to support License Creator and other open-source development, you can do so through GitHub Sponsors.',noticeTitle:'Important note',noticeText:'License Creator is a helper for presenting usage conditions clearly. Custom terms are not legal advice. For Creative Commons and standard open-source licenses, the official license text takes precedence over the generated PDF.'},
    'zh-CN':{brand:'可视化许可证 PDF 生成器',back:'返回工具',eyebrow:'关于 LICENSE CREATOR',title:'关于本工具',description:'License Creator 是一个 Web 工具，可将作品使用规则整理为“允许、条件、禁止”，并导出为清晰的一页 PDF。',repoTitle:'代码仓库',repoDescription:'源代码发布在 GitHub，并采用 MIT License。保留版权声明与许可声明后，可以使用、修改和再发布代码。',repoNote:'MIT License 仅适用于 License Creator 本身的源代码，不会决定你使用本工具生成的 PDF 中的使用条款。',authorTitle:'作者',authorDescription:'这里是 License Creator 开发者 Fugu0141 的 GitHub 个人主页，也可以查看其他公开项目。',supportTitle:'支持开发',supportDescription:'如果你愿意支持 License Creator 以及其他开源项目的开发，可以通过 GitHub Sponsors 提供赞助。',noticeTitle:'使用说明',noticeText:'License Creator 是用于清晰整理使用条件的辅助工具。自定义条款不构成法律建议。对于 Creative Commons 与标准开源许可证，应以官方许可证文本为准。'},
    ko:{brand:'시각형 라이선스 PDF 빌더',back:'도구로 돌아가기',eyebrow:'ABOUT LICENSE CREATOR',title:'이 도구에 대해',description:'License Creator는 작품 이용 규칙을 허용, 조건, 금지로 정리하고 보기 쉬운 1페이지 PDF로 내보내는 웹 도구입니다.',repoTitle:'리포지토리',repoDescription:'소스 코드는 GitHub에 공개되어 있으며 MIT License를 따릅니다. 저작권 표시와 허가 문구를 유지하면 이용, 수정, 재배포할 수 있습니다.',repoNote:'MIT License는 License Creator 자체의 소스 코드에 적용됩니다. 이 도구로 만든 PDF의 이용 조건을 정하는 라이선스는 아닙니다.',authorTitle:'제작자',authorDescription:'License Creator 개발자 Fugu0141의 GitHub 프로필입니다. 다른 공개 프로젝트도 확인할 수 있습니다.',supportTitle:'개발 후원',supportDescription:'License Creator와 다른 오픈소스 개발을 응원하고 싶다면 GitHub Sponsors를 통해 후원할 수 있습니다.',noticeTitle:'이용 시 참고',noticeText:'License Creator는 이용 조건을 이해하기 쉽게 정리하는 보조 도구입니다. 사용자 지정 약관은 법률 자문이 아닙니다. Creative Commons와 표준 오픈소스 라이선스는 생성된 PDF보다 공식 라이선스 원문이 우선합니다.'}
  };

  const ids=['brandSubtitle','backText','heroEyebrow','heroTitle','heroDescription','repoTitle','repoDescription','repoNote','authorTitle','authorDescription','supportTitle','supportDescription','noticeTitle','noticeText'];
  const keyById={brandSubtitle:'brand',backText:'back',heroEyebrow:'eyebrow',heroTitle:'title',heroDescription:'description',repoTitle:'repoTitle',repoDescription:'repoDescription',repoNote:'repoNote',authorTitle:'authorTitle',authorDescription:'authorDescription',supportTitle:'supportTitle',supportDescription:'supportDescription',noticeTitle:'noticeTitle',noticeText:'noticeText'};

  function supported(value){ return ['ja','en','zh-CN','ko'].includes(value) ? value : 'ja'; }

  function initialLanguage(){
    const params=new URLSearchParams(location.search);
    const requested=params.get('lang');
    if(requested) return supported(requested);
    const browser=String(navigator.language || 'ja').toLowerCase();
    if(browser.startsWith('zh')) return 'zh-CN';
    if(browser.startsWith('ko')) return 'ko';
    if(browser.startsWith('en')) return 'en';
    return 'ja';
  }

  function applyLanguage(lang){
    const resolved=supported(lang);
    const copy=COPY[resolved];
    document.documentElement.lang=resolved;
    document.querySelector('#aboutLanguageSelect').value=resolved;
    ids.forEach(id=>{
      const node=document.querySelector(`#${id}`);
      if(node) node.textContent=copy[keyById[id]];
    });
    const destination=`./?lang=${encodeURIComponent(resolved)}`;
    document.querySelector('#backLink').href=destination;
    document.querySelector('#backToTool').href=destination;
    const url=new URL(location.href);
    url.searchParams.set('lang',resolved);
    history.replaceState(null,'',url);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const select=document.querySelector('#aboutLanguageSelect');
    applyLanguage(initialLanguage());
    select.addEventListener('change',()=>applyLanguage(select.value));
  });
})();
