'use strict';

// Keep segmented controls visually in sync with the underlying state.
// The original common update path did not call syncSegment(), so the state
// changed correctly while the selected button styling could stay stale.
const baseChangedWithUiSync = changed;
changed = function(){
  baseChangedWithUiSync();
  syncSegment();
};

function installCreditControlFix(){
  const segment=document.querySelector('[data-segment="credit"]');
  if(!segment || segment.dataset.creditControlFixed) return;
  segment.dataset.creditControlFixed='true';

  // app.js and enhancements.js both register a bubbling click handler for this
  // control. Handle it once in capture phase and stop those duplicate handlers
  // so later UI layers cannot make the visual state stale or race the setting.
  segment.addEventListener('click',e=>{
    const button=e.target.closest('button[data-value]'); if(!button || !segment.contains(button)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const value=button.dataset.value;
    if(!['required','recommended','none'].includes(value)) return;

    state.credit=value;
    syncSegment();
    queueRender();
    saveState();
  },true);
}

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
  if(!editor) return;

  const cards=[...editor.querySelectorAll(':scope > section.card')];
  const workCard=cards.find(card=>card.querySelector('.card-head > span')?.textContent.trim()==='1');
  const designCard=cards.find(card=>card.querySelector('.card-head > span')?.textContent.trim()==='3');
  const exportCard=document.querySelector('#exportCard');
  const custom=document.querySelector('#customSection');
  const cc=document.querySelector('#ccSection');
  const software=document.querySelector('#softwareSection');

  if(workCard && !editor.querySelector('.step-flow[data-step="1-2"]')){
    const flow=makeStepFlow();
    flow.dataset.step='1-2';
    workCard.insertAdjacentElement('afterend',flow);
  }

  // Mode step 2 has three mutually exclusive sections. Put one shared flow
  // after the last of them in DOM order so it stays stable when modes switch.
  const modeSections=[custom,cc,software].filter(Boolean);
  if(modeSections.length && !editor.querySelector('.step-flow[data-step="2-3"]')){
    const lastModeSection=modeSections[modeSections.length-1];
    const flow=makeStepFlow();
    flow.dataset.step='2-3';
    lastModeSection.insertAdjacentElement('afterend',flow);
  }

  // Export is now its own step 4 card. Keep the same visual workflow connector
  // between step 3 (Design) and step 4 (Export), rather than looking for the
  // old download area that used to live inside the Design card.
  if(designCard && exportCard && !editor.querySelector('.step-flow[data-step="3-4"]')){
    const flow=makeStepFlow();
    flow.dataset.step='3-4';
    designCard.insertAdjacentElement('afterend',flow);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncSegment();
  installCreditControlFix();
  installWorkflowFlow();
});
