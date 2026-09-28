/* ========== SETTINGS ========== */
const ADMIN_PASSWORD = "admin123"; // <-- change this!
const ROLES = ["Student", "Web Developer", "Creative Thinker", "Future Professional"];

/* ========== HELPERS ========== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  setTimeout(() => t.classList.remove("on"), 2200);
}
$("#yr").textContent = new Date().getFullYear();

/* ========== TYPING TEXT ANIMATION ========== */
(function typing() {
  let r = 0, c = 0, del = false;
  const el = $("#typed");
  (function tick() {
    const word = ROLES[r];
    el.textContent = word.slice(0, del ? --c : ++c);
    let delay = del ? 50 : 110;
    if (!del && c === word.length) { del = true; delay = 1400; }
    else if (del && c === 0) { del = false; r = (r + 1) % ROLES.length; delay = 400; }
    setTimeout(tick, delay);
  })();
})();

/* ========== SCROLL REVEAL ========== */
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("show")), { threshold: .12 });
$$(".reveal").forEach(el => io.observe(el));

/* ========== MOBILE MENU ========== */
$("#menuBtn").onclick = () => $("#menu").classList.toggle("open");
$$("#menu a").forEach(a => a.onclick = () => $("#menu").classList.remove("open"));

/* ========== INDEXEDDB (saves pictures/files) ========== */
let db;
const open = indexedDB.open("portfolioDB", 1);
open.onupgradeneeded = e => e.target.result.createObjectStore("files", { keyPath: "id", autoIncrement: true }).createIndex("cat", "cat");
open.onsuccess = e => { db = e.target.result; render(); loadAvatar(); };
const store = m => db.transaction("files", m).objectStore("files");
const getAll = cat => new Promise(res => { store("readonly").index("cat").getAll(cat).onsuccess = e => res(e.target.result); });

/* ========== TABS + RENDER ========== */
let current = "quiz";
$$(".tab").forEach(t => t.onclick = () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active"); current = t.dataset.cat; render();
});

const size = b => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
const icon = n => { const x = n.split(".").pop().toLowerCase();
  return { pdf: "📕", doc: "📘", docx: "📘", xls: "📗", xlsx: "📗", ppt: "📙", pptx: "📙", zip: "🗜️", txt: "📄", mp4: "🎬", mp3: "🎵" }[x] || "📁"; };

async function render() {
  if (!db) return;
  const items = (await getAll(current)).sort((a, b) => b.date - a.date);
  const grid = $("#grid"); grid.innerHTML = "";
  $("#empty").style.display = items.length ? "none" : "block";
  items.forEach((f, i) => {
    const url = URL.createObjectURL(f.blob);
    const isImg = f.type.startsWith("image/");
    const card = document.createElement("div");
    card.className = "card"; card.style.animationDelay = i * .06 + "s";
    card.innerHTML = `<div class="thumb">${isImg ? `<img src="${url}" alt="">` : icon(f.name)}</div>
      <div class="meta"><div class="name"></div><small>${size(f.blob.size)} · ${new Date(f.date).toLocaleDateString()}</small>
      <div class="row"><a href="${url}" download="${f.name.replace(/"/g, "")}">Download</a><button class="del">Delete</button></div></div>`;
    $(".name", card).textContent = f.name;
    $(".thumb", card).onclick = () => isImg ? openLB(url) : window.open(url, "_blank");
    $(".del", card).onclick = () => { if (confirm("Delete this file?")) { store("readwrite").delete(f.id).onsuccess = () => { render(); toast("Deleted"); }; } };
    grid.appendChild(card);
  });
}

/* ========== UPLOAD (multiple) ========== */
async function saveFiles(files) {
  if (!document.body.classList.contains("admin")) return;
  const list = [...files]; if (!list.length) return;
  const tx = db.transaction("files", "readwrite"), st = tx.objectStore("files");
  list.forEach(f => st.add({ cat: current, name: f.name, type: f.type || "application/octet-stream", blob: f, date: Date.now() }));
  tx.oncomplete = () => { render(); toast(list.length + " file(s) uploaded ✔"); };
}
$("#fileInput").onchange = e => { saveFiles(e.target.files); e.target.value = ""; };
const dz = $("#dropzone");
["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("over"); }));
["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("over"); }));
dz.addEventListener("drop", e => saveFiles(e.dataTransfer.files));

/* ========== LIGHTBOX ========== */
function openLB(src) { $("#lbImg").src = src; $("#lightbox").classList.add("on"); }
$("#lightbox").onclick = () => $("#lightbox").classList.remove("on");

/* ========== ADMIN MODE (only you can edit/upload) ========== */
function setAdmin(on) {
  document.body.classList.toggle("admin", on);
  $$("[data-key]").forEach(el => el.contentEditable = on);
  $("#adminBtn").textContent = on ? "🔓 Logout" : "🔒 Admin";
}
$("#adminBtn").onclick = () => {
  if (document.body.classList.contains("admin")) { setAdmin(false); toast("Logged out"); return; }
  const p = prompt("Enter admin password:");
  if (p === ADMIN_PASSWORD) { setAdmin(true); toast("Admin mode ON"); } else if (p !== null) toast("Wrong password");
};

/* ========== EDITABLE TEXT (saved) ========== */
$$("[data-key]").forEach(el => {
  const saved = localStorage.getItem("pf_" + el.dataset.key);
  if (saved) el.textContent = saved;
  el.addEventListener("blur", () => { localStorage.setItem("pf_" + el.dataset.key, el.textContent.trim()); toast("Saved ✔"); });
});

/* ========== PROFILE PHOTO ========== */
function loadAvatar() {
  const r = store("readonly").get(-1);
  r.onsuccess = () => { if (r.result) $("#avatarImg").src = URL.createObjectURL(r.result.blob); };
}
$("#avatarInput").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  store("readwrite").put({ id: -1, cat: "_avatar", name: "avatar", type: f.type, blob: f, date: Date.now() }).onsuccess = () => { loadAvatar(); toast("Photo updated ✔"); };
};
