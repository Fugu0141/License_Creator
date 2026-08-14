'use strict';

// Match the content-sized behavior used by CC / OSS in custom mode as well.
// All three columns always share the same height. The current 620px height is
// treated as a hard maximum, so auto-sizing can only keep or reduce it.
const baseDrawStatusPanelsWithCustomAuto = drawStatusPanels;

drawStatusPanels = function(ctx, theme){
  if(state.mode !== 'custom'){
    return baseDrawStatusPanelsWithCustomAuto(ctx, theme);
  }

  const groups = getGroups();
  const y = 468;
  const w = 349;
  const gap = 18;

  // The tallest column determines the common height for all three panels.
  // 126px covers the heading area, 66px is the normal row height, and the
  // final 28px provides comfortable bottom breathing room.
  const maxItems = Math.max(
    1,
    groups.allow.length,
    groups.ask.length,
    groups.deny.length
  );

  const calculatedHeight = 126 + maxItems * 66 + 28;
  const h = Math.max(270, Math.min(620, calculatedHeight));

  ['allow', 'ask', 'deny'].forEach((key, i) => {
    drawPanel(ctx, 78 + i * (w + gap), y, w, h, key, groups[key], theme);
  });

  return { y, height: h, bottom: y + h };
};
