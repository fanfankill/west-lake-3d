// ───────── 03 arch：湖岸、曲桥、亭、廊、榭、墙、设施 ─────────
const bankX = z => 2 + 2.5 * Math.sin(z * 0.04);
const pathX = z => bankX(z) + 8.5;
const INLET = [39, 49, 22];
const isLand = (x, z) => x > bankX(z) && !(z > INLET[0] && z < INLET[1] && x < INLET[2]);
const Y0 = 0.55;                       // 岸面标高
const PAV = { x: -36, z: -6, y: 0.85 }; // 亭心与台面标高
const BR = [[2.6, 0], [-5, 0], [-5, -6.5], [-13, -6.5], [-13, 0.5], [-21, 0.5], [-21, -6], [-31.2, -6]];
const DECK = 0.70;

function offsetPoly(pts, d) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(i - 1, 0)], b = pts[i], c = pts[Math.min(i + 1, pts.length - 1)];
    let n0 = null, n1 = null;
    if (i > 0) { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); n0 = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; }
    if (i < pts.length - 1) { const l = Math.hypot(c[0] - b[0], c[1] - b[1]); n1 = [-(c[1] - b[1]) / l, (c[0] - b[0]) / l]; }
    if (!n0) n0 = n1; if (!n1) n1 = n0;
    const k = d / (1 + n0[0] * n1[0] + n0[1] * n1[1]);
    out.push([b[0] + (n0[0] + n1[0]) * k, b[1] + (n0[1] + n1[1]) * k]);
  }
  return out;
}
// 沿折线等距取点（含顶点）
function stations(a, b, step) { const l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(l / step)), o = []; for (let i = 0; i <= n; i++) o.push([lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); return o; }

// 屋面参数曲面：sides 边形攒尖，或 rect 矩形四坡；带凹曲（举折）与翼角起翘
function roofPt(o, k, u, t) {
  const au = Math.abs(u), c3 = t * t * t, f = (o.flare || 0) * au * au * c3;
  let ap, hw, a;
  if (o.rect) { const X = lerp(o.x0, o.x1, t), Z = lerp(o.z0, o.z1, t); a = k * PI / 2 + (o.rot || 0); if (k % 2 === 0) { ap = Z + f; hw = X + f; } else { ap = X + f; hw = Z + f; } }
  else { const r = lerp(o.rTop, o.rEave, t) + f; a = k * TAU / o.sides + (o.rot || 0); ap = r; hw = r * Math.tan(PI / o.sides); }
  const nx = Math.sin(a), nz = Math.cos(a), ex = Math.cos(a), ez = -Math.sin(a);
  const y = o.h * (1 - t) - Math.sin(PI * t) * o.sag * o.h + o.lift * Math.pow(au, 2.4) * c3;
  return [o.cx + nx * ap + ex * hw * u, o.cy + y, o.cz + nz * ap + ez * hw * u];
}
function buildRoof(pTile, pRidge, o, q = {}) {
  const Bq = q.B || B, N = o.rect ? 4 : o.sides, nu = q.nu || 12, nt = q.nt || 10, sp = q.sp || 0.27, sc = q.sc || 1, TL = q.tile || 'tile', RG = q.ridge || 'ridge';
  for (let k = 0; k < N; k++) {
    const pos = [], pos2 = [], idx = [], idx2 = [];
    for (let i = 0; i <= nt; i++) for (let j = 0; j <= nu; j++) { const p = roofPt(o, k, j / nu * 2 - 1, i / nt); pos.push(p[0], p[1], p[2]); pos2.push(p[0], p[1] - 0.1, p[2]); }
    for (let i = 0; i < nt; i++) for (let j = 0; j < nu; j++) { const a = i * (nu + 1) + j, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, b, c, b, d, c); idx2.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); Bq.add(pTile, TL, g, null, .86);
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(pos2, 3)); g2.setIndex(idx2); g2.computeVertexNormals(); Bq.add(pTile, 'woodDk', g2, null, 1);
    // 瓦面与望板各补一份反向的面：无论从哪一侧看，朝上的总是瓦、朝下的总是木
    const g3 = new THREE.BufferGeometry(); g3.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g3.setIndex(idx2); g3.computeVertexNormals(); Bq.add(pTile, TL, g3, null, .86);
    const g4 = new THREE.BufferGeometry(); g4.setAttribute('position', new THREE.Float32BufferAttribute(pos2, 3)); g4.setIndex(idx); g4.computeVertexNormals(); Bq.add(pTile, 'woodDk', g4, null, 1);
    // 瓦垄
    const e0 = roofPt(o, k, -1, 1), e1 = roofPt(o, k, 1, 1), wE = Math.hypot(e1[0] - e0[0], e1[2] - e0[2]) / 2, nr = Math.floor(wE * 2 / sp);
    for (let r = 0; r < nr; r++) {
      const s = -wE + (r + .5) * (wE * 2 / nr); let prev = null;
      for (let i = nt; i >= 0; i--) {
        const t = i / nt, a0 = roofPt(o, k, -1, t), a1 = roofPt(o, k, 1, t), w = Math.hypot(a1[0] - a0[0], a1[2] - a0[2]) / 2, u = w > 1e-3 ? s / w : 9;
        if (Math.abs(u) > 0.97) { if (prev && i < nt) { // 收到戗脊
            const t2 = (i + 1) / nt; let lo = t, hi = t2; for (let b = 0; b < 6; b++) { const m = (lo + hi) / 2, c0 = roofPt(o, k, -1, m), c1 = roofPt(o, k, 1, m); if (Math.abs(s) / (Math.hypot(c1[0] - c0[0], c1[2] - c0[2]) / 2) > .97) lo = m; else hi = m; }
            const c0 = roofPt(o, k, -1, hi), c1 = roofPt(o, k, 1, hi), p = roofPt(o, k, s / (Math.hypot(c1[0] - c0[0], c1[2] - c0[2]) / 2), hi); p[1] += .045 * sc; Bq.seg(pTile, TL, prev, p, .12 * sc, .08 * sc);
          } break; }
        const p = roofPt(o, k, u, t); p[1] += .045 * sc; if (prev) Bq.seg(pTile, TL, prev, p, .12 * sc, .08 * sc); prev = p;
      }
    }
    // 戗脊 + 翼角
    let prev = null; const nh = 14;
    for (let i = 0; i <= nh; i++) { const p = roofPt(o, k, 1, i / nh); p[1] += .1; if (prev) Bq.seg(pRidge, RG, prev, p, .2 * sc, .22 * sc, .95); prev = p; }
    const pa = roofPt(o, k, 1, 1), pb = roofPt(o, k, 1, .86); let dx = pa[0] - pb[0], dz = pa[2] - pb[2]; const dl = Math.hypot(dx, dz); dx /= dl; dz /= dl;
    const t1 = [pa[0] + dx * .32 * sc, pa[1] + .26 * sc, pa[2] + dz * .32 * sc], t2 = [pa[0] + dx * .5 * sc, pa[1] + .62 * sc, pa[2] + dz * .5 * sc];
    Bq.seg(pRidge, RG, [pa[0], pa[1] + .1, pa[2]], t1, .16 * sc, .18 * sc, .95); Bq.seg(pRidge, RG, t1, t2, .11 * sc, .12 * sc, .95);
    // 檐口
    for (let j = 0; j < nu; j++) { const a = roofPt(o, k, j / nu * 2 - 1, 1), b = roofPt(o, k, (j + 1) / nu * 2 - 1, 1); a[1] -= .03; b[1] -= .03; Bq.seg(pTile, RG, a, b, .09 * sc, .13 * sc, 1); }
  }
}
// 挂落：枋下的木格花饰
function guaLuo(part, a, b, yTop, drop = .44) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l, i0 = .16, L = l - i0 * 2;
  const P = (s, y) => [a[0] + ux * (i0 + s), y, a[1] + uz * (i0 + s)], sg = (s0, y0, s1, y1) => B.seg(part, 'woodDk', P(s0, y0), P(s1, y1), .035, .035, .9);
  const yb = yTop - drop, ym = yTop - drop * .5, e = Math.min(.42, L * .22);
  sg(0, yTop - .02, L, yTop - .02); sg(0, ym, L, ym); sg(0, yTop, 0, yb); sg(L, yTop, L, yb); sg(0, yb, e, yb); sg(L - e, yb, L, yb); sg(e, ym, e, yb); sg(L - e, ym, L - e, yb);
  const n = Math.max(3, Math.round(L / .3));
  for (let i = 1; i < n; i++) { const s = L * i / n; sg(s, yTop, s, ym + (i % 2 ? .0 : .1)); if (i % 2 && i < n - 1) sg(s, ym + .1, L * (i + 1) / n, ym + .1); }
}
// 美人靠：临水的靠背坐凳，靠背向外弯出
function meiRenKao(part, a, b, y, ox, oz) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l, i0 = .2, L = l - i0 * 2;
  const P = (s, out, yy) => [a[0] + ux * (i0 + s) + ox * out, y + yy, a[1] + uz * (i0 + s) + oz * out];
  B.seg(part, 'woodDk', P(0, .02, .45), P(L, .02, .45), .42, .05, .95);
  B.seg(part, 'wood', P(0, -.02, .21), P(L, -.02, .21), .06, .42, .8);
  B.seg(part, 'woodDk', P(0, .3, .7), P(L, .3, .7), .04, .04); B.seg(part, 'woodDk', P(0, .37, .95), P(L, .37, .95), .06, .05);
  const n = Math.round(L / .15);
  for (let i = 0; i <= n; i++) { const s = L * i / n; B.seg(part, 'woodDk', P(s, .2, .47), P(s, .3, .7), .028, .028, .9); B.seg(part, 'woodDk', P(s, .3, .7), P(s, .37, .95), .028, .028, .9); }
}
// 石栏：望柱 + 栏板
function stoneRail(part, line, yOf, step = 1.7) {
  const post = (p) => { const y = yOf(p); B.box(part, 'stone', p[0], y + .43, p[1], .17, .86, .17); B.box(part, 'stone', p[0], y + .9, p[1], .2, .05, .2, 0, .93); B.add(part, 'stone', new THREE.SphereGeometry(.085, 7, 4), TM(p[0], y + .99, p[1], 0, 1, 1.3, 1), 1.02); };
  for (let i = 0; i < line.length - 1; i++) {
    const st = stations(line[i], line[i + 1], step);
    st.forEach((p, j) => { if (j > 0 || i === 0) post(p); if (j < st.length - 1) { const q = st[j + 1], y0 = yOf(p), y1 = yOf(q);
      B.seg(part, 'stone', [p[0], y0 + .7, p[1]], [q[0], y1 + .7, q[1]], .12, .1); B.seg(part, 'stone', [p[0], y0 + .37, p[1]], [q[0], y1 + .37, q[1]], .07, .48, rr(.9, 1)); B.seg(part, 'stone', [p[0], y0 + .09, p[1]], [q[0], y1 + .09, q[1]], .13, .1); } });
  }
}
function lathe(pts, seg) {
  const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), P = g.attributes.position, N = g.attributes.normal; let bi = 0, br = 0;
  for (let i = 0; i < P.count; i++) { const r = Math.hypot(P.getX(i), P.getZ(i)); if (r > br) { br = r; bi = i; } }
  if (N.getX(bi) * P.getX(bi) + N.getZ(bi) * P.getZ(bi) < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 1]; ix[i + 1] = t; } g.computeVertexNormals(); }
  return g;
}
// 路灯：石础、铁杆、方灯罩，入夜自亮
function lampPost(part, x, y, z) { B.box(part, 'stone', x, y + .12, z, .4, .24, .4); B.add(part, 'metal', new THREE.CylinderGeometry(.05, .07, 3.2, 8), TM(x, y + 1.8, z)); B.box(part, 'lampGl', x, y + 3.66, z, .34, .46, .34, 0, 1); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(d => B.box(part, 'metal', x + d[0] * .175, y + 3.66, z + d[1] * .175, .035, .5, .035)); B.box(part, 'metal', x, y + 3.41, z, .4, .04, .4); B.add(part, 'metal', new THREE.ConeGeometry(.36, .22, 4), TM(x, y + 4.0, z, PI / 4)); addGlow(x, y + 3.66, z, 0xffc888, 8); }
function column(part, x, z, y0, y1, r = .15) {
  B.add(part, 'wood', new THREE.CylinderGeometry(r * .92, r, y1 - y0, 12), TM(x, (y0 + y1) / 2, z));
  B.add(part, 'stone', lathe([[r * 1.25, 0], [r * 1.75, .05], [r * 1.85, .12], [r * 1.5, .2], [r * 1.1, .22], [0, .22]], 12), TM(x, y0 - .02, z));
}
function lantern(part, x, y, z, big) {
  if (big) { B.add(part, 'lampGl', new THREE.CylinderGeometry(.27, .22, .5, 6), TM(x, y, z)); B.add(part, 'woodDk', new THREE.CylinderGeometry(.32, .3, .07, 6), TM(x, y + .29, z)); B.add(part, 'woodDk', new THREE.CylinderGeometry(.2, .25, .06, 6), TM(x, y - .28, z)); B.box(part, 'lantern', x, y - .5, z, .05, .36, .05); B.box(part, 'woodDk', x, y + .75, z, .02, .9, .02); }
  else { B.add(part, 'lantern', new THREE.SphereGeometry(.2, 10, 8), TM(x, y, z, 0, 1, 1.15, 1)); B.add(part, 'gold', new THREE.CylinderGeometry(.09, .09, .05, 8), TM(x, y + .24, z)); B.add(part, 'gold', new THREE.CylinderGeometry(.09, .09, .05, 8), TM(x, y - .24, z)); B.box(part, 'lantern', x, y - .42, z, .03, .3, .03); B.box(part, 'woodDk', x, y + .6, z, .015, .7, .015); }
}
// 粉墙板：可开漏窗或月洞
function wallPanel(part, a, b, y0, h, th, hole) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(l, 0); sh.lineTo(l, h); sh.lineTo(0, h); sh.closePath();
  const ry = Math.atan2(-(b[1] - a[1]), b[0] - a[0]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l;
  if (hole) { const p = new THREE.Path(); if (hole.r) p.absarc(l / 2, hole.cy, hole.r, 0, TAU, true); else { const s = hole.s / 2; p.moveTo(l / 2 - s, hole.cy - s); p.lineTo(l / 2 - s, hole.cy + s); p.lineTo(l / 2 + s, hole.cy + s); p.lineTo(l / 2 + s, hole.cy - s); p.closePath(); } sh.holes.push(p); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 28 }); g.translate(0, 0, -th / 2);
  B.add(part, 'plaster', g, TM(a[0], y0, a[1], ry), 1);
  const P = (s, y) => [a[0] + ux * s, y0 + y, a[1] + uz * s];
  if (hole && hole.r) { for (let i = 0; i < 36; i++) { const t0 = i / 36 * TAU, t1 = (i + 1) / 36 * TAU, R = hole.r + .03; B.seg(part, 'ridge', P(l / 2 + Math.cos(t0) * R, hole.cy + Math.sin(t0) * R), P(l / 2 + Math.cos(t1) * R, hole.cy + Math.sin(t1) * R), th + .08, .12, 1.25); } }
  else if (hole) { const s = hole.s / 2, c = l / 2, n = 5;
    [[-s, -s, s, -s], [-s, s, s, s], [-s, -s, -s, s], [s, -s, s, s]].forEach(e => B.seg(part, 'ridge', P(c + e[0], hole.cy + e[1]), P(c + e[2], hole.cy + e[3]), th + .06, .07, 1.3));
    for (let i = 1; i < n; i++) { const d = -s + hole.s * i / n; B.seg(part, 'tile', P(c + d, hole.cy - s), P(c + s, hole.cy - d), .05, .035, 1.25); B.seg(part, 'tile', P(c - s, hole.cy + d), P(c - d, hole.cy + s), .05, .035, 1.25); B.seg(part, 'tile', P(c - d, hole.cy - s), P(c - s, hole.cy - d), .05, .035, 1.25); B.seg(part, 'tile', P(c + s, hole.cy + d), P(c + d, hole.cy + s), .05, .035, 1.25); } }
}

function buildShore() {
  // 岸线折线（含小水湾）
  const bank = []; for (let z = -202; z <= INLET[0]; z += 1.3) bank.push([bankX(z), z]);
  bank.push([bankX(INLET[0]), INLET[0]], [INLET[2], INLET[0]], [INLET[2], INLET[1]], [bankX(INLET[1]), INLET[1]]);
  for (let z = INLET[1] + 1.3; z <= 202; z += 1.3) bank.push([bankX(z), z]);
  // 草地
  const extN = [[-60, -1150], [50, -760], [28, -430], [10, -290]], extS = [[14, 300], [44, 450], [0, 640], [-130, 800]];
  const all = extN.concat(bank, extS), sh = new THREE.Shape(); all.forEach((p, i) => i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1])); sh.lineTo(760, -1150); sh.lineTo(760, 800); sh.closePath();
  { const fg = new THREE.PlaneGeometry(2600, 2400, 8, 8).rotateX(-PI / 2); fg.translate(2055, Y0 - .03, -175); B.add('lawn', 'farLand', fg, null, 1); }   // 远处的平地另用一块粗网格，免得近处草地跟着一个几公里的大三角形
  [extN.concat([bank[0]]), [bank[bank.length - 1]].concat(extS)].forEach(ln => { for (let i = 0; i < ln.length - 1; i++) { const a = ln[i], b = ln[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    B.seg('bank', 'stone', [a[0], -.5, a[1]], [b[0], -.5, b[1]], .8, 2, .85);
    for (let s = 6; s < l; s += 9) { const x = lerp(a[0], b[0], s / l), z = lerp(a[1], b[1], s / l); if (Math.abs(z) < 330) { treeLite(['camphor', 'plane'][(s / 9 | 0) % 2], x + rr(5, 9), z, rr(.7, .9)); treeLite('camphor', x + rr(18, 34), z + rr(-4, 4), rr(.9, 1.2)); continue; } if ((s / 9 | 0) % 4 === 1) tree('peach', x + rr(4, 8), z + rr(-2, 2), 'trees', 1.2); else treeFar('trees', ['camphor', 'plane', 'ginkgo'][(s / 9 | 0) % 3], x + rr(4, 9), Y0, z + rr(-2, 2), rr(.6, .85)); if (s % 2 < 1) treeFar('trees', 'camphor', x + rr(16, 40), Y0, z + rr(-4, 4), rr(.95, 1.25)); } } });
  const lawnTex = canvasTex(256, 256, (c, w) => { c.fillStyle = '#e9e9e9'; c.fillRect(0, 0, w, w); const r = mulberry(5); for (let i = 0; i < 9000; i++) { const v = 200 + r() * 55 | 0; c.fillStyle = `rgba(${v},${v},${v - 20},.5)`; c.fillRect(r() * w, r() * w, 1 + r() * 2, 2 + r() * 3); } }, true); lawnTex.repeat.set(.16, .16);
  const lg = new THREE.ShapeGeometry(sh); lg.rotateX(-PI / 2); lg.translate(0, Y0, 0);
  const lawn = new THREE.Mesh(lg, makeMat('lawn', { vertexColors: false, map: lawnTex })); lawn.receiveShadow = true; world.add(lawn); regMesh(lawn, 'lawn', 'lawn');
  // 驳岸：墙身 + 压顶条石
  for (let i = 0; i < bank.length - 1; i++) { const a = bank[i], b = bank[i + 1];
    B.seg('bank', 'stone', [a[0], -.9, a[1]], [b[0], -.9, b[1]], .5, 2.8, rr(.78, .9)); B.seg('bank', 'stone', [a[0], Y0 - .04, a[1]], [b[0], Y0 - .04, b[1]], .62, .16); }
  // 步道（世界坐标 UV 的石板纹）
  const paveTex = canvasTex(256, 256, (c, w) => { const r = mulberry(9); c.fillStyle = '#9a968c'; c.fillRect(0, 0, w, w);
    for (let y = 0; y < 4; y++) { const tone = [0, 1].map(() => 206 + r() * 40 | 0); for (let x = -1; x < 3; x++) { const v = tone[((x % 2) + 2) % 2]; c.fillStyle = `rgb(${v},${v - 3},${v - 11})`; c.fillRect(x * 128 + (y % 2 ? 64 : 0) + 1.5, y * 64 + 1.5, 125, 61); } }
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(80,80,74,${r() * .1})`; c.fillRect(r() * w, r() * w, 2, 2); } }, true);
  const pm = makeMat('paving', { vertexColors: false, map: paveTex });
  const ribbon = (pts, wdt, y) => { const pos = [], uv = [], idx = []; const L = offsetPoly(pts, wdt / 2), R = offsetPoly(pts, -wdt / 2);
    pts.forEach((p, i) => { pos.push(L[i][0], y, L[i][1], R[i][0], y, R[i][1]); uv.push(L[i][0] / 2.4, L[i][1] / 2.4, R[i][0] / 2.4, R[i][1] / 2.4); if (i) { const a = i * 2 - 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, pm); m.receiveShadow = true; world.add(m); regMesh(m, 'path', 'paving');
    for (let i = 0; i < pts.length - 1; i++) { B.seg('path', 'stone', [L[i][0], y, L[i][1]], [L[i + 1][0], y, L[i + 1][1]], .14, .1, rr(.82, .95)); B.seg('path', 'stone', [R[i][0], y, R[i][1]], [R[i + 1][0], y, R[i + 1][1]], .14, .1, rr(.82, .95)); } };
  const p1 = [], p2 = []; for (let z = -198; z <= 34; z += 2) p1.push([pathX(z), z]); for (let z = 54; z <= 198; z += 2) p2.push([pathX(z), z]);
  ribbon(p1, 3.2, Y0 + .03); ribbon(p2, 3.2, Y0 + .03);
  ribbon([[bankX(0) + .2, 0], [pathX(0) - 1.5, 0]], 9, Y0 + .035);          // 桥头平台
  ribbon([[pathX(0) + 1.5, 0], [23.8, 0]], 2.6, Y0 + .035);                 // 通向月洞门
  ribbon([[24.2, 0], [40, 0]], 2.6, Y0 + .035);
  ribbon([[bankX(20) + .2, 20], [pathX(20) - 1.5, 20]], 3.2, Y0 + .035);    // 码头小径
}

function buildBridge() {
  const hw = 1.2;
  // 桥面石板：每段三列，转角处方形石
  for (let i = 0; i < BR.length - 1; i++) {
    const a = BR[i], b = BR[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l;
    const s0 = i > 0 ? hw : 0, s1 = i < BR.length - 2 ? l - hw : l, n = Math.max(1, Math.round((s1 - s0) / 1.55)), d = (s1 - s0) / n;
    for (let j = 0; j < n; j++) for (let k = -1; k <= 1; k++) { const s = s0 + (j + .5) * d; B.box('br-deck', 'slab', a[0] + ux * s - uz * k * .8, DECK - .07, a[1] + uz * s + ux * k * .8, Math.abs(ux) * (d - .025) + Math.abs(uz) * .775, .14, Math.abs(uz) * (d - .025) + Math.abs(ux) * .775); }
    if (i > 0) for (let k = -1; k <= 1; k++) B.box('br-deck', 'slab', a[0] + k * .8, DECK - .07, a[1], .775, .14, 2.375);
    // 边梁
    [-1, 1].forEach(sd => B.seg('br-pier', 'stone', [a[0] - uz * sd * 1.08, DECK - .29, a[1] + ux * sd * 1.08], [b[0] - uz * sd * 1.08, DECK - .29, b[1] + ux * sd * 1.08], .24, .3, rr(.8, .9)));
    // 桥墩：双石柱 + 盖梁
    const st = stations(a, b, 3.6); st.forEach((p, j) => { if (j === 0 && i > 0) return; [-1, 1].forEach(sd => B.box('br-pier', 'stone', p[0] - uz * sd * .8, -.86, p[1] + ux * sd * .8, .3, 2.84, .3, 0, rr(.72, .86))); B.seg('br-pier', 'stone', [p[0] - uz * 1.3, DECK - .52, p[1] + ux * 1.3], [p[0] + uz * 1.3, DECK - .52, p[1] - ux * 1.3], .34, .22, rr(.78, .9)); });
  }
  B.box('br-deck', 'stone', BR[0][0] + .55, Y0 + .06, BR[0][1], .5, .1, 2.4);
  const yD = () => DECK;
  stoneRail('br-rail', offsetPoly(BR, hw - .1), yD); stoneRail('br-rail', offsetPoly(BR, -(hw - .1)), yD);
}

function buildPavilion() {
  const { x: cx, z: cz, y: yp } = PAV;
  // 台基：石芯 + 方砖墁地 + 阶条石
  B.box('pv-base', 'stone', cx, (yp - .14 - 2.3) / 2, cz, 9.3, yp - .14 + 2.3, 9.3, 0, .84);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) B.box('pv-base', 'slab', cx - 4.05 + i * .9, yp - .07, cz - 4.05 + j * .9, .88, .14, .88);
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(d => B.box('pv-base', 'stone', cx + d[0] * 4.65, yp - .08, cz + d[1] * 4.65, d[0] ? .3 : 9.6, .16, d[0] ? 9.0 : .3, 0, 1.04));
  B.box('pv-base', 'stone', cx + 4.95, DECK - .07, cz, .3, .14, 2.4);
  // 柱网：外圈 12 柱 + 内圈 4 金柱
  const ring = [], h = 3.6, s = [-3.6, -1.2, 1.2, 3.6];
  s.forEach(v => ring.push([v, -h])); s.slice(1).forEach(v => ring.push([h, v])); s.slice(0, 3).reverse().forEach(v => ring.push([v, h])); s.slice(1, 3).reverse().forEach(v => ring.push([-h, v]));
  const yc = yp + 3.4;
  ring.forEach(p => column('pv-col', cx + p[0], cz + p[1], yp, yc));
  const inner = [[-1.9, -1.9], [1.9, -1.9], [1.9, 1.9], [-1.9, 1.9]];
  inner.forEach(p => column('pv-col', cx + p[0], cz + p[1], yp, yp + 5.62, .17));
  for (let i = 0; i < 12; i++) {
    const a = ring[i], b = ring[(i + 1) % 12], A = [cx + a[0], cz + a[1]], Bp = [cx + b[0], cz + b[1]];
    B.seg('pv-beam', 'woodDk', [A[0], yc - .13, A[1]], [Bp[0], yc - .13, Bp[1]], .17, .26); B.seg('pv-beam', 'wood', [A[0], yc - .42, A[1]], [Bp[0], yc - .42, Bp[1]], .1, .12, .9);
    guaLuo('pv-lattice', A, Bp, yc - .48);
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, ox = Math.abs(mx) > 3.5 ? Math.sign(mx) : 0, oz = Math.abs(mz) > 3.5 ? Math.sign(mz) : 0;
    if (!(ox === 1 && Math.abs(mz) < .1)) meiRenKao('pv-seat', A, Bp, yp, ox, oz);
  }
  // 抹角梁、内圈枋
  for (let i = 0; i < 4; i++) { const a = inner[i], b = inner[(i + 1) % 4]; [yc - .1, yp + 4.7, yp + 5.55].forEach(y => B.seg('pv-beam', 'woodDk', [cx + a[0], y, cz + a[1]], [cx + b[0], y, cz + b[1]], .16, .22)); }
  ring.forEach((p, i) => { if (i % 3 === 0) { const q = inner[i / 3]; B.seg('pv-beam', 'woodDk', [cx + p[0], yc - .12, cz + p[1]], [cx + q[0], yc - .12, cz + q[1]], .14, .2); } });
  // 上檐围：花窗（入夜透光）
  for (let i = 0; i < 4; i++) { const a = inner[i], b = inner[(i + 1) % 4], A = [cx + a[0], yp + 5.12, cz + a[1]], Bp = [cx + b[0], yp + 5.12, cz + b[1]];
    B.seg('pv-upper', 'lampGl', A, Bp, .05, .62, 1); for (let k = 1; k < 10; k++) { const t = k / 10; B.box('pv-upper', 'woodDk', lerp(A[0], Bp[0], t), yp + 5.12, lerp(A[2], Bp[2], t), .09, .64, .09); }
    [.3, -.3].forEach(dy => B.seg('pv-upper', 'woodDk', [A[0], A[1] + dy, A[2]], [Bp[0], Bp[1] + dy, Bp[2]], .09, .05)); }
  // 重檐屋面
  buildRoof('pv-roof', 'pv-ridge', { sides: 4, rTop: 1.95, rEave: 5.25, h: 1.5, sag: .15, lift: .95, flare: .4, cx, cy: yp + 3.3, cz }, { nu: 14, nt: 10 });
  buildRoof('pv-roof', 'pv-ridge', { sides: 4, rTop: .12, rEave: 3.3, h: 2.35, sag: .2, lift: .8, flare: .34, cx, cy: yp + 5.5, cz }, { nu: 12, nt: 12 });
  // 宝顶
  B.add('pv-finial', 'ridge', lathe([[0, 0], [.34, 0], [.36, .1], [.2, .2], [.16, .3], [.3, .46], [.33, .62], [.22, .8], [.1, .9], [.12, 1.0], [.05, 1.18], [0, 1.3]], 16), TM(cx, yp + 7.78, cz), 1.5);
  // 石桌石凳
  B.add('pv-table', 'stone', new THREE.CylinderGeometry(.62, .62, .09, 20), TM(cx, yp + .74, cz), 1.05); B.add('pv-table', 'stone', new THREE.CylinderGeometry(.2, .3, .7, 12), TM(cx, yp + .35, cz));
  for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; B.add('pv-table', 'stone', lathe([[0, 0], [.17, 0], [.23, .12], [.24, .3], [.18, .44], [0, .44]], 12), TM(cx + Math.cos(a) * 1.05, yp, cz + Math.sin(a) * 1.05)); }
  // 宫灯与角灯
  lantern('pv-lamp', cx, yp + 2.95, cz, true); addGlow(cx, yp + 2.95, cz, 0xffb968, 4.2); addNightLight(cx, yp + 2.7, cz, 0xffb062, 1.35, 24);
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(d => { lantern('pv-lamp', cx + d[0] * 4.15, yp + 2.72, cz + d[1] * 4.15); addGlow(cx + d[0] * 4.15, yp + 2.72, cz + d[1] * 4.15, 0xff6a30, 2.2); });
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(d => { lantern('pv-lamp', cx + d[0] * 3.9, yp + 2.6, cz + d[1] * 3.9); addGlow(cx + d[0] * 3.9, yp + 2.6, cz + d[1] * 3.9, 0xff6a30, 1.8); });
  addGlow(cx, yp + 5.1, cz, 0xffc070, 7);
  // 匾额
  const tex = canvasTex(512, 180, (c, w, hh) => { c.fillStyle = '#17140f'; c.fillRect(0, 0, w, hh); c.strokeStyle = '#b08a3a'; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, hh - 16); });
  const drawPlaque = () => { const c = tex.image.getContext('2d'); c.fillStyle = '#17140f'; c.fillRect(16, 16, 480, 148); c.fillStyle = '#d9b45a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '118px "Ma Shan Zheng","Noto Serif SC","Noto Serif CJK SC","Songti SC",serif'; c.fillText('集贤亭', 256, 96); tex.needsUpdate = true; };
  drawPlaque(); if (document.fonts && document.fonts.load) document.fonts.load('118px "Ma Shan Zheng"', '集贤亭').then(drawPlaque).catch(() => { });
  const pl = new THREE.Mesh(new THREE.BoxGeometry(.07, .5, 1.42), (pm => [new THREE.MeshLambertMaterial({ map: tex }), pm, pm, pm, pm, pm])(makeMat('plaque', { vertexColors: false })));
  pl.position.set(cx + 2.02, yp + 5.12, cz); world.add(pl); regMesh(pl, 'pv-upper', null);
}

function buildCorridor() {
  const C = [[5.5, -7.5], [5.5, -21], [2.2, -21], [2.2, -35.7]], yf = Y0 + .25, yc = yf + 2.6, hw = 1.15;
  const L = offsetPoly(C, hw), R = offsetPoly(C, -hw), sideL = [], sideR = [];
  for (let i = 0; i < C.length - 1; i++) {
    const a = C[i], b = C[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l;
    const e0 = i > 0 ? -1.45 : 0, e1 = i < C.length - 2 ? 1.45 : 0, A = [a[0] + ux * e0, a[1] + uz * e0], Bq = [b[0] + ux * e1, b[1] + uz * e1], ll = l - e0 + e1;
    // 台基
    B.seg('co-base', 'stone', [A[0], Y0 + .06, A[1]], [Bq[0], Y0 + .06, Bq[1]], 3.0, .14, rr(.85, .95)); const n = Math.round(ll / .9);
    for (let j = 0; j < n; j++) for (let k = -1; k <= 1; k++) { const s = (j + .5) * ll / n; B.seg('co-base', 'slab', [A[0] + ux * (s - ll / n / 2 + .012) - uz * k * .92, yf - .06, A[1] + uz * (s - ll / n / 2 + .012) + ux * k * .92], [A[0] + ux * (s + ll / n / 2 - .012) - uz * k * .92, yf - .06, A[1] + uz * (s + ll / n / 2 - .012) + ux * k * .92], .9, .12); }
    // 双坡瓦顶：屋脊、瓦面、瓦垄
    const nx = -uz, nz = ux, yr = yc + 1.02, P = (s, o, y) => [A[0] + ux * s + nx * o, y, A[1] + uz * s + nz * o];
    [-1, 1].forEach(sd => {
      const prof = [[0, yr], [.85, yr - .57], [1.72, yr - 1.0]];
      for (let k = 0; k < 2; k++) { const p0 = prof[k], p1 = prof[k + 1];
        const g = new THREE.BufferGeometry(), q = [P(0, sd * p0[0], p0[1]), P(ll, sd * p0[0], p0[1]), P(0, sd * p1[0], p1[1]), P(ll, sd * p1[0], p1[1])];
        g.setAttribute('position', new THREE.Float32BufferAttribute([].concat(q[0], q[1], q[2], q[1], q[3], q[2], q[0], q[2], q[1], q[1], q[2], q[3]), 3)); g.computeVertexNormals(); B.add('co-roof', 'tile', g, null, .86);
        const nr = Math.round(ll / .27); for (let r = 0; r < nr; r++) { const s = (r + .5) * ll / nr; B.seg('co-roof', 'tile', P(s, sd * p0[0], p0[1] + .045), P(s, sd * p1[0], p1[1] + .045), .12, .08); } }
      B.seg('co-roof', 'ridge', P(0, sd * 1.72, yr - 1.03), P(ll, sd * 1.72, yr - 1.03), .1, .13, 1);
    });
    B.seg('co-roof', 'ridge', P(-.05, 0, yr + .1), P(ll + .05, 0, yr + .1), .2, .3, .95);
    if (i === 0) B.seg('co-roof', 'ridge', P(-.05, 0, yr + .2), P(-.45, 0, yr + .55), .16, .16, .95);
    if (i === C.length - 2) B.seg('co-roof', 'ridge', P(ll + .05, 0, yr + .2), P(ll + .45, 0, yr + .55), .16, .16, .95);
    // 柱、枋、挂落、坐凳栏杆（柱位取自中线，转角外侧补角柱）
    const t0 = i > 0 ? hw : 0, t1 = i < C.length - 2 ? l - hw : l, ns = Math.max(1, Math.round((t1 - t0) / 2.7));
    for (let j = 0; j <= ns; j++) { const s = lerp(t0, t1, j / ns), c = [a[0] + ux * s, a[1] + uz * s];
      B.seg('co-frame', 'woodDk', [c[0] + nx * hw, yc - .05, c[1] + nz * hw], [c[0] - nx * hw, yc - .05, c[1] - nz * hw], .12, .18); B.box('co-frame', 'woodDk', c[0], yc + .45, c[1], .1, .86, .1);
      sideL.push([c[0] + nx * hw, c[1] + nz * hw, i]); sideR.push([c[0] - nx * hw, c[1] - nz * hw, i]); }
    if (i < C.length - 2) { [[sideL, L[i + 1]], [sideR, R[i + 1]]].forEach(e => { const last = e[0][e[0].length - 1]; if (Math.hypot(last[0] - e[1][0], last[1] - e[1][1]) > .2) e[0].push([e[1][0], e[1][1], i]); }); }
    if (i === 1) { lantern('co-lamp', (a[0] + b[0]) / 2, yc - .55, (a[1] + b[1]) / 2); addGlow((a[0] + b[0]) / 2, yc - .55, (a[1] + b[1]) / 2, 0xff7a3a, 2.2); }
    else stations(a, b, 5.6).forEach((p, j, arr) => { if (j === 0 || j === arr.length - 1) return; lantern('co-lamp', p[0], yc - .55, p[1]); addGlow(p[0], yc - .55, p[1], 0xff7a3a, 2.2); });
  }
  [sideL, sideR].forEach((st, side) => { const seen = [];
    st.forEach((p, j) => { if (!seen.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < .2)) { column('co-frame', p[0], p[1], yf, yc, .11); seen.push(p); }
      if (j < st.length - 1) { const q = st[j + 1]; if (Math.hypot(q[0] - p[0], q[1] - p[1]) < .3) return;
        B.seg('co-frame', 'woodDk', [p[0], yc - .1, p[1]], [q[0], yc - .1, q[1]], .13, .2);
        if (p[2] === 0 && q[2] === 0 && side === 0) wallPanelPlain('co-wall', p, q, yf, 2.42, j % 2 === 0);
        else { guaLuo('co-frame', p, q, yc - .22, .36); lowRail('co-seat', p, q, yf); } } }); });
  addNightLight(4.6, yc - .6, -15, 0xffa860, .6, 14);
}
function lowRail(part, a, b, y) { // 坐凳栏杆
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l, P = (s, yy) => [a[0] + ux * s, y + yy, a[1] + uz * s];
  B.seg(part, 'woodDk', P(.12, .44), P(l - .12, .44), .3, .05); B.seg(part, 'woodDk', P(.12, .06), P(l - .12, .06), .06, .06);
  const n = Math.round(l / .22); for (let i = 1; i < n; i++) B.seg(part, 'wood', P(l * i / n, .08), P(l * i / n, .42), .035, .035, .85);
}
function wallCap(part, a, b, top, th) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l, nx = -uz, nz = ux, P = (s, o, y) => [a[0] + ux * s + nx * o, y, a[1] + uz * s + nz * o];
  const o1 = th / 2 + .2;
  [-1, 1].forEach(sd => { const g = new THREE.BufferGeometry(), q = [P(0, 0, top + .24), P(l, 0, top + .24), P(0, sd * o1, top + .04), P(l, sd * o1, top + .04)];
    g.setAttribute('position', new THREE.Float32BufferAttribute([].concat(q[0], q[1], q[2], q[1], q[3], q[2], q[0], q[2], q[1], q[1], q[2], q[3]), 3)); g.computeVertexNormals(); B.add(part, 'tile', g, null, .86);
    const n = Math.round(l / .3); for (let r = 0; r < n; r++) { const s = (r + .5) * l / n; B.seg(part, 'tile', P(s, sd * .05, top + .25), P(s, sd * o1, top + .075), .12, .07); }
    B.seg(part, 'ridge', P(0, sd * o1, top + .02), P(l, sd * o1, top + .02), .07, .09, 1); });
  B.seg(part, 'ridge', P(0, 0, top + .27), P(l, 0, top + .27), .14, .16, .95); B.seg(part, 'plaster', P(0, 0, top + .0), P(l, 0, top + .0), th + .12, .08, .97);
}
function wallPanelPlain(part, a, b, y0, h, win) { wallPanel(part, a, b, y0, h, .16, win ? { s: 1.0, cy: 1.45 } : null); }

function buildHall() {
  const cx = .4, cz = -38.9, hx = 3.3, hz = 2.5, yp = Y0 + .3, yc = yp + 2.9;
  B.box('ha-base', 'stone', cx, (yp - .12 - 2.3) / 2 + .0, cz, hx * 2 + 1.2, yp - .12 + 2.3, hz * 2 + 1.2, 0, .84);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 7; j++) B.box('ha-base', 'slab', cx - 3.6 + i * .9, yp - .06, cz - 2.7 + j * .9, .88, .12, .88);
  const cols = []; [-hx, -1.1, 1.1, hx].forEach(x => cols.push([x, -hz])); cols.push([hx, 0]); [hx, 1.1, -1.1, -hx].forEach(x => cols.push([x, hz])); cols.push([-hx, 0]);
  cols.forEach(p => column('ha-frame', cx + p[0], cz + p[1], yp, yc, .14));
  for (let i = 0; i < cols.length; i++) { const a = cols[i], b = cols[(i + 1) % cols.length], A = [cx + a[0], cz + a[1]], Q = [cx + b[0], cz + b[1]];
    B.seg('ha-frame', 'woodDk', [A[0], yc - .12, A[1]], [Q[0], yc - .12, Q[1]], .16, .24); guaLuo('ha-frame', A, Q, yc - .26, .4);
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, ox = Math.abs(mx) > hx - .1 ? Math.sign(mx) : 0, oz = Math.abs(mz) > hz - .1 ? Math.sign(mz) : 0;
    if (!(oz === 1) && !(ox === 1)) meiRenKao('ha-frame', A, Q, yp, ox, oz); }
  buildRoof('ha-roof', 'ha-roof', { rect: 1, x0: 1.5, z0: .1, x1: hx + 1.45, z1: hz + 1.45, h: 1.9, sag: .17, lift: .7, flare: .3, cx, cy: yc - .08, cz }, { nu: 12, nt: 9 });
  B.seg('ha-roof', 'ridge', [cx - 1.7, yc + 1.95, cz], [cx + 1.7, yc + 1.95, cz], .22, .34, .95);
  [-1, 1].forEach(s => B.seg('ha-roof', 'ridge', [cx + s * 1.7, yc + 2.0, cz], [cx + s * 2.1, yc + 2.42, cz], .16, .18, .95));
  lantern('ha-lamp', cx, yp + 2.3, cz, true); addGlow(cx, yp + 2.3, cz, 0xffb968, 3.6); addNightLight(cx, yp + 2.2, cz, 0xffb062, 1.3, 22);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(d => { lantern('ha-lamp', cx + d[0] * (hx + .5), yp + 2.3, cz + d[1] * (hz + .5)); addGlow(cx + d[0] * (hx + .5), yp + 2.3, cz + d[1] * (hz + .5), 0xff6a30, 1.9); });
}

function buildArchBridge() {
  const x0 = 11.2, W = 3.6, z0 = 44, L = 10, R = 3.3, yc = -.7, top = s => Y0 + 2.6 * Math.pow(Math.cos(PI * s / (2 * L)), 2);
  const sh = new THREE.Shape(); sh.moveTo(-L, -2.3); sh.lineTo(-L, Y0); for (let i = 1; i <= 40; i++) { const s = -L + 2 * L * i / 40; sh.lineTo(s, top(s)); } sh.lineTo(L, -2.3); sh.closePath();
  const hp = new THREE.Path(); hp.moveTo(-R, -2.2); hp.lineTo(-R, yc); hp.absarc(0, yc, R, PI, 0, true); hp.lineTo(R, -2.2); hp.closePath(); sh.holes.push(hp);
  B.add('arch', 'stone', new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false, curveSegments: 30 }), TM(x0 + W, 0, z0, -PI / 2), .9);
  for (let i = 0; i < 26; i++) { const s0 = -L + 2 * L * i / 26, s1 = s0 + 2 * L / 26; B.seg('arch', 'slab', [x0 + W / 2, top(s0) + .03, z0 + s0], [x0 + W / 2, top(s1) + .03, z0 + s1 - .02], W - .5, .08); }
  [x0 - .04, x0 + W + .04].forEach(x => { for (let a = 12; a <= 168; a += 12) { const c = Math.cos(a * PI / 180), s = Math.sin(a * PI / 180); B.seg('arch', 'stone', [x, yc + R * s, z0 + R * c], [x, yc + (R + .46) * s, z0 + (R + .46) * c], .1, .66, rr(.95, 1.08)); } });
  const yOf = p => top(p[1] - z0) + .02;
  [x0 + .18, x0 + W - .18].forEach(x => stoneRail('arch', [[x, z0 - L], [x, z0 + L]], yOf, 1.67));
}

function buildWall() {
  const X = 24, h = 2.7;
  for (let k = 0; k < 18; k++) { const z = -75 + k * 6, a = [X, z], b = [X, z + 6];
    wallPanel('wall', a, b, Y0, h, .3, z === -3 ? { r: 1.32, cy: 1.5 } : (k % 2 === 0 ? { s: 1.25, cy: 1.6 } : null)); wallCap('wall', a, b, Y0 + h, .3); }
  B.box('wall', 'stone', X, Y0 + .08, 0, .5, .1, 2.2);
}

function buildFacilities() {
  // 长椅：木条坐面与靠背，铸铁支架
  const bench = (x, z, ry) => { const b = B.base = new Matrix4().copy(TM(x, Y0, z, ry));
    [-.68, .68].forEach(sx => { B.box('bench', 'metal', sx, .22, .0, .06, .44, .46); B.seg('bench', 'metal', [sx, .42, -.2], [sx, .92, -.34], .05, .06); B.box('bench', 'metal', sx, .02, 0, .1, .04, .56); B.seg('bench', 'metal', [sx, .6, .22], [sx, .42, .24], .05, .05); B.seg('bench', 'metal', [sx, .6, .22], [sx, .6, -.22], .05, .04); });
    for (let i = 0; i < 5; i++) B.box('bench', 'benchWd', 0, .46, -.18 + i * .1, 1.62, .03, .085);
    for (let i = 0; i < 4; i++) B.seg('bench', 'benchWd', [-.81, .56 + i * .115, -.245 - i * .032], [.81, .56 + i * .115, -.245 - i * .032], .03, .09);
    B.base = null; };
  // 园灯：石座、灯杆、方形宫灯罩
  const lamp = (x, z) => { B.box('lamp', 'stone', x, Y0 + .12, z, .36, .24, .36); B.add('lamp', 'metal', new THREE.CylinderGeometry(.045, .06, 2.5, 8), TM(x, Y0 + 1.47, z));
    B.box('lamp', 'lampGl', x, Y0 + 2.96, z, .3, .42, .3, 0, 1); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(d => B.box('lamp', 'metal', x + d[0] * .155, Y0 + 2.96, z + d[1] * .155, .03, .46, .03));
    B.box('lamp', 'metal', x, Y0 + 2.73, z, .36, .04, .36); B.add('lamp', 'metal', new THREE.ConeGeometry(.33, .2, 4), TM(x, Y0 + 3.28, z, PI / 4)); B.add('lamp', 'metal', new THREE.SphereGeometry(.04, 6, 5), TM(x, Y0 + 3.4, z));
    addGlow(x, Y0 + 2.96, z, 0xffc880, 3.0); addPool(x, Y0 + .06, z, 4.6); };
  for (let z = -168; z <= 168; z += 14) { if (z > 28 && z < 58) continue; if (Math.abs(z) < 6) continue; bench(pathX(z) - 2.25, z + 3, -PI / 2); }
  bench(6.4, 3.9, PI); bench(6.4, -3.9, 0);
  for (let z = -186; z <= 186; z += 12) { if (z > 30 && z < 58) continue; lamp(pathX(z) + 2.05, z); }
  lamp(4.1, 3.0); lamp(4.1, -3.0); lamp(bankX(26) + 1.4, 26); lamp(12.2, 32.6); lamp(13.8, 55.4);
  addNightLight(5.2, Y0 + 2.9, 0, 0xffc27a, .5, 16);
  // 码头：石阶与系船石
  const px = bankX(20), pz = 20; for (let i = 0; i < 4; i++) B.box('pier', 'stone', px - .35 - i * .42, Y0 - .09 - i * .15, pz, .44, .16, 3.4);
  B.box('pier', 'stone', px - 1.3, -1.2, pz, 2.6, 2.3, 3.4, 0, .82);
  [-1.9, 1.9].forEach(d => { B.add('pier', 'stone', new THREE.CylinderGeometry(.11, .14, .55, 8), TM(px + .35, Y0 + .27, pz + d)); B.add('pier', 'stone', new THREE.SphereGeometry(.14, 8, 6), TM(px + .35, Y0 + .58, pz + d)); });
  // 太湖石
  const rock = (x, z, s, hgt) => { const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i), n = fbm(X * 1.7 + x, Z * 1.7 + Y * 2.1 + z, 3), k = .62 + n * .85 - (n > .56 ? (n - .56) * 1.5 : 0); p.setXYZ(i, X * k, Y * k, Z * k); } g.computeVertexNormals(); B.add('rockery', 'rock', g, TM(x, Y0 + hgt * .42, z, rnd() * 6, s, hgt, s * .8)); };
  rock(8.6, 6.4, .9, 2.3); rock(9.7, 7.3, .6, 1.2); rock(7.8, 7.6, .5, .8); rock(20, -9, .8, 1.9); rock(20.8, -10, .5, .9); rock(bankX(-62) + 2, -62, .9, 1.6); rock(bankX(72) + 1.6, 72, .7, 1.2);
}
