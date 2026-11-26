/* Evently pages part 3: organizer dashboard, admin, static pages, SEO files, router and boot. */
(function(){
"use strict";
const E = window.EV; const {$,$$,esc,I,S} = E; const R = window.EVROUTES;

/* ---------- Charts ---------- */
function barChart(series, labels){
  const W=640,H=200,pl=36,pb=26,pt=12; const max=Math.max(1,...series); const step=Math.ceil(max/4)||1; const top=step*4;
  const bw=(W-pl-10)/series.length;
  let g=""; for(let i=0;i<=4;i++){ const y=pt+(H-pt-pb)*(1-i/4); g+=`<path d="M${pl} ${y}H${W-6}" stroke="var(--line)"/><text x="${pl-8}" y="${y+4}" text-anchor="end" font-size="11" fill="var(--ink3)" font-family="JetBrains Mono, monospace">${step*i}</text>`; }
  series.forEach((v,i)=>{ const h=(H-pt-pb)*v/top; const x=pl+i*bw+bw*.18; g+=`<rect x="${x}" y="${H-pb-h}" width="${bw*.64}" height="${Math.max(0,h)}" rx="3" fill="var(--accent)"><title>${labels[i]}: ${v}</title></rect>`; if(series.length<=14 || i%Math.ceil(series.length/10)===0) g+=`<text x="${x+bw*.32}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--ink3)" font-family="Inter, sans-serif">${labels[i]}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Views per day">${g}</svg>`;
}
function hbars(obj){ const ent=Object.entries(obj).sort((a,b)=>b[1]-a[1]); const max=Math.max(1,...ent.map(e=>e[1])); return ent.length?ent.map(([k,v])=>`<div style="display:grid;grid-template-columns:120px 1fr 40px;gap:10px;align-items:center;font-size:.86rem"><span>${esc(k)}</span><div class="bar" style="margin:0;height:10px"><i style="width:${100*v/max}%"></i></div><b class="mono" style="text-align:right">${v}</b></div>`).join(""):`<p class="small muted">No traffic recorded in this period.</p>`; }
const SRC_NAMES={"home-featured":"Homepage","home-trending":"Homepage","home-weekend":"Homepage","home-match":"Recommendations",discover:"Discover",weekend:"Weekend planner",radar:"Radar",related:"Related events",near:"Near me",deals:"Deals",categories:"Categories",card:"Event cards",direct:"Direct link or share",internal:"Evently pages"};

/* ---------- Organizer dashboard ---------- */
R.orgTab="overview"; R.orgRange=14; R.orgEvent="";
R.organizers = function(app){
  E.setHead("For organizers: list your event on Evently","List your events on Evently for free. Reach people looking for concerts, parties and nightlife in Uganda, share posters, and track views and interest.");
  const u=E.me();
  if(!u){ app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">For organizers</span><h1>Fill the room.<br>List it on Evently.</h1><p class="muted" style="font-size:1.05rem">Free event listings for concerts, parties, bar nights, festivals, comedy and more. Evently doesn't sell tickets, so you keep your own booking link and your own customers.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><button class="btn btn-primary" id="oReg">Create an organizer account</button><button class="btn btn-ghost" id="oLog">Log in</button></div></div>
      <div class="grid section">${[["Submit in minutes","Name, date, venue, poster and your booking link. Our moderators approve listings, usually the same day."],["Share everywhere","One-tap WhatsApp sharing and ready-made posters for Instagram, WhatsApp Status and Facebook, each with a QR code."],["See what's working","Views, unique visitors, shares, saves and attendance interest, with traffic sources and date filters."],["Keep it accurate","Change dates, swap posters, or cancel. People who saved your event are notified automatically."]].map(([h,p])=>`<div class="panel"><h3>${h}</h3><p class="small muted">${p}</p></div>`).join("")}</div></div>`;
    $("#oReg").onclick=()=>R.authModal("register","Create an account to submit events."); $("#oLog").onclick=()=>R.authModal("login"); return; }
  const mine=S.submissions.filter(s=>s.owner===u.id);
  const tabs=[["overview","Analytics"],["create","Create event"],["manage","My events",mine.length],["media","Aftermovie uploads"]];
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Organizer dashboard</span><h1 style="font-size:clamp(2rem,4.5vw,3rem)">${esc(u.name)}</h1></div>
    <div class="dash section" style="padding-top:20px"><nav class="side" aria-label="Organizer sections">${tabs.map(([k,l,c])=>`<button data-ot="${k}" aria-current="${R.orgTab===k}">${l}${c!=null?`<span class="ct">${c}</span>`:""}</button>`).join("")}</nav><div id="orgBody" style="min-width:0;display:grid;gap:20px"></div></div></div>`;
  app.onclick=e=>{ const t=e.target.closest("[data-ot]"); if(t){ R.orgTab=t.dataset.ot; R.orgEdit=null; R.organizers(app); } };
  const body=$("#orgBody");
  ({overview:orgOverview,create:orgForm,manage:orgManage,media:orgMedia}[R.orgTab]||orgOverview)(body,u,mine);
};
function orgOverview(body,u,mine){
  const pub=mine.filter(s=>s.state==="published");
  if(!pub.length){ body.innerHTML=E.empty("No published events yet","Analytics start once an event is approved and people start viewing it. Submit your first event to get going.",`<button class="btn btn-primary" data-ot="create">Create an event</button>`); return; }
  const sel=R.orgEvent && pub.find(s=>s.slug===R.orgEvent) ? [R.orgEvent] : pub.map(s=>s.slug);
  const since=Date.now()-R.orgRange*E.DAY;
  let views=[],shares=[],saves=0,interested=0,going=0;
  sel.forEach(s=>{ views=views.concat((S.views[s]||[]).filter(v=>v.t>=since)); shares=shares.concat((S.shares[s]||[]).filter(v=>v.t>=since)); const rc=E.realCounts(s); saves+=rc.saves; interested+=rc.interested; going+=rc.going; });
  const uniq=new Set(views.map(v=>v.v)).size;
  const days=[...Array(R.orgRange)].map((_,i)=>new Date(E.kDayStart(new Date()).getTime()-(R.orgRange-1-i)*E.DAY));
  const perDay=days.map(d=>views.filter(v=>v.t>=d.getTime()&&v.t<d.getTime()+E.DAY).length);
  const srcs={}; views.forEach(v=>{ const k=SRC_NAMES[v.src]||v.src; srcs[k]=(srcs[k]||0)+1; });
  const chs={}; shares.forEach(v=>{ chs[v.ch]=(chs[v.ch]||0)+1; });
  body.innerHTML=`<div class="toolbar" style="margin:0"><div style="display:flex;gap:10px;flex-wrap:wrap"><label class="sr" for="oEv">Event</label><select class="input" id="oEv" style="width:auto"><option value="">All published events</option>${pub.map(s=>`<option value="${s.slug}" ${R.orgEvent===s.slug?"selected":""}>${esc(s.title)}</option>`).join("")}</select>
    <div class="seg" role="group" aria-label="Date range">${[7,14,30].map(n=>`<button data-or="${n}" aria-pressed="${R.orgRange===n}">${n} days</button>`).join("")}</div></div></div>
    <div class="stats">${[["Total views",views.length],["Unique visitors",uniq],["Shares",shares.length],["Saves",saves],["Interested",interested],["Attending",going]].map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    <div class="panel"><h3>Views per day</h3>${barChart(perDay, days.map(d=>E.fmt(d,{day:"numeric",month:"short"})))}</div>
    <div class="form-grid"><div class="panel"><h3>Traffic sources</h3>${hbars(srcs)}</div><div class="panel"><h3>Shares by channel</h3>${hbars(chs)}</div></div>
    <p class="tiny muted">These numbers are real activity recorded by Evently for your events. In this preview, activity is recorded on this device only. Saves, interested and attending are current totals.</p>`;
  $("#oEv").onchange=e=>{ R.orgEvent=e.target.value; orgOverview(body,u,mine); };
  body.onclick=e=>{ const r=e.target.closest("[data-or]"); if(r){ R.orgRange=+r.dataset.or; orgOverview(body,u,mine); } };
}
const slugify=s=>s.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
function orgForm(body,u,mine,editSlug){
  const s = editSlug ? S.submissions.find(x=>x.slug===editSlug) : (R.orgDraft||null);
  const v=k=>esc(s&&s[k]!=null?s[k]:"");
  const locs=Object.keys(window.EVENTLY_VENUES).filter(n=>!/demo|to be announced/i.test(n)).sort();
  body.innerHTML=`<form class="panel" id="evF" novalidate><h3>${editSlug?"Edit event":"Create an event"}</h3>
    ${editSlug&&s.state==="published"?`<p class="notice">${I.info}<span>Changes to a published event go live straight away. People who saved it are told about date or venue changes.</span></p>`:""}
    ${s&&s.feedback?`<p class="notice">${I.info}<span><b>Moderator feedback:</b> ${esc(s.feedback)}</span></p>`:""}
    <div class="form-grid">
     <div class="field full"><label for="fT">Event name</label><input class="input" id="fT" maxlength="90" value="${v("title")}" required></div>
     <div class="field"><label for="fC">Category</label><select class="input" id="fC">${E.CATS().filter(c=>!c.virtual&&!c.hidden).map(c=>`<option value="${c.id}" ${s&&s.cat===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
     <div class="field"><label for="fOrg">Organizer name</label><input class="input" id="fOrg" maxlength="80" value="${s?v("organizer"):esc(u.name)}"></div>
     <div class="field"><label for="fS">Starts</label><input class="input" type="datetime-local" id="fS" value="${v("start")}"></div>
     <div class="field"><label for="fE">Ends</label><input class="input" type="datetime-local" id="fE" value="${v("end")}"></div>
     <div class="field"><label for="fV">Venue</label><input class="input" id="fV" list="venues" maxlength="80" value="${v("venue")}"><datalist id="venues">${locs.map(l=>`<option value="${esc(l)}">`).join("")}</datalist></div>
     <div class="field"><label for="fCity">City or town</label><input class="input" id="fCity" maxlength="40" value="${s?v("city"):"Kampala"}"></div>
     <div class="field full"><label for="fD">Description</label><textarea class="input" id="fD" maxlength="2000">${v("desc")}</textarea><span class="tiny muted">At least 40 characters. Say who's performing, what to expect and any age limits.</span></div>
     <div class="field"><label for="fA">Artists or lineup</label><input class="input" id="fA" placeholder="Comma separated" value="${s?esc((s.artists||[]).join(", ")):""}"></div>
     <div class="field"><label for="fTags">Tags</label><input class="input" id="fTags" placeholder="afrobeats, bar night" value="${s?esc((s.tags||[]).join(", ")):""}"></div>
     <div class="field"><span class="small" style="font-weight:600">Entry</span><div class="seg" role="group"><button type="button" data-pt="free" aria-pressed="${!!(s&&s.price&&s.price.free)}">Free</button><button type="button" data-pt="paid" aria-pressed="${!(s&&s.price&&s.price.free)}">Paid</button></div></div>
     <div class="field" id="priceF"><label for="fP">Starting price (UGX, information only)</label><input class="input" id="fP" inputmode="numeric" value="${s&&s.price&&s.price.from?s.price.from:""}"></div>
     <div class="field"><label for="fB">Official booking link</label><input class="input" id="fB" type="url" placeholder="https://" value="${v("booking")}"></div>
     <div class="field"><label for="fTk">Online ticket link (optional)</label><input class="input" id="fTk" type="url" placeholder="https:// your ticket seller page" value="${s&&s.tickets?esc(s.tickets.url):""}"></div>
     <div class="field"><label for="fW">Event website</label><input class="input" id="fW" type="url" placeholder="https://" value="${v("website")}"></div>
     <div class="field full"><label for="fCt">Public contact (phone or email)</label><input class="input" id="fCt" maxlength="80" value="${v("contact")}"></div>
     <div class="field"><label for="fPo">Event poster</label><input type="file" id="fPo" accept="image/*">${s&&s.posterId&&E.mediaURL(s.posterId)?`<img src="${E.mediaURL(s.posterId)}" alt="Current poster" style="width:90px;border-radius:8px;margin-top:6px">`:""}</div>
     <div class="field"><label for="fPr">Promotional images (up to 4)</label><input type="file" id="fPr" accept="image/*" multiple></div>
     <div class="field"><label for="fVid">Promo video (MP4 or WebM, up to 25 MB)</label><input type="file" id="fVid" accept="video/mp4,video/webm"></div>
     <div class="field"><label for="fVu">Or a video link</label><input class="input" id="fVu" type="url" placeholder="https://youtube.com/…" value="${v("videoUrl")}"></div>
     <div class="field full"><span class="small" style="font-weight:600">Optional promotion for Evently Deals</span><div class="form-grid"><select class="input" id="fDk"><option value="">No promotion</option>${["Free event","Discounted offer","Giveaway","Early promotion","Last-minute deal"].map(k=>`<option ${s&&s.deal&&s.deal.kind===k?"selected":""}>${k}</option>`).join("")}</select><input class="input" id="fDt" maxlength="80" placeholder="e.g. Early bird UGX 30,000" value="${s&&s.deal?esc(s.deal.title||""):""}"><input class="input" id="fDu" type="datetime-local" value="${s&&s.deal?esc(s.deal.until||""):""}" aria-label="Promotion valid until"><input class="input" id="fDd" maxlength="160" placeholder="Short description" value="${s&&s.deal?esc(s.deal.desc||""):""}"></div></div>
     <label class="check full"><input type="checkbox" id="fCom" ${s&&s.community?"checked":""}> Let attendees submit photos and videos after the event (moderated)</label>
     <input type="text" id="fHp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
    </div>
    <div class="err" id="fErr" role="alert"></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary" data-act="submit">${editSlug&&s.state==="published"?"Save changes":"Submit for approval"}</button>${editSlug?`<button type="button" class="btn btn-ghost" data-act="cancel-edit">Cancel</button>`:""}</div>
  </form>`;
  let paid=!(s&&s.price&&s.price.free); const pf=$("#priceF"); pf.hidden=!paid;
  body.querySelectorAll("[data-pt]").forEach(b=>b.onclick=()=>{ paid=b.dataset.pt==="paid"; body.querySelectorAll("[data-pt]").forEach(x=>x.setAttribute("aria-pressed",x===b)); pf.hidden=!paid; });
  const ce=body.querySelector("[data-act=cancel-edit]"); if(ce) ce.onclick=()=>{ R.orgTab="manage"; R.render(); };
  $("#evF").onsubmit=async e=>{ e.preventDefault(); const err=$("#fErr"); err.textContent="";
    if($("#fHp").value) return;
    const t=$("#fT").value.trim(), st=$("#fS").value, en=$("#fE").value, ven=$("#fV").value.trim(), d=$("#fD").value.trim(), bk=$("#fB").value.trim(), ws=$("#fW").value.trim(), vu=$("#fVu").value.trim();
    const problems=[];
    if(t.length<4) problems.push("Add an event name.");
    if(!st) problems.push("Add a start date and time."); else if(!editSlug && E.parseLocal(st).getTime()<Date.now()) problems.push("The start time is in the past.");
    if(en && st && E.parseLocal(en)<=E.parseLocal(st)) problems.push("The end time must be after the start.");
    if(ven.length<3) problems.push("Add a venue.");
    if(d.length<40) problems.push("Write a description of at least 40 characters.");
    const tk=$("#fTk").value.trim();
    [[tk,"ticket link"],[bk,"booking link"],[ws,"website"],[vu,"video link"]].forEach(([x,l])=>{ if(x && !/^https:\/\/[^\s]+\.[^\s]+/.test(x)) problems.push(`The ${l} must start with https://`); });
    const price=paid?(+$("#fP").value.replace(/[^\d]/g,"")||0):0; if(paid && $("#fP").value && !price) problems.push("Enter the price as a number.");
    if(/(.)\1{9,}/.test(t+d) || (d.match(/https?:\/\//g)||[]).length>3) problems.push("This looks like spam. Remove repeated characters or extra links.");
    if(!editSlug){ const recent=S.submissions.filter(x=>x.owner===u.id && Date.now()-x.created<3600e3).length; if(recent>=5) problems.push("You've submitted 5 events in the last hour. Please wait before submitting more."); }
    if(problems.length){ err.innerHTML=problems.map(esc).join("<br>"); return; }
    let rec = s && editSlug ? s : {slug:null,owner:u.id,created:Date.now(),state:"pending",promo:[],videoIds:[]};
    const before = editSlug ? {start:rec.start,venue:rec.venue} : null;
    try{
      const po=$("#fPo").files[0]; if(po){ const b=await E.resizeImage(po,1000,.84); if(rec.posterId) E.delBlob(rec.posterId); rec.posterId=E.putBlob(b); }
      const pr=[...$("#fPr").files].slice(0,4); if(pr.length){ (rec.promo||[]).forEach(E.delBlob); rec.promo=[]; for(const f of pr){ rec.promo.push(E.putBlob(await E.resizeImage(f,1200,.82))); } }
      const vf=$("#fVid").files[0]; if(vf){ if(!/^video\/(mp4|webm)$/.test(vf.type)) throw new Error("Use an MP4 or WebM video."); if(vf.size>25e6) throw new Error("The video is over 25 MB."); (rec.videoIds||[]).forEach(E.delBlob); rec.videoIds=[E.putBlob(vf)]; }
    }catch(x){ err.textContent=x.message; return; }
    Object.assign(rec,{title:t,cat:$("#fC").value,organizer:$("#fOrg").value.trim()||u.name,start:st,end:en||"",venue:ven,city:$("#fCity").value.trim()||"Kampala",desc:d,artists:$("#fA").value.split(",").map(x=>x.trim()).filter(Boolean),tags:$("#fTags").value.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean),
      price:paid?(price?{from:price}:{note:"Paid entry. Price not stated."}):{free:true},booking:bk,tickets:tk?{url:tk}:null,website:ws,videoUrl:vu,contact:$("#fCt").value.trim(),community:$("#fCom").checked,
      deal:$("#fDk").value&&$("#fDt").value.trim()?{kind:$("#fDk").value,title:$("#fDt").value.trim(),desc:$("#fDd").value.trim(),until:$("#fDu").value||st}:null});
    if(!rec.slug){ let base=slugify(t)||"event"; let sl=base,i=2; while(E.bySlug(sl)||S.submissions.some(x=>x.slug===sl)) sl=base+"-"+(i++); rec.slug=sl; S.submissions.unshift(rec); E.audit("Submitted event",rec.title); }
    else if(rec.state==="rejected"){ rec.state="pending"; rec.feedback=""; }
    if(before && rec.state==="published" && (before.start!==rec.start || before.venue!==rec.venue)){ E.usersFollowing(rec.slug).forEach(x=>E.notify(x.id,`${rec.title} has changed: now ${E.fDate(E.parseLocal(rec.start))}, ${E.fTime(E.parseLocal(rec.start))} at ${rec.venue}.`,"#event-"+rec.slug,"changes")); }
    R.orgDraft=null; E.invalidate(); E.persist(); E.toast(editSlug&&rec.state==="published"?"Changes saved":"Submitted. A moderator will review it shortly."); R.orgTab="manage"; R.render();
  };
}
function orgManage(body,u,mine){
  if(R.orgEdit){ orgForm(body,u,mine,R.orgEdit); return; }
  if(!mine.length){ body.innerHTML=E.empty("You haven't submitted any events","Create your first listing. It's free.",`<button class="btn btn-primary" data-ot="create">Create an event</button>`); return; }
  const groups=[["published","Published"],["pending","Waiting for approval"],["rejected","Not approved"]];
  body.innerHTML=groups.map(([k,l])=>{ const list=mine.filter(s=>s.state===k); if(!list.length) return ""; return `<section style="display:grid;gap:10px"><h3>${l} (${list.length})</h3><div class="table-wrap"><table><thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>${list.map(s=>`<tr><td><b>${esc(s.title)}</b>${s.feedback?`<div class="small" style="color:var(--bad)">Feedback: ${esc(s.feedback)}</div>`:""}</td><td class="mono small">${esc(E.fDate(E.parseLocal(s.start)))}</td><td><span class="pill ${s.evStatus==="cancelled"?"cancelled":k}">${s.evStatus==="cancelled"?"Cancelled":s.evStatus==="postponed"?"Postponed":l}</span></td><td><div class="row-actions">
     ${k==="published"?`<a class="btn btn-ghost btn-sm" href="#event-${s.slug}">View</a><a class="btn btn-ghost btn-sm" href="#poster-${s.slug}">Poster</a>`:""}
     <button class="btn btn-ghost btn-sm" data-edit="${s.slug}">${k==="rejected"?"Fix and resubmit":"Edit"}</button>
     ${k==="published"&&s.evStatus!=="cancelled"?`<button class="btn btn-danger btn-sm" data-cancel="${s.slug}">Cancel event</button>`:""}
     ${k==="published"&&s.evStatus==="cancelled"?`<button class="btn btn-ghost btn-sm" data-restore="${s.slug}">Reinstate</button>`:""}
     ${k!=="published"?`<button class="btn btn-ghost btn-sm" data-withdraw="${s.slug}">Withdraw</button>`:""}</div><div data-confirm="${s.slug}"></div></td></tr>`).join("")}</tbody></table></div></section>`; }).join("");
  body.onclick=e=>{
    const ed=e.target.closest("[data-edit]"); if(ed){ R.orgEdit=ed.dataset.edit; orgForm(body,u,mine,R.orgEdit); return; }
    const c=e.target.closest("[data-cancel]"); if(c){ const z=body.querySelector(`[data-confirm="${c.dataset.cancel}"]`); z.innerHTML=`<div style="display:grid;gap:6px;margin-top:8px"><input class="input" placeholder="Reason shown to attendees (optional)" id="cr-${c.dataset.cancel}"><div style="display:flex;gap:6px"><button class="btn btn-danger btn-sm" data-cyes="${c.dataset.cancel}">Confirm cancellation</button><button class="btn btn-ghost btn-sm" data-cno>Keep event</button></div></div>`; return; }
    if(e.target.closest("[data-cno]")){ orgManage(body,u,mine); return; }
    const y=e.target.closest("[data-cyes]"); if(y){ const s=S.submissions.find(x=>x.slug===y.dataset.cyes); s.evStatus="cancelled"; s.statusNote=($("#cr-"+s.slug)||{}).value||""; E.usersFollowing(s.slug).forEach(x=>E.notify(x.id,`${s.title} has been cancelled by the organizer.`,"#event-"+s.slug,"cancellations")); E.audit("Organizer cancelled event",s.title); E.invalidate(); E.persist(); E.toast("Event cancelled. Followers were notified."); orgManage(body,u,mine); return; }
    const r=e.target.closest("[data-restore]"); if(r){ const s=S.submissions.find(x=>x.slug===r.dataset.restore); s.evStatus=null; s.statusNote=""; E.invalidate(); E.persist(); E.toast("Event reinstated"); orgManage(body,u,mine); return; }
    const w=e.target.closest("[data-withdraw]"); if(w){ const s=S.submissions.find(x=>x.slug===w.dataset.withdraw); [s.posterId,...(s.promo||[]),...(s.videoIds||[])].forEach(E.delBlob); S.submissions=S.submissions.filter(x=>x!==s); E.persist(); E.toast("Submission withdrawn"); R.render(); }
  };
}
function orgMedia(body,u,mine){
  const past=mine.filter(s=>s.state==="published").map(s=>E.bySlug(s.slug)).filter(e=>e&&E.status(e)==="completed");
  const pend=S.media.filter(m=>mine.some(s=>s.slug===m.slug));
  body.innerHTML=`<div class="panel"><h3>Aftermovie and highlights</h3><p class="small muted">After an event ends, upload photos, short videos and your aftermovie. They appear on the event's Aftermovie gallery once a moderator approves them.</p>
    ${past.length?`<div style="display:grid;gap:8px">${past.map(e=>`<a class="btn btn-ghost" href="#gallery-${e.slug}" style="justify-content:space-between">${esc(e.title)} <span class="small muted">${esc(E.fDate(e.startD))}</span></a>`).join("")}</div>`:`<p class="small">None of your published events has finished yet. Uploads open once an event is completed.</p>`}</div>
    <div class="panel"><h3>Uploads for your events</h3>${pend.length?`<div class="gallery">${pend.map(m=>`<div style="display:grid;gap:4px"><div style="aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--bg2)">${m.type==="video"?`<video src="${E.mediaURL(m.blob)}" muted style="width:100%;height:100%;object-fit:cover"></video>`:`<img src="${E.mediaURL(m.blob)}" alt="" style="width:100%;height:100%;object-fit:cover">`}</div><span class="pill ${m.status==="approved"?"published":m.status==="rejected"?"rejected":"pending"}">${m.status}</span>${m.status==="approved"?`<button class="btn btn-danger btn-sm" data-mrm="${m.id}">Remove</button>`:""}</div>`).join("")}</div>`:`<p class="small muted">No uploads yet.</p>`}</div>`;
  body.onclick=e=>{ const r=e.target.closest("[data-mrm]"); if(r){ const m=S.media.find(x=>x.id===r.dataset.mrm); m.status="removed"; E.audit("Organizer removed media",m.slug); E.persist(); orgMedia(body,u,mine); } };
}

/* ---------- Admin ---------- */
R.adminTab="queue";
R.admin = function(app){
  E.setHead("Admin | Evently","Evently administration.");
  const u=E.me();
  if(!u || u.role!=="admin"){ app.innerHTML=`<div class="wrap section">${E.empty("Administrators only","Sign in with an administrator account to moderate events, users and media.",u?`<a class="btn btn-primary" href="#account">Open account settings</a>`:`<button class="btn btn-primary" id="aLog">Log in</button>`)}</div>`; const b=$("#aLog"); if(b) b.onclick=()=>R.authModal("login","Sign in with an administrator account."); return; }
  const pending=S.submissions.filter(s=>s.state==="pending"), reports=S.reports.filter(r=>r.state==="open"), media=S.media.filter(m=>m.status==="pending");
  const tabs=[["queue","Approval queue",pending.length],["events","Events"],["cats","Categories"],["orgs","Organizers"],["users","Users",S.users.length],["reports","Reports and messages",reports.length],["media","Media moderation",media.length],["featured","Featured and trending"],["analytics","Site analytics"],["audit","Audit log"]];
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">Administrator</span><h1 style="font-size:clamp(2rem,4.5vw,3rem)">Evently admin</h1></div>
   <div class="dash section" style="padding-top:20px"><nav class="side" aria-label="Admin sections">${tabs.map(([k,l,c])=>`<button data-at="${k}" aria-current="${R.adminTab===k}">${l}${c!=null?`<span class="ct">${c}</span>`:""}</button>`).join("")}</nav><div id="admBody" style="min-width:0;display:grid;gap:16px"></div></div></div>`;
  app.onclick=e=>{ const t=e.target.closest("[data-at]"); if(t){ R.adminTab=t.dataset.at; R.admin(app); } };
  const body=$("#admBody"); const redo=()=>R.admin(app);
  ({queue:admQueue,events:admEvents,cats:admCats,orgs:admOrgs,users:admUsers,reports:admReports,media:admMedia,featured:admFeatured,analytics:admAnalytics,audit:admAudit}[R.adminTab])(body,redo);
};
function admQueue(body,redo){
  const list=S.submissions.filter(s=>s.state==="pending");
  if(!list.length){ body.innerHTML=E.empty("The queue is clear","New event submissions from organizers appear here for review."); return; }
  body.innerHTML=list.map(s=>{ const ev=E.allEvents({includeRemoved:true}).find(x=>x.slug===s.slug) || Object.assign(E.events()[0]?{}:{}, {slug:s.slug,title:s.title,cat:s.cat,startD:E.parseLocal(s.start)}); return `<div class="panel" style="grid-template-columns:110px 1fr;gap:16px"><div class="poster" style="aspect-ratio:4/5;border-radius:10px">${s.posterId&&E.mediaURL(s.posterId)?`<img src="${E.mediaURL(s.posterId)}" alt="">`:E.posterSVG({slug:s.slug,title:s.title,cat:s.cat,startD:E.parseLocal(s.start),area:s.city},{text:false})}</div>
    <div style="display:grid;gap:6px;min-width:0"><b>${esc(s.title)}</b><span class="small muted">${esc(E.catName(s.cat))} · ${esc(E.fDateLong(E.parseLocal(s.start)))} ${esc(E.fTime(E.parseLocal(s.start)))} · ${esc(s.venue)}, ${esc(s.city)}</span><p class="small">${esc(s.desc)}</p>
    <span class="small">Organizer: ${esc(s.organizer)} · Contact: ${esc(s.contact||"none")} · ${esc(s.price&&s.price.free?"Free":s.price&&s.price.from?E.ugx(s.price.from):"Price not stated")}</span>${E.safeUrl(s.booking)?`<a class="link small" target="_blank" rel="noopener" href="${E.safeUrl(s.booking)}">Booking link</a>`:""}
    <textarea class="input" id="fb-${s.slug}" placeholder="Feedback for the organizer (required to reject)" style="min-height:60px"></textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-approve="${s.slug}">Approve and publish</button><button class="btn btn-danger btn-sm" data-reject="${s.slug}">Reject</button></div></div></div>`; }).join("");
  body.onclick=e=>{ const a=e.target.closest("[data-approve]"); const r=e.target.closest("[data-reject]"); const slug=(a||r||{}).dataset; if(!a&&!r) return; const s=S.submissions.find(x=>x.slug===(a?a.dataset.approve:r.dataset.reject)); const fb=$("#fb-"+s.slug).value.trim();
    if(a){ s.state="published"; s.feedback=fb; E.notify(s.owner,`Your event “${s.title}” was approved and is now live.`,"#event-"+s.slug); E.audit("Approved event",s.title);
      E.invalidate(); const ev=E.bySlug(s.slug); S.users.forEach(us=>{ if(us.id===s.owner) return; const ints=us.interests||[]; const hit=R.INTERESTS.filter(i=>ints.includes(i.id)).some(i=>(i.cats||[]).includes(s.cat)||(i.tags||[]).some(t=>(s.tags||[]).includes(t))); if(hit) E.notify(us.id,`New on Evently: ${s.title}, ${E.fDate(ev.startD)} at ${s.venue}.`,"#event-"+s.slug,"newMatches"); }); E.toast("Published"); }
    else { if(!fb){ E.toast("Add feedback so the organizer knows what to fix."); return; } s.state="rejected"; s.feedback=fb; E.notify(s.owner,`Your event “${s.title}” needs changes: ${fb}`,"#organizers"); E.audit("Rejected event",s.title+" ("+fb+")"); E.toast("Rejected with feedback"); }
    E.persist(); redo(); };
}
R.admEdit=null; R.admQ="";
function admEvents(body,redo){
  const all=E.allEvents({includeRemoved:true}).sort((a,b)=>a.startD-b.startD).filter(e=>!R.admQ||e.title.toLowerCase().includes(R.admQ.toLowerCase()));
  if(R.admEdit){ const ev=all.find(x=>x.slug===R.admEdit)||E.bySlug(R.admEdit); const o=S.overrides[ev.slug]=S.overrides[ev.slug]||{}; const f=o.fields||{};
    body.innerHTML=`<form class="panel" id="aeF"><h3>Edit: ${esc(ev.title)}</h3><div class="form-grid">
      <div class="field full"><label for="aeT">Title</label><input class="input" id="aeT" value="${esc(ev.title)}"></div>
      <div class="field"><label for="aeS">Start</label><input class="input" type="datetime-local" id="aeS" value="${E.toLocalInput(ev.startD)}" ${ev.isRecurring?"disabled":""}></div>
      <div class="field"><label for="aeV">Venue</label><input class="input" id="aeV" value="${esc(ev.venue)}"></div>
      <div class="field"><label for="aeSt">Status</label><select class="input" id="aeSt"><option value="">Scheduled</option><option value="postponed" ${ev.status==="postponed"?"selected":""}>Postponed</option><option value="cancelled" ${ev.status==="cancelled"?"selected":""}>Cancelled</option></select></div>
      <div class="field"><label for="aeN">Status note</label><input class="input" id="aeN" value="${esc(ev.statusNote||"")}"></div>
      <div class="field full"><label for="aeD">Description</label><textarea class="input" id="aeD">${esc(ev.desc)}</textarea></div></div>
      <div style="display:flex;gap:8px"><button class="btn btn-primary">Save</button><button type="button" class="btn btn-ghost" id="aeX">Cancel</button>${S.overrides[ev.slug]&&S.overrides[ev.slug].fields?`<button type="button" class="btn btn-ghost" id="aeR">Reset to original</button>`:""}</div></form>`;
    $("#aeX").onclick=()=>{R.admEdit=null;redo();};
    const rr=$("#aeR"); if(rr) rr.onclick=()=>{ delete S.overrides[ev.slug].fields; E.audit("Reset event edits",ev.title); E.invalidate(); E.persist(); R.admEdit=null; redo(); };
    $("#aeF").onsubmit=e=>{ e.preventDefault(); const nf=Object.assign({},f,{title:$("#aeT").value.trim()||ev.title,venue:$("#aeV").value.trim()||ev.venue,desc:$("#aeD").value.trim()||ev.desc,status:$("#aeSt").value||null,statusNote:$("#aeN").value.trim()});
      if(!ev.isRecurring){ const ns=$("#aeS").value; if(ns && ns!==E.toLocalInput(ev.startD)){ nf.start=ns; nf.end=""; } }
      const sub=S.submissions.find(x=>x.slug===ev.slug);
      if(sub){ Object.assign(sub,{title:nf.title,venue:nf.venue,desc:nf.desc,evStatus:nf.status,statusNote:nf.statusNote}); if(nf.start) sub.start=nf.start; delete nf.start; }
      o.fields=nf; const changed=(nf.start&&nf.start!==E.toLocalInput(ev.startD))||nf.venue!==ev.venue;
      if(nf.status==="cancelled"&&ev.status!=="cancelled") E.usersFollowing(ev.slug).forEach(x=>E.notify(x.id,`${nf.title} has been cancelled. ${nf.statusNote}`,"#event-"+ev.slug,"cancellations"));
      else if(nf.status==="postponed"&&ev.status!=="postponed") E.usersFollowing(ev.slug).forEach(x=>E.notify(x.id,`${nf.title} has been postponed. ${nf.statusNote}`,"#event-"+ev.slug,"changes"));
      else if(changed) E.usersFollowing(ev.slug).forEach(x=>E.notify(x.id,`${nf.title} has changed. Check the new date and venue.`,"#event-"+ev.slug,"changes"));
      E.audit("Edited event",nf.title); E.invalidate(); E.persist(); R.admEdit=null; E.toast("Saved"); redo(); };
    return; }
  body.innerHTML=`<div class="toolbar" style="margin:0"><input class="input" id="admQ" placeholder="Search events" value="${esc(R.admQ)}" style="max-width:320px"><span class="small muted">${all.length} events. Demo content is marked so you can remove it before launch.</span></div>
    <div class="table-wrap"><table><thead><tr><th>Event</th><th>Date</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead><tbody>${all.map(e=>`<tr style="${e.removed?"opacity:.5":""}"><td><a class="link" style="color:inherit;font-weight:600" href="#event-${e.slug}">${esc(e.title)}</a><div class="tiny muted">${esc(e.venue)}</div></td><td class="mono small">${esc(E.fDate(e.startD))}</td><td>${E.verifyBadge(e.verify)}</td><td><span class="pill neutral">${e.removed?"Removed":esc(E.statusLabel(E.status(e)))}</span></td>
      <td><div class="row-actions"><button class="btn btn-ghost btn-sm" data-aedit="${e.slug}">Edit</button><button class="btn btn-ghost btn-sm" data-afeat="${e.slug}" aria-pressed="${!!e.featured}">${e.featured?"Unfeature":"Feature"}</button>${e.removed?`<button class="btn btn-ghost btn-sm" data-arest="${e.slug}">Restore</button>`:`<button class="btn btn-danger btn-sm" data-arm="${e.slug}">Remove</button>`}</div></td></tr>`).join("")}</tbody></table></div>
    <div class="panel"><h3>Replace demo content</h3><p class="small muted">Remove every event marked Demo in one step. You can restore them from this table.</p><button class="btn btn-danger btn-sm" id="rmDemo" style="justify-self:start">Remove all demo events</button></div>`;
  $("#admQ").oninput=e=>{ R.admQ=e.target.value; clearTimeout(R._aq); R._aq=setTimeout(()=>{ admEvents(body,redo); const q=$("#admQ"); q.focus(); q.setSelectionRange(q.value.length,q.value.length); },250); };
  $("#rmDemo").onclick=()=>{ E.allEvents({includeRemoved:true}).filter(e=>e.verify==="demo").forEach(e=>{ (S.overrides[e.slug]=S.overrides[e.slug]||{}).removed=true; }); E.audit("Removed all demo events",""); E.invalidate(); E.persist(); E.toast("Demo events removed"); redo(); };
  body.onclick=e=>{ const b=e.target.closest("[data-aedit],[data-afeat],[data-arm],[data-arest]"); if(!b) return; const slug=b.dataset.aedit||b.dataset.afeat||b.dataset.arm||b.dataset.arest; const o=S.overrides[slug]=S.overrides[slug]||{}; const ev=E.allEvents({includeRemoved:true}).find(x=>x.slug===slug);
    if(b.dataset.aedit){ R.admEdit=slug; admEvents(body,redo); return; }
    if(b.dataset.afeat){ o.featured=!ev.featured; E.audit(o.featured?"Featured event":"Unfeatured event",ev.title); }
    if(b.dataset.arm){ o.removed=true; E.audit("Removed event",ev.title); }
    if(b.dataset.arest){ o.removed=false; E.audit("Restored event",ev.title); }
    E.invalidate(); E.persist(); admEvents(body,redo); };
}
function admCats(body,redo){
  body.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Category</th><th>Description</th><th>Upcoming</th><th>Visible</th></tr></thead><tbody>${E.CATS().map(c=>`<tr><td><input class="input" data-cname="${c.id}" value="${esc(c.name)}" style="height:36px"></td><td><input class="input" data-cblurb="${c.id}" value="${esc(c.blurb||"")}" style="height:36px"></td><td class="mono">${c.id==="free"?E.events().filter(e=>E.isActive(e)&&e.isFree).length:E.events().filter(e=>E.isActive(e)&&e.cat===c.id).length}</td><td><label class="check"><input type="checkbox" data-cvis="${c.id}" ${c.hidden?"":"checked"}> Shown</label></td></tr>`).join("")}</tbody></table></div>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" id="cSave">Save categories</button></div>
   <form class="panel" id="cNew"><h3>Add a category</h3><div class="form-grid"><input class="input" id="cnName" placeholder="Name, e.g. Gospel" maxlength="30"><input class="input" id="cnBlurb" placeholder="Short description" maxlength="80"></div><button class="btn btn-ghost btn-sm" style="justify-self:start">Add category</button></form>`;
  $("#cSave").onclick=()=>{ E.CATS().forEach(c=>{ S.cats[c.id]={name:$(`[data-cname="${c.id}"]`).value.trim()||c.name,blurb:$(`[data-cblurb="${c.id}"]`).value.trim(),hidden:!$(`[data-cvis="${c.id}"]`).checked}; }); E.audit("Updated categories",""); E.invalidate(); E.persist(); E.toast("Categories saved"); redo(); };
  $("#cNew").onsubmit=e=>{ e.preventDefault(); const n=$("#cnName").value.trim(); if(n.length<3){ E.toast("Enter a category name."); return; } const id=slugify(n); if(E.CATS().some(c=>c.id===id)){ E.toast("That category exists."); return; } S.newCats.push({id,name:n,blurb:$("#cnBlurb").value.trim()}); E.audit("Added category",n); E.persist(); redo(); };
}
function admOrgs(body,redo){
  const orgs=S.users.filter(u=>S.submissions.some(s=>s.owner===u.id));
  body.innerHTML=orgs.length?`<div class="table-wrap"><table><thead><tr><th>Organizer</th><th>Published</th><th>Pending</th><th>Rejected</th><th>Status</th><th></th></tr></thead><tbody>${orgs.map(u=>{ const m=S.submissions.filter(s=>s.owner===u.id); return `<tr><td><b>${esc(u.name)}</b><div class="tiny muted">${esc(u.email)}</div></td><td class="mono">${m.filter(s=>s.state==="published").length}</td><td class="mono">${m.filter(s=>s.state==="pending").length}</td><td class="mono">${m.filter(s=>s.state==="rejected").length}</td><td><span class="pill ${u.suspended?"rejected":"published"}">${u.suspended?"Suspended":"Active"}</span></td><td><button class="btn btn-ghost btn-sm" data-susp="${u.id}">${u.suspended?"Reinstate":"Suspend"}</button></td></tr>`; }).join("")}</tbody></table></div>`:E.empty("No organizers yet","Anyone who submits an event appears here.");
  body.onclick=e=>{ const b=e.target.closest("[data-susp]"); if(b){ const u=S.users.find(x=>x.id===b.dataset.susp); if(u.id===S.session){ E.toast("You can't suspend yourself."); return; } u.suspended=!u.suspended; E.audit(u.suspended?"Suspended organizer":"Reinstated organizer",u.email); E.persist(); redo(); } };
}
function admUsers(body,redo){
  body.innerHTML=`<div class="table-wrap"><table><thead><tr><th>User</th><th>City</th><th>Joined</th><th>Role</th><th>Actions</th></tr></thead><tbody>${S.users.map(u=>`<tr><td><b>${esc(u.name)}</b><div class="tiny muted">${esc(u.email)}</div></td><td>${esc(u.city||"")}</td><td class="mono small">${esc(E.fDate(new Date(u.created)))}</td><td><select class="input" data-role="${u.id}" style="height:34px;width:auto"><option ${u.role==="user"?"selected":""}>user</option><option ${u.role==="admin"?"selected":""}>admin</option></select></td><td><div data-uz="${u.id}">${u.id===S.session?`<span class="tiny muted">You</span>`:`<button class="btn btn-danger btn-sm" data-udel="${u.id}">Delete</button>`}</div></td></tr>`).join("")}</tbody></table></div>`;
  body.onchange=e=>{ const s=e.target.closest("[data-role]"); if(s){ const u=S.users.find(x=>x.id===s.dataset.role); if(u.id===S.session && s.value!=="admin"){ E.toast("Use your account page to remove your own admin access."); s.value="admin"; return; } u.role=s.value; E.audit("Changed role to "+u.role,u.email); E.persist(); E.toast("Role updated"); } };
  body.onclick=e=>{ const d=e.target.closest("[data-udel]"); if(d){ $(`[data-uz="${d.dataset.udel}"]`).innerHTML=`<button class="btn btn-danger btn-sm" data-udy="${d.dataset.udel}">Confirm delete</button>`; return; } const y=e.target.closest("[data-udy]"); if(y){ const u=S.users.find(x=>x.id===y.dataset.udy); [S.saved,S.attend,S.notifs,S.prefs].forEach(o=>delete o[u.id]); S.users=S.users.filter(x=>x!==u); E.audit("Deleted user",u.email); E.persist(); redo(); } };
}
function admReports(body,redo){
  const list=S.reports;
  body.innerHTML=list.length?list.map(r=>{ const ev=r.slug?E.bySlug(r.slug):null; return `<div class="panel" style="${r.state!=="open"?"opacity:.6":""}"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>${r.type==="contact"?"Message: "+esc(r.reason):esc(r.reason)}</b><span class="pill ${r.state==="open"?"pending":"neutral"}">${esc(r.state)}</span></div>
    ${ev?`<a class="link small" href="#event-${ev.slug}">${esc(ev.title)}</a>`:""}${r.from?`<span class="small">From: ${esc(r.from)}</span>`:""}<p class="small">${esc(r.text||"No details given.")}</p><span class="tiny muted">${esc(E.fDate(new Date(r.t)))} ${esc(E.fTime(new Date(r.t)))}</span>
    ${r.state==="open"?`<div style="display:flex;gap:8px;flex-wrap:wrap">${ev?`<button class="btn btn-danger btn-sm" data-rrm="${r.id}">Remove the event</button>`:""}<button class="btn btn-ghost btn-sm" data-rres="${r.id}">Mark resolved</button><button class="btn btn-ghost btn-sm" data-rdis="${r.id}">Dismiss</button></div>`:""}</div>`; }).join(""):E.empty("No reports","Reports from attendees and messages from the contact page appear here.");
  body.onclick=e=>{ const b=e.target.closest("[data-rrm],[data-rres],[data-rdis]"); if(!b) return; const r=S.reports.find(x=>x.id===(b.dataset.rrm||b.dataset.rres||b.dataset.rdis)); if(b.dataset.rrm){ (S.overrides[r.slug]=S.overrides[r.slug]||{}).removed=true; r.state="resolved"; E.audit("Removed reported event",r.slug); E.invalidate(); } else if(b.dataset.rres){ r.state="resolved"; E.audit("Resolved report",r.reason); } else { r.state="dismissed"; E.audit("Dismissed report",r.reason); } E.persist(); redo(); };
}
function admMedia(body,redo){
  const list=S.media.filter(m=>m.status==="pending"||m.status==="approved").sort((a,b)=>(a.status==="pending"?-1:1));
  body.innerHTML=list.length?`<div class="gallery" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">${list.map(m=>{ const ev=E.bySlug(m.slug); return `<div class="panel" style="padding:10px;gap:6px"><div style="aspect-ratio:1;border-radius:8px;overflow:hidden;background:var(--bg2)">${m.type==="video"?`<video src="${E.mediaURL(m.blob)}" controls muted style="width:100%;height:100%;object-fit:cover"></video>`:`<img src="${E.mediaURL(m.blob)}" alt="" style="width:100%;height:100%;object-fit:cover">`}</div><span class="tiny"><b>${esc(ev?ev.title:m.slug)}</b><br>by ${esc(m.uname||"")}${m.byOrganizer?" (organizer)":""}</span><span class="pill ${m.status==="approved"?"published":"pending"}">${m.status}</span>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${m.status==="pending"?`<button class="btn btn-primary btn-sm" data-mok="${m.id}">Approve</button><button class="btn btn-danger btn-sm" data-mno="${m.id}">Reject</button>`:`<button class="btn btn-danger btn-sm" data-mno="${m.id}">Remove</button>`}</div></div>`; }).join("")}</div>`:E.empty("Nothing to moderate","Photos and videos uploaded to Aftermovie galleries appear here before they go public.");
  body.onclick=e=>{ const ok=e.target.closest("[data-mok]"), no=e.target.closest("[data-mno]"); if(!ok&&!no) return; const m=S.media.find(x=>x.id===(ok?ok.dataset.mok:no.dataset.mno)); m.status=ok?"approved":(m.status==="approved"?"removed":"rejected"); E.audit(ok?"Approved media":"Rejected or removed media",m.slug); if(ok) E.notify(m.uid,"Your photo or video was approved and is now in the gallery.","#gallery-"+m.slug); E.persist(); redo(); };
}
function admFeatured(body,redo){
  const w=S.settings.weights;
  const feat=E.events().filter(e=>e.featured);
  body.innerHTML=`<div class="panel"><h3>Featured on the homepage (${feat.length})</h3>${feat.map(e=>`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><a class="link" href="#event-${e.slug}">${esc(e.title)}</a><button class="btn btn-ghost btn-sm" data-unf="${e.slug}">Unfeature</button></div>`).join("")||"<p class='small muted'>No featured events. Feature events from the Events tab.</p>"}</div>
   <form class="panel" id="wF"><h3>Trending algorithm</h3><p class="small muted">Each event's score = sum of counts × weight. Changes apply immediately to Radar and the homepage.</p>
    <div class="form-grid">${[["views","Views"],["shares","Shares"],["saves","Saves"],["interested","Interested"],["going","Attending"]].map(([k,l])=>`<div class="field"><label for="w-${k}">${l} weight</label><input class="input" type="number" min="0" max="20" step=".5" id="w-${k}" value="${w[k]}"></div>`).join("")}
    <div class="field"><label for="w-rb">Recent activity weight</label><input class="input" type="number" min="0" max="20" step=".5" id="w-rb" value="${S.settings.recentBoost}"></div>
    <div class="field"><label for="w-rd">Recent window (days)</label><input class="input" type="number" min="1" max="30" id="w-rd" value="${S.settings.recentDays}"></div></div>
    <label class="check"><input type="checkbox" id="w-base" ${S.settings.baseline?"checked":""}> Use demo engagement baseline (turn off once real data is flowing)</label>
    <div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm">Save settings</button><button type="button" class="btn btn-ghost btn-sm" id="wReset">Reset to defaults</button></div></form>`;
  body.onclick=e=>{ const u=e.target.closest("[data-unf]"); if(u){ (S.overrides[u.dataset.unf]=S.overrides[u.dataset.unf]||{}).featured=false; E.audit("Unfeatured event",u.dataset.unf); E.invalidate(); E.persist(); redo(); } };
  $("#wF").onsubmit=e=>{ e.preventDefault(); ["views","shares","saves","interested","going"].forEach(k=>w[k]=Math.max(0,+$("#w-"+k).value||0)); S.settings.recentBoost=Math.max(0,+$("#w-rb").value||0); S.settings.recentDays=Math.min(30,Math.max(1,+$("#w-rd").value||7)); S.settings.baseline=$("#w-base").checked; E.audit("Updated trending settings",JSON.stringify(w)); E.persist(); E.toast("Trending settings saved"); redo(); };
  $("#wReset").onclick=()=>{ S.settings.weights=Object.assign({},E.DEFAULT_SETTINGS.weights); S.settings.recentBoost=E.DEFAULT_SETTINGS.recentBoost; S.settings.recentDays=E.DEFAULT_SETTINGS.recentDays; S.settings.baseline=true; E.audit("Reset trending settings",""); E.persist(); redo(); };
}
function admAnalytics(body){
  const views=Object.values(S.views).flat(), shares=Object.values(S.shares).flat();
  const days=[...Array(14)].map((_,i)=>new Date(E.kDayStart(new Date()).getTime()-(13-i)*E.DAY));
  const top=Object.entries(S.views).map(([s,v])=>[s,v.length]).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const q={}; S.searches.forEach(s=>{ const k=s.q.toLowerCase(); q[k]=(q[k]||0)+1; });
  const ups=E.events().filter(E.isActive);
  body.innerHTML=`<div class="stats">${[["Page views (events)",views.length],["Unique visitors",new Set(views.map(v=>v.v)).size],["Shares",shares.length],["Registered users",S.users.length],["Live listings",ups.length],["Pending approvals",S.submissions.filter(s=>s.state==="pending").length]].map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    <div class="panel"><h3>Event page views, last 14 days</h3>${barChart(days.map(d=>views.filter(v=>v.t>=d.getTime()&&v.t<d.getTime()+E.DAY).length),days.map(d=>E.fmt(d,{day:"numeric",month:"short"})))}</div>
    <div class="form-grid"><div class="panel"><h3>Most viewed events</h3>${top.length?top.map(([s,n])=>{ const e=E.bySlug(s); return `<div style="display:flex;justify-content:space-between;gap:10px" class="small"><a class="link" href="#event-${s}">${esc(e?e.title:s)}</a><b class="mono">${n}</b></div>`; }).join(""):"<p class='small muted'>No views yet.</p>"}</div>
    <div class="panel"><h3>Top searches</h3>${hbars(Object.fromEntries(Object.entries(q).sort((a,b)=>b[1]-a[1]).slice(0,8)))}</div></div>
    <p class="tiny muted">Real activity recorded by Evently. In this preview, activity is stored on this device only.</p>`;
}
function admAudit(body){
  body.innerHTML=S.audit.length?`<div class="table-wrap"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th></tr></thead><tbody>${S.audit.map(a=>`<tr><td class="mono small">${esc(E.fDate(new Date(a.t)))} ${esc(E.fTime(new Date(a.t)))}</td><td>${esc(a.who)}</td><td>${esc(a.action)}</td><td class="small" style="overflow-wrap:anywhere">${esc(a.target)}</td></tr>`).join("")}</tbody></table></div>`:E.empty("No admin actions yet","Approvals, edits, removals and setting changes are recorded here.");
}

/* ---------- Static pages ---------- */
function staticPage(app, eyebrow, title, html, desc){ E.setHead(title+" | Evently", desc||title); app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">${eyebrow}</span><h1 style="font-size:clamp(2rem,4.5vw,3.2rem)">${title}</h1></div><div class="prose section" style="padding-top:20px">${html}</div></div>`; }
R.about = app => staticPage(app,"About","About Evently",`<p>Evently is where Uganda finds out what's on. We bring concerts, parties, bar nights, festivals, comedy, culture and sport into one place so you can decide where to be tonight, this weekend and next month.</p><p>We started in Kampala and built Evently to grow into other African cities.</p><h3>What we do and don't do</h3><p>Evently is for discovery and promotion. We don't sell tickets or take payments. When an event has paid entry, we link you to the organizer's official booking page.</p><h3>Reliable listings</h3><p>Every listing shows where its information came from: the organizer's own submission or the public listing we checked. Moderators review new submissions before they go live, and anyone can report a problem.</p>`);
R.contact = app => { staticPage(app,"Contact","Contact Evently",`<p>Questions, partnerships or press? Send us a message and the team will reply by email.</p><p class="small">Email: <span style="user-select:all;font-weight:600">hello@evently.ug</span> · Organizers: <span style="user-select:all;font-weight:600">organizers@evently.ug</span></p><p class="small">Follow us: <a class="link" href="https://www.instagram.com/evently.ug/" target="_blank" rel="noopener">Instagram @evently.ug</a> · <a class="link" href="https://x.com/eventlyug1" target="_blank" rel="noopener">X @eventlyug1</a></p>
  <form class="panel" id="ctF" style="max-width:560px"><div class="field"><label for="ctN">Your name</label><input class="input" id="ctN" maxlength="60"></div><div class="field"><label for="ctE">Your email</label><input class="input" id="ctE" type="email"></div><div class="field"><label for="ctS">Topic</label><select class="input" id="ctS"><option>General question</option><option>Listing an event</option><option>Partnership or advertising</option><option>Press</option><option>Report a problem</option></select></div><div class="field"><label for="ctM">Message</label><textarea class="input" id="ctM" maxlength="1500"></textarea></div><input id="ctHp" tabindex="-1" style="position:absolute;left:-9999px" aria-hidden="true"><span class="err" id="ctErr"></span><button class="btn btn-primary" style="justify-self:start">Send message</button></form>`,"Contact the Evently team.");
  $("#ctF").onsubmit=e=>{ e.preventDefault(); if($("#ctHp").value) return; const em=$("#ctE").value.trim(), m=$("#ctM").value.trim(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){ $("#ctErr").textContent="Enter a valid email so we can reply."; return; } if(m.length<10){ $("#ctErr").textContent="Write a message of at least 10 characters."; return; } S.reports.unshift({id:"c"+Date.now(),t:Date.now(),type:"contact",reason:$("#ctS").value,text:m,from:`${$("#ctN").value.trim()} <${em}>`,state:"open"}); E.persist(); $("#ctF").innerHTML=`<h3>Message received</h3><p class="muted">Thanks. The Evently team will reply to ${esc(em)}.</p>`; }; };
R.help = app => staticPage(app,"Help","Help centre",[["How do I buy tickets?","Evently doesn't sell tickets. When an event sells tickets online, its page has a “Buy tickets on …” button that takes you to the ticket seller. Otherwise use “Official event and booking page” or the organizer's contacts."],["How do I save an event?","Tap the heart on any event. You'll need a free account so your saved events and reminders follow you."],["When do reminders arrive?","24 hours and 2 hours before events you saved, are interested in or are attending. You choose which ones in Account, Notifications."],["How is “Trending” decided?","A transparent score from views, shares, saves, interest and recent activity. See the formula on the Radar page."],["How do I list my event?","Go to For Organizers, create an account and submit your event. A moderator reviews it before it goes live."],["Someone posted wrong information","Open the event and tap “Report a problem”. Our moderators check every report."],["Is my attendance public?","No, it's private by default. You can choose to show it on event pages from your account."],["Can I delete my account?","Yes. Go to Account and choose Delete account. Your data is removed."]].map(([q,a])=>`<details class="panel"><summary style="cursor:pointer;font-weight:700">${q}</summary><p class="muted" style="margin-top:8px">${a}</p></details>`).join(""),"Answers to common questions about Evently.");
R.privacy = app => staticPage(app,"Legal","Privacy policy",`<p class="small muted">Draft for review by Evently's legal counsel before launch.</p><h3>What we collect</h3><p>Your email, display name, password (stored as a hash), location you choose, interests, saved events and attendance. We record anonymous views and shares to show trending events and organizer analytics.</p><h3>Location</h3><p>We only use your precise location if you tap “Use my current location” and your browser asks you to allow it. We use it for that visit only and don't store it.</p><h3>Attendance privacy</h3><p>Your attendance is private unless you choose to make it public. Organizers see totals, never who you are.</p><h3>Your choices</h3><p>You can edit your profile, turn notifications on or off, and delete your account at any time from Account.</p><h3>Data protection</h3><p>Evently follows Uganda's Data Protection and Privacy Act, 2019. Contact <span style="user-select:all">privacy@evently.ug</span> for any data request.</p>`,"How Evently handles your data.");
R.terms = app => staticPage(app,"Legal","Terms of service",`<p class="small muted">Draft for review by Evently's legal counsel before launch.</p><h3>Using Evently</h3><p>Evently is an event discovery and promotion platform. We don't sell tickets, process payments or guarantee entry to any event.</p><h3>Organizers</h3><p>Organizers must submit accurate information and only upload media they have the right to use. We may edit, reject or remove listings that are inaccurate, misleading or break these terms.</p><h3>Community uploads</h3><p>Photos and videos are reviewed before publication. Don't upload content that is explicit, hateful, violent or that shows people who haven't agreed to be shown.</p><h3>Promotions</h3><p>Deals are offered by organizers. Evently isn't responsible for an organizer's promotion terms.</p><h3>Accounts</h3><p>Keep your password safe. We may suspend accounts used for spam or abuse.</p>`,"The rules for using Evently.");
R.seoFiles = function(app){
  E.setHead("Sitemap and robots.txt | Evently","Evently's XML sitemap and robots.txt.");
  const today=E.ymd(new Date());
  const pages=["","discover","this-weekend","trending","categories","deals","near-me","organizers","events-in-uganda","events-in-kampala","concerts-in-uganda","free-events-in-uganda","nightlife-in-kampala","about","contact","help","privacy","terms"];
  const evs=E.allEvents().filter(e=>!e.removed);
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+pages.map(p=>`  <url><loc>${E.SITE}/${p}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq></url>`).join("\n")+"\n"+evs.map(e=>`  <url><loc>${E.eventURL(e.slug)}</loc><lastmod>${today}</lastmod><changefreq>${E.isActive(e)?"daily":"monthly"}</changefreq><priority>${E.isActive(e)?"0.8":"0.3"}</priority></url>`).join("\n")+"\n</urlset>\n";
  const robots=`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /organizers/dashboard\nDisallow: /account\nDisallow: /my-events\n\nSitemap: ${E.SITE}/sitemap.xml\n`;
  app.innerHTML=`<div class="wrap"><div class="page-head"><span class="eyebrow">SEO</span><h1 style="font-size:clamp(2rem,4.5vw,3rem)">Sitemap and robots.txt</h1><p class="muted">Generated from the live event list. Events leave the sitemap one day after they end. Their direct links keep working with a clear “Event completed” status.</p></div>
    <div class="section form-grid" style="padding-top:20px"><div class="panel" style="min-width:0"><h3>sitemap.xml (${pages.length+evs.length} URLs)</h3><pre class="code">${esc(xml)}</pre><button class="btn btn-ghost btn-sm" id="dlX" style="justify-self:start">Save sitemap.xml</button></div>
    <div class="panel" style="min-width:0;align-content:start"><h3>robots.txt</h3><pre class="code">${esc(robots)}</pre><button class="btn btn-ghost btn-sm" id="dlR" style="justify-self:start">Save robots.txt</button><p class="tiny muted" id="dlHint"></p></div></div></div>`;
  const dl=async(n,t,type)=>{ const ok=await E.saveFile(n,new Blob([t],{type})); if(!ok){ $("#dlHint").textContent="Saving isn't available in this view. Select the text and copy it instead."; } };
  $("#dlX").onclick=()=>dl("sitemap.xml",xml,"text/xml"); $("#dlR").onclick=()=>dl("robots.txt",robots,"text/plain");
};

/* ---------- Router ---------- */
const NAV_MAP={discover:"discover",weekend:"weekend",radar:"radar",categories:"categories",near:"near",deals:"deals",organizers:"organizers"};
R.render = function(){
  const app=$("#app"); app.onclick=null;
  let h=(location.hash||"#home").slice(1); let src="direct";
  if(R._nextSrc){ src=R._nextSrc; R._nextSrc=null; } else if(R._internal){ src="internal"; }
  R._internal=true;
  let navKey="";
  if(h==="home"||h==="") R.home(app);
  else if(h==="discover"){ navKey="discover"; R.discover(app); }
  else if(h==="discover-search"){ navKey="discover"; R.discover(app); setTimeout(()=>{ const i=$("#discSearch-in"); if(i) i.focus(); },150); }
  else if(R.GUIDES[h]){ navKey="discover"; R.discover(app,R.GUIDES[h]); }
  else if(h==="weekend"||h==="events-this-weekend"){ navKey="weekend"; R.weekend(app); }
  else if(h==="radar"){ navKey="radar"; R.radar(app); }
  else if(h==="categories"){ navKey="categories"; R.categories(app); }
  else if(h.startsWith("category-")){ navKey="categories"; R.category(app,h.slice(9)); }
  else if(h==="near"){ navKey="near"; R.near(app); }
  else if(h==="deals"){ navKey="deals"; R.deals(app); }
  else if(h==="organizers"){ navKey="organizers"; R.organizers(app); }
  else if(h==="admin") R.admin(app);
  else if(h==="my-events") R.myEvents(app);
  else if(h==="account") R.account(app);
  else if(h.startsWith("event-")) R.event(app,h.slice(6),src);
  else if(h.startsWith("gallery-")) R.gallery(app,h.slice(8));
  else if(h.startsWith("poster-")) R.poster(app,h.slice(7));
  else if(h==="about") R.about(app); else if(h==="contact") R.contact(app); else if(h==="help") R.help(app); else if(h==="privacy") R.privacy(app); else if(h==="terms") R.terms(app); else if(h==="seo-files") R.seoFiles(app);
  else { app.innerHTML=`<div class="wrap section">${E.empty("Page not found","That page doesn't exist. Try discovering events instead.",`<a class="btn btn-primary" href="#discover">Discover events</a>`)}</div>`; }
  $$("#nav a").forEach(a=>a.toggleAttribute("aria-current",false)); if(navKey){ const a=$(`#nav a[href="#${navKey}"]`); if(a) a.setAttribute("aria-current","page"); }
};
window.addEventListener("hashchange",()=>{ R.render(); window.scrollTo({top:0,behavior:"instant"}); E.closeModal(); const d=$(".drawer"); if(d) d.remove(); });

/* Global delegation: save buttons, source tracking */
document.addEventListener("click",e=>{
  const sv=e.target.closest("[data-save]"); if(sv){ e.preventDefault(); e.stopPropagation(); if(!R.requireLogin("save events")) return; const slug=sv.dataset.save; const arr=S.saved[S.session]=S.saved[S.session]||[]; const i=arr.indexOf(slug); if(i>=0){ arr.splice(i,1); E.toast("Removed from saved"); } else { arr.push(slug); E.toast("Saved. Find it in My Events."); } E.persist();
    $$(`[data-save="${slug}"]`).forEach(b=>{ const on=arr.includes(slug); b.setAttribute("aria-pressed",on); if(b.classList.contains("save-fab")) { b.innerHTML=on?I.heartF:I.heart; b.setAttribute("aria-label",on?"Remove from saved":"Save event"); } else if(b.closest(".actions")) b.innerHTML=on?I.heartF+" Saved":I.heart+" Save"; else b.textContent=on?(b.closest(".row-actions")&&location.hash==="#my-events"?"Remove":"Saved"):"Save"; });
    if(location.hash==="#my-events") R.render(); return; }
  const a=e.target.closest("a[data-src]"); if(a) R._nextSrc=a.dataset.src;
}, true);

/* Countdown ticker */
function tick(){
  $$("[data-cd]").forEach(el=>{ const ev=E.bySlug(el.dataset.cd); if(!ev) return; const c=E.miniCountdown(ev); if(el.textContent!==c.text) el.textContent=c.text; el.classList.toggle("live",!!c.live); });
  $$("[data-bigcd]").forEach(el=>{ const ev=E.bySlug(el.dataset.bigcd); if(!ev) return; const st=E.status(ev); if(st!=="upcoming"){ R.render(); return; } const p=E.countdownParts(ev.startD-Date.now()); const b=el.querySelectorAll("b"); [p.d,p.h,p.m,p.s].forEach((v,i)=>b[i].textContent=String(v).padStart(2,"0")); });
}

/* Boot */
async function boot(){
  $("#yr").textContent=new Date().getFullYear();
  $("#bellBtn").onclick=R.notifPanel;
  $("#menuBtn").onclick=()=>{ const d=document.createElement("div"); d.className="drawer"; const u=E.me(); d.innerHTML=`<div class="drawer-panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="logo"><img class="logo-icon" src="logo-icon.png" alt="" width="34" height="34"><img class="logo-word wm-dark" src="logo-word-dark.png" alt="evently" height="26"><img class="logo-word wm-light" src="logo-word-white.png" alt="evently" height="26"></span><button class="icon-btn" aria-label="Close menu">${I.x}</button></div>${[["#discover","Discover"],["#weekend","This Weekend"],["#radar","Trending"],["#categories","Categories"],["#near","Near me"],["#deals","Deals"],["#organizers","For Organizers"],["#my-events","My Events"],...(u?[["#account","Account"]]:[]),...(u&&u.role==="admin"?[["#admin","Admin"]]:[])].map(([h,l])=>`<a href="${h}">${l}</a>`).join("")}</div>`; d.addEventListener("click",e=>{ if(e.target===d||e.target.closest(".icon-btn")) d.remove(); }); document.body.appendChild(d); };
  await E.loadAllBlobs();
  R.header(); R._internal=false; R.render();
  setInterval(tick,1000);
  E.reminderSweep(); setInterval(()=>{ E.reminderSweep(); E.invalidate(); },30000);
}
boot();
})();
