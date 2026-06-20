/* ==========================================================
   SECTION: GAME LOGIC — items & manipulables
   ========================================================== */
function takeItem(c){
  applyEffect(c.effects);
  if (c.consumable){
    if (!c.renewable) c.taken = true;
    log(c.grab, effectTone(c.effects));
  } else {
    c.taken = true;
    S.inv.push({ id:c.id, name:c.name, kind:c.kind, icon:c.icon });
    log(c.grab, c.kind === "part" ? "good" : "ev");
  }
  if (checkVitals()) return;
  refresh();
}

function doManipulable(c){
  switch (c.id){
    case "obelisk":
      openDecoder();
      return;
    case "transport":
      attemptEscape();
      return;
    case "power":
      openPowerChoice();
      return;
    case "vendor":
      if (!S.power){
        log("You jab the buttons. Nothing. The machine's dark and dead — no power. There must be a generator somewhere in this building.", "dim");
        return;
      }
      c.done = true;
      { const kc = comp("BUILD_BREAK","green_keycard"); if (kc) kc.hidden = false; }
      log("Powered up, the machine wheezes to life, blinks a cheerful 8-bit smile, and drops something into the tray with a CLUNK: a GREEN KEYCARD. (Grab it.)", "good");
      break;
    case "hatch":
      c.done = true;
      H("HATCH").comps.forEach(x => { if (x.hidden) x.hidden = false; });
      log("You hammer the override until the hatch screeches open: a COOLANT CELL on the bulkhead and a sleek 'phaser' (it's a label maker).", "ev");
      break;
    case "spores":
      c.done = true;
      applyEffect({ health:-8 });
      S.inv.push({ id:"spore_pouch", name:"Pouch of Glowing Spores", kind:"junk", icon:"✨" });
      log("You scoop spores into a pouch, immediately regret it, and sneeze a small rainbow. (-8 health)", "bad");
      break;
    case "log":
      c.done = true;
      applyEffect({ health:-22 });
      S.inv.push({ id:"rabbitfoot", name:"Rabbit's Foot (ineffective)", kind:"junk", icon:"🐾" });
      log("You reach into the log. The log reaches back. SNAKEBITE. (-22 health) You retrieve a rabbit's foot, which was not, to be clear, lucky.", "bad");
      break;
    case "drone":
      c.done = true;
      log("The drone's memory core sputters out its final log: a survey team, a storm, a thing in the lake, and a last entry that just reads 'DON'T SWIM.' Noted. Belatedly.", "ev");
      break;
  }
  if (checkVitals()) return;
  refresh();
}
function runAction(i){ const a = (S._acts||[])[i]; if (a) a.fn(); }
