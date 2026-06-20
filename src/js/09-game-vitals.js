/* ==========================================================
   SECTION: GAME LOGIC — vitals
   ========================================================== */
function applyEffect(eff){
  if (!eff) return;
  if (eff.health != null) S.health = clamp(S.health + eff.health);
  if (eff.hydration != null) S.hydration = clamp(S.hydration + eff.hydration);
}

function checkVitals(){
  if (S.health <= 0 && !S.over){
    S.over = true;
    log("You sink to the alien dirt and decline to get back up. Nav-Comp's final entry: 'Vitals: nope.'\n\n☠ GAME OVER. ☠", "bad");
    refresh();
    return true;
  }
  if (S.health <= LOW_WARN && !S._hpW){ S._hpW = true; log("You're in rough shape. Find something restorative before you keel over.", "bad"); }
  else if (S.health > LOW_WARN) S._hpW = false;
  if (S.hydration <= LOW_WARN && !S._hydW){ S._hydW = true; log("Your throat's like sandpaper. Water. Now.", "bad"); }
  else if (S.hydration > LOW_WARN) S._hydW = false;
  return false;
}
