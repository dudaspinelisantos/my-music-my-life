(function(){
  const $=id=>document.getElementById(id);
  let user=null,mode="demo",page="home",query="",historyStack=["home"],historyIndex=0,playlistView=null,filter="all",toastTimer;
  const storeKey="mml_music_state_v1";
  let state={likes:[],recent:[],savedArtists:[],savedAlbums:[],settings:{reduceMotion:false,compact:false}};
  try{state={...state,...JSON.parse(localStorage.getItem(storeKey)||"{}")}}catch{}
  function persist(){localStorage.setItem(storeKey,JSON.stringify(state))}
  window.MMLStore={
    isLiked:id=>state.likes.includes(id),
    toggleLike:id=>{state.likes=state.likes.includes(id)?state.likes.filter(x=>x!==id):[...state.likes,id];persist()},
    likes:()=>state.likes.slice(),
    addRecent:id=>{state.recent=[id,...state.recent.filter(x=>x!==id)].slice(0,12);persist()},
    recent:()=>state.recent.map(id=>window.MMLMusic.get(id)).filter(Boolean),
    state:()=>state
  };
  function toast(message,error=false){const el=$("toast");el.textContent=message;el.classList.toggle("error",error);el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3200)}
  function icons(){if(window.lucide&&window.lucide.createIcons)window.lucide.createIcons()}
  function esc(v){return window.MMLMusic.escape(v)}
  function coverHTML(t){return `<div class="cover ${t.cover}"><span>${t.symbol}</span></div>`}
  function title(title,sub,button=""){return `<div class="page-title-row"><div><h1>${title}</h1><p>${sub||""}</p></div>${button}</div>`}
  function empty(icon,heading,description,button=""){return `<div class="empty-state"><div class="empty-icon"><i data-lucide="${icon}"></i></div><h3>${heading}</h3><p>${description}</p>${button}</div>`}
  function quickCard(t){return `<div class="quick-card" data-play="${t.id}">${coverHTML(t)}<strong>${esc(t.title)}</strong><button class="quick-play" data-play="${t.id}" aria-label="Tocar ${esc(t.title)}"><i data-lucide="play"></i></button></div>`}
  function sectionHead(h,sub,link,pageName){return `<div class="section-heading"><div><h2>${h}</h2>${sub?`<p>${sub}</p>`:""}</div>${link?`<button class="text-link" data-page="${pageName}">${link} →</button>`:""}</div>`}
  function renderHome(){
    const all=window.MMLMusic.all(),recent=window.MMLStore.recent(),liked=state.likes.map(id=>window.MMLMusic.get(id)).filter(Boolean);
    return `<section class="welcome-banner"><div class="welcome-copy"><p class="eyebrow">SUA VIDA. SUA TRILHA SONORA.</p><h1>Oi, ${esc((user?.name||"music lover").split(" ")[0])}! 💗<br>O que vamos ouvir?</h1><p>Um lugar para guardar as músicas que fazem parte da sua história.</p><button class="primary-btn" data-page="library">Explorar biblioteca <span>→</span></button></div><div class="banner-art"><div class="vinyl"></div></div></section>
    <section class="section">${sectionHead("Acesso rápido","Continue de onde sua música te levar.",null)}<div class="quick-grid">${(recent.slice(0,3).length?recent.slice(0,3):all.slice(0,3)).map(quickCard).join("")}</div></section>
    <section class="section">${sectionHead("Feito para você","Faixas para combinar com o seu momento.","Ver tudo","library")}<div class="music-grid">${(liked.length?all.filter(t=>liked.some(l=>l.genre===t.genre)&&!liked.some(l=>l.id===t.id)).slice(0,5):all.slice(0,5)).map(window.MMLMusic.renderCard).join("")||all.slice(0,5).map(window.MMLMusic.renderCard).join("")}</div></section>
    <section class="section">${sectionHead("Suas playlists","Coleções para cada versão de você.","Ver playlists","playlists")}<div class="playlist-grid">${window.MMLPlaylists.all().slice(0,4).map(renderPlaylistCard).join("")||empty("list-music","Sua primeira playlist","Crie uma coleção com as músicas que você ama.",`<button class="primary-btn" data-create-playlist>Criar playlist</button>`)}</div></section>
    <section class="section">${sectionHead("Descubra novas músicas","Faixas do catálogo demonstrativo.","Explorar biblioteca","library")}<div class="music-grid">${all.slice(3,8).map(window.MMLMusic.renderCard).join("")}</div></section>`;
  }
  function renderPlaylistCard(p){const n=p.tracks.length,first=window.MMLMusic.get(p.tracks[0])||{cover:p.color||"cover-1",symbol:"♫"};return `<article class="playlist-card"><div class="cover ${p.color||first.cover}"><span>${first.symbol||"♫"}</span><button class="quick-play cover-play" data-open-playlist="${p.id}" aria-label="Abrir playlist"><i data-lucide="arrow-up-right"></i></button></div><h3>${esc(p.name)}</h3><p>${n} ${n===1?"música":"músicas"}${p.description?" · "+esc(p.description):""}</p><div class="playlist-card-actions"><button data-open-playlist="${p.id}">Abrir playlist →</button><button data-delete-playlist="${p.id}" title="Excluir playlist"><i data-lucide="trash-2"></i></button></div></article>`}
  function renderLibrary(){
    const all=window.MMLMusic.search(query).filter(t=>filter==="all"||(filter==="liked"&&state.likes.includes(t.id))||(filter==="recent"&&state.recent.includes(t.id)));
    return `${title("Minha biblioteca","Todas as músicas para os seus momentos.")}<div class="filter-row"><button class="filter-chip ${filter==="all"?"active":""}" data-filter="all">Todas</button><button class="filter-chip ${filter==="liked"?"active":""}" data-filter="liked">Curtidas</button><button class="filter-chip ${filter==="recent"?"active":""}" data-filter="recent">Recentes</button></div>${window.MMLMusic.renderRows(all)}`;
  }
  function renderFavorites(){
    const all=state.likes.map(id=>window.MMLMusic.get(id)).filter(Boolean).filter(t=>!query||[t.title,t.artist,t.album,t.genre].some(v=>v.toLowerCase().includes(query.toLowerCase())));
    return `${title("Músicas curtidas","As faixas que conquistaram seu coração. 💗")}<div class="playlist-detail-hero"><div class="cover cover-6"><span>♡</span></div><div><p class="eyebrow">SUA COLEÇÃO</p><h1>Músicas curtidas</h1><p>${all.length} músicas salvas com carinho.</p><div class="hero-actions"><button class="primary-btn" data-play-list="likes"><i data-lucide="play"></i> Reproduzir</button></div></div></div>${all.length?window.MMLMusic.renderRows(all):empty("heart","Ainda não tem favoritas","Toque no coração de uma música para guardá-la aqui.",`<button class="primary-btn" data-page="library">Encontrar músicas</button>`)}`;
  }
  function renderPlaylists(){
    const lists=window.MMLPlaylists.all();
    return `${title("Suas playlists","Organize a trilha sonora de cada fase da vida.",`<button class="outline-btn" data-create-playlist><i data-lucide="plus"></i> Nova playlist</button>`)}${lists.length?`<div class="playlist-grid">${lists.map(renderPlaylistCard).join("")}</div>`:empty("list-music","Suas músicas, suas regras","Crie sua primeira playlist e reúna suas músicas favoritas.",`<button class="primary-btn" data-create-playlist>Criar playlist</button>`)}`;
  }
  function renderPlaylistDetail(id){
    const p=window.MMLPlaylists.get(id);if(!p){playlistView=null;return renderPlaylists()}
    const songs=p.tracks.map(t=>window.MMLMusic.get(t)).filter(Boolean);
    return `<button class="text-link" data-page="playlists">← Todas as playlists</button><div class="playlist-detail-hero" style="margin-top:15px"><div class="cover ${p.color}"><span>♫</span></div><div><p class="eyebrow">PLAYLIST</p><h1>${esc(p.name)}</h1><p>${esc(p.description||"Uma coleção criada por você.")}<br>${songs.length} ${songs.length===1?"música":"músicas"}</p><div class="hero-actions"><button class="primary-btn" data-play-list="${p.id}"><i data-lucide="play"></i> Reproduzir tudo</button><button class="outline-btn" data-add-to-playlist="${p.id}"><i data-lucide="plus"></i> Adicionar músicas</button></div></div></div>${songs.length?`<div class="track-list"><div class="track-row header"><span>#</span><span>Música</span><span class="track-album">Álbum</span><span class="track-duration">Duração</span><span></span></div>${songs.map((t,i)=>`<div class="track-row"><span class="track-number">${i+1}</span><div class="track-name">${coverHTML(t)}<div><strong>${esc(t.title)}</strong><small>${esc(t.artist)}</small></div></div><span class="track-album">${esc(t.album)}</span><span class="track-duration">${t.duration}</span><div class="row-actions"><button class="icon-btn" data-play="${t.id}" title="Tocar"><i data-lucide="play"></i></button><button class="icon-btn" data-remove-track="${t.id}" data-from-playlist="${p.id}" title="Remover"><i data-lucide="x"></i></button></div></div>`).join("")}</div>`:empty("music","Essa playlist está esperando músicas","Adicione faixas para completar sua coleção.",`<button class="primary-btn" data-add-to-playlist="${p.id}">Adicionar músicas</button>`)}`;
  }
  function renderSearch(){
    const q=query.trim(),res=window.MMLMusic.search(q);
    return `${title("Buscar músicas",q?`Resultados para “${esc(q)}”`:"Encontre a música certa para cada momento.")}<div class="global-search" style="max-width:100%;margin-bottom:22px"><i data-lucide="search"></i><input id="page-search-input" type="search" value="${esc(query)}" placeholder="Música, artista, álbum ou gênero..."></div>${res.length?`<div class="music-grid">${res.map(window.MMLMusic.renderCard).join("")}</div>`:empty("search","Não encontramos essa música","Tente buscar por outro nome, artista ou gênero.")}`;
  }
  function renderArtists(){
    const artists=[...new Set(window.MMLMusic.all().map(t=>t.artist))];
    return `${title("Artistas","Conheça quem dá voz às suas faixas favoritas.")}<div class="playlist-grid">${artists.map((artist,i)=>`<article class="playlist-card"><div class="cover cover-${i+1}"><span>${artist.charAt(0)}</span></div><h3>${esc(artist)}</h3><p>${window.MMLMusic.all().filter(t=>t.artist===artist).length} músicas no catálogo</p><div class="playlist-card-actions"><button data-search-artist="${esc(artist)}">Ver músicas →</button><button class="${state.savedArtists.includes(artist)?"liked":""}" data-save-artist="${esc(artist)}" title="Salvar artista"><i data-lucide="heart"></i></button></div></article>`).join("")}</div>`;
  }
  function renderAlbums(){
    const albums=[...new Set(window.MMLMusic.all().map(t=>t.album))];
    return `${title("Álbuns","Discos e universos musicais para explorar.")}<div class="playlist-grid">${albums.map((album,i)=>`<article class="playlist-card"><div class="cover cover-${i+1}"><span>♫</span></div><h3>${esc(album)}</h3><p>${esc(window.MMLMusic.all().find(t=>t.album===album).artist)}</p><div class="playlist-card-actions"><button data-search-album="${esc(album)}">Ver faixas →</button><button class="${state.savedAlbums.includes(album)?"liked":""}" data-save-album="${esc(album)}" title="Salvar álbum"><i data-lucide="heart"></i></button></div></article>`).join("")}</div>`;
  }
  function renderProfilePage(){return `${title("Seu perfil","Seu espaço dentro do My Music My Life.",`<button class="outline-btn" id="open-profile"><i data-lucide="user-round-pen"></i> Editar perfil</button>`)}<div class="playlist-detail-hero"><div class="cover cover-2"><span>${esc(user?.avatar||"♡")}</span></div><div><p class="eyebrow">SUA CONTA</p><h1>${esc(user?.name||"Music lover")}</h1><p>${esc(user?.email||"")}<br>Curadoria pessoal, sempre no seu ritmo.</p></div></div><div class="playlist-grid"><article class="playlist-card"><h3>Playlists</h3><p class="stat-pill"><strong>${window.MMLPlaylists.all().length}</strong>coleções criadas</p></article><article class="playlist-card"><h3>Músicas curtidas</h3><p class="stat-pill"><strong>${state.likes.length}</strong>faixas favoritas</p></article><article class="playlist-card"><h3>Artistas salvos</h3><p class="stat-pill"><strong>${state.savedArtists.length}</strong>artistas</p></article><article class="playlist-card"><h3>Álbuns salvos</h3><p class="stat-pill"><strong>${state.savedAlbums.length}</strong>álbuns</p></article></div><section class="section"><button class="outline-btn" id="open-settings"><i data-lucide="settings"></i> Configurações</button></section>`}
  function renderSettings(){return `${title("Configurações","Ajuste seu espaço musical.")}<div class="playlist-card" style="max-width:600px"><h3>Preferências</h3><p>As preferências são salvas neste navegador.</p><label class="setting-line"><span>Reduzir animações</span><input id="reduce-motion-inline" type="checkbox" ${state.settings.reduceMotion?"checked":""}></label><label class="setting-line"><span>Modo compacto da biblioteca</span><input id="compact-mode-inline" type="checkbox" ${state.settings.compact?"checked":""}></label><button class="primary-btn" style="margin-top:18px" id="save-settings-inline">Salvar preferências</button></div><div class="section"><h2 style="font-family:'Playfair Display',serif">Conta</h2><p style="color:var(--muted);font-size:12px;line-height:1.7">Modo atual: ${mode==="supabase"?"Supabase conectado":"demonstração local"}. No modo demonstração, seus dados ficam apenas neste navegador. Para dados na nuvem, configure o Supabase.</p><button class="outline-btn" id="settings-logout"><i data-lucide="log-out"></i> Sair da conta</button></div>`}
  function render(){
    const content=$("page-content");
    if(playlistView){content.innerHTML=renderPlaylistDetail(playlistView)}
    else if(page==="home")content.innerHTML=renderHome();
    else if(page==="search")content.innerHTML=renderSearch();
    else if(page==="library")content.innerHTML=renderLibrary();
    else if(page==="playlists")content.innerHTML=renderPlaylists();
    else if(page==="favorites")content.innerHTML=renderFavorites();
    else if(page==="artists")content.innerHTML=renderArtists();
    else if(page==="albums")content.innerHTML=renderAlbums();
    else if(page==="profile")content.innerHTML=renderProfilePage();
    else if(page==="settings")content.innerHTML=renderSettings();
    document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    document.querySelectorAll(".mobile-nav [data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    icons();
  }
  function go(next,add=true){playlistView=null;if(add){historyStack=historyStack.slice(0,historyIndex+1);historyStack.push(next);historyIndex=historyStack.length-1}page=next;render();window.scrollTo({top:0,behavior:state.settings.reduceMotion?"auto":"smooth"})}
  function refreshSidebar(){
    $("sidebar-playlists").innerHTML=window.MMLPlaylists.all().map(p=>`<button class="sidebar-playlist" data-open-playlist="${p.id}"><span class="tiny-cover ${p.color}">♫</span><span>${esc(p.name)}</span></button>`).join("");
    icons();
  }
  function setUser(u,m){user=u;mode=m;$("sidebar-name").textContent=u.name||"Music lover";$("top-name").textContent=u.name||"Minha conta";$("sidebar-avatar").textContent=u.avatar||u.name?.charAt(0)||"♡";$("top-avatar").textContent=u.avatar||u.name?.charAt(0)||"♡";$("account-mode").textContent=m==="supabase"?"Conta conectada":"Modo demonstração";$("auth-demo-note").textContent=m==="supabase"?"Conectado ao Supabase — seus dados podem ser salvos na nuvem.":"Modo demonstração ativo — seus dados ficam salvos neste navegador.";go("home",false);refreshSidebar()}
  function refreshRecent(){if(page==="home")render()}
  function openCreate(){ $("playlist-name").value="";$("playlist-description").value="";$("playlist-dialog").showModal();icons();setTimeout(()=>$("playlist-name").focus(),80)}
  function addTrackPrompt(trackId,playlistId){const lists=window.MMLPlaylists.all();if(playlistId){const p=window.MMLPlaylists.get(playlistId);if(!p)return;const options=lists.map(x=>`${x.id===playlistId?"✓ ":""}${x.name}`).join("\n");const chosen=prompt("Digite o nome da playlist para adicionar a música:\n"+options,p.name);if(chosen===null)return;const target=lists.find(x=>x.name.toLowerCase()===chosen.trim().toLowerCase());if(!target){toast("Não encontrei uma playlist com esse nome.",true);return}window.MMLPlaylists.add(target.id,trackId);toast("Música adicionada à playlist!");render();return}if(!lists.length){if(confirm("Você ainda não tem playlists. Deseja criar uma?"))openCreate();return}const chosen=prompt("Digite o nome da playlist:\n"+lists.map(x=>x.name).join("\n"),lists[0].name);if(chosen===null)return;const target=lists.find(x=>x.name.toLowerCase()===chosen.trim().toLowerCase());if(!target){toast("Não encontrei uma playlist com esse nome.",true);return}window.MMLPlaylists.add(target.id,trackId);toast("Música adicionada à playlist!");render()}
  function deletePlaylist(id){const p=window.MMLPlaylists.get(id);if(p&&confirm(`Excluir a playlist “${p.name}”?`)){window.MMLPlaylists.remove(id);if(playlistView===id)playlistView=null;toast("Playlist excluída.");render()}}
  function openProfile(){ $("profile-name-input").value=user?.name||"";$("profile-avatar-input").value=user?.avatar||"";$("profile-stats").innerHTML=`<div class="stat-pill"><strong>${window.MMLPlaylists.all().length}</strong>playlists</div><div class="stat-pill"><strong>${state.likes.length}</strong>favoritas</div>`;$("profile-dialog").showModal();icons()}
  document.addEventListener("click",e=>{
    const pageBtn=e.target.closest("[data-page]");if(pageBtn){e.preventDefault();go(pageBtn.dataset.page);return}
    const open=e.target.closest("[data-open-playlist]");if(open){playlistView=open.dataset.openPlaylist;render();return}
    const create=e.target.closest("[data-create-playlist]");if(create){openCreate();return}
    const del=e.target.closest("[data-delete-playlist]");if(del){deletePlaylist(del.dataset.deletePlaylist);return}
    const like=e.target.closest("[data-like]");if(like){window.MMLStore.toggleLike(like.dataset.like);toast(window.MMLStore.isLiked(like.dataset.like)?"Adicionada às músicas curtidas":"Removida das músicas curtidas");render();return}
    const add=e.target.closest("[data-add-track]");if(add){addTrackPrompt(add.dataset.addTrack);return}
    const addTo=e.target.closest("[data-add-to-playlist]");if(addTo){const id=addTo.dataset.addToPlaylist;const t=window.MMLMusic.all().find(x=>!window.MMLPlaylists.get(id)?.tracks.includes(x.id));if(t){addTrackPrompt(t.id,id)}else toast("Todas as músicas do catálogo já estão nesta playlist.");return}
    const rem=e.target.closest("[data-remove-track]");if(rem){window.MMLPlaylists.removeTrack(rem.dataset.fromPlaylist,rem.dataset.removeTrack);toast("Música removida da playlist.");render();return}
    const filterBtn=e.target.closest("[data-filter]");if(filterBtn){filter=filterBtn.dataset.filter;render();return}
    const playList=e.target.closest("[data-play-list]");if(playList){const id=playList.dataset.playList;const list=id==="likes"?state.likes.map(t=>window.MMLMusic.get(t)).filter(Boolean):window.MMLPlaylists.get(id)?.tracks.map(t=>window.MMLMusic.get(t)).filter(Boolean);if(list?.length)window.MMLPlayer.playList(list);else toast("Adicione músicas antes de reproduzir.");return}
    const artist=e.target.closest("[data-search-artist]");if(artist){query=artist.dataset.searchArtist; $("global-search-input").value=query;go("search");return}
    const album=e.target.closest("[data-search-album]");if(album){query=album.dataset.searchAlbum;$("global-search-input").value=query;go("search");return}
    const saveArtist=e.target.closest("[data-save-artist]");if(saveArtist){const a=saveArtist.dataset.saveArtist;state.savedArtists=state.savedArtists.includes(a)?state.savedArtists.filter(x=>x!==a):[...state.savedArtists,a];persist();toast(state.savedArtists.includes(a)?"Artista salvo":"Artista removido");render();return}
    const saveAlbum=e.target.closest("[data-save-album]");if(saveAlbum){const a=saveAlbum.dataset.saveAlbum;state.savedAlbums=state.savedAlbums.includes(a)?state.savedAlbums.filter(x=>x!==a):[...state.savedAlbums,a];persist();toast(state.savedAlbums.includes(a)?"Álbum salvo":"Álbum removido");render();return}
    if(e.target.closest("#profile-button")||e.target.closest("#profile-shortcut")||e.target.closest("#open-profile")){openProfile();return}
    if(e.target.closest("#open-settings")){go("settings");return}
    if(e.target.closest("#quick-create")){openCreate();return}
    if(e.target.closest("#settings-logout")){$("logout-btn").click();return}
    if(e.target.closest("#save-settings-inline")){state.settings.reduceMotion=$("reduce-motion-inline").checked;state.settings.compact=$("compact-mode-inline").checked;persist();document.body.classList.toggle("reduce-motion",state.settings.reduceMotion);toast("Preferências salvas.");return}
    if(e.target.closest("#queue-btn"))return;
  });
  $("global-search-input").addEventListener("input",e=>{query=e.target.value;if(page!=="search")go("search");else renderPreservingSearch()});
  $("global-search-input").addEventListener("keydown",e=>{if(e.key==="Enter"){query=e.target.value;go("search")}});
  function renderPreservingSearch(){const input=$("global-search-input");const val=input.value;render();input.value=val;const pageInput=$("page-search-input");if(pageInput){pageInput.focus();pageInput.setSelectionRange(val.length,val.length)}}
  $("page-content").addEventListener("input",e=>{if(e.target.id==="page-search-input"){query=e.target.value;renderPreservingSearch()}});
  $("page-content").addEventListener("keydown",e=>{if(e.target.id==="page-search-input"&&e.key==="Enter"){query=e.target.value;render()}});
  $("playlist-form").addEventListener("submit",e=>{e.preventDefault();const name=$("playlist-name").value.trim();if(!name){toast("Digite um nome para a playlist.",true);return}window.MMLPlaylists.create(name,$("playlist-description").value);$("playlist-dialog").close();toast("Playlist criada!");render()});
  $("profile-form").addEventListener("submit",async e=>{e.preventDefault();const name=$("profile-name-input").value.trim(),avatar=$("profile-avatar-input").value.trim()||name.charAt(0).toUpperCase();if(name.length<2){toast("O nome precisa ter pelo menos 2 caracteres.",true);return}if(mode==="supabase"){const {error}=await window.mmlSupabase.auth.updateUser({data:{name,avatar}});if(error){toast(error.message,true);return}}window.MMLAuth.updateUser({name,avatar});user={...user,name,avatar};$("profile-dialog").close();setUser(user,mode);toast("Perfil atualizado!")});
  $("settings-form").addEventListener("submit",e=>{e.preventDefault();state.settings.reduceMotion=$("reduce-motion").checked;state.settings.compact=$("compact-mode").checked;persist();$("settings-dialog").close();document.body.classList.toggle("reduce-motion",state.settings.reduceMotion);toast("Preferências salvas.")});
  document.querySelectorAll("[data-close-dialog]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.closeDialog).close()));
  $("back-btn").addEventListener("click",()=>{if(historyIndex>0){historyIndex--;page=historyStack[historyIndex];playlistView=null;render()}});
  $("forward-btn").addEventListener("click",()=>{if(historyIndex<historyStack.length-1){historyIndex++;page=historyStack[historyIndex];playlistView=null;render()}});
  $("profile-button").addEventListener("contextmenu",e=>{e.preventDefault();go("settings")});
  window.MMLApp={toast,icons,render,refreshSidebar,refreshRecent,setUser};
  window.addEventListener("DOMContentLoaded",()=>{icons();window.MMLAuth.init()});
})();
