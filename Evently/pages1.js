/* Evently pages part 1: router, home, discover, event detail, weekend, radar, categories, guides. */
(function(){
"use strict";
const E = window.EV; const {$,$$,esc,I,S} = E;
const R = window.EVROUTES = {};
let heroAnim = null;

/* ---------- Search suggestions ---------- */
function suggestions(q){
  q = q.trim().toLowerCase(); if(q.length<2) return [];
  const evs = E.events(); const out=[]; const seen=new Set();
  const push=(kind,label,href)=>{ const k=kind+label; if(seen.has(k)||out.length>=8) return; seen.add(k); out.push({kind,label,href}); };
  evs.filter(e=>E.isActive(e)&&e.title.toLowerCase().includes(q)).slice(0,4).forEach(e=>push("Event",e.title,"#event-"+e.slug));
  evs.forEach(e=>(e.artists||[]).forEach(a=>{ if(a.toLowerCase().includes(q)) push("Artist",a,"q:"+a); }));
  evs.forEach(e=>{ if(e.venue.toLowerCase().includes(q)) push("Venue",e.venue,"q:"+e.venue); });
  evs.forEach(e=>{ if(e.organizer && !/not stated/i.test(e.organizer) && e.organizer.toLowerCase().includes(q)) push("Organizer",e.organizer,"q:"+e.organizer); });
  evs.forEach(e=>{ [e.area,e.city].forEach(l=>{ if(l && l.toLowerCase().includes(q)) push("Location",l,"q:"+l); }); });
  return out;
}
function bindSearch(root, onSubmit){
  const input=$("input",root), box=$(".suggest",root); let idx=-1, items=[];
  const render=()=>{ items=suggestions(input.value); box.hidden=!items.length; box.innerHTML=items.map((s,i)=>`<button type="button" data-i="${i}" class="${i===idx?"on":""}"><span class="kind">${s.kind}</span><span>${esc(s.label)}</span></button>`).join(""); };
  const go=s=>{ box.hidden=true; if(s.href.startsWith("q:")){ onSubmit(s.href.slice(2)); } else { location.hash=s.href.slice(1); } };
  input.addEventListener("input",()=>{idx=-1;render();});
  input.addEventListener("keydown",e=>{ if(e.key==="ArrowDown"){idx=Math.min(items.length-1,idx+1);render();e.preventDefault();} else if(e.key==="ArrowUp"){idx=Math.max(-1,idx-1);render();e.preventDefault();} else if(e.key==="Enter"){ e.preventDefault(); if(idx>=0&&items[idx]) go(items[idx]); else { box.hidden=true; onSubmit(input.value); } } else if(e.key==="Escape"){box.hidden=true;} });
  box.addEventListener("mousedown",e=>{ const b=e.target.closest("button"); if(b){ e.preventDefault(); go(items[+b.dataset.i]); } });
  input.addEventListener("blur",()=>setTimeout(()=>box.hidden=true,120));
  const btn=$("[data-search-go]",root); if(btn) btn.addEventListener("click",()=>onSubmit(input.value));
}
function searchBox(id, ph="Search events, artists, venues, organizers or places"){
  return `<div class="search" id="${id}"><div class="search-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><label class="sr" for="${id}-in">Search</label><input id="${id}-in" type="search" autocomplete="off" placeholder="${ph}"><button class="btn btn-primary" data-search-go type="button">Search</button></div><div class="suggest" hidden></div></div>`;
}

/* ---------- Match (recommendations) ---------- */
const INTERESTS = [
  {id:"music",label:"Music",cats:["concerts"],tags:["music"]},
  {id:"afrobeats",label:"Afrobeats",tags:["afrobeats","amapiano","afropop","dancehall"]},
  {id:"gospel",label:"Gospel",tags:["gospel","choir"]},
  {id:"hiphop",label:"Hip-hop",tags:["hip-hop","rnb"]},
  {id:"nightlife",label:"Nightlife",cats:["nightlife"],tags:["bar night","party","dj","club"]},
  {id:"comedy",label:"Comedy",cats:["comedy"],tags:["comedy","stand-up"]},
  {id:"festivals",label:"Festivals",cats:["festivals"],tags:["festival"]},
  {id:"sports",label:"Sports",cats:["sports"]},
  {id:"business",label:"Business networking",cats:["business"],tags:["networking","startups"]},
  {id:"culture",label:"Cultural events",cats:["culture"],tags:["art","theatre","heritage"]},
  {id:"food",label:"Food and brunch",cats:["food"],tags:["brunch","food"]}
];
R.INTERESTS = INTERESTS;
function myInterests(){ const u=E.me(); return u ? (u.interests||[]) : (S.guestInterests||[]); }
function recommend(limit=8){
  const ints = INTERESTS.filter(i=>myInterests().includes(i.id)); if(!ints.length) return [];
  const u=E.me(); const city = u && u.city;
  const savedCats={}; (u?(S.saved[u.id]||[]):[]).forEach(s=>{ const e=E.bySlug(s); if(e) savedCats[e.cat]=(savedCats[e.cat]||0)+1; });
  const viewed=S.viewedCats[E.viewerId()]||{};
  const now=Date.now();
  return E.events().filter(e=>E.status(e)==="upcoming").map(e=>{
    let s=0; const why=[];
    ints.forEach(i=>{ const hitC=(i.cats||[]).includes(e.cat); const hitT=(i.tags||[]).some(t=>(e.tags||[]).includes(t)); if(hitC||hitT){ s+=hitT&&hitC?4:3; if(why.length<2) why.push(i.label); } });
    if(!s) return null;
    if(city && (e.city||"").toLowerCase().includes(city.toLowerCase())){ s+=1.5; why.push("Near "+city); }
    if(savedCats[e.cat]){ s+=Math.min(2,savedCats[e.cat]); why.push("Like events you saved"); }
    if(viewed[e.cat]) s+=Math.min(1.5,viewed[e.cat]*.25);
    const days=(e.startD-now)/E.DAY; s+= days<3?2:days<8?1.2:days<20?.5:0;
    if(E.isSaved(e.slug)) s-=3;
    return {e,s,why};
  }).filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,limit);
}
R.recommend = recommend;
function interestsModal(after){
  const cur=new Set(myInterests());
  const m=E.modal(`<div class="modal-head"><h3>What are you into?</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
    <p class="muted">Evently Match uses these, your area, the events you save and the categories you browse to suggest events. Change them any time.</p>
    <div class="chips" id="intChips">${INTERESTS.map(i=>`<button class="chip" data-int="${i.id}" aria-pressed="${cur.has(i.id)}">${i.label}</button>`).join("")}</div>
    <button class="btn btn-primary" id="intSave">Save interests</button>`);
  m.addEventListener("click",e=>{ const b=e.target.closest("[data-int]"); if(b) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed")!=="true"); });
  $("#intSave",m).onclick=()=>{ const sel=$$("[data-int][aria-pressed=true]",m).map(b=>b.dataset.int); const u=E.me(); if(u) u.interests=sel; else S.guestInterests=sel; E.persist(); E.closeModal(); E.toast("Interests saved"); after&&after(); };
}
R.interestsModal = interestsModal;

/* ---------- Home ---------- */
R.home = function(app){
  E.setHead("Evently: events, concerts and nightlife in Uganda","Discover concerts, parties, nightlife, festivals and comedy in Kampala and across Uganda. Your next experience starts here.");
  const evs=E.events(); const up=evs.filter(E.isActive).sort((a,b)=>a.startD-b.startD);
  const featured = up.filter(e=>e.featured).slice(0,6);
  const tr = E.trending(evs).slice(0,8);
  const wk=E.weekendRange(); const weekend=up.filter(e=>e.startD>=wk.fri && e.startD<wk.end).sort((a,b)=>E.score(b)-E.score(a));
  const cats=E.CATS().filter(c=>!c.hidden);
  const countCat = c => c.id==="free" ? up.filter(e=>e.isFree).length : up.filter(e=>e.cat===c.id).length;
  const recs=recommend(8);
  const deals=(window.EVENTLY_DEALS||[]).map(R.dealResolve).filter(d=>d && !d.expired).slice(0,3);
  const venues=new Set(up.map(e=>e.venue)).size;
  app.innerHTML = `
  <section class="hero"><canvas id="heroCv" aria-hidden="true"></canvas><div class="wrap">
    <span class="eyebrow" style="color:#fdba74">Kampala · Entebbe · Jinja · Mbarara · and beyond</span>
    <h1>Your next experience <em>starts here.</em></h1>
    <p class="hero-sub">Concerts, parties, bar nights, festivals and comedy across Uganda. Find what's on today, this weekend and in the weeks ahead.</p>
    ${searchBox("heroSearch")}
    <div class="chips"><a class="chip" href="#discover-today">Tonight</a><a class="chip" href="#weekend">This weekend</a><a class="chip" href="#nightlife-in-kampala">Nightlife</a><a class="chip" href="#concerts-in-uganda">Concerts</a><a class="chip" href="#free-events-in-uganda">Free</a></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="#discover">Discover events</a><a class="btn" style="background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)" href="#organizers">List your event</a></div>
    <div class="hero-stats"><span><b>${up.length}</b>upcoming events</span><span><b>${venues}</b>venues</span><span><b>${weekend.length}</b>this weekend</span></div>
  </div></section>
  <div class="wrap">
    <section class="section"><div class="sec-head"><div><span class="eyebrow">Featured</span><h2>Big nights ahead</h2></div><a class="link" href="#discover">See all events</a></div>
      <div class="grid big">${featured.map(e=>E.card(e,{src:"home-featured"})).join("")}</div></section>
    <section class="section">${recs.length ? `<div class="sec-head"><div><span class="eyebrow">Evently Match</span><h2>Recommended for you</h2></div><button class="link" style="border:0;background:none" id="editInts">Edit interests</button></div>
        <div class="rail">${recs.map(r=>`<div style="display:grid;gap:6px">${E.card(r.e,{src:"home-match"})}<span class="tiny muted">Because: ${esc(r.why.join(", "))}</span></div>`).join("")}</div>`
      : `<div class="panel" style="grid-template-columns:1fr auto;align-items:center;gap:18px"><div style="display:grid;gap:6px"><span class="eyebrow">Evently Match</span><h3>Get events picked for you</h3><p class="muted small">Choose a few interests and we'll recommend events here, based on what you like, where you are and what you save.</p></div><button class="btn btn-primary" id="editInts">Choose interests</button></div>`}</section>
    <section class="section"><div class="sec-head"><div><span class="eyebrow">Evently Radar</span><h2>Trending this week</h2></div><a class="link" href="#radar">How trending works</a></div>
      <div class="rail">${tr.map((x,i)=>E.card(x.e,{rank:i+1,src:"home-trending"})).join("")}</div></section>
    <section class="section"><div class="sec-head"><div><span class="eyebrow">${E.fDate(wk.fri)} to ${E.fDate(wk.sun)}</span><h2>This weekend</h2></div><a class="link" href="#weekend">Plan your weekend</a></div>
      ${weekend.length? `<div class="grid">${weekend.slice(0,8).map(e=>E.card(e,{src:"home-weekend"})).join("")}</div>` : E.empty("Quiet weekend so far","No events are listed for this weekend yet. Check upcoming events or list your own.",`<a class="btn btn-primary" href="#discover">Browse upcoming</a>`)}</section>
    <section class="section"><div class="sec-head"><div><span class="eyebrow">Explore</span><h2>Categories</h2></div><a class="link" href="#categories">All categories</a></div>
      <div class="cats">${cats.map(c=>`<a class="cat" href="#category-${c.id}">${I.cats[c.id]||I.cats.other}<div><b>${esc(c.name)}</b><br><small>${countCat(c)} upcoming</small></div></a>`).join("")}</div></section>
    <section class="section"><div class="sec-head"><div><span class="eyebrow">Evently Deals</span><h2>Offers and free nights</h2></div><a class="link" href="#deals">All deals</a></div>
      <div class="grid big">${deals.map(R.dealCard).join("")}</div></section>
    <section class="section"><div class="panel" style="background:var(--ink);color:var(--bg);border:0;grid-template-columns:1fr auto;align-items:center;padding:28px">
      <div style="display:grid;gap:8px"><span class="eyebrow" style="color:var(--accent)">For organizers</span><h2>Put your event in front of Kampala</h2><p style="opacity:.8;max-width:56ch">List events for free, share a poster in one tap and see how many people viewed, saved and planned to attend.</p></div>
      <a class="btn btn-primary" href="#organizers">Submit an event</a></div></section>
  </div>`;
  bindSearch($("#heroSearch"), q=>{ R.discoverState.q=q; location.hash="discover"; });
  $("#editInts").onclick=()=>interestsModal(()=>R.render());
  startHero();
};
function startHero(){
  const cv=$("#heroCv"); if(!cv) return; const ctx=cv.getContext("2d"); const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rs=()=>{ const r=cv.getBoundingClientRect(); cv.width=r.width*devicePixelRatio; cv.height=r.height*devicePixelRatio; };
  rs(); const src=[{x:.82,y:.3},{x:.68,y:.78},{x:.95,y:.75}];
  let t0=performance.now();
  const draw=t=>{ if(!document.body.contains(cv)) return; const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
    const k=Math.max(0,(t-t0)/1000);
    src.forEach((s,j)=>{ for(let i=0;i<7;i++){ const ph=((k*.35+i/7+j*.13)%1); const r=ph*Math.max(W,H)*.55; ctx.beginPath(); ctx.arc(s.x*W,s.y*H,r,0,Math.PI*2); ctx.strokeStyle=`rgba(249,115,22,${(1-ph)*.42})`; ctx.lineWidth=(2+j)*devicePixelRatio; ctx.stroke(); } ctx.beginPath(); ctx.arc(s.x*W,s.y*H,(6+j*3)*devicePixelRatio,0,Math.PI*2); ctx.fillStyle="#F97316"; ctx.fill(); });
    const gr=ctx.createLinearGradient(0,0,W*.75,0); gr.addColorStop(0,"rgba(17,16,16,.97)"); gr.addColorStop(.6,"rgba(17,16,16,.72)"); gr.addColorStop(1,"rgba(17,16,16,0)"); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
    if(!reduce) heroAnim=requestAnimationFrame(draw); };
  cancelAnimationFrame(heroAnim); heroAnim=requestAnimationFrame(draw);
  window.addEventListener("resize",rs,{once:true});
}

/* ---------- Discover ---------- */
R.discoverState = {q:"",cats:[],date:"any",from:"",to:"",loc:"",free:false,priceMax:"",trending:false,sort:"date",view:"grid",page:1,includePast:false};
try{ const v=localStorage.getItem("evently.view"); if(v) R.discoverState.view=v; }catch(e){}
function filterEvents(st){
  const now=Date.now(); const wk=E.weekendRange(); const tStart=E.kDayStart(new Date()).getTime();
  let list=E.events().filter(e=> st.includePast ? true : E.isActive(e) || E.status(e)==="postponed");
  if(st.q){ const q=st.q.toLowerCase(); list=list.filter(e=>[e.title,e.venue,e.organizer,e.area,e.city,e.desc,...(e.artists||[]),...(e.tags||[]),E.catName(e.cat)].join(" ").toLowerCase().includes(q)); }
  if(st.cats.length) list=list.filter(e=>st.cats.includes(e.cat) || (st.cats.includes("free")&&e.isFree));
  if(st.date==="today") list=list.filter(e=>e.startD.getTime()<tStart+E.DAY && e.endD.getTime()>now);
  if(st.date==="weekend") list=list.filter(e=>e.startD>=wk.fri && e.startD<wk.end);
  if(st.date==="week") list=list.filter(e=>e.startD.getTime()<now+7*E.DAY);
  if(st.date==="month") list=list.filter(e=>e.startD.getTime()<now+31*E.DAY);
  if(st.date==="custom"){ if(st.from) list=list.filter(e=>E.ymd(e.startD)>=st.from); if(st.to) list=list.filter(e=>E.ymd(e.startD)<=st.to); }
  if(st.loc) list=list.filter(e=>(e.area===st.loc)||(e.city===st.loc));
  if(st.free) list=list.filter(e=>e.isFree);
  if(st.tix) list=list.filter(e=>e.tickets&&E.safeUrl(e.tickets.url));
  if(st.priceMax) list=list.filter(e=>e.isFree || (e.priceFrom && e.priceFrom<=+st.priceMax));
  if(st.trending){ const top=new Set(E.trending(E.events()).slice(0,15).map(x=>x.e.slug)); list=list.filter(e=>top.has(e.slug)); }
  if(st.sort==="date") list.sort((a,b)=>a.startD-b.startD);
  if(st.sort==="popular") list.sort((a,b)=>E.score(b)-E.score(a));
  if(st.sort==="price") list.sort((a,b)=>(a.isFree?0:a.priceFrom||9e9)-(b.isFree?0:b.priceFrom||9e9));
  return list;
}
R.filterEvents = filterEvents;
const PER=12;
R.discover = function(app, preset){
  const st=R.discoverState;
  if(preset){ Object.assign(st,{q:"",cats:[],date:"any",loc:"",free:false,priceMax:"",trending:false,sort:"date",page:1},preset.state||{}); }
  const locs=[...new Set(E.events().filter(E.isActive).map(e=>e.area||e.city).filter(Boolean))].sort();
  const title = preset ? preset.h1 : "Discover events";
  E.setHead(preset? preset.title : "Discover events in Uganda | Evently", preset? preset.desc : "Browse every upcoming concert, party, bar night, festival and comedy show on Evently. Filter by date, category, location and price.");
  app.innerHTML=`<div class="wrap">
    <div class="page-head"><span class="eyebrow">${preset?esc(preset.eyebrow):"Event directory"}</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">${esc(title)}</h1>${preset?`<p class="muted">${esc(preset.intro)}</p>`:""}</div>
    <div style="margin:18px 0 24px">${searchBox("discSearch")}</div>
    <div class="disc">
      <aside class="filters" id="filters" data-collapsed="true" aria-label="Filters">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3>Filters</h3><div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" id="clearF">Clear filters</button><button class="btn btn-ghost btn-sm" id="toggleF" aria-expanded="false">Show</button></div></div>
        <div class="f-body" style="display:grid;gap:18px">
        <div class="f-group"><span class="lbl">Date</span><div class="chips">${[["any","Any time"],["today","Today"],["weekend","This weekend"],["week","Next 7 days"],["month","Next 30 days"],["custom","Pick dates"]].map(([v,l])=>`<button class="chip" data-date="${v}" aria-pressed="${st.date===v}">${l}</button>`).join("")}</div>
          <div class="form-grid" id="customDates" ${st.date==="custom"?"":"hidden"}><div class="field"><label for="fFrom">From</label><input class="input" type="date" id="fFrom" value="${st.from}"></div><div class="field"><label for="fTo">To</label><input class="input" type="date" id="fTo" value="${st.to}"></div></div></div>
        <div class="f-group"><span class="lbl">Category</span><div class="chips">${E.CATS().filter(c=>!c.hidden).map(c=>`<button class="chip" data-cat="${c.id}" aria-pressed="${st.cats.includes(c.id)}">${esc(c.name)}</button>`).join("")}</div></div>
        <div class="f-group"><label for="fLoc">Location</label><select class="input" id="fLoc"><option value="">Anywhere in Uganda</option>${locs.map(l=>`<option ${st.loc===l?"selected":""}>${esc(l)}</option>`).join("")}</select></div>
        <div class="f-group"><label for="fPrice">Price range</label><select class="input" id="fPrice"><option value="">Any price</option>${[[20000,"Up to UGX 20,000"],[50000,"Up to UGX 50,000"],[100000,"Up to UGX 100,000"],[200000,"Up to UGX 200,000"]].map(([v,l])=>`<option value="${v}" ${+st.priceMax===v?"selected":""}>${l}</option>`).join("")}</select><span class="tiny muted">Uses the starting price organizers list. Events with no listed price are hidden when you set a range.</span></div>
        <label class="check"><input type="checkbox" id="fFree" ${st.free?"checked":""}> Free events only</label>
        <label class="check"><input type="checkbox" id="fTix" ${st.tix?"checked":""}> Tickets sold online</label>
        <label class="check"><input type="checkbox" id="fTrend" ${st.trending?"checked":""}> Trending events only</label>
        <label class="check"><input type="checkbox" id="fPast" ${st.includePast?"checked":""}> Include events that ended in the last day</label>
        </div>
      </aside>
      <div style="min-width:0">
        <div class="toolbar"><span class="muted" id="resCount"></span>
          <div style="display:flex;gap:10px;flex-wrap:wrap"><label class="sr" for="fSort">Sort</label><select class="input" id="fSort" style="width:auto;height:38px"><option value="date">Soonest first</option><option value="popular">Most popular</option><option value="price">Lowest price</option></select>
          <div class="seg" role="group" aria-label="Layout"><button data-view="grid" aria-pressed="${st.view==="grid"}">${I.grid}Grid</button><button data-view="list" aria-pressed="${st.view==="list"}">${I.list}List</button></div></div></div>
        <div id="activeF" class="chips" style="margin-bottom:14px"></div>
        <div id="results">${E.skeletonGrid(6)}</div>
        <div id="more" style="display:grid;place-items:center;padding:24px"></div>
      </div></div></div>`;
  $("#fSort").value=st.sort; $("#discSearch-in").value=st.q;
  const update=(resetPage=true)=>{ if(resetPage) st.page=1; draw(); };
  const draw=()=>{
    const list=filterEvents(st); const shown=list.slice(0,st.page*PER);
    $("#resCount").textContent = `${list.length} event${list.length===1?"":"s"}`;
    const act=[]; if(st.q) act.push(["q",`“${st.q}”`]); st.cats.forEach(c=>act.push(["cat:"+c,E.catName(c)])); if(st.date!=="any") act.push(["date",{today:"Today",weekend:"This weekend",week:"Next 7 days",month:"Next 30 days",custom:"Custom dates"}[st.date]]); if(st.loc) act.push(["loc",st.loc]); if(st.free) act.push(["free","Free"]); if(st.priceMax) act.push(["price","≤ "+E.ugx(st.priceMax)]); if(st.trending) act.push(["trending","Trending"]);
    $("#activeF").innerHTML=act.map(([k,l])=>`<button class="chip" data-rm="${esc(k)}" aria-label="Remove filter ${esc(l)}">${esc(l)} ✕</button>`).join("");
    $("#results").innerHTML = list.length ? (st.view==="grid" ? `<div class="grid">${shown.map(e=>E.card(e,{src:"discover"})).join("")}</div>` : `<div class="list">${shown.map(e=>E.row(e)).join("")}</div>`)
      : E.empty("No events match","Try fewer filters, another date range or a different search.",`<button class="btn btn-primary" id="clear2">Clear filters</button>`);
    $("#more").innerHTML = shown.length<list.length ? `<button class="btn btn-ghost" id="loadMore">Show more events (${list.length-shown.length} left)</button>` : (list.length? `<span class="small muted">You've reached the end.</span>`:"");
    const lm=$("#loadMore"); if(lm){ lm.onclick=()=>{st.page++;draw();}; if("IntersectionObserver" in window){ const io=new IntersectionObserver(en=>{ if(en[0].isIntersecting){ io.disconnect(); st.page++; draw(); } },{rootMargin:"200px"}); io.observe(lm); } }
    const c2=$("#clear2"); if(c2) c2.onclick=clear;
  };
  const clear=()=>{ Object.assign(st,{q:"",cats:[],date:"any",from:"",to:"",loc:"",free:false,priceMax:"",trending:false,includePast:false,tix:false}); R.discover(app); };
  app.onclick=e=>{
    const d=e.target.closest("[data-date]"); if(d){ st.date=d.dataset.date; $$("[data-date]").forEach(b=>b.setAttribute("aria-pressed",b===d)); $("#customDates").hidden=st.date!=="custom"; update(); }
    const c=e.target.closest("[data-cat]"); if(c){ const id=c.dataset.cat; st.cats=st.cats.includes(id)?st.cats.filter(x=>x!==id):[...st.cats,id]; c.setAttribute("aria-pressed",st.cats.includes(id)); update(); }
    const v=e.target.closest("[data-view]"); if(v){ st.view=v.dataset.view; try{localStorage.setItem("evently.view",st.view)}catch(_){}; $$("[data-view]").forEach(b=>b.setAttribute("aria-pressed",b===v)); draw(); }
    const rm=e.target.closest("[data-rm]"); if(rm){ const k=rm.dataset.rm; if(k==="q"){st.q="";$("#discSearch-in").value="";} else if(k.startsWith("cat:")) st.cats=st.cats.filter(x=>x!==k.slice(4)); else if(k==="date") st.date="any"; else if(k==="loc") st.loc=""; else if(k==="free") st.free=false; else if(k==="price") st.priceMax=""; else if(k==="trending") st.trending=false; R.discover(app); }
  };
  $("#clearF").onclick=clear;
  $("#toggleF").onclick=()=>{ const f=$("#filters"); const c=f.dataset.collapsed==="true"; f.dataset.collapsed=String(!c); $("#toggleF").textContent=c?"Hide":"Show"; $("#toggleF").setAttribute("aria-expanded",String(c)); };
  $("#fLoc").onchange=e=>{st.loc=e.target.value;update();};
  $("#fPrice").onchange=e=>{st.priceMax=e.target.value;update();};
  $("#fFree").onchange=e=>{st.free=e.target.checked;update();};
  $("#fTix").onchange=e=>{st.tix=e.target.checked;update();};
  $("#fTrend").onchange=e=>{st.trending=e.target.checked;update();};
  $("#fPast").onchange=e=>{st.includePast=e.target.checked;update();};
  $("#fSort").onchange=e=>{st.sort=e.target.value;update();};
  $("#fFrom").onchange=e=>{st.from=e.target.value;update();};
  $("#fTo").onchange=e=>{st.to=e.target.value;update();};
  bindSearch($("#discSearch"), q=>{ st.q=q.trim(); if(st.q){ S.searches.unshift({q:st.q,t:Date.now()}); S.searches=S.searches.slice(0,200); E.persist(); } update(); });
  setTimeout(draw, 120);
};

/* ---------- SEO guide pages ---------- */
R.GUIDES = {
  "events-in-uganda":{eyebrow:"Guide",h1:"Events in Uganda",title:"Events in Uganda: concerts, parties and festivals | Evently",desc:"Every upcoming event in Uganda on Evently, from Kampala concerts to festivals in Jinja and nights out in Mbarara.",intro:"Every upcoming event on Evently across Uganda, soonest first. Use the filters to narrow it down.",state:{}},
  "events-in-kampala":{eyebrow:"Guide",h1:"Events in Kampala",title:"Events in Kampala this week and beyond | Evently",desc:"Concerts, bar nights, brunches, comedy and festivals happening in Kampala.",intro:"What's on in Kampala, from Lugogo concerts to Kololo brunches and Bukoto bar nights.",state:{q:"Kampala"}},
  "concerts-in-uganda":{eyebrow:"Guide",h1:"Concerts in Uganda",title:"Concerts in Uganda: upcoming live shows | Evently",desc:"Upcoming concerts in Uganda: headliners, album nights and live bands in Kampala and beyond.",intro:"Headliners, homegrown legends and live bands. Starting prices are shown where organizers list them.",state:{cats:["concerts"]}},
  "free-events-in-uganda":{eyebrow:"Guide",h1:"Free events in Uganda",title:"Free events in Uganda | Evently",desc:"Free-entry events in Uganda: bar nights, art openings, comedy and concerts with no cover charge.",intro:"Events listed with free entry. Venues may still charge for food and drinks.",state:{free:true}},
  "nightlife-in-kampala":{eyebrow:"Guide",h1:"Nightlife in Kampala",title:"Nightlife in Kampala: bar nights and parties | Evently",desc:"Kampala nightlife: weekly bar nights, lounges, raves, DJ sets and parties in Kololo, Bugolobi, Bukoto and beyond.",intro:"Weekly bar nights, lounge sessions, raves and parties. Weekly nights show their next date.",state:{cats:["nightlife"]}},
  "discover-today":{eyebrow:"Today",h1:"What's on today",title:"Events today in Uganda | Evently",desc:"Events happening today in Kampala and across Uganda.",intro:"Events starting or still running today, in East Africa Time.",state:{date:"today"}}
};

/* ---------- Event page ---------- */
R.event = function(app, slug, src){
  const ev=E.bySlug(slug);
  if(!ev){ app.innerHTML=`<div class="wrap section">${E.empty("We couldn't find that event","It may have been removed by its organizer or an administrator.",`<a class="btn btn-primary" href="#discover">Browse events</a>`)}</div>`; E.setHead("Event not found | Evently","This event is not available."); return; }
  if(ev.removed){ app.innerHTML=`<div class="wrap section">${E.empty("This event was removed","An administrator removed this listing. Browse other events instead.",`<a class="btn btn-primary" href="#discover">Browse events</a>`)}</div>`; return; }
  E.trackView(slug, src);
  const st=E.status(ev), c=E.counts(ev), u=E.me(), att=E.attendState(slug);
  const mapQ=encodeURIComponent(ev.venue+", "+(ev.city||"Uganda"));
  const related=E.events().filter(e=>e.slug!==slug && E.isActive(e) && (e.cat===ev.cat || e.venue===ev.venue)).sort((a,b)=>a.startD-b.startD).slice(0,4);
  const media=S.media.filter(m=>m.slug===slug && m.status==="approved");
  const promo=(ev.promo||[]).map(id=>({url:E.mediaURL(id),type:"image"})).filter(x=>x.url).concat((ev.videoIds||[]).map(id=>({url:E.mediaURL(id),type:"video"})).filter(x=>x.url));
  const gallery=promo.concat(media.map(m=>({url:E.mediaURL(m.blob),type:m.type}))).filter(x=>x.url);
  const pub=S.users.filter(x=>x.publicAttendance && (S.attend[x.id]||{})[slug]);
  const ld={"@context":"https://schema.org","@type":"Event",name:ev.title,startDate:ev.startD.toISOString(),endDate:ev.endD.toISOString(),
    eventStatus:"https://schema.org/"+({cancelled:"EventCancelled",postponed:"EventPostponed"}[st]||"EventScheduled"),eventAttendanceMode:"https://schema.org/OfflineEventAttendanceMode",
    location:{"@type":"Place",name:ev.venue,address:{"@type":"PostalAddress",addressLocality:ev.city||"",addressCountry:"UG"}},description:ev.desc,url:E.eventURL(slug),image:[`${E.SITE}/og/${slug}.png`],
    organizer:{"@type":"Organization",name:ev.organizer||"Not stated"}};
  if(ev.price && (ev.price.from||ev.price.free)) ld.offers={"@type":"Offer",price:ev.price.free?0:ev.price.from,priceCurrency:"UGX",url:(ev.tickets&&E.safeUrl(ev.tickets.url))||E.safeUrl(ev.booking)||E.eventURL(slug)};
  E.setHead(`${ev.title}, ${E.fDate(ev.startD)} at ${ev.venue} | Evently`, `${ev.title} at ${ev.venue}${ev.city?", "+ev.city:""} on ${E.fDateLong(ev.startD)}. ${E.priceText(ev)}. ${ev.desc}`.slice(0,300), ld);
  const banner = st==="live" ? `<div class="status-banner live">${I.bolt} Happening now. Ends around ${E.fTime(ev.endD)}.</div>`
    : st==="completed" ? `<div class="status-banner done">${I.check} Event completed on ${E.fDateLong(ev.startD)}.${E.isArchived(ev)?" It no longer appears in listings.":" It leaves the listings one day after it ends."} ${ev.community||ev.owner?`<a class="link" href="#gallery-${slug}">See the Aftermovie gallery</a>`:""}</div>`
    : st==="cancelled" ? `<div class="status-banner bad">${I.x} This event has been cancelled. ${esc(ev.statusNote||"")}</div>`
    : st==="postponed" ? `<div class="status-banner warn">${I.clock} ${esc(ev.statusNote||"This event has been postponed.")}</div>` : "";
  const srcs=(ev.sources||[]).filter(s=>E.safeUrl(s.url));
  app.innerHTML=`<div class="wrap">
    <nav class="small muted" style="padding-top:20px"><a class="link" href="#discover">Discover</a> / <a class="link" href="#category-${ev.cat}">${esc(E.catName(ev.cat))}</a></nav>
    <div class="ev-hero">
      <div class="ev-poster"><div class="poster">${E.posterHTML(ev,{full:true})}</div>${E.posterSrc(ev)&&!ev.posterId&&ev.sources&&ev.sources[0]?`<div class="small muted" style="padding:8px 12px">Poster: event organiser, via ${esc(ev.sources[0].name)}</div>`:""}</div>
      <div class="ev-info">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="pill neutral">${esc(E.statusLabel(st))}</span><span class="cat-tag">${esc(E.catName(ev.cat))}</span>${ev.isRecurring?`<span class="pill neutral">Weekly</span>`:""}${E.verifyBadge(ev.verify)}</div>
        <h1 style="font-size:clamp(2rem,4.6vw,3.4rem)">${esc(ev.title)}</h1>
        ${banner}
        <div class="ev-facts">
          <div class="fact"><span class="ic">${I.cal}</span><div><b>${esc(E.fDateLong(ev.startD))}</b><div class="small muted">${ev.isRecurring?"Every "+E.fmt(ev.startD,{weekday:"long"})+". Next date shown. ":""}${E.fmt(ev.endD,{day:"numeric"})!==E.fmt(ev.startD,{day:"numeric"})&&!ev.endAssumed?"Until "+esc(E.fDateLong(ev.endD)):""}</div></div></div>
          <div class="fact"><span class="ic">${I.clock}</span><div><b>${esc(E.timeLabel(ev))}</b><div class="small muted">East Africa Time${ev.endAssumed?". End time not listed":", ends "+esc(E.fTime(ev.endD))}</div></div></div>
          <div class="fact"><span class="ic">${I.pin}</span><div><b>${esc(ev.venue)}</b><div class="small muted">${esc([ev.area!==ev.city?ev.area:"",ev.city].filter(Boolean).join(", "))} · <a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${mapQ}">Open in Maps</a></div></div></div>
          <div class="fact"><span class="ic">${I.star}</span><div><b>${esc(E.priceText(ev))}</b><div class="small muted">${esc(ev.price&&ev.price.note||"Price information from the organizer. Evently does not sell tickets.")}</div></div></div>
        </div>
        ${st==="upcoming"?`<div class="countdown" data-bigcd="${slug}" aria-label="Countdown">${["Days","Hours","Minutes","Seconds"].map(l=>`<div><b>00</b><span>${l}</span></div>`).join("")}</div>`:""}
        <div class="counts"><span><b data-ct="interested">${c.interested}</b>Interested</span><span><b data-ct="going">${c.going}</b>Attending</span><span><b>${c.saves}</b>Saves</span><span><b>${c.shares}</b>Shares</span></div>
        ${S.settings.baseline && ev.base ? `<p class="tiny muted">Counts include a demo engagement baseline until Evently's live database is connected. <a class="link" href="#radar">How this works</a></p>`:""}
        <div class="actions">
          ${E.isActive(ev)||st==="postponed" ? `<button class="btn ${att==="interested"?"btn-dark":"btn-ghost"}" data-attend="interested" aria-pressed="${att==="interested"}">${I.star} ${att==="interested"?"Interested":"I'm interested"}</button>
          <button class="btn ${att==="going"?"btn-dark":"btn-primary"}" data-attend="going" aria-pressed="${att==="going"}">${I.check} ${att==="going"?"You're attending":"I'm attending"}</button>`:""}
          <button class="btn btn-ghost" data-save="${slug}" aria-pressed="${E.isSaved(slug)}">${E.isSaved(slug)?I.heartF+" Saved":I.heart+" Save"}</button>
          <button class="btn btn-ghost" id="shareBtn">${I.share} Share</button>
          <a class="btn btn-ghost" href="#poster-${slug}">${I.img} Make a poster</a>
        </div>
        ${att?`<label class="check small"><input type="checkbox" id="pubAtt" ${u&&u.publicAttendance?"checked":""}> Show my attendance publicly on event pages</label>`:""}
        ${ev.tickets&&E.safeUrl(ev.tickets.url)&&E.isActive(ev)?`<a class="btn btn-primary" target="_blank" rel="noopener" href="${E.safeUrl(ev.tickets.url)}" data-tix="${esc(slug)}">${I.ext} Buy tickets on ${esc(ev.tickets.site||E.hostOf(ev.tickets.url))}</a>${ev.tickets.note?`<p class="tiny muted" style="margin-top:-8px">${esc(ev.tickets.note)}</p>`:""}`:""}${ev.ticketsNote&&E.isActive(ev)?`<p class="small" style="margin:0"><b>Tickets:</b> ${esc(ev.ticketsNote)}</p>`:""}${E.safeUrl(ev.booking)?`<a class="btn btn-dark" target="_blank" rel="noopener" href="${E.safeUrl(ev.booking)}">${I.ext} Official event and booking page</a><p class="tiny muted" style="margin-top:-8px">Links open the organizer's or ticket seller's own site. Evently does not sell tickets or take payments.</p>`:""}
      </div>
    </div>
    <div class="two-col">
      <div style="display:grid;gap:28px;min-width:0">
        <section class="prose"><h2>About this event</h2><p>${esc(ev.desc)}</p>${(ev.artists||[]).length?`<h3>Lineup</h3><div class="chips">${ev.artists.map(a=>`<span class="chip">${esc(a)}</span>`).join("")}</div>`:""}</section>
        <section style="display:grid;gap:12px"><div class="sec-head" style="margin:0"><h2>Gallery</h2>${st==="completed"&&(ev.community||ev.owner)?`<a class="link" href="#gallery-${slug}">Open Aftermovie</a>`:""}</div>
          ${gallery.length?`<div class="gallery">${gallery.map((g,i)=>`<button data-view-media="${i}" aria-label="Open media ${i+1}">${g.type==="video"?`<video src="${g.url}" muted playsinline></video>`:`<img src="${g.url}" alt="" loading="lazy">`}</button>`).join("")}</div>`
          : `<div class="empty" style="padding:28px"><p>No photos yet. ${st==="completed"&&ev.community?"Were you there? Add your photos in the Aftermovie gallery.":"Organizers can add promotional photos and videos from their dashboard."}</p></div>`}</section>
        ${pub.length?`<section style="display:grid;gap:12px"><h2>Who's going</h2><div class="chips">${pub.map(p=>`<span class="chip">${p.avatar&&E.mediaURL(p.avatar)?`<img src="${E.mediaURL(p.avatar)}" alt="" style="width:22px;height:22px;border-radius:50%;object-fit:cover">`:I.user}${esc(p.name)}</span>`).join("")}</div><p class="tiny muted">Only people who chose to show their attendance publicly appear here.</p></section>`:""}
      </div>
      <aside style="display:grid;gap:16px">
        <div class="panel"><h3>Organizer</h3><div style="display:flex;gap:12px;align-items:center"><span class="ic" style="width:44px;height:44px;border-radius:50%;background:var(--accent);color:#111;display:grid;place-items:center;font:800 1.1rem var(--f-display)">${esc((ev.organizer||"?").replace(/^not stated.*/i,"?")[0])}</span><div><b>${esc(ev.organizer||"Not stated")}</b><div class="small muted">${ev.owner?"Verified Evently organizer account":"Taken from the public listing"}</div></div></div>
          ${ev.contact?`<div class="small"><b>Contact</b><br><span style="user-select:all">${esc(ev.contact)}</span></div>`:`<p class="small muted">No direct contact published. Use the official listing below.</p>`}
          ${E.safeUrl(ev.website)?`<a class="link small" target="_blank" rel="noopener" href="${E.safeUrl(ev.website)}">Organizer website</a>`:""}</div>
        <div class="panel"><h3>Where the information comes from</h3>
          ${srcs.length?srcs.map(s=>`<a class="link small" style="overflow-wrap:anywhere" target="_blank" rel="noopener" href="${E.safeUrl(s.url)}">${esc(s.name)} ${I.ext.replace('<svg','<svg style="width:12px;height:12px"')}</a>`).join(""):`<p class="small muted">${ev.verify==="demo"?"This is demo content created to test Evently. It is not a real event.":"Submitted by the organizer and approved by Evently moderators."}</p>`}
          ${ev.verify!=="demo"&&srcs.length?`<p class="tiny muted">Checked on ${esc(window.EVENTLY_CHECKED)}. Details can change, so confirm with the organizer before you travel.</p>`:""}
          <button class="btn btn-ghost btn-sm" id="reportBtn" style="justify-self:start">${I.flag} Report a problem</button></div>
        <div class="panel"><h3>Share on WhatsApp</h3><p class="small muted">Send the date, venue and link to your group in one tap.</p><a class="btn btn-primary" id="waBtn" target="_blank" rel="noopener" href="${waLink(ev)}">${I.wa} Share to WhatsApp</a></div>
      </aside>
    </div>
    ${related.length?`<section class="section"><div class="sec-head"><div><span class="eyebrow">You might also like</span><h2>Related events</h2></div></div><div class="grid">${related.map(e=>E.card(e,{src:"related"})).join("")}</div></section>`:""}
  </div>`;
  app.onclick=e=>{
    const a=e.target.closest("[data-attend]"); if(a){ if(!requireLogin("mark your attendance")) return; const k=a.dataset.attend; const m=S.attend[S.session]=S.attend[S.session]||{}; if(m[slug]===k){ delete m[slug]; E.toast(k==="going"?"Attendance cancelled":"Removed from interested"); } else { m[slug]=k; E.toast(k==="going"?"You're attending. We'll remind you before it starts.":"Marked as interested"); } E.persist(); R.event(app,slug,"internal"); return; }
    const mv=e.target.closest("[data-view-media]"); if(mv){ viewer(gallery,+mv.dataset.viewMedia); }
  };
  const pa=$("#pubAtt"); if(pa) pa.onchange=()=>{ const uu=E.me(); if(uu){ uu.publicAttendance=pa.checked; E.persist(); E.toast(pa.checked?"Your attendance is public":"Your attendance is private"); R.event(app,slug,"internal"); } };
  $("#shareBtn").onclick=()=>shareModal(ev);
  $("#waBtn").addEventListener("click",()=>E.trackShare(slug,"whatsapp"));
  $("#reportBtn").onclick=()=>reportModal(ev);
};
function waLink(ev){ const t=`${ev.title}\n${E.fDate(ev.startD)}, ${E.fTime(ev.startD)}\n${ev.venue}${ev.city?", "+ev.city:""}\n${E.eventURL(ev.slug)}`; return "https://wa.me/?text="+encodeURIComponent(t); }
R.waLink=waLink;
function shareModal(ev){
  const url=E.eventURL(ev.slug), t=encodeURIComponent(ev.title+" on Evently"), u=encodeURIComponent(url);
  const m=E.modal(`<div class="modal-head"><h3>Share this event</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
   <div style="display:grid;gap:10px">
    <a class="btn btn-primary" data-ch="whatsapp" target="_blank" rel="noopener" href="${waLink(ev)}">${I.wa} WhatsApp</a>
    <a class="btn btn-ghost" data-ch="x" target="_blank" rel="noopener" href="https://x.com/intent/post?text=${t}&url=${u}">Post on X</a>
    <a class="btn btn-ghost" data-ch="facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${u}">Share on Facebook</a>
    <button class="btn btn-ghost" data-ch="copy">${I.link} Copy link</button>
    <a class="btn btn-ghost" href="#poster-${ev.slug}" data-close>${I.img} Make a shareable poster</a></div>
   <p class="small muted" style="overflow-wrap:anywhere">${esc(url)}</p>`);
  m.addEventListener("click",e=>{ const b=e.target.closest("[data-ch]"); if(!b) return; E.trackShare(ev.slug,b.dataset.ch); if(b.dataset.ch==="copy") E.copyText(url); });
}
R.shareModal=shareModal;
function reportModal(ev){
  const m=E.modal(`<div class="modal-head"><h3>Report a problem</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
    <form id="repF" style="display:grid;gap:12px"><div class="field"><label for="repR">What's wrong?</label><select class="input" id="repR" required><option value="">Choose a reason</option><option>Wrong date or time</option><option>Wrong venue</option><option>Event is cancelled</option><option>Spam or fake event</option><option>Inappropriate content</option><option>Other</option></select></div>
    <div class="field"><label for="repT">Details (optional)</label><textarea class="input" id="repT" maxlength="500"></textarea></div><span class="err" id="repE"></span>
    <button class="btn btn-primary">Send report</button></form>`);
  $("#repF",m).onsubmit=e=>{ e.preventDefault(); const r=$("#repR",m).value; if(!r){ $("#repE",m).textContent="Choose a reason."; return; } const recent=S.reports.filter(x=>x.by===E.viewerId() && Date.now()-x.t<10*60e3).length; if(recent>=3){ $("#repE",m).textContent="You've sent several reports in the last few minutes. Try again later."; return; }
    S.reports.unshift({id:"r"+Date.now(),t:Date.now(),slug:ev.slug,reason:r,text:$("#repT",m).value.trim(),by:E.viewerId(),state:"open",type:"report"}); E.persist(); E.closeModal(); E.toast("Thanks. A moderator will review it."); };
}
function viewer(items, i){
  const v=document.createElement("div"); v.className="viewer"; const show=()=>{ const it=items[i]; v.innerHTML=`<button class="icon-btn" aria-label="Close">${I.x}</button>${it.type==="video"?`<video src="${it.url}" controls autoplay playsinline></video>`:`<img src="${it.url}" alt="">`}${items.length>1?`<div style="position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 20px);display:flex;gap:10px"><button class="btn btn-ghost" data-p>Previous</button><span style="color:#fff;align-self:center">${i+1} / ${items.length}</span><button class="btn btn-ghost" data-n>Next</button></div>`:""}`; };
  show(); v.addEventListener("click",e=>{ if(e.target.closest("[data-p]")){i=(i-1+items.length)%items.length;show();} else if(e.target.closest("[data-n]")){i=(i+1)%items.length;show();} else if(e.target.closest(".icon-btn")||e.target===v) v.remove(); });
  document.body.appendChild(v); try{ v.requestFullscreen && v.requestFullscreen().catch(()=>{}); }catch(e){}
}
R.viewer=viewer;
function requireLogin(what){ if(E.me()) return true; R.authModal("login", `Sign in to ${what}.`); return false; }
R.requireLogin=requireLogin;

/* ---------- Weekend planner ---------- */
R.weekendState={budget:"",types:[],loc:""};
R.weekend = function(app){
  const wk=E.weekendRange(); const st=R.weekendState;
  E.setHead(`Events this weekend in Uganda, ${E.fDate(wk.fri)} to ${E.fDate(wk.sun)} | Evently`,"Plan your weekend: Friday, Saturday and Sunday events in Kampala and across Uganda, filtered by budget and type.");
  let all=E.events().filter(e=>e.startD>=wk.fri && e.startD<wk.end && (E.isActive(e)||E.status(e)==="postponed"));
  const locs=[...new Set(all.map(e=>e.area||e.city))].sort();
  let list=all.filter(e=>(!st.types.length||st.types.includes(e.cat)) && (!st.loc||(e.area||e.city)===st.loc) && (!st.budget || e.isFree || (st.budget!=="0" && e.priceFrom && e.priceFrom<=+st.budget)));
  const day=d=>list.filter(e=>e.startD>=d && e.startD<new Date(d.getTime()+E.DAY)).sort((a,b)=>a.startD-b.startD);
  const plan=S.plan.map(E.bySlug).filter(e=>e && e.startD>=wk.fri && e.startD<wk.end).sort((a,b)=>a.startD-b.startD);
  const free=list.filter(e=>e.isFree), pop=[...list].sort((a,b)=>E.score(b)-E.score(a)).slice(0,4);
  const byLoc={}; list.forEach(e=>{ const k=e.area||e.city; byLoc[k]=(byLoc[k]||0)+1; });
  const byCat={}; list.forEach(e=>{ byCat[e.cat]=(byCat[e.cat]||0)+1; });
  const slot=e=>`<div class="slot"><time>${E.fTime(e.startD).replace(":00","")}</time><div><a href="#event-${e.slug}" data-src="weekend">${esc(e.title)}</a><span class="small muted">${esc(e.venue)} · ${esc(E.priceText(e))}</span>${E.status(e)==="postponed"?`<span class="pill cancelled">Postponed</span>`:""}<button class="btn btn-ghost btn-sm add" data-plan="${e.slug}" aria-pressed="${S.plan.includes(e.slug)}">${S.plan.includes(e.slug)?"In your plan":"Add to plan"}</button></div></div>`;
  app.innerHTML=`<div class="wrap">
    <div class="page-head"><span class="eyebrow">Evently Weekend Planner</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">This weekend: ${esc(E.fmt(wk.fri,{day:"numeric",month:"long"}))} to ${esc(E.fmt(wk.sun,{day:"numeric",month:"long"}))}</h1><p class="muted">${all.length} events from Friday to Sunday. Set a budget and the kind of night you want, then build a plan you can share.</p></div>
    <div class="panel" style="margin:20px 0;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));align-items:end">
      <div class="field"><label for="wBudget">Budget per event</label><select class="input" id="wBudget"><option value="">Any budget</option><option value="0">Free only</option><option value="20000">Up to UGX 20,000</option><option value="50000">Up to UGX 50,000</option><option value="100000">Up to UGX 100,000</option></select></div>
      <div class="field"><label for="wLoc">Area</label><select class="input" id="wLoc"><option value="">Everywhere</option>${locs.map(l=>`<option ${st.loc===l?"selected":""}>${esc(l)}</option>`).join("")}</select></div>
      <div class="field" style="grid-column:1/-1"><span class="small" style="font-weight:600">Event type</span><div class="chips">${E.CATS().filter(c=>!c.virtual&&!c.hidden).map(c=>`<button class="chip" data-wt="${c.id}" aria-pressed="${st.types.includes(c.id)}">${esc(c.name)}</button>`).join("")}</div></div>
    </div>
    <div class="days">${[["Friday",wk.fri],["Saturday",wk.sat],["Sunday",wk.sun]].map(([n,d])=>{ const l=day(d); return `<section class="day"><div class="day-head"><b>${n}</b><span class="mono small">${E.fmt(d,{day:"numeric",month:"short"})} · ${l.length}</span></div>${l.length?l.map(slot).join(""):`<p class="small muted" style="padding:16px">Nothing matches your filters on ${n}.</p>`}</section>`; }).join("")}</div>
    <div class="two-col section">
      <div style="display:grid;gap:28px;min-width:0">
        <section><div class="sec-head"><div><span class="eyebrow">Most popular</span><h2>Weekend favourites</h2></div></div><div class="grid">${pop.map(e=>E.card(e,{src:"weekend"})).join("")||"<p class='muted'>No events match.</p>"}</div></section>
        <section><div class="sec-head"><div><span class="eyebrow">No cover charge</span><h2>Free this weekend</h2></div></div>${free.length?`<div class="list">${free.map(e=>E.row(e,`<button class="btn btn-ghost btn-sm" data-plan="${e.slug}" aria-pressed="${S.plan.includes(e.slug)}">${S.plan.includes(e.slug)?"In your plan":"Add to plan"}</button>`)).join("")}</div>`:"<p class='muted'>No free events match your filters.</p>"}</section>
        <section class="form-grid"><div class="panel"><h3>By area</h3>${Object.entries(byLoc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<button class="chip" data-wloc="${esc(k)}" style="justify-content:space-between">${esc(k)} <b class="mono">${v}</b></button>`).join("")||"<p class='muted small'>None</p>"}</div>
          <div class="panel"><h3>By category</h3>${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<button class="chip" data-wt="${k}" style="justify-content:space-between">${esc(E.catName(k))} <b class="mono">${v}</b></button>`).join("")||"<p class='muted small'>None</p>"}</div></section>
      </div>
      <aside class="panel" style="position:sticky;top:calc(env(safe-area-inset-top,0px) + 80px)"><span class="eyebrow">Your itinerary</span><h3>My weekend plan</h3>
        ${plan.length?`<div class="itin">${plan.map((e,i)=>{ const prev=plan[i-1]; const clash=prev && e.startD<prev.endD && !prev.endAssumed; return `<div class="itin-item"><span class="mono small" style="color:var(--accent-ink)">${E.fmt(e.startD,{weekday:"short"})} ${E.fTime(e.startD)}</span><a class="link" style="color:inherit;font-weight:700" href="#event-${e.slug}">${esc(e.title)}</a><span class="small muted">${esc(e.venue)}</span>${clash?`<span class="small" style="color:var(--warn)">Overlaps with ${esc(prev.title)}</span>`:prev&&prev.area!==e.area&&E.fmt(prev.startD,{day:"numeric"})===E.fmt(e.startD,{day:"numeric"})?`<span class="tiny muted">Moving from ${esc(prev.area)} to ${esc(e.area)}. Allow time for traffic.</span>`:""}<button class="btn btn-ghost btn-sm" style="justify-self:start" data-plan="${e.slug}" aria-pressed="true">Remove</button></div>`; }).join("")}</div>
          <a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent("My weekend plan on Evently:\n"+plan.map(e=>`• ${E.fmt(e.startD,{weekday:"short"})} ${E.fTime(e.startD)}: ${e.title} @ ${e.venue} ${E.eventURL(e.slug)}`).join("\n"))}">${I.wa} Send plan on WhatsApp</a>
          <button class="btn btn-ghost" id="planSave">Save all to My Events</button>`
        : `<p class="small muted">Tap “Add to plan” on any event to build a Friday-to-Sunday itinerary. We'll flag overlaps and moves across town.</p>`}
      </aside></div></div>`;
  $("#wBudget").value=st.budget;
  $("#wBudget").onchange=e=>{st.budget=e.target.value;R.weekend(app);};
  $("#wLoc").onchange=e=>{st.loc=e.target.value;R.weekend(app);};
  app.onclick=e=>{
    const t=e.target.closest("[data-wt]"); if(t){ const id=t.dataset.wt; st.types=st.types.includes(id)?st.types.filter(x=>x!==id):[...st.types,id]; R.weekend(app); return; }
    const l=e.target.closest("[data-wloc]"); if(l){ st.loc=st.loc===l.dataset.wloc?"":l.dataset.wloc; R.weekend(app); return; }
    const p=e.target.closest("[data-plan]"); if(p){ const s=p.dataset.plan; S.plan=S.plan.includes(s)?S.plan.filter(x=>x!==s):[...S.plan,s]; E.persist(); R.weekend(app); }
  };
  const ps=$("#planSave"); if(ps) ps.onclick=()=>{ if(!requireLogin("save your plan")) return; const arr=S.saved[S.session]=S.saved[S.session]||[]; plan.forEach(e=>{ if(!arr.includes(e.slug)) arr.push(e.slug); }); E.persist(); E.toast("Plan saved to My Events"); };
};

/* ---------- Radar ---------- */
R.radarTab="trending";
R.radar = function(app){
  E.setHead("Evently Radar: trending events in Uganda | Evently","What Kampala is looking at right now: trending events, new announcements and the biggest upcoming concerts and festivals.");
  const evs=E.events(); const tr=E.trending(evs); const w=S.settings.weights;
  const tabs=[["trending","Trending"],["new","Newly added"],["week","Popular this week"],["rising","Rising"],["interest","Most interest"],["major","Major concerts and festivals"]];
  const now=Date.now();
  let list;
  switch(R.radarTab){
    case "new": list=[...evs.filter(E.isActive)].sort((a,b)=>(b.created||0)-(a.created||0) || window.EVENTLY_SEED.findIndex(s=>s.slug===b.slug)-window.EVENTLY_SEED.findIndex(s=>s.slug===a.slug)).slice(0,10).map(e=>({e,s:E.score(e)})); break;
    case "week": list=tr.filter(x=>x.e.startD.getTime()<now+7*E.DAY).slice(0,10); break;
    case "rising": list=evs.filter(E.isActive).map(e=>{ const c=E.counts(e); return {e,s:c.recent/(Math.max(1,c.views)/40)}; }).sort((a,b)=>b.s-a.s).slice(0,10); break;
    case "interest": list=evs.filter(E.isActive).map(e=>{ const c=E.counts(e); return {e,s:c.interested+c.going}; }).sort((a,b)=>b.s-a.s).slice(0,10); break;
    case "major": list=evs.filter(e=>E.isActive(e)&&["concerts","festivals"].includes(e.cat)).map(e=>({e,s:E.score(e)})).sort((a,b)=>b.s-a.s).slice(0,10); break;
    default: list=tr.slice(0,10);
  }
  const max=Math.max(1,...list.map(x=>x.s));
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Evently Radar</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">What Uganda is checking out</h1><p class="muted">Live-updating rankings from views, shares, saves and attendance interest. We never say an event is “selling out” unless the organizer confirms it.</p></div>
    <div class="radar-wrap section" style="padding-top:20px">
      <div style="display:grid;gap:16px"><div class="radar-scope"><canvas id="radarCv" width="760" height="760" aria-label="Radar of top trending events"></canvas></div>
        <div class="panel"><h3>How the score works</h3><p class="small muted">Each event's score is a weighted sum. Administrators can tune the weights.</p>
        <pre class="code" style="margin:0">score = views × ${w.views}
      + shares × ${w.shares}
      + saves × ${w.saves}
      + interested × ${w.interested}
      + attending × ${w.going}
      + recent activity × ${S.settings.recentBoost}
  (recent = last ${S.settings.recentDays} days)</pre>
        <p class="tiny muted">${S.settings.baseline?"Right now the counts include a demo baseline so the rankings look realistic before the live database is connected. Your own views, saves and shares on this device are added on top.":"Demo baseline is off. Rankings use only real activity recorded on Evently."}</p></div></div>
      <div style="min-width:0"><div class="tabs">${tabs.map(([k,l])=>`<button class="chip" data-rt="${k}" aria-pressed="${R.radarTab===k}">${l}</button>`).join("")}</div>
        <div>${list.length?list.map((x,i)=>`<div class="rank"><span class="n">${i+1}</span><a class="poster" href="#event-${x.e.slug}" data-src="radar" style="display:block">${E.posterHTML(x.e,{text:false})}</a><div><a class="link" style="color:inherit;font-weight:700" href="#event-${x.e.slug}" data-src="radar">${esc(x.e.title)}</a><div class="small muted">${esc(E.fDate(x.e.startD))} · ${esc(x.e.venue)}</div><div class="bar"><i style="width:${Math.max(4,Math.round(100*x.s/max))}%"></i></div></div><span class="sc mono small muted">${R.radarTab==="interest"?Math.round(x.s)+" people":R.radarTab==="rising"?"":Math.round(x.s).toLocaleString()+" pts"}</span></div>`).join(""):E.empty("Nothing on the radar yet","Activity appears here as people view, save and share events.")}</div></div>
    </div></div>`;
  app.onclick=e=>{ const t=e.target.closest("[data-rt]"); if(t){ R.radarTab=t.dataset.rt; R.radar(app); } };
  drawRadar(tr.slice(0,8));
};
function drawRadar(items){
  const cv=$("#radarCv"); if(!cv) return; const ctx=cv.getContext("2d"); const W=cv.width, C=W/2; const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pts=items.map((x,i)=>{ const a=(E.hash(x.e.slug)%360)*Math.PI/180; const r=C*(.18+.72*(1-x.pct/100)); return {a,r,x,i}; });
  let t0=performance.now();
  const draw=t=>{ if(!document.body.contains(cv)) return; const ang=((t-t0)/2600)%1*Math.PI*2; ctx.fillStyle="#111010"; ctx.fillRect(0,0,W,W);
    ctx.strokeStyle="rgba(249,115,22,.25)"; ctx.lineWidth=2; [1,2,3,4].forEach(k=>{ctx.beginPath();ctx.arc(C,C,C*k/4.3,0,Math.PI*2);ctx.stroke();}); ctx.beginPath(); ctx.moveTo(0,C);ctx.lineTo(W,C);ctx.moveTo(C,0);ctx.lineTo(C,W);ctx.stroke();
    const g=ctx.createConicGradient? ctx.createConicGradient(ang-0.9,C,C):null; if(g){ g.addColorStop(0,"rgba(249,115,22,0)"); g.addColorStop(.14,"rgba(249,115,22,.45)"); g.addColorStop(.1401,"rgba(249,115,22,0)"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(C,C,C*.93,0,Math.PI*2); ctx.fill(); }
    pts.forEach(p=>{ const x=C+Math.cos(p.a)*p.r, y=C+Math.sin(p.a)*p.r; let d=(ang-p.a)%(Math.PI*2); if(d<0) d+=Math.PI*2; const glow=Math.max(.35,1-d/(Math.PI*1.2)); ctx.beginPath(); ctx.arc(x,y,10+12*(p.x.pct/100),0,Math.PI*2); ctx.fillStyle=`rgba(249,115,22,${glow})`; ctx.fill(); ctx.fillStyle=`rgba(255,255,255,${Math.max(.5,glow)})`; ctx.font="600 22px Inter, sans-serif"; const lbl=(p.i+1)+". "+(p.x.e.title.length>22?p.x.e.title.slice(0,21)+"…":p.x.e.title); const tw=ctx.measureText(lbl).width; ctx.fillText(lbl, Math.min(Math.max(8,x+18), W-tw-8), y+7); });
    if(!reduce) requestAnimationFrame(draw); };
  requestAnimationFrame(draw);
}

/* ---------- Categories ---------- */
R.categories = function(app){
  E.setHead("Event categories | Evently","Browse concerts, nightlife, festivals, comedy, culture, sports, family, business, food and free events in Uganda.");
  const up=E.events().filter(E.isActive);
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Explore</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">Categories</h1></div>
    <div class="section" style="display:grid;gap:40px;grid-template-columns:minmax(0,1fr)">${E.CATS().filter(c=>!c.hidden).map(c=>{ const l=(c.id==="free"?up.filter(e=>e.isFree):up.filter(e=>e.cat===c.id)).sort((a,b)=>a.startD-b.startD); return `<section><div class="sec-head"><div style="grid-auto-flow:column;align-items:center;justify-content:start;gap:12px"><span style="width:44px;height:44px;color:var(--accent);display:block">${I.cats[c.id]||I.cats.other}</span><div style="display:grid;gap:4px"><h2>${esc(c.name)}</h2><span class="small muted">${esc(c.blurb||"")} · ${l.length} upcoming</span></div></div><a class="link" href="#category-${c.id}">See all</a></div>${l.length?`<div class="rail">${l.slice(0,8).map(e=>E.card(e,{src:"categories"})).join("")}</div>`:`<p class="muted small">No upcoming ${esc(c.name.toLowerCase())} yet.</p>`}</section>`; }).join("")}</div></div>`;
};
R.category = function(app, id){
  const c=E.CATS().find(x=>x.id===id); if(!c){ location.hash="categories"; return; }
  R.discover(app,{eyebrow:"Category",h1:c.name,title:`${c.name} in Uganda | Evently`,desc:`Upcoming ${c.name.toLowerCase()} in Kampala and across Uganda.`,intro:c.blurb||"",state:id==="free"?{free:true}:{cats:[id]}});
};
})();
