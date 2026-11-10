// 用法：node shot.js out-prefix "name|js;js" ...   每项先执行 js、渲染若干帧，再截图
const { open } = require('./tools-page');
(async () => {
  const out = process.argv[2], items = process.argv.slice(3), W = +(process.env.W || 1600), H = +(process.env.H || 900);
  const { browser, page, logs } = await open(W, H, process.env.HASH || 'film');
  if (process.env.UI) await page.evaluate(() => document.body.classList.remove('film'));
  for (const it of items) {
    const [name, js] = it.split('|');
    const t0 = Date.now();
    await page.evaluate(`(()=>{ ${js || ''}; for(let i=0;i<${process.env.N || 6};i++) WL.step(0.2); WL.step(0.033); WL.sync(); })()`);
    await page.screenshot({ path: `${out}-${name}.jpg`, quality: 86, type: 'jpeg', timeout: 120000 });
    console.log(name, Date.now() - t0, 'ms');
  }
  const L = logs.filter(l => !/ReadPixels|program not valid/.test(l)).join('\n'); if (L) console.log(L.slice(0, 2000));
  await browser.close();
})();
