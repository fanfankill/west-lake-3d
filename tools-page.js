// 测试/录制共用：打开本地页面，并把 CDN 与字体请求指到本地文件
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const R = __dirname, NM = path.join(R, 'node_modules/@fontsource');
function fontCss() {
  let css = '';
  for (const [pkg, files] of [['ma-shan-zheng', ['index.css']], ['noto-serif-sc', ['400.css', '600.css', '900.css']]])
    for (const f of files) css += fs.readFileSync(path.join(NM, pkg, f), 'utf8').replace(/url\(\.\/files\//g, `url(https://fonts.gstatic.com/local/${pkg}/files/`);
  return css;
}
exports.open = async (w, h, hash = '', dpr = 1) => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  const css = fontCss();
  await page.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: path.join(R, 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: css, contentType: 'text/css' }));
  await page.route('https://fonts.gstatic.com/local/**', r => { const m = r.request().url().match(/local\/([^/]+)\/files\/(.+)$/); r.fulfill({ path: path.join(NM, m[1], 'files', m[2]), contentType: 'font/woff2' }); });
  const logs = []; page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); }); page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(R, 'dist/west-lake.html') + (hash ? '#' + hash : ''));
  await page.waitForFunction('window.WL && (window.WL.ready || document.querySelector("#veil").textContent.includes("失败"))', null, { timeout: 120000 });
  return { browser, page, logs };
};
