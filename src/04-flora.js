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
function treeLite(kind, x, z, k, part = 'trees', y0 = Y0, cards = 13) { const H = rr(11, 15) * k, R = rr(4.5, 6) * k, tint = rr(.85, 1.08), top = [x + rr(-.4, .4), y0 + H * .5, z + rr(-.4, .4)]; limb(part, [x, y0 - .3, z], top, .2 + .14 * k, .1 + .09 * k);
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + rnd() * 1.2, ox = Math.cos(a) * R * .34, oz = Math.sin(a) * R * .34, cy = y0 + H * (.56 + i * .12), r = R * (.74 - i * .1);
    limb(part, top, [x + ox, cy - r * .2, z + oz], .09 + .06 * k, .04);
    blob(part, kind, x + ox, cy + r * .28, z + oz, r * .5, r * .4, r * .5, tint * .38, .15, 0, y0 + H * .5); leaves(part, kind, x + ox, cy + r * .1, z + oz, r, r * .78, r, cards + 5, 1.5 * Math.max(k, .7) + .5, tint * rr(.94, 1.06), .3, x, y0 + H * .5, z); }
  leaves(part, kind, x, y0 + H * .86, z, R * .5, R * .34, R * .5, cards * .6 | 0, 1.2 * Math.max(k, .7) + .3, tint * 1.08, .34, x, y0 + H * .6, z); }
// 远岸、山脚的树：树干、两团树冠、每团八片大叶面
function treeFar(part, kind, x, y0, z, k = 1, crown = 0) { const H = rr(10, 15) * k, R = rr(4.6, 6.4) * k, tint = rr(.8, 1.08);
  if (crown) { const r = R * 1.05; blob(part, kind, x, y0 + r * .55, z, r * .56, r * .42, r * .56, tint * .4, .1, 0, y0); leaves(part, kind, x, y0 + r * .42, z, r, r * .7, r, 15, 2.6 * k, tint, .25, x, y0, z); return; }
  limb(part, [x, y0 - .6, z], [x, y0 + H * .55, z], .3 * k, .16 * k);
  for (let i = 0; i < 2; i++) { const ox = rr(-.3, .3) * R, oz = rr(-.3, .3) * R, cy = y0 + H * (.58 + i * .2), r = R * (.8 - i * .2); blob(part, kind, x + ox, cy + r * .3, z + oz, r * .54, r * .42, r * .54, tint * .4, .1, 0, y0 + H * .5); leaves(part, kind, x + ox, cy + r * .1, z + oz, r, r * .8, r, 11, 2.4 * k, tint, .25, x, y0 + H * .5, z); } }
// 堤岸上的柳：斜干、五条主枝、伞形冠与成帘的垂条
function willowLite(part, x, z, k = 1, y0 = Y0) { const H = rr(6.8, 8.2) * k, lean = rr(-.9, .9), top = [x + lean, y0 + H * .5, z + rr(-.5, .5)], a0 = rnd() * TAU, tips = [];
  limb(part, [x, y0 - .2, z], [x + lean * .4, y0 + H * .27, z], .27 * k, .2 * k); limb(part, [x + lean * .4, y0 + H * .27, z], top, .2 * k, .13 * k);
  blob(part, 'willow', top[0], top[1] + H * .36, top[2], 1.3 * k, .7 * k, 1.3 * k, .4, .12, 0, top[1]);
  for (let i = 0; i < 5; i++) { const a = a0 + i * TAU / 5 + rr(-.3, .3), o = rr(2.3, 3.3) * k, tip = [top[0] + Math.cos(a) * o, top[1] + H * rr(.3, .42), top[2] + Math.sin(a) * o]; limb(part, top, tip, .1 * k, .03); tips.push([tip, a]);
    leaves(part, 'willow', lerp(top[0], tip[0], .7), tip[1] + .25, lerp(top[2], tip[2], .7), 1.7 * k, .7, 1.7 * k, 11, .9, rr(.95, 1.08), .2, 0, 99999, 0); }
  leaves(part, 'willow', top[0], top[1] + H * .45, top[2], 2.2 * k, .9, 2.2 * k, 18, .9, 1.06, .2, 0, 99999, 0);
  const bk = B._bk(part, 'willow', true); if (!bk.w) bk.w = [];
  for (let s = 0; s < 46; s++) { const t = tips[s % 5], f = rr(.25, 1.12), a = t[1], bx = lerp(top[0], t[0][0], f) + rr(-.7, .7), bz = lerp(top[2], t[0][2], f) + rr(-.7, .7), by = lerp(top[1] + H * .3, t[0][1], Math.min(f, 1)) + rr(-.1, .3);
    const len = Math.min(rr(2.6, 5.4) * k, by - y0 - rr(.5, 1.5)), ph = rnd() * TAU, wx = Math.cos(ph) * .24, wz = Math.sin(ph) * .24, ox = Math.cos(a) * .32, oz = Math.sin(a) * .32, tint = rr(.85, 1.15), v0 = rnd();
    const pt = j => { const u = j / 2; return [bx + ox * Math.sin(u * 1.6), by - len * u, bz + oz * Math.sin(u * 1.6), Math.pow(u, 1.3) * len * .36, v0 + u * len / 1.25]; };
    for (let j = 0; j < 2; j++) { const p = pt(j), q = pt(j + 1), v = [[p[0] - wx, p[1], p[2] - wz, p[3], 0, p[4]], [p[0] + wx, p[1], p[2] + wz, p[3], 1, p[4]], [q[0] - wx, q[1], q[2] - wz, q[3], 0, q[4]], [q[0] + wx, q[1], q[2] + wz, q[3], 1, q[4]]];
      [0, 1, 2, 1, 3, 2].forEach(i => { const w = v[i]; bk.p.push(w[0], w[1], w[2]); bk.n.push(ox, .85, oz); const c = tint * (1 - j * .04); bk.c.push(c, c, c * .93); bk.w.push(w[0], w[1], w[2], w[3]); bk.uv.push(w[4], -w[5]); }); } } }
// 小山：高度场（带起伏与沟壑），返回取高函数
function hillField(part, mat, cx, cz, rx, rz, h, seed, nx = 72, nz = 36, base = Y0, pw = .6, tint = 1) {
  const Hf = (x, z) => { const u = (x - cx) / rx, v = (z - cz) / rz, d = 1 - u * u - v * v; if (d <= 0) return base - .6; const e = Math.pow(d, pw);
    return base - .6 + (h + .6) * e * (.76 + .48 * fbm(x * .017 + seed, z * .017 + seed * 1.7, 3)) + (fbm(x * .1 + seed, z * .1, 2) - .5) * 2.4 * Math.min(1, d * 4); };
  const pos = [], col = [], idx = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = cx + (i / nx * 2 - 1) * rx * 1.01, z = cz + (j / nz * 2 - 1) * rz * 1.01; pos.push(x, Hf(x, z), z); const v = (.86 + .2 * vnoise(x * .05 + seed, z * .05)) * (.92 + .16 * vnoise(x * .23, z * .23 + seed)); col.push(v, v, v); }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); B.add(part, mat, g, null, tint); return Hf;
}
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
  for (let i = 0; i < 170; i++) { const x = rr(125, 380), z = rr(-260, 260); treeFar('trees', ['camphor', 'plane', 'camphor', 'ginkgo', 'maple'][i % 5], x, Y0, z, rr(.95, 1.3)); }
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
  // 荷叶：盾形叶面，中心微凹、叶缘起伏，二十条放射叶脉用顶点色画出
  const lg = new THREE.BufferGeometry(); { const NA = 20, NR = 3, pos = [], col = [], idx = [];
    for (let j = 0; j <= NR; j++) for (let i = 0; i < NA; i++) { const r = Math.pow(j / NR, .8), a = i / NA * TAU, x = Math.cos(a) * r, z = Math.sin(a) * r; pos.push(x, r * .17 + Math.sin(a * 5) * .045 * r + Math.sin(a * 11 + 1.3) * .022 * r * r - .1 + (j ? 0 : -.015), z);
      const vein = Math.pow(Math.abs(Math.cos(a * 10)), 10) * (.25 + .75 * r) * (j ? 1 : 0), v = .8 + .2 * r + .22 * vein - (j === NR ? .08 : 0) + (j ? 0 : .25); col.push(v * .97, v, v * .9); }
    for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) { const p = j * NA + i, q = j * NA + (i + 1) % NA; idx.push(p, p + NA, q, q, p + NA, q + NA); }
    lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); lg.setIndex(idx); lg.computeVertexNormals(); }
  lotus.leafM = new THREE.InstancedMesh(lg, makeMat('lotus', { vertexColors: true }), L.length); lotus.leafM.receiveShadow = true;
  lotus.stemM = new THREE.InstancedMesh(new THREE.CylinderGeometry(.012, .016, 1, 5).translate(0, .5, 0), makeMat('lotus', { vertexColors: false }), L.length);
  const fb = new Builder();
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < (ring ? 6 : 9); i++) { const a = i * TAU / (ring ? 6 : 9) + ring * .4, tilt = ring ? .32 : .95; const g = new THREE.SphereGeometry(1, 6, 3), n = g.attributes.position.count, col = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const y = g.attributes.position.getY(k) * .5 + .5; col[k * 3] = 1; col[k * 3 + 1] = lerp(1.25, .86, y); col[k * 3 + 2] = lerp(1.2, .92, y); } g.setAttribute('color', new THREE.BufferAttribute(col, 3));
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

// 锦鲤：三维鱼体（躯干、背鳍、胸鳍、腹鳍、臀鳍、叉形尾），摆尾在顶点着色器里完成；鱼群互相避让，不会叠在一起
const koi = [];
const KOI_T = [0, .04, .12, .26, .42, .58, .74, .88, 1], KOI_W = [.016, .058, .094, .112, .106, .086, .058, .034, .016], KOI_H = [.02, .06, .1, .124, .12, .1, .072, .048, .034];
const KOI_PAL = [   // 底色、斑色、墨斑、斑块阈值
  { b: [.97, .95, .9], p: [.88, .2, .1], th: .5 },                       // 红白
  { b: [.97, .95, .9], p: [.88, .2, .1], k: [.07, .07, .08], th: .52 },  // 大正三色
  { b: [.96, .72, .2], th: 2 },                                          // 黄金
  { b: [.9, .3, .12], th: 2 },                                           // 红鲤
  { b: [.95, .93, .9], p: [.08, .08, .09], th: .55 },                    // 白写
  { b: [.97, .86, .5], p: [.93, .46, .12], th: .5 },                     // 黄写
];
function koiGeo(seed, pal) {
  const r = mulberry(seed * 977 + 13), NS = 26, NR = 14, pos = [], col = [], ak = [], idx = [], ph = r() * 9, fq = 5.2 + r() * 2.2, so = r() * 40;
  const prof = (A, t) => { let i = 0; while (i < KOI_T.length - 2 && t > KOI_T[i + 1]) i++; const f = clamp((t - KOI_T[i]) / (KOI_T[i + 1] - KOI_T[i]), 0, 1), s = f * f * (3 - 2 * f); return lerp(A[i], A[i + 1], s); };
  const V = (x, y, z, c, fin) => { pos.push(x, y, z); col.push(c[0], c[1], c[2]); ak.push(ph, fq, fin); return pos.length / 3 - 1; };
  const skin = (t, a) => { const up = Math.sin(a), n = fbm(t * 3.4 + so, Math.cos(a) * 1.3 + up * .6 + so * .37, 3), n2 = fbm(t * 9 + so * 2, Math.cos(a) * 4 + so, 2);
    let c = pal.b.slice(); if (pal.p && n > pal.th && up > -.35 && t > .05) c = pal.p.slice(); if (pal.k && n2 > .66 && up > -.1) c = pal.k.slice();
    const sh = (pal.p ? 1 : .86 + .28 * n) * (.8 + .2 * (1 - up) * .5 + (up < -.3 ? .12 : 0)); return [c[0] * sh, c[1] * sh, c[2] * sh]; };
  for (let i = 0; i <= NS; i++) { const t = i / NS, w = prof(KOI_W, t), h = prof(KOI_H, t);
    for (let j = 0; j < NR; j++) { const a = j / NR * TAU, s = Math.sin(a); let c = skin(t, a); if (i === 2 && (j === 1 || j === NR / 2 - 1)) c = [.03, .03, .03]; V(.5 - t, s * h * (s < 0 ? .8 : 1), Math.cos(a) * w, c, 1); } }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * NR + j, b = i * NR + (j + 1) % NR, c = a + NR, d = b + NR; idx.push(a, b, c, b, d, c); }
  const nose = V(.508, 0, 0, skin(0, 1.57), 1), tail = V(-.5, 0, 0, skin(1, 1.57), 1); for (let j = 0; j < NR; j++) { idx.push(nose, (j + 1) % NR, j, tail, NS * NR + j, NS * NR + (j + 1) % NR); }
  const fc = pal.b.map((v, i) => lerp(v, [1, .96, .9][i], .35)), fan = P => { const o = P.map(p => V(p[0], p[1], p[2], [fc[0] * p[3], fc[1] * p[3], fc[2] * p[3]], .62)); for (let i = 1; i < o.length - 1; i++) idx.push(o[0], o[i], o[i + 1]); };
  { const P = [[-.47, 0, 0, .9]]; for (let i = 0; i <= 8; i++) { const th = lerp(-1.0, 1.0, i / 8), l = .3 * (.5 + .5 * Math.pow(Math.abs(th), 1.4)); P.push([-.49 - l * Math.cos(th), l * Math.sin(th) * 1.05, 0, 1.05 - .12 * (i % 2)]); } fan(P); }          // 尾鳍
  { const n = 7, lo = [], hi = []; for (let i = 0; i <= n; i++) { const u = i / n, t = lerp(.27, .64, u); lo.push([.5 - t, prof(KOI_H, t) * .96, 0, .9]); hi.push([.5 - t - .04, prof(KOI_H, t) + .012 + .07 * Math.pow(Math.sin(PI * Math.min(u * 1.25, 1)), .7), 0, 1.02]); }
    for (let i = 0; i < n; i++) fan([lo[i], lo[i + 1], hi[i + 1], hi[i]]); }                                                    // 背鳍
  [1, -1].forEach(sd => { const w2 = prof(KOI_W, .2) * .86, y2 = -prof(KOI_H, .2) * .5; fan([[.3, y2, sd * w2, .9], [.24, y2 - .02, sd * (w2 + .16), 1.05], [.17, y2 - .03, sd * (w2 + .15), 1], [.12, y2 - .03, sd * (w2 + .08), 1], [.23, y2, sd * w2, .9]]);       // 胸鳍
    const w5 = prof(KOI_W, .52) * .5, y5 = -prof(KOI_H, .52) * .72; fan([[-.02, y5, sd * w5, .9], [-.07, y5 - .05, sd * (w5 + .07), 1.05], [-.13, y5 - .04, sd * (w5 + .04), 1], [-.09, y5, sd * w5, .9]]); });                                                          // 腹鳍
  { const t = .74, y = -prof(KOI_H, t) * .78; fan([[.5 - t, y, 0, .9], [.5 - t - .1, y - .065, 0, 1.05], [.5 - t - .11, y - .01, 0, .95]]); }                                                                                                                              // 臀鳍
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aK', new THREE.Float32BufferAttribute(ak, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function buildKoi() {
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, side: THREE.DoubleSide, shininess: 70, specular: 0x555555, depthWrite: false });
  mat.onBeforeCompile = sh => { sh.uniforms.uTime = U.time; sh.uniforms.uDeep = waterU.uDeep;
    // 鱼在水面以下：深度按视线与水面的交点写入，这样岸、桥照常遮挡，而不透明的水面不会把鱼裁掉
    sh.vertexShader = 'attribute vec3 aK;uniform float uTime;varying float vDp,vFin;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat tw=clamp(.5-position.x,0.,1.4);transformed.z+=sin(uTime*aK.y+aK.x-tw*3.4)*(.008+.085*tw*tw);vFin=aK.z;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n{vec4 wp4=modelMatrix*vec4(transformed,1.);vDp=-wp4.y;float tt=(cameraPosition.y-.03)/max(cameraPosition.y-wp4.y,.001);vec4 sc=projectionMatrix*viewMatrix*vec4(cameraPosition+(wp4.xyz-cameraPosition)*tt,1.);gl_Position.z=sc.z/sc.w*gl_Position.w;}');
    sh.fragmentShader = 'uniform vec3 uDeep;varying float vDp,vFin;\n' + sh.fragmentShader
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n{float dp=clamp(vDp*1.5,0.,1.);gl_FragColor.rgb=mix(gl_FragColor.rgb,uDeep*1.15,dp*.6);float cz=clamp(dot(normalize(vViewPosition),normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz)),0.,1.);gl_FragColor.a*=(1.-pow(1.-cz,2.2)*.96)*mix(.95,.55,dp)*vFin;}'); };
  for (let i = 0; i < 20; i++) {
    const m = new THREE.Mesh(koiGeo(i + 1, KOI_PAL[[0, 0, 1, 2, 3, 0, 4, 5, 1, 0][i % 10]]), mat), s = rr(.5, .9), a = i / 20 * TAU + rr(-.1, .1), rad = 2.2 + (i % 4) * 1.5;
    const k = { m, x: -9.5 + Math.cos(a) * rad, z: 1 + Math.sin(a) * rad, a: a + PI / 2, sp: .3, v: rr(.32, .6), s, d: rr(.14, .4), ph: rnd() * 9, w: 0, turn: i % 2 ? 1 : -1, da: 0 };
    m.scale.setScalar(s); m.rotation.order = 'YXZ'; m.renderOrder = 2; m.frustumCulled = false; world.add(m); regMesh(m, 'koi', null); hideInRefl.push(m); koi.push(k);
  }
}
let feed = null;
const koiBlocked = (x, z) => isLand(x + .9, z) || (Math.abs(x - PAV.x) < 5.8 && Math.abs(z - PAV.z) < 5.8);
function updateKoi(dt, t) {
  dt = Math.min(dt, .1); const fd = feed && t - feed.t < 10 ? feed : null, HX = -9.5, HZ = 1;
  for (const k of koi) {
    const ca = Math.cos(k.a), sa = Math.sin(k.a); k.w = clamp(k.w * (1 - dt * .5) + (rnd() - .5) * dt * 3, -1, 1);
    let dx = ca - sa * k.w * .55, dz = sa + ca * k.w * .55;
    const hx = HX - k.x, hz = HZ - k.z, hd = Math.hypot(hx, hz) || 1, pull = clamp((hd - 5) / 6, 0, 1.4); dx += hx / hd * pull; dz += hz / hd * pull;
    if (fd) { const fx = fd.x - k.x, fz = fd.z - k.z, fl = Math.hypot(fx, fz) || 1, g = fl > 1.3 ? 1.8 : -.4; dx += fx / fl * g - fz / fl * .5 * k.turn; dz += fz / fl * g + fx / fl * .5 * k.turn; }
    for (const o of koi) { if (o === k) continue; const ox = k.x - o.x, oz = k.z - o.z, d = Math.hypot(ox, oz), R = .95 * (k.s + o.s); if (d < R && d > 1e-4) { const f = (1 - d / R) * 2.6; dx += ox / d * f; dz += oz / d * f; } }
    if (koiBlocked(k.x + ca * 1.6, k.z + sa * 1.6)) { dx += -sa * k.turn * 2.4 - ca * .8; dz += ca * k.turn * 2.4 - sa * .8; }
    const da = ((Math.atan2(dz, dx) - k.a + PI * 3) % TAU) - PI; k.da = lerp(k.da, da, Math.min(1, dt * 4)); k.a += clamp(da, -1.2, 1.2) * dt * 2.1;
    k.sp = lerp(k.sp, k.v * (fd ? 2 : 1) * (1 - .45 * Math.min(Math.abs(da), 1)), Math.min(1, dt * 2));
    const nx = k.x + Math.cos(k.a) * k.sp * dt, nz = k.z + Math.sin(k.a) * k.sp * dt; if (koiBlocked(nx, nz)) k.a += k.turn * dt * 3; else { k.x = nx; k.z = nz; }
  }
  // 硬约束：两条鱼的间距不小于体长之和的一半上下，靠得太近就各自让开
  for (let i = 0; i < koi.length; i++) for (let j = i + 1; j < koi.length; j++) { const a = koi[i], b = koi[j], ox = a.x - b.x, oz = a.z - b.z, d = Math.hypot(ox, oz), R = .5 * (a.s + b.s);
    if (d < R) { const f = (R - d) / 2 / (d || 1), px = (d ? ox : 1) * f, pz = (d ? oz : 0) * f; if (!koiBlocked(a.x + px, a.z + pz)) { a.x += px; a.z += pz; } if (!koiBlocked(b.x - px, b.z - pz)) { b.x -= px; b.z -= pz; } } }
  for (const k of koi) { k.m.position.set(k.x, -(fd ? Math.min(k.d, .16) : k.d) + Math.sin(t * .6 + k.ph) * .03, k.z); k.m.rotation.set(clamp(k.da * .25, -.3, .3), -k.a, 0); }
}

// 摇橹船
const boats = [];
function buildBoat(x, z, ry, sc = 1) {
  const bb = new Builder(), grp = new THREE.Group(), n = 16, Lh = 3.3, sec = [], fancy = sc > 1;
  for (let i = 0; i <= n; i++) { const s = i / n * 2 - 1, w = .8 * Math.pow(Math.max(1 - Math.pow(Math.abs(s), s < 0 ? 3.2 : 2.2), 0), .7) + .03, yg = .4 + .26 * s * s + (s > 0 ? .1 * s * s * s : 0), yk = -.14 + .34 * Math.pow(Math.abs(s), 3); sec.push([[s * Lh, yg, -w], [s * Lh, yk + .1, -w * .7], [s * Lh, yk, 0], [s * Lh, yk + .1, w * .7], [s * Lh, yg, w]]); }
  const pos = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { const a = sec[i][j], b = sec[i][j + 1], c = sec[i + 1][j], d = sec[i + 1][j + 1]; pos.push(...a, ...c, ...b, ...b, ...c, ...d, ...a, ...b, ...c, ...b, ...d, ...c); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.computeVertexNormals(); bb.add('boat', 'boatWd', hg, null, 1);
  for (let i = 0; i < n; i++) [0, 4].forEach(j => bb.seg('boat', 'boatWd', sec[i][j], sec[i + 1][j], .09, .06, 1.25));
  bb.box('boat', 'boatWd', 0, .02, 0, 4.6, .04, 1.0, 0, 1.2); [-1.9, -.2, 1.7].forEach(xx => bb.box('boat', 'boatWd', xx, .33, 0, .3, .04, 1.36, 0, 1.3));
  if (fancy) {   // 画舫：船上起一间小轩，朱柱、亮窗、四坡瓦顶
    bb.box('boat', 'wood', 0, .92, 0, 3.0, .9, 1.16, 0, .9); [-.59, .59].forEach(o => bb.box('boat', 'lampGl', 0, 1.02, o, 2.6, .42, .02, 0, 1));
    for (let i = 0; i < 6; i++) [-.6, .6].forEach(o => bb.box('boat', 'wood', -1.5 + i * .6, .95, o, .07, .96, .07));
    buildRoof('boat', 'boat', { rect: 1, x0: 1.0, z0: .04, x1: 1.95, z1: .98, h: .46, sag: .2, lift: .2, flare: .08, cx: 0, cy: 1.4, cz: 0 }, { B: bb, sp: .16, nu: 6, nt: 5 });
    bb.seg('boat', 'ridge', [-1.05, 1.9, 0], [1.05, 1.9, 0], .09, .12, .95);
  } else {
    [[-1.25, -.62], [-1.25, .62], [1.25, -.62], [1.25, .62]].forEach(p => bb.box('boat', 'boatWd', p[0], 1.08, p[1], .045, 1.36, .045, 0, .8));
    for (let k = 0; k < 9; k++) { const o = -.76 + k * .19, y = 1.74 + .17 * Math.cos(o / .76 * PI / 2); bb.seg('boat', k % 2 ? 'canvasW' : 'canopy', [-1.5, y, o], [1.5, y, o], .2, .03, 1); }
    [-.86, .86].forEach(o => bb.box('boat', 'canopy', 0, 1.66, o, 3.0, .16, .02, 0, .9));
  }
  bb.seg('boat', 'boatWd', [-2.6, .62, .35], [-4.3, -.25, .95], .07, .05, 1.1); bb.box('boat', 'boatWd', -2.7, .55, .3, .08, .3, .08);
  bb.add('boat', 'lantern', new THREE.SphereGeometry(.11, 8, 6), TM(1.52, 1.5, 0, 0, 1, 1.2, 1));
  bb.flush(grp, { local: true }); grp.position.set(x, 0, z); grp.rotation.y = ry; grp.scale.setScalar(sc); world.add(grp);
  const gi = addGlow(x + Math.cos(ry) * 1.52 * sc, 1.5 * sc, z - Math.sin(ry) * 1.52 * sc, fancy ? 0xffb968 : 0xff6a30, fancy ? 9 : 1.5);
  const o = { grp, ph: rnd() * 9, ry, gi }; boats.push(o); return o;
}

// 远景：苏堤、群山、雷峰塔、保俶塔、三潭石塔
const suX = z => -560 + 34 * Math.sin(z / 380), SU_BRIDGES = [-690, -470, -250, -30, 190, 410], SANTAN = [[-215, 114], [-240, 140], [-190, 140]], FARPOS = {};
function buildFar() {
  // 群山：沿圆弧的层叠山脊
  const ridge = (mat, R, a0, a1, hgt, D, seed, bumps = [], shoreTrees = 0, o = {}) => {
    const step = o.step || 1.1, n = Math.round((a1 - a0) / step), A = Math.min(D * .7, 130), Rf = o.Rf || (() => 0), bump = o.bump == null ? 5 : o.bump, NS = o.rows || 30, pos = [], col = [], idx = [], idxF = [];
    const HR = i => { const ad = a0 + (a1 - a0) * i / n, a = ad * PI / 180, e = Math.sin(PI * clamp(i / n, 0, 1)), u = (ad - a0) / 1.1, nz = fbm(u * .11 + seed, seed * 3.1, 4);
      let h = hgt * (.3 + nz * 1.15) * Math.pow(e, .55); bumps.forEach(b => { h += b[1] * Math.exp(-Math.pow((ad - b[0]) / b[2], 2)) * Math.pow(e, .3); }); return [a, h, (R + Rf(ad)) * (1 + (fbm(u * .07, seed, 2) - .5) * .12)]; };
    // 自湖岸平地起，经山脚、山腰到山脊，再从背面落回地面：整座山是落地的实体。f∈[0,1] 沿剖面取点
    const KEY = h => [[-D - A, -.6, 1.12], [-D - A * .9, .9, 1.14], [-D - A * .45, 1.5, 1.1], [-D, 2.2 + h * .04, 1.06], [-D * .82, h * .22, 1], [-D * .62, h * .5, .95], [-D * .43, h * .74, .9], [-D * .25, h * .9, .88], [-D * .1, h * .975, .94], [0, h, .98], [D * .25, h * .84, .86], [D * .5, h * .5, .82], [D * 1.05, -.6, .78]];
    const FQ = f => Math.pow(f, 1.25);     // 朝湖一面取点更密
    const at = (i, f) => { const hr = HR(i), K = KEY(hr[1]), q = clamp(FQ(f), 0, 1) * (K.length - 1), k = Math.min(K.length - 2, q | 0), t = q - k, r = hr[2] + lerp(K[k][0], K[k + 1][0], t), x = Math.cos(hr[0]) * r, z = Math.sin(hr[0]) * r;
      let y = lerp(K[k][1], K[k + 1][1], t); const up = clamp((y - 2.2) / 14, 0, 1) * clamp((1 - f) * 12, 0, 1); y += up * ((fbm(x * .013 + seed, z * .013, 3) - .5) * hr[1] * .3 + (fbm(x * .085, z * .085 + seed, 2) - .5) * bump);
      return [x, y, z, lerp(K[k][2], K[k + 1][2], t)]; };
    for (let i = 0; i <= n; i++) { for (let k = 0; k <= NS; k++) { const p = at(i, k / NS); pos.push(p[0], p[1], p[2]); const v = p[3] * (.9 + .2 * vnoise(p[0] * .02, p[2] * .02 + seed)) * (.93 + .14 * vnoise(p[0] * .11 + seed, p[2] * .11)); col.push(v, v, v); }
      if (i) for (let k = 0; k < NS; k++) { const p = (i - 1) * (NS + 1) + k, q = i * (NS + 1) + k; (FQ((k + 1) / NS) * 12 <= 3.02 ? idxF : idx).push(p, q, p + 1, p + 1, q, q + 1); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx.concat(idxF)); g.computeVertexNormals(); const gF = g.clone(); g.setIndex(idx); B.add('far-hill', mat, g.toNonIndexed(), null, 1); if (idxF.length) { gF.setIndex(idxF); B.add('far-hill', 'farLand', gF.toNonIndexed(), null, .96); }
    const KIND = ['camphor', 'plane', 'camphor', 'ginkgo', 'camphor', 'maple', 'camphor', 'plane', 'peach'], fInv = r => Math.pow(clamp(r, 0, 1), 1 / 1.25);
    if (shoreTrees && o.near) { // 近山：水边一排、山脚成片，都是带叶面的树
      for (let i = 0, c = 0; i < n; i += 1.9 / (step * 6) / shoreTrees, c++) { const p = at(i + rr(-.3, .3), fInv(rr(.085, .2))); treeFar('far-hill', KIND[c % 9], p[0], p[1], p[2], rr(.8, 1.15)); }
      for (let c = 0; c < (o.slope || 0); c++) { const p = at(rr(n * .03, n * .97), fInv(.235 + .34 * Math.pow(rnd(), 1.6))); treeFar('far-hill', KIND[c % 8], p[0], p[1] - 1.2, p[2], rr(1.1, 1.7), 1); } }
    else if (shoreTrees) for (let i = 0; i < n; i += .3 / shoreTrees / (step / 1.1)) { const hr = HR(i), rs = hr[2] - D - A * rr(.2, .85), sz = rr(7, 10); blob('far-hill', i % 9 < 1 ? 'farPeach' : 'farTree', Math.cos(hr[0]) * rs, 1.2 + sz * .6, Math.sin(hr[0]) * rs, sz, sz * rr(.8, 1.1), sz, rr(.78, 1.05), 0, 0); }
    return deg => HR((deg - a0) / (a1 - a0) * n);
  };
  // 南山在苏堤以西向外退开，让出西里湖
  FARPOS.southH = ridge('hill1', 780, 96, 172, 95, 150, 3, [], 1, { step: .4, near: 1, slope: 540, Rf: ad => sstep(108, 138, ad) * 240 });
  const northH = FARPOS.northH = ridge('hill1', 1080, 236, 300, 105, 190, 11, [[262, 55, 5]], 1, { step: .35, near: 1, slope: 500 });
  ridge('hill2', 1650, 88, 270, 210, 330, 21, [[168, 60, 9], [206, 90, 8]], 1.6, { step: .55, bump: 9, rows: 26 }); ridge('hill3', 2700, 70, 292, 300, 480, 33, [[160, 120, 7], [200, 170, 7]], 0, { step: .8, bump: 12, rows: 18 });
  ridge('hill3', 2500, -70, 75, 70, 300, 47, [], 0, { step: .9, bump: 8, rows: 16 });
  // 苏堤：长堤卧波，六桥（自北而南：跨虹、东浦、压堤、望山、锁澜、映波），桃柳相间
  const bridges = SU_BRIDGES, pts = []; for (let z = -790; z <= 650; z += 20) pts.push([suX(z), z]);
  let run = []; const BL = 27, flushRun = () => { if (run.length > 1) causeway('far-su', run, 30); run = []; };
  for (let z = -790; z <= 650; z += 10) { const b = bridges.find(q => Math.abs(q - z) < BL - 1.5); if (b != null) { if (run.length) { run.push([suX(b - BL + 1.5), b - BL + 1.5]); flushRun(); } continue; }
    if (!run.length) { const pb = bridges.find(q => z - q > 0 && z - q < BL + 10); if (pb != null) run.push([suX(pb + BL - 1.5), pb + BL - 1.5]); } run.push([suX(z), z]); } flushRun();
  bridges.forEach(zb => archSpan('far-su', suX(zb), zb, PI / 2 - Math.atan2(suX(zb + 5) - suX(zb - 5), 10) * 0 , 27, 13, 7.4, -1.2, 6.2));
  for (let z = -780; z <= 640; z += 9.5) { if (bridges.some(q => Math.abs(q - z) < 30)) continue; [-11.5, 11.5].forEach((o, j) => { const pk = (Math.round(z / 9.5) + j) % 3 === 0; if (pk) tree('peach', suX(z) + o + rr(-1, 1), z + rr(-2, 2), 'far-su', 1.15); else willowLite('far-su', suX(z) + o + rr(-1, 1), z + rr(-2, 2), 1.05); }); }
  for (let z = -776, c = 0; z <= 636; z += 13, c++) { if (bridges.some(q => Math.abs(q - z) < 32)) continue; treeFar('far-su', ['camphor', 'plane', 'camphor', 'ginkgo'][c % 4], suX(z) + (c % 2 ? 6.5 : -6.5) + rr(-.8, .8), Y0, z + rr(-2, 2), rr(.82, 1.05)); }
  for (let z = -770; z <= 630; z += 36) { if (bridges.some(q => Math.abs(q - z) < 26)) continue; lampPost('far-su', suX(z) + 4.2, Y0, z); }
  // 雷峰塔（夕照山上，八面五层）
  const lx = -330, lz = 560, lh = 46;
  const lf = hillField('far-hill', 'hill1', lx, lz + 20, 150, 130, lh + 2, 5, 80, 70, .4);
  for (let i = 0; i < 300; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * .96, x = lx + Math.cos(a) * r * 150, z = lz + 20 + Math.sin(a) * r * 130; if (Math.hypot(x - lx, z - lz) < 24) continue; treeFar('far-hill', ['camphor', 'plane', 'camphor', 'maple', 'ginkgo', 'camphor'][i % 6], x, lf(x, z) - .8, z, rr(.85, 1.3)); }
  let y = lf(lx, lz) - 6; B.add('far-leifeng', 'stone', new THREE.CylinderGeometry(19, 21, 9, 8), TM(lx, y + 4.5, lz), .9); y += 9;
  for (let i = 0; i < 5; i++) { const rb = 9.6 - i * .95, hb = 9.2 - i * .5; B.add('far-leifeng', 'pagoda', new THREE.CylinderGeometry(rb * .96, rb, hb, 8), TM(lx, y + hb / 2, lz, PI / 8), 1.15);
    B.add('far-leifeng', 'pagoda', new THREE.CylinderGeometry(rb + 2.4, rb + 2.4, .5, 8), TM(lx, y + .3, lz, PI / 8), .8);
    farRoof(lx, y + hb - 1.2, lz, rb * .9, rb + 4.6, 2.6, .55); y += hb; }
  farRoof(lx, y - .4, lz, .3, 6.6, 7, .55); B.add('far-leifeng', 'gold', new THREE.CylinderGeometry(.25, .7, 9, 8), TM(lx, y + 10.5, lz)); B.add('far-leifeng', 'gold', new THREE.SphereGeometry(1.3, 10, 8), TM(lx, y + 7.2, lz));
  addGlow(lx, lh + 34, lz, 0xffb24a, 150); addGlow(lx, lh + 62, lz, 0xffd27a, 60);
  // 保俶塔（宝石山上，六面七层实心砖塔）
  const bh = northH(262), ba = bh[0], bx = Math.cos(ba) * (bh[2] - 3), bz = Math.sin(ba) * (bh[2] - 3), by = bh[1] - 2.5; let yy = by;
  for (let i = 0; i < 7; i++) { const r0 = 5.2 - i * .55, hh = 5.6 - i * .25; B.add('far-baochu', 'brick', new THREE.CylinderGeometry(r0 - .5, r0, hh, 6), TM(bx, yy + hh / 2, bz)); B.add('far-baochu', 'brick', new THREE.CylinderGeometry(r0 + .5, r0 + .1, .5, 6), TM(bx, yy + hh, bz), .8); yy += hh; }
  B.add('far-baochu', 'metal', new THREE.CylinderGeometry(.12, .8, 10, 6), TM(bx, yy + 5, bz)); FARPOS.baochu = [bx, by, bz]; addGlow(bx, by + 22, bz, 0xffe2b0, 70);
  // 三潭石塔：球形塔身中空，五个圆孔
  SANTAN.forEach(p => { const x = p[0], z = p[1];
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
