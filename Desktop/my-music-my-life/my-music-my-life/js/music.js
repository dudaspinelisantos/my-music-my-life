(function () {
  const tracks = [
    {id:"m1",title:"Pink Skies",artist:"Luna Bloom",album:"Soft Hours",genre:"Pop",duration:"3:18",cover:"cover-1",symbol:"✦",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
    {id:"m2",title:"Dancing in June",artist:"Mila Rose",album:"Summer Letters",genre:"Indie Pop",duration:"3:42",cover:"cover-2",symbol:"☼",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},
    {id:"m3",title:"Moonlight Diary",artist:"The Daydreams",album:"Afterglow",genre:"Dream Pop",duration:"4:02",cover:"cover-3",symbol:"☾",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},
    {id:"m4",title:"Cherry Heart",artist:"Nina June",album:"Little Things",genre:"Pop",duration:"3:05",cover:"cover-4",symbol:"♡",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},
    {id:"m5",title:"Ocean Between Us",artist:"Luna Bloom",album:"Soft Hours",genre:"Indie",duration:"3:51",cover:"cover-5",symbol:"≈",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},
    {id:"m6",title:"Almost Forever",artist:"Mila Rose",album:"Summer Letters",genre:"Pop",duration:"3:27",cover:"cover-6",symbol:"∞",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"},
    {id:"m7",title:"Lavender Dreams",artist:"The Daydreams",album:"Afterglow",genre:"Dream Pop",duration:"4:11",cover:"cover-7",symbol:"✿",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"},
    {id:"m8",title:"Your Favorite Song",artist:"Nina June",album:"Little Things",genre:"Acoustic",duration:"2:58",cover:"cover-8",symbol:"♫",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"}
  ];
  window.MMLMusic = {
    all: () => tracks.slice(),
    get: id => tracks.find(t => t.id === id),
    search: query => {
      const q = (query || "").trim().toLowerCase();
      return q ? tracks.filter(t => [t.title,t.artist,t.album,t.genre].some(v => v.toLowerCase().includes(q))) : tracks.slice();
    },
    cover: track => `<div class="cover ${track.cover || "cover-1"}"><span>${track.symbol || "♫"}</span></div>`,
    escape: value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),
    renderCard: track => {
      const liked = window.MMLStore.isLiked(track.id);
      return `<article class="music-card">
        <div class="cover ${track.cover}"><span>${track.symbol}</span><button class="quick-play cover-play" data-play="${track.id}" aria-label="Tocar ${track.title}"><i data-lucide="play"></i></button></div>
        <h3 title="${track.title}">${track.title}</h3><p>${track.artist}</p>
        <div class="card-actions"><button class="icon-btn ${liked?"liked":""}" data-like="${track.id}" title="${liked?"Remover dos favoritos":"Curtir"}"><i data-lucide="heart"></i></button><button class="icon-btn add-track" data-add-track="${track.id}" title="Adicionar a uma playlist"><i data-lucide="list-plus"></i></button></div>
      </article>`;
    },
    renderRows: list => {
      if (!list.length) return `<div class="empty-state"><div class="empty-icon"><i data-lucide="music-2"></i></div><h3>Nenhuma música encontrada</h3><p>Tente outra busca ou explore a biblioteca demonstrativa.</p></div>`;
      return `<div class="track-list"><div class="track-row header"><span>#</span><span>Música</span><span class="track-album">Álbum</span><span class="track-duration">Duração</span><span></span></div>${list.map((t,i)=>`<div class="track-row"><span class="track-number">${i+1}</span><div class="track-name"><div class="cover ${t.cover}"><span style="font-size:17px">${t.symbol}</span></div><div><strong>${t.title}</strong><small>${t.artist}</small></div></div><span class="track-album">${t.album}</span><span class="track-duration">${t.duration}</span><div class="row-actions"><button class="icon-btn ${window.MMLStore.isLiked(t.id)?"liked":""}" data-like="${t.id}" title="Curtir"><i data-lucide="heart"></i></button><button class="icon-btn" data-play="${t.id}" title="Tocar"><i data-lucide="play"></i></button><button class="icon-btn" data-add-track="${t.id}" title="Adicionar à playlist"><i data-lucide="list-plus"></i></button></div></div>`).join("")}</div>`;
    }
  };
})();
