// ───────── 05 state：四季、天光、天气、相机、主循环 ─────────
const ST = { season: 0, tod: 0, rain: 0, opacity: 1, focus: null };
const TG = { season: 0, tod: 0, rain: 0 };
function S4n(a, s) { const k = Math.floor(s), f = s - k, t = f * f * (3 - 2 * f), i = ((k % 4) + 4) % 4; return lerp(a[i], a[(i + 1) % 4], t); }
function S4c(a, s, out) { const k = Math.floor(s), f = s - k, t = f * f * (3 - 2 * f), i = ((k % 4) + 4) % 4; return out.copy(a[i]).lerp(a[(i + 1) % 4], t); }
const hx = a => a.map(h => new Color(h));
const K = {
  zenDay: hx([0x6aa6dc, 0x3d86d8, 0x4b90e2, 0x9db4c8]), horDay: hx([0xdbe8ea, 0xcfe5f1, 0xe4edf2, 0xe3e8ec]),
  horDusk: hx([0xf4b98c, 0xf79c55, 0xf38b3f, 0xeab8a2]), water: hx([0x3a6861, 0x2e5f4d, 0x33586b, 0x5a6e75]),
  fogD: [.00085, .0006, .0005, .0011], cloud: [.42, .3, .2, .55],
  zenDusk: new Color(0x47578f), zenNight: new Color(0x0a1128), horNight: new Color(0x1d2c4a),
  D0: new V3(-.5, .44, .75).normalize(), D1: new V3(-.93, .11, .2).normalize(), D2: new V3(-.85, -.3, .1).normalize(),
  sunDay: new Color(0xfff1d6), sunDusk: new Color(0xff8d42), moon: new Color(0x9db7ea),
  petal: new Color(0xf6b6c8), leaf: new Color(0xd9a23a)
};
const _c1 = new Color(), _c2 = new Color(), _c3 = new Color();
const circ = (s, k) => { const d = Math.abs((((s - k) % 4) + 6) % 4 - 2); return clamp(1 - d, 0, 1); };
function applyEnv() {
  const s = ST.season, tod = ST.tod, rain = ST.rain;
  const duskW = 1 - Math.abs(tod * 2 - 1), nightW = clamp(tod * 2 - 1, 0, 1), wWin = circ(s, 3), wSpr = circ(s, 0), wSum = circ(s, 1), wAut = circ(s, 2);
  S4c(K.zenDay, s, _c1); S4c(K.horDay, s, _c2); S4c(K.horDusk, s, _c3);
  if (tod < .5) { ENV.zen.copy(_c1).lerp(K.zenDusk, tod * 2); ENV.hor.copy(_c2).lerp(_c3, sstep(0, 1, tod * 2)); }
  else { ENV.zen.copy(K.zenDusk).lerp(K.zenNight, sstep(0, 1, (tod - .5) * 2)); ENV.hor.copy(_c3).lerp(K.horNight, sstep(0, .9, (tod - .5) * 2)); }
  _c1.setHex(0x8e9aa0).lerp(_c2.setHex(0x0b0f17), nightW); ENV.zen.lerp(_c1, rain * .85);
  _c1.setHex(0xc2cacb).lerp(_c2.setHex(0x151b26), nightW); ENV.hor.lerp(_c1, rain * .85);
  if (tod < .5) ENV.sunDir.copy(K.D0).lerp(K.D1, sstep(0, 1, tod * 2)).normalize(); else ENV.sunDir.copy(K.D1).lerp(K.D2, (tod - .5) * 2).normalize();
  ENV.sunCol.copy(K.sunDay).lerp(K.sunDusk, sstep(.12, .5, tod));
  const night = sstep(.56, .8, tod); ENV.night = night;
  const sunK = (1 - sstep(.56, .72, tod)), moonK = sstep(.72, .9, tod);
  if (tod < .72) { ENV.lightDir.copy(ENV.sunDir); sun.color.copy(ENV.sunCol); sun.intensity = lerp(.8, .76, duskW) * sunK * (1 - rain * .6); ENV.spec.copy(ENV.sunCol).multiplyScalar(sunK * (1 - rain)); }
  else { ENV.lightDir.copy(ENV.moonDir); sun.color.copy(K.moon); sun.intensity = .5 * moonK * (1 - rain * .5); ENV.spec.setRGB(.75, .82, 1).multiplyScalar(.55 * moonK * (1 - rain)); }
  if (ENV.lightDir.y < .06) { ENV.lightDir.y = .06; ENV.lightDir.normalize(); }
  fill.position.set(-ENV.lightDir.x * 100, 60, -ENV.lightDir.z * 100); fill.color.copy(ENV.hor); fill.intensity = lerp(.3, .07, nightW) * (1 - rain * .4);
  hemi.color.copy(ENV.zen).lerp(ENV.hor, .5); hemi.groundColor.setHex(0x8d957f).lerp(_c1.setHex(0x1a2230), nightW);
  hemi.intensity = (tod < .5 ? lerp(.64, .56, tod * 2) : lerp(.56, .3, (tod - .5) * 2)) + wWin * .08 * (1 - nightW);
  ENV.fog.copy(ENV.hor).lerp(ENV.zen, .14); scene.fog.color.copy(ENV.fog);
  const fd = S4n(K.fogD, s) * (1 + rain * 1.7) * (1 - nightW * .18); scene.fog.density = fd; waterU.uFogD.value = fd;
  S4c(K.water, s, waterU.uDeep.value).multiplyScalar(lerp(1, .24, nightW)).lerp(_c1.copy(ENV.hor).multiplyScalar(.45), rain * .4);
  waterU.uRain.value = rain * (1 - wWin); waterU.uWave.value = 1 + rain * .35 - wWin * .15; waterU.uNight.value = nightW;
  U.snow.value = sstep(0, 1, wWin); U.wind.value = 1 + rain * .7;
  skyU.uCloud.value = clamp(S4n(K.cloud, s) + rain * .5, 0, 1); skyU.uNight.value = nightW; skyU.uSunVis.value = (1 - sstep(.55, .75, tod)) * (1 - rain * .9);
  const pu = FL.petal.userData.u; pu.uOp.value = clamp(wSpr + wAut, 0, 1) * (1 - rain) * .95; pu.uCol.value.copy(K.petal).lerp(K.leaf, wAut / Math.max(wSpr + wAut, 1e-3)).multiplyScalar(lerp(1, .35, nightW));
  FL.snow.userData.u.uOp.value = wWin * (.3 + .7 * rain) * .9; FL.snow.userData.u.uCol.value.setScalar(lerp(1, .6, nightW));
  FL.rain.userData.u.uOp.value = rain * (1 - wWin) * .8; FL.fly.userData.u.uOp.value = wSum * nightW * (1 - rain);
  for (const m of MATS) { const u = m.userData, d = u.d;
    if (u.season) S4c(u.season, s, m.color); if (u.glow) m.emissive.copy(u.glow).multiplyScalar(night * d.gi); if (d.leaf) u.leafU.value = S4n(d.leaf, s); }
  let cs = 0; for (const e of MESHES) if (e.matId && MD[e.matId].leaf) { const c = e.mesh.material.userData.leafU.value > .3; e.mesh.castShadow = c; cs += c ? 1 : 0; } WL.castSig = cs;
  glowU.uOn.value = night; poolMat.opacity = night * .5; for (const l of nightLights) l.intensity = night * l.userData.i;
  updateLotus(s);
}
function applyOpacity() {
  const f = ST.focus; WL.shadowDirty = true;
  for (const e of MESHES) {
    const act = !f || (f.parts ? f.parts.includes(e.part) : f.mats.includes(e.matId)), k = ST.opacity * (act ? 1 : .05);
    if (e.mesh === water) { waterU.uOp.value = ST.opacity * (act ? 1 : .22); water.material.transparent = waterU.uOp.value < 1; continue; }
    if (e.part === 'glow') continue;
    for (const m of [].concat(e.mesh.material)) { if (m.userData.bo == null) { m.userData.bo = m.opacity; m.userData.bt = m.transparent; m.userData.bd = m.depthWrite; }
      m.opacity = m.userData.bo * k; m.transparent = m.userData.bt || k < 1; m.depthWrite = m.userData.bd && k > .45; }
    if (e.mesh.userData.cast == null) e.mesh.userData.cast = e.mesh.castShadow;
  }
}
function setPartVisible(id, v) { const p = PARTS[id]; if (!p) return; p.visible = v; p.meshes.forEach(m => m.visible = v); WL.shadowDirty = true; }

// 相机：环绕 + 平移 + 缩放，带阻尼与飞行
const CAM = { t: new V3(-14, 2, -4), th: .66, ph: 1.22, r: 68, look: new V3(), d: { t: new V3(-14, 2, -4), th: .66, ph: 1.22, r: 68 }, fly: null, free: null };
function poseToOrbit(p, l) { const dx = p[0] - l[0], dy = p[1] - l[1], dz = p[2] - l[2], r = Math.hypot(dx, dy, dz); return { t: new V3(l[0], l[1], l[2]), th: Math.atan2(dx, dz), ph: Math.acos(clamp(dy / r, -1, 1)), r }; }
function flyTo(p, l, dur = 2.4) {
  const o = poseToOrbit(p, l), d = CAM.d; CAM.free = null;
  let dth = ((o.th - d.th + PI * 3) % TAU) - PI;
  CAM.fly = { t0: WL.time, dur, a: { t: d.t.clone(), th: d.th, ph: d.ph, r: d.r }, b: { t: o.t, th: d.th + dth, ph: o.ph, r: o.r } };
}
function updateCam(dt) {
  const d = CAM.d;
  if (CAM.fly) { const f = CAM.fly, u = clamp((WL.time - f.t0) / f.dur, 0, 1), e = u * u * u * (u * (u * 6 - 15) + 10);
    d.t.lerpVectors(f.a.t, f.b.t, e); d.th = lerp(f.a.th, f.b.th, e); d.ph = lerp(f.a.ph, f.b.ph, e); d.r = Math.exp(lerp(Math.log(f.a.r), Math.log(f.b.r), e)); if (u >= 1) CAM.fly = null; }
  if (CAM.free) { camera.position.copy(CAM.free.p); CAM.look.copy(CAM.free.l); camera.lookAt(CAM.look); return; }
  const k = WL.film ? 1 : 1 - Math.exp(-dt * 9);
  CAM.t.lerp(d.t, k); CAM.th += (d.th - CAM.th) * k; CAM.ph += (d.ph - CAM.ph) * k; CAM.r += (d.r - CAM.r) * k;
  const sp = Math.sin(CAM.ph); camera.position.set(CAM.t.x + CAM.r * sp * Math.sin(CAM.th), CAM.t.y + CAM.r * Math.cos(CAM.ph), CAM.t.z + CAM.r * sp * Math.cos(CAM.th));
  const minY = isLand(camera.position.x, camera.position.z) ? Y0 + .5 : .3; if (camera.position.y < minY) camera.position.y = minY;
  CAM.look.copy(CAM.t); camera.lookAt(CAM.look);
}
function userMoved() { CAM.fly = null; if (CAM.free) { const o = poseToOrbit(CAM.free.p.toArray(), CAM.free.l.toArray()); CAM.free = null; Object.assign(CAM.d, { th: o.th, ph: o.ph, r: o.r }); CAM.d.t.copy(o.t); CAM.t.copy(o.t); CAM.th = o.th; CAM.ph = o.ph; CAM.r = o.r; } if (WL.onUserMove) WL.onUserMove(); }
(function controls() {
  const pts = new Map(); let moved = 0, pinch = 0, downT = 0;
  const rot = (dx, dy) => { CAM.d.th -= dx * .0052; CAM.d.ph = clamp(CAM.d.ph - dy * .0046, .12, 1.72); };
  const pan = (dx, dy) => { const k = CAM.d.r * .0013, c = Math.cos(CAM.d.th), s = Math.sin(CAM.d.th); CAM.d.t.x += (-dx * c - dy * s) * k; CAM.d.t.z += (dx * s - dy * c) * k; CAM.d.t.x = clamp(CAM.d.t.x, -170, 90); CAM.d.t.z = clamp(CAM.d.t.z, -230, 230); };
  canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY, e.button, e.shiftKey]); moved = 0; downT = performance.now(); pinch = 0; });
  canvas.addEventListener('pointermove', e => { const p = pts.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 5 && (CAM.fly || CAM.free)) userMoved();
    if (pts.size === 1) { if (moved > 5) (p[2] === 2 || p[3]) ? pan(dx, dy) : rot(dx, dy); }
    else if (pts.size === 2) { const a = [...pts.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch) CAM.d.r = clamp(CAM.d.r * pinch / d, 1.6, 420); pinch = d; pan(dx * .5, dy * .5); } });
  const up = e => { const p = pts.get(e.pointerId); pts.delete(e.pointerId); pinch = 0; if (p && moved < 6 && performance.now() - downT < 500 && WL.onTap) WL.onTap(e.clientX, e.clientY); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = 0; });
  canvas.addEventListener('wheel', e => { e.preventDefault(); userMoved(); CAM.d.r = clamp(CAM.d.r * Math.exp(e.deltaY * .0011), 1.6, 420); }, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
})();
const _ray = new THREE.Raycaster(), _v2 = new THREE.Vector2();
function pickWater(cx, cy) { const r = canvas.getBoundingClientRect(); _v2.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); _ray.setFromCamera(_v2, camera); const o = _ray.ray.origin, d = _ray.ray.direction; if (d.y > -1e-3) return null; const t = -o.y / d.y; if (t > 400) return null; const x = o.x + d.x * t, z = o.z + d.z * t; return isLand(x, z) ? null : [x, z]; }

// 荷灯
const NL = 36, lanterns = []; let lanternM = null, lanternI = 0, lanternG0 = 0;
function buildLanterns() {
  const g = new THREE.ConeGeometry(.2, .18, 8, 1, true); g.rotateX(PI); g.translate(0, .1, 0);
  lanternM = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: 0xffa9b6, side: THREE.DoubleSide }), NL); lanternM.frustumCulled = false; world.add(lanternM); regMesh(lanternM, 'lanterns', null);
  lanternG0 = glowData.s.length; for (let i = 0; i < NL; i++) { addGlow(0, -50, 0, 0xffb070, 0); lanterns.push({ on: false, x: 0, z: 0, t: 0 }); lanternM.setMatrixAt(i, _lm.makeScale(0, 0, 0)); }
}
function releaseLantern(x, z) { const l = lanterns[lanternI]; l.on = true; l.x = x; l.z = z; l.t = WL.time; glow.geometry.attributes.aS.setX(lanternG0 + lanternI, 1.25); glow.geometry.attributes.aS.needsUpdate = true; lanternI = (lanternI + 1) % NL; }
function updateLanterns(dt, t) {
  let any = false; const gp = glow.geometry.attributes.position;
  lanterns.forEach((l, i) => { if (!l.on) return; any = true; l.x -= dt * .16; l.z += dt * (.09 + .05 * Math.sin(i * 1.7)); const y = .02 + Math.sin(t * 1.4 + i) * .012, k = clamp((t - l.t) * 1.5, 0, 1);
    lanternM.setMatrixAt(i, _lm.compose(_p.set(l.x, y, l.z), _q.setFromEuler(_e.set(Math.sin(t + i) * .05, i, Math.cos(t * .8 + i) * .05)), _s.set(k, k, k))); gp.setXYZ(lanternG0 + i, l.x, y + .16, l.z); });
  if (any) { lanternM.instanceMatrix.needsUpdate = true; gp.needsUpdate = true; }
}

// 主循环
let W = 1, H = 1, RS = WL.film ? .5 : .6;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; W = w; H = h;
  renderer.setPixelRatio(PR); renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 58 : 46; camera.updateProjectionMatrix();
  reflRT.setSize(Math.max(64, Math.round(w * PR * RS)), Math.max(64, Math.round(h * PR * RS)));
  const sc = h * PR / (2 * Math.tan(camera.fov * PI / 360)); glowU.uScale.value = sc; for (const k in FL) FL[k].userData.u.uScale.value = sc;
}
const _fw = new V3();
function frame(dt) {
  WL.time += dt; U.time.value = WL.time; const t = WL.time;
  // 状态过渡
  if (ST.season !== TG.season) { ST.season = Math.min(TG.season, ST.season + dt * .5); if (ST.season === TG.season && TG.season >= 4) { ST.season -= 4; TG.season -= 4; } }
  if (ST.tod !== TG.tod) ST.tod += clamp(TG.tod - ST.tod, -dt * .3, dt * .3);
  if (ST.rain !== TG.rain) ST.rain += clamp(TG.rain - ST.rain, -dt * .5, dt * .5);
  if (WL.tick) WL.tick(dt, t);
  applyEnv(); updateCam(dt); camera.updateMatrixWorld();
  // 阴影相机：范围分级、中心按阴影贴图的像素对齐，镜头移动时影子不闪
  { const sc = sun.shadow.camera, L = ENV.lightDir, fx = WL.shadowFix; let half, cx, cz;
    if (fx) { cx = fx[0]; cz = fx[1]; half = fx[2]; }
    else { const need = Math.max(camera.position.distanceTo(CAM.look) * 1.05 + 14, 30); half = Math.min(30 * Math.pow(1.35, Math.ceil(Math.log(need / 30) / Math.log(1.35) - 1e-6)), 260); cx = lerp(CAM.look.x, camera.position.x, .35); cz = lerp(CAM.look.z, camera.position.z, .35); }
    let rx = L.z, rz = -L.x; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
    const ux = L.y * rz, uy = L.z * rx - L.x * rz, uz = -L.y * rx, tx = 2 * half / 2048;
    const pr = cx * rx + cz * rz, pu = cx * ux + cz * uz, dr = Math.round(pr / tx) * tx - pr, du = Math.round(pu / tx) * tx - pu;
    sun.target.position.set(cx + rx * dr + ux * du, uy * du, cz + rz * dr + uz * du); sun.position.copy(sun.target.position).addScaledVector(L, 420);
    if (sc.right !== half) { sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.updateProjectionMatrix(); }
    // 影子只在光向、范围或投影物变化时重画（枝叶摇动不进阴影），静止画面省掉一整遍绘制
    const tp = sun.target.position, sig = [tp.x.toFixed(3), tp.y.toFixed(3), tp.z.toFixed(3), half, L.x.toFixed(4), L.y.toFixed(4), L.z.toFixed(4), WL.castSig].join();
    if (sig !== WL.shSig || WL.shadowDirty) { WL.shSig = sig; WL.shadowDirty = false; renderer.shadowMap.needsUpdate = true; } }
  // 飘落物围绕视点
  camera.getWorldDirection(_fw); for (const k in FL) { const u = FL[k].userData.u; u.uC.value.copy(camera.position).addScaledVector(_fw, u.uBox.value.x * .36); if (k === 'fly') u.uC.value.y = 2.2; else u.uC.value.y = Math.max(u.uC.value.y, u.uBox.value.y * .42); FL[k].visible = u.uOp.value > .01; }
  boats.forEach(b => { b.grp.position.y = Math.sin(t * .9 + b.ph) * .03; b.grp.rotation.z = Math.sin(t * .7 + b.ph) * .022; b.grp.rotation.x = Math.sin(t * .55 + b.ph * 2) * .012; });
  updateKoi(dt, t); updateLanterns(dt, t); ripGate();
  sky.position.copy(camera.position);
  renderer.shadowMap.autoUpdate = false;
  if (water.visible) renderReflection();
  renderer.render(scene, camera);
  if (WL.post) WL.post();
}
let last = 0, slow = 0, acc = 0, nfr = 0;
function loop(now) {
  requestAnimationFrame(loop); if (WL.film) return;
  const dt = Math.min((now - last) / 1000 || .016, .1); last = now; frame(dt);
  acc += dt; nfr++; if (acc > 2) { const avg = acc / nfr; acc = 0; nfr = 0; if (avg > .045 && slow < 3) { slow++; if (PR > 1) PR = Math.max(1, PR * .75); else if (RS > .35) RS = .35; else renderer.shadowMap.enabled = false, MATS.forEach(m => m.needsUpdate = true); resize(); } }
}
