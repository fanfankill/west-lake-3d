// ───────── 02 env：渲染器、天空、湖水、倒影、粒子、光晕 ─────────
// 阴影采样由 17 次减为 4 次双线性：边缘依然平滑，每个受光像素省下大半开销
{ const C = THREE.ShaderChunk, k = 'shadowmap_pars_fragment', a = C[k].indexOf('#if defined( SHADOWMAP_TYPE_PCF )'), b = C[k].indexOf('#elif defined( SHADOWMAP_TYPE_PCF_SOFT )');
  if (a > 0 && b > a) C[k] = C[k].slice(0, a) + '#if defined( SHADOWMAP_TYPE_PCF )\nvec2 suv=shadowCoord.xy*shadowMapSize-.5,sf=fract(suv),sb=(floor(suv)+.5)/shadowMapSize,st=1./shadowMapSize;shadow=mix(mix(texture2DCompare(shadowMap,sb,shadowCoord.z),texture2DCompare(shadowMap,sb+vec2(st.x,0.),shadowCoord.z),sf.x),mix(texture2DCompare(shadowMap,sb+vec2(0.,st.y),shadowCoord.z),texture2DCompare(shadowMap,sb+st,shadowCoord.z),sf.x),sf.y);\n' + C[k].slice(b); }
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !/noaa/.test(location.hash), preserveDrawingBuffer: WL.film, powerPreference: 'high-performance' });
let PR = WL.film ? 1 : Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(PR);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0xd5e4ea, 0.0012);
const camera = new THREE.PerspectiveCamera(46, 1, 0.25, 9000);
const world = new THREE.Group(); scene.add(world);

const ENV = { sunDir: new V3(0, 1, 0), lightDir: new V3(0, 1, 0), moonDir: new V3(-.728, .309, -.611).normalize(), zen: new Color(), hor: new Color(), sunCol: new Color(), spec: new Color(), fog: new Color(), night: 0 };

// 可平铺的云噪声
const cloudTex = (() => { const S = 256, d = new Uint8Array(S * S * 4), tn = (x, y, P) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), h = (a, b) => hash2(((a % P) + P) % P + P * 7, ((b % P) + P) % P); return lerp(lerp(h(ix, iy), h(ix + 1, iy), u), lerp(h(ix, iy + 1), h(ix + 1, iy + 1), u), v); };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let s = 0, a = .5, P = 6; for (let o = 0; o < 5; o++) { s += a * tn(x / S * P, y / S * P, P); P *= 2; a *= .5; } const i = (y * S + x) * 4; d[i] = d[i + 1] = d[i + 2] = clamp(s * 265, 0, 255); d[i + 3] = 255; }
  const t = new THREE.DataTexture(d, S, S, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t; })();
// 天空
const skyU = { tC: { value: cloudTex },  uZen: { value: ENV.zen }, uHor: { value: ENV.hor }, uSunDir: { value: ENV.sunDir }, uSunCol: { value: ENV.sunCol }, uMoonDir: { value: ENV.moonDir }, uNight: { value: 0 }, uTime: U.time, uCloud: { value: .3 }, uSunVis: { value: 1 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 40, 20), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, depthTest: true, fog: false,
  vertexShader: 'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `varying vec3 vDir;uniform sampler2D tC;uniform vec3 uZen,uHor,uSunDir,uSunCol,uMoonDir;uniform float uNight,uTime,uCloud,uSunVis;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec3 d=normalize(vDir);float h=clamp(d.y,0.,1.);
vec3 col=mix(uHor,uZen,pow(h,.52));
float sd=max(dot(d,uSunDir),0.);
if(uSunVis>.001)col+=uSunCol*(pow(sd,1200.)*5.+pow(sd,90.)*.45+pow(sd,7.)*.2)*uSunVis;
if(uNight>.01){float md=max(dot(d,uMoonDir),0.);
col+=vec3(1.,.98,.9)*smoothstep(.99955,.9998,md)*uNight*1.3+vec3(.5,.6,.85)*pow(md,260.)*.4*uNight;
vec3 sp=d*230.;vec3 cl=floor(sp);float st=h21(cl.xy+cl.z*17.3);
float star=step(.996,st)*smoothstep(.3,.0,length(fract(sp)-.5))*(.65+.35*sin(uTime*2.+st*90.))*smoothstep(.02,.22,d.y);
col+=star*uNight*(1.-uCloud*.8)*1.4;
col+=vec3(.5,.3,.14)*uNight*.3*pow(1.-h,9.)*smoothstep(-.3,.9,d.x);}
if(d.y>.005){vec2 cp=d.xz/(d.y+.14)*.16+uTime*vec2(.0006,.00033);float c=texture2D(tC,cp).r*.7+texture2D(tC,cp*2.7+.37).r*.3;
float cov=smoothstep(.62-uCloud*.36,.86-uCloud*.3,c)*smoothstep(0.,.14,d.y);
vec3 cc=(mix(uHor,vec3(1.),.55)*(1.-uNight*.8)+uSunCol*.4*pow(sd,3.)*uSunVis);col=mix(col,cc,cov*.82);}
gl_FragColor=vec4(col,1.);}`
}));
sky.renderOrder = 3; sky.frustumCulled = false; scene.add(sky);

// 灯光
const hemi = new THREE.HemisphereLight(0xcfe2f2, 0x6b7a5a, .6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff3dd, 1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10; sun.shadow.camera.far = 900; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.06; scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xdfe8f0, .25); scene.add(fill, fill.target);
const nightLights = [];
function addNightLight(x, y, z, color, intensity, dist) { const l = new THREE.PointLight(color, 0, dist, 1.6); l.position.set(x, y, z); l.userData.i = intensity; scene.add(l); nightLights.push(l); return l; }

// 水面法线贴图：可平铺的余弦波叠加
const waterN = (() => {
  const S = 256, d = new Uint8Array(S * S * 4), r = mulberry(7), W = [];
  for (let i = 0; i < 34; i++) { const k = 1.5 + Math.pow(r(), 1.6) * 22, a = r() * TAU; let kx = Math.round(Math.cos(a) * k), ky = Math.round(Math.sin(a) * k); if (!kx && !ky) kx = 1; W.push([kx, ky, r() * TAU, 1 / Math.pow(Math.hypot(kx, ky), 1.15)]); }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let gx = 0, gy = 0, h = 0; const u = x / S, v = y / S;
    for (const w of W) { const ph = TAU * (w[0] * u + w[1] * v) + w[2], s = Math.sin(ph); gx -= w[3] * w[0] * s; gy -= w[3] * w[1] * s; h += w[3] * Math.cos(ph); }
    const i = (y * S + x) * 4; d[i] = clamp(128 + gx * 26, 0, 255); d[i + 1] = clamp(128 + gy * 26, 0, 255); d[i + 2] = clamp(128 + h * 34, 0, 255); d[i + 3] = 255;
  }
  const t = new THREE.DataTexture(d, S, S, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; t.needsUpdate = true; return t;
})();

// 倒影
const reflRT = new THREE.WebGLRenderTarget(512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
const reflCam = new THREE.PerspectiveCamera();
const texMat = new Matrix4();
const NR = 8, rip = []; for (let i = 0; i < NR; i++) rip.push(new THREE.Vector4(0, 0, -99, 0));
const waterU = {
  tN: { value: waterN }, tR: { value: reflRT.texture }, uTex: { value: texMat }, uTime: U.time,
  uLight: { value: ENV.lightDir }, uSpec: { value: ENV.spec }, uDeep: { value: new Color() }, uSky: { value: ENV.hor },
  uFog: { value: ENV.fog }, uFogD: { value: .001 }, uRip: { value: rip }, uRain: { value: 0 }, uWave: { value: 1 }, uOp: { value: 1 }, uNight: { value: 0 }, uRipOn: { value: 0 }
};
// 水面网格：近密远疏并跟随相机。若用一整块几公里的大三角形，世界坐标插值的精度不够，镜头一动水纹就会逐帧抖
const waterGeo = (() => { const G = 112, pos = [], idx = []; for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) { const u = i / G * 2 - 1, v = j / G * 2 - 1; pos.push(Math.sign(u) * Math.pow(Math.abs(u), 3.2) * 3800, 0, Math.sign(v) * Math.pow(Math.abs(v), 3.2) * 3800); }
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const a = j * (G + 1) + i, b = a + 1, c = a + G + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g; })();
const water = new THREE.Mesh(waterGeo, new THREE.ShaderMaterial({
  uniforms: waterU, transparent: false,
  vertexShader: 'uniform mat4 uTex;varying vec4 vM;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vM=uTex*w;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader: `uniform sampler2D tN,tR;uniform float uTime,uFogD,uRain,uWave,uOp,uNight,uRipOn;uniform vec3 uLight,uSpec,uDeep,uSky,uFog;uniform vec4 uRip[${NR}];
varying vec4 vM;varying vec3 vW;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec2 p=vW.xz;float dist=length(cameraPosition-vW);vec3 V=(cameraPosition-vW)/dist;
float pch=texture2D(tN,p*.0037+uTime*.0012).b;float rough=mix(.42,1.25,smoothstep(.36,.66,pch));
vec2 p2=vec2(p.x*.8-p.y*.6,p.x*.6+p.y*.8),p3=vec2(p.x*.94+p.y*.34,-p.x*.34+p.y*.94);float fd=1./(1.+dist*.006);
vec2 g1=texture2D(tN,p*.047+uTime*vec2(.011,.006)).rg-.5,g2=texture2D(tN,p2*.171+uTime*vec2(-.021,.016)).rg-.5,g3=texture2D(tN,p3*.63+uTime*vec2(.04,-.031)).rg-.5;
g2=vec2(g2.x*.8+g2.y*.6,-g2.x*.6+g2.y*.8);g3=vec2(g3.x*.94-g3.y*.34,g3.x*.34+g3.y*.94);
vec2 g=g1*.95+g2*.8*(.35+.65*fd)+g3*.8/(1.+dist*.03);vec2 gd=(g1*1.1+g2*.45*fd+g3*.4/(1.+dist*.06))*rough*uWave;
g*=rough*uWave;
if(uRipOn>.5)for(int i=0;i<${NR};i++){vec2 dv=p-uRip[i].xy;float d=length(dv);float age=uTime-uRip[i].z;
if(age>0.&&age<9.&&d<age*1.7+3.){float x=d-age*1.5;float env=exp(-x*x*1.4)*exp(-age*.45)*uRip[i].w/(1.+d*.25);g+=dv/(d+.02)*cos(x*7.)*env*1.3;}}
if(uRain>.01){for(int k=0;k<2;k++){vec2 c=p*(k==0?1.3:.8)+float(k)*17.3;vec2 id=floor(c);vec2 f=fract(c)-.5;float hh=h21(id);float t=fract(uTime*(.8+hh*.5)+hh*7.);
vec2 o=f-(vec2(h21(id+3.1),h21(id+7.7))-.5)*.5;float d=length(o);float ring=sin((d-t*.42)*46.)*smoothstep(.07,.0,abs(d-t*.42))*(1.-t);g+=o/(d+.01)*ring*uRain*.5;}}
vec3 N=normalize(vec3(g.x,1.,g.y));
float ndv=max(dot(N,V),0.);float fr=mix(.14,1.,pow(1.-ndv,3.2));
vec2 ruv=vM.xy/vM.w+vec2(gd.x*.04,gd.y*.075)/(1.+dist*.012);
vec3 refl=texture2D(tR,clamp(ruv,.001,.999)).rgb;
vec3 body=uDeep*(.85+.3*pch)+uSky*.1;
vec3 col=mix(body,refl,fr);
vec3 R=reflect(-V,N);float rl=max(dot(R,uLight),0.);
col+=uSpec*(pow(rl,700.)*7.+pow(rl,70.)*.4+pow(rl,10.)*.05);
float fg=1.-exp(-dist*dist*uFogD*uFogD);col=mix(col,uFog,fg);
gl_FragColor=vec4(col,uOp);}`
}));
water.renderOrder = 1; water.frustumCulled = false; world.add(water); regMesh(water, 'water', null);
let ripI = 0;
function addRipple(x, z, amp = 1) { rip[ripI].set(x, z, WL.time, amp); ripI = (ripI + 1) % NR; }
function ripGate() { let on = 0; for (const r of rip) if (WL.time - r.z < 9) on = 1; waterU.uRipOn.value = on; }
const bed = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000).rotateX(-PI / 2), makeMat('bed', { vertexColors: false })); bed.position.y = -2.27; bed.receiveShadow = true; world.add(bed); regMesh(bed, 'bed', 'bed');

// 裁剪面常驻（主画面时移到极低处），避免每帧在“有/无裁剪面”两套着色器之间来回切换
const reflPlane = new THREE.Plane(new V3(0, 1, 0), 1e6); renderer.clippingPlanes = [reflPlane];
const hideInRefl = [water];
function renderReflection() {
  const p = camera.position, t = CAM.look;
  reflCam.position.set(p.x, -p.y, p.z); reflCam.up.set(0, 1, 0); reflCam.lookAt(t.x, -t.y, t.z);
  reflCam.fov = camera.fov; reflCam.aspect = camera.aspect; reflCam.near = camera.near; reflCam.far = camera.far; reflCam.updateProjectionMatrix(); reflCam.updateMatrixWorld(); reflCam.matrixWorldInverse.copy(reflCam.matrixWorld).invert();
  texMat.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1).multiply(reflCam.projectionMatrix).multiply(reflCam.matrixWorldInverse);
  const vis = hideInRefl.map(o => o.visible); hideInRefl.forEach(o => o.visible = false);
  sky.position.copy(reflCam.position);
  reflPlane.constant = 0.03; renderer.setRenderTarget(reflRT); renderer.render(scene, reflCam);
  renderer.setRenderTarget(null); reflPlane.constant = 1e6;
  hideInRefl.forEach((o, i) => o.visible = vis[i]); sky.position.copy(camera.position);
}

// 飘落物：花瓣/落叶、雪、雨、流萤
function makeFlakes(n, kind, box) {
  const g = new THREE.BufferGeometry(), a = new Float32Array(n * 3); for (let i = 0; i < a.length; i++) a[i] = rnd();
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const u = { uTime: U.time, uC: { value: new V3() }, uBox: { value: new V3(...box) }, uVel: { value: new V3() }, uSize: { value: .1 }, uSway: { value: .5 }, uScale: { value: 800 }, uCol: { value: new Color(1, 1, 1) }, uOp: { value: 0 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: kind === 3 ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: `uniform float uTime,uSize,uSway,uScale;uniform vec3 uC,uBox,uVel;varying float vF;varying float vR;
void main(){vec3 s=position;vec3 p=s*uBox+uVel*uTime*(.7+.6*s.z);
p.x+=sin(uTime*.8+s.y*40.)*uSway;p.z+=cos(uTime*.65+s.x*40.)*uSway;${kind === 3 ? 'p.y+=sin(uTime*.5+s.x*30.)*1.2;' : ''}
vec3 lo=uC-uBox*.5;p=mod(p-lo,uBox)+lo;vec3 q=abs((p-uC)/uBox);
vF=(1.-smoothstep(.38,.5,q.x))*(1.-smoothstep(.38,.5,q.z))*(1.-smoothstep(.4,.5,q.y));
${kind === 3 ? 'vF*=.5+.5*sin(uTime*(1.5+s.z*2.)+s.x*50.);' : ''}
vR=s.x*6.283+uTime*(1.+s.y*2.);
vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;if(p.y<.04)gl_Position=vec4(2.,2.,2.,1.);
gl_PointSize=clamp(uSize*(.6+.8*s.z)*uScale/-mv.z,1.,${kind === 2 ? '40.' : '16.'});}`,
    fragmentShader: `uniform vec3 uCol;uniform float uOp;varying float vF;varying float vR;
void main(){vec2 c=gl_PointCoord-.5;float a;
${kind === 2 ? 'a=smoothstep(.07,.0,abs(c.x+c.y*.12))*smoothstep(.5,.2,abs(c.y))*.55;' : kind === 1 ? 'float cs=cos(vR),sn=sin(vR);vec2 r=vec2(c.x*cs-c.y*sn,c.x*sn+c.y*cs);a=smoothstep(.25,.18,length(r*vec2(1.,2.2+1.2*sin(vR*1.7))));' : 'a=smoothstep(.5,.05,length(c));'}
gl_FragColor=vec4(uCol,a*vF*uOp);}`
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts); hideInRefl.push(pts); pts.userData.u = u; return pts;
}
const FL = {
  petal: makeFlakes(520, 1, [46, 16, 46]), snow: makeFlakes(2600, 0, [50, 22, 50]),
  rain: makeFlakes(2600, 2, [44, 20, 44]), fly: makeFlakes(150, 3, [50, 4, 50])
};
FL.petal.userData.u.uVel.value.set(.5, -.55, .25); FL.petal.userData.u.uSize.value = .085; FL.petal.userData.u.uSway.value = .9;
FL.snow.userData.u.uVel.value.set(.35, -1.25, .2); FL.snow.userData.u.uSize.value = .07; FL.snow.userData.u.uSway.value = .5;
FL.rain.userData.u.uVel.value.set(.6, -13, .3); FL.rain.userData.u.uSize.value = .55; FL.rain.userData.u.uSway.value = 0; FL.rain.userData.u.uCol.value.set(.82, .87, .9);
FL.fly.userData.u.uVel.value.set(.12, 0, .08); FL.fly.userData.u.uSize.value = .12; FL.fly.userData.u.uSway.value = 1.6; FL.fly.userData.u.uCol.value.set(.85, 1, .45);

// 光晕（灯火）
const glowData = { p: [], c: [], s: [] };
function addGlow(x, y, z, hex, size) { const c = new Color(hex); glowData.p.push(x, y, z); glowData.c.push(c.r, c.g, c.b); glowData.s.push(size); return glowData.s.length - 1; }
let glow = null; const glowU = { uOn: { value: 0 }, uScale: { value: 800 } };
function buildGlow() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(glowData.p, 3)); g.setAttribute('aC', new THREE.Float32BufferAttribute(glowData.c, 3)); g.setAttribute('aS', new THREE.Float32BufferAttribute(glowData.s, 1));
  glow = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: glowU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute vec3 aC;attribute float aS;uniform float uScale;varying vec3 vC;void main(){vC=aC;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aS*uScale/-mv.z,2.,160.);}',
    fragmentShader: 'uniform float uOn;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(1.-d,0.),2.2);gl_FragColor=vec4(vC*a*uOn,1.);}'
  }));
  glow.frustumCulled = false; glow.renderOrder = 6; scene.add(glow); regMesh(glow, 'glow', null);
}
// 灯下光斑
const poolTex = canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,205,130,.95)'); g.addColorStop(.35, 'rgba(255,180,95,.42)'); g.addColorStop(1, 'rgba(255,160,70,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false });
const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2);
function addPool(x, y, z, r) { const m = new THREE.Mesh(poolGeo, poolMat); m.position.set(x, y, z); m.scale.set(r * 2, 1, r * 2); m.renderOrder = 2; world.add(m); (PARTS.glow || (PARTS.glow = { meshes: [], visible: true })).meshes.push(m); }
