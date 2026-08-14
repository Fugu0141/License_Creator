'use strict';

(() => {
  let editor = null;
  let sourceImage = null;
  let sourceDataUrl = '';
  let originalFileName = '';
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginX = 0;
  let dragOriginY = 0;
  const OUTPUT_SIZE = 700;

  function installEditor(){
    if(document.querySelector('#imageEditorOverlay')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div id="imageEditorOverlay" class="image-editor-overlay" hidden>
        <section class="image-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="imageEditorTitle">
          <header class="image-editor-head">
            <div>
              <h2 id="imageEditorTitle">画像を調整</h2>
              <p>ドラッグして位置を調整し、PDFに表示する範囲を決めます。</p>
            </div>
            <button id="imageEditorClose" class="image-editor-close" type="button" aria-label="閉じる">×</button>
          </header>
          <div class="image-editor-body">
            <div id="imageEditorStage" class="image-editor-stage">
              <canvas id="imageEditorCanvas" class="image-editor-canvas" width="700" height="700"></canvas>
            </div>
            <div class="image-editor-hint"><span>↕</span><span>画像をドラッグして位置を調整</span></div>
            <div class="image-editor-controls">
              <div class="image-editor-control-head"><strong>ズーム</strong><span id="imageEditorZoomLabel">100%</span></div>
              <input id="imageEditorZoom" class="image-editor-zoom" type="range" min="100" max="300" value="100" step="1">
              <div class="image-editor-tools"><button id="imageEditorReset" class="image-editor-reset" type="button">位置とズームをリセット</button></div>
            </div>
          </div>
          <footer class="image-editor-foot">
            <button id="imageEditorCancel" class="image-editor-button image-editor-cancel" type="button">キャンセル</button>
            <button id="imageEditorApply" class="image-editor-button image-editor-apply" type="button">この範囲で決定</button>
          </footer>
        </section>
      </div>
    `);

    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='image-editor.css?v=20260815-0730';
    link.dataset.imageEditor='true';
    document.head.appendChild(link);

    editor={
      overlay:document.querySelector('#imageEditorOverlay'),
      stage:document.querySelector('#imageEditorStage'),
      canvas:document.querySelector('#imageEditorCanvas'),
      zoomInput:document.querySelector('#imageEditorZoom'),
      zoomLabel:document.querySelector('#imageEditorZoomLabel'),
      reset:document.querySelector('#imageEditorReset'),
      apply:document.querySelector('#imageEditorApply'),
      cancel:document.querySelector('#imageEditorCancel'),
      close:document.querySelector('#imageEditorClose')
    };

    editor.zoomInput.addEventListener('input',()=>{
      zoom=Number(editor.zoomInput.value)/100;
      clampOffsets();
      drawEditor();
    });

    editor.reset.addEventListener('click',()=>{
      zoom=1; offsetX=0; offsetY=0;
      editor.zoomInput.value='100';
      drawEditor();
    });
    editor.cancel.addEventListener('click',closeEditor);
    editor.close.addEventListener('click',closeEditor);
    editor.apply.addEventListener('click',applyCrop);
    editor.overlay.addEventListener('mousedown',e=>{ if(e.target===editor.overlay) closeEditor(); });

    editor.stage.addEventListener('pointerdown',beginDrag);
    editor.stage.addEventListener('pointermove',moveDrag);
    editor.stage.addEventListener('pointerup',endDrag);
    editor.stage.addEventListener('pointercancel',endDrag);
    editor.stage.addEventListener('wheel',e=>{
      e.preventDefault();
      zoom=Math.min(3,Math.max(1,zoom+(e.deltaY<0?.06:-.06)));
      editor.zoomInput.value=String(Math.round(zoom*100));
      clampOffsets();
      drawEditor();
    },{passive:false});

    document.addEventListener('keydown',e=>{
      if(editor.overlay.hidden) return;
      if(e.key==='Escape') closeEditor();
      if((e.ctrlKey||e.metaKey) && e.key==='Enter') applyCrop();
    });

    installReeditButton();
  }

  function installReeditButton(){
    const actions=document.querySelector('.image-actions');
    if(!actions || document.querySelector('#reeditImageButton')) return;
    const button=document.createElement('button');
    button.type='button';
    button.id='reeditImageButton';
    button.className='image-reedit-button';
    button.textContent='位置を再調整';
    button.hidden=!state.customImage;
    const reset=document.querySelector('#resetImageButton');
    if(reset) actions.insertBefore(button,reset);
    else actions.appendChild(button);
    button.addEventListener('click',async()=>{
      if(!state.customImage) return;
      try{
        await openFromDataUrl(state.customImage, el.imageLabel?.textContent || '現在の画像');
      }catch(err){ setStatus('画像編集を開始できませんでした。',true); }
    });
  }

  function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result));
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });
  }

  async function openFromFile(file){
    const dataUrl=await fileToDataUrl(file);
    originalFileName=file.name;
    await openFromDataUrl(dataUrl,file.name);
  }

  async function openFromDataUrl(dataUrl,name='画像'){
    sourceDataUrl=dataUrl;
    originalFileName=name;
    sourceImage=await loadImage(dataUrl);
    zoom=1; offsetX=0; offsetY=0;
    editor.zoomInput.value='100';
    editor.overlay.hidden=false;
    document.documentElement.style.overflow='hidden';
    drawEditor();
    requestAnimationFrame(()=>editor.stage.focus?.());
  }

  function baseScale(){
    if(!sourceImage) return 1;
    return Math.max(OUTPUT_SIZE/sourceImage.naturalWidth,OUTPUT_SIZE/sourceImage.naturalHeight);
  }

  function drawMetrics(){
    const scale=baseScale()*zoom;
    const width=sourceImage.naturalWidth*scale;
    const height=sourceImage.naturalHeight*scale;
    return {scale,width,height};
  }

  function clampOffsets(){
    if(!sourceImage) return;
    const {width,height}=drawMetrics();
    const maxX=Math.max(0,(width-OUTPUT_SIZE)/2);
    const maxY=Math.max(0,(height-OUTPUT_SIZE)/2);
    offsetX=Math.max(-maxX,Math.min(maxX,offsetX));
    offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
  }

  function drawEditor(){
    if(!sourceImage) return;
    clampOffsets();
    const ctx=editor.canvas.getContext('2d');
    ctx.clearRect(0,0,OUTPUT_SIZE,OUTPUT_SIZE);
    ctx.fillStyle='#eef1f4';
    ctx.fillRect(0,0,OUTPUT_SIZE,OUTPUT_SIZE);
    const {width,height}=drawMetrics();
    const x=(OUTPUT_SIZE-width)/2+offsetX;
    const y=(OUTPUT_SIZE-height)/2+offsetY;
    ctx.drawImage(sourceImage,x,y,width,height);

    // very subtle guide grid, similar to common media crop tools
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.28)';
    ctx.lineWidth=1;
    for(const n of [1/3,2/3]){
      const p=OUTPUT_SIZE*n;
      ctx.beginPath(); ctx.moveTo(p,0); ctx.lineTo(p,OUTPUT_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,p); ctx.lineTo(OUTPUT_SIZE,p); ctx.stroke();
    }
    ctx.restore();
    editor.zoomLabel.textContent=`${Math.round(zoom*100)}%`;
  }

  function beginDrag(e){
    if(!sourceImage) return;
    dragging=true;
    editor.stage.classList.add('is-dragging');
    editor.stage.setPointerCapture?.(e.pointerId);
    dragStartX=e.clientX; dragStartY=e.clientY;
    dragOriginX=offsetX; dragOriginY=offsetY;
  }

  function moveDrag(e){
    if(!dragging || !sourceImage) return;
    const rect=editor.stage.getBoundingClientRect();
    const ratio=OUTPUT_SIZE/rect.width;
    offsetX=dragOriginX+(e.clientX-dragStartX)*ratio;
    offsetY=dragOriginY+(e.clientY-dragStartY)*ratio;
    drawEditor();
  }

  function endDrag(e){
    if(!dragging) return;
    dragging=false;
    editor.stage.classList.remove('is-dragging');
    try{editor.stage.releasePointerCapture?.(e.pointerId);}catch{}
  }

  async function applyCrop(){
    if(!sourceImage) return;
    editor.apply.disabled=true;
    try{
      const output=document.createElement('canvas');
      output.width=OUTPUT_SIZE; output.height=OUTPUT_SIZE;
      const ctx=output.getContext('2d');
      ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,OUTPUT_SIZE,OUTPUT_SIZE);
      const {width,height}=drawMetrics();
      const x=(OUTPUT_SIZE-width)/2+offsetX;
      const y=(OUTPUT_SIZE-height)/2+offsetY;
      ctx.drawImage(sourceImage,x,y,width,height);
      state.customImage=output.toDataURL('image/jpeg',.92);
      if(el.imageLabel) el.imageLabel.textContent=originalFileName || '調整済み画像';
      illustration=await loadImage(state.customImage);
      const reedit=document.querySelector('#reeditImageButton');
      if(reedit) reedit.hidden=false;
      changed();
      closeEditor(false);
    }catch(err){
      console.error(err);
      setStatus('画像の調整を保存できませんでした。',true);
    }finally{
      editor.apply.disabled=false;
    }
  }

  function closeEditor(clearInput=true){
    if(!editor) return;
    editor.overlay.hidden=true;
    document.documentElement.style.overflow='';
    dragging=false;
    editor.stage.classList.remove('is-dragging');
    if(clearInput && el.imageInput) el.imageInput.value='';
  }

  function interceptImageInput(){
    if(!el.imageInput || el.imageInput.dataset.cropEditorBound) return;
    el.imageInput.dataset.cropEditorBound='true';

    // Capture phase fires before app.js' existing change listener. Clearing the
    // input after copying the File prevents the old immediate-resize handler from
    // committing the image before the user approves the crop.
    el.imageInput.addEventListener('change',async e=>{
      const file=e.target.files?.[0];
      if(!file) return;
      try{
        e.stopImmediatePropagation();
        await openFromFile(file);
      }catch(err){
        console.error(err);
        setStatus('画像を読み込めませんでした。',true);
        e.target.value='';
      }
    },true);
  }

  function enhanceReset(){
    if(!el.resetImage || el.resetImage.dataset.cropEditorEnhanced) return;
    el.resetImage.dataset.cropEditorEnhanced='true';
    el.resetImage.addEventListener('click',()=>{
      const reedit=document.querySelector('#reeditImageButton');
      if(reedit) reedit.hidden=true;
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    installEditor();
    interceptImageInput();
    enhanceReset();
  });
})();
