/* ==========================================================
   SECTION: GAME LOGIC — power-switch curiosity trap
   ========================================================== */
function openPowerChoice(){
  S.mode = "choice";
  S.choice = {
    prompt: "A breaker panel of unlabeled levers and one very red wire. The stencil said GREEN starts the generator and RED is live mains. Curiosity tugs at you. What do you touch?",
    options: [
      { label:"Throw the GREEN breaker", fn: powerOn },
      { label:"Yank the RED wire (it's right there)", fn: electrocute },
      { label:"Flip the unlabeled switch", fn: () => { cancelMode(); log("The unlabeled switch emits a sad clunk and does nothing. Probably for the best.", "ev"); } },
    ]
  };
  renderControls();
}
function powerOn(){
  S.power = true; S.mode = "play"; S.choice = null;
  const m = comp("GEN_ROOM","power"); if (m) m.done = true;
  log("You throw the green breaker. The generator coughs, catches, and the building shudders awake — lights buzz on, and somewhere next door a vending machine hums to life.", "good");
  refresh();
}
function electrocute(){
  S.over = true; S.mode = "play";
  log("You grab the red wire. The red wire grabs back. There is a flash, a smell like burnt pennies and regret, and the Nav-Comp logging 'told you so' as the lights go out for good.\n\n☠ GAME OVER — electrocuted. ☠", "bad");
  refresh();
}
