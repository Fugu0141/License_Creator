'use strict';

// Keep segmented controls visually in sync with the underlying state.
// The original common update path did not call syncSegment(), so the state
// changed correctly while the selected button styling could stay stale.
const baseChangedWithUiSync = changed;
changed = function(){
  baseChangedWithUiSync();
  syncSegment();
};

document.addEventListener('DOMContentLoaded', () => {
  syncSegment();
});
