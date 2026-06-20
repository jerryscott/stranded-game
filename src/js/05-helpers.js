/* ==========================================================
   SECTION: HELPERS  (pure, no rendering)
   ========================================================== */
const $ = id => document.getElementById(id);
const H = id => HEXES[id];

function posKey(id){ const p = H(id).pos; return p.x + "," + p.y; }
function neighbor(id, dir){ const p = H(id).pos, d = DIRS[dir]; return COORD2ID[(p.x+d[0]) + "," + (p.y+d[1])] || null; }
function edgeType(a, b){ return BMAP[[posKey(a), posKey(b)].sort().join("|")] || null; }

function barrierKind(id, dir){
  const n = neighbor(id, dir);
  if (!n) return null;
  const t = edgeType(id, n);
  if (t === "mountains") return "mountains";
  if (t === "thicket") return "thicket";
  if (t === "wall") return "wall";
  if (t === "river") return "water";
  if (H(n).terrain === "lake") return "water";
  return null;
}
function nextToWater(id){ return DORD.some(d => barrierKind(id, d) === "water"); }
function has(id){ return S.inv.some(i => i.id === id); }
function comp(hx, cid){ return H(hx).comps.find(c => c.id === cid); }
function clamp(v){ return Math.max(0, Math.min(100, v)); }

function log(m, c){
  const p = document.createElement("p");
  p.className = c || "you";
  p.textContent = m;
  const L = $("log");
  L.appendChild(p);
  L.scrollTop = L.scrollHeight;
}

// Issue #2 fix: classify an item's tone by NET effect, not health's sign alone.
function effectTone(eff){
  if (!eff) return "ev";
  const net = (eff.health || 0) + (eff.hydration || 0);
  if (net > 0) return "good";
  if (net < 0) return "bad";
  return "ev";
}
