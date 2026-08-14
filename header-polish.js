'use strict';

// Final header typography pass: use the space up to the artwork and prefer
// one clean line. If two lines are necessary, balance them instead of leaving
// a tiny orphan fragment on the second line.
drawHeader = function(ctx,theme){
  const left=78;

  ctx.fillStyle=theme.muted;
  ctx.font=weight(700,15);
  ctx.letterSpacing='1px';
  ctx.fillText('LICENSE / TERMS OF USE',left,78);
  ctx.letterSpacing='0px';

  ctx.fillStyle=theme.ink;
  ctx.font=weight(800,53);
  ctx.fillText(state.title || '作品利用ガイド',left,151);

  const description=`「${state.workName || 'この作品'}」を使うときのルールを、ひと目で確認できるようにまとめています。`;
  ctx.fillStyle=theme.muted;

  let drawn=false;
  for(let size=20;size>=16.5;size-=.5){
    ctx.font=weight(500,size);
    if(ctx.measureText(description).width<=810){
      ctx.fillText(description,left,207);
      drawn=true;
      break;
    }
  }
  if(!drawn){
    ctx.font=weight(500,18.5);
    drawBalancedText(ctx,description,left,207,810,29,2);
  }

  if(illustration){
    const x=958,y=61,w=202,h=202;
    ctx.save();
    roundedPath(ctx,x,y,w,h,12);
    ctx.clip();
    drawImageCover(ctx,illustration,x,y,w,h);
    ctx.restore();
    strokeRound(ctx,x,y,w,h,12,theme.lineStrong,1);
  }
};
