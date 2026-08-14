'use strict';

function titleBreakCandidates(text){
  const value=String(text||'');
  const candidates=new Map();

  // Prefer linguistically meaningful boundaries first.
  try{
    if(typeof Intl!=='undefined' && Intl.Segmenter){
      const segs=Array.from(new Intl.Segmenter('ja',{granularity:'word'}).segment(value));
      let pos=0;
      segs.forEach(seg=>{
        pos+=seg.segment.length;
        if(pos>0 && pos<value.length) candidates.set(pos,0);
      });
    }
  }catch(err){ /* character fallback below */ }

  // Whitespace / punctuation boundaries are also natural places to wrap.
  for(let i=1;i<value.length;i++){
    const prev=value[i-1], next=value[i];
    if(/\s/.test(prev) || /[・／/｜|:：―—–-]/.test(prev)){
      candidates.set(i,Math.min(candidates.get(i)??Infinity,0));
    }else if(/[、。，．,.!?！？]/.test(prev)){
      candidates.set(i,Math.min(candidates.get(i)??Infinity,4));
    }
  }

  // Last resort: any grapheme-ish character boundary. This prevents long
  // Japanese strings from ever running underneath the artwork or off-page.
  for(let i=1;i<value.length;i++){
    if(!candidates.has(i)) candidates.set(i,18);
  }

  return [...candidates.entries()].map(([index,penalty])=>({index,penalty}));
}

function bestTwoLineTitle(ctx,text,maxWidth){
  const value=String(text||'').trim();
  if(!value) return null;

  const badStart=/^[、。，．,.!！?？:：;；)）\]】」』]/;
  const badEnd=/[（(\[【「『]$/;
  let best=null;

  for(const c of titleBreakCandidates(value)){
    const left=value.slice(0,c.index).trim();
    const right=value.slice(c.index).trim();
    if(!left || !right || badStart.test(right) || badEnd.test(left)) continue;

    const lw=ctx.measureText(left).width;
    const rw=ctx.measureText(right).width;
    if(lw>maxWidth || rw>maxWidth) continue;

    const shorter=Math.min(lw,rw);
    const orphanPenalty=shorter<maxWidth*.28 ? maxWidth*.8 : 0;
    const score=Math.abs(lw-rw)+orphanPenalty+c.penalty;
    if(!best || score<best.score) best={score,lines:[left,right]};
  }

  return best?.lines || null;
}

function fitHeaderTitle(ctx,text,maxWidth){
  const value=String(text||'作品利用ガイド').trim() || '作品利用ガイド';

  // Keep the established 53px title whenever possible; only shrink when the
  // actual content demands it.
  for(let size=53;size>=37;size-=1){
    ctx.font=weight(800,size);
    if(ctx.measureText(value).width<=maxWidth){
      return {size,lines:[value],lineHeight:Math.round(size*1.08)};
    }
  }

  // If one line would become too small, use two balanced lines instead.
  for(let size=44;size>=29;size-=1){
    ctx.font=weight(800,size);
    const lines=bestTwoLineTitle(ctx,value,maxWidth);
    if(lines){
      return {size,lines,lineHeight:Math.round(size*1.12)};
    }
  }

  // Extremely long edge case: keep two lines and reduce further until both fit.
  for(let size=28;size>=20;size-=1){
    ctx.font=weight(800,size);
    const lines=bestTwoLineTitle(ctx,value,maxWidth);
    if(lines){
      return {size,lines,lineHeight:Math.round(size*1.14)};
    }
  }

  // Absolute fallback: two roughly balanced halves. The very small font is only
  // reachable with unusually long titles, but still guarantees no overflow.
  ctx.font=weight(800,20);
  const chars=Array.from(value);
  const mid=Math.ceil(chars.length/2);
  return {size:20,lines:[chars.slice(0,mid).join(''),chars.slice(mid).join('')],lineHeight:23};
}

// Final header typography pass. Long titles avoid the artwork and page edge,
// while the description automatically follows the title block.
drawHeader = function(ctx,theme){
  const left=78;
  const titleMaxWidth=810;

  ctx.fillStyle=theme.muted;
  ctx.font=weight(700,15);
  ctx.letterSpacing='1px';
  ctx.fillText('LICENSE / TERMS OF USE',left,78);
  ctx.letterSpacing='0px';

  const title=fitHeaderTitle(ctx,state.title || '作品利用ガイド',titleMaxWidth);
  const titleTop=116;
  ctx.fillStyle=theme.ink;
  ctx.font=weight(800,title.size);
  ctx.textBaseline='top';
  title.lines.forEach((line,i)=>{
    ctx.fillText(line,left,titleTop+i*title.lineHeight);
  });
  ctx.textBaseline='alphabetic';

  const titleBottom=titleTop+title.lines.length*title.lineHeight;
  const descriptionY=Math.max(207,titleBottom+23);
  const description=`「${state.workName || 'この作品'}」を使うときのルールを、ひと目で確認できるようにまとめています。`;
  ctx.fillStyle=theme.muted;

  let drawn=false;
  for(let size=20;size>=16.5;size-=.5){
    ctx.font=weight(500,size);
    if(ctx.measureText(description).width<=titleMaxWidth){
      ctx.fillText(description,left,descriptionY);
      drawn=true;
      break;
    }
  }
  if(!drawn){
    ctx.font=weight(500,18.5);
    drawBalancedText(ctx,description,left,descriptionY,titleMaxWidth,29,2);
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
