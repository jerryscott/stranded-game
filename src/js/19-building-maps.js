/* ==========================================================
   SECTION: BUILDING MAPS
   Interior sub-map definitions and runtime state.

   Each BUILDING_DEF describes an interior as a mini hex-grid,
   using the same (x, y) hex-offset coordinate system as the
   overworld. Rooms are placed in a tight cluster so the map
   renderer can draw them at the normal scale.

   At runtime, initBuildings() deep-clones each def into BLDG,
   producing independent hexes/coord2id/bmap objects per building.
   S.submap = building overworld ID (e.g. "GENBUILDING") while inside.
   ========================================================== */

/* ── BUILDING_DEFS ──────────────────────────────────────────
   Each entry keyed by the overworld hex ID it belongs to.
   rooms[] — room objects (become hex entries in BLDG[id].hexes)
   links[] — undirected passages between rooms {a:"roomId", b:"roomId"}
   entryRoom — which room id is the entry/exit point
*/
const BUILDING_DEFS = {
  "GENBUILDING": {
    entryRoom: "GEN_ROOM",
    rooms: [
      {
        id: "GEN_ROOM",
        name: "Generator Room",
        terrain: "indoor",
        env: "indoor",
        light: "dark",
        desc: "Bare cinderblock. A diesel generator squats in the corner, cables snaking to a breaker panel on the wall. Emergency lighting gives everything a greenish tinge.",
        comps: [
          { t:"man", id:"power", name:"Breaker Panel", icon:"⚡", verb:"Examine the breaker panel" }
        ],
        pos: { x: 0, y: 0 }
      },
      {
        id: "GEN_BREAK",
        name: "Break Room",
        terrain: "indoor",
        env: "indoor",
        light: "dark",
        desc: "A dusty break room: folding chair, overflowing ashtray, and a vending machine plastered with cheerful stickers. It's unpowered and very, very smug about it.",
        comps: [
          { t:"man", id:"vendor", name:"Vending Machine", icon:"🎰", verb:"Use the vending machine" },
          { t:"col", id:"green_keycard", name:"Green Keycard", kind:"part", icon:"💚", required:true, hidden:true,
            grab:"You retrieve the GREEN KEYCARD from the vending tray. (repair part)" }
        ],
        pos: { x: 1, y: -0.5 }
      }
    ],
    /* direct passage between these two rooms */
    links: [
      { a: "GEN_ROOM", b: "GEN_BREAK" }
    ]
  }
};

/* ── BLDG — runtime state (reset by initBuildings on every world init) ── */
let BLDG = {};

function initBuildings(){
  BLDG = {};
  for (const [overId, def] of Object.entries(BUILDING_DEFS)){
    const hexes    = {};
    const coord2id = {};
    const bmap     = {};

    /* Deep-clone all rooms so restart always gets pristine comps */
    const rooms = JSON.parse(JSON.stringify(def.rooms));
    for (const r of rooms){
      r.disc = false;
      hexes[r.id]    = r;
      coord2id[r.pos.x + "," + r.pos.y] = r.id;
    }

    /* Open passages between linked rooms (no barrier = open passage) */
    /* Wall every other edge between interior rooms and the void.
       For building sub-maps, "void" is any grid position that has no room.
       We don't need to physically add walls in bmap — the neighbor()
       function returns null for coords with no entry in coord2id,
       and move() treats null neighbors as "No way through" already.
       Links are simply the absence of a wall: open by default.       */

    BLDG[overId] = {
      hexes,
      coord2id,
      bmap,
      entryHex: def.entryRoom
    };
  }
}
