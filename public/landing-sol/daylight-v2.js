(() => {
  const opening=document.getElementById('opening');
  const introduction=document.getElementById('introduction');
  const image=document.querySelector('.world img');
  const audienceButtons=[...document.querySelectorAll('.audience')];
  const indicator=document.getElementById('audienceIndicator');
  const tray=document.getElementById('technologyTray');
  const trayButton=document.getElementById('technologyButton');
  const technologyButtons=[...document.querySelectorAll('.technology')];
  const stories=[
    {first:'Wellness.',second:'Made personal.',description:'Oxygen, hydrogen, red light and PEMF.<br>Explore the technology. Understand your options.<br>Find a routine that belongs in your life.',reassurance:'From your first question to your everyday routine.',position:'57% 62%'},
    {first:'Your practice.',second:'More possibility.',description:'A considered approach to wellness equipment.<br>Explore technology for your clinic or studio,<br>with guidance from selection to setup.',reassurance:'For medical professionals and wellness operators.',position:'68% 58%'},
    {first:'Your routine.',second:'Your next chapter.',description:'Make room for recovery in your training routine.<br>Explore oxygen, hydrogen, red light and PEMF.<br>Start with guidance. Build around your goals.',reassurance:'For athletes, coaches and active lives.',position:'63% 65%'},
    {first:'Stay curious.',second:'Choose well.',description:'Explore the ideas behind wellness technology.<br>Compare the equipment. Consider the evidence.<br>Find a starting point that makes sense for you.',reassurance:'For curious minds and considered experimentation.',position:'62% 55%'}
  ];
  const technologyCopy=[
    'Hyperbaric oxygen equipment, with guidance on choosing a chamber and making space for it.',
    'Molecular hydrogen equipment. Explore inhalation and water options, with guidance on the differences.',
    'Red and near-infrared light equipment. Understand the formats and explore where they fit in your routine.',
    'Pulsed electromagnetic field equipment. A clearer introduction to the technology, options and research.'
  ];
  let active=0, storyTimer, inviteTimer;
  function placeIndicator(){const button=audienceButtons[active];indicator.style.width=button.offsetWidth+'px';indicator.style.transform=`translateX(${button.offsetLeft}px)`;}
  function chooseAudience(index){
    active=index;
    audienceButtons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
    placeIndicator();
    opening.classList.add('changing');
    clearTimeout(storyTimer);
    storyTimer=setTimeout(()=>{
      const story=stories[index];
      document.getElementById('headlineFirst').textContent=story.first;
      document.getElementById('headlineSecond').textContent=story.second;
      document.getElementById('description').innerHTML=story.description;
      document.getElementById('reassurance').textContent=story.reassurance;
      image.style.objectPosition=story.position;
      opening.classList.remove('changing');opening.classList.add('changed');
    },190);
  }
  audienceButtons.forEach(button=>button.addEventListener('click',()=>chooseAudience(Number(button.dataset.audience))));
  document.querySelectorAll('[data-audience-link]').forEach(button=>button.addEventListener('click',()=>chooseAudience(Number(button.dataset.audienceLink))));
  function setTray(open){tray.hidden=!open;trayButton.setAttribute('aria-expanded',String(open));opening.classList.toggle('tray-open',open);}
  trayButton.addEventListener('click',()=>setTray(tray.hidden));
  document.getElementById('technologyNav').addEventListener('click',()=>setTray(tray.hidden));
  document.getElementById('closeTray').addEventListener('click',()=>setTray(false));
  technologyButtons.forEach((button,index)=>button.addEventListener('click',()=>{technologyButtons.forEach((item,i)=>item.classList.toggle('chosen',i===index));document.getElementById('technologyDescription').textContent=technologyCopy[index];}));
  function invite(){
    const dock=document.getElementById('startingDock');
    dock.classList.remove('invited');void dock.offsetWidth;dock.classList.add('invited');
    document.getElementById('dockTitle').textContent='Choose your starting point.';
    audienceButtons[active].focus({preventScroll:true});
    clearTimeout(inviteTimer);inviteTimer=setTimeout(()=>{dock.classList.remove('invited');document.getElementById('dockTitle').textContent='What brings you here?';},3500);
  }
  document.getElementById('startingPoint').addEventListener('click',invite);
  document.getElementById('guidance').addEventListener('click',invite);
  document.getElementById('home').addEventListener('click',()=>{chooseAudience(0);setTray(false);});
  window.addEventListener('keydown',event=>{if(event.key==='Escape')setTray(false);});
  window.addEventListener('resize',placeIndicator);
  opening.addEventListener('pointermove',event=>{if(event.target.closest('button')||event.clientY>innerHeight-170)return;const x=(event.clientX/innerWidth-.5)*-9,y=(event.clientY/innerHeight-.5)*-5;image.style.setProperty('--pan-x',`${x}px`);image.style.setProperty('--pan-y',`${y}px`);});
  document.fonts.ready.then(placeIndicator);placeIndicator();
})();
