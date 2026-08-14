'use strict';

document.addEventListener('DOMContentLoaded',()=>{
  const creator=document.querySelector('#creatorInput');
  const workName=document.querySelector('#workNameInput');
  const credit=document.querySelector('#creditTextInput');
  const notes=document.querySelector('#notesInput');
  const imageLabel=document.querySelector('#imageLabel');
  const resetImage=document.querySelector('#resetImageButton');

  if(creator) creator.placeholder='例: 作者名 / サークル名';
  if(workName) workName.placeholder='例: 作品名';
  if(credit) credit.placeholder='例: © 2026 作者名 / 作品名';
  if(notes) notes.placeholder='必要に応じて、利用時の補足や注意事項を入力';

  if(imageLabel && !state.customImage) imageLabel.textContent='画像なし';
  if(resetImage) resetImage.textContent='画像を外す';
});
