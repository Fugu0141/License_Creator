'use strict';

// Date-only handling mirrors Cherry-ToDo: use the browser/device's local
// calendar fields directly instead of converting through UTC or assuming a
// fixed timezone. This makes "today" follow the user's actual local date.
(function(){
  const AUTOSAVE_PREF_KEY='license-studio-autosave-enabled-v1';
  const STORAGE_KEY='license-studio-simple-v1';

  function pad2(value){
    return String(value).padStart(2,'0');
  }

  function formatDateKey(year,month,day){
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  function today(){
    const now=new Date();
    return formatDateKey(now.getFullYear(),now.getMonth()+1,now.getDate());
  }

  const localToday=today();
  if(window.LICENSE_DATA?.defaultState){
    window.LICENSE_DATA.defaultState.updatedAt=localToday;
  }

  // If an opted-in autosave draft exists but its date was cleared, normalize
  // that empty value before app.js restores it. No storage is touched unless
  // the user has already enabled autosave.
  try{
    if(localStorage.getItem(AUTOSAVE_PREF_KEY)!=='1') return;
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved && typeof saved==='object' && !saved.updatedAt){
      saved.updatedAt=localToday;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));
    }
  }catch(err){
    console.warn(err);
  }
})();
