/* ==========================================================
   SECTION: RENDER — CONTROLS  (movement pad removed; keyboard-only moves)
   ========================================================== */
function buildActions(){
  const h = H(S.cur), acts = [];
  h.comps.forEach(c => {
    if (c.t==="col" && !c.taken && !c.hidden){
      const verb = c.consumable ? (c.kind==="water" ? "Drink the " : "Eat the ") : "Take the ";
      acts.push({ label: verb + c.name, fn: () => takeItem(c) });
    }
  });
  h.comps.forEach(c => {
    if (c.t==="man" && !c.done){
      if (c.id === "locker"){
        acts.push({ label:"Try the footlocker combination", fn: openCombo });
        if (has("rock")) acts.push({ label:"Smash the footlocker with the heavy rock", fn: smashLocker });
      } else {
        acts.push({ label: c.verb, fn: () => doManipulable(c) });
      }
    }
  });
  if (h.building && !S.submap){
    acts.push({ label:"Step inside", fn: () => enterBuilding(h.building) });
  }
  if (S.submap){
    acts.push({ label:"Step back outside", fn: exitBuilding });
  }
  if (!S.hasRaft && nextToWater(S.cur) && RAFT_MAT.every(has)){
    acts.push({ label:"Lash the driftwood, vines & Dopehtesu pods into a raft", fn: buildRaft });
  }
  return acts;
}

function renderControls(){
  if (S.over){
    $("controlArea").innerHTML = '<div class="hint">— transmission ended —</div><button class="k restartBtn" onclick="restart()">↺ Restart from the crash</button>';
    return;
  }
  if (S.mode === "decode") { renderDecoder(); return; }
  if (S.mode === "combo")  { renderCombo();   return; }
  if (S.mode === "choice") { renderChoice();  return; }

  const acts = buildActions();
  S._acts = acts;
  let html = `<div class="acts">`;
  acts.forEach((a,i) => { html += `<button class="k" onclick="runAction(${i})"><span class="num">${i+1}</span>${a.label}</button>`; });
  html += `<button class="k" onclick="navComp()"><span class="num">H</span>Consult the Nav-Comp (hints)</button></div>`;
  html += `<div class="hint">⌨ Move: <b>Q W E / A S D</b> &nbsp;•&nbsp; Actions: <b>1–9</b> &nbsp;•&nbsp; Hints: <b>H</b></div>`;
  $("controlArea").innerHTML = html;
}

function renderChoice(){
  const ch = S.choice;
  let h = `<div class="overlay"><div class="prompt">${ch.prompt}</div><div class="acts">`;
  ch.options.forEach((o,i) => { h += `<button class="k" onclick="pickChoice(${i})"><span class="num">${i+1}</span>${o.label}</button>`; });
  h += `</div><div class="hint">⌨ press <b>1–${ch.options.length}</b> &nbsp;•&nbsp; <b>Esc</b> to back away</div></div>`;
  $("controlArea").innerHTML = h;
}
function pickChoice(i){ const ch = S.choice; if (ch && ch.options[i]) ch.options[i].fn(); }
function cancelMode(){ S.mode = "play"; S.choice = null; renderControls(); }
