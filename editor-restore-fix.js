'use strict';

// Some feature layers are loaded after app.js. The PDF canvas reads directly
// from `state`, so saved data can be correct even when a later UI pass leaves
// form controls visually empty. Rehydrate the editor once every deferred
// script has finished installing itself.
function restoreEditorFromState(){
  if(typeof syncControls !== 'function' || !state) return;

  syncControls();

  // Fields added by optional feature layers are not all handled by the base
  // syncControls(), so restore them here when present.
  const softwareNotes=document.querySelector('#softwareNotesInput');
  if(softwareNotes) softwareNotes.value=String(state.softwareNotes || '');

  // Keep neutral public placeholders available whenever values are empty.
  const creator=document.querySelector('#creatorInput');
  const workName=document.querySelector('#workNameInput');
  const credit=document.querySelector('#creditTextInput');
  const notes=document.querySelector('#notesInput');
  if(creator) creator.placeholder='例: 作者名 / サークル名';
  if(workName) workName.placeholder='例: 作品名';
  if(credit) credit.placeholder='例: © 2026 作者名 / 作品名';
  if(notes) notes.placeholder='必要に応じて、利用時の補足や注意事項を入力';
}

document.addEventListener('DOMContentLoaded',()=>{
  // Two animation frames ensure all DOMContentLoaded installers and their
  // synchronous UI mutations have completed before the final rehydration.
  requestAnimationFrame(()=>requestAnimationFrame(restoreEditorFromState));
});
