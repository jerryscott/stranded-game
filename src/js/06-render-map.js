/* ==========================================================
   SECTION: RENDER — MAP
   NOTE (Issue #4, no action needed yet): this section and the controls
   section below build DOM via innerHTML template strings. Nothing
   player-typed flows into them today. Revisit (escape input, or switch
   to textContent/DOM APIs) the moment a free-text field is added.
   ========================================================== */
const R = 44, SQ3 = 1.7320508, PI = Math.PI, deg = d => d * PI / 180;
const INK = "#5a4326", INK2 = "#7c5d34", PARCH = "#e6d2a6", DARK = "#241809";
const WATER = "#5f7d74", WBLUE = "#4f7f8a", MIST = "rgba(232,224,205,.6)", RED = "#9e3b2e";
const DANG = { NW:-150, N:-90, NE:-30, SE:30, S:90, SW:150 };
const VANG = [-120,-60,0,60,120,180];

function center(id){ const p = H(id).pos; return { x:p.x*1.5*R, y:p.y*SQ3*R }; }
function edgeState(id, d){ const n = neighbor(id, d); if (!n) return "void"; if (barrierKind(id, d)) return "blocked"; return H(n).disc ? "merge" : "open"; }

function pine(x,y,s,col){ return `<path d="M${x.toFixed(1)} ${(y-s).toFixed(1)} L${(x-s*0.55).toFixed(1)} ${(y+s*0.4).toFixed(1)} L${(x+s*0.55).toFixed(1)} ${(y+s*0.4).toFixed(1)} Z" fill="${col}"/><line x1="${x.toFixed(1)}" y1="${(y+s*0.4).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y+s*0.85).toFixed(1)}" stroke="${col}" stroke-width="1.1"/>`; }
function trees(id,cx,cy,n,col,sz){ const r=rng(id); let a=[]; for(let i=0;i<n;i++){ const ang=r()*6.283,rd=r()*R*0.5; a.push([cx+Math.cos(ang)*rd,cy+Math.sin(ang)*rd*0.85,sz*(0.8+r()*0.5)]); } a.sort((p,q)=>p[1]-q[1]); return a.map(p=>pine(p[0],p[1],p[2],col)).join(""); }
function wavesArt(cx,cy){ let s=""; for(let i=0;i<3;i++){ const yy=cy-9+i*9; s+=`<path d="M${(cx-16).toFixed(1)} ${yy.toFixed(1)} q4 -3 8 0 t8 0 t8 0" stroke="${WATER}" stroke-width="1.5" fill="none" opacity=".9"/>`; } return s; }
function ruinArt(cx,cy){ return `<rect x="${(cx-11).toFixed(1)}" y="${(cy-7).toFixed(1)}" width="4.5" height="14" fill="${INK}"/><rect x="${(cx+2).toFixed(1)}" y="${(cy-11).toFixed(1)}" width="4.5" height="18" fill="${INK}"/><line x1="${(cx-15).toFixed(1)}" y1="${(cy+8).toFixed(1)}" x2="${(cx+13).toFixed(1)}" y2="${(cy+8).toFixed(1)}" stroke="${INK}" stroke-width="1.5"/>`; }
function hutArt(cx,cy){ return `<rect x="${(cx-10).toFixed(1)}" y="${(cy-1).toFixed(1)}" width="20" height="13" fill="#cdb583" stroke="${INK}" stroke-width="1.5"/><path d="M${(cx-13).toFixed(1)} ${(cy-1).toFixed(1)} L${cx.toFixed(1)} ${(cy-13).toFixed(1)} L${(cx+13).toFixed(1)} ${(cy-1).toFixed(1)} Z" fill="${INK2}"/>`; }
function grassArt(id,cx,cy){ const r=rng(id); let s=""; for(let i=0;i<4;i++){ const x=cx+(r()-.5)*R*0.7,y=cy+(r()-.5)*R*0.5; s+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)} l-2 -5 M${x.toFixed(1)} ${y.toFixed(1)} l0 -6 M${x.toFixed(1)} ${y.toFixed(1)} l2 -5" stroke="${INK2}" stroke-width="1" fill="none"/>`; } return s; }
function terrainArt(id){ const h=H(id),c=center(id); switch(h.terrain){
  case "forest": return trees(id,c.x,c.y,4,INK,8);
  case "dense": return trees(id,c.x,c.y,6,INK,8);
  case "water": case "lake": return wavesArt(c.x,c.y);
  case "ruin": return ruinArt(c.x,c.y);
  case "indoor": return hutArt(c.x,c.y);
  default: return grassArt(id,c.x,c.y);
} }
function medallion(x,y,icon){ return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#f3e6c4" stroke="${INK}" stroke-width="1.4"/><text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" font-size="12">${icon}</text>`; }

function blobPoints(id){
  const c = center(id), rnd = rng("blob"+id);
  const midR = s => s==="merge"?1.05 : s==="blocked"?0.44 : s==="open"?0.92 : 0.90;
  const vtxF = s => s==="merge"?1.05 : s==="blocked"?0.54 : s==="open"?0.96 : 0.95;
  let pts = [];
  for (let i = 0; i < 6; i++){
    const d = DORD[i], dn = DORD[(i+1)%6];
    const a1 = deg(DANG[d] + (rnd()-0.5)*7), r1 = midR(edgeState(id,d)) * R * (0.94 + rnd()*0.12);
    pts.push([c.x + Math.cos(a1)*r1, c.y + Math.sin(a1)*r1]);
    const vf = Math.min(vtxF(edgeState(id,d)), vtxF(edgeState(id,dn)));
    const a2 = deg(VANG[i] + (rnd()-0.5)*7), r2 = vf * R * (0.94 + rnd()*0.12);
    pts.push([c.x + Math.cos(a2)*r2, c.y + Math.sin(a2)*r2]);
  }
  return pts;
}
const polyStr = pts => pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
const expand = (pts, c, f) => pts.map(p => [c.x + (p[0]-c.x)*f, c.y + (p[1]-c.y)*f]);
function edgeCorners(id, d){ const c = center(id), a1 = deg(DANG[d]-30), a2 = deg(DANG[d]+30); return [[c.x+R*Math.cos(a1), c.y+R*Math.sin(a1)], [c.x+R*Math.cos(a2), c.y+R*Math.sin(a2)]]; }

/* natural barriers: mountains / thicket */
function xhatchBand(id, d, kind){
  const c = center(id), [p1,p2] = edgeCorners(id,d), qf = 0.42;
  const q1 = [c.x+(p1[0]-c.x)*qf, c.y+(p1[1]-c.y)*qf], q2 = [c.x+(p2[0]-c.x)*qf, c.y+(p2[1]-c.y)*qf];
  const tint = kind==="mountains" ? "#c4af86" : "#c7b990";
  const poly = polyStr([p1,p2,q2,q1]);
  return `<polygon points="${poly}" fill="${tint}"/><polygon points="${poly}" fill="url(#xh)" opacity=".85"/>`;
}
function ridge(p1, p2){
  const seg=4, h=10; let s="";
  for (let i=0;i<seg;i++){
    const t0=i/seg, t1=(i+1)/seg;
    const x0=p1[0]+(p2[0]-p1[0])*t0, y0=p1[1]+(p2[1]-p1[1])*t0;
    const x1=p1[0]+(p2[0]-p1[0])*t1, y1=p1[1]+(p2[1]-p1[1])*t1;
    const mx=(x0+x1)/2, my=(y0+y1)/2;
    s += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${mx.toFixed(1)} ${(my-h).toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="#8a7b5a" stroke="${INK}" stroke-width="1"/>`;
  }
  return s;
}
function pinesAlong(p1, p2){ let s=""; [0.25,0.5,0.75].forEach(t => { s += pine(p1[0]+(p2[0]-p1[0])*t, p1[1]+(p2[1]-p1[1])*t-2, 9, INK); }); return s; }

/* man-made barrier: building wall (visually distinct from natural barriers) */
function wallBand(id, d){
  const c = center(id), [p1,p2] = edgeCorners(id,d), qf = 0.40;
  const q1 = [c.x+(p1[0]-c.x)*qf, c.y+(p1[1]-c.y)*qf], q2 = [c.x+(p2[0]-c.x)*qf, c.y+(p2[1]-c.y)*qf];
  const poly = polyStr([p1,p2,q2,q1]);
  return `<polygon points="${poly}" fill="#8d8675"/><polygon points="${poly}" fill="url(#xh)" opacity=".6"/>`;
}
function wallGlyph(p1, p2){
  const segs = 5;
  let s = `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${INK}" stroke-width="3"/>`;
  for (let i=1;i<segs;i++){
    const t = i/segs;
    const x = p1[0]+(p2[0]-p1[0])*t, y = p1[1]+(p2[1]-p1[1])*t;
    s += `<line x1="${x.toFixed(1)}" y1="${(y-3).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y+3).toFixed(1)}" stroke="${INK}" stroke-width="1.5"/>`;
  }
  return s;
}

/* river / lake: irregular near-bank + misty middle, far side stays hidden */
function waterBand(id, d){
  const c = center(id), [p1,p2] = edgeCorners(id,d), qf = 0.40, seed = rng("w"+id+d);
  const q1 = [c.x+(p1[0]-c.x)*qf, c.y+(p1[1]-c.y)*qf], q2 = [c.x+(p2[0]-c.x)*qf, c.y+(p2[1]-c.y)*qf];
  const dx = q2[0]-q1[0], dy = q2[1]-q1[1], L = Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, segs=5;
  let bank = [q1];
  for (let i=1;i<segs;i++){ const t=i/segs, off=(seed()-0.5)*10; bank.push([q1[0]+dx*t+nx*off, q1[1]+dy*t+ny*off]); }
  bank.push(q2);
  const fill = polyStr([p1,p2].concat(bank.slice().reverse()));
  let s = `<polygon points="${fill}" fill="${WBLUE}" opacity=".9"/>`;
  for (let i=0;i<2;i++){
    const f = 0.62+i*0.18;
    const w1=[c.x+(p1[0]-c.x)*f,c.y+(p1[1]-c.y)*f], w2=[c.x+(p2[0]-c.x)*f,c.y+(p2[1]-c.y)*f];
    s += `<path d="M${w1[0].toFixed(1)} ${w1[1].toFixed(1)} Q${((w1[0]+w2[0])/2+nx*4).toFixed(1)} ${((w1[1]+w2[1])/2+ny*4).toFixed(1)} ${w2[0].toFixed(1)} ${w2[1].toFixed(1)}" stroke="#bfe0e6" stroke-width="1" fill="none" opacity=".7"/>`;
  }
  const m1=[c.x+(p1[0]-c.x)*0.78,c.y+(p1[1]-c.y)*0.78], m2=[c.x+(p2[0]-c.x)*0.78,c.y+(p2[1]-c.y)*0.78];
  s += `<polygon points="${polyStr([p1,p2,m2,m1])}" fill="${MIST}"/>`;
  s += `<path d="M${bank.map(b=>b[0].toFixed(1)+" "+b[1].toFixed(1)).join(" L")}" stroke="#37606a" stroke-width="1.6" fill="none"/>`;
  return s;
}

function renderMap(){
  const disc = Object.keys(activeHexes).filter(k => H(k).disc);
  const cs = disc.map(center);
  let minx = Math.min(...cs.map(c=>c.x)), maxx = Math.max(...cs.map(c=>c.x));
  let miny = Math.min(...cs.map(c=>c.y)), maxy = Math.max(...cs.map(c=>c.y));
  const pad = R*1.5; minx-=pad; maxx+=pad; miny-=pad; maxy+=pad;
  const W = maxx-minx, Ht = maxy-miny;

  let g = `<svg viewBox="${minx.toFixed(1)} ${miny.toFixed(1)} ${W.toFixed(1)} ${Ht.toFixed(1)}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia,'Times New Roman',serif">`;
  g += `<defs><filter id="halo"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .08 0"/></filter><pattern id="xh" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 0 L7 7 M7 0 L0 7" stroke="${INK}" stroke-width="0.8"/></pattern></defs>`;
  g += `<rect x="${minx}" y="${miny}" width="${W}" height="${Ht}" fill="#2c2010"/><rect x="${minx}" y="${miny}" width="${W}" height="${Ht}" fill="#160f06" opacity=".55"/>`;

  const blobs = {}; disc.forEach(k => blobs[k] = blobPoints(k));

  let halo = `<g filter="url(#halo)">`;
  disc.forEach(k => halo += `<polygon points="${polyStr(expand(blobs[k], center(k), 1.08))}" fill="${DARK}"/>`);
  halo += `</g>`;

  let parch = "";
  disc.forEach(k => { const fill = H(k).terrain==="lake" ? WBLUE : PARCH; parch += `<polygon points="${polyStr(blobs[k])}" fill="${fill}" stroke="${fill}" stroke-width="1"/>`; });

  let bands = "", glyphs = "";
  disc.forEach(k => {
    for (const d of DORD){
      const kind = barrierKind(k, d);
      if (!kind) continue;
      const n = neighbor(k, d);
      if (kind === "water"){
        bands += waterBand(k, d);
      } else if (kind === "wall"){
        bands += wallBand(k, d);
        if (!H(n).disc || posKey(k) < posKey(n)){
          const [p1,p2] = edgeCorners(k, d);
          glyphs += wallGlyph(p1, p2);
        }
      } else {
        bands += xhatchBand(k, d, kind);
        if (!H(n).disc || posKey(k) < posKey(n)){
          const [p1,p2] = edgeCorners(k, d);
          glyphs += kind === "mountains" ? ridge(p1,p2) : pinesAlong(p1,p2);
        }
      }
    }
  });

  let trails = ""; const drawn = {};
  disc.forEach(k => {
    const c = center(k);
    for (const d of DORD){
      const n = neighbor(k, d);
      if (!n || barrierKind(k, d)) continue;
      const key = [k,n].sort().join("|");
      if (H(n).disc){
        if (drawn[key]) continue;
        drawn[key] = 1;
        const cn = center(n);
        trails += `<line x1="${c.x.toFixed(1)}" y1="${c.y.toFixed(1)}" x2="${cn.x.toFixed(1)}" y2="${cn.y.toFixed(1)}" stroke="${INK}" stroke-width="2.4" stroke-dasharray="1.5 5" stroke-linecap="round"/>`;
      } else {
        const dv = DIRS[d], vx = dv[0]*1.5*R, vy = dv[1]*SQ3*R, L = Math.hypot(vx,vy);
        trails += `<line x1="${(c.x+vx/L*R*0.5).toFixed(1)}" y1="${(c.y+vy/L*R*0.5).toFixed(1)}" x2="${(c.x+vx/L*(R+10)).toFixed(1)}" y2="${(c.y+vy/L*(R+10)).toFixed(1)}" stroke="${INK2}" stroke-width="2.2" stroke-dasharray="1.5 5" stroke-linecap="round" opacity=".75"/>`;
      }
    }
  });

  let art = "", meds = "", labels = "";
  disc.forEach(k => {
    const h = H(k), c = center(k);
    art += terrainArt(k);
    const icons = [];
    h.comps.forEach(cp => { if (cp.hidden) return; if (cp.t==="col" && !cp.taken) icons.push(cp.icon); if (cp.t==="man" && !cp.done) icons.push(cp.icon); });
    icons.slice(0,3).forEach((ic,i) => { const span = (Math.min(icons.length,3)-1)*13; meds += medallion(c.x-span/2+i*13, c.y-R*0.4, ic); });
    labels += `<text x="${c.x}" y="${(c.y+R*0.58).toFixed(1)}" text-anchor="middle" font-size="9" font-style="italic" fill="${INK}" paint-order="stroke" stroke="${H(k).terrain==='lake'?WBLUE:PARCH}" stroke-width="2.6">${h.name}</text>`;
  });

  const cc = center(S.cur);
  const marker = `<circle cx="${cc.x}" cy="${(cc.y+R*0.16).toFixed(1)}" r="6.5" fill="none" stroke="${RED}" stroke-width="2"><animate attributeName="r" values="6.5;9;6.5" dur="1.4s" repeatCount="indefinite"/></circle><circle cx="${cc.x}" cy="${(cc.y+R*0.16).toFixed(1)}" r="2.4" fill="${RED}"/>`;

  g += halo + parch + bands + glyphs + trails + art + meds + labels + marker;
  g += `<rect x="${minx}" y="${miny}" width="${W}" height="${Ht}" filter="url(#rough)"/>`;
  g += `<rect x="${(minx+5).toFixed(1)}" y="${(miny+5).toFixed(1)}" width="${(W-10).toFixed(1)}" height="${(Ht-10).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="2.5" rx="3"/>`;
  const cxr = maxx-30, cyr = miny+32, s = 14;
  g += `<circle cx="${cxr.toFixed(1)}" cy="${cyr.toFixed(1)}" r="${s+4}" fill="#efe0bb" stroke="${INK}" stroke-width="1.2"/><path d="M${cxr.toFixed(1)} ${(cyr-s).toFixed(1)} L${(cxr+s*0.24).toFixed(1)} ${cyr.toFixed(1)} L${cxr.toFixed(1)} ${(cyr+s).toFixed(1)} L${(cxr-s*0.24).toFixed(1)} ${cyr.toFixed(1)} Z" fill="${INK}"/><path d="M${(cxr-s).toFixed(1)} ${cyr.toFixed(1)} L${cxr.toFixed(1)} ${(cyr-s*0.24).toFixed(1)} L${(cxr+s).toFixed(1)} ${cyr.toFixed(1)} L${cxr.toFixed(1)} ${(cyr+s*0.24).toFixed(1)} Z" fill="${INK2}"/><text x="${cxr.toFixed(1)}" y="${(cyr-s-3).toFixed(1)}" text-anchor="middle" font-size="9" fill="${INK}">N</text>`;
  g += `<text x="${(minx+16).toFixed(1)}" y="${(miny+24).toFixed(1)}" font-size="12" fill="${INK}" font-style="italic">~ Field Chart ~</text>`;
  g += `</svg>`;
  $("map").innerHTML = g;
}
