'use strict';

// Keep the credit strip explicit in custom-license mode. The previous copy
// inherited a shortened sentence, which could leave the reader seeing only
// 「表記が必要です」 or 「表記を推奨します」 without saying what kind of
// attribution was being discussed.
const baseCreditStripContent = creditStripContent;
creditStripContent = function(){
  if(state.mode === 'custom'){
    const headline = state.credit === 'required'
      ? 'クレジット表記が必要です'
      : state.credit === 'recommended'
        ? 'クレジット表記を推奨します'
        : 'クレジット表記は不要です';

    const rawExample = String(state.creditText || '')
      .replace(/^\s*例[:：]\s*/, '')
      .trim();

    return {
      headline,
      detail: rawExample ? `例: ${rawExample}` : ''
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
