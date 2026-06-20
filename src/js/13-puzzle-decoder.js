/* ==========================================================
   SECTION: PUZZLES — decoder ring
   ========================================================== */
const PLAINTEXT = "BRING THE COOLANT CELL, THE FLUX COIL, AND THE GREEN KEYCARD.";
function shiftStr(s, k){ return s.replace(/[A-Z]/g, ch => String.fromCharCode((ch.charCodeAt(0)-65+k+26)%26+65)); }
const CIPHERTEXT = shiftStr(PLAINTEXT, CIPHER_SHIFT);

function openDecoder(){ S.mode = "decode"; S.shift = 0; renderControls(); }
function renderDecoder(){
  const prev = shiftStr(CIPHERTEXT, -S.shift);
  $("controlArea").innerHTML = `<div class="overlay">
    <div style="font-size:12px;color:var(--dim)">You twist your trusty Secret Decoder Ring against the glyphs...</div>
    <div class="big">${prev}</div>
    <div class="ringrow"><button class="k" onclick="ring(-1)">◀ shift</button><span class="ringval">${S.shift}</span><button class="k" onclick="ring(1)">shift ▶</button></div>
    <div class="ov-btns"><button class="k" onclick="confirmDecode()">✓ Confirm [Enter]</button><button class="k" onclick="cancelMode()">✕ Stop [Esc]</button></div>
    <div class="hint">⌨ <b>[</b> / <b>]</b> turn ring &nbsp;•&nbsp; <b>Enter</b> confirm &nbsp;•&nbsp; <b>Esc</b> cancel</div></div>`;
}
function ring(d){ S.shift = (S.shift + d + 26) % 26; renderDecoder(); }
function confirmDecode(){
  if (S.shift === CIPHER_SHIFT){
    S.decoded = true;
    const m = comp("OBELISK","obelisk"); if (m) m.done = true;
    S.mode = "play";
    log("The glyphs snap into focus:\n\"" + PLAINTEXT + "\"", "good");
    log("Coolant Cell, Flux Coil, Green Keycard. Find all three, haul them to the transport, and let's go home.", "nav");
    refresh();
  } else {
    log("You confirm... gibberish. The glyphs remain smug. Keep turning.", "bad");
  }
}
