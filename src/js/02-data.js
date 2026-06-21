/* ==========================================================
   SECTION: DATA  (terrain, directions, map content)
   ========================================================== */
const TERRAIN = {
  clearing:{label:"clearing",hyd:3}, forest:{label:"forest",hyd:4}, dense:{label:"thicket",hyd:6},
  water:{label:"spring",hyd:3}, lake:{label:"lake",hyd:3}, ruin:{label:"ruins",hyd:4}, indoor:{label:"shelter",hyd:2}
};
const DIRS = { N:[0,-1], S:[0,1], NE:[1,-0.5], SE:[1,0.5], NW:[-1,-0.5], SW:[-1,0.5] };
const KEYDIR = { q:"NW", w:"N", e:"NE", a:"SW", s:"S", d:"SE", arrowup:"N", arrowdown:"S" };
const DORD = ["NW","N","NE","SE","S","SW"];
const DWORD = { N:"north", S:"south", NE:"northeast", SE:"southeast", NW:"northwest", SW:"southwest" };

const berries = () => ({ t:"col", id:"berries", name:"Wild Glow-Berries", kind:"food", icon:"🫐", consumable:true,
  effects:{health:6}, grab:"You risk a handful of glow-berries. Tart, faintly electric, non-lethal. (+6 health)" });
const puddle = () => ({ t:"col", id:"puddle", name:"Rain Puddle", kind:"water", icon:"💧", consumable:true,
  effects:{hydration:12,health:-2}, grab:"You sip from a clean-ish puddle. Beggars, choosers, etc. (+12 hydration, -2 health)" });

/* SPECIAL hexes, keyed by "c,y". Cloned fresh on every world build (see
   buildLattice) so restart() always starts from pristine flags. */
const SPECIAL = {
 "0,0":{id:"FURROW",name:"Crash Furrow",terrain:"clearing",env:"outdoor",light:"lit",
   desc:"Smoke still curls from the furrow your pod plowed into the loam. A rare patch of open sky. The Nav-Comp blinks from a Frisbee-sized hole in its casing.",
   comps:[{t:"col",id:"sandwich",name:"Half-Eaten Sandwich",kind:"food",icon:"🥪",consumable:true,effects:{health:10},grab:"You wolf the sandwich. Quantum Ham on Rye — best before the Carter administration. (+10 health)"}]},
 "0,-1":{id:"OBELISK",name:"Mossy Obelisk",terrain:"ruin",env:"outdoor",light:"dark",
   desc:"A slab of black stone etched with spiralling alien glyphs.",
   comps:[{t:"man",id:"obelisk",name:"Alien Inscription",icon:"🗿",verb:"Decode the inscription"}]},
 "0,-4":{id:"TRANSPORT",name:"The Transport",terrain:"clearing",env:"outdoor",light:"lit",
   desc:"Your actual ride out: a battered shuttle slumped between two trees, ugly and beautiful. It needs parts and a clue before it'll fly.",
   comps:[{t:"man",id:"transport",name:"The Wrecked Transport",icon:"🚀",verb:"Install the parts and launch"}]},
 "-1,-0.5":{id:"SPRING",name:"The Spring",terrain:"water",env:"outdoor",light:"lit",
   desc:"A clear spring burbles over smooth stones in a shaft of sun. One stone is suspiciously, comically heavy.",
   comps:[{t:"col",id:"spring_water",name:"Clean Spring Water",kind:"water",icon:"💧",consumable:true,renewable:true,effects:{hydration:45,health:5},grab:"You drink deep. Cold, clean, faintly minty. (+45 hydration, +5 health)"},
          {t:"col",id:"rock",name:"Suspiciously Heavy Rock",kind:"tool",icon:"🪨",grab:"You pocket the suspiciously heavy rock. It has the air of an object with One Job."}]},
 "1,-1.5":{id:"BUILD_GEN",name:"Generator Room",terrain:"indoor",env:"indoor",light:"dark",
   desc:"A cinderblock outbuilding, dark and dead. A grimy breaker panel dominates one wall. A faded stencil beside it reads: \"GREEN = genny start.  RED = LIVE MAINS — DO NOT TOUCH.\" There's exactly one door, and you're standing in it, facing the obelisk.",
   comps:[{t:"man",id:"power",name:"Breaker Panel",icon:"🔌",verb:"Fiddle with the breaker panel"}]},
 "1,-2.5":{id:"BUILD_BREAK",name:"Break Room",terrain:"indoor",env:"indoor",light:"dark",
   desc:"The other half of the building, through an interior doorway: a moldering break room. A vending machine looms in the corner, screen dark.",
   comps:[{t:"col",id:"cola",name:"Warm TAB-ish Cola",kind:"water",icon:"🥤",consumable:true,effects:{hydration:20,health:-3},grab:"You crack a warm, flat, vaguely radioactive cola. (+20 hydration, -3 health)"},
          {t:"man",id:"vendor",name:"Vending Machine",icon:"📟",verb:"Use the vending machine"},
          {t:"col",id:"green_keycard",name:"Green Keycard",kind:"part",icon:"💳",required:true,hidden:true,grab:"You pluck the glowing GREEN KEYCARD from the tray. (repair part)"}]},
 "0,2":{id:"HATCH",name:"Cargo Hatch",terrain:"indoor",env:"indoor",light:"lit",
   desc:"A chunk of your pod's cargo section, hatch jammed shut, emergency lighting flickering inside.",
   comps:[{t:"man",id:"hatch",name:"Jammed Cargo Hatch",icon:"🚪",verb:"Override the hatch lock"},
          {t:"col",id:"coolant_cell",name:"Coolant Cell",kind:"part",icon:"🧊",required:true,hidden:true,grab:"You unstrap the COOLANT CELL from the bulkhead. (repair part)"},
          {t:"col",id:"phaser",name:"\"Phaser\" (label maker)",kind:"weapon",icon:"🔫",hidden:true,grab:"You claim the sleek 'phaser.' It's a label maker. It prints PEW."}]},
 "-2,1":{id:"STATION",name:"Ranger Station",terrain:"indoor",env:"indoor",light:"lit",
   desc:"A wood-paneled ranger cabin — shag carpet, a CRT hissing static, a dead rotary phone. A locked footlocker sits on the floor. A Post-it on the TV: \"COMBO = THE ANSWER. you know the one. —D.A.\"",
   comps:[{t:"man",id:"locker",name:"Locked Footlocker",icon:"🧰",verb:"the footlocker"},
          {t:"col",id:"puffs",name:"Family-Size Cheese Puffs",kind:"food",icon:"🧀",consumable:true,effects:{health:8},grab:"You demolish a bag of radioactively orange cheese puffs. (+8 health)"},
          {t:"col",id:"flux_coil",name:"Flux Coil",kind:"part",icon:"🌀",required:true,hidden:true,grab:"You lift the FLUX COIL from its foam nest. (repair part)"}]},
 "1,-0.5":{id:"LAKESHORE",name:"Lakeshore",terrain:"forest",env:"outdoor",light:"lit",
   desc:"A pebbled shore. Driftwood lines the waterline. A cluster of alien plants crowds the bank — enormous waxy pods, each the size of a pillow.",
   comps:[{t:"col",id:"driftwood",name:"Bundle of Driftwood",kind:"mat",icon:"🪵",grab:"You gather a bundle of sun-bleached driftwood. (raft material)"},
          {t:"col",id:"dopehtesu",name:"Dopehtesu Pods",kind:"mat",icon:"🌿",grab:"You harvest a cluster of Dopehtesu pods — huge, waxy, absurdly buoyant. The locals (if there were any) would probably have a name for them. (raft material)"}]},
 "-3,-1.5":{id:"SPRING2",name:"Hidden Spring",terrain:"water",env:"outdoor",light:"lit",
   desc:"A mossy cleft in the rock face seeps clear water into a shallow pool. Easy to miss — and easy to return to.",
   comps:[{t:"col",id:"spring_water2",name:"Clean Spring Water",kind:"water",icon:"💧",consumable:true,renewable:true,effects:{hydration:45,health:5},grab:"You drink from the hidden spring. Cold and clean. (+45 hydration, +5 health)"}]},
 "-2,-1":{id:"VINE_THICKET",name:"Vine Thicket",terrain:"dense",env:"outdoor",light:"dark",
   desc:"A wall of rubbery alien vines, thick as fire hoses.",
   comps:[{t:"col",id:"vines",name:"Coil of Tough Vines",kind:"mat",icon:"🪢",grab:"You hack free a long coil of tough, ropy vines. (raft material)"}]},
 "2,0":{id:"LAKE",name:"The Lake",terrain:"lake",env:"outdoor",light:"lit",
   desc:"You are out on the misty lake, riding low on your raft. Something waterlogged bobs against the hull.",
   comps:[{t:"col",id:"lake_water",name:"Lake Water",kind:"water",icon:"🌊",consumable:true,effects:{hydration:30,health:-6},grab:"You scoop lake water over the side. Brackish, with a hint of ozone. (+30 hydration, -6 health)"},
          {t:"col",id:"repair_manual",name:"Ship Repair Manual",kind:"part",icon:"📖",grab:"You fish out a waterlogged but readable SHIP REPAIR MANUAL. It lists what the transport needs: Coolant Cell, Flux Coil, Green Keycard. Now you know. (required reading)"}]},
 "2,2":{id:"DRONE",name:"Crashed Survey Drone",terrain:"ruin",env:"outdoor",light:"lit",
   desc:"On the far shore, a crashed survey drone lies half-buried, panels splayed like a dead beetle.",
   comps:[{t:"man",id:"drone",name:"Drone Memory Core",icon:"📡",verb:"Read the drone's last log"},
          {t:"col",id:"ration",name:"Emergency Ration Cache",kind:"food",icon:"🥫",consumable:true,effects:{health:20,hydration:15},grab:"You crack the drone's ration cache. Actual edible food and a sealed canteen. (+20 health, +15 hydration)"}]},
 "-1,1.5":{id:"HOLLOW",name:"Spore Hollow",terrain:"dense",env:"outdoor",light:"dark",
   desc:"A dank hollow choked with mushrooms pulsing radioactive disco colors. Glittering spores hang in the air.",
   comps:[{t:"col",id:"fungus",name:"Glowing Fungus",kind:"food",icon:"🍄",consumable:true,effects:{health:-18},grab:"You eat the glowing fungus, learning nothing. It fights back. (-18 health)"},
          {t:"man",id:"spores",name:"Cloud of Glowing Spores",icon:"✨",verb:"Harvest the glowing spores"}]},
 "2,-1":{id:"SNAKEGRASS",name:"Snakegrass Thicket",terrain:"dense",env:"outdoor",light:"dark",
   desc:"Brush so thick you wade more than walk. Something rustles in a hollow log.",
   comps:[{t:"man",id:"log",name:"Rustling Hollow Log",icon:"🐍",verb:"Reach into the hollow log"}]},
 "-3,1.5":{id:"LEANTO",name:"Hermit's Lean-To",terrain:"indoor",env:"indoor",light:"dark",
   desc:"A driftwood lean-to. A faded Polaroid of a grinning hermit and an unmistakable Bigfoot is pinned to a post.",
   comps:[{t:"col",id:"beans",name:"Can of Mystery Beans",kind:"food",icon:"🥫",consumable:true,effects:{health:12,hydration:5},grab:"You eat cold beans like a gremlin. Restorative. (+12 health, +5 hydration)"},
          {t:"col",id:"polaroid",name:"Hermit & Bigfoot Polaroid",kind:"junk",icon:"📸",grab:"You take the Polaroid. Pulitzer pending."}]},
};

/* Natural barriers (rivers, mountains, thicket) — undirected, by coord-key */
const BLOCKED = [
  // River: flows in from the east (4,0 -> 3,0.5), through the lake, then drains
  // southwest (1,0.5 -> 0,1) with a south arm down col 1 (1,1.5 -> 1,2.5 -> 1,3.5).
  // Seals a southern pocket so the DRONE (2,2) is reachable only by raft; all raft
  // materials live NORTH of the river. Verified winnable by lattice BFS.
  {a:"4,0",b:"4,1",type:"river"}, {a:"3,0.5",b:"4,1",type:"river"}, {a:"3,0.5",b:"3,1.5",type:"river"},
  {a:"2,1",b:"3,0.5",type:"river"}, {a:"1,0.5",b:"2,1",type:"river"}, {a:"1,1.5",b:"2,1",type:"river"},
  {a:"1,1.5",b:"2,2",type:"river"}, {a:"1,2.5",b:"2,2",type:"river"}, {a:"1,2.5",b:"2,3",type:"river"},
  {a:"1,3.5",b:"2,3",type:"river"},
  {a:"1,0.5",b:"0,1",type:"river"}, {a:"0,1",b:"-1,1.5",type:"river"},
  {a:"-1,-1.5",b:"-2,-1",type:"mountains"}, {a:"-1,-1.5",b:"-2,-2",type:"mountains"}, {a:"-1,-2.5",b:"-2,-2",type:"mountains"},
  {a:"1,2.5",b:"0,3",type:"thicket"},
]; // lake water barriers are implicit: barrierKind() returns "water" for any lake-terrain neighbor

/* Man-made buildings: a building is a set of hex IDs plus an explicit list
   of entrances ({hex, dir}). Every OTHER edge from a building hex to a
   non-building hex is automatically sealed as a 'wall' barrier. Future
   buildings just declare their own hex set + however many entrances they
   should have — the sealing logic below is generic. */
const BUILDINGS = [
  { hexes:["BUILD_GEN","BUILD_BREAK"], entrances:[{hex:"BUILD_GEN", dir:"SW"}] }
];
