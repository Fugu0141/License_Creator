'use strict';

// Give the A4 page a more deliberate top margin without redesigning the layout.
// The footer remains anchored, while the main content block moves down slightly
// to use some of the otherwise generous lower-page whitespace.
const PDF_CONTENT_SHIFT_Y = 36;

const baseBalancedHeader = drawHeader;
drawHeader = function(ctx, theme){
  ctx.save();
  ctx.translate(0, PDF_CONTENT_SHIFT_Y);
  baseBalancedHeader(ctx, theme);
  ctx.restore();
};

const baseBalancedMeta = drawMeta;
drawMeta = function(ctx, theme){
  ctx.save();
  ctx.translate(0, PDF_CONTENT_SHIFT_Y);
  baseBalancedMeta(ctx, theme);
  ctx.restore();
};

const baseBalancedStatusPanels = drawStatusPanels;
drawStatusPanels = function(ctx, theme){
  ctx.save();
  ctx.translate(0, PDF_CONTENT_SHIFT_Y);
  const layout = baseBalancedStatusPanels(ctx, theme);
  ctx.restore();

  // Downstream license / credit / note blocks are positioned from the returned
  // status-panel bottom, so move those coordinates by the same amount.
  if(layout && typeof layout === 'object'){
    return {
      ...layout,
      y: Number.isFinite(layout.y) ? layout.y + PDF_CONTENT_SHIFT_Y : layout.y,
      bottom: Number.isFinite(layout.bottom) ? layout.bottom + PDF_CONTENT_SHIFT_Y : layout.bottom
    };
  }
  return layout;
};
