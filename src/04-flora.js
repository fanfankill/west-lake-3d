// ───────── 04 flora：草木、荷花、锦鲤、游船、远景 ─────────
const _up = new V3(0, 1, 0), _d = new V3();
function limb(part, a, b, r0, r1, mat = 'bark') {
  _d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const l = _d.length(); _d.normalize(); _q.setFromUnitVectors(_up, _d);
  _m.compose(_p.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), _q, _s.set(1, 1, 1));
  B.add(part, mat, new THREE.CylinderGeometry(r1, r0, l, 6, 1, true), _m.clone());
}
const ICO = [new THREE.IcosahedronGeometry(1, 0), new THREE.IcosahedronGeometry(1, 1), new THREE.IcosahedronGeometry(1, 2)];
function blob(part, mat, cx, cy, cz, rx, ry, rz, tint = 1, sw = .25, det = 1, anchorY) {
  const src = ICO[det].attributes.position, n = src.count, P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), W = new Float32Array(n * 4);
  const ay = anchorY == null ? cy - ry * .7 : anchorY;
  for (let i = 0; i < n; i++) {
    const X = src.getX(i), Y = src.getY(i), Z = src.getZ(i), k = .74 + fbm(X * 1.8 + cx * .7, Z * 1.8 + Y * 1.4 + cz * .7, 2) * .56;
    P[i * 3] = cx + X * rx * k; P[i * 3 + 1] = cy + Y * ry * k; P[i * 3 + 2] = cz + Z * rz * k;
    N[i * 3] = X * .8; N[i * 3 + 1] = Y * .8 + .45; N[i * 3 + 2] = Z * .8; const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]); N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l;
    const sh = (.72 + .34 * (Y * .5 + .5)) * (.93 + .14 * vnoise(X * 4 + cx, Z * 4 + cz)); C[i * 3] = sh; C[i * 3 + 1] = sh; C[i * 3 + 2] = sh * .96;
    W[i * 4] = cx; W[i * 4 + 1] = ay; W[i * 4 + 2] = cz; W[i * 4 + 3] = sw * (.4 + .6 * (Y * .5 + .5));
  }
  B._push(B._bk(part, mat), P, N, null, tint, W, C);
}
// 叶簇：一片片带叶形贴图的面片贴在树冠椭球面上，冬季随 uLeaf 收回枝头
function leaves(part, mat, cx, cy, cz, rx, ry, rz, count, size, tint = 1, sway = .3, ax, ay, az, narrow = 1, lum = 0) {
  const bk = B._bk(part, mat, true); if (!bk.w) bk.w = []; if (ax == null) { ax = cx; ay = cy - ry * .6; az = cz; }
  for (let i = 0; i < count; i++) {
    let dx = rnd() * 2 - 1, dy = rnd() * 1.5 - .5, dz = rnd() * 2 - 1; const dl = Math.hypot(dx, dy, dz) || 1; dx /= dl; dy /= dl; dz /= dl;
    const r = rr(.6, 1.02), px = cx + dx * rx * r, py = cy + dy * ry * r, pz = cz + dz * rz * r, s = size * rr(.75, 1.25);
    let nx = dx * .8 + rr(-.25, .25), ny = dy * .5 + .55, nz = dz * .8 + rr(-.25, .25); const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
    let ux = ny * rr(-1, 1) - nz * rr(-1, 1), uy = nz * rr(-1, 1) - nx * rr(-1, 1), uz = nx * rr(-1, 1) - ny * rr(-1, 1); const d = ux * nx + uy * ny + uz * nz; ux -= nx * d; uy -= ny * d; uz -= nz * d; const u2 = Math.hypot(ux, uy, uz) || 1; ux = ux / u2 * s; uy = uy / u2 * s; uz = uz / u2 * s;
    const vx = (ny * uz - nz * uy) * narrow, vy = (nz * ux - nx * uz) * narrow, vz = (nx * uy - ny * ux) * narrow;
    const sh = lerp((.55 + .55 * (dy * .5 + .5)) * (.55 + .45 * r), 1.08, lum) * rr(.9, 1.1) * tint * 1.12, cr = sh * rr(.95, 1.05), cb = sh * rr(.88, 1.0), w = sway * rr(.5, 1);
    const V = [[px - ux - vx, py - uy - vy, pz - uz - vz, 0, 0], [px + ux - vx, py + uy - vy, pz + uz - vz, 1, 0], [px + ux + vx, py + uy + vy, pz + uz + vz, 1, 1], [px - ux + vx, py - uy + vy, pz - uz + vz, 0, 1]];
    for (const k of [0, 1, 2, 0, 2, 3]) { const q = V[k]; bk.p.push(q[0], q[1], q[2]); bk.n.push(nx, ny, nz); bk.c.push(cr, sh, cb); bk.w.push(ax, ay, az, w); bk.uv.push(q[3], q[4]); }
  }
}
const TREE = {
  plane:   { H: [11, 14], R: [4.6, 5.6], ry: .62, n: 8, s: 1.0, c: 20 }, camphor: { H: [10, 13], R: [5, 6.2], ry: .6, n: 10, s: .95, c: 22 },
  ginkgo:  { H: [11, 14], R: [3, 3.6], ry: 1.0, n: 8, s: .78, c: 22 },  maple:   { H: [5.5, 7], R: [3, 3.6], ry: .42, n: 8, s: .7, c: 20 },
  peach:   { H: [3.3, 4.1], R: [1.9, 2.4], ry: .6, n: 7, s: .5, c: 14, lum: .5 }, plum:    { H: [3, 3.7], R: [1.7, 2.1], ry: .55, n: 7, s: .36, c: 9, lum: .5 },
};
function tree(kind, x, z, part, k = 1) {
  const T = TREE[kind], H = rr(T.H[0], T.H[1]) * k, R = rr(T.R[0], T.R[1]) * k, th = H * rr(.36, .46), lx = rr(-.3, .3), lz = rr(-.3, .3), top = [x + lx, Y0 + th, z + lz], tint = rr(.9, 1.1), a0 = rnd() * TAU;
  limb(part, [x, Y0 - .1, z], top, R * .05 + .1, R * .032 + .06);
  const cy = Y0 + th + (H - th) * .52, n = T.n, small = kind === 'peach' || kind === 'plum';
  for (let i = 0; i < n - 2; i++) {
    const a = a0 + i * TAU / (n - 2) + rr(-.25, .25), o = R * rr(.5, .7), tip = [top[0] + Math.cos(a) * o, cy + rr(-.25, .3) * R * T.ry, top[2] + Math.sin(a) * o];
    limb(part, top, tip, R * .03 + .05, .035);
    for (let j = 0; j < 3; j++) { const a2 = a + rr(-1, 1), e = [tip[0] + Math.cos(a2) * R * .32, tip[1] + rr(.1, .7) * R * .42, tip[2] + Math.sin(a2) * R * .32], f = rr(.45, .8); limb(part, [lerp(top[0], tip[0], f), lerp(top[1], tip[1], f), lerp(top[2], tip[2], f)], e, .035, .012); }
    const br = R * rr(.46, .58); if (!small) blob(part, kind, tip[0], tip[1] + R * .08, tip[2], br * .62, br * T.ry * .85, br * .62, tint * .5, .2, 0, tip[1]);
    leaves(part, kind, tip[0], tip[1] + R * .12, tip[2], br, br * Math.max(T.ry, .6) * 1.05, br, T.c, T.s * k, tint * rr(.93, 1.07), .34, tip[0], tip[1], tip[2], 1, T.lum || 0);
  }
  const tp = [top[0] + lx * .5, Y0 + H * .86, top[2] + lz * .5]; limb(part, top, tp, R * .03 + .05, .03);
  if (!small) blob(part, kind, tp[0], cy + R * T.ry * .2, tp[2], R * .5, R * T.ry * .6, R * .5, tint * .5, .2, 1, tp[1] - R * .3);
  leaves(part, kind, tp[0], cy + R * T.ry * .3, tp[2], R * .7, R * T.ry * .82, R * .7, T.c * 1.5 | 0, T.s * k, tint, .34, tp[0], tp[1] - R * .2, tp[2], 1, T.lum || 0);
  leaves(part, kind, tp[0] + rr(-.4, .4), cy + R * T.ry * .82, tp[2] + rr(-.4, .4), R * .45, R * T.ry * .5, R * .45, T.c * .8 | 0, T.s * k, tint * 1.08, .4, tp[0], tp[1], tp[2], 1, T.lum || 0);
}
function willow(x, z, k = 1) {
  const H = rr(6.6, 8) * k, lean = rr(.5, 1.3), a0 = rnd() * TAU, top = [x - lean, Y0 + H * .52, z + rr(-.4, .4)];
  limb('willow', [x, Y0 - .1, z], [x - lean * .4, Y0 + H * .28, z], .3, .22, 'bark'); limb('willow', [x - lean * .4, Y0 + H * .28, z], top, .22, .15, 'bark');
  const tips = [], nb = 8;
  for (let i = 0; i < nb; i++) {
    const a = a0 + i * TAU / nb + rr(-.3, .3), o = rr(2.4, 3.7) * k, mid = [top[0] + Math.cos(a) * o * .5, top[1] + H * .3, top[2] + Math.sin(a) * o * .5], tip = [top[0] + Math.cos(a) * o, top[1] + H * rr(.3, .44), top[2] + Math.sin(a) * o];
    limb('willow', top, mid, .12, .07, 'bark'); limb('willow', mid, tip, .07, .03, 'bark'); tips.push([mid, tip, a]);
    leaves('willow', 'willow', lerp(mid[0], tip[0], .6), tip[1] + .2, lerp(mid[2], tip[2], .6), 1.5 * k, .6, 1.5 * k, 9, .8, rr(.95, 1.08), .2, 0, 99999, 0);
  }
  leaves('willow', 'willow', top[0], top[1] + H * .46, top[2], 2.2 * k, .9, 2.2 * k, 16, .85, 1.06, .2, 0, 99999, 0);
  // 垂条：带柳叶贴图的细长面片
  const bk = B._bk('willow', 'willow', true), ns = 150; if (!bk.w) bk.w = [];
  for (let s = 0; s < ns; s++) {
    const t = tips[s % nb], f = rr(.2, 1.12), bx = lerp(t[0][0], t[1][0], f) + rr(-.6, .6), by = lerp(t[0][1], t[1][1], Math.min(f, 1)) + rr(-.1, .3), bz = lerp(t[0][2], t[1][2], f) + rr(-.6, .6);
    const len = Math.min(rr(2.6, 5.6) * k, by - Y0 - rr(.4, 1.4)), ph = rnd() * TAU, wx = Math.cos(ph) * .21, wz = Math.sin(ph) * .21, ox = Math.cos(t[2]) * .35, oz = Math.sin(t[2]) * .35, tint = rr(.85, 1.15), ng = 4, v0 = rnd();
    const pt = j => { const u = j / ng; return [bx + ox * Math.sin(u * 1.6), by - len * u, bz + oz * Math.sin(u * 1.6), Math.pow(u, 1.3) * len * .36, v0 + u * len / 1.25]; };
    for (let j = 0; j < ng; j++) {
      const a = pt(j), b = pt(j + 1), v = [[a[0] - wx, a[1], a[2] - wz, a[3], 0, a[4]], [a[0] + wx, a[1], a[2] + wz, a[3], 1, a[4]], [b[0] - wx, b[1], b[2] - wz, b[3], 0, b[4]], [b[0] + wx, b[1], b[2] + wz, b[3], 1, b[4]]];
      [0, 1, 2, 1, 3, 2].forEach(i => { const q = v[i]; bk.p.push(q[0], q[1], q[2]); bk.n.push(ox, .85, oz); const c = tint * (1 - j * .03); bk.c.push(c, c, c * .93); bk.w.push(q[0], q[1], q[2], q[3]); bk.uv.push(q[4], -q[5]); });
    }
  }
}
function shrub(kind, x, z, r, h) { const az = kind === 'azalea'; blob('shrubs', kind, x, Y0 + h * .5, z, r * .82, h * .5, r * .82, az ? rr(.8, .9) : rr(.62, .72), .05, 1, 99999); leaves('shrubs', kind, x, Y0 + h * .55, z, r, h * .62, r, 22, .3, rr(.9, 1.1), .08, 0, 99999, 0, 1, az ? .5 : 0); }
function treeLite(kind, x, z, k) { const H = rr(11, 15) * k, R = rr(4.5, 6) * k, tint = rr(.85, 1.08); limb('trees', [x, Y0, z], [x, Y0 + H * .5, z], .32, .18);
  for (let i = 0; i < 3; i++) { const ox = rr(-.35, .35) * R, oz = rr(-.35, .35) * R, cy = Y0 + H * (.55 + i * .13), r = R * (.78 - i * .14); blob('trees', kind, x + ox, cy, z + oz, r * .78, r * .68, r * .78, tint * .55, .15, 1, Y0 + H * .5); leaves('trees', kind, x + ox, cy + r * .1, z + oz, r, r * .8, r, 13, 1.7, tint, .3, x, Y0 + H * .5, z); } }
function bamboo(x, z, n, sp) { for (let i = 0; i < n; i++) { const bx = x + rr(-sp, sp), bz = z + rr(-sp, sp), h = rr(6, 9.5), lx = rr(-.7, .7), lz = rr(-.7, .7);
  limb('bamboo', [bx, Y0, bz], [bx + lx, Y0 + h, bz + lz], .045, .022, 'bamboo'); for (let j = 0; j < 4; j++) { const f = .45 + j * .16; leaves('bamboo', 'bamboo', bx + lx * f * f + rr(-.2, .2), Y0 + h * f, bz + lz * f * f + rr(-.2, .2), rr(.7, 1.1), rr(.5, .8), rr(.7, 1.1), 5, .78, rr(.9, 1.15), .5, 0, 99999, 0); } } }

function buildFlora() {
  for (let z = -195; z <= 197; z += 9.5) {
    const skip = Math.abs(z) < 7.5 || (z > -44 && z < -6) || (z > 35 && z < 53) || (z > 15.5 && z < 24.5);
    if (!skip) willow(bankX(z) + 1.7 + rr(-.2, .3), z + rr(-.8, .8), rr(.9, 1.12));
    const z2 = z + 4.75; if (!(Math.abs(z2) < 6 || (z2 > -43 && z2 < -6) || (z2 > 36 && z2 < 52) || (z2 > 16 && z2 < 24))) tree('peach', bankX(z2) + 2.7 + rr(-.3, .5), z2, 'peach');
  }
  willow(-1.4 + 4.2, 9.2, 1); willow(bankX(-48) + 1.6, -47, 1.05);
  const seq = ['plane', 'camphor', 'ginkgo', 'plane', 'maple', 'camphor', 'ginkgo', 'maple']; let si = 0;
  for (let z = -196; z <= 196; z += 9) { if (Math.abs(z) < 4.2 || (z > 36 && z < 52)) { si++; continue; } tree(seq[si++ % seq.length], pathX(z) + 4.1 + rr(-.4, .9), z + rr(-1, 1), 'trees'); }
  [[16, 10], [19, 15], [15, 18], [6.5, -44], [9, -48], [4, -50], [18, -15], [19.5, -22]].forEach(p => tree('plum', p[0], p[1], 'plum'));
  [[18, 24], [20, -32], [17, -46], [19, 62], [18, 84], [20, -60], [17.5, -84], [19, 104], [19, -108]].forEach((p, i) => tree(i % 2 ? 'maple' : 'ginkgo', p[0], p[1], 'trees', .9));
  for (let i = 0; i < 46; i++) { const x = rr(30, 80), z = rr(-190, 190); tree(['camphor', 'plane', 'ginkgo', 'camphor', 'maple'][i % 5], x, z, 'trees', rr(1.05, 1.35)); }
  for (let i = 0; i < 80; i++) { const x = rr(64, 135), z = rr(-215, 215); treeLite(['camphor', 'plane', 'camphor', 'ginkgo'][i % 4], x, z, rr(.95, 1.3)); }
  for (let i = 0; i < 170; i++) { const x = rr(125, 380), z = rr(-260, 260); blob('trees', 'farTree', x, Y0 + rr(7, 11), z, rr(6, 9), rr(7, 12), rr(6, 9), rr(.75, 1.05), 0, 1); }
  bamboo(28.5, 6.5, 26, 3.2); bamboo(28.5, -7, 26, 3.2); bamboo(29, 20, 18, 2.6); bamboo(29, -24, 18, 2.6);
  for (let z = -168; z <= 168; z += 14) { if ((z > 28 && z < 58) || Math.abs(z) < 6) continue; for (let i = 0; i < 3; i++) shrub('azalea', pathX(z) - 2.4 + rr(-.3, .3), z - 2.2 - i * 1.25, rr(.6, .8), rr(.55, .75)); }
  for (let z = -70; z <= 28; z += 5.2) { if (Math.abs(z) < 3) continue; shrub('shrub', 22.6 + rr(-.3, .2), z + rr(-.6, .6), rr(1, 1.4), rr(1.3, 1.9)); }
  [[8, 8.2], [9.6, 5.4], [10.3, 7.6], [20.6, -7.6], [19.2, -10.6], [12, 60], [11.5, 31]].forEach(p => shrub('shrub', p[0], p[1], rr(.6, 1), rr(.7, 1.1)));
}

// 荷花
const lotus = { leaves: [], leafM: null, stemM: null, flM: null, last: -1 };
function distBridge(x, z) { let d = 1e9; for (let i = 0; i < BR.length - 1; i++) { const a = BR[i], b = BR[i + 1], vx = b[0] - a[0], vz = b[1] - a[1], t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz), 0, 1); d = Math.min(d, Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t)); } return d; }
function buildLotus() {
  const regs = [[-20, -1, -18.5, -8.4, 150], [-20.5, 0.6, 2.4, 13.5, 170], [-9, -1, -33, -22.5, 70], [-30, -22.6, -1.5, 4.5, 40]], L = lotus.leaves;
  regs.forEach(r => { let tries = 0, got = 0; while (got < r[4] && tries++ < 4000) { const x = rr(r[0], r[1]), z = rr(r[2], r[3]); if (isLand(x - .9, z) || distBridge(x, z) < 1.75) continue; if (Math.abs(x - PAV.x) < 5.6 && Math.abs(z - PAV.z) < 5.6) continue;
    const rad = rr(.26, .5); if (L.some(q => Math.hypot(q.x - x, q.z - z) < (q.r + rad) * .75)) continue; L.push({ x, z, r: rad, h: Math.pow(rnd(), 1.6) * .85 + .04, rot: rnd() * TAU, tx: rr(-.22, .22), tz: rr(-.22, .22), fl: rnd() < .17, c: rr(.85, 1.12), s: rnd() }); got++; } });
  const lg = new THREE.CircleGeometry(1, 16), lp = lg.attributes.position; lg.rotateX(-PI / 2);
  for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), z = lp.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x); lp.setY(i, r * .16 + Math.sin(a * 5) * .045 * r - .1); } lg.computeVertexNormals();
  lotus.leafM = new THREE.InstancedMesh(lg, makeMat('lotus', { vertexColors: false }), L.length); lotus.leafM.receiveShadow = true;
  lotus.stemM = new THREE.InstancedMesh(new THREE.CylinderGeometry(.012, .016, 1, 5).translate(0, .5, 0), makeMat('lotus', { vertexColors: false }), L.length);
  const fb = new Builder();
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < (ring ? 6 : 9); i++) { const a = i * TAU / (ring ? 6 : 9) + ring * .4, tilt = ring ? .32 : .95; const g = new THREE.SphereGeometry(1, 5, 3), n = g.attributes.position.count, col = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const y = g.attributes.position.getY(k) * .5 + .5; col[k * 3] = 1; col[k * 3 + 1] = lerp(1.25, .86, y); col[k * 3 + 2] = lerp(1.2, .92, y); } g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new Matrix4().makeRotationY(a).multiply(new Matrix4().makeRotationZ(-tilt)).multiply(new Matrix4().makeTranslation(0, .13, 0)).multiply(new Matrix4().makeScale(.045, .14, .075)); fb.add('lotus', 'lotusFl', g, m, 1); }
  { const g = new THREE.CylinderGeometry(.045, .03, .05, 8), n = g.attributes.position.count, col = new Float32Array(n * 3); for (let k = 0; k < n; k++) { col[k * 3] = 1.0; col[k * 3 + 1] = 1.15; col[k * 3 + 2] = .35; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); fb.add('lotus', 'lotusFl', g, new Matrix4().makeTranslation(0, .05, 0), 1); }
  const bk = fb.b.values().next().value, fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(bk.p, 3)); fg.setAttribute('normal', new THREE.Float32BufferAttribute(bk.n, 3)); fg.setAttribute('color', new THREE.Float32BufferAttribute(bk.c, 3));
  lotus.fl = L.filter(l => l.fl); lotus.flM = new THREE.InstancedMesh(fg, makeMat('lotusFl'), lotus.fl.length);
  [lotus.leafM, lotus.stemM, lotus.flM].forEach(m => { m.frustumCulled = false; world.add(m); regMesh(m, 'lotus', m.material.userData.id); });
  lotus.leafM.castShadow = true;
}
const LEAFC = [0xa6d47c, 0x4d9b58, 0x93804a, 0x6d6248].map(h => new Color(h)), _lc = new Color(), _lm = new Matrix4();
function updateLotus(s) {
  if (Math.abs(s - lotus.last) < 1e-4) return; lotus.last = s;
  const g = S4n([.34, 1, .86, 0], s), fl = S4n([0, 1, 0, 0], s), droop = S4n([0, 0, .5, .8], s), hh = S4n([.12, 1, .7, .3], s); S4c(LEAFC, s, _lc);
  lotus.leaves.forEach((l, i) => {
    const gg = clamp(g * (1.25 - l.s * .5), 0, 1), h = l.h * hh + .02;
    _e.set(l.tx + droop * (l.s - .3) * 1.4, l.rot, l.tz + droop * (.5 - l.s), 'YXZ'); _q.setFromEuler(_e);
    lotus.leafM.setMatrixAt(i, _lm.compose(_p.set(l.x, h, l.z), _q, _s.set(l.r * gg, l.r * gg, l.r * gg))); lotus.leafM.setColorAt(i, _lc.clone().multiplyScalar(l.c));
    lotus.stemM.setMatrixAt(i, _lm.compose(_p.set(l.x, -.02, l.z), _q.identity(), _s.set(gg > .02 ? 1 : 0, h, gg > .02 ? 1 : 0)));
  });
  lotus.fl.forEach((l, i) => { const k = clamp(fl * 1.6 - l.s * .6, 0, 1); _q.setFromEuler(_e.set(0, l.rot, .08, 'YXZ')); lotus.flM.setMatrixAt(i, _lm.compose(_p.set(l.x + .25, (l.h + .55) * k + .02, l.z + .2), _q, _s.set(k * 1.5, k * 1.5, k * 1.5))); });
  [lotus.leafM, lotus.stemM, lotus.flM].forEach(m => m.instanceMatrix.needsUpdate = true); lotus.leafM.instanceColor.needsUpdate = true;
}

// 锦鲤
const koi = [];
function buildKoi() {
  const sh = new THREE.Shape(); sh.moveTo(.3, 0); sh.quadraticCurveTo(.2, .1, 0, .085); sh.quadraticCurveTo(-.16, .06, -.22, .02); sh.lineTo(-.34, .1); sh.lineTo(-.3, 0); sh.lineTo(-.34, -.1); sh.lineTo(-.22, -.02); sh.quadraticCurveTo(-.16, -.06, 0, -.085); sh.quadraticCurveTo(.2, -.1, .3, 0);
  const g = new THREE.ShapeGeometry(sh, 6); g.rotateX(-PI / 2);
  const cols = [0xe8502a, 0xf28a2e, 0xf4efe6, 0xe23a26, 0xf1c13c, 0xe8502a, 0xf4efe6];
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: .78, depthWrite: false })); m.renderOrder = 2; const k = { m, x: rr(-16, -3), z: rr(-5, 6), a: rnd() * TAU, v: rr(.35, .7), s: rr(.8, 1.35), ph: rnd() * 9 }; m.scale.setScalar(k.s); world.add(m); regMesh(m, 'koi', null); hideInRefl.push(m); koi.push(k); }
}
let feed = null;
function updateKoi(dt, t) {
  koi.forEach(k => {
    let tx = -9.5, tz = 1, pull = .015 * Math.max(0, Math.hypot(k.x + 9.5, k.z - 1) - 7);
    if (feed && t - feed.t < 9) { tx = feed.x; tz = feed.z; pull = .9; }
    const want = Math.atan2(tz - k.z, tx - k.x); let da = ((want - k.a + PI * 3) % TAU) - PI;
    k.a += da * clamp(pull, 0, 1) * dt * 1.6 + Math.sin(t * .7 + k.ph) * dt * .5;
    const nx = k.x + Math.cos(k.a) * k.v * dt * (pull > .5 ? 2.2 : 1), nz = k.z + Math.sin(k.a) * k.v * dt * (pull > .5 ? 2.2 : 1);
    if (isLand(nx + .8, nz) || (Math.abs(nx - PAV.x) < 5.6 && Math.abs(nz - PAV.z) < 5.6)) k.a += PI * .5 * dt * 4; else { k.x = nx; k.z = nz; }
    k.m.position.set(k.x, .012, k.z); k.m.rotation.y = -k.a + Math.sin(t * 5 * k.v + k.ph) * .16;
  });
}

// 摇橹船
const boats = [];
function buildBoat(x, z, ry) {
  const bb = new Builder(), grp = new THREE.Group(), n = 16, Lh = 3.3, sec = [];
  for (let i = 0; i <= n; i++) { const s = i / n * 2 - 1, w = .8 * Math.pow(Math.max(1 - Math.pow(Math.abs(s), s < 0 ? 3.2 : 2.2), 0), .7) + .03, yg = .4 + .26 * s * s + (s > 0 ? .1 * s * s * s : 0), yk = -.14 + .34 * Math.pow(Math.abs(s), 3); sec.push([[s * Lh, yg, -w], [s * Lh, yk + .1, -w * .7], [s * Lh, yk, 0], [s * Lh, yk + .1, w * .7], [s * Lh, yg, w]]); }
  const pos = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { const a = sec[i][j], b = sec[i][j + 1], c = sec[i + 1][j], d = sec[i + 1][j + 1]; pos.push(...a, ...c, ...b, ...b, ...c, ...d, ...a, ...b, ...c, ...b, ...d, ...c); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.computeVertexNormals(); bb.add('boat', 'boatWd', hg, null, 1);
  for (let i = 0; i < n; i++) [0, 4].forEach(j => bb.seg('boat', 'boatWd', sec[i][j], sec[i + 1][j], .09, .06, 1.25));
  bb.box('boat', 'boatWd', 0, .02, 0, 4.6, .04, 1.0, 0, 1.2); [-1.9, -.2, 1.7].forEach(xx => bb.box('boat', 'boatWd', xx, .33, 0, .3, .04, 1.36, 0, 1.3));
  [[-1.25, -.62], [-1.25, .62], [1.25, -.62], [1.25, .62]].forEach(p => bb.box('boat', 'boatWd', p[0], 1.08, p[1], .045, 1.36, .045, 0, .8));
  for (let k = 0; k < 9; k++) { const o = -.76 + k * .19, y = 1.74 + .17 * Math.cos(o / .76 * PI / 2); bb.seg('boat', k % 2 ? 'canvasW' : 'canopy', [-1.5, y, o], [1.5, y, o], .2, .03, 1); }
  [-.86, .86].forEach(o => bb.box('boat', 'canopy', 0, 1.66, o, 3.0, .16, .02, 0, .9));
  bb.seg('boat', 'boatWd', [-2.6, .62, .35], [-4.3, -.25, .95], .07, .05, 1.1); bb.box('boat', 'boatWd', -2.7, .55, .3, .08, .3, .08);
  bb.add('boat', 'lantern', new THREE.SphereGeometry(.11, 8, 6), TM(1.52, 1.5, 0, 0, 1, 1.2, 1));
  bb.flush(grp, { local: true }); grp.position.set(x, 0, z); grp.rotation.y = ry; world.add(grp);
  const gi = addGlow(x + Math.cos(ry) * 1.52, 1.5, z - Math.sin(ry) * 1.52, 0xff6a30, 1.5);
  boats.push({ grp, ph: rnd() * 9, ry, gi });
}

// 远景：苏堤、群山、雷峰塔、保俶塔、三潭石塔
function buildFar() {
  // 群山：沿圆弧的层叠山脊
  const ridge = (mat, R, a0, a1, hgt, D, seed, bumps = [], shoreTrees = 0) => {
    const n = Math.round((a1 - a0) / 1.1), pos = [], col = [], idx = [], NR = 8;
    const HR = i => { const a = (a0 + (a1 - a0) * i / n) * PI / 180, e = Math.sin(PI * clamp(i / n, 0, 1)), nz = fbm(i * .11 + seed, seed * 3.1, 4);
      let h = hgt * (.3 + nz * 1.15) * Math.pow(e, .55); bumps.forEach(b => { h += b[1] * Math.exp(-Math.pow((a * 180 / PI - b[0]) / b[2], 2)) * Math.pow(e, .3); }); return [a, h, R * (1 + (fbm(i * .07, seed, 2) - .5) * .12)]; };
    for (let i = 0; i <= n; i++) { const hr = HR(i), a = hr[0], h = hr[1], rw = hr[2], A = Math.min(D * .7, 130);
      const c = Math.cos(a), s = Math.sin(a);
      // 自湖岸平地起，经山脚、山腰到山脊，再从背面落回地面：整座山是落地的实体
      [[rw - D - A, -.6, 1.12], [rw - D - A * .9, .9, 1.14], [rw - D, 2.2 + h * .04, 1.06], [rw - D * .62, h * .5, .95], [rw - D * .25, h * .9, .88], [rw, h, .98], [rw + D * .5, h * .5, .82], [rw + D * 1.05, -.6, .78]].forEach(q => { pos.push(c * q[0], q[1], s * q[0]); const v = q[2] * (.92 + .16 * vnoise(i * .4, q[0] * .01)); col.push(v, v, v); });
      if (i) for (let k = 0; k < NR - 1; k++) { const p = (i - 1) * NR + k, q = i * NR + k; idx.push(p, p + 1, q, p + 1, q + 1, q); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); B.add('far-hill', mat, g, null, 1);
    if (shoreTrees) for (let i = 0; i < n; i += .3 / shoreTrees) { const hr = HR(i), A = Math.min(D * .7, 130), rs = hr[2] - D - A * rr(.2, .85), sz = rr(7, 10); blob('far-hill', i % 9 < 1 ? 'farPeach' : 'farTree', Math.cos(hr[0]) * rs, 1.2 + sz * .6, Math.sin(hr[0]) * rs, sz, sz * rr(.8, 1.1), sz, rr(.78, 1.05), 0, 0); }
    return deg => HR((deg - a0) / (a1 - a0) * n);
  };
  ridge('hill1', 780, 96, 172, 95, 150, 3, [], 1); const northH = ridge('hill1', 1080, 236, 300, 105, 190, 11, [[262, 55, 5]], 1);
  ridge('hill2', 1650, 88, 270, 210, 330, 21, [[168, 60, 9], [206, 90, 8]], 1.6); ridge('hill3', 2700, 70, 292, 300, 480, 33, [[160, 120, 7], [200, 170, 7]]);
  ridge('hill3', 2500, -70, 75, 70, 300, 47);
  // 苏堤：长堤、桃柳、石拱桥
  const sx = z => -560 + 34 * Math.sin(z / 380), pts = []; for (let z = -950; z <= 650; z += 25) pts.push([sx(z), z]);
  const bridges = [-610, -230, 170, 500];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], zm = (a[1] + b[1]) / 2; if (bridges.some(q => Math.abs(q - zm) < 16)) continue; B.seg('far-su', 'farLand', [a[0], .1, a[1]], [b[0], .1, b[1]], 34, 1.6, 1); B.seg('far-su', 'stone', [a[0], -.2, a[1]], [b[0], -.2, b[1]], 35.5, 1.4, .85); }
  for (let z = -940; z <= 640; z += 11) { if (bridges.some(q => Math.abs(q - z) < 22)) continue; [-11, 11].forEach((o, j) => { const pk = (Math.round(z / 11) + j) % 3 === 0; blob('far-su', pk ? 'farPeach' : 'farTree', sx(z) + o + rr(-2, 2), pk ? 4.6 : 6.6, z + rr(-3, 3), pk ? 4 : 5.6, pk ? 3.4 : 5.4, pk ? 4 : 5.6, rr(.86, 1.1), 0, 0); }); }
  bridges.forEach(zb => { const L = 26, R = 7.4, yc = -1.2, top = s => .9 + 6.6 * Math.pow(Math.cos(PI * s / (2 * L)), 2), sh = new THREE.Shape(); sh.moveTo(-L, -2); sh.lineTo(-L, .9); for (let i = 1; i <= 30; i++) { const s = -L + 2 * L * i / 30; sh.lineTo(s, top(s)); } sh.lineTo(L, -2); sh.closePath();
    const hp = new THREE.Path(); hp.moveTo(-R, -1.9); hp.lineTo(-R, yc); hp.absarc(0, yc, R, PI, 0, true); hp.lineTo(R, -1.9); hp.closePath(); sh.holes.push(hp);
    B.add('far-su', 'stone', new THREE.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false, curveSegments: 20 }), TM(sx(zb) + 6, 0, zb, -PI / 2), .95); });
  for (let z = -900; z <= 620; z += 36) addGlow(sx(z) + 14, 4.5, z, 0xffc888, 9);
  // 雷峰塔（夕照山上，八面五层）
  const lx = -330, lz = 560, lh = 46;
  B.add('far-hill', 'hill1', new THREE.SphereGeometry(1, 28, 12, 0, TAU, 0, PI / 2), TM(lx, 0, lz + 20, 0, 150, lh + 2, 130), .95);
  for (let i = 0; i < 150; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 142, hh = (lh + 2) * Math.sqrt(Math.max(1 - Math.pow(r / 150, 2) * (Math.cos(a) * Math.cos(a) + Math.sin(a) * Math.sin(a) * 1.33), 0)); if (r < 26) continue; blob('far-hill', 'farTree', lx + Math.cos(a) * r, hh + 3, lz + 20 + Math.sin(a) * r * .87, rr(11, 17), rr(8, 13), rr(11, 17), rr(.72, 1.0), 0, 1); }
  let y = lh - 3; B.add('far-leifeng', 'stone', new THREE.CylinderGeometry(19, 21, 9, 8), TM(lx, y + 4.5, lz), .9); y += 9;
  for (let i = 0; i < 5; i++) { const rb = 9.6 - i * .95, hb = 9.2 - i * .5; B.add('far-leifeng', 'pagoda', new THREE.CylinderGeometry(rb * .96, rb, hb, 8), TM(lx, y + hb / 2, lz, PI / 8), 1.15);
    B.add('far-leifeng', 'pagoda', new THREE.CylinderGeometry(rb + 2.4, rb + 2.4, .5, 8), TM(lx, y + .3, lz, PI / 8), .8);
    farRoof(lx, y + hb - 1.2, lz, rb * .9, rb + 4.6, 2.6, .55); y += hb; }
  farRoof(lx, y - .4, lz, .3, 6.6, 7, .55); B.add('far-leifeng', 'gold', new THREE.CylinderGeometry(.25, .7, 9, 8), TM(lx, y + 10.5, lz)); B.add('far-leifeng', 'gold', new THREE.SphereGeometry(1.3, 10, 8), TM(lx, y + 7.2, lz));
  addGlow(lx, lh + 34, lz, 0xffb24a, 150); addGlow(lx, lh + 62, lz, 0xffd27a, 60);
  // 保俶塔（宝石山上，六面七层实心砖塔）
  const bh = northH(262), ba = bh[0], bx = Math.cos(ba) * (bh[2] - 3), bz = Math.sin(ba) * (bh[2] - 3), by = bh[1] - 2.5; let yy = by;
  for (let i = 0; i < 7; i++) { const r0 = 5.2 - i * .55, hh = 5.6 - i * .25; B.add('far-baochu', 'brick', new THREE.CylinderGeometry(r0 - .5, r0, hh, 6), TM(bx, yy + hh / 2, bz)); B.add('far-baochu', 'brick', new THREE.CylinderGeometry(r0 + .5, r0 + .1, .5, 6), TM(bx, yy + hh, bz), .8); yy += hh; }
  B.add('far-baochu', 'metal', new THREE.CylinderGeometry(.12, .8, 10, 6), TM(bx, yy + 5, bz)); addGlow(bx, by + 22, bz, 0xffe2b0, 70);
  // 三潭石塔：球形塔身中空，五个圆孔
  [[-84, 30], [-108, 54], [-82, 76]].forEach(p => { const x = p[0], z = p[1];
    B.add('santan', 'stone', new THREE.CylinderGeometry(.34, .42, 3.0, 10), TM(x, -.9, z), .86); B.add('santan', 'stone', new THREE.CylinderGeometry(.62, .5, .14, 12), TM(x, .66, z));
    B.add('santan', 'stone', new THREE.SphereGeometry(.52, 16, 12), TM(x, 1.16, z)); for (let i = 0; i < 5; i++) { const a = i * TAU / 5; B.add('santan', 'candle', new THREE.CircleGeometry(.15, 12), TM(x + Math.sin(a) * .525, 1.18, z + Math.cos(a) * .525, a)); }
    B.add('santan', 'stone', new THREE.ConeGeometry(.6, .34, 6), TM(x, 1.82, z)); B.add('santan', 'stone', new THREE.SphereGeometry(.17, 8, 6), TM(x, 2.08, z)); B.add('santan', 'stone', new THREE.SphereGeometry(.11, 8, 6), TM(x, 2.3, z)); B.add('santan', 'stone', new THREE.ConeGeometry(.06, .22, 6), TM(x, 2.47, z));
    addGlow(x, 1.18, z, 0xffd27a, 3.4); });
}
function farRoof(cx, cy, cz, rTop, rEave, h, tint) {
  const o = { sides: 8, rTop, rEave, h, sag: .2, lift: h * .28, flare: 0, cx, cy, cz, rot: PI / 8 }, pos = [];
  for (let k = 0; k < 8; k++) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const a = roofPt(o, k, j - 1, i / 3), b = roofPt(o, k, j, i / 3), c = roofPt(o, k, j - 1, (i + 1) / 3), d = roofPt(o, k, j, (i + 1) / 3); pos.push(...a, ...b, ...c, ...b, ...d, ...c, ...a, ...c, ...b, ...b, ...c, ...d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); B.add('far-leifeng', 'pagoda', g, null, tint);
}
