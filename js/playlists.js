(function(){
  const KEY="mml_playlists_v1";
  const defaultLists=[{id:"pl-morning",name:"Manhãs cor-de-rosa",description:"Comece o dia com leveza.",tracks:["m1","m4","m8"],color:"cover-1",createdAt:Date.now()},{id:"pl-night",name:"Depois da meia-noite",description:"Para ouvir quando o mundo desacelera.",tracks:["m3","m5","m7"],color:"cover-3",createdAt:Date.now()}];
  function read(){try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:defaultLists.map(x=>({...x}))}catch{return defaultLists.map(x=>({...x}))}}
  let lists=read();
  function save(){localStorage.setItem(KEY,JSON.stringify(lists));window.MMLApp?.refreshSidebar()}
  window.MMLPlaylists={
    all:()=>lists.slice(),
    get:id=>lists.find(p=>p.id===id),
    create:(name,description="")=>{const p={id:"pl-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:name.trim(),description:description.trim(),tracks:[],color:"cover-"+(Math.floor(Math.random()*8)+1),createdAt:Date.now()};lists.unshift(p);save();return p},
    remove:id=>{lists=lists.filter(p=>p.id!==id);save()},
    add:(id,trackId)=>{const p=lists.find(x=>x.id===id);if(!p)return false;if(!p.tracks.includes(trackId))p.tracks.push(trackId);save();return true},
    removeTrack:(id,trackId)=>{const p=lists.find(x=>x.id===id);if(p){p.tracks=p.tracks.filter(t=>t!==trackId);save()}},
    rename:(id,name,description)=>{const p=lists.find(x=>x.id===id);if(p){p.name=name;p.description=description;save()}},
    replace:items=>{lists=items;save()}
  };
})();
