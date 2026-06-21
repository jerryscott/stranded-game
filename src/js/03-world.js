/* ==========================================================
   SECTION: WORLD BUILD
   (Deterministic + re-runnable, so restart() can call this again
   and get a pristine map without any leftover mutated flags.)
   ========================================================== */
const HEXES = {}, COORD2ID = {}, BMAP = {};
const BLDG = {}; // building interiors, rebuilt fresh each world init by initBuildings()
// Active map context: the overworld by default, swapped to a building's interior
// by enterBuilding() and back by exitBuilding(). All hex/edge access in helpers.js
// and renderMap goes through these three, so the whole stack works in either.
let activeHexes = HEXES, activeC2I = COORD2ID, activeBmap = BMAP;

function rng(str){
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
}

function buildLattice(){
  const specialClone = JSON.parse(JSON.stringify(SPECIAL)); // fresh copy every call
  const gn = { clearing:"Quiet Clearing", forest:"Alien Forest", dense:"Tangled Brush" };
  const gd = {
    clearing:["A break in the trees; the sky is an unfamiliar mauve.","Open ground scattered with iridescent grasses.","A small clearing, almost peaceful, almost."],
    forest:["Tall glassy-barked trees filter the light to a green murk.","Forest, endless forest. Something chitters, then goes quiet.","Alien conifers crowd close, needles faintly humming."],
    dense:["Vines and thorned creepers claw at your sleeves.","Undergrowth so dense you navigate by stubbornness.","The brush thickens into a snarl you shoulder through."]
  };
  for (let c = -4; c <= 4; c++){
    const h = 9 - Math.abs(c);
    const y0 = -(h - 1) / 2;
    for (let i = 0; i < h; i++){
      const y = y0 + i;
      const key = c + "," + y;
      if (specialClone[key]){
        const sp = specialClone[key];
        sp.pos = { x:c, y:y };
        sp.disc = false;
        HEXES[sp.id] = sp;
        COORD2ID[key] = sp.id;
      } else {
        const r = rng("g" + key);
        const t = r() < 0.16 ? "clearing" : (r() < 0.78 ? "forest" : "dense");
        const id = "H" + ("" + c).replace("-","m") + "_" + ("" + y).replace("-","m").replace(".","p");
        const comps = [];
        if (r() < 0.15) comps.push(r() < 0.8 ? berries() : puddle());
        HEXES[id] = { id, name:gn[t], terrain:t, env:"outdoor", light:(t==="dense"?"dark":"lit"),
          disc:false, desc:gd[t][Math.floor(r()*3)%3], comps, pos:{x:c,y:y} };
        COORD2ID[key] = id;
      }
    }
  }
}

function applyBlockedEdges(){
  for (const e of BLOCKED) BMAP[[e.a, e.b].sort().join("|")] = e.type;
}

function applyBuildingWalls(){
  for (const bld of BUILDINGS){
    const hexSet = new Set(bld.hexes);
    for (const hexId of bld.hexes){
      for (const dir of DORD){
        const nId = neighbor(hexId, dir);
        if (!nId || hexSet.has(nId)) continue;          // no neighbor, or internal connection: leave open
        const isEntrance = bld.entrances.some(e => e.hex === hexId && e.dir === dir);
        if (isEntrance) continue;                         // the one designated door: leave open
        const key = [posKey(hexId), posKey(nId)].sort().join("|");
        BMAP[key] = "wall";
      }
    }
  }
}

/* Clone each building interior fresh (the way buildLattice clones SPECIAL) so
   restart() always gets pristine rooms. Each interior becomes its own little map
   context: hexes keyed by id, a coord->id index, and an edge map. */
function initBuildings(){
  for (const k in BLDG) delete BLDG[k];
  for (const id in INTERIORS){
    const def = INTERIORS[id];
    const rooms = JSON.parse(JSON.stringify(def.rooms));
    const hexes = {}, c2i = {}, bmap = {};
    for (const key in rooms){
      const hx = rooms[key];
      const [x, y] = key.split(",").map(Number);
      hx.pos = { x, y }; hx.disc = false;
      hexes[hx.id] = hx;
      c2i[key] = hx.id;
    }
    for (const e of (def.blocked || [])) bmap[[e.a, e.b].sort().join("|")] = e.type;
    BLDG[id] = { hexes, c2i, bmap, entry:def.entry, overworld:def.overworld };
  }
}

function initWorld(){
  for (const k in HEXES) delete HEXES[k];
  for (const k in COORD2ID) delete COORD2ID[k];
  for (const k in BMAP) delete BMAP[k];
  buildLattice();
  applyBlockedEdges();
  applyBuildingWalls();
  initBuildings();
  activeHexes = HEXES; activeC2I = COORD2ID; activeBmap = BMAP; // always (re)start on the overworld
}
