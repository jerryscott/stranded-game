/* ==========================================================
   SECTION: INPUT
   ========================================================== */
document.addEventListener("keydown", e => {
  if (S.over) return;
  const k = e.key.toLowerCase();
  if (S.mode === "decode"){
    if (k === "[") { ring(-1); e.preventDefault(); }
    else if (k === "]") { ring(1); e.preventDefault(); }
    else if (k === "enter") { confirmDecode(); e.preventDefault(); }
    else if (k === "escape") { cancelMode(); e.preventDefault(); }
    return;
  }
  if (S.mode === "combo"){
    if (/^[0-9]$/.test(k)) { comboKey(k); e.preventDefault(); }
    else if (k === "backspace") { comboBack(); e.preventDefault(); }
    else if (k === "enter") { comboSubmit(); e.preventDefault(); }
    else if (k === "escape") { cancelMode(); e.preventDefault(); }
    return;
  }
  if (S.mode === "choice"){
    if (/^[1-9]$/.test(k)) { pickChoice(parseInt(k,10)-1); e.preventDefault(); }
    else if (k === "escape") { cancelMode(); e.preventDefault(); }
    return;
  }
  if (KEYDIR[k]) { move(KEYDIR[k]); e.preventDefault(); return; }
  if (k === "h") { navComp(); return; }
  if (/^[1-9]$/.test(k)) runAction(parseInt(k,10)-1);
});
