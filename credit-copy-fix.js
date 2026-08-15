'use strict';

// Keep the credit strip explicit in custom-license mode. The previous copy
// inherited a shortened sentence, which could leave the reader seeing only
// 「表記が必要です」 or 「表記を推奨します」 without saying what kind of
// attribution was being discussed.

function automaticCreditExample(){
  const date=String(state.updatedAt || '');
  const year=(date.match(/^\d{4}/)?.[0]) || String(new Date().getFullYear());
  const creator=String(state.creator || '').trim() || '作者名';
  const work=String(state.workName || '').trim() || '作品名';
  return `© ${year} ${creator} / ${work}`;
}

function normalizeCreditExample(value){
  return String(value || '')
    .replace(/^\s*例[:：]\s*/, '')
    .trim();
}

function ccCreditExamplePlaceholder(){
  const license=String(state.ccLicense || 'CC BY 4.0');
  return `例: 「作品名」by 作者名 / ${license} / 配布元URL`;
}

function syncCcCreditExampleEditor(){
  const input=document.querySelector('#ccCreditTextInput');
  if(!input) return;
  input.value=String(state.ccCreditText || '');
  input.placeholder=ccCreditExamplePlaceholder();
}

function installCcCreditExampleEditor(){
  const section=document.querySelector('#ccSection');
  const result=document.querySelector('#ccResultCard');
  if(!section || !result || document.querySelector('#ccCreditExampleBlock')) return;

  result.insertAdjacentHTML('afterend', `
    <div class="mini-block" id="ccCreditExampleBlock">
      <span class="mini-title">クレジット</span>
      <label class="field">
        <span>表記例</span>
        <input id="ccCreditTextInput" type="text">
      </label>
    </div>
  `);

  if(typeof state.ccCreditText !== 'string') state.ccCreditText='';
  const input=document.querySelector('#ccCreditTextInput');
  input.addEventListener('input',()=>{
    state.ccCreditText=input.value;
    changed();
  });
  syncCcCreditExampleEditor();
}

const baseCreditStripContent = creditStripContent;
creditStripContent = function(){
  if(state.mode === 'custom'){
    const headline = state.credit === 'required'
      ? 'クレジット表記が必要です'
      : state.credit === 'recommended'
        ? 'クレジット表記を推奨します'
        : 'クレジット表記は不要です';

    const enteredExample = normalizeCreditExample(state.creditText);

    // An empty input means "use an automatic example", not "hide the example".
    // This keeps public defaults neutral while still showing users what a
    // practical attribution can look like. If creator/work are known, reuse
    // them; otherwise use generic placeholders.
    const example = enteredExample || automaticCreditExample();

    return {
      headline,
      detail: state.credit === 'none' ? '' : `例: ${example}`
    };
  }

  if(state.mode === 'cc'){
    const base=baseCreditStripContent();
    const enteredExample=normalizeCreditExample(state.ccCreditText);
    return {
      headline:base.headline,
      detail:enteredExample ? `例: ${enteredExample}` : ''
    };
  }

  return baseCreditStripContent();
};

const baseCreditStripStatusLabel = creditStripStatusLabel;
creditStripStatusLabel = function(){
  if(state.mode === 'custom'){
    if(state.credit === 'required') return 'REQUIRED';
    if(state.credit === 'recommended') return 'RECOMMENDED';
    return 'NOT REQUIRED';
  }
  return baseCreditStripStatusLabel();
};

// Keep the CC example placeholder in sync when the selected license changes.
const baseRenderResultsWithCcCreditExample=renderResults;
renderResults=function(){
  baseRenderResultsWithCcCreditExample();
  syncCcCreditExampleEditor();
};

document.addEventListener('DOMContentLoaded',()=>{
  if(typeof state.ccCreditText !== 'string') state.ccCreditText='';
  installCcCreditExampleEditor();

  // CC0 normally hides the credit strip because attribution is not required.
  // If the author explicitly enters an optional example, show the strip so the
  // input is never silently discarded from the generated PDF.
  if(typeof shouldShowCreditStrip === 'function'){
    const baseShouldShowCreditStrip=shouldShowCreditStrip;
    shouldShowCreditStrip=function(){
      if(state.mode === 'cc' && normalizeCreditExample(state.ccCreditText)) return true;
      return baseShouldShowCreditStrip();
    };
  }

  renderResults();
  queueRender();
});
