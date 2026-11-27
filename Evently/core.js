/* Evently core: storage, time, events model, scoring, posters, shared UI. */
(function(){
"use strict";
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const hostOf = u => { try{ return new URL(u).hostname.replace(/^www\./,""); }catch(e){ return ""; } };
const safeUrl = u => (typeof u === "string" && /^https:\/\//i.test(u)) ? u : "";
const SITE = "https://evently.ug";
const TZ = "Africa/Kampala";
const HOUR = 3600e3, DAY = 86400e3;

/* ---------- Storage ---------- */
const KEY = "evently.v1";
const DEFAULT_SETTINGS = {weights:{views:1,shares:4,saves:3,interested:2,going:3},recentBoost:2,recentDays:7,baseline:false};
function blank(){return {users:[],session:null,saved:{},attend:{},views:{},shares:{},submissions:[],overrides:{},reports:[],media:[],notifs:{},prefs:{},audit:[],settings:JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),cats:{},viewedCats:{},reminded:{},plan:[],guestInterests:[],searches:[],device:null,resets:{},newCats:[],reviews:[]};}
let S = blank();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch(e) {}
if (!S.device) S.device = "d" + Math.random().toString(36).slice(2,10);
S.settings = Object.assign(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), S.settings||{});
S.settings.weights = Object.assign({}, DEFAULT_SETTINGS.weights, S.settings.weights||{});
if (!S.settings.v2){ S.settings.baseline=false; S.settings.v2=true; }
S.follows = S.follows || {}; S.seenAt = S.seenAt || {};
let saveTimer = null;
function persist(){ clearTimeout(saveTimer); saveTimer = setTimeout(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast("Your browser storage is full. Remove some uploads and try again."); } if(cloud()) window.EVCLOUD.sync(); }, 60); }
const cloud = () => !!(window.EVCLOUD && window.EVCLOUD.on && window.EVCLOUD.ready);

/* IndexedDB for uploaded media (posters, photos, videos) */
const blobURLs = {};
let idb = null;
function openIDB(){ return new Promise(res=>{ try{ const r = indexedDB.open("evently-media",1); r.onupgradeneeded=()=>r.result.createObjectStore("m"); r.onsuccess=()=>{idb=r.result;res(idb)}; r.onerror=()=>res(null);}catch(e){res(null)} }); }
async function loadAllBlobs(){ await openIDB(); if(!idb) return; await new Promise(res=>{ try{ const tx=idb.transaction("m","readonly"); const st=tx.objectStore("m"); const rq=st.openCursor(); rq.onsuccess=()=>{ const c=rq.result; if(c){ blobURLs[c.key]=URL.createObjectURL(c.value); c.continue(); } else res(); }; rq.onerror=()=>res(); }catch(e){res()} }); }
function putBlob(blob){ const id="m"+Date.now().toString(36)+Math.random().toString(36).slice(2,7); blobURLs[id]=URL.createObjectURL(blob); if(idb){ try{ idb.transaction("m","readwrite").objectStore("m").put(blob,id); }catch(e){} } return id; }
function delBlob(id){ if(!id) return; if(idb){ try{ idb.transaction("m","readwrite").objectStore("m").delete(id); }catch(e){} } delete blobURLs[id]; }
const mediaURL = id => blobURLs[id] || "";

function resizeImage(file, max=1000, q=.84){
  return new Promise((res,rej)=>{
    if(!file || !/^image\//.test(file.type)) return rej(new Error("Choose an image file (JPG, PNG or WebP)."));
    if(file.size > 12e6) return rej(new Error("That image is over 12 MB. Choose a smaller one."));
    const img = new Image(); const u = URL.createObjectURL(file);
    img.onload=()=>{ const s=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement("canvas"); c.width=Math.round(img.width*s); c.height=Math.round(img.height*s); c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(u); c.toBlob(b=>b?res(b):rej(new Error("Could not read that image.")),"image/jpeg",q); };
    img.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("Could not read that image."))};
    img.src=u;
  });
}

/* ---------- Time (Africa/Kampala, UTC+3, no DST) ---------- */
const parseLocal = s => new Date(s.length===16 ? s+":00+03:00" : s+"+03:00");
const kParts = d => { const k = new Date(d.getTime()+3*HOUR); return {y:k.getUTCFullYear(),m:k.getUTCMonth(),d:k.getUTCDate(),dow:k.getUTCDay(),h:k.getUTCHours(),mi:k.getUTCMinutes()}; };
const kDate = (y,m,d,h=0,mi=0) => new Date(Date.UTC(y,m,d,h-3,mi));
const kDayStart = d => { const p=kParts(d); return kDate(p.y,p.m,p.d); };
const fmt = (d,o) => new Intl.DateTimeFormat("en-UG",Object.assign({timeZone:TZ},o)).format(d);
const fDate = d => fmt(d,{weekday:"short",day:"numeric",month:"short"});
const fDateLong = d => fmt(d,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const fTime = d => fmt(d,{hour:"numeric",minute:"2-digit",hour12:true}).replace(/\s/g," ").toUpperCase();
const ymd = d => { const p=kParts(d); return `${p.y}-${String(p.m+1).padStart(2,"0")}-${String(p.d).padStart(2,"0")}`; };
const toLocalInput = d => { const p=kParts(d); return `${ymd(d)}T${String(p.h).padStart(2,"0")}:${String(p.mi).padStart(2,"0")}`; };
function weekendRange(now=new Date()){
  const p = kParts(now); let offset;
  if (p.dow===5) offset=0; else if (p.dow===6) offset=-1; else if (p.dow===0) offset=-2; else offset=(5-p.dow+7)%7;
  const fri = kDate(p.y,p.m,p.d+offset);
  return {fri, sat:new Date(fri.getTime()+DAY), sun:new Date(fri.getTime()+2*DAY), end:new Date(fri.getTime()+3*DAY+4*HOUR)};
}

/* ---------- Event model ---------- */
const CATS = () => { const base = window.EVENTLY_CATEGORIES.concat(S.newCats||[]); return base.map(c=>Object.assign({},c,S.cats[c.id]||{})); };
const catName = id => (CATS().find(c=>c.id===id)||{name:id}).name;
function venueInfo(name){ return (window.EVENTLY_VENUES[name]) || {area:"",lat:null,lng:null}; }
function hash(s){ let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return (h>>>0); }

function materialize(seed, now){
  const ev = Object.assign({}, seed);
  if (seed.recurring){
    const r = seed.recurring; const [hh,mm] = r.time.split(":").map(Number);
    const p = kParts(now); let d = kDate(p.y,p.m,p.d,hh,mm);
    let add = (r.dow - p.dow + 7) % 7; d = new Date(d.getTime()+add*DAY);
    if (d.getTime() + r.hours*HOUR < now.getTime()) d = new Date(d.getTime()+7*DAY);
    ev.startD = d; ev.endD = new Date(d.getTime()+r.hours*HOUR); ev.isRecurring = true;
  } else if (seed.relDays != null){
    const p = kParts(now); const [hh,mm] = seed.time.split(":").map(Number);
    ev.startD = kDate(p.y,p.m,p.d+seed.relDays,hh,mm); ev.endD = new Date(ev.startD.getTime()+(seed.hours||4)*HOUR);
  } else {
    ev.startD = parseLocal(seed.start); ev.endD = seed.end ? parseLocal(seed.end) : new Date(ev.startD.getTime()+5*HOUR); ev.endAssumed = !seed.end;
  }
  const o = S.overrides[seed.slug]; if (o) { Object.assign(ev, o.fields||{}); if (o.fields && o.fields.start){ ev.startD=parseLocal(o.fields.start); ev.endD = o.fields.end?parseLocal(o.fields.end):new Date(ev.startD.getTime()+5*HOUR);} if (o.featured!=null) ev.featured=o.featured; if (o.removed) ev.removed=true; }
  const v = venueInfo(ev.venue); ev.area = ev.area || v.area || ev.city; ev.lat = ev.lat ?? v.lat; ev.lng = ev.lng ?? v.lng;
  ev.isFree = !!(ev.price && ev.price.free);
  ev.priceFrom = ev.price && ev.price.from || 0;
  ev.status = ev.status || null;
  return ev;
}
function fromSubmission(s){
  return {slug:s.slug,title:s.title,cat:s.cat,tags:s.tags||[],artists:s.artists||[],start:s.start,end:s.end,venue:s.venue,city:s.city,area:s.area,price:s.price,organizer:s.organizer,contact:s.contact,
    desc:s.desc,booking:s.booking,tickets:s.tickets&&s.tickets.url?{url:s.tickets.url,site:s.tickets.site||hostOf(s.tickets.url)}:null,website:s.website,sources:[],verify:"organizer",posterId:s.posterId,posterUrl:s.posterUrl,promo:s.promo||[],videoIds:s.videoIds||[],videoUrl:s.videoUrl,owner:s.owner,status:s.evStatus||null,statusNote:s.statusNote,community:s.community,base:0,created:s.created,lat:s.lat,lng:s.lng};
}
const ARCHIVE_AFTER = 24*3600*1000;
function isArchived(e, t=Date.now()){ return e.status!=="postponed" && (e.endD||e.startD).getTime()+ARCHIVE_AFTER < t; }
function allEvents(opts={}){
  const now = new Date();
  const list = window.EVENTLY_SEED.map(s=>materialize(s,now));
  S.submissions.filter(s=>s.state==="published").forEach(s=>list.push(materialize(fromSubmission(s),now)));
  const hidden = new Set(CATS().filter(c=>c.hidden).map(c=>c.id));
  // Events drop off the site one day after they end (completed or cancelled). Direct links, My Events, galleries and admin still reach them.
  return list.filter(e => (opts.includeRemoved || !e.removed) && (opts.includeRemoved || opts.includeArchived || !isArchived(e, now.getTime())) && !hidden.has(e.cat));
}
let _cache=null,_cacheT=0;
function events(){ const t=Date.now(); if(!_cache || t-_cacheT>15000){ _cache=allEvents(); _cacheT=t; } return _cache; }
function invalidate(){ _cache=null; }
const bySlug = slug => events().find(e=>e.slug===slug) || allEvents({includeRemoved:true}).find(e=>e.slug===slug);
function status(ev, now=Date.now()){
  if (ev.status==="cancelled") return "cancelled";
  if (ev.status==="postponed") return "postponed";
  if (now < ev.startD.getTime()) return "upcoming";
  if (now < ev.endD.getTime()) return "live";
  return "completed";
}
const isActive = ev => { const s=status(ev); return s==="upcoming"||s==="live"; };

/* ---------- Users ---------- */
const me = () => S.users.find(u=>u.id===S.session) || null;
const viewerId = () => S.session || ("guest-"+S.device);
async function sha(s){ try{ const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join(""); }catch(e){ return "h"+hash(s).toString(16); } }

/* ---------- Engagement ---------- */
function base(ev,k){ if(!S.settings.baseline || !ev.base) return 0; const r = (hash(ev.slug+k)%1000)/1000; const f={views:9,shares:.35,saves:.5,interested:.6,going:.22,recent:.08}[k]; return Math.round(ev.base*f*(.8+r*.4)); }
function realCounts(slug){ const l=localCounts(slug); return cloud() ? window.EVCLOUD.countsFor(slug,l) : l; }
function localCounts(slug){
  const users = S.users.map(u=>u.id); let saves=0, interested=0, going=0;
  users.forEach(id=>{ if((S.saved[id]||[]).includes(slug)) saves++; const a=(S.attend[id]||{})[slug]; if(a==="interested") interested++; if(a==="going") going++; });
  const views=(S.views[slug]||[]).length, shares=(S.shares[slug]||[]).length;
  const since = Date.now()-S.settings.recentDays*DAY;
  const recent=(S.views[slug]||[]).filter(v=>v.t>since).length+(S.shares[slug]||[]).filter(v=>v.t>since).length*3;
  return {saves,interested,going,views,shares,recent};
}
function counts(ev){ const r=realCounts(ev.slug); return {views:r.views+base(ev,"views"),shares:r.shares+base(ev,"shares"),saves:r.saves+base(ev,"saves"),interested:r.interested+base(ev,"interested"),going:r.going+base(ev,"going"),recent:r.recent+base(ev,"recent")}; }
function score(ev){ const c=counts(ev), w=S.settings.weights; return c.views*w.views+c.shares*w.shares+c.saves*w.saves+c.interested*w.interested+c.going*w.going+c.recent*S.settings.recentBoost; }
function trending(list){ const act=list.filter(isActive); const sc=act.map(e=>({e,s:score(e)})).sort((a,b)=>(b.s-a.s)||((b.e.base||0)-(a.e.base||0))); const max=sc[0]?sc[0].s:1; return sc.map(x=>Object.assign(x,{pct:Math.max(4,Math.round(100*x.s/max))})); }
function trackView(slug, src){ (S.views[slug]=S.views[slug]||[]).push({t:Date.now(),v:viewerId(),src:src||"direct"}); if(cloud()) window.EVCLOUD.bump(slug,"views"); const ev=bySlug(slug); if(ev){ const vc=S.viewedCats[viewerId()]=S.viewedCats[viewerId()]||{}; vc[ev.cat]=(vc[ev.cat]||0)+1; } persist(); }
function trackShare(slug, ch){ (S.shares[slug]=S.shares[slug]||[]).push({t:Date.now(),v:viewerId(),ch}); if(cloud()) window.EVCLOUD.bump(slug,"shares"); persist(); }
const isSaved = slug => !!(S.session && (S.saved[S.session]||[]).includes(slug));
const attendState = slug => S.session ? (S.attend[S.session]||{})[slug] : null;

/* ---------- Notifications ---------- */
function notify(uid, text, link, kind){ if(cloud() && uid!==S.session) return; const p=prefs(uid); if(kind && p[kind]===false) return; (S.notifs[uid]=S.notifs[uid]||[]).unshift({id:"n"+Date.now()+Math.random().toString(36).slice(2,5),t:Date.now(),text,link,read:false,kind}); S.notifs[uid]=S.notifs[uid].slice(0,80); persist(); if(uid===S.session){ updateBell(); if(p.push && "Notification" in window && Notification.permission==="granted"){ try{ new Notification("Evently",{body:text}); }catch(e){} } } }
function prefs(uid){ return Object.assign({saved:true,going:true,interested:true,changes:true,cancellations:true,newMatches:true,email:true,push:false}, S.prefs[uid]||{}); }
function usersFollowing(slug){ return S.users.filter(u=>(S.saved[u.id]||[]).includes(slug) || (S.attend[u.id]||{})[slug]); }
function followKey(){ return S.session || "guest"; }
function follows(){ return S.follows[followKey()] || []; }
function isFollowing(venue){ return follows().includes(venue); }
function toggleFollow(venue){ const k=followKey(); const l=S.follows[k]||[]; if(l.includes(venue)) S.follows[k]=l.filter(v=>v!==venue); else { S.follows[k]=[...l,venue]; (S.seenAt[k]=S.seenAt[k]||{}); events().filter(e=>e.venue===venue).forEach(e=>S.seenAt[k][e.slug]=1); } persist(); return S.follows[k].includes(venue); }
function followSweep(){ if(cloud() && S.session) return; const k=followKey(); const l=follows(); if(!l.length) return; const seen=S.seenAt[k]=S.seenAt[k]||{}; let fresh=[];
  events().filter(e=>l.includes(e.venue) && isActive(e) && !seen[e.slug]).forEach(e=>{ seen[e.slug]=1; fresh.push(e); });
  if(!fresh.length) return; persist();
  fresh.forEach(e=>{ const text=`New at ${e.venue}: ${e.title}, ${fDate(e.startD)}.`;
    if(S.session) notify(S.session, text, "#event-"+e.slug, "newMatches");
    else if("Notification" in window && Notification.permission==="granted"){ try{ new Notification("Evently", {body:text, icon:"logo-icon.png"}); }catch(_){} } }); }
function reminderSweep(){
  const u=me(); if(!u) return; const now=Date.now();
  const mine = new Set([...(S.saved[u.id]||[]), ...Object.keys(S.attend[u.id]||{})]);
  mine.forEach(slug=>{ const ev=bySlug(slug); if(!ev||!isActive(ev)) return; const dt=ev.startD.getTime()-now;
    const kind = (S.attend[u.id]||{})[slug]==="going" ? "going" : (S.attend[u.id]||{})[slug]==="interested" ? "interested" : "saved";
    [[24*HOUR,"tomorrow-ish","starts within 24 hours"],[2*HOUR,"soon","starts in under 2 hours"]].forEach(([win,key,label])=>{ const rk=u.id+"|"+slug+"|"+key; if(dt>0 && dt<=win && !S.reminded[rk]){ S.reminded[rk]=now; notify(u.id, `${ev.title} ${label}: ${fTime(ev.startD)} at ${ev.venue}.`, "#event-"+slug, kind); } }); });
}
function updateBell(){ const u=me(); const n=u?(S.notifs[u.id]||[]).filter(x=>!x.read).length:0; const b=$("#bellCount"); if(!b) return; b.hidden=!n; b.textContent=n>9?"9+":n; }

/* ---------- Audit ---------- */
function audit(action, target){ const u=me(); S.audit.unshift({t:Date.now(),who:u?u.name:"Unknown",action,target}); S.audit=S.audit.slice(0,300); persist(); }

/* ---------- Formatting ---------- */
const ugx = n => "UGX " + Number(n).toLocaleString("en-UG");
function priceText(ev){ if(!ev.price) return "Price not stated"; if(ev.price.free) return "Free entry"; if(ev.price.from) return "From " + ugx(ev.price.from); return "Price not stated"; }
function statusLabel(st){ return {upcoming:"Upcoming",live:"Happening now",completed:"Event completed",cancelled:"Cancelled",postponed:"Postponed"}[st]; }
function countdownParts(ms){ const s=Math.max(0,Math.floor(ms/1000)); return {d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60}; }
function miniCountdown(ev){ const st=status(ev); if(st==="live") return {text:"Happening now",live:true}; if(st==="completed") return {text:"Ended"}; if(st==="cancelled") return {text:"Cancelled"}; if(st==="postponed") return {text:"Postponed"};
  const d=Math.round((kDayStart(ev.startD)-kDayStart(new Date()))/DAY); return {text: d<=0?"Today":d===1?"Tomorrow":d<7?"In "+d+" days":d<14?"Next week":""}; }
const timeLabel = ev => ev.timeTBC ? `${fTime(ev.startD)} (time to be confirmed)` : fTime(ev.startD);
const verifyBadge = v => v==="verified" ? `<span class="verify v">Verified listing</span>` : v==="partial" ? `<span class="verify p">Partly confirmed</span>` : v==="demo" ? `<span class="verify d">Demo content</span>` : `<span class="verify v">Submitted by organizer</span>`;

/* ---------- Icons ---------- */
const I = {
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/></svg>',
  heartF:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21V4h11l-1.5 4L16 12H5"/></svg>',
  img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
  cats:{
    concerts:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="11" y="3" width="10" height="15" rx="5"/><path d="M7 15a9 9 0 0 0 18 0M16 24v5M11 29h10"/></svg>',
    nightlife:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 5h20L16 17 6 5ZM16 17v10M10 28h12"/><path d="M21 9h.01"/></svg>',
    festivals:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 28 16 5l12 23H4Z"/><path d="M16 5v23M12 28l4-8 4 8"/></svg>',
    comedy:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 6h22v15H14l-6 5v-5H5V6Z"/><path d="M11 12c1.5 3 8.5 3 10 0"/></svg>',
    culture:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M16 3 4 10v2h24v-2L16 3ZM6 12v12M12 12v12M20 12v12M26 12v12M3 28h26"/></svg>',
    sports:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="16" cy="16" r="12"/><path d="m16 9 6 4-2 7h-8l-2-7 6-4Z"/></svg>',
    family:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10" cy="8" r="3.5"/><circle cx="22" cy="8" r="3.5"/><circle cx="16" cy="17" r="2.5"/><path d="M4 28v-5a6 6 0 0 1 6-6M28 28v-5a6 6 0 0 0-6-6M11 28v-2a5 5 0 0 1 10 0v2"/></svg>',
    business:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="10" width="24" height="17" rx="3"/><path d="M12 10V6h8v4M4 17h24"/></svg>',
    food:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 18h24a12 12 0 0 1-24 0ZM16 6v3M10 8l1 3M22 8l-1 3"/></svg>',
    free:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 12V6h6l14 14-8 8L4 14v-2Z"/><circle cx="9.5" cy="10.5" r="1.5"/></svg>',
    other:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="16" cy="16" r="11"/><path d="M16 10v12M10 16h12"/></svg>'
  }
};

/* ---------- Generative posters ---------- */
const PALETTES = [
  {bg:"#111010",fg:"#F97316",hi:"#ffffff"},{bg:"#F97316",fg:"#111010",hi:"#fff7ed"},{bg:"#1d1512",fg:"#fb923c",hi:"#fde7cf"},
  {bg:"#fff4ea",fg:"#ea580c",hi:"#111010"},{bg:"#231a2c",fg:"#F97316",hi:"#f5d0fe"},{bg:"#14241d",fg:"#F97316",hi:"#d9f99d"},{bg:"#0d0d0d",fg:"#fdba74",hi:"#F97316"}
];
function rng(seed){ let s=seed||1; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%10000)/10000; }; }
function posterArt(ev, W=800, H=1000){
  const h = hash(ev.slug), r = rng(h), P = PALETTES[h % PALETTES.length];
  const cx = W*(.25+r()*.5), cy = H*(.25+r()*.35); let g = "";
  switch(ev.cat){
    case "concerts": for(let i=14;i>0;i--) g+=`<circle cx="${cx}" cy="${cy}" r="${i*W/16}" fill="none" stroke="${i%3?P.fg:P.hi}" stroke-opacity="${.15+i%3*.25}" stroke-width="${W/90}"/>`; g+=`<circle cx="${cx}" cy="${cy}" r="${W/7}" fill="${P.fg}"/>`; break;
    case "nightlife": { for(let x=0;x<W;x+=W/16) for(let y=0;y<H;y+=W/16){ const d=Math.hypot(x-cx,y-cy)/W; g+=`<circle cx="${x}" cy="${y}" r="${Math.max(.6,W/50*(1-d))}" fill="${P.fg}" opacity="${Math.max(.08,1-d*1.3)}"/>`; } for(let i=0;i<4;i++){ const a=-.9+i*.5+r()*.2; g+=`<path d="M${cx} ${cy} L${cx+Math.cos(a)*W*1.6} ${cy+Math.sin(a)*H*1.6} L${cx+Math.cos(a+.12)*W*1.6} ${cy+Math.sin(a+.12)*H*1.6}Z" fill="${P.hi}" opacity=".10"/>`; } break; }
    case "festivals": for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, b=a+Math.PI/24; g+=`<path d="M${cx} ${cy} L${cx+Math.cos(a)*W*2} ${cy+Math.sin(a)*W*2} L${cx+Math.cos(b)*W*2} ${cy+Math.sin(b)*W*2}Z" fill="${i%2?P.fg:P.hi}" opacity="${i%2?.9:.12}"/>`; } g+=`<circle cx="${cx}" cy="${cy}" r="${W/6}" fill="${P.bg}"/><circle cx="${cx}" cy="${cy}" r="${W/9}" fill="${P.fg}"/>`; break;
    case "comedy": for(let i=0;i<5;i++){ const y=H*.12+i*H*.17; let d=`M0 ${y}`; for(let x=0;x<=W;x+=W/10) d+=` L${x} ${y+(x/(W/10)%2?-H*.05:H*.05)}`; g+=`<path d="${d}" fill="none" stroke="${i%2?P.fg:P.hi}" stroke-width="${W/26}" opacity="${i%2?1:.35}" stroke-linejoin="round"/>`; } g+=`<rect x="${W*.12}" y="${H*.18}" width="${W*.5}" height="${H*.24}" rx="${W*.08}" fill="${P.fg}"/><path d="M${W*.22} ${H*.42} l${W*.04} ${H*.08} l${W*.08} ${-H*.08}Z" fill="${P.fg}"/>`; break;
    case "culture": { const s=W/8; for(let y=0;y<H;y+=s) for(let x=0;x<W;x+=s){ const k=(x/s+y/s)%4; const c=k===0?P.fg:k===2?P.hi:"none"; if(c!=="none") g+= (x/s)%2 ? `<path d="M${x} ${y+s} L${x+s/2} ${y} L${x+s} ${y+s}Z" fill="${c}" opacity="${k===2?.25:.9}"/>` : `<path d="M${x} ${y} L${x+s} ${y} L${x+s/2} ${y+s}Z" fill="${c}" opacity="${k===2?.25:.9}"/>`; } break; }
    case "sports": for(let i=0;i<9;i++) g+=`<ellipse cx="${W*.5}" cy="${H*1.05}" rx="${W*(.3+i*.12)}" ry="${H*(.22+i*.1)}" fill="none" stroke="${i%2?P.fg:P.hi}" stroke-width="${W/40}" opacity="${i%2?.95:.25}"/>`; g+=`<circle cx="${cx}" cy="${H*.3}" r="${W/10}" fill="${P.fg}"/>`; break;
    case "family": for(let i=0;i<34;i++){ const x=r()*W,y=r()*H*.8,s=W/40+r()*W/14; g+= i%3 ? `<circle cx="${x}" cy="${y}" r="${s}" fill="${i%2?P.fg:P.hi}" opacity="${i%2?.95:.3}"/>` : `<rect x="${x}" y="${y}" width="${s*1.6}" height="${s*1.6}" rx="${s*.4}" transform="rotate(${r()*90} ${x} ${y})" fill="${P.fg}" opacity=".6"/>`; } break;
    case "business": for(let x=0;x<=W;x+=W/12) g+=`<path d="M${x} 0V${H}" stroke="${P.hi}" stroke-opacity=".08"/>`; for(let y=0;y<=H;y+=W/12) g+=`<path d="M0 ${y}H${W}" stroke="${P.hi}" stroke-opacity=".08"/>`; for(let i=0;i<6;i++){ const bh=H*(.12+r()*.35); g+=`<rect x="${W*.1+i*W*.14}" y="${H*.62-bh}" width="${W*.09}" height="${bh}" rx="${W*.012}" fill="${i===3?P.hi:P.fg}" opacity="${i===3?.9:.85}"/>`; } break;
    case "food": for(let i=0;i<7;i++) g+=`<path d="M${-W*.1} ${H*.2+i*H*.09} Q ${W*.25} ${H*.12+i*H*.09} ${W*.5} ${H*.2+i*H*.09} T ${W*1.1} ${H*.2+i*H*.09}" fill="none" stroke="${i%2?P.fg:P.hi}" stroke-width="${W/34}" opacity="${i%2?.95:.3}" stroke-linecap="round"/>`; g+=`<circle cx="${cx}" cy="${H*.38}" r="${W/7}" fill="${P.fg}"/>`; break;
    default: for(let i=0;i<10;i++) g+=`<rect x="${r()*W}" y="${r()*H*.7}" width="${W/4}" height="${W/4}" rx="${W/12}" fill="${P.fg}" opacity="${.2+r()*.6}"/>`;
  }
  return {svg:`<rect width="${W}" height="${H}" fill="${P.bg}"/>${g}`, P};
}
function posterSVG(ev, opts={}){
  const W=800,H=opts.h||1000; const {svg,P}=posterArt(ev,W,H);
  const words = ev.title.toUpperCase(); const size = words.length>34?62:words.length>20?74:92;
  const lines = wrapWords(words, size>80?13:size>70?16:19);
  const tY = H - 90 - lines.length*size*.98;
  const text = opts.text===false ? "" : `<rect x="0" y="${tY-60}" width="${W}" height="${H-tY+60}" fill="url(#fade${hash(ev.slug)%999})"/>`+
    lines.map((l,i)=>`<text x="48" y="${tY+i*size*.98+size*.8}" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="${size}" letter-spacing="-2" fill="#fff">${esc(l)}</text>`).join("")+
    `<text x="50" y="${H-44}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="26" fill="${P.fg==="#111010"?"#fff7ed":P.fg}">${esc(fDate(ev.startD).toUpperCase())} · ${esc((ev.area||ev.city||"").toUpperCase())}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(ev.title)} poster"><defs><linearGradient id="fade${hash(ev.slug)%999}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".45" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient></defs>${svg}${text}</svg>`;
}
function wrapWords(s, n){ const w=s.split(/\s+/); const out=[]; let cur=""; w.forEach(x=>{ if((cur+" "+x).trim().length>n && cur){ out.push(cur); cur=x; } else cur=(cur+" "+x).trim(); }); if(cur) out.push(cur); return out.slice(0,4); }
function posterSrc(ev){ if(ev.posterUrl) return ev.posterUrl; if(ev.posterId && mediaURL(ev.posterId)) return mediaURL(ev.posterId); if(window.EVENTLY_POSTERS && EVENTLY_POSTERS.has(ev.slug)) return `posters/${ev.slug}.webp`; return null; }
function posterHTML(ev, opts={}){ const src=posterSrc(ev); if(!src) return posterSVG(ev, opts);
  if(opts.full) return `<img class="pbg" src="${src}" alt="" aria-hidden="true"><img class="pfull" src="${src}" alt="${esc(ev.title)} poster">`;
  return `<img src="${src}" alt="${esc(ev.title)} poster" loading="lazy" class="preal">`; }

/* ---------- Shared UI ---------- */
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.textContent=msg; $("#toasts").appendChild(t); setTimeout(()=>t.remove(),3200); }
function modal(html, cls=""){
  closeModal(); const m=document.createElement("div"); m.className="modal"; m.innerHTML=`<div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  m.addEventListener("click",e=>{ if(e.target===m || e.target.closest("[data-close]")) closeModal(); });
  $("#layer").appendChild(m); const f=m.querySelector("input,select,textarea,button:not([data-close])"); if(f) setTimeout(()=>f.focus(),30); return m.firstElementChild;
}
function closeModal(){ $("#layer").innerHTML=""; }
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeModal(); });
async function copyText(t){ try{ await navigator.clipboard.writeText(t); toast("Link copied"); }catch(e){ const m=modal(`<div class="modal-head"><h3>Copy this link</h3><button class="icon-btn" data-close aria-label="Close">${I.x}</button></div><input class="input" id="copyField" readonly value="${esc(t)}"><p class="small muted">Your browser blocked automatic copying. The link is selected, so press Ctrl+C or long-press to copy.</p>`); const f=m.querySelector("#copyField"); f.focus(); f.select(); } }
const eventURL = slug => `${SITE}/events/${slug}`;

// "12 likes · 8 going": shown on cards once anyone has liked or is going.
function socialText(ev){ const c=counts(ev); const bits=[]; if(c.saves) bits.push(`${c.saves} like${c.saves===1?"":"s"}`); if(c.going) bits.push(`${c.going} going`); return bits.join(" · "); }
function socialLine(ev){ const t=socialText(ev); return t?`<div class="meta social">${I.heartF}<span>${t}</span></div>`:""; }
function card(ev, opts={}){
  const st=status(ev); const cd=miniCountdown(ev); const saved=isSaved(ev.slug);
  let flag="";
  if (st==="cancelled") flag=`<span class="flag bad">Cancelled</span>`;
  else if (st==="postponed") flag=`<span class="flag bad">Postponed</span>`;
  else if (ev.verify==="demo") flag=`<span class="flag demo">Demo</span>`;
  else if (opts.rank) flag=`<span class="flag hot">#${opts.rank}</span>`;
  const flags=[flag];
  const tix = ev.tickets && safeUrl(ev.tickets.url) && isActive(ev);
  return `<article class="card fade-in">
    <a class="cover" href="#event-${ev.slug}" data-src="${opts.src||"card"}" aria-label="${esc(ev.title)}"><div class="poster">${posterHTML(ev,{text:false})}<div class="flags">${flags.join("")}</div></div></a>
    <button class="save-fab" data-save="${ev.slug}" aria-pressed="${saved}" aria-label="${saved?"Remove from saved":"Save event"}">${saved?I.heartF:I.heart}</button>
    <div class="card-body">
      <span class="cat-tag">${esc(catName(ev.cat))}</span>
      <h3><a href="#event-${ev.slug}" data-src="${opts.src||"card"}">${esc(ev.title)}</a></h3>
      <div class="meta">${I.cal}<span>${esc(fDate(ev.startD))} · ${esc(fTime(ev.startD))}</span></div>
      <div class="meta">${I.pin}<span>${esc(ev.venue)}${ev.city && ev.city!=="Kampala" ? ", "+esc(ev.city):""}</span></div>
      ${tix?`<div class="meta tix-note">${I.ext}<span>Tickets sold online</span></div>`:""}
      ${socialLine(ev)}
    </div>
    <div class="card-foot"><span class="price">${esc(priceText(ev))}</span><span class="cd-mini ${cd.live?"live":""}" data-cd="${ev.slug}">${esc(cd.text)}</span></div>
  </article>`;
}
const foldOpen={};
function fold(id, label, count, inner){ const open=!!foldOpen[id];
  return `<div class="fold"><button type="button" class="fold-btn" data-fold="${id}" aria-expanded="${open}" aria-controls="fold-${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>${esc(label)}<span class="qf-n" id="foldn-${id}" ${count?"":"hidden"}>${count||""}</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button><div class="fold-panel" id="fold-${id}" ${open?"":"hidden"}>${inner}</div></div>`; }
function foldCount(id,n){ const b=document.getElementById("foldn-"+id); if(b){ b.hidden=!n; b.textContent=n||""; } }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-fold]"); if(!b) return; const id=b.dataset.fold; foldOpen[id]=!foldOpen[id]; const p=document.getElementById("fold-"+id); if(p) p.hidden=!foldOpen[id]; document.querySelectorAll(`.fold-btn[data-fold="${id}"]`).forEach(x=>x.setAttribute("aria-expanded",String(!!foldOpen[id]))); });
function tile(ev, opts={}){
  const st=status(ev); const cd=miniCountdown(ev);
  const badge = st==="cancelled"?`<span class="flag bad">Cancelled</span>`:st==="postponed"?`<span class="flag bad">Postponed</span>`:ev.verify==="demo"?`<span class="flag demo">Demo</span>`:"";
  return `<a class="tile${opts.rank?" ranked":""}" href="#event-${ev.slug}" data-src="${opts.src||"tile"}">${opts.rank?`<span class="rank-n" aria-hidden="true">${opts.rank}</span>`:""}
    <span class="tile-poster poster">${posterHTML(ev,{text:false})}${badge?`<span class="flags">${badge}</span>`:""}</span>
    <span class="tile-body"><b>${esc(ev.title)}</b><span>${esc(cd.text&&cd.text!=="Ended"?cd.text:fDate(ev.startD))} · ${esc(fTime(ev.startD))}</span><span>${esc(ev.venue)}</span>${socialText(ev)?`<span class="tile-social">♥ ${socialText(ev)}</span>`:""}</span></a>`;
}
function row(ev, extra=""){
  return `<div class="row fade-in"><a href="#event-${ev.slug}" class="poster" style="display:block">${posterHTML(ev,{text:false})}</a>
    <div><span class="cat-tag">${esc(catName(ev.cat))}</span><h3><a class="link" style="color:inherit" href="#event-${ev.slug}">${esc(ev.title)}</a></h3>
    <div class="meta">${I.cal}<span>${esc(fDate(ev.startD))} · ${esc(fTime(ev.startD))}</span></div><div class="meta">${I.pin}<span>${esc(ev.venue)}</span></div>${socialLine(ev)}
    <div class="small"><b>${esc(priceText(ev))}</b> · <span class="cd-mini" data-cd="${ev.slug}">${esc(miniCountdown(ev).text)}</span></div></div>
    <div class="row-actions">${extra || `<button class="btn btn-ghost btn-sm" data-save="${ev.slug}" aria-pressed="${isSaved(ev.slug)}">${isSaved(ev.slug)?"Saved":"Save"}</button>`}</div></div>`;
}
const empty = (title, text, action="") => `<div class="empty"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="34" fill="var(--accent-soft)"/><rect x="22" y="26" width="36" height="30" rx="6" stroke="var(--accent-ink)" stroke-width="3"/><path d="M22 35h36M31 21v9M49 21v9" stroke="var(--accent-ink)" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="46" r="3.5" fill="var(--accent)"/></svg><h3>${title}</h3><p>${text}</p>${action}</div>`;
const skeletonGrid = n => `<div class="grid">${Array.from({length:n},()=>`<div class="skel" style="height:330px"></div>`).join("")}</div>`;

function setHead(title, desc, ld){
  document.title = title;
  let m = $('meta[name="description"]'); if(!m){ m=document.createElement("meta"); m.name="description"; document.head.appendChild(m); } m.content = desc;
  [["og:title",title],["og:description",desc],["og:type",ld?"event":"website"],["twitter:card","summary_large_image"]].forEach(([p,v])=>{ let t=document.head.querySelector(`meta[property="${p}"]`); if(!t){ t=document.createElement("meta"); t.setAttribute("property",p); document.head.appendChild(t);} t.content=v; });
  let s=$("#ld-json"); if(s) s.remove(); if(ld){ s=document.createElement("script"); s.type="application/ld+json"; s.id="ld-json"; s.textContent=JSON.stringify(ld).replace(/</g,"\\u003c"); document.head.appendChild(s); }
}

/* Downloads capability (optional) */
let dlNS = null;
try { if (window.claude && window.claude.use) window.claude.use("downloads").then(n=>{dlNS=n}).catch(()=>{}); } catch(e){}
async function saveFile(filename, blob){
  if (dlNS){ try{ await dlNS.save({filename, data:blob}); toast("Saved "+filename); return true; }catch(e){ if(e && e.code==="declined") { toast("Download cancelled"); return false; } } }
  try{ const u=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=u; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); toast("Saved "+filename); return true; }catch(e){}
  return false;
}

window.EV = {$,$$,esc,safeUrl,SITE,HOUR,DAY,S,persist,putBlob,delBlob,mediaURL,resizeImage,loadAllBlobs,parseLocal,kParts,kDate,kDayStart,fmt,fDate,fDateLong,fTime,ymd,toLocalInput,weekendRange,
  CATS,catName,venueInfo,hash,events,allEvents,invalidate,bySlug,status,isActive,me,viewerId,sha,counts,realCounts,score,trending,trackView,trackShare,isSaved,attendState,
  notify,prefs,usersFollowing,reminderSweep,follows,isFollowing,toggleFollow,followSweep,tile,fold,foldCount,updateBell,audit,ugx,priceText,statusLabel,countdownParts,miniCountdown,timeLabel,verifyBadge,I,posterArt,posterSVG,posterHTML,posterSrc,hostOf,isArchived,cloud,socialLine,
  toast,modal,closeModal,copyText,eventURL,card,row,empty,skeletonGrid,setHead,saveFile,PALETTES,wrapWords,DEFAULT_SETTINGS};
})();
