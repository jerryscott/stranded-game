/* ==========================================================
   SECTION: GAME LOGIC — movement
   ========================================================== */
function surroundings(id){
  let water = [], peaks = [], brush = [], walls = [];
  for (const d of DORD){
    const k = barrierKind(id, d), n = neighbor(id, d);
    if (k === "water") water.push({ d, lake: n && H(n).terrain==="lake" });
    else if (k === "mountains") peaks.push(d);
    else if (k === "thicket") brush.push(d);
    else if (k === "wall") walls.push(d);
  }
  let out = [];
  if (water.length){
    const lake = water.some(w => w.lake);
    out.push("To the " + water.map(w=>DWORD[w.d]).join(" and ") + " lies a wide " + (lake?"lake":"river") +
      ", its far side swallowed by drifting mist — it doesn't look like you can swim across.");
  }
  if (peaks.length) out.push("Sheer peaks wall off the " + peaks.map(d=>DWORD[d]).join(" and ") + ".");
  if (brush.length) out.push("The brush to the " + brush.map(d=>DWORD[d]).join(" and ") + " is too thick to push through.");
  if (walls.length) out.push("A solid wall seals off the " + walls.map(d=>DWORD[d]).join(" and ") + " side of the building.");
  return out.join(" ");
}

function move(dir){
  if (S.over || S.mode !== "play") return;
  const n = neighbor(S.cur, dir);
  if (!n){ log("No way through — just more wall-to-wall forest that direction.", "dim"); return; }

  const k = barrierKind(S.cur, dir);
  if (k === "mountains"){ log("A wall of jagged peaks blocks the way. You are not, it turns out, a goat.", "dim"); return; }
  if (k === "thicket"){ log("The brush is an impenetrable wall of thorns. Hard pass.", "dim"); return; }
  if (k === "wall"){ log("A solid wall blocks the way. This building keeps to one door.", "dim"); return; }

  let crossing = false;
  if (k === "water"){
    if (S.hasRaft) crossing = true;
    else { openSwimChoice(dir); return; }
  }

  S.cur = n;
  S.turn++;
  const h = H(n), first = !h.disc;
  h.disc = true;
  S.hydration = clamp(S.hydration - TERRAIN[h.terrain].hyd);
  if (S.hydration <= 0){
    S.health = clamp(S.health - DEHYDRATION_DMG);
    log("Dehydration gnaws at you as you push on. (-" + DEHYDRATION_DMG + " health)", "bad");
  }

  const extra = surroundings(n);
  const verb = crossing ? "You paddle across on the raft and step ashore at the "
             : first ? "You push through into the "
             : "You return to the ";
  log(verb + h.name + ".\n" + h.desc + (extra ? " " + extra : ""), "you");

  if (checkVitals()) return;
  checkDoom();
  refresh();
}

function openSwimChoice(dir){
  const n = neighbor(S.cur, dir);
  const lake = H(n).terrain === "lake";
  const w = lake ? "lake" : "river";
  S.mode = "choice";
  S.choice = {
    prompt: "The " + w + " is wide and the far bank is lost in mist. It really doesn't look like you can swim across. Try anyway?",
    options: [
      { label:"Swim for it", fn: () => swimDeath(w) },
      { label:"Back away (stay put)", fn: cancelMode },
    ]
  };
  renderControls();
}
function swimDeath(w){
  S.mode = "play";
  if (S.nodeath){
    log("[DEBUG] LOSS CONDITION: you swam into the deep " + w + " without a raft — normally GAME OVER by drowning. (invincible: you splash back to shore)", "bad");
    refresh();
    return;
  }
  S.over = true;
  const ends = [
    "You wade in. Three strokes out, something with far too many eyes wraps around your ankle and pulls. The mist closes over the ripples.",
    "You strike out for the far shore. The current has other plans, and so, apparently, does the thing living in it.",
    "Halfway across, your boots fill, the cold takes your legs, and the " + w + " takes the rest.",
  ];
  log(ends[Math.floor(Math.random()*ends.length)] + "\n\n☠ GAME OVER — you drowned (ish). ☠", "bad");
  refresh();
}
function enterBuilding(id){
  const b = BLDG[id];
  if (!b) return;
  S.submap = id;
  activeHexes = b.hexes; activeC2I = b.c2i; activeBmap = b.bmap;
  S.cur = b.entry;
  S.turn++;
  const h = H(S.cur); h.disc = true;
  const extra = surroundings(S.cur);
  log("You haul the door open and step inside.\n" + h.desc + (extra ? " " + extra : ""), "you");
  if (checkVitals()) return;
  checkDoom();
  refresh();
}
function exitBuilding(){
  const b = BLDG[S.submap];
  S.submap = null;
  activeHexes = HEXES; activeC2I = COORD2ID; activeBmap = BMAP;
  S.cur = b.overworld;
  S.turn++;
  const h = H(S.cur), extra = surroundings(S.cur);
  log("You step back out into the open air, at the " + h.name + "." + (extra ? " " + extra : ""), "you");
  if (checkVitals()) return;
  checkDoom();
  refresh();
}
function buildRaft(){
  S.hasRaft = true;
  S.inv = S.inv.filter(i => !RAFT_MAT.includes(i.id));
  log("You lash the driftwood with the vines and strap the Dopehtesu pods underneath. The waxy pods hold magnificently. It is, generously, a raft. It floats. Impressively.", "good");
  log("Now you can cross the water — pick a 🌊 direction and paddle.", "nav");
  refresh();
}
