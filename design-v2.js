'use strict';

const EDITORIAL_STATUS = {
  allow: { line:'#86cfa8', ink:'#166534', pale:'#f0fdf4' },
  ask:  { line:'#e8be62', ink:'#92400e', pale:'#fffbeb' },
  deny: { line:'#df8b8b', ink:'#991b1b', pale:'#fef2f2' }
};

const LICENSE_CREATOR_URL = 'https://fugu0141.github.io/License_Creator/';

function editorialTheme(){
  return {
    bg:'#ffffff', ink:'#172033', muted:'#667