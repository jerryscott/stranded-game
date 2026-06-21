/* ==========================================================
   SECTION: INTRO CUTSCENE
   ========================================================== */
function buildIntroSVG(){
  const W = 400, Ht = 200;
  let s = `<svg viewBox="0 0 ${W} ${Ht}" xmlns="http://www.w3.org/2000/svg" id="introSvg">`;
  s += `<defs><linearGradient id="introSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a0a3a"/><stop offset="60%" stop-color="#0a0a18"/><stop offset="100%" stop-color="#05050d"/>
        </linearGradient></defs>`;
  s += `<rect x="0" y="0" width="${W}" height="${Ht}" fill="url(#introSky)"/>`;

  const starRng = rng("introstars");
  for (let i = 0; i < 26; i++){
    const x = starRng()*W, y = starRng()*Ht*0.7, r = 0.6+starRng()*1.1, dl = (starRng()*3).toFixed(2);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#cfe8ff" class="twinkle" style="animation-delay:${dl}s"/>`;
  }
  // distant crescent moon
  s += `<circle cx="${W-50}" cy="40" r="22" fill="#a96bff" opacity=".35"/><circle cx="${W-44}" cy="34" r="22" fill="#0a0a18"/>`;

  // ground + treeline (reuses the same pine() doodle as the field chart)
  s += `<rect x="0" y="${Ht-26}" width="${W}" height="26" fill="#0d2014"/>`;
  for (let i = 0; i < 9; i++){
    const x = 14 + i*46 + (i%2?10:0);
    s += pine(x, Ht-24, 16+(i%3)*4, "#0a2818");
  }

  // smoke trail
  s += `<g>`;
  const smokePts = [[40,30,0.2],[70,48,0.5],[100,66,0.8],[128,84,1.1],[150,98,1.4],[168,108,1.7]];
  smokePts.forEach(([sx,sy,delay]) => { s += `<circle cx="${sx}" cy="${sy}" r="9" fill="#9aa0b0" class="smokepuff" style="animation-delay:${delay}s"/>`; });
  s += `</g>`;

  // ship (outer group is CSS-animated for flight path; inner group holds a static
  // rotation so the drawn shape points diagonally without fighting the CSS transform)
  s += `<g id="introShipGroup" class="shipfly">
          <g transform="rotate(35)">
            <path d="M -16,0 L 10,-7 L 18,0 L 10,7 Z" fill="#cdd6e6"/>
            <path d="M -16,0 L -26,-5 L -22,0 L -26,5 Z" fill="#ff8b6e" class="flame"/>
            <circle cx="2" cy="0" r="3" fill="#22e0ff"/>
            <path d="M 2,-7 L -4,-14 L 4,-9 Z" fill="#a9b4cc"/>
            <path d="M 2,7 L -4,14 L 4,9 Z" fill="#a9b4cc"/>
          </g>
        </g>`;

  // explosion (outer group holds the static crash-site position; inner group is
  // CSS-animated for the scale/opacity pop, so the two transforms don't conflict)
  s += `<g transform="translate(168,108)"><g id="introBoom" class="boom">
          <circle r="22" fill="#ffb13d"/><circle r="12" fill="#ff5b6e"/>`;
  [0,45,90,135,180,225,270,315].forEach(a => {
    const rad = a*Math.PI/180, r1=24, r2=40;
    const x1=(Math.cos(rad)*r1).toFixed(1), y1=(Math.sin(rad)*r1).toFixed(1);
    const x2=(Math.cos(rad)*r2).toFixed(1), y2=(Math.sin(rad)*r2).toFixed(1);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffd98a" stroke-width="3" stroke-linecap="round"/>`;
  });
  s += `</g></g>`;

  s += `</svg>`;
  return s;
}

function skipIntro(){
  $("cutsceneStage").style.display = "none";
  $("storyPanel").style.display = "block";
}

function beginGame(debug){
  S.nodeath = !!debug;
  $("introOverlay").style.display = "none";
  $("gameWrap").style.display = "block";
  initWorld();
  boot();
  if (S.nodeath){
    log("// DEBUG MODE ENGAGED — invincibility ON. Nothing can kill you. //", "sys");
    log("Loss conditions (disabled, shown for reference): (1) HEALTH hits 0, (2) drowning — entering deep water without a raft, (3) the impending-doom clock reaching 100%. If one trips you'll get a [DEBUG] notice in the log instead of dying.", "nav");
  }
}

function playIntro(){
  let cmdBuf = "";
  const DEBUG_TRIGGER = "debug";  // type this word on the start screen to launch no-death mode
  document.addEventListener("keydown", function onIntroEnter(e){
    if ($("storyPanel").style.display === "none") return;
    if (e.key === "Enter"){
      document.removeEventListener("keydown", onIntroEnter);
      beginGame(false);
      return;
    }
    // Type the debug trigger word (instead of Enter) to start in no-death mode.
    if (DEBUG_MODES_ENABLED && e.key.length === 1){
      cmdBuf = (cmdBuf + e.key.toLowerCase()).slice(-DEBUG_TRIGGER.length);
      if (cmdBuf === DEBUG_TRIGGER){
        document.removeEventListener("keydown", onIntroEnter);
        beginGame(true);
      }
    }
  });
  $("cutsceneStage").innerHTML = buildIntroSVG();
  $("cutsceneStage").addEventListener("animationend", e => {
    if (e.animationName === "stageFadeOut") skipIntro();
  });
  $("storyText").innerHTML = `
    <p class="sys">// SYSTEM ONLINE // emergency pod log, entry 1 //</p>
    <p>You come to in the Crash Furrow — a generous word for "crater." Smoke still curls from the furrow your pod plowed into the loam. A rare patch of open sky. The Nav-Comp blinks from a Frisbee-sized hole in its casing.</p>
    <p class="nav">Right, sport. The transport's somewhere out in these 61-odd patches of forest, something big is en route, and we don't yet know what the ship needs yet. I'm sketching the field chart as you go. Mind the water — it doesn't look swimmable.</p>
  `;
}
