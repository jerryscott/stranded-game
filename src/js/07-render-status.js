/* ==========================================================
   SECTION: RENDER — STATUS (status strip: doom + six meters; inventory)
   ========================================================== */
function renderVMeters(){
  const cells = [
    { active:true,  label:"HEALTH",    value:S.health,    cls:"hp"  },
    { active:true,  label:"HYDRATION", value:S.hydration, cls:"hyd" },
    { active:false, label:"NUTRITION" },
    { active:false, label:"CLARITY"   },
    { active:false, label:"STAMINA"   },
    { active:false, label:"WARMTH"    },
  ];
  let html = "";
  cells.forEach(c => {
    if (c.active){
      const pct = clamp(c.value);
      html += `<div class="vmeter">
        <div class="vtrack"><div class="vfill ${c.cls}" style="height:${pct}%"></div></div>
        <div class="vlabel"><b>${Math.round(pct)}</b>${c.label}</div>
      </div>`;
    } else {
      html += `<div class="vmeter disabled">
        <div class="vtrack"><div class="vfill grey"></div></div>
        <div class="vlabel"><b>—</b>${c.label}<span class="soon">soon</span></div>
      </div>`;
    }
  });
  $("vgrid").innerHTML = html;
}

function renderStatus(){
  const h = H(S.cur);
  $("locName").textContent = h.name + "  [" + h.pos.x + "," + h.pos.y + "]";
  $("terrBadge").textContent = TERRAIN[h.terrain].label.toUpperCase();
  $("envBadge").textContent = h.env === "outdoor" ? "OUTDOORS" : "INDOORS";
  $("lightBadge").textContent = h.light === "lit" ? "WELL-LIT" : "DARK";
  renderVMeters();
  const pct = Math.min(100, Math.round(S.turn / DOOM_LIMIT * 100));
  $("doomBar").style.height = pct + "%";   // vertical fill, not width
  $("doomTxt").textContent = pct + "%";
  const inv = $("inv");
  if (!S.inv.length){
    inv.innerHTML = '<span class="empty">empty — go scavenge, you packrat</span>';
  } else {
    inv.innerHTML = S.inv.map(i => `<span class="item ${i.kind==='part'?'part':i.kind==='mat'?'mat':i.kind==='tool'?'tool':''}">${i.icon||""} ${i.name}</span>`).join("");
  }
}
