/* One verified load outcome per provider ID; never share across similar names. */
(function() {
  'use strict';
  const states=new Map();
  function create(e) {
    const box=document.createElement('div');box.className='exercise-media';
    const url=window.GymExercises.mediaUrl(e.gifUrl,e.exerciseId) || (!e.gifUrl && states.get(e.exerciseId)?.url);
    const message=text=>{const p=document.createElement('p');p.className='media-fallback';p.textContent=text;box.replaceChildren(p);};
    if(!e.exerciseId||!url){message('Demonstration unavailable. Use the How to Perform instructions below.');return box;}
    let state=states.get(e.exerciseId);
    if(!state){state={url,status:'idle',views:new Set()};states.set(e.exerciseId,state);}
    // An ID cannot acquire a different media identity during the session.
    if(state.url!==url){message('Demonstration unavailable. Use the How to Perform instructions below.');return box;}
    function render() {
      if(state.status==='ready') {
        const img=new Image();img.alt='Exercise demonstration: '+e.name;img.width=240;img.height=240;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.dataset.exerciseId=e.exerciseId;
        img.addEventListener('error',()=>finish('failed'),{once:true});img.src=state.url;box.replaceChildren(img);
      } else if(state.status==='failed') message('Demonstration unavailable. Use the How to Perform instructions below.');
      else {message('Loading demonstration…');box.firstChild.className='media-loading';}
    }
    function notify(){for(const view of state.views){if(view.box.isConnected)view.render();else state.views.delete(view);}}
    function finish(status){clearTimeout(state.timer);state.status=status;notify();}
    state.views.add({box,render});render();
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(x=>x.isIntersecting))return;
      observer.disconnect();
      if(state.status!=='idle'){render();return;}
      state.status='loading';
      const image=new Image();state.image=image;image.referrerPolicy='no-referrer';
      image.onload=()=>{if(state.status==='loading')finish('ready');};
      image.onerror=()=>{if(state.status==='loading')finish('failed');};
      state.timer=setTimeout(()=>{if(state.status==='loading')finish('failed');},12000);
      image.src=state.url;
    });
    observer.observe(box);return box;
  }
  window.GymMedia={create};
})();
