(function () {
  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("play-btn");
  let queue = window.MMLMusic.all(), index = -1, shuffle = false, repeat = false;
  const $ = id => document.getElementById(id);
  const fmt = s => { if (!Number.isFinite(s)) return "0:00"; const m=Math.floor(s/60), sec=Math.floor(s%60); return `${m}:${String(sec).padStart(2,"0")}`; };
  function icon(name){return `<i data-lucide="${name}"></i>`}
  function setIcon(el,name){if(el){el.innerHTML=icon(name);window.MMLApp?.icons();}}
  function current(){return queue[index] || null}
  function updateLike(){const t=current(), btn=$("player-like");if(!btn)return;btn.classList.toggle("liked",!!t&&window.MMLStore.isLiked(t.id));setIcon(btn,"heart")}
  function load(track, autoplay=true) {
    if(!track)return;
    queue = window.MMLMusic.all();
    index = queue.findIndex(t=>t.id===track.id);
    if(index<0){queue.unshift(track);index=0}
    audio.src=track.audio;
    $("player-title").textContent=track.title;
    $("player-artist").textContent=track.artist;
    $("player-cover").className=`cover cover-small ${track.cover}`;
    $("player-cover").innerHTML=`<span>${track.symbol}</span>`;
    $("progress").value=0;$("current-time").textContent="0:00";$("duration").textContent=track.duration||"0:00";
    updateLike();
    window.MMLStore.addRecent(track.id);
    if(autoplay){const p=audio.play();if(p&&p.catch)p.catch(()=>window.MMLApp.toast("O navegador bloqueou o áudio ou a conexão não está disponível. Tente novamente.",true));}
    window.MMLApp?.refreshRecent();
  }
  function playAt(i){if(!queue.length)return;index=(i+queue.length)%queue.length;load(queue[index],true)}
  function next(){if(!queue.length)return;if(shuffle&&queue.length>1){let n=index;while(n===index)n=Math.floor(Math.random()*queue.length);playAt(n)}else playAt(index+1)}
  playBtn.addEventListener("click",()=>{if(!current()){playAt(0);return}if(audio.paused){audio.play().catch(()=>window.MMLApp.toast("Não foi possível reproduzir o áudio. Verifique sua conexão.",true))}else audio.pause()});
  audio.addEventListener("play",()=>setIcon(playBtn,"pause"));
  audio.addEventListener("pause",()=>setIcon(playBtn,"play"));
  audio.addEventListener("timeupdate",()=>{if(audio.duration){ $("progress").value=(audio.currentTime/audio.duration)*100;$("current-time").textContent=fmt(audio.currentTime);$("duration").textContent=fmt(audio.duration)}});
  audio.addEventListener("ended",()=>{if(repeat){audio.currentTime=0;audio.play()}else next()});
  $("progress").addEventListener("input",e=>{if(audio.duration)audio.currentTime=audio.duration*Number(e.target.value)/100});
  $("volume").addEventListener("input",e=>audio.volume=Number(e.target.value));audio.volume=.7;
  $("prev-btn").addEventListener("click",()=>{if(audio.currentTime>3){audio.currentTime=0}else playAt(index-1)});
  $("next-btn").addEventListener("click",next);
  $("shuffle-btn").addEventListener("click",()=>{shuffle=!shuffle;$("shuffle-btn").classList.toggle("active",shuffle);window.MMLApp.toast(shuffle?"Reprodução aleatória ativada":"Reprodução aleatória desativada")});
  $("repeat-btn").addEventListener("click",()=>{repeat=!repeat;$("repeat-btn").classList.toggle("active",repeat);window.MMLApp.toast(repeat?"Repetição ativada":"Repetição desativada")});
  $("player-like").addEventListener("click",()=>{const t=current();if(t){window.MMLStore.toggleLike(t.id);updateLike();window.MMLApp.toast(window.MMLStore.isLiked(t.id)?"Adicionada às músicas curtidas":"Removida das músicas curtidas");window.MMLApp.render() }});
  $("queue-btn").addEventListener("click",()=>window.MMLApp.toast("O catálogo atual contém faixas demonstrativas. Configure suas próprias faixas autorizadas no arquivo js/music.js."));
  document.addEventListener("click",e=>{const b=e.target.closest("[data-play]");if(b){const t=window.MMLMusic.get(b.dataset.play);if(t)load(t,true)}});
  window.MMLPlayer={play:load,playList:list=>{if(list&&list.length){queue=list.slice();index=-1;playAt(0)}},current, audio};
})();
