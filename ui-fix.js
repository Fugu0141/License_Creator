'use strict';

// Keep segmented controls visually in sync with the underlying state.
// The original common update path did not call syncSegment(), so the state
// changed correctly while the selected button styling could stay stale.
const baseChangedWithUiSync = changed;
changed = function(){
  baseChangedWithUiSync();
  syncSegment();
};

function makeStepFlow(){
  const flow=document.createElement('div');
  flow.className='step-flow';
  flow.setAttribute('aria-hidden','true');
  flow.innerHTML='<span class="step-flow-arrow">▼</span>';
  return flow;
}

function installWorkflowFlow(){
  // Load the tiny workflow stylesheet without forcing another large HTML edit.
  if(!document.querySelector('link[data-workflow-flow]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='workflow-flow.css?v=20260815-0713';
    link.dataset.workflowFlow='true';
    document.head.appendChild(link);
  }

  const editor=document.querySelector('.editor');
  if(!editor || editor.querySelector('.step-flow[data-step="1-2"]')) return;

  const cards=[...editor.querySelectorAll(':scope > section.card')];
  const workCard=cards.find(card=>card.querySelector('.card-head > span')?.textContent.trim()==='1');
  const designCard=cards.find(card=>card.querySelector('.card-head > span')?.textContent.trim()==='3');
  const custom=document.querySelector('#customSection');
  const cc=document.querySelector('#ccSection');
  const software=document.querySelector('#softwareSection');

  if(workCard){
    const flow=makeStepFlow();
    flow.dataset.step='1-2';
    workCard.insertAdjacentElement('afterend',flow);
  }

  // Mode step 2 has three mutually exclusive sections. Put one shared flow
  // after the last of them in DOM order so it stays stable when modes switch.
  const modeSections=[custom,cc,software].filter(Boolean);
  if(modeSections.length){
    const lastModeSection=modeSections[modeSections.length-1];
    const flow=makeStepFlow();
    flow.dataset.step='2-3';
    lastModeSection.insertAdjacentElement('afterend',flow);
  }

  if(designCard){
    const downloadArea=designCard.querySelector('.download-area');
    if(downloadArea){
      const flow=makeStepFlow();
      flow.dataset.step='3-download';
      downloadArea.insertAdjacentElement('beforebegin',flow);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncSegment();
  installWorkflowFlow();
});
