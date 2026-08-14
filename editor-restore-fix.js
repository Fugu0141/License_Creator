'use strict';

// Final editor/state synchronization layer.
// Keep restoration synchronous at DOMContentLoaded so a delayed animation
// frame can never overwrite a user's first interaction with a select control.
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

function installFinalSelectHandler(select, onChange){
  if(!select || select.dataset.finalSelectHandler) return;
  select.dataset.finalSelectHandler='true';

  // Handle these state-bearing selects once, in capture phase. Older feature
  // layers also registered bubbling listeners; stopping them here prevents
  // duplicate/stale updates and guarantees the PDF uses the visible choice.
  select.addEventListener('change',event=>{
    event.stopPropagation();
    event.stopImmediatePropagation();
    onChange(select.value);
  },true);
}

function installLicenseSelectHandlers(){
  installFinalSelectHandler(document.querySelector('#presetSelect'),value=>{
    const preset=DATA.presets[value];
    if(!preset) return;

    state.preset=value;
    state.policies={...preset.policies};
    state.credit=preset.credit;
    state.restrictions={...preset.restrictions};

    // The preset changes several controls at once, so repaint the editor first
    // and then run the normal render/save pipeline.
    syncControls();
    changed();
  });

  installFinalSelectHandler(document.querySelector('#ccLicenseSelect'),value=>{
    if(!DATA.cc[value]) return;
    state.ccLicense=value;
    changed();
  });

  installFinalSelectHandler(document.querySelector('#softwareLicenseSelect'),value=>{
    if(!DATA.software[value]) return;
    state.softwareLicense=value;
    changed();
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  // This file is loaded last. All deferred scripts and all earlier
  // DOMContentLoaded installers are already registered; because listeners run
  // in registration order, an immediate final sync is sufficient and avoids a
  // late-rAF race with user input.
  restoreEditorFromState();
  installLicenseSelectHandlers();
});
