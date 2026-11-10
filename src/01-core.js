// ───────── 01 core：工具、材质、合并构建器 ─────────
const WL = window.WL = { time: 0, film: /film/.test(location.hash), nightHooks: [] };
const { Vector3: V3, Color, Matrix4, Quaternion, Euler } = THREE;
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry(1090);
const rr = (a, b) => a + (b - a) * rnd();
function hash2(ix, iz) { let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) { const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz); return lerp(lerp(hash2(ix, iz), hash2(ix + 1, iz), u), lerp(hash2(ix, iz + 1), hash2(ix + 1, iz + 1), u), v); }
function fbm(x, z, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }

// 共享 uniform：时间、积雪、风
const U = { time: { value: 0 }, snow: { value: 0 }, wind: { value: 1 } };

// 材质表：id → 定义。season 为春夏秋冬四色；glow 为入夜自发光色
const MD = {
  stone:   { dt: 'stone', bump: .012, c: 0xbfbaad, t: 'p', snow: 1, jit: .10 },
  slab:    { dt: 'stone', bump: .01, c: 0xb1ada2, t: 'p', snow: 1, jit: .16 },
  wood:    { dt: 'wood', bump: .003, shin: 36, spec: 0x2c2420, c: 0x7a2c22, t: 'p', snow: .5, jit: .05 },
  woodDk:  { dt: 'wood', bump: .003, shin: 22, spec: 0x1c1814, c: 0x4a2d21, t: 'p', snow: .6, jit: .08 },
  tile:    { dt: 'tile', bump: .016, shin: 18, spec: 0x1b1d1f, c: 0x4b5357, t: 'p', snow: 1, jit: .12 },
  ridge:   { dt: 'tile', bump: .012, shin: 14, spec: 0x15171a, c: 0x383e41, t: 'p', snow: 1, jit: .05 },
  plaster: { dt: 'plaster', bump: .003, c: 0xefebe1, t: 'p', snow: .8, jit: .03 },
  gold:    { c: 0xc59a3a, t: 'p', snow: .3, jit: 0, shin: 60, spec: 0x554422 },
  metal:   { c: 0x2a2d2c, t: 'p', snow: .8, jit: .04 },
  benchWd: { dt: 'wood', bump: .004, shin: 14, spec: 0x15120e, c: 0x8a5b37, t: 'p', snow: 1, jit: .10 },
  rock:    { dt: 'rock', c: 0xa9a79d, t: 'l', snow: 1, jit: .08 },
  lampGl:  { c: 0xe9dcc0, t: 'p', snow: 0, glow: 0xffc978, gi: 1.25 },
  lantern: { c: 0xb3261c, t: 'p', snow: 0, glow: 0xff5a26, gi: 1.1 },
  candle:  { c: 0x2a2620, t: 'p', snow: 0, glow: 0xffd27a, gi: 1.4 },
  plaque:  { c: 0x1d1b18, t: 'p', snow: 0 },
  boatWd:  { dt: 'wood', bump: .004, shin: 16, spec: 0x15120e, c: 0x5e3e29, t: 'p', snow: .7, jit: .08 },
  canopy:  { c: 0x2c5a86, t: 'p', snow: .9, jit: .03 },
  canvasW: { c: 0xe8e4d8, t: 'p', snow: .9 },
  bark:    { dt: 'bark', c: 0x5a4636, t: 'l', snow: .8, jit: .12 },
  bed:     { c: 0x5d6048, t: 'l', snow: 0 },
  lawn:    { dt: 'lawn', c: 0x7fa85e, t: 'l', snow: .96, season: [0x7fa664, 0x5e9449, 0x9a9c58, 0xa8ae98] },
  paving:  { c: 0xc4bfb1, t: 'l', snow: .85 },
  farLand: { dt: 'lawn', c: 0x7fae68, t: 'l', snow: .95, season: [0x7c9f62, 0x5a8a4c, 0x94935a, 0xa6ac98] },
  hill1:   { dt: 'hill', c: 0x5f9a62, t: 'l', snow: .9, season: [0x5f9358, 0x3f7748, 0x8a7c48, 0x86948c] },
  hill2:   { dt: 'hill', c: 0x6fa27a, t: 'l', snow: .9, season: [0x6c9a74, 0x4a7f5e, 0x8c8862, 0x94a29e] },
  hill3:   { dt: 'hill', c: 0x86ad9a, t: 'l', snow: .9, season: [0x8aaa9c, 0x6a9684, 0x9c9a88, 0xa6b2b2] },
  pagoda:  { c: 0x6d4a34, t: 'l', snow: .5, glow: 0xffb04a, gi: .95 },
  brick:   { c: 0x94897a, t: 'l', snow: .5, glow: 0xffe2b0, gi: .5 },
  willow:  { tex: 'willow', c: 0x8cc05c, t: 'l', snow: .35, sway: 1, side: 2, season: [0xa5c95a, 0x55913f, 0xa39c44, 0xa5966c] },
  peach:   { tex: 'blossom', c: 0xf2a9bd, t: 'l', side: 2, snow: .9, sway: 1, leaf: [1, 1, .95, 0], season: [0xf09db6, 0x528c47, 0xad7d34, 0x8c8072] },
  plane:   { tex: 'broad', c: 0x6faa55, t: 'l', side: 2, snow: .9, sway: 1, leaf: [.96, 1, 1, 0], season: [0x86b55a, 0x3f7a42, 0xb9812e, 0x8c8072] },
  maple:   { tex: 'maple', c: 0x6faa55, t: 'l', side: 2, snow: .9, sway: 1, leaf: [.96, 1, 1, 0], season: [0x7fb25a, 0x478346, 0xb83d26, 0x8c8072] },
  ginkgo:  { tex: 'ginkgo', c: 0x6faa55, t: 'l', side: 2, snow: .9, sway: 1, leaf: [.95, 1, 1, 0], season: [0x92bd60, 0x508a46, 0xe6b526, 0x8c8072] },
  camphor: { tex: 'broad', c: 0x3f7f4a, t: 'l', side: 2, snow: .75, sway: 1, season: [0x548c4b, 0x2f6638, 0x3d6b3b, 0x416650] },
  plum:    { tex: 'blossom', c: 0x5d9c52, t: 'l', side: 2, snow: .2, sway: 1, leaf: [1, 1, .9, .42], season: [0x74a658, 0x478346, 0x967e3c, 0xe0567c] },
  shrub:   { tex: 'shrub', c: 0x4c8a4c, t: 'l', side: 2, snow: .9, sway: 1, season: [0x548e4b, 0x366d3b, 0x52743c, 0x476a4f] },
  azalea:  { tex: 'shrub', c: 0xd9518c, t: 'l', side: 2, snow: .9, sway: 1, season: [0xea6fa6, 0x437c43, 0x5f7c3e, 0x4e6c52] },
  bamboo:  { tex: 'bamboo', c: 0x6fa655, t: 'l', side: 2, snow: .7, sway: 1, season: [0x7dab56, 0x508847, 0x6f9448, 0x618656] },
  farTree: { dt: 'canopy', c: 0x6fa655, t: 'l', snow: .9, season: [0x86b266, 0x457d48, 0xa38436, 0x929c92] },
  farPeach:{ dt: 'canopy', c: 0xf0a8ba, t: 'l', snow: .9, season: [0xf3aabd, 0x58974f, 0xa9a047, 0x9aa49a] },
  lotus:   { c: 0x4f9a5a, t: 'l', snow: 0, side: 2 },
  lotusFl: { c: 0xf3a6c0, t: 'l', snow: 0, side: 2 },
  koi:     { c: 0xffffff, t: 'b', snow: 0 },
};
function freeArr() { this.array = null; }
const MATS = [];       // 所有实例化的材质（统一更新季节/夜色/透明度）
const MESHES = [];     // {mesh, part, matId}
const PARTS = {};      // part id → {meshes:[], visible}

// 程序化细节：按世界坐标生成石纹、木纹、瓦色、墙渍与山林斑驳，并给石/木/瓦一点凹凸
const DETAIL = {
  stone: 'float a=wn(q*1.7),c=wn(q*17.),b=c;wlH=c;diffuseColor.rgb*=(.86+.2*a)*(.93+.14*c);diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.6,.69,.58),diffuseColor.rgb,smoothstep(-.15,.5,vWp.y+a*.25));',
  wood: 'float a=wn((an.y>.55?vec2(q.x*1.,q.y*10.):vec2(q.x*11.,q.y*.9))+7.);wlH=a;diffuseColor.rgb*=.86+.22*a;',
  tile: 'float a=wn(q*.9),b=wn(q*6.),c=b;wlH=b;diffuseColor.rgb*=(.8+.34*b)*(.94+.12*c);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.39,.45,.37),smoothstep(.58,.85,a)*.32);',
  plaster: 'float a=wn(vec2(q.x*3.,q.y*.4)),b=a,c=wn(q*9.);wlH=c;diffuseColor.rgb*=(.92+.08*a)*(.96+.06*c);diffuseColor.rgb*=mix(vec3(.74,.78,.74),vec3(1.),smoothstep(.55,1.5,vWp.y+b*.5));',
  rock: 'float a=wn(q*1.3),b=wn(q*9.);diffuseColor.rgb*=(.7+.4*a)*(.82+.3*b);',
  bark: 'diffuseColor.rgb*=.76+.4*wn(vec2(q.x*16.,q.y*1.6));',
  lawn: 'float a=wn(vWp.xz*.06),b=wn(vWp.xz*.9),c=wn(vWp.xz*4.3+1.7);float fd=clamp(1.-.007/gl_FragCoord.w,0.,1.);diffuseColor.rgb*=(.84+.3*a)*mix(1.,.88+.14*b+.12*c,fd);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.08,1.02,.8),smoothstep(.55,.8,wn(vWp.xz*.021+5.))*.35);',
  canopy: 'diffuseColor.rgb*=.7+.62*wn(vWp.xy*.55)*wn(vWp.zy*.6+3.7);',
  hill: 'float a=wn(vWp.xz*.009),b=wn(vWp.xz*.07),c=wn(vWp.xz*.13),e=wn(vWp.xz*.47+3.1);float fd=clamp(1.-.0016/gl_FragCoord.w,0.,1.);diffuseColor.rgb*=(.9+.1*a+.1*b*fd)*mix(1.,.76+.28*c+.24*e,fd);'
};
function patchMat(m, d) {
  const dt = d.dt && DETAIL[d.dt], bump = dt && d.t === 'p' && d.bump;
  if (bump) m.extensions = { derivatives: true };
  m.onBeforeCompile = sh => {
    sh.uniforms.uSnow = U.snow; sh.uniforms.uSnowAmt = { value: d.snow || 0 };
    sh.uniforms.uTime = U.time; sh.uniforms.uWind = U.wind; sh.uniforms.uLeaf = m.userData.leafU; sh.uniforms.uNz = { value: cloudTex };
    sh.vertexShader = 'varying float vSnow;varying vec3 vWp,vWn;uniform float uSnow,uSnowAmt,uTime,uWind,uLeaf;\n' + (d.sway ? 'attribute vec4 aSw;\n' : '') + sh.vertexShader
      .replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\nvWn=inverseTransformDirection(transformedNormal,viewMatrix);vSnow=uSnow*uSnowAmt*smoothstep(0.2,0.8,vWn.y);')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + (d.sway ? 'transformed=aSw.xyz+(transformed-aSw.xyz)*uLeaf;float ph=uTime*1.25+aSw.x*.31+aSw.z*.27;transformed.x+=sin(ph)*aSw.w*.34*uWind;transformed.z+=cos(ph*.83+1.3)*aSw.w*.26*uWind;' : '') + 'vWp=(modelMatrix*vec4(transformed,1.)).xyz;');
    let fs = 'varying float vSnow;varying vec3 vWp,vWn;\nuniform sampler2D uNz;\nfloat wn(vec2 p){return clamp((texture2D(uNz,p*.1667).r-.5)*2.1+.5,0.,1.);}\n' + sh.fragmentShader
      .replace('#include <color_fragment>', '#include <color_fragment>\nfloat wlH=0.;' + (dt ? '{vec3 an=abs(vWn);vec2 q=an.y>.55?vWp.xz:(an.x>an.z?vWp.zy:vWp.xy);' + dt + '}' : '') + '\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.93,.95,.97),vSnow);');
    if (d.tex) fs = fs.replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;', 'reflectedLight.directDiffuse = max(vLightFront,vLightBack)*.74+min(vLightFront,vLightBack)*.26;');
    if (bump) fs = fs.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n{vec3 wsx=dFdx(vViewPosition),wsy=dFdy(vViewPosition);float whx=dFdx(wlH),why=dFdy(wlH);vec3 wr1=cross(wsy,normal),wr2=cross(normal,wsx);float wdet=dot(wsx,wr1);normal=normalize(abs(wdet)*normal-' + d.bump.toFixed(4) + '*(1.-vSnow)*sign(wdet)*(whx*wr1+why*wr2));}');
    sh.fragmentShader = fs;
  };
  m.customProgramCacheKey = () => [d.dt || '', d.bump || 0, d.sway || 0, d.t, d.tex ? 1 : 0].join('|');
}
// 叶片贴图：画布上画出一簇叶形（带透明），按季节色相乘
const LEAFTEX = {};
function leafTex(kind) {
  if (LEAFTEX[kind]) return LEAFTEX[kind];
  const r = mulberry(kind.length * 131 + kind.charCodeAt(0) * 7), R = (a, b) => a + (b - a) * r();
  const t = canvasTex(256, 256, (c, w) => {
    c.clearRect(0, 0, w, w);
    const shade = (v, k) => `rgb(${v * k | 0},${v * k | 0},${v * k * .96 | 0})`;
    const leaf = (x, y, len, wd, a, v) => { c.save(); c.translate(x, y); c.rotate(a); const g = c.createLinearGradient(0, -wd, 0, wd); g.addColorStop(0, shade(v, 1)); g.addColorStop(1, shade(v, .74)); c.fillStyle = g; c.beginPath(); c.moveTo(-len / 2, 0); c.quadraticCurveTo(0, -wd * 1.25, len / 2, 0); c.quadraticCurveTo(0, wd * 1.25, -len / 2, 0); c.fill(); c.strokeStyle = 'rgba(70,80,60,.4)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-len / 2, 0); c.lineTo(len / 2, 0); c.stroke(); c.restore(); };
    if (kind === 'broad') for (let i = 0; i < 40; i++) leaf(R(10, 246), R(10, 246), R(54, 84), R(13, 19), R(0, 6.28), R(175, 255));
    else if (kind === 'shrub') for (let i = 0; i < 130; i++) leaf(R(6, 250), R(6, 250), R(22, 32), R(6, 9), R(0, 6.28), R(170, 255));
    else if (kind === 'bamboo') for (let n = 0; n < 9; n++) { const x = R(40, 216), y = R(40, 216), a0 = R(0, 6.28); for (let i = 0; i < 4; i++) { const a = a0 + (i - 1.5) * .42, l = R(80, 118); leaf(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2, l, R(6, 8), a, R(185, 255)); } }
    else if (kind === 'ginkgo') for (let i = 0; i < 44; i++) { const x = R(14, 242), y = R(14, 242), a = R(0, 6.28), rad = R(26, 38), v = R(185, 255); c.save(); c.translate(x, y); c.rotate(a); const g = c.createRadialGradient(0, 0, 2, 0, 0, rad); g.addColorStop(0, shade(v, .72)); g.addColorStop(1, shade(v, 1)); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, rad, -2.55, -.6); c.closePath(); c.fill(); c.strokeStyle = shade(v, .7); c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, rad * .5); c.stroke(); c.restore(); }
    else if (kind === 'maple') for (let i = 0; i < 40; i++) { const x = R(14, 242), y = R(14, 242), a = R(0, 6.28), rad = R(24, 36), v = R(180, 255); c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = shade(v, 1); c.beginPath(); for (let k = 0; k < 14; k++) { const an = k / 14 * 6.283, rr2 = k % 2 ? rad * .4 : rad * (k === 7 ? .5 : 1); c.lineTo(Math.sin(an) * rr2, -Math.cos(an) * rr2); } c.closePath(); c.fill(); c.strokeStyle = shade(v, .72); c.lineWidth = 1; for (let k = 0; k < 14; k += 2) { const an = k / 14 * 6.283; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(an) * rad * .8, -Math.cos(an) * rad * .8); c.stroke(); } c.restore(); }
    else if (kind === 'blossom') { for (let i = 0; i < 9; i++) leaf(R(10, 246), R(10, 246), R(36, 50), R(8, 11), R(0, 6.28), R(150, 190));
      for (let i = 0; i < 34; i++) { const x = R(14, 242), y = R(14, 242), pr = R(8, 12), a0 = R(0, 6.28), v = R(215, 255); for (let k = 0; k < 5; k++) { const a = a0 + k * 1.2566; c.fillStyle = shade(v, k % 2 ? 1 : .93); c.beginPath(); c.ellipse(x + Math.cos(a) * pr * .9, y + Math.sin(a) * pr * .9, pr, pr * .78, a, 0, 6.283); c.fill(); } c.fillStyle = shade(v, .6); c.beginPath(); c.arc(x, y, pr * .32, 0, 6.283); c.fill(); } }
    else if (kind === 'willow') { c.strokeStyle = shade(170, 1); c.lineWidth = 3; c.beginPath(); c.moveTo(128, 0); c.lineTo(128, 256); c.stroke();
      for (let y = -32; y < 290; y += 16) { const sd = (Math.round(y / 16) % 2) ? 1 : -1, a = sd > 0 ? R(.85, 1.15) : Math.PI - R(.85, 1.15), l = R(64, 86); [0, -256, 256].forEach(o => leaf(128 + Math.cos(a) * l / 2, y + o + Math.sin(a) * l / 2, l, R(6, 8), a, R(185, 255))); } }
  }, true);
  t.anisotropy = WL.film ? 1 : 8; return LEAFTEX[kind] = t;
}
function makeMat(id, extra, useTex) {
  const d = MD[id];
  const p = Object.assign({ color: d.c, vertexColors: true, side: d.side === 2 ? THREE.DoubleSide : THREE.FrontSide }, extra || {});
  if (useTex && d.tex) { p.map = leafTex(d.tex); p.alphaTest = .28; }
  let m;
  if (d.t === 'p') { m = new THREE.MeshPhongMaterial(p); m.shininess = d.shin || 6; m.specular = new Color(d.spec || 0x0c0c0c); }
  else if (d.t === 'b') m = new THREE.MeshBasicMaterial(p);
  else m = new THREE.MeshLambertMaterial(p);
  m.userData = { id, d, base: new Color(d.c), leafU: { value: 1 }, season: d.season ? d.season.map(h => new Color(h)) : null, glow: d.glow ? new Color(d.glow) : null };
  if (d.t !== 'b') patchMat(m, d);
  MATS.push(m); return m;
}
function regMesh(mesh, part, matId) {
  (PARTS[part] || (PARTS[part] = { meshes: [], visible: true })).meshes.push(mesh);
  MESHES.push({ mesh, part, matId }); mesh.userData.part = part; return mesh;
}

// 变换工具（返回共享临时矩阵，立即使用）
const _m = new Matrix4(), _m2 = new Matrix4(), _q = new Quaternion(), _e = new Euler(), _s = new V3(), _p = new V3();
function TM(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) { _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); return _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); }
const UBOX = (() => { const g = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(); return { p: g.attributes.position.array, n: g.attributes.normal.array }; })();
const _n3 = new THREE.Matrix3();

class Builder {
  constructor() { this.b = new Map(); this.base = null; }
  _bk(part, mat, tex) { const k = part + '|' + mat + (tex ? '|t' : ''); let o = this.b.get(k); if (!o) { o = { part, mat, tex: !!tex, p: [], n: [], c: [], w: null, uv: tex ? [] : null }; this.b.set(k, o); } return o; }
  _push(o, P, N, m, tint, SW, C) {
    if (m && this.base) m = _m2.multiplyMatrices(this.base, m); else if (this.base) m = this.base;
    let t = tint == null ? 1 + (rnd() - .5) * (MD[o.mat].jit || 0) : tint, tr = t, tg = t, tb = t;
    if (Array.isArray(t)) { tr = t[0]; tg = t[1]; tb = t[2]; }
    const p = o.p, n = o.n, c = o.c;
    if (m) {
      const e = m.elements, k = _n3.getNormalMatrix(m).elements;
      for (let i = 0; i < P.length; i += 3) {
        const x = P[i], y = P[i + 1], z = P[i + 2];
        p.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
        const a = N[i], b = N[i + 1], d = N[i + 2]; let nx = k[0] * a + k[3] * b + k[6] * d, ny = k[1] * a + k[4] * b + k[7] * d, nz = k[2] * a + k[5] * b + k[8] * d; const l = Math.hypot(nx, ny, nz) || 1;
        n.push(nx / l, ny / l, nz / l); if (C) c.push(tr * C[i], tg * C[i + 1], tb * C[i + 2]); else c.push(tr, tg, tb);
      }
    } else for (let i = 0; i < P.length; i += 3) { p.push(P[i], P[i + 1], P[i + 2]); n.push(N[i], N[i + 1], N[i + 2]); if (C) c.push(tr * C[i], tg * C[i + 1], tb * C[i + 2]); else c.push(tr, tg, tb); }
    if (MD[o.mat].sway) { if (!o.w) o.w = []; if (SW) for (let i = 0; i < SW.length; i++) o.w.push(SW[i]); else for (let i = p.length - P.length; i < p.length; i += 3) o.w.push(p[i], p[i + 1], p[i + 2], 0); }
  }
  add(part, mat, geo, m, tint) {
    const g = geo.index ? geo.toNonIndexed() : geo; if (!g.attributes.normal) g.computeVertexNormals();
    this._push(this._bk(part, mat), g.attributes.position.array, g.attributes.normal.array, m, tint, g.attributes.aSw && g.attributes.aSw.array, g.attributes.color && g.attributes.color.array);
  }
  // 轴对齐盒（可绕 Y 旋转）
  box(part, mat, cx, cy, cz, sx, sy, sz, ry = 0, tint) { this._push(this._bk(part, mat), UBOX.p, UBOX.n, TM(cx, cy, cz, ry, sx, sy, sz), tint); }
  // 两点之间的方杆
  seg(part, mat, a, b, w, h, tint) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz) || 1e-6;
    const zx = dx / len, zy = dy / len, zz = dz / len;
    let xx = zz, xy = 0, xz = -zx; let l = Math.hypot(xx, xz); if (l < 1e-5) { xx = 1; xz = 0; l = 1; } xx /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    _m.set(xx * w, yx * h, zx * len, (a[0] + b[0]) / 2, xy * w, yy * h, zy * len, (a[1] + b[1]) / 2, xz * w, yz * h, zz * len, (a[2] + b[2]) / 2, 0, 0, 0, 1);
    this._push(this._bk(part, mat), UBOX.p, UBOX.n, _m, tint);
  }
  flush(root, o = {}) {
    const out = [];
    for (const k of this.b.values()) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(k.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(k.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(k.c, 3));
      if (MD[k.mat].sway) { const w = k.w || new Array(k.p.length / 3 * 4).fill(0); g.setAttribute('aSw', new THREE.Float32BufferAttribute(w, 4)); }
      const mesh = new THREE.Mesh(g, makeMat(k.mat, null, k.tex));
      if (k.tex) { g.setAttribute('uv', new THREE.Float32BufferAttribute(k.uv, 2)); mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: mesh.material.map, alphaTest: .28, side: THREE.DoubleSide }); }
      mesh.castShadow = o.cast !== false; mesh.receiveShadow = o.receive !== false;
      g.computeBoundingSphere(); for (const n in g.attributes) g.attributes[n].onUpload(freeArr);   // 上传显卡后释放内存里的副本
      regMesh(mesh, k.part, k.mat); root.add(mesh); out.push(mesh);
    }
    this.b.clear(); return out;
  }
}
const B = new Builder();
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.anisotropy = WL.film ? 1 : 4; return t; }
