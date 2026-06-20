/* ==========================================================
   SECTION: BOOT / RESTART
   ========================================================== */
function refresh(){ renderMap(); renderStatus(); renderControls(); }

function boot(){
  H("FURROW").disc = true;
  $("legend").innerHTML = "Map key: ▲ trees · ≈ water · ⌂ shelter · ⌐ ruins · ••• trail (fading = unmapped path) · ◉ you. Barriers: ▲ mountains &amp; 🌲 brush are crosshatched/impassable; 🧱 building walls are a single sealed door away from each other; rivers &amp; the lake show misty water — you can't see or swim across (build a raft).";
  log("// SYSTEM ONLINE // emergency pod log, entry 1 //", "sys");
  log("You come to in the " + H("FURROW").name + ", a generous word for 'crater.'\n" + H("FURROW").desc, "you");
  log("Right, sport. The transport's somewhere out in these 61-odd patches of forest, something big is en route, and we don't yet know what the ship needs. I'm sketching the field chart as you go. Mind the water — it doesn't look swimmable. Press H for hints.", "nav");
  refresh();
}

function restart(){
  initWorld();
  S = freshState();
  $("log").innerHTML = "";
  boot();
}

playIntro();
