/* ==========================================================
   SECTION: STATE
   ========================================================== */
function freshState(){
  return {
    cur:"FURROW", turn:0, mode:"play",
    decoded:false, power:false, hasRaft:false,
    shift:0, combo:"", choice:null,
    warned:0, over:false,
    inv:[], health:100, hydration:100,
    _acts:[], _hpW:false, _hydW:false
  };
}
let S = freshState();
