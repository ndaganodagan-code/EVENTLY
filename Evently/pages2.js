/* Evently pages part 2: near me, deals, accounts, my events, notifications, aftermovie, poster studio. */
(function(){
"use strict";
const E = window.EV; const {$,$$,esc,I,S} = E; const R = window.EVROUTES;

/* ---------- Near me ---------- */
R.nearState={city:"",lat:null,lng:null,km:10,label:"",sel:null,geoMsg:""};
const km=(a,b,c,d)=>{ const R0=6371, t=x=>x*Math.PI/180; const dl=t(c-a), dg=t(d-b); const h=Math.sin(dl/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dg/2)**2; return 2*R0*Math.asin(Math.sqrt(h)); };
R.near = function(app){
  const st=R.nearState; const u=E.me();
  if(!st.lat && u && u.city){ const c=window.EVENTLY_CITIES.find(x=>x.name.toLowerCase().includes(u.city.toLowerCase())||u.city.toLowerCase().includes(x.name.toLowerCase().split(" ")[0])); if(c){ Object.assign(st,{city:c.id,lat:c.lat,lng:c.lng,label:c.name}); } }
  E.setHead("Events near me in Uganda | Evently","Find events near you in Kampala, Entebbe, Jinja, Mbarara and across Uganda, on a map, filtered by distance.");
  const evs=E.events().filter(e=>E.isActive(e) && e.lat!=null);
  let list=evs.map(e=>({e,d:st.lat!=null?km(st.lat,st.lng,e.lat,e.lng):null}));
  if(st.lat!=null && st.km) list=list.filter(x=>x.d<=st.km);
  list.sort((a,b)=> st.lat!=null ? a.d-b.d : a.e.startD-b.e.startD);
  const noCoords=E.events().filter(e=>E.isActive(e)&&e.lat==null).length;
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Events near me</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">What's on around you</h1><p class="muted">Pick your area, or share your location for this visit only. Evently never asks for your precise location without your permission and doesn't store it.</p></div>
    <div style="margin:18px 0 22px">${E.fold("near","Area and distance",(st.lat!=null?1:0),`<div class="fold-row">
      <div class="field"><label for="nCity">Your city or area</label><select class="input" id="nCity"><option value="">Choose an area</option>${window.EVENTLY_CITIES.map(c=>`<option value="${c.id}" ${st.city===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="nKm">Distance</label><select class="input" id="nKm">${[[2,"Within 2 km"],[5,"Within 5 km"],[10,"Within 10 km"],[25,"Within 25 km"],[100,"Within 100 km"],[0,"Any distance"]].map(([v,l])=>`<option value="${v}" ${st.km===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <button class="btn btn-ghost" id="geoBtn">${I.pin} Use my current location</button>
      ${st.geoMsg?`<p class="small" style="grid-column:1/-1;color:var(--warn)">${esc(st.geoMsg)}</p>`:""}
</div><div class="qf-actions"><button type="button" class="btn btn-primary btn-sm" data-fold="near">Done</button></div>`)}</div>
    <div class="map-wrap">
      <div style="display:grid;gap:10px;min-width:0"><div class="map" id="map">${mapSVG(list.map(x=>x.e), st)}</div><p class="tiny muted">Pin positions are approximate venue locations. ${noCoords} listed events have no mapped location yet and are left off the map. Tap a pin to see the event.</p><div id="mapSel"></div></div>
      <div style="display:grid;gap:10px;align-content:start"><h3>${list.length} event${list.length===1?"":"s"} ${st.lat!=null?`near ${esc(st.label)}`:"on the map"}</h3>
        <div style="display:grid;gap:10px;max-height:640px;overflow:auto">${list.length?list.slice(0,40).map(x=>`<a href="#event-${x.e.slug}" data-src="near" class="panel" style="text-decoration:none;padding:12px;grid-template-columns:56px 1fr;gap:12px;align-items:center"><span class="poster" style="aspect-ratio:1;border-radius:10px;display:block">${E.posterHTML(x.e,{text:false})}</span><span style="display:grid;gap:2px;min-width:0"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.e.title)}</b><span class="small muted">${esc(E.fDate(x.e.startD))} · ${esc(x.e.area)}</span>${x.d!=null?`<span class="small" style="color:var(--accent-ink);font-weight:700">${x.d<1?Math.round(x.d*1000)+" m":x.d.toFixed(1)+" km"} away</span>`:""}</span></a>`).join(""):E.empty("Nothing within that distance","Widen the distance or pick another area.")}</div></div>
    </div></div>`;
  $("#nCity").onchange=e=>{ const c=window.EVENTLY_CITIES.find(x=>x.id===e.target.value); if(c) Object.assign(st,{city:c.id,lat:c.lat,lng:c.lng,label:c.name,geoMsg:""}); else Object.assign(st,{city:"",lat:null,lng:null,label:""}); R.near(app); };
  $("#nKm").onchange=e=>{ st.km=+e.target.value; R.near(app); };
  $("#geoBtn").onclick=()=>{
    if(!("geolocation" in navigator)){ st.geoMsg="Location isn't available in this browser. Choose your area instead."; R.near(app); return; }
    $("#geoBtn").textContent="Asking for permission…";
    navigator.geolocation.getCurrentPosition(p=>{ Object.assign(st,{city:"",lat:p.coords.latitude,lng:p.coords.longitude,label:"your location",geoMsg:""}); R.near(app); },
      ()=>{ st.geoMsg="We couldn't get your location (permission was denied or isn't available here). Choose your area from the list instead."; R.near(app); },{enableHighAccuracy:false,timeout:8000,maximumAge:600000});
  };
  $("#map").addEventListener("click",e=>{ const p=e.target.closest("[data-pin]"); if(p) showPin(p.dataset.pin); });
  $("#map").addEventListener("keydown",e=>{ const p=e.target.closest("[data-pin]"); if(p && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); showPin(p.dataset.pin); } });
  function showPin(slug){ const ev=E.bySlug(slug); const at=E.events().filter(x=>E.isActive(x)&&x.venue===ev.venue); $("#mapSel").innerHTML=`<div class="panel"><b>${esc(ev.venue)}</b>${at.map(x=>`<a class="link" href="#event-${x.slug}" data-src="near">${esc(x.title)} · ${esc(E.fDate(x.startD))}</a>`).join("")}</div>`; }
};
function mapSVG(evs, st){
  const W=800,H=600; const pts=evs.map(e=>[e.lat,e.lng]); if(st.lat!=null) pts.push([st.lat,st.lng]);
  if(!pts.length) pts.push([0.3136,32.5811]);
  let la=Math.min(...pts.map(p=>p[0])), lb=Math.max(...pts.map(p=>p[0])), ga=Math.min(...pts.map(p=>p[1])), gb=Math.max(...pts.map(p=>p[1]));
  const pad=Math.max(.01,(lb-la)*.15,(gb-ga)*.15); la-=pad; lb+=pad; ga-=pad; gb+=pad;
  const sx=W/(gb-ga), sy=H/(lb-la), s=Math.min(sx,sy); const ox=(W-(gb-ga)*s)/2, oy=(H-(lb-la)*s)/2;
  const P=(lat,lng)=>[ox+(lng-ga)*s, oy+(lb-lat)*s];
  let g=`<rect width="${W}" height="${H}" fill="var(--bg2)"/>`;
  for(let i=1;i<10;i++){ g+=`<path d="M${i*W/10} 0V${H}M0 ${i*H/10}H${W}" stroke="var(--line)" stroke-width="1"/>`; }
  window.EVENTLY_CITIES.forEach(c=>{ const [x,y]=P(c.lat,c.lng); if(x>-20&&x<W+20&&y>-20&&y<H+20) g+=`<text x="${x}" y="${y-14}" text-anchor="middle" font-size="15" font-weight="600" fill="var(--ink3)" font-family="Inter, sans-serif">${esc(c.name)}</text>`; });
  if(st.lat!=null && st.km){ const [x,y]=P(st.lat,st.lng); const r=st.km/111*s; g+=`<circle cx="${x}" cy="${y}" r="${r}" fill="var(--accent)" fill-opacity=".08" stroke="var(--accent)" stroke-dasharray="6 6"/>`; }
  const seen={}; evs.forEach(e=>{ const k=e.venue; if(seen[k]) { seen[k].n++; return; } seen[k]={e,n:1}; });
  Object.values(seen).forEach(({e,n})=>{ const [x,y]=P(e.lat,e.lng); g+=`<g class="pin" data-pin="${e.slug}" tabindex="0" role="button" aria-label="${esc(e.venue)}, ${n} event${n>1?"s":""}"><circle cx="${x}" cy="${y}" r="${n>1?15:11}" fill="#F97316" stroke="var(--bg)" stroke-width="3"/>${n>1?`<text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" font-weight="800" fill="#111010" font-family="Inter, sans-serif">${n}</text>`:""}</g>`; });
  if(st.lat!=null){ const [x,y]=P(st.lat,st.lng); g+=`<circle cx="${x}" cy="${y}" r="9" fill="var(--ink)" stroke="var(--bg)" stroke-width="3"/><text x="${x}" y="${y+28}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)" font-family="Inter, sans-serif">You</text>`; }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of event venues">${g}</svg>`;
}

/* ---------- Deals ---------- */
R.dealResolve = d => { const ev=E.bySlug(d.slug); if(!ev) return null; const until = d.until ? E.parseLocal(d.until) : new Date(E.kDayStart(new Date()).getTime()+(d.untilRel||1)*E.DAY+20*E.HOUR); return Object.assign({},d,{ev,untilD:until,expired:until.getTime()<Date.now() || ["cancelled","completed"].includes(E.status(ev))}); };
R.dealCard = d => `<article class="deal ${d.expired?"expired":""}"><a href="#event-${d.ev.slug}" data-src="deals" class="poster" style="display:block">${E.posterHTML(d.ev,{text:false})}</a><div>
  <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="deal-kind">${esc(d.kind)}</span>${d.expired?`<span class="pill cancelled">Expired</span>`:""}${d.verify==="demo"?`<span class="pill neutral">Demo</span>`:""}</div>
  <h3>${esc(d.title)}</h3><a class="link small" href="#event-${d.ev.slug}" data-src="deals">${esc(d.ev.title)}</a><p class="small muted">${esc(d.desc)}</p>
  <div class="small"><b>${d.expired?"Ended":"Valid until"}</b> ${esc(E.fDate(d.untilD))}, ${esc(E.fTime(d.untilD))}${d.untilNote?`<br><span class="tiny muted">${esc(d.untilNote)}</span>`:""}</div>
  <div class="small"><b>Organizer</b> ${esc(d.ev.organizer||"Not stated")}</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap">${E.safeUrl(d.ev.booking)?`<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${E.safeUrl(d.ev.booking)}">Official event link</a>`:""}${E.safeUrl(d.source)?`<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${E.safeUrl(d.source)}">Source</a>`:""}</div></div></article>`;
R.dealsKind="";
R.deals = function(app){
  E.setHead("Evently Deals: free events, discounts and offers in Uganda | Evently","Free events, early bird offers, discounts, giveaways and last-minute promotions for events in Uganda.");
  const ds=(window.EVENTLY_DEALS||[]).concat(S.submissions.filter(s=>s.state==="published"&&s.deal&&s.deal.title).map(s=>Object.assign({id:"sd"+s.slug,slug:s.slug,verify:"organizer"},s.deal))).map(R.dealResolve).filter(Boolean);
  const free=E.events().filter(e=>E.isActive(e)&&e.isFree).sort((a,b)=>a.startD-b.startD);
  const kinds=["Free event","Discounted offer","Giveaway","Early promotion","Last-minute deal"];
  const act=ds.filter(d=>!d.expired && (!R.dealsKind||d.kind===R.dealsKind)), exp=ds.filter(d=>d.expired);
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Evently Deals</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">Deals, offers and free nights</h1><p class="muted">Promotions organizers have announced. Evently doesn't sell tickets, so every offer links to the organizer's official page. Expired offers are marked automatically.</p></div>
    <div style="margin:18px 0 22px">${E.fold("deals","Filter offers",R.dealsKind?1:0,`<div class="chips"><button class="chip" data-dk="" aria-pressed="${!R.dealsKind}">All offers</button>${kinds.map(k=>`<button class="chip" data-dk="${k}" aria-pressed="${R.dealsKind===k}">${k}s</button>`).join("")}</div>`)}</div>
    <div class="grid big">${act.map(R.dealCard).join("")||E.empty("No offers of this kind right now","Check back soon or browse free events below.")}</div>
    <section class="section"><div class="sec-head"><div><span class="eyebrow">No cover charge</span><h2>Free events (${free.length})</h2></div><a class="link" href="#free-events-in-uganda">See all free events</a></div><div class="rail">${free.slice(0,12).map(e=>E.card(e,{src:"deals"})).join("")}</div></section>
    ${exp.length?`<section class="section"><div class="sec-head"><div><span class="eyebrow">Archive</span><h2>Expired offers</h2></div></div><div class="grid big">${exp.map(R.dealCard).join("")}</div></section>`:""}</div>`;
  app.onclick=e=>{ const k=e.target.closest("[data-dk]"); if(k){ R.dealsKind=k.dataset.dk; R.deals(app); } };
};

/* ---------- Auth ---------- */
R.authModal = function(mode="login", reason=""){
  const m=E.modal(`<div class="modal-head"><h3>${mode==="login"?"Sign in to Evently":mode==="register"?"Create your Evently account":"Reset your password"}</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
    ${reason?`<p class="notice">${I.info}<span>${esc(reason)}</span></p>`:""}
    <form id="authF" style="display:grid;gap:12px" novalidate>
      ${mode==="register"?`<div class="field"><label for="aName">Party name</label><input class="input" id="aName" autocomplete="nickname" maxlength="40" placeholder="e.g. DJ Rolex" required><span class="tiny muted">Shown to others on events you go to. Use a nickname, not your real name.</span></div>`:""}
      <div class="field"><label for="aEmail">Email</label><input class="input" id="aEmail" type="email" autocomplete="email" required></div>
      ${mode!=="reset"?`<div class="field"><label for="aPw">Password</label><input class="input" id="aPw" type="password" autocomplete="${mode==="login"?"current-password":"new-password"}" minlength="8" required>${mode==="register"?`<span class="tiny muted">At least 8 characters, with a letter and a number.</span>`:""}</div>`:""}
      ${mode==="register"?`<div class="field"><label for="aCity">City or area</label><select class="input" id="aCity">${window.EVENTLY_CITIES.map(c=>`<option>${esc(c.name)}</option>`).join("")}</select></div>
        <div class="field"><span class="small" style="font-weight:600">Interests (for Evently Match)</span><div class="chips">${R.INTERESTS.map(i=>`<button type="button" class="chip" data-int="${i.id}" aria-pressed="${(S.guestInterests||[]).includes(i.id)}">${i.label}</button>`).join("")}</div></div>
        <input type="text" id="aHp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">`:""}
      <span class="err" id="aErr" role="alert"></span>
      <button class="btn btn-primary">${mode==="login"?"Sign in":mode==="register"?"Create account":"Get reset code"}</button>
    </form>
    <div class="small muted" style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      ${mode==="login"?`<button class="link" style="border:0;background:none" data-mode="register">New here? Create an account</button><button class="link" style="border:0;background:none" data-mode="reset">Forgot password?</button>`:`<button class="link" style="border:0;background:none" data-mode="login">Back to sign in</button>`}</div>
    <p class="tiny muted">${E.cloud()?"Your account is stored securely with Evently.":"Your password is encrypted before it is stored."}</p>`);
  m.addEventListener("click",e=>{ const b=e.target.closest("[data-mode]"); if(b) R.authModal(b.dataset.mode, reason); const i=e.target.closest("[data-int]"); if(i) i.setAttribute("aria-pressed", i.getAttribute("aria-pressed")!=="true"); });
  $("#authF",m).onsubmit=async e=>{ e.preventDefault(); const err=$("#aErr",m); err.textContent="";
    const email=$("#aEmail",m).value.trim().toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ err.textContent="Enter a valid email address."; return; }
    if(E.cloud()) return window.EVCLOUD.authSubmit(mode, m, email);
    if(mode==="reset"){ const u=S.users.find(x=>x.email===email); const code=String(100000+Math.floor(Math.random()*900000)); if(u){ S.resets[email]={code,t:Date.now()}; E.persist(); }
      const mm=E.modal(`<div class="modal-head"><h3>Enter your reset code</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
        <p class="small muted">If ${esc(email)} has an account, we've sent a 6-digit code. ${u?`Your one-time code is <span class="kbd" style="user-select:all">${code}</span>.`:"No account uses that email in this browser."}</p>
        <form id="rsF" style="display:grid;gap:12px"><div class="field"><label for="rsC">Code</label><input class="input" id="rsC" inputmode="numeric" maxlength="6"></div><div class="field"><label for="rsP">New password</label><input class="input" id="rsP" type="password" autocomplete="new-password"></div><span class="err" id="rsE"></span><button class="btn btn-primary">Set new password</button></form>`);
      $("#rsF",mm).onsubmit=async ev=>{ ev.preventDefault(); const r=S.resets[email]; const pw=$("#rsP",mm).value; if(!r||r.code!==$("#rsC",mm).value.trim()||Date.now()-r.t>15*60e3){ $("#rsE",mm).textContent="That code is wrong or expired. Request a new one."; return; } if(pw.length<8||!/[a-z]/i.test(pw)||!/\d/.test(pw)){ $("#rsE",mm).textContent="Use at least 8 characters with a letter and a number."; return; } const uu=S.users.find(x=>x.email===email); uu.pw=await E.sha(email+"|"+pw); delete S.resets[email]; S.session=uu.id; E.persist(); E.closeModal(); E.toast("Password updated. You're signed in."); R.afterAuth(); };
      return; }
    const pw=$("#aPw",m).value;
    if(mode==="login"){ const u=S.users.find(x=>x.email===email); const h=await E.sha(email+"|"+pw); if(!u||u.pw!==h){ err.textContent="That email and password don't match. Try again or reset your password."; return; } if(u.suspended){ err.textContent="This account is suspended. Contact Evently support."; return; } S.session=u.id; E.persist(); E.closeModal(); E.toast("Welcome back, "+u.name); R.afterAuth(); return; }
    if($("#aHp",m).value) return; // spam trap
    const name=$("#aName",m).value.trim(); if(name.length<2){ err.textContent="Enter a party name."; return; }
    if(pw.length<8||!/[a-z]/i.test(pw)||!/\d/.test(pw)){ err.textContent="Use at least 8 characters with a letter and a number."; return; }
    if(S.users.some(x=>x.email===email)){ err.textContent="An account with that email already exists. Sign in instead."; return; }
    const u={id:"u"+Date.now().toString(36),email,name,pw:await E.sha(email+"|"+pw),city:$("#aCity",m).value,interests:$$("[data-int][aria-pressed=true]",m).map(b=>b.dataset.int),publicAttendance:true,role:S.users.length?"user":"admin",created:Date.now()};
    S.users.push(u); S.session=u.id; E.persist(); E.closeModal(); E.toast(u.role==="admin"?"Account created. As the first account here, you're also an administrator.":"Account created. Welcome to Evently!"); R.afterAuth();
  };
};
R.afterAuth = ()=>{ R.header(); R.render(); };

/* ---------- Header ---------- */
R.header = function(){
  const u=E.me(); const slot=$("#authSlot");
  slot.innerHTML = u ? `<a class="icon-btn" href="#account" aria-label="Your account" style="overflow:hidden">${u.avatar&&E.mediaURL(u.avatar)?`<img src="${E.mediaURL(u.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover">`:`<b style="font-family:var(--f-display)">${esc(u.name[0].toUpperCase())}</b>`}</a>`
    : `<span style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" id="loginBtn">Log in</button><button class="btn btn-primary btn-sm" id="regBtn">Sign up</button></span>`;
  if(!u){ $("#loginBtn").onclick=()=>R.authModal("login"); $("#regBtn").onclick=()=>R.authModal("register"); }
  E.updateBell();
};
R.notifPanel = function(){
  const u=E.me(); if(!u){ R.authModal("login","Sign in to see reminders and updates for events you follow."); return; }
  const list=S.notifs[u.id]||[];
  const m=E.modal(`<div class="modal-head"><h3>Notifications</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
    ${list.length?`<div>${list.slice(0,30).map(n=>`<a class="notif ${n.read?"read":""}" href="${esc(n.link||"#my-events")}" data-close style="text-decoration:none"><i></i><div><div>${esc(n.text)}</div><div class="tiny muted">${esc(E.fDate(new Date(n.t)))} · ${esc(E.fTime(new Date(n.t)))}</div></div></a>`).join("")}</div>`:`<p class="muted">No notifications yet. Save events or mark yourself as attending and we'll remind you before they start.</p>`}
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" id="nRead">Mark all as read</button><a class="btn btn-ghost btn-sm" href="#account" data-close>Notification settings</a></div>`);
  $("#nRead",m).onclick=()=>{ list.forEach(n=>n.read=true); E.persist(); E.updateBell(); E.closeModal(); };
};

/* ---------- My events ---------- */
R.mySort="date";
R.myEvents = function(app){
  E.setHead("My Events | Evently","Your saved events, attendance and reminders.");
  const u=E.me(); if(!u){ app.innerHTML=`<div class="wrap section">${E.empty("Keep track of the events you love","Create a free account to save events, mark attendance and get reminders before they start.",`<div style="display:flex;gap:10px"><button class="btn btn-primary" id="mReg">Create account</button><button class="btn btn-ghost" id="mLog">Log in</button></div>`)}</div>`; $("#mReg").onclick=()=>R.authModal("register"); $("#mLog").onclick=()=>R.authModal("login"); return; }
  const saved=(S.saved[u.id]||[]).map(E.bySlug).filter(Boolean); const att=Object.entries(S.attend[u.id]||{}).map(([s,k])=>({e:E.bySlug(s),k})).filter(x=>x.e);
  const sorter=(a,b)=>R.mySort==="date"?a.startD-b.startD:R.mySort==="added"?0:a.title.localeCompare(b.title);
  const upS=saved.filter(e=>E.status(e)!=="completed").sort(sorter), pastS=saved.filter(e=>E.status(e)==="completed");
  const going=att.filter(x=>x.k==="going"&&E.status(x.e)!=="completed").map(x=>x.e).sort((a,b)=>a.startD-b.startD), intd=att.filter(x=>x.k==="interested"&&E.status(x.e)!=="completed").map(x=>x.e).sort((a,b)=>a.startD-b.startD);
  const rmBtn=s=>`<button class="btn btn-ghost btn-sm" data-save="${s}" aria-pressed="true">Remove</button><button class="btn btn-ghost btn-sm" data-remind="${s}">Remind me</button>`;
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">My Events</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">Hi ${esc(u.name)}, here's your line-up</h1></div>
    <div class="stats" style="margin:18px 0"><div class="stat"><b>${upS.length}</b><span>Saved upcoming</span></div><div class="stat"><b>${going.length}</b><span>Attending</span></div><div class="stat"><b>${intd.length}</b><span>Interested</span></div><div class="stat"><b>${(S.notifs[u.id]||[]).filter(n=>!n.read).length}</b><span>Unread updates</span></div></div>
    <section class="section"><div class="sec-head"><div><h2>Attending</h2></div></div>${going.length?`<div class="list">${going.map(e=>E.row(e,`<button class="btn btn-ghost btn-sm" data-unattend="${e.slug}">Cancel attendance</button>`)).join("")}</div>`:`<p class="muted">You haven't marked any events as attending.</p>`}</section>
    <section class="section"><div class="sec-head"><div><h2>Interested</h2></div></div>${intd.length?`<div class="list">${intd.map(e=>E.row(e,`<button class="btn btn-ghost btn-sm" data-unattend="${e.slug}">Remove</button>`)).join("")}</div>`:`<p class="muted">Nothing here yet.</p>`}</section>
    <section class="section"><div class="sec-head"><div><h2>Saved events</h2></div><div style="display:flex;gap:8px;align-items:center"><label for="mSort" class="small muted">Sort</label><select class="input" id="mSort" style="width:auto;height:36px"><option value="date">By date</option><option value="name">By name</option></select></div></div>
      ${upS.length?`<div class="list">${upS.map(e=>E.row(e,rmBtn(e.slug))).join("")}</div>`:E.empty("No saved events","Tap the heart on any event to save it here.",`<a class="btn btn-primary" href="#discover">Find events</a>`)}</section>
    ${pastS.length?`<section class="section"><div class="sec-head"><div><h2>Past saved events</h2></div></div><div class="list">${pastS.map(e=>E.row(e,rmBtn(e.slug).split("<button class=\"btn btn-ghost btn-sm\" data-remind")[0])).join("")}</div></section>`:""}</div>`;
  $("#mSort").value=R.mySort; $("#mSort").onchange=e=>{R.mySort=e.target.value;R.myEvents(app);};
  app.onclick=e=>{ const ua=e.target.closest("[data-unattend]"); if(ua){ delete (S.attend[u.id]||{})[ua.dataset.unattend]; E.persist(); E.toast("Updated"); R.myEvents(app); }
    const rm=e.target.closest("[data-remind]"); if(rm){ const ev=E.bySlug(rm.dataset.remind); remindModal(ev); } };
};
function remindModal(ev){
  const u=E.me(); const m=E.modal(`<div class="modal-head"><h3>Remind me about ${esc(ev.title)}</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div>
   <p class="small muted">Evently already reminds you 24 hours and 2 hours before saved events. Add a reminder now to see how it appears.</p>
   <button class="btn btn-primary" id="rNow">Send a test reminder now</button>`);
  $("#rNow",m).onclick=()=>{ E.notify(u.id,`Reminder: ${ev.title} is on ${E.fDate(ev.startD)} at ${E.fTime(ev.startD)}, ${ev.venue}.`,"#event-"+ev.slug,"saved"); E.closeModal(); E.toast("Reminder added to your notifications"); };
}

/* ---------- Account ---------- */
R.account = function(app){
  E.setHead("Your account | Evently","Manage your Evently profile, interests and notifications.");
  const u=E.me(); if(!u){ R.authModal("login"); location.hash="home"; return; }
  const p=E.prefs(u.id);
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Account</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">Your profile</h1></div>
   <div class="two-col section" style="padding-top:20px">
    <div style="display:grid;gap:20px;min-width:0">
     <form class="panel" id="profF"><h3>Profile</h3>
      <div style="display:flex;gap:16px;align-items:center"><span style="width:72px;height:72px;border-radius:50%;overflow:hidden;background:var(--accent);display:grid;place-items:center;font:800 1.8rem var(--f-display);color:#111;flex:none">${u.avatar&&E.mediaURL(u.avatar)?`<img src="${E.mediaURL(u.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover">`:esc(u.name[0].toUpperCase())}</span><div class="field"><label for="pAv">Profile picture</label><input type="file" id="pAv" accept="image/*" class="small"></div></div>
      <div class="form-grid"><div class="field"><label for="pName">Party name</label><input class="input" id="pName" value="${esc(u.name)}" maxlength="40"><span class="tiny muted">Shown to others on events you go to. Use a nickname, not your real name.</span></div>
      <div class="field"><label for="pCity">Location</label><select class="input" id="pCity">${window.EVENTLY_CITIES.map(c=>`<option ${u.city===c.name?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div></div>
      <div class="field"><span class="small" style="font-weight:600">Interests</span><div class="chips">${R.INTERESTS.map(i=>`<button type="button" class="chip" data-int="${i.id}" aria-pressed="${(u.interests||[]).includes(i.id)}">${i.label}</button>`).join("")}</div></div>
      <label class="check"><input type="checkbox" id="pPub" ${u.publicAttendance?"checked":""}> Show my party name on events I'm going to</label>
      <span class="small muted">Signed in as ${esc(u.email)} · Role: ${esc(u.role)}</span>
      <button class="btn btn-primary" style="justify-self:start">Save profile</button></form>
     <form class="panel" id="prefF"><h3>Notifications</h3><p class="small muted">Choose what Evently tells you about.</p>
      ${[["saved","Reminders for events I saved"],["going","Reminders for events I'm attending"],["interested","Reminders for events I'm interested in"],["changes","Date or venue changes"],["cancellations","Cancellations"],["newMatches","New events that match my interests"]].map(([k,l])=>`<label class="check"><input type="checkbox" data-pref="${k}" ${p[k]?"checked":""}> ${l}</label>`).join("")}
      <h4 style="font-family:var(--f-body);font-size:.9rem;margin-top:8px">Channels</h4>
      <label class="check"><input type="checkbox" checked disabled> In-app notifications (always on)</label>
      <label class="check"><input type="checkbox" data-pref="email" ${p.email?"checked":""}> Email to ${esc(u.email)} <span class="tiny muted">(sent once Evently's email service is connected)</span></label>
      <label class="check"><input type="checkbox" data-pref="push" id="pushChk" ${p.push?"checked":""}> Browser push notifications</label>
      <span class="small" id="pushMsg"></span>
      <button class="btn btn-primary" style="justify-self:start">Save notification settings</button></form>
    </div>
    <aside style="display:grid;gap:16px">
     <div class="panel"><h3>Quick links</h3><a class="link" href="#my-events">My Events</a><a class="link" href="#organizers">Organizer dashboard</a>${u.role==="admin"?`<a class="link" href="#admin">Admin dashboard</a>`:""}</div>
     ${E.cloud()?"":`<div class="panel"><h3>Administrator preview</h3><p class="small muted">In production, admin access is granted by Evently staff. In this preview you can switch it on to try moderation.</p><button class="btn btn-ghost btn-sm" id="roleBtn">${u.role==="admin"?"Switch back to a regular account":"Switch on admin access"}</button></div>`}
     <div class="panel"><button class="btn btn-ghost" id="logoutBtn">Log out</button></div>
     <div class="panel" style="border-color:var(--bad-soft)"><h3>Delete account</h3><p class="small muted">Removes your profile, saved events, attendance and notifications from Evently. This can't be undone.</p><div id="delZone"><button class="btn btn-danger btn-sm" id="delBtn">Delete my account</button></div></div>
    </aside></div></div>`;
  app.onclick=e=>{ const i=e.target.closest("[data-int]"); if(i) i.setAttribute("aria-pressed", i.getAttribute("aria-pressed")!=="true"); };
  $("#pAv").onchange=async e=>{ try{ const b=await E.resizeImage(e.target.files[0],256,.86); if(u.avatar) E.delBlob(u.avatar); u.avatar=E.putBlob(b); E.persist(); R.header(); R.account(app); E.toast("Profile picture updated"); }catch(err){ E.toast(err.message); } };
  $("#profF").onsubmit=e=>{ e.preventDefault(); const n=$("#pName").value.trim(); if(n.length<2){ E.toast("Enter a party name."); return; } u.name=n; u.city=$("#pCity").value; u.interests=$$("#profF [data-int][aria-pressed=true]").map(b=>b.dataset.int); u.publicAttendance=$("#pPub").checked; E.persist(); R.header(); E.toast("Profile saved"); };
  $("#pushChk").onchange=async e=>{ if(e.target.checked){ if(!("Notification" in window)){ $("#pushMsg").textContent="This browser doesn't support push notifications."; e.target.checked=false; return; } try{ const r=await Notification.requestPermission(); if(r!=="granted"){ e.target.checked=false; $("#pushMsg").textContent="Permission wasn't granted, so push stays off. You'll still get in-app notifications."; } else $("#pushMsg").textContent="Push notifications are allowed."; }catch(_){ e.target.checked=false; $("#pushMsg").textContent="Push notifications aren't available here."; } } };
  $("#prefF").onsubmit=e=>{ e.preventDefault(); const np={}; $$("[data-pref]").forEach(c=>np[c.dataset.pref]=c.checked); S.prefs[u.id]=np; E.persist(); E.toast("Notification settings saved"); };
  if($("#roleBtn")) $("#roleBtn").onclick=()=>{ u.role=u.role==="admin"?"user":"admin"; E.audit(u.role==="admin"?"Enabled admin access (preview)":"Disabled admin access","user "+u.email); E.persist(); R.account(app); E.toast(u.role==="admin"?"Admin access on":"Admin access off"); };
  $("#logoutBtn").onclick=()=>{ S.session=null; E.persist(); R.header(); location.hash="home"; E.toast("Logged out"); };
  $("#delBtn").onclick=()=>{ $("#delZone").innerHTML=`<p class="small"><b>Are you sure?</b> Type DELETE to confirm.</p><input class="input" id="delIn" style="margin:8px 0"><div style="display:flex;gap:8px"><button class="btn btn-danger btn-sm" id="delYes">Delete permanently</button><button class="btn btn-ghost btn-sm" id="delNo">Keep my account</button></div>`; $("#delNo").onclick=()=>R.account(app); $("#delYes").onclick=()=>{ if($("#delIn").value.trim()!=="DELETE"){ E.toast("Type DELETE to confirm."); return; } [S.saved,S.attend,S.notifs,S.prefs].forEach(o=>delete o[u.id]); if(u.avatar) E.delBlob(u.avatar); S.users=S.users.filter(x=>x.id!==u.id); S.session=null; E.audit("Deleted own account",u.email); E.persist(); R.header(); location.hash="home"; E.toast("Your account was deleted"); }; };
};

/* ---------- Aftermovie gallery ---------- */
R.gallery = function(app, slug){
  const ev=E.bySlug(slug); if(!ev){ location.hash="discover"; return; }
  const st=E.status(ev); const u=E.me();
  const items=S.media.filter(m=>m.slug===slug && m.status==="approved" && E.mediaURL(m.blob));
  const org=items.filter(m=>m.byOrganizer), com=items.filter(m=>!m.byOrganizer);
  const mine=u?S.media.filter(m=>m.slug===slug && m.uid===u.id && m.status!=="approved"):[];
  const canUpload = st==="completed" && (ev.community || (u && ev.owner===u.id));
  E.setHead(`${ev.title} Aftermovie and photos | Evently`,`Photos, videos and highlights from ${ev.title} at ${ev.venue}.`);
  const tile=(m,i,arr)=>`<button data-g="${arr}:${i}" aria-label="Open">${m.type==="video"?`<video src="${E.mediaURL(m.blob)}" muted playsinline></video><span class="flag" style="position:absolute;bottom:8px;left:8px">Video</span>`:`<img src="${E.mediaURL(m.blob)}" alt="${esc(m.caption||"")}" loading="lazy">`}</button>`;
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Evently Aftermovie</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">${esc(ev.title)}</h1><p class="muted">${esc(E.fDateLong(ev.startD))} · ${esc(ev.venue)}. ${st==="completed"?"Highlights from the night.":"The gallery opens for uploads after the event ends."}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-ghost btn-sm" href="#event-${slug}">Event page</a><button class="btn btn-ghost btn-sm" id="gShare">${I.link} Copy gallery link</button></div></div>
    <section class="section"><h2 style="margin-bottom:14px">From the organizer</h2>${org.length?`<div class="gallery">${org.map((m,i)=>tile(m,i,"o")).join("")}</div>`:`<p class="muted">The organizer hasn't added an aftermovie or highlights yet.</p>`}</section>
    <section class="section"><h2 style="margin-bottom:14px">From the crowd</h2>${com.length?`<div class="gallery">${com.map((m,i)=>tile(m,i,"c")).join("")}</div>`:E.empty("No community photos yet", ev.community?"Were you there? Share your best shots. Every upload is checked by a moderator before it appears.":"The organizer hasn't opened community uploads for this event.")}</section>
    ${canUpload?`<section class="panel" style="max-width:640px"><h3>Add your photos or videos</h3><p class="small muted">Images up to 12 MB and videos up to 25 MB. Uploads are reviewed before they're published. Only share media you took and have permission to post.</p>
      <form id="gF" style="display:grid;gap:12px"><input type="file" id="gFile" accept="image/*,video/mp4,video/webm,video/quicktime" multiple><div class="field"><label for="gCap">Caption (optional)</label><input class="input" id="gCap" maxlength="120"></div><label class="check"><input type="checkbox" id="gOk"> I took these and agree to the community rules</label><span class="err" id="gErr"></span><button class="btn btn-primary" style="justify-self:start">Submit for review</button></form>
      ${mine.length?`<p class="small">You have ${mine.length} upload${mine.length>1?"s":""} ${mine.some(m=>m.status==="rejected")?"(some were not approved)":"waiting for review"}.</p>`:""}</section>`:st==="completed"?"":`<p class="muted">Come back after ${esc(E.fDate(ev.endD))} to see and share photos.</p>`}
  </div>`;
  $("#gShare").onclick=()=>E.copyText(`${E.SITE}/events/${slug}/gallery`);
  app.onclick=e=>{ const g=e.target.closest("[data-g]"); if(g){ const [a,i]=g.dataset.g.split(":"); const arr=(a==="o"?org:com).map(m=>({url:E.mediaURL(m.blob),type:m.type})); R.viewer(arr,+i); } };
  const f=$("#gF"); if(f) f.onsubmit=async e=>{ e.preventDefault(); const err=$("#gErr"); err.textContent=""; if(!u){ R.authModal("login","Sign in to share photos."); return; } const files=[...$("#gFile").files]; if(!files.length){ err.textContent="Choose at least one photo or video."; return; } if(!$("#gOk").checked){ err.textContent="Confirm that you took these and agree to the rules."; return; }
    const recent=S.media.filter(m=>m.uid===u.id && Date.now()-m.t<3600e3).length; if(recent+files.length>20){ err.textContent="You can upload up to 20 items an hour."; return; }
    for(const file of files.slice(0,10)){ try{ let blob, type; if(/^video\//.test(file.type)){ if(file.size>25e6) throw new Error(file.name+" is over 25 MB."); blob=file; type="video"; } else { blob=await E.resizeImage(file,1400,.85); type="image"; }
      const byOrg = ev.owner===u.id; S.media.push({id:"md"+Date.now()+Math.random().toString(36).slice(2,5),slug,uid:u.id,uname:u.name,blob:E.putBlob(blob),type,caption:$("#gCap").value.trim(),status:"pending",t:Date.now(),byOrganizer:byOrg}); }catch(x){ err.textContent=x.message; } }
    E.persist(); E.toast("Thanks! Your uploads are waiting for moderator review."); R.gallery(app,slug); };
};

/* ---------- Poster studio ---------- */
R.posterOpts={layout:"square",theme:"auto"};
const LAYOUTS={square:{w:1080,h:1080,name:"Instagram square"},story:{w:1080,h:1920,name:"Instagram story"},status:{w:1080,h:1920,name:"WhatsApp Status"},facebook:{w:1200,h:630,name:"Facebook post"}};
R.poster = function(app, slug){
  const ev=E.bySlug(slug); if(!ev){ location.hash="discover"; return; }
  E.setHead(`Poster for ${ev.title} | Evently`,`Create a shareable poster for ${ev.title}.`);
  const o=R.posterOpts;
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Evently poster generator</span><h1 style="font-size:clamp(1.8rem,4vw,2.8rem)">Share ${esc(ev.title)}</h1><p class="muted">Pick a format, then save the poster or send it straight to WhatsApp. Every poster carries a QR code that opens the event page.</p></div>
    <div class="studio section" style="padding-top:20px"><div class="studio-stage" id="stage"><div class="skel" style="width:300px;height:300px"></div></div>
     <div class="panel"><div class="field"><span class="small" style="font-weight:600">Format</span><div class="chips">${Object.entries(LAYOUTS).map(([k,v])=>`<button class="chip" data-lay="${k}" aria-pressed="${o.layout===k}">${v.name}</button>`).join("")}</div></div>
      <div class="field"><span class="small" style="font-weight:600">Style</span><div class="chips">${[["auto","Event colours"],["dark","Black and orange"],["orange","Orange"],["light","Light"]].map(([k,l])=>`<button class="chip" data-th="${k}" aria-pressed="${o.theme===k}">${l}</button>`).join("")}</div></div>
      <button class="btn btn-primary" id="pDl">Save poster image</button>
      <a class="btn btn-ghost" id="pWa" target="_blank" rel="noopener" href="${R.waLink(ev)}">${I.wa} Send to WhatsApp</a>
      <button class="btn btn-ghost" id="pCopy">${I.link} Copy event link</button>
      <p class="tiny muted" id="pHint">If saving doesn't start, press and hold (or right-click) the poster and choose Save image.</p>
      <a class="link small" href="#event-${slug}">Back to event</a></div></div></div>`;
  let lastBlob=null;
  const build=async()=>{ const L=LAYOUTS[o.layout]; const c=await renderPoster(ev,L,o.layout,o.theme); c.toBlob(b=>{ lastBlob=b; const url=URL.createObjectURL(b); $("#stage").innerHTML=`<img src="${url}" alt="Poster for ${esc(ev.title)}">`; },"image/png"); };
  app.onclick=e=>{ const l=e.target.closest("[data-lay]"); if(l){ o.layout=l.dataset.lay; $$("[data-lay]").forEach(b=>b.setAttribute("aria-pressed",b===l)); build(); } const t=e.target.closest("[data-th]"); if(t){ o.theme=t.dataset.th; $$("[data-th]").forEach(b=>b.setAttribute("aria-pressed",b===t)); build(); } };
  $("#pDl").onclick=async()=>{ if(!lastBlob) return; E.trackShare(slug,"poster"); const ok=await E.saveFile(`evently-${slug}-${o.layout}.png`,lastBlob); if(!ok){ $("#pHint").textContent="Saving isn't available in this view. Press and hold (or right-click) the poster and choose Save image."; $("#pHint").style.color="var(--accent-ink)"; } };
  $("#pWa").addEventListener("click",()=>E.trackShare(slug,"whatsapp"));
  $("#pCopy").onclick=()=>{ E.trackShare(slug,"copy"); E.copyText(E.eventURL(slug)); };
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(build);
};
function loadImg(src){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
async function renderPoster(ev,L,layout,theme){
  const {w:W,h:H}=L; const c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const pal = theme==="dark"?{bg:"#111010",fg:"#F97316",hi:"#fff"}:theme==="orange"?{bg:"#F97316",fg:"#111010",hi:"#fff"}:theme==="light"?{bg:"#fff7ed",fg:"#ea580c",hi:"#111010"}:null;
  const art=E.posterArt(ev, 800, 1000); const P=pal||art.P;
  const wide=layout==="facebook"; const tall=H>W;
  const artH = wide ? H : tall ? H*.5 : H*.42; const artW = wide ? W*.46 : W;
  const qs = wide?150:layout==="status"?300:tall?240:200;
  // art
  let img;
  let real=false; if(E.posterSrc(ev)){ img=await loadImg(E.posterSrc(ev)).catch(()=>null); real=!!img; }
  if(!img){ const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">${pal?E.posterArt(Object.assign({},ev),800,1000).svg.replace(/#[0-9a-fA-F]{6}/g,m=>m.toLowerCase()===art.P.bg.toLowerCase()?pal.bg:m.toLowerCase()===art.P.fg.toLowerCase()?pal.fg:m.toLowerCase()===art.P.hi.toLowerCase()?pal.hi:m):art.svg}</svg>`; img=await loadImg("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)); }
  x.fillStyle=P.bg; x.fillRect(0,0,W,H);
  const s=Math.max(artW/img.width, artH/img.height); x.save(); x.beginPath(); x.rect(0,0,artW,artH); x.clip();
  if(real){ x.filter="blur(28px) brightness(.5)"; x.drawImage(img,(artW-img.width*s*1.1)/2,(artH-img.height*s*1.1)/2,img.width*s*1.1,img.height*s*1.1); x.filter="none"; const k=Math.min(artW/img.width, artH/img.height); x.drawImage(img,(artW-img.width*k)/2,(artH-img.height*k)/2,img.width*k,img.height*k); }
  else x.drawImage(img,(artW-img.width*s)/2,(artH-img.height*s)/2,img.width*s,img.height*s);
  x.restore();
  // text panel
  const tx = wide ? artW+56 : 64, ty = wide ? 70 : artH+70, tw = wide ? W-artW-112 : W-128-qs-50;
  const ink = P.bg.toLowerCase()==="#fff7ed" ? "#111010" : (P.bg==="#F97316"?"#111010":"#ffffff");
  const sub = P.bg==="#F97316" ? "#111010" : P.fg==="#111010"?"#fff7ed":P.fg;
  x.fillStyle=sub; x.font=`700 ${wide?22:28}px Inter, sans-serif`; x.fillText(E.catName(ev.cat).toUpperCase()+(E.status(ev)==="cancelled"?" · CANCELLED":E.status(ev)==="postponed"?" · POSTPONED":""), tx, ty);
  let fs = wide?60:tall?88:68; x.font=`800 ${fs}px "Bricolage Grotesque", "Arial Black", sans-serif`;
  const lines=wrapCanvas(x, ev.title, tw, fs, wide?3:4); x.fillStyle=ink;
  let y=ty+fs*1.05; lines.forEach(l=>{ x.font=`800 ${fs}px "Bricolage Grotesque", "Arial Black", sans-serif`; x.fillText(l,tx,y); y+=fs*.98; });
  y+= wide?14:24; x.font=`700 ${wide?28:tall?40:34}px Inter, sans-serif`; x.fillStyle=sub; x.fillText(E.fmt(ev.startD,{weekday:"short",day:"numeric",month:"short"}).toUpperCase()+" · "+E.fTime(ev.startD), tx, y);
  y+= wide?40:tall?56:48; x.font=`600 ${wide?26:tall?36:30}px Inter, sans-serif`; x.fillStyle=ink; wrapCanvas(x, ev.venue+(ev.city&&ev.city!=="Not stated"?", "+ev.city:""), wide?tw-qs-30:tw, 30, 2).forEach(l=>{ x.fillText(l,tx,y); y+= wide?34:44; });
  if(E.priceText(ev)!=="Price not stated"){ x.font=`600 ${wide?22:28}px Inter, sans-serif`; x.fillStyle=sub; x.fillText(E.priceText(ev), tx, y+4); }
  // QR
  const qx = wide?W-qs-56:W-qs-64, qy = wide?H-qs-90:ty-20;
  drawQR(x, E.eventURL(ev.slug), qx, qy, qs);
  x.fillStyle=ink; x.font=`600 ${wide?18:22}px Inter, sans-serif`; x.textAlign="center"; x.fillText(layout==="status"?"Scan or tap the link for details":"Scan for details", qx+qs/2, qy+qs+30); x.textAlign="left";
  // brand
  const by=H-(wide?46:56); const ih=wide?44:56;
  const [lic,lwd]=await Promise.all([loadImg("logo-icon.png").catch(()=>null), loadImg(ink==="#111010"?"logo-word-dark.png":"logo-word-white.png").catch(()=>null)]);
  if(lic) x.drawImage(lic, tx, by-ih+8, ih, ih);
  if(lwd){ const wh=ih*.62; x.drawImage(lwd, tx+ih+12, by-ih+8+(ih-wh)/2, wh*lwd.width/lwd.height, wh); }
  else { x.fillStyle=ink; x.font=`800 ${wide?32:40}px "Bricolage Grotesque", sans-serif`; x.fillText("evently", tx+ih+12, by); }
  x.font=`500 ${wide?18:22}px Inter, sans-serif`; x.fillStyle=sub; x.fillText(`evently.ug/events/${ev.slug}`.slice(0,wide?44:52), tx, by+(wide?30:36)>H-8?by-48:by+34);
  return c;
}
function wrapCanvas(x, text, maxW, fs, maxLines){ const words=text.split(/\s+/); const lines=[]; let cur=""; words.forEach(w=>{ const t=(cur?cur+" ":"")+w; if(x.measureText(t).width>maxW && cur){ lines.push(cur); cur=w; } else cur=t; }); if(cur) lines.push(cur); if(lines.length>maxLines){ const l=lines.slice(0,maxLines); l[maxLines-1]=l[maxLines-1].replace(/\s*\S*$/,"")+"…"; return l; } return lines; }
function drawQR(x, text, px, py, size){
  x.fillStyle="#ffffff"; const pad=size*.07; x.beginPath(); x.roundRect ? x.roundRect(px-pad,py-pad,size+pad*2,size+pad*2,size*.06) : x.rect(px-pad,py-pad,size+pad*2,size+pad*2); x.fill();
  if(typeof window.qrcode!=="function"){ x.fillStyle="#111010"; x.font="600 20px Inter"; x.fillText("QR unavailable",px+10,py+size/2); return; }
  const q=window.qrcode(0,"M"); q.addData(text); q.make(); const n=q.getModuleCount(); const m=size/n; x.fillStyle="#111010";
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) x.fillRect(px+c*m, py+r*m, Math.ceil(m), Math.ceil(m));
}
R.drawQR=drawQR;
})();
