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

const baseCreditStripContent = creditStripContent;
creditStripContent = function(){
  if(state.mode === 'custom'){
    const headline = state.credit === 'required'
      ? 'クレジット表記が必要です'
      : state.credit === 'recommended'
        ? 'クレジット表記を推奨します'
        : 'クレジット表記は不要です';

    const enteredExample = String(state.creditText || '')
      .replace(/^\s*例[:：]\s*/, '')
      .trim();

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
