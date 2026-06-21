/* ==========================================================
   SECTION: NAV-COMP hints + win condition + doom clock
   ========================================================== */
function navComp(){
  if (!S.decoded){
    log("Find that black obelisk and decode it — the ring fancies the number seven. The message will point you toward the water.", "nav");
    return;
  }
  if (!has("repair_manual")){
    log("The obelisk hinted at the pod — something buoyant that grows out here. Build a raft and cross the water. The ship repair manual you'll need is somewhere out on the lake.", "nav");
    return;
  }
  const miss = REQUIRED.filter(id => !has(id));
  const N = { coolant_cell:"Coolant Cell", flux_coil:"Flux Coil", green_keycard:"Green Keycard", repair_manual:"Ship Repair Manual" };
  if (miss.length){
    log("You still need: " + miss.map(m=>N[m]||m).join(", ") + ". The keycard's in that vending machine — but it needs power first (mind the red wire). Then haul everything to the transport.", "nav");
  } else {
    log("You've got all the parts and the manual. Get to the TRANSPORT and launch.", "nav");
  }
  if (!S.hasRaft) log("To cross the water: find driftwood, vines, and Dopehtesu pods — those huge waxy things — then lash a raft at the shore.", "nav");
}

function attemptEscape(){
  if (!has("repair_manual")){ log("You poke at the transport's controls. Nothing makes sense without the repair manual. Find it — it's out on the water somewhere.", "bad"); return; }
  const miss = REQUIRED.filter(id => !has(id));
  if (miss.length){ log("The transport's still missing parts. Can't hot-wire a starship with vibes. Go finish scavenging.", "bad"); return; }
  S.over = true;
  log("You slot the COOLANT CELL, FLUX COIL, and GREEN KEYCARD into their housings — the manual open on your knee. The engine coughs, catches, ROARS, and you punch up through the canopy as the impending doom screeches in the distance.", "good");
  log("Took you long enough.", "nav");
  log("\n★ YOU ESCAPED. ★\n— END OF ITERATION 5 —", "good");
  refresh();
}

function checkDoom(){
  const f = S.turn / DOOM_LIMIT;
  if (S.turn >= DOOM_LIMIT){
    if (S.nodeath){
      if (!S._doomNoted){ S._doomNoted = true; log("[DEBUG] LOSS CONDITION: the impending doom arrived at turn " + DOOM_LIMIT + " — normally GAME OVER. (invincible: it grumbles and spares you)", "bad"); }
      return;
    }
    S.over = true;
    log("The impending doom finally arrives. It is large, it is hungry, and it has opinions about trespassers. Nav-Comp's last words: 'I did try to tell them.'\n\n☠ GAME OVER. ☠", "bad");
    refresh();
    return;
  }
  const msgs = [
    "Something enormous shifts deep in the forest. Probably nothing. Probably.",
    "The trees lean the wrong way. The doom is closing in and you're dawdling.",
    "RUN. Whatever's coming is nearly here.",
  ];
  for (let i = DOOM_WARN.length-1; i >= 0; i--){
    if (f >= DOOM_WARN[i] && S.warned <= i){ S.warned = i+1; log(msgs[i], "bad"); break; }
  }
}
