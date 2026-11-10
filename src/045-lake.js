// ───────── 045 lake：环湖造景——白堤断桥、孤山、三岛、净慈寺、北山街、城市天际线、湖上游船 ─────────
MD.wallYel = { dt: 'plaster', bump: .003, c: 0xd7a744, t: 'p', snow: .8, jit: .03 };

function ringPts(cx, cz, rx, rz, n, wob = 0, seed = 1) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + wob * (fbm(Math.cos(a) * 1.6 + seed, Math.sin(a) * 1.6 + seed, 2) - .5); o.push([cx + Math.cos(a) * rx * k, cz + Math.sin(a) * rz * k]); } return o; }
function stoneEdge(part, ring, closed = true) { const n = ring.length; for (let i = 0; i < (closed ? n : n - 1); i++) { const a = ring[i], b = ring[(i + 1) % n]; B.seg(part, 'stone', [a[0], -.9, a[1]], [b[0], -.9, b[1]], .7, 2.8, rr(.78, .9)); B.seg(part, 'stone', [a[0], Y0 - .04, a[1]], [b[0], Y0 - .04, b[1]], .8, .18); } }
// 岛：草面 + 石驳岸，可带内湖
function isle(part, pts, holes = []) {
  const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1])); sh.closePath();
  holes.forEach(h => { const hp = new THREE.Path(); h.forEach((p, i) => i ? hp.lineTo(p[0], -p[1]) : hp.moveTo(p[0], -p[1])); hp.closePath(); sh.holes.push(hp); });
  const g = new THREE.ShapeGeometry(sh); g.rotateX(-PI / 2); g.translate(0, Y0, 0); B.add(part, 'lawn', g, null, 1); stoneEdge(part, pts); holes.forEach(h => stoneEdge(part, h));
}
function quadUp(part, mat, a, b, c, d, tint) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([].concat(a, b, c, b, d, c, a, c, b, b, c, d), 3)); g.computeVertexNormals(); B.add(part, mat, g, null, tint); }
// 堤：草面、中间石板路、两侧条石驳岸
function causeway(part, pts, w, taper = 0) {
  // taper：两端各两个点向桥身收窄（堤比桥宽，直接截断会在桥边露出一块方角）
  const n = pts.length, wf = i => { const e = Math.min(i, n - 1 - i); return taper && e === 0 ? taper : taper && e === 1 ? (taper + w) / 2 : w; }, pw = Math.min(w * .16, (taper || w) / 2 - 1.2);
  const off = k => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d = k === 0 ? wf(i) / 2 : k === 1 ? -wf(i) / 2 : k === 2 ? pw : -pw; return [p[0] - (b[1] - a[1]) / l * d, p[1] + (b[0] - a[0]) / l * d]; });
  const L = off(0), R = off(1), l2 = off(2), r2 = off(3);
  for (let i = 0; i < pts.length - 1; i++) { quadUp(part, 'lawn', [L[i][0], Y0, L[i][1]], [R[i][0], Y0, R[i][1]], [L[i + 1][0], Y0, L[i + 1][1]], [R[i + 1][0], Y0, R[i + 1][1]], 1);
    quadUp(part, 'slab', [l2[i][0], Y0 + .03, l2[i][1]], [r2[i][0], Y0 + .03, r2[i][1]], [l2[i + 1][0], Y0 + .03, l2[i + 1][1]], [r2[i + 1][0], Y0 + .03, r2[i + 1][1]], rr(1.04, 1.12)); }
  stoneEdge(part, L, false); stoneEdge(part, R, false);
}
// 单孔石拱桥：沿 ang 方向，半长 L、宽 W、拱半径 R
function archSpan(part, cx, cz, ang, L, W, R, yc, rise) {
  const top = s => Y0 + rise * Math.pow(Math.cos(PI * s / (2 * L)), 2), sh = new THREE.Shape(); sh.moveTo(-L, -2.3); sh.lineTo(-L, Y0); for (let i = 1; i <= 36; i++) { const s = -L + 2 * L * i / 36; sh.lineTo(s, top(s)); } sh.lineTo(L, -2.3); sh.closePath();
  const hp = new THREE.Path(); hp.moveTo(-R, -2.2); hp.lineTo(-R, yc); hp.absarc(0, yc, R, PI, 0, true); hp.lineTo(R, -2.2); hp.closePath(); sh.holes.push(hp);
  const dx = Math.cos(ang), dz = Math.sin(ang), px = -dz, pz = dx;
  B.add(part, 'stone', new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false, curveSegments: 24 }), TM(cx - px * W / 2, 0, cz - pz * W / 2, -ang), .92);
  const P = (s, o, y) => [cx + dx * s + px * o, y, cz + dz * s + pz * o];
  // 券洞内壁：沿拱券补一层双面的石面，从任何角度望进桥洞都是实心的拱，不会透出对面的券脸石
  { const pos = [], NA = 30, rg = [[-R + .02, -2.2]]; for (let i = 0; i <= NA; i++) { const a = PI - PI * i / NA; rg.push([Math.cos(a) * (R - .02), yc + Math.sin(a) * (R - .02)]); } rg.push([R - .02, -2.2]);
    for (let i = 0; i < rg.length - 1; i++) { const a = P(rg[i][0], -W / 2, rg[i][1]), b = P(rg[i][0], W / 2, rg[i][1]), c = P(rg[i + 1][0], -W / 2, rg[i + 1][1]), d = P(rg[i + 1][0], W / 2, rg[i + 1][1]); pos.push(...a, ...b, ...c, ...b, ...d, ...c, ...a, ...c, ...b, ...b, ...c, ...d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); B.add(part, 'stone', g, null, .74); }
  for (let i = 0; i < 22; i++) { const s0 = -L + 2 * L * i / 22, s1 = s0 + 2 * L / 22; B.seg(part, 'slab', P(s0, 0, top(s0) + .04), P(s1, 0, top(s1) + .04), W - .9, .1);
    [-1, 1].forEach(sd => B.seg(part, 'stone', P(s0, sd * (W / 2 - .14), top(s0) + .02), P(s1, sd * (W / 2 - .14), top(s1) + .02), .5, .16, rr(.92, 1.02))); }
  [-1, 1].forEach(sd => { const ln = []; for (let i = 0; i <= 8; i++) { const q = P(-L + .4 + (2 * L - .8) * i / 8, sd * (W / 2 - .3), 0); ln.push([q[0], q[2]]); } stoneRail(part, ln, p => top((p[0] - cx) * dx + (p[1] - cz) * dz) + .08, 2.4); });
  [-1, 1].forEach(sd => { for (let a = 12; a <= 168; a += 6.5) { const c = Math.cos(a * PI / 180), s = Math.sin(a * PI / 180); B.seg(part, 'stone', P((R + .07) * c, sd * (W / 2 + .03), yc + (R + .07) * s), P((R + .78) * c, sd * (W / 2 + .03), yc + (R + .78) * s), .1, .74, rr(.94, 1.1)); } });
}
// 攒尖亭：台基踏步、柱、额枋挂落、美人靠、攒尖瓦顶与宝顶
function pavLite(part, cx, cz, y, r, sides = 4, tiers = 1, rot = 0) {
  const pr = sides === 4 ? PI / 4 + rot : rot, ps = sides === 4 ? 4 : sides * 2;
  B.add(part, 'stone', new THREE.CylinderGeometry(r * 1.74, r * 1.8, .22, ps), TM(cx, y + .11, cz, pr), .86); B.add(part, 'stone', new THREE.CylinderGeometry(r * 1.55, r * 1.6, .5, ps), TM(cx, y + .25, cz, pr)); B.add(part, 'slab', new THREE.CylinderGeometry(r * 1.46, r * 1.46, .04, ps), TM(cx, y + .51, cz, pr), 1.08);
  const H = Math.max(3, r * .95), rc = r / Math.cos(PI / sides), col = [], cr = Math.max(.13, r * .045), yf = y + .5, yb = yf + H - .12;
  for (let i = 0; i < sides; i++) { const a = (i + .5) * TAU / sides + rot; col.push([cx + Math.sin(a) * rc, cz + Math.cos(a) * rc]); column(part, col[i][0], col[i][1], yf, yf + H, cr); }
  for (let i = 0; i < sides; i++) { const a = col[i], b = col[(i + 1) % sides], mx = (a[0] + b[0]) / 2 - cx, mz = (a[1] + b[1]) / 2 - cz, ml = Math.hypot(mx, mz) || 1;
    B.seg(part, 'woodDk', [a[0], yb, a[1]], [b[0], yb, b[1]], .2, .26); B.seg(part, 'wood', [a[0], yb - .3, a[1]], [b[0], yb - .3, b[1]], .12, .14, .9); guaLuo(part, a, b, yb - .38, .42);
    if (i === 0) { for (let k = 0; k < 3; k++) B.seg(part, 'stone', [a[0] + mx / ml * (.75 + k * .32), y + .42 - k * .16, a[1] + mz / ml * (.75 + k * .32)], [b[0] + mx / ml * (.75 + k * .32), y + .42 - k * .16, b[1] + mz / ml * (.75 + k * .32)], .34, .17, .95 - k * .03); }
    else meiRenKao(part, a, b, yf, mx / ml, mz / ml); }
  buildRoof(part, part, { sides, rTop: tiers > 1 ? r * .55 : .12, rEave: r * 1.55, h: tiers > 1 ? r * .42 : r * .8, sag: .18, lift: r * .26, flare: r * .1, cx, cy: y + .42 + H, cz, rot }, { sp: .44, nu: 9, nt: 7 });
  let ty = y + .42 + H + (tiers > 1 ? r * .42 : r * .8);
  if (tiers > 1) { B.add(part, 'wood', new THREE.CylinderGeometry(r * .5, r * .5, r * .32, sides), TM(cx, ty + r * .14, cz, pr)); B.add(part, 'lampGl', new THREE.CylinderGeometry(r * .505, r * .505, r * .16, sides), TM(cx, ty + r * .16, cz, pr)); buildRoof(part, part, { sides, rTop: .1, rEave: r * .95, h: r * .62, sag: .2, lift: r * .2, flare: r * .08, cx, cy: ty + r * .28, cz, rot }, { sp: .44, nu: 7, nt: 6 }); ty += r * .9; }
  B.add(part, 'ridge', lathe([[0, 0], [.3, 0], [.32, .1], [.16, .22], [.26, .4], [.2, .6], [.06, .76], [0, .95]], 12), TM(cx, ty - .05, cz, 0, r * .28, r * .3, r * .28), 1.4);
  addGlow(cx, y + H * .8, cz, 0xffb968, r * 1.3);
}
// 殿堂：须弥台基与踏步、前后檐廊、槅扇门、槛窗、额枋雀替、檐下斗栱、四坡瓦顶、正脊鸱吻、匾额与灯笼
function hallLite(part, cx, cz, y, hx, hz, rot = 0, wall = 'plaster', h = 3.6, roof = null, tiers = 1, lod = 1) {
  const c = Math.cos(rot), s = Math.sin(rot), W = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c], P = (lx, ly, lz) => { const p = W(lx, lz); return [p[0], y + ly, p[1]]; };
  const bx = (mat, lx, ly, lz, sx, sy, sz, tint) => { const p = W(lx, lz); B.box(part, mat, p[0], y + ly, p[1], sx, sy, sz, rot, tint); }, yf = .5, yt = yf + h, vz = hz + .9;
  bx('stone', 0, .09, 0, hx * 2 + 3.5, .18, hz * 2 + 3.5, .84); bx('stone', 0, .25, 0, hx * 2 + 2.8, .5, hz * 2 + 2.8, .97); bx('stone', 0, .47, 0, hx * 2 + 3, .07, hz * 2 + 3, 1.05); bx('slab', 0, .515, 0, hx * 2 + 2.5, .04, hz * 2 + 2.5, 1.08);
  for (const sz of [-1, 1]) for (let k = 0; k < 3; k++) { bx('stone', 0, .42 - k * .16, sz * (hz + 1.55 + k * .32), Math.min(hx * .9, 4.6), .17, .34, .96 - k * .03); if (!k) [-1, 1].forEach(e => bx('stone', e * (Math.min(hx * .9, 4.6) / 2 + .16), .3, sz * (hz + 1.86), .26, .46, 1.0, .9)); }
  bx(wall, 0, yf + h / 2, 0, hx * 2, h, hz * 2, 1); bx('stone', 0, yf + .2, 0, hx * 2 + .06, .4, hz * 2 + .06, .9);
  const n = Math.max(3, Math.round(hx * 2 / 3) | 1), bw = hx * 2 / n, mid = (n - 1) / 2;
  for (const sz of [-1, 1]) {
    for (let i = 0; i <= n; i++) { const lx = -hx + i * bw; const p = W(lx, sz * vz); column(part, p[0], p[1], y + yf, y + yt, .16);
      if (i < n) { B.seg(part, 'woodDk', P(lx + .16, yt - .52, sz * vz), P(lx + .7, yt - .3, sz * vz), .07, .07); B.seg(part, 'woodDk', P(lx + bw - .16, yt - .52, sz * vz), P(lx + bw - .7, yt - .3, sz * vz), .07, .07); } }
    B.seg(part, 'woodDk', P(-hx - .2, yt - .1, sz * vz), P(hx + .2, yt - .1, sz * vz), .22, .28); B.seg(part, 'wood', P(-hx, yt - .38, sz * vz), P(hx, yt - .38, sz * vz), .13, .16, .9);
    if (lod) for (let lx = -hx; lx <= hx + .01; lx += bw / 3) { bx('woodDk', lx, yt + .1, sz * (vz + .22), .16, .12, .6, .9); bx('wood', lx, yt + .2, sz * (vz + .34), .34, .1, .14, .85); }       // 斗栱
    const zf = sz * (hz + .03), y0 = yf + .05, hd = h * .76;
    for (let i = 0; i < n; i++) { const l0 = -hx + i * bw + .2, l1 = l0 + bw - .4;
      if (i === mid) { const nl = 4, lw = (l1 - l0) / nl;                              // 明间四扇槅扇门
        for (let k = 0; k < nl; k++) { const a = l0 + k * lw + .03, b = a + lw - .06, m = (a + b) / 2;
          bx('wood', m, y0 + hd * .19, zf, b - a, hd * .38, .07, .92); bx('lampGl', m, y0 + hd * .69, zf, b - a - .1, hd * .56, .03, 1); bx('woodDk', m, y0 + hd * .4, zf + sz * .01, b - a, .07, .08); bx('woodDk', m, y0 + hd * .98, zf, b - a, .07, .08);
          [a, b].forEach(e => bx('woodDk', e, y0 + hd / 2, zf + sz * .01, .06, hd, .08)); if (lod) { for (let q = 1; q < 3; q++) bx('woodDk', lerp(a, b, q / 3), y0 + hd * .69, zf + sz * .025, .03, hd * .56, .03); for (let q = 1; q < 5; q++) bx('woodDk', m, y0 + hd * (.41 + q * .112), zf + sz * .025, b - a - .1, .03, .03); } }
        bx('plaque', 0, yt - .78, sz * (hz + .12), Math.min(2.4, bw * .6), .62, .08, 1); bx('gold', 0, yt - .78, sz * (hz + .17), Math.min(2.4, bw * .6) * .7, .26, .02, 1);
        [-1, 1].forEach(e => { const p = W(e * (bw / 2 - .1), sz * (vz - .28)); lantern(part, p[0], y + yt - 1.15, p[1], false); }); }
      else { const m = (l0 + l1) / 2, ys = yf + h * .3, hw = h * .44;                                                        // 次间槛墙 + 槛窗
        bx('lampGl', m, ys + hw / 2, zf, l1 - l0 - .1, hw, .03, 1); [[m, ys, l1 - l0, .09], [m, ys + hw, l1 - l0, .09]].forEach(q => bx('woodDk', q[0], q[1], zf + sz * .02, q[2], q[3], .09)); [l0, l1].forEach(e => bx('woodDk', e, ys + hw / 2, zf + sz * .02, .08, hw, .09));
        const nv = Math.max(3, Math.round((l1 - l0) / (lod ? .34 : .8))); for (let q = 1; q < nv; q++) bx('woodDk', lerp(l0, l1, q / nv), ys + hw / 2, zf + sz * .035, .03, hw, .03); for (let q = 1; q < 4; q++) bx('woodDk', m, ys + hw * q / 4, zf + sz * .035, l1 - l0, .03, .03); }
      bx('woodDk', -hx + (i + .5) * bw, yf + hd + .16, zf, bw - .3, .1, .08); }
  }
  for (const sx of [-1, 1]) { [-hz, hz].forEach(lz => { const p = W(sx * hx, lz); column(part, p[0], p[1], y + yf, y + yt, .15); }); bx('woodDk', sx * (hx + .03), yt - .12, 0, .1, .22, hz * 2); bx('woodDk', sx * (hx + .03), yf + h * .52, 0, .08, .1, hz * 2);
    const ww = Math.min(1.5, hz * .7); bx('lampGl', sx * (hx + .02), yf + h * .7, 0, .03, ww * .7, ww, 1); for (let q = 0; q <= 4; q++) bx('woodDk', sx * (hx + .04), yf + h * .7, -ww / 2 + q * ww / 4, .04, ww * .7, q % 4 ? .03 : .07); for (let q = 0; q <= 2; q++) bx('woodDk', sx * (hx + .04), yf + h * .7 - ww * .35 + q * ww * .35, 0, .04, q % 2 ? .03 : .07, ww); }
  const o = { rect: 1, x0: hx * .5, z0: .15, x1: hx + 2.1, z1: hz + 2.1, h: h * .52, sag: .17, lift: .75, flare: .32, cx, cy: y + .46 + h, cz, rot };
  buildRoof(part, part, o, lod ? { sp: .46, nu: 9, nt: 5 } : { sp: 1.2, nu: 6, nt: 4 }); let ty = .46 + h + h * .52;
  if (tiers > 1) { bx(wall, 0, ty + h * .16, 0, hx * 1.05, h * .5, hz * 1.05, 1); for (const sz of [-1, 1]) { bx('lampGl', 0, ty + h * .2, sz * (hz * .525 + .02), hx * .9, h * .2, .03, 1); for (let q = 0; q <= 8; q++) bx('woodDk', -hx * .45 + q * hx * .9 / 8, ty + h * .2, sz * (hz * .525 + .04), q % 8 ? .04 : .1, h * .22, .04); }
    buildRoof(part, part, { rect: 1, x0: hx * .3, z0: .12, x1: hx * .52 + 1.6, z1: hz * .52 + 1.6, h: h * .45, sag: .18, lift: .65, flare: .28, cx, cy: y + ty + h * .38, cz, rot }, lod ? { sp: .46, nu: 8, nt: 5 } : { sp: 1.2, nu: 6, nt: 4 }); ty += h * .83; o.x0 = hx * .3; }
  B.seg(part, 'ridge', P(-o.x0 - .25, ty + .14, 0), P(o.x0 + .25, ty + .14, 0), .28, .4, .95); B.seg(part, 'ridge', P(-o.x0 - .3, ty + .38, 0), P(o.x0 + .3, ty + .38, 0), .14, .1, 1.15);
  [-1, 1].forEach(e => { const x0 = e * (o.x0 + .2); B.seg(part, 'ridge', P(x0, ty + .2, 0), P(x0 + e * .32, ty + .72, 0), .2, .3, 1); B.seg(part, 'ridge', P(x0 + e * .32, ty + .72, 0), P(x0 + e * .06, ty + 1.02, 0), .14, .2, 1.1); });
  { const p = W(0, 0); B.add(part, 'ridge', lathe([[0, 0], [.22, 0], [.24, .1], [.1, .2], [.2, .36], [.14, .52], [.04, .62], [0, .74]], 10), TM(p[0], y + ty + .4, p[1]), 1.3); }
  const g = W(0, hz + 2.2); addGlow(g[0], y + 2.6, g[1], 0xffb968, 3.4);
}
const mound = (x, z, cx, cz, rx, rz, h) => { const d = 1 - Math.pow((x - cx) / rx, 2) - Math.pow((z - cz) / rz, 2); return d > 0 ? h * Math.sqrt(d) : 0; };

function buildLake() {
  // —— 白堤、锦带桥、断桥 ——
  const bai = [[-184, -561], [-150, -571], [-110, -585], [-70, -603], [-30, -622], [5, -638], [40, -653]], baiBr = [2, 5];
  let run = []; bai.forEach((p, i) => { if (baiBr.includes(i)) { const q = bai[i - 1], n = bai[i + 1], l0 = Math.hypot(p[0] - q[0], p[1] - q[1]), l1 = Math.hypot(n[0] - p[0], n[1] - p[1]); run.push([lerp(p[0], q[0], 23 / l0), lerp(p[1], q[1], 23 / l0)]); causeway('bai', run, 15); run = [[lerp(p[0], n[0], 23 / l1), lerp(p[1], n[1], 23 / l1)]]; archSpan('bai', p[0], p[1], Math.atan2(n[1] - q[1], n[0] - q[0]), 24, 14, 8, -1.6, i === 5 ? 6.4 : 5.2); } else run.push(p); }); causeway('bai', run, 15);
  for (let i = 0; i < bai.length - 1; i++) { const a = bai[i], b = bai[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / l, nz = (b[0] - a[0]) / l; let k = 0;
    for (let s = 5; s < l; s += 8.5, k++) { const x = lerp(a[0], b[0], s / l), z = lerp(a[1], b[1], s / l); if (baiBr.some(j => Math.hypot(x - bai[j][0], z - bai[j][1]) < 27)) continue; [-5.6, 5.6].forEach((o, j) => (k + j) % 2 ? tree('peach', x + nx * o, z + nz * o, 'bai', 1.05) : willowLite('bai', x + nx * o, z + nz * o, .95)); if (k % 3 === 0) lampPost('bai', x + nx * 2.9, Y0, z + nz * 2.9); } }
  pavLite('bai', 49, -648, Y0, 3.4, 4, 1, .4);                                   // 断桥东堍的碑亭
  // —— 孤山：湖中最大的岛，山不高而清幽 ——
  const G = { x: -330, z: -560, rx: 150, rz: 46 }; isle('gushan', ringPts(G.x, G.z, G.rx, G.rz, 56, .16, 3));
  const gh = hillField('gushan', 'hill1', -345, -568, 122, 33, 24, 2, 96, 30, Y0, 1.05, .8);
  for (let i = 0; i < 230; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * .97, x = -345 + Math.cos(a) * r * 116, z = -568 + Math.sin(a) * r * 30, K = ['camphor', 'plane', 'camphor', 'ginkgo', 'maple', 'camphor'][i % 6]; if (z > -568 || i % 3 === 0) treeLite(K, x, z, rr(.8, 1.15), 'gushan', gh(x, z) - 1.2, 11); else treeFar('gushan', K, x, gh(x, z) - 1.5, z, rr(.85, 1.2)); }
  for (let i = 0; i < 22; i++) { const a = rnd() * TAU, r = rr(.55, .98), x = -345 + Math.cos(a) * r * 116, z = -566 + Math.sin(a) * r * 29, q = rr(1.2, 2.6); blob('gushan', 'rock', x, gh(x, z) + q * .25, z, q, q * rr(.5, .8), q * rr(.7, 1.1), rr(.85, 1.05), 0, 1); }
  for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; willowLite('gushan', G.x + Math.cos(a) * (G.rx - 6), G.z + Math.sin(a) * (G.rz - 5), 1); }
  [[-262, -596], [-250, -590], [-272, -590], [-244, -598], [-280, -598], [-258, -584]].forEach(p => tree('plum', p[0], p[1], 'gushan', 1.2));   // 放鹤亭畔的梅林
  hallLite('gushan', -300, -522, Y0, 9, 4.6, 0, 'plaster', 4.2, null, 2); hallLite('gushan', -352, -520, Y0, 7, 4, .05); hallLite('gushan', -404, -524, Y0, 8, 4.2, -.06, 'plaster', 3.8);
  pavLite('gushan', -256, -596, Y0, 3.2, 4, 1, 0); pavLite('gushan', -440, -556, gh(-440, -556), 2.8, 6, 1);
  // 平湖秋月：孤山东南角伸入湖中的平台
  B.box('gushan', 'stone', -176, -.9, -548, 26, 2.9, 15, .12, .86); for (let i = 0; i < 12; i++) for (let j = 0; j < 7; j++) { const lx = -11.8 + i * 2.15, lz = -6.4 + j * 2.13; B.box('gushan', 'slab', -176 + lx * Math.cos(.12) + lz * Math.sin(.12), Y0 + .02, -548 - lx * Math.sin(.12) + lz * Math.cos(.12), 2.1, .1, 2.08, .12); }
  hallLite('gushan', -180, -552, Y0, 6.5, 3.4, .12, 'plaster', 3.6); pavLite('gushan', -164, -543, Y0, 2.6, 4, 1, .12);
  // 西泠桥：孤山西端连到苏堤北头
  { const w = [[-478, -565], [-520, -577], [-548, -585], [-586, -598]], m = w[1], q = w[0], n = w[2]; causeway('gushan', [q, [lerp(m[0], q[0], .5), lerp(m[1], q[1], .5)]], 12); archSpan('gushan', m[0], m[1], Math.atan2(n[1] - q[1], n[0] - q[0]), 21, 11, 7, -1.4, 5); causeway('gushan', [[lerp(m[0], n[0], .75), lerp(m[1], n[1], .75)], n, w[3]], 12); }
  // —— 小瀛洲：湖中有岛，岛中有湖 ——
  const X = { x: -215, z: 42 }, arc = (r, a0, a1, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([X.x + Math.cos(a) * r, X.z + Math.sin(a) * r]); } return o; };
  const half = (a0, a1) => arc(37, a0, a1, 18).concat(arc(11, a1, a0, 10));
  isle('xiaoying', ringPts(X.x, X.z, 50, 50, 48, .05, 9), [half(.11, PI - .11), half(PI + .11, TAU - .11)]);
  for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; (i % 3 ? willowLite : (p, x, z) => treeLite(i % 2 ? 'camphor' : 'maple', x, z, .62, p, Y0, 8))('xiaoying', X.x + Math.cos(a) * 44, X.z + Math.sin(a) * 44, .95); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5; treeLite('camphor', X.x + Math.cos(a) * 6, X.z + Math.sin(a) * 6, .55, 'xiaoying', Y0, 8); }
  hallLite('xiaoying', X.x, X.z, Y0, 5.5, 3.2, 0, 'plaster', 3.4);
  [[-1, 1], [1, 1]].forEach(d => { const zz = [[0, 11], [3, 17], [-3, 23], [3, 29], [0, 36.5]].map(p => [X.x + p[0], X.z + d[0] * p[1]]); for (let i = 0; i < zz.length - 1; i++) { B.seg('xiaoying', 'slab', [zz[i][0], Y0 + .02, zz[i][1]], [zz[i + 1][0], Y0 + .02, zz[i + 1][1]], 2.4, .16); [-1, 1].forEach(sd => B.seg('xiaoying', 'stone', [zz[i][0] + sd * 1.1, Y0 + .4, zz[i][1]], [zz[i + 1][0] + sd * 1.1, Y0 + .4, zz[i + 1][1]], .14, .5)); B.box('xiaoying', 'stone', zz[i + 1][0], -.9, zz[i + 1][1], .5, 2.9, .5, 0, .8); } });
  pavLite('xiaoying', X.x + 3, X.z - 20, Y0, 2.2, 3, 1, .3); pavLite('xiaoying', X.x, X.z + 46, Y0, 2.6, 4, 1, 0); pavLite('xiaoying', X.x - 44, X.z, Y0, 2.4, 6, 1);
  // —— 湖心亭、阮公墩 ——
  isle('huxin', ringPts(-300, -230, 30, 26, 30, .08, 5)); hallLite('huxin', -300, -231, Y0, 7, 4.4, 0, 'plaster', 4, null, 2); pavLite('huxin', -318, -224, Y0, 2.2, 4, 1, .3);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; (i % 2 ? willowLite('huxin', -300 + Math.cos(a) * 25, -230 + Math.sin(a) * 21, .9) : treeLite('camphor', -300 + Math.cos(a) * 23, -230 + Math.sin(a) * 19, .55, 'huxin', Y0, 8)); }
  isle('huxin', ringPts(-410, -110, 22, 20, 24, .1, 7)); for (let i = 0; i < 14; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 17; treeLite(i % 3 ? 'camphor' : 'ginkgo', -410 + Math.cos(a) * r, -110 + Math.sin(a) * r, .6, 'huxin', Y0, 8); } pavLite('huxin', -404, -98, Y0, 2, 6, 1);
  // —— 净慈寺：南屏山下，黄墙殿宇，晚钟所在 ——
  { const sh = FARPOS.southH(103), sr = sh[2] - 150 - 52, tx = Math.cos(sh[0]) * sr, tz = Math.sin(sh[0]) * sr, ty = 2.2; FARPOS.temple = [tx, tz]; B.box('temple', 'stone', tx, ty / 2 - .2, tz, 64, ty + .4, 74, 0, .88);
    hallLite('temple', tx, tz - 24, ty, 8, 4, 0, 'wallYel', 3.6); hallLite('temple', tx, tz, ty, 12, 6.5, 0, 'wallYel', 5.2, null, 2); hallLite('temple', tx, tz + 25, ty, 9, 4.6, 0, 'wallYel', 4);
    pavLite('temple', tx + 22, tz - 14, ty, 3.2, 4, 2, 0); pavLite('temple', tx - 22, tz - 14, ty, 3.2, 4, 2, 0);
    [[-30, -35, 30, -35], [-30, 35, 30, 35], [-30, -35, -30, 35], [30, -35, 30, 35]].forEach(w => { B.seg('temple', 'wallYel', [tx + w[0], ty + 1.5, tz + w[1]], [tx + w[2], ty + 1.5, tz + w[3]], .4, 3, 1); B.seg('temple', 'tile', [tx + w[0], ty + 3.1, tz + w[1]], [tx + w[2], ty + 3.1, tz + w[3]], .9, .22, .9); });
    for (let i = 0; i < 12; i++) treeLite(i % 2 ? 'camphor' : 'ginkgo', tx + (i % 2 ? -1 : 1) * rr(8, 26), tz + rr(-30, 30), .7, 'temple', ty, 9);
    addGlow(tx, ty + 9, tz, 0xffb24a, 34); }
  // —— 北山街：北岸山脚的一排老房子 ——
  for (let i = 0; i < 13; i++) { const nh = FARPOS.northH(246 + i * 3.3), a = nh[0], R = nh[2] - 190 - 50 + (i % 2) * 12, x = Math.cos(a) * R, z = Math.sin(a) * R, rot = Math.atan2(x, -z) + PI / 2; B.box('north', 'stone', x, .9, z, 22, 2.6, 16, rot, .88); hallLite('north', x, z, 2.2, rr(5.5, 8), rr(3.4, 4.4), rot, 'plaster', rr(3.4, 5.6), null, i % 4 === 1 ? 2 : 1, 0); treeLite(i % 2 ? 'plane' : 'camphor', x + Math.cos(a + .02) * 14, z + Math.sin(a + .02) * 14, .8, 'north', 2.2, 9); }
  // —— 城东天际线：近低远高，入夜亮窗 ——
  { const cr = mulberry(77), face = (lit) => canvasTex(128, 128, (c, w, h) => { c.fillStyle = lit ? '#000' : '#cfd2d0'; c.fillRect(0, 0, w, h);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = i * 32 + 5, y2 = j * 32 + 8; if (lit) { if (cr() < .38) { c.fillStyle = cr() < .7 ? '#ffd9a0' : '#d4e6ff'; c.fillRect(x, y2, 22, 17); } } else { const g = c.createLinearGradient(0, y2, 0, y2 + 17); g.addColorStop(0, '#6f8598'); g.addColorStop(1, '#93a7b6'); c.fillStyle = g; c.fillRect(x, y2, 22, 17); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 10, y2, 1.5, 17); c.fillStyle = 'rgba(60,66,70,.35)'; c.fillRect(0, j * 32 + 28, w, 2); } } }, true);
    const day = face(0), lit = face(1), bg = new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0), uv = bg.attributes.uv, nm = bg.attributes.normal; for (let i = 0; i < uv.count; i++) if (Math.abs(nm.getY(i)) > .5) uv.setXY(i, 0, 0);
    const cm = new THREE.MeshLambertMaterial({ map: day, emissiveMap: lit, emissive: 0xffffff, emissiveIntensity: 0 });
    cm.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_INSTANCING\nvUv=uv*vec2(max(1.,floor((abs(normal.x)>.5?length(instanceMatrix[2].xyz):length(instanceMatrix[0].xyz))/14.)),max(1.,floor(length(instanceMatrix[1].xyz)/13.)));\n#endif'); };
    const n = 520, im = new THREE.InstancedMesh(bg, cm, n); let k = 0; const put = (x, y2, z, ry, w, h, d, v, warm) => { if (k >= n) return; im.setMatrixAt(k, _lm.compose(_p.set(x, y2, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(w, h, d))); im.setColorAt(k, _lc.setRGB(v * (1 + warm * .06), v, v * (1 - warm * .08))); k++; };
    for (let i = 0; i < 230; i++) { const x = rr(330, 1500), z = rr(-1000, 1000), far = (x - 330) / 1170, tall = rnd() < .3, h = rr(14, 30) + far * rr(10, 110) * (tall ? 1.6 : .7), w = rr(18, 42), d = w * rr(.7, 1.3), ry = rr(-.2, .2), v = rr(.78, 1), warm = rr(-1, 1);
      put(x, Y0, z, ry, w, h, d, v, warm); put(x, Y0 + h, z, ry, w * .3, rr(3, 6), d * .4, v * .8, warm);
      if (h > 48) { put(x, Y0 + h, z, ry, w * .72, h * rr(.12, .3), d * .72, v * 1.02, warm); put(x, Y0, z, ry, w * 1.5, rr(9, 15), d * 1.35, v * .92, warm); } }
    im.count = k; im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; world.add(im); regMesh(im, 'city', null); WL.nightHooks.push(nt => cm.emissiveIntensity = nt * .95); }
  // —— 湖上游船：摇橹船慢行，画舫两艘 ——
  [[-150, -120, 60, 90, .2, .028], [-330, 40, 70, 50, 2.1, -.03], [-250, -330, 80, 60, 4, .024], [-420, 230, 50, 90, 1, -.026], [-130, 250, 60, 70, 3, .03], [-90, -330, 40, 70, 5.2, -.032], [-360, -400, 60, 40, .7, .028]].forEach(L => { buildBoat(0, 0, 0).loop = L; });
  [[-260, -90, 150, 190, .9, .013], [-300, 180, 130, 120, 3.6, -.015]].forEach(L => { const b = buildBoat(0, 0, 0, 2.7); b.loop = L; b.sc = 2.7; });
}
