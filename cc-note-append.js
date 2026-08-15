'use strict';

function installCcNotesEditor(){
  const section=document.querySelector('#ccSection');
  if(!section || document.querySelector('#ccNotesInput')) return;

  section.insertAdjacentHTML('beforeend', `
    <details class="details-box" id="ccNotesDetails">
      <summary>補足・メモ</summary>
      <div class="details-body">
        <label class="field">
          <span>PDFのNOTEに追記する文章（任意）</span>
          <textarea id="ccNotesInput" rows="4" placeholder="ここに入力した内容は、CCライセンスの固定案内文の次の行から表示されます"></textarea>
        </label>
        <small style="color:#667085;line-height:1.55;">「Creative Commons ○○ の条件に従って利用してください。」は固定で残り、その下にこの内容を追記します。</small>
      </div>
    </details>
  `);

  if(typeof state.ccNotes !== 'string') state.ccNotes='';
  const input=document.querySelector('#ccNotesInput');
  input.value=state.ccNotes;
  input.addEventListener('input',()=>{
    state.ccNotes=input.value;
    changed();
  });
}

function drawCcAppendedNote(ctx,theme,y){
  const custom=String(state.ccNotes || '').trim();
  if(state.mode!=='cc' || !custom) return;

  const x=78,w=1084;
  const hasContact=Boolean(String(state.contact || '').trim());
  const noteWidth=hasContact ? 760 : w;
  const px=x+20;
  const maxWidth=noteWidth-42;
  const startY=y+139;
  const lineHeight=22;
  let drawn=0;
  const maxLines=5;

  ctx.fillStyle=theme.muted;
  ctx.font=weight(500,14);

  for(const paragraph of custom.split(/\r?\n/)){
    if(drawn>=maxLines) break;
    const text=paragraph.trim();
    if(!text){
      drawn+=1;
      continue;
    }

    let line='';
    for(const ch of text){
      const test=line+ch;
      if(ctx.measureText(test).width>maxWidth && line){
        ctx.fillText(line,px,startY+drawn*lineHeight);
        drawn+=1;
        if(drawn>=maxLines) break;
        line=ch;
      }else{
        line=test;
      }
    }
    if(drawn>=maxLines) break;
    if(line){
      ctx.fillText(line,px,startY+drawn*lineHeight);
      drawn+=1;
    }
  }
}

const baseDrawBottomWithCcAppend=drawBottom;
drawBottom=function(ctx,theme,y=1268,footerY=1608){
  baseDrawBottomWithCcAppend(ctx,theme,y,footerY);
  drawCcAppendedNote(ctx,theme,y);
};

document.addEventListener('DOMContentLoaded',()=>{
  if(typeof state.ccNotes !== 'string') state.ccNotes='';
  installCcNotesEditor();
  queueRender();
});
