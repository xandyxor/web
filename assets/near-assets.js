/* Anime models are genuinely optional and load only when selected.
   Classic 3D preview works without downloading/parsing anime meshes or textures.
   Assets use ordinary script tags, so the distributed folder also works under file://. */
(()=>{
  'use strict';
  const files={"Sakurada_Fumiriya":"./assets/anime/models/Sakurada_Fumiriya.js","HairSample_Male":"./assets/anime/models/HairSample_Male.js","Victoria_Rubin":"./assets/anime/models/Victoria_Rubin.js","Vita":"./assets/anime/models/Vita.js","HairSample_Female":"./assets/anime/models/HairSample_Female.js","Everyday_Female":"./assets/anime/models/Everyday_Female.js","Everyday_Polo":"./assets/anime/models/Everyday_Polo.js","Everyday_Shirt":"./assets/anime/models/Everyday_Shirt.js"};
  const avatars={"fumiriya":"Sakurada_Fumiriya","raven":"HairSample_Male","victoria":"Victoria_Rubin","vita":"Vita","noir":"HairSample_Female","everyday":"Everyday_Female"};
  const clothes={"tailored":"Sakurada_Fumiriya","navy":"Sakurada_Fumiriya","casual":"HairSample_Male","charcoal":"HairSample_Male","elegant":"Victoria_Rubin","lavender":"Victoria_Rubin","tech":"Vita","noir":"HairSample_Female","denim-white":"Everyday_Female","denim-polo":"Everyday_Polo","denim-shirt":"Everyday_Shirt"};
  const tasks=new Map();
  window.nearAvatarData=window.nearAvatarData||{};
  window.nearAvatarThumbs={"fumiriya":"./assets/anime/thumbs/fumiriya.jpg","raven":"./assets/anime/thumbs/raven.jpg","victoria":"./assets/anime/thumbs/victoria.jpg","vita":"./assets/anime/thumbs/vita.jpg","noir":"./assets/anime/thumbs/noir.jpg","everyday":"./assets/anime/thumbs/everyday.jpg"};
  const fallbackAvatar=gender=>gender==='male'?'raven':'everyday';
  const fallbackOutfit=gender=>gender==='male'?'tailored':'denim-polo';
  function modelsFor(person){
    if(!person || person.model!=='avatar')return [];
    const character=avatars[person.avatar==='auto'?fallbackAvatar(person.gender):person.avatar]
      ||avatars[fallbackAvatar(person.gender)];
    const outfit=clothes[person.outfit]||clothes[fallbackOutfit(person.gender)];
    return [...new Set([character,outfit])];
  }
  function needed(people){
    return [...new Set((people||[]).flatMap(modelsFor))].sort();
  }
  function readyForPerson(person){
    if(!person||person.model!=='avatar')return true;
    return !!window.nearAvatarThree && modelsFor(person).every(id=>!!window.nearAvatarData[id]);
  }
  function readyForPeople(people){
    return (people||[]).every(readyForPerson);
  }
  function getScript(src){
    if(tasks.has(src))return tasks.get(src);
    const work=new Promise((resolve,reject)=>{
      const tag=document.createElement('script');
      tag.src=src;
      tag.async=true;
      tag.onload=resolve;
      tag.onerror=()=>reject(new Error('載入失敗：'+src));
      document.head.appendChild(tag);
    }).catch(error=>{tasks.delete(src);throw error;});
    tasks.set(src,work);
    return work;
  }
  function ensureForPeople(people){
    const models=needed(people);
    if(models.length===0 || readyForPeople(people))return Promise.resolve();
    // Load optional Three extensions and only the two templates actually used
    // (character + outfit) by each selected detailed model.
    return Promise.all([
      window.nearAvatarThree?Promise.resolve():getScript('./assets/anime/near-avatar-three.js'),
      ...models.filter(id=>!window.nearAvatarData[id]).map(id=>getScript(files[id]))
    ]).then(()=>{
      if(!readyForPeople(people))throw new Error('動漫模型資源不完整');
    });
  }
  window.nearAssets={modelsFor,needed,readyForPerson,readyForPeople,ensureForPeople};
})();
