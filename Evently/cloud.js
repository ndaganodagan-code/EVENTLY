/* Evently cloud: keeps accounts, listings and activity in Supabase.
   The site still works from data.js and the browser if Supabase can't be reached. */
(function(){
"use strict";
const URL_ = "https://ejrdseczlavbutmwjvyj.supabase.co";
const KEY = "sb_publishable_kOOwkq4uQFICK6koWiOgUA_cBLWFne3"; // publishable key: safe in the browser, access is limited by the database rules
const E = window.EV, S = E.S;
const C = window.EVCLOUD = { on:false, ready:false };
let serverFollows = [];
let sb = null, uid = null, snap = null, loadTime = Date.now(), serverCounts = {}, mineAtLoad = {saved:new Set(), attend:{}}, syncing = false, again = false;

const R = () => window.EVROUTES;
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const toISO = local => local ? E.parseLocal(local).toISOString() : null;
const toLocal = iso => iso ? E.toLocalInput(new Date(iso)) : "";
const publicPoster = path => `${URL_}/storage/v1/object/public/posters/${path.split("/").map(encodeURIComponent).join("/")}`;
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
const isAdmin = () => { const u = E.me(); return !!(u && u.role === "admin"); };

/* ---------- Rows <-> site records ---------- */
function seedFromRow(r){
  const s = {slug:r.slug, title:r.title, cat:r.cat, tags:r.tags||[], artists:r.artists||[], start:toLocal(r.start_at), venue:r.venue, city:r.city,
    price:r.price||{}, organizer:r.organizer, desc:r.description, sources:r.sources||[], verify:r.verify, base:r.base_score, added:r.added};
  if (r.end_at) s.end = toLocal(r.end_at);
  if (r.time_tbc) s.timeTBC = true;
  if (r.recurring) { try { s.recurring = JSON.parse(r.recurring); } catch(e){} }
  if (r.tickets) s.tickets = r.tickets;
  if (r.tickets_note) s.ticketsNote = r.tickets_note;
  if (r.status && r.status !== "scheduled") s.status = r.status;
  if (r.status_note) s.statusNote = r.status_note;
  if (r.community) s.community = true;
  if (r.featured) s.featured = true;
  if (r.booking) s.booking = r.booking;
  if (r.website) s.website = r.website;
  if (r.poster_path) { if (r.poster_path.includes("/")) s.posterUrl = publicPoster(r.poster_path); else if (window.EVENTLY_POSTERS) EVENTLY_POSTERS.add(r.slug); }
  return s;
}
const STATE = {approved:"published", pending:"pending", rejected:"rejected"};
const REVIEW = {published:"approved", pending:"pending", rejected:"rejected"};
function subFromRow(r){
  return {slug:r.slug, owner:r.submitted_by, created:Date.parse(r.created_at), state:STATE[r.review]||"pending", feedback:r.review_note||"",
    title:r.title, cat:r.cat, tags:r.tags||[], artists:r.artists||[], start:toLocal(r.start_at), end:r.end_at?toLocal(r.end_at):"", venue:r.venue, city:r.city,
    desc:r.description, price:r.price||{}, organizer:r.organizer, booking:r.booking||"", tickets:r.tickets||null, website:r.website||"", videoUrl:r.video_url||"",
    contact:r.contact||"", community:r.community, deal:r.deal||null, evStatus:r.status!=="scheduled"?r.status:null, statusNote:r.status_note||"",
    posterUrl:r.poster_path?publicPoster(r.poster_path):"", posterPath:r.poster_path||"", promo:[], videoIds:[]};
}
function rowFromSub(s){
  return {slug:s.slug, title:s.title, cat:s.cat, tags:s.tags||[], artists:s.artists||[], start_at:toISO(s.start), end_at:s.end?toISO(s.end):null,
    venue:s.venue, city:s.city||"Kampala", price:s.price||{}, organizer:s.organizer||"", description:s.desc||"",
    tickets:s.tickets&&s.tickets.url?{url:s.tickets.url, site:s.tickets.site||E.hostOf(s.tickets.url)}:null,
    booking:s.booking||null, website:s.website||null, video_url:s.videoUrl||null, contact:s.contact||null, community:!!s.community, deal:s.deal||null,
    status:s.evStatus||"scheduled", status_note:s.statusNote||null, review:REVIEW[s.state]||"pending", review_note:s.feedback||null,
    poster_path:s.posterPath||null, submitted_by:s.owner};
}
function userFromProfile(p){
  return {id:p.id, email:p.email||"", name:p.name||"", city:p.city||"", interests:p.interests||[], publicAttendance:!!p.public_attendance,
    role:p.role==="admin"?"admin":"user", suspended:!!p.suspended, created:Date.parse(p.created_at), cloud:true};
}
function notifFromRow(n){
  return {id:"s"+n.id, t:Date.parse(n.created_at), text:/^New at /.test(n.title)?`${n.title}: ${n.body}`:n.body, link:n.link||"#my-events", read:n.read};
}
function reportFromRow(r){
  return {id:"s"+r.id, t:Date.parse(r.created_at), slug:r.event_slug, reason:r.reason, text:r.details||"", type:r.kind==="contact"?"contact":"report", from:r.contact||"", state:r.resolved?"resolved":"open"};
}

/* ---------- Snapshot of what is already in Supabase ---------- */
function takeSnap(){
  const subs = {}; S.submissions.forEach(s => { subs[s.slug] = JSON.stringify(Object.assign(rowFromSub(s), {_poster:s.posterId||""})); });
  const users = {}; S.users.forEach(u => { users[u.id] = JSON.stringify([u.name,u.city,u.interests,u.publicAttendance,u.role,u.suspended]); });
  const ov = {}; Object.entries(S.overrides).forEach(([k,o]) => ov[k] = JSON.stringify(o));
  snap = {session:S.session, saved:clone(uid?S.saved[uid]||[]:[]), attend:clone(uid?S.attend[uid]||{}:{}), follows:clone(uid?S.follows[uid]||[]:[]),
    prefs:JSON.stringify(uid?S.prefs[uid]||{}:{}), unread:new Set((uid?S.notifs[uid]||[]:[]).filter(n=>!n.read).map(n=>n.id)),
    subs, users, ov, reports:new Map(S.reports.map(r=>[r.id,r.state])), audit:S.audit.length?S.audit[0].t:0};
}

/* ---------- Pull ---------- */
async function pullEvents(){
  const {data, error} = await sb.from("events").select("*").order("start_at");
  if (error) throw error;
  const demo = window.EVENTLY_SEED.filter(e => e.verify === "demo");
  window.EVENTLY_SEED = data.filter(r => !r.submitted_by).map(seedFromRow).concat(demo);
  S.submissions = data.filter(r => r.submitted_by).map(subFromRow);
  S.overrides = {}; data.filter(r => r.removed).forEach(r => S.overrides[r.slug] = {removed:true});
  const deals = await sb.from("deals").select("*");
  if (!deals.error) window.EVENTLY_DEALS = deals.data.map(d => ({id:d.id, slug:d.event_slug||"", kind:d.kind, title:d.title, desc:d.description, until:toLocal(d.until), untilNote:d.until_note||undefined, source:d.source||undefined, verify:d.verify}))
    .concat((window.EVENTLY_DEALS||[]).filter(d => d.verify === "demo"));
  const venues = await sb.from("venues").select("*");
  if (!venues.error) venues.data.forEach(v => { window.EVENTLY_VENUES[v.name] = {area:v.area, lat:v.lat, lng:v.lng}; });
  const counts = await sb.rpc("event_counts");
  if (!counts.error) { serverCounts = {}; counts.data.forEach(c => serverCounts[c.slug] = c); }
}
async function pullUser(){
  const me = await sb.from("profiles").select("*").eq("id", uid).single();
  if (me.error) throw me.error;
  if (me.data.suspended) { await sb.auth.signOut(); uid = null; E.toast("This account is suspended. Contact Evently support."); return; }
  const prof = userFromProfile(me.data);
  S.users = [prof]; S.session = uid;
  S.prefs[uid] = me.data.prefs || {};
  const [sv, at, fo, no] = await Promise.all([
    sb.from("saves").select("event_slug").eq("user_id", uid),
    sb.from("attendance").select("event_slug,kind").eq("user_id", uid),
    sb.from("follows").select("venue").eq("user_id", uid),
    sb.from("notifications").select("*").eq("user_id", uid).order("created_at", {ascending:false}).limit(80)]);
  S.saved[uid] = (sv.data||[]).map(x => x.event_slug);
  S.attend[uid] = {}; (at.data||[]).forEach(x => S.attend[uid][x.event_slug] = x.kind);
  // Places followed before signing in are added to the account.
  const guest = S.follows.guest || [];
  serverFollows = (fo.data||[]).map(x => x.venue);
  S.follows[uid] = Array.from(new Set((fo.data||[]).map(x => x.venue).concat(guest)));
  const local = (S.notifs[uid]||[]).filter(n => !String(n.id).startsWith("s"));
  S.notifs[uid] = (no.data||[]).map(notifFromRow).concat(local).sort((a,b) => b.t - a.t).slice(0, 80);
  mineAtLoad = {saved:new Set(S.saved[uid]), attend:Object.assign({}, S.attend[uid])};
  if (prof.role === "admin") {
    const [ps, rp] = await Promise.all([sb.from("profiles").select("*").order("created_at"), sb.from("reports").select("*").order("created_at", {ascending:false}).limit(200)]);
    if (!ps.error) S.users = ps.data.map(userFromProfile);
    if (!rp.error) S.reports = rp.data.map(reportFromRow).concat(S.reports.filter(r => !String(r.id).startsWith("s") && !r.synced));
  }
  if (guest.length) { S.follows.guest = []; }
}
function clearUser(id){
  [S.saved, S.attend, S.follows, S.notifs, S.prefs].forEach(o => delete o[id]);
  S.users = []; S.session = null;
  S.reports = S.reports.filter(r => !String(r.id).startsWith("s"));
}

/* ---------- Push ---------- */
async function uploadPoster(s){
  const url = E.mediaURL(s.posterId); if (!url) return;
  const blob = await (await fetch(url)).blob();
  const path = `${s.owner}/${s.slug}-${s.posterId}.jpg`;
  const up = await sb.storage.from("posters").upload(path, blob, {contentType:"image/jpeg", upsert:true});
  if (up.error) throw up.error;
  s.posterPath = path; s.posterUrl = publicPoster(path);
}
async function pushAll(){
  const errs = [];
  const run = async (label, p) => { try { const r = await p; if (r && r.error) throw r.error; } catch(e){ errs.push(label + ": " + (e.message||e)); } };

  // Signing out or deleting the account
  if (snap.session && !S.session) {
    const gone = !S.users.some(u => u.id === snap.session);
    if (gone) await run("delete account", sb.rpc("delete_my_account"));
    await sb.auth.signOut(); clearUser(snap.session); uid = null; E.persist(); return errs;
  }
  if (!uid) {
    // Visitors can still send reports and contact messages.
    for (const r of S.reports) if (!snap.reports.has(r.id) && !r.synced) { await run("report", sb.from("reports").insert(reportRow(r))); r.synced = true; }
    return errs;
  }

  const sNow = new Set(S.saved[uid]||[]), sOld = new Set(snap.saved);
  for (const slug of sNow) if (!sOld.has(slug)) await run("save", sb.from("saves").upsert({user_id:uid, event_slug:slug}));
  for (const slug of sOld) if (!sNow.has(slug)) await run("unsave", sb.from("saves").delete().eq("user_id", uid).eq("event_slug", slug));

  const aNow = S.attend[uid]||{}, aOld = snap.attend;
  for (const [slug, k] of Object.entries(aNow)) if (aOld[slug] !== k) await run("attend", sb.from("attendance").upsert({user_id:uid, event_slug:slug, kind:k}));
  for (const slug of Object.keys(aOld)) if (!aNow[slug]) await run("unattend", sb.from("attendance").delete().eq("user_id", uid).eq("event_slug", slug));

  const fNow = new Set(S.follows[uid]||[]), fOld = new Set(snap.follows);
  for (const v of fNow) if (!fOld.has(v)) await run("follow", sb.from("follows").upsert({user_id:uid, venue:v}));
  for (const v of fOld) if (!fNow.has(v)) await run("unfollow", sb.from("follows").delete().eq("user_id", uid).eq("venue", v));

  const readNow = (S.notifs[uid]||[]).filter(n => n.read && snap.unread.has(n.id) && String(n.id).startsWith("s")).map(n => +String(n.id).slice(1));
  if (readNow.length) await run("notifications", sb.from("notifications").update({read:true}).in("id", readNow));

  const meNow = S.users.find(u => u.id === uid);
  const prefsNow = JSON.stringify(S.prefs[uid]||{});
  for (const u of S.users) {
    const key = JSON.stringify([u.name,u.city,u.interests,u.publicAttendance,u.role,u.suspended]);
    if (snap.users[u.id] === key && !(u.id === uid && prefsNow !== snap.prefs)) continue;
    if (u.id === uid) await run("profile", sb.from("profiles").update({name:u.name, city:u.city||"", interests:u.interests||[], public_attendance:!!u.publicAttendance, prefs:S.prefs[uid]||{}}).eq("id", uid));
    else if (isAdmin()) await run("user", sb.from("profiles").update({role:u.role==="admin"?"admin":"member", suspended:!!u.suspended}).eq("id", u.id));
  }
  if (isAdmin()) for (const id of Object.keys(snap.users)) if (id !== uid && !S.users.some(u => u.id === id)) await run("delete user", sb.rpc("admin_delete_user", {target:id}));
  if (!meNow) return errs;

  // Organizer submissions (and admin decisions on them)
  const subSlugs = new Set();
  for (const s of S.submissions) {
    subSlugs.add(s.slug);
    if (s.owner !== uid && !isAdmin()) continue;
    if (s.posterId && s.posterId !== s._posterFor) { try { await uploadPoster(s); s._posterFor = s.posterId; } catch(e){ errs.push("poster: " + (e.message||e)); } }
    const row = rowFromSub(s), key = JSON.stringify(Object.assign({}, row, {_poster:s.posterId||""}));
    if (snap.subs[s.slug] === key) continue;
    if (!snap.subs[s.slug]) { delete row.review_note; row.review = "pending"; row.verify = "organizer"; await run("submit", sb.from("events").insert(row)); }
    else await run("update event", sb.from("events").update(row).eq("slug", s.slug));
  }
  for (const slug of Object.keys(snap.subs)) if (!subSlugs.has(slug)) await run("withdraw", sb.from("events").delete().eq("slug", slug));

  if (isAdmin()) {
    // Admin edits to listings, removals and featuring
    for (const [slug, o] of Object.entries(S.overrides)) {
      const key = JSON.stringify(o); if (snap.ov[slug] === key) continue;
      const f = o.fields || {}, up = {};
      if (f.title) up.title = f.title; if (f.venue) up.venue = f.venue; if (f.desc) up.description = f.desc;
      if ("status" in f) up.status = f.status || "scheduled"; if ("statusNote" in f) up.status_note = f.statusNote || null;
      if (f.start) { up.start_at = toISO(f.start); up.end_at = f.end ? toISO(f.end) : null; }
      if (o.featured != null) up.featured = !!o.featured;
      up.removed = !!o.removed;
      await run("admin edit", sb.from("events").update(up).eq("slug", slug));
    }
    for (const slug of Object.keys(snap.ov)) if (!S.overrides[slug]) await run("admin restore", sb.from("events").update({removed:false}).eq("slug", slug));
    for (const r of S.reports) {
      if (String(r.id).startsWith("s")) { if (snap.reports.get(r.id) !== r.state) await run("report", sb.from("reports").update({resolved:r.state !== "open"}).eq("id", +r.id.slice(1))); }
      else if (!r.synced) { await run("report", sb.from("reports").insert(reportRow(r))); r.synced = true; }
    }
    const newAudit = S.audit.filter(a => a.t > snap.audit).reverse();
    for (const a of newAudit) await run("audit", sb.from("audit_log").insert({actor:uid, action:a.action, target:String(a.target||"")}));
  } else {
    for (const r of S.reports) if (!snap.reports.has(r.id) && !r.synced && !String(r.id).startsWith("s")) { await run("report", sb.from("reports").insert(reportRow(r))); r.synced = true; }
  }
  return errs;
}
function reportRow(r){
  return {event_slug:r.slug||null, reason:r.reason||"Other", details:r.text||null, kind:r.type==="contact"?"contact":"report", contact:r.from||null, reporter:uid||null};
}

C.sync = async function(){
  if (!C.on || !C.ready) return;
  if (syncing) { again = true; return; }
  syncing = true;
  try {
    const errs = await pushAll();
    if (errs.length) { console.warn("[Evently] Some changes didn't save:", errs); E.toast("Some changes couldn't be saved. Check your connection and try again."); }
    E.invalidate(); takeSnap();
  } finally { syncing = false; if (again) { again = false; C.sync(); } }
};

/* ---------- Counts shown on events ---------- */
C.countsFor = function(slug, local){
  const s = serverCounts[slug] || {going:0, interested:0, saves:0, views:0, shares:0};
  const savedNow = uid && (S.saved[uid]||[]).includes(slug) ? 1 : 0, savedThen = mineAtLoad.saved.has(slug) ? 1 : 0;
  const aNow = uid ? (S.attend[uid]||{})[slug] : null, aThen = mineAtLoad.attend[slug];
  const d = k => (aNow === k ? 1 : 0) - (aThen === k ? 1 : 0);
  const newViews = (S.views[slug]||[]).filter(v => v.t > loadTime).length, newShares = (S.shares[slug]||[]).filter(v => v.t > loadTime).length;
  return {saves:Math.max(0, +s.saves + savedNow - savedThen), interested:Math.max(0, +s.interested + d("interested")), going:Math.max(0, +s.going + d("going")),
    views:+s.views + newViews, shares:+s.shares + newShares, recent:local.recent};
};
C.attendees = async slug => { if (!C.on || !sb) return null; const {data, error} = await sb.rpc("public_attendees", {event:slug}); return error ? null : data; };
C.bump = (slug, field) => { if (C.on && sb) sb.rpc("bump_stat", {slug, field}).then(() => {}, () => {}); };

/* ---------- Sign in, sign up, reset ---------- */
const pwOK = pw => pw.length >= 8 && /[a-z]/i.test(pw) && /\d/.test(pw);
const redirect = () => location.origin + location.pathname;
const friendly = m => /invalid login/i.test(m) ? "That email and password don't match. Try again or reset your password."
  : /not confirmed/i.test(m) ? "Confirm your email first. We sent you a link when you signed up."
  : /already registered|already exists/i.test(m) ? "An account with that email already exists. Sign in instead."
  : /rate limit|too many/i.test(m) ? "Too many attempts. Wait a few minutes and try again."
  : m;
C.authSubmit = async function(mode, m, email){
  const $ = s => m.querySelector(s), err = $("#aErr"), btn = $("button.btn-primary");
  const busy = on => { if (btn) { btn.disabled = on; btn.style.opacity = on ? .6 : 1; } };
  if (mode === "reset") {
    busy(true); const {error} = await sb.auth.resetPasswordForEmail(email, {redirectTo:redirect()}); busy(false);
    if (error) { err.textContent = friendly(error.message); return; }
    E.modal(`<div class="modal-head"><h3>Check your email</h3><button class="icon-btn" data-close aria-label="Close">${E.I.x}</button></div><p class="small muted">If ${E.esc(email)} has an Evently account, we've sent a link to set a new password. Open it on this device.</p>`);
    return;
  }
  const pw = $("#aPw").value;
  if (mode === "login") {
    busy(true); const {data, error} = await sb.auth.signInWithPassword({email, password:pw}); busy(false);
    if (error) { err.textContent = friendly(error.message); return; }
    await afterSignIn(data.user); if (!uid) return;
    E.closeModal(); E.toast("Welcome back, " + (E.me()||{}).name); R().afterAuth(); return;
  }
  if ($("#aHp") && $("#aHp").value) return;
  const name = $("#aName").value.trim(); if (name.length < 2) { err.textContent = "Enter a display name."; return; }
  if (!pwOK(pw)) { err.textContent = "Use at least 8 characters with a letter and a number."; return; }
  const interests = Array.from(m.querySelectorAll("[data-int][aria-pressed=true]")).map(b => b.dataset.int);
  busy(true);
  const {data, error} = await sb.auth.signUp({email, password:pw, options:{emailRedirectTo:redirect(), data:{name, city:$("#aCity").value, interests}}});
  busy(false);
  if (error) { err.textContent = friendly(error.message); return; }
  if (data.user && Array.isArray(data.user.identities) && !data.user.identities.length) { err.textContent = friendly("already registered"); return; }
  if (!data.session) {
    E.modal(`<div class="modal-head"><h3>Confirm your email</h3><button class="icon-btn" data-close aria-label="Close">${E.I.x}</button></div><p class="small muted">We've sent a link to ${E.esc(email)}. Open it to finish creating your account, then sign in.</p>`);
    return;
  }
  await afterSignIn(data.user); E.closeModal(); E.toast("Account created. Welcome to Evently!"); R().afterAuth();
};
async function afterSignIn(user){
  uid = user.id;
  try { await pullUser(); } catch(e) { console.warn("[Evently]", e); }
  E.invalidate(); takeSnap(); snap.follows = serverFollows.slice(); E.persist(); if (R()) R().header();
  if (uid) C.sync(); // pushes follows saved before signing in
}
function newPasswordModal(){
  const m = E.modal(`<div class="modal-head"><h3>Set a new password</h3><button class="icon-btn" data-close aria-label="Close">${E.I.x}</button></div>
    <form id="npF" style="display:grid;gap:12px"><div class="field"><label for="npP">New password</label><input class="input" id="npP" type="password" autocomplete="new-password"><span class="tiny muted">At least 8 characters, with a letter and a number.</span></div><span class="err" id="npE" role="alert"></span><button class="btn btn-primary">Save password</button></form>`);
  m.querySelector("#npF").onsubmit = async e => { e.preventDefault(); const pw = m.querySelector("#npP").value;
    if (!pwOK(pw)) { m.querySelector("#npE").textContent = "Use at least 8 characters with a letter and a number."; return; }
    const {error} = await sb.auth.updateUser({password:pw}); if (error) { m.querySelector("#npE").textContent = friendly(error.message); return; }
    E.closeModal(); E.toast("Password updated. You're signed in."); };
}

/* ---------- Start ---------- */
C.init = async function(){
  if (!window.supabase || !window.supabase.createClient) return;
  try {
    sb = window.supabase.createClient(URL_, KEY, {auth:{flowType:"pkce", persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, storageKey:"evently.auth"}});
    await withTimeout(pullEvents(), 6000);
    const {data} = await withTimeout(sb.auth.getSession(), 8000);
    const local = S.session;
    C.on = true;
    if (data.session) { uid = data.session.user.id; await withTimeout(pullUser(), 8000); }
    else if (local) { clearUser(local); }   // accounts made before the switch lived only in this browser
    loadTime = Date.now(); E.invalidate(); takeSnap(); if (uid) snap.follows = serverFollows.slice(); C.ready = true; E.persist();
    if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    sb.auth.onAuthStateChange((ev, session) => {
      if (ev === "PASSWORD_RECOVERY") setTimeout(newPasswordModal, 300);
      if (ev === "SIGNED_IN" && session && session.user.id !== uid) afterSignIn(session.user).then(() => R() && R().render());
      if (ev === "SIGNED_OUT" && uid) { clearUser(uid); uid = null; takeSnap(); E.persist(); if (R()) { R().header(); R().render(); } }
    });
  } catch(e) {
    console.warn("[Evently] Working offline from bundled listings:", e && e.message || e);
    C.on = false;
  }
};
})();
