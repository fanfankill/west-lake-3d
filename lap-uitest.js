// 环湖一周、沉浸模式与新景点的界面自检：node lap-uitest.js <截图前缀>
const { open } = require('./tools-page');
const SH = process.argv[2];
(async () => {
  const { browser, page, logs } = await open(1100, 680, 'film');
  await page.evaluate(() => { document.body.classList.remove('film'); WL.api.selectView('all', true); for (let i = 0; i < 3; i++) WL.step(.1); });
  const shot = async name => { await page.evaluate(() => { WL.sync(); }); await page.screenshot({ path: `${SH}-${name}.jpg`, quality: 85, type: 'jpeg' }); console.log('shot', name); };
  const st = () => page.evaluate(() => ({ imm: document.body.classList.contains('immersive'), lap: document.querySelector('#a-lap').getAttribute('aria-pressed'), cap: document.querySelector('#cap').textContent, capOp: getComputedStyle(document.querySelector('#cap')).opacity, dock: getComputedStyle(document.querySelector('#dock')).opacity + '/' + getComputedStyle(document.querySelector('#dock')).visibility + '/' + getComputedStyle(document.querySelector('#dock')).display, free: !!WL.api.CAM.free, season: +WL.api.ST.season.toFixed(2) }));
  await page.click('#a-lap'); await page.evaluate(() => { for (let i = 0; i < 12; i++) WL.step(1); }); console.log('lap 12s', JSON.stringify(await st())); await shot('lap12');
  await page.click('#a-imm'); await page.evaluate(() => { for (let i = 0; i < 15; i++) WL.step(2); }); console.log('imm on, lap 42s', JSON.stringify(await st())); await shot('imm42');
  await page.keyboard.press('h'); console.log('after H', JSON.stringify(await st()));
  await page.keyboard.press('h'); console.log('after H again', JSON.stringify(await st()));
  await page.mouse.move(700, 400); await page.mouse.move(720, 420); await page.waitForTimeout(300); const vis = await page.evaluate(() => document.querySelector('#imm-exit').classList.contains('show')); console.log('exit button shown on move', vis);
  await page.click('#imm-exit'); console.log('after exit click', JSON.stringify(await st()));
  await page.click('#a-lap'); await page.evaluate(() => { for (let i = 0; i < 4; i++) WL.step(.3); }); console.log('lap stopped', JSON.stringify(await st()));
  for (const id of ['duanqiao', 'pinghu', 'gushan', 'xiaoying', 'huxin', 'nanping', 'sudi', 'santan']) { const ok = await page.evaluate(i => !!document.querySelector(`#l-views .item[data-id="${i}"] .go`), id); if (!ok) { console.log('MISSING view', id); continue; } await page.click(`#l-views .item[data-id="${id}"] .go`); await page.evaluate(() => { for (let i = 0; i < 14; i++) WL.step(.5); }); await shot('v-' + id); }
  await page.click('#tods button[data-t="1"]'); await page.evaluate(() => { for (let i = 0; i < 10; i++) WL.step(.5); }); await shot('v-night');
  const L = logs.filter(l => !/ReadPixels|program not valid/.test(l)).join('\n'); console.log(L ? 'LOGS ' + L.slice(0, 2000) : 'no console errors');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
