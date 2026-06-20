/* ==========================================================
   SECTION: PUZZLES — footlocker combo
   ========================================================== */
function openCombo(){ S.mode = "combo"; S.combo = ""; renderControls(); }
function renderCombo(){
  $("controlArea").innerHTML = `<div class="overlay">
    <div style="font-size:12px;color:var(--dim)">The dial waits. (Post-it: "THE ANSWER. you know the one.")</div>
    <div class="comboDisplay">${S.combo.replace(/./g,"●")||"&nbsp;"}</div>
    <div class="ov-btns">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button class="k" onclick="comboKey('${n}')">${n}</button>`).join("")}<button class="k" onclick="comboBack()">⌫</button><button class="k" onclick="comboSubmit()">✓ Enter</button><button class="k" onclick="cancelMode()">✕ Esc</button></div>
    <div class="hint">⌨ digits &nbsp;•&nbsp; <b>Backspace</b> &nbsp;•&nbsp; <b>Enter</b> &nbsp;•&nbsp; <b>Esc</b></div></div>`;
}
function comboKey(n){ if (S.combo.length < 4){ S.combo += n; renderCombo(); } }
function comboBack(){ S.combo = S.combo.slice(0,-1); renderCombo(); }
function comboSubmit(){
  if (S.combo === LOCKER_CODE) unlockLocker("42 clicks home. The footlocker pops open.");
  else { log("The dial spins back with a mocking *click*. Wrong combo.", "bad"); S.combo = ""; renderCombo(); }
}
function smashLocker(){
  const r = S.inv.findIndex(i => i.id==="rock");
  if (r > -1) S.inv.splice(r, 1);
  unlockLocker("You introduce the suspiciously heavy rock to the footlocker. The lock loses; the rock, its purpose fulfilled, crumbles to gravel.");
}
function unlockLocker(intro){
  S.mode = "play";
  const m = comp("STATION","locker"); if (m) m.done = true;
  H("STATION").comps.forEach(x => { if (x.hidden) x.hidden = false; });
  log(intro + " Inside: a FLUX COIL in foam, slightly dented but functional. (Grab it.)", "good");
  refresh();
}
