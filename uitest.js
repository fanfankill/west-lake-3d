const { open } = require('./tools-page');
const SH = process.argv[2];
(async () => {
  const run = async (w, h, tag, steps) => {
    const { browser, page, logs } = await open(w, h, 'film');
    await page.evaluate(() => { document.body.classList.remove('film'); WL.api.selectView('all', true); for (let i = 0; i < 3; i++) WL.step(.1); });
    for (const [name, fn] of steps) { await fn(page); await page.evaluate(() => { for (let i = 0; i < 30; i++) WL.step(.1); WL.sync(); }); await page.screenshot({ path: `${SH}-${tag}-${name}.jpg`, quality: 85, type: 'jpeg' }); console.log(tag, name); }
    const L = logs.filter(l => !/ReadPixels|program not valid/.test(l)).join('\n'); if (L) console.log('LOGS', L.slice(0, 1500));
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })); console.log(tag, JSON.stringify(ov));
    await browser.close();
  };
  await run(1440, 900, 'd', [
    ['home', async p => { }],
    ['part', async p => { await p.click('[data-tab=parts]'); await p.click('.item[data-id="pv-lattice"] .go'); await p.click('#c-btns button:first-child'); }],
    ['craft', async p => { await p.click('[data-tab=crafts]'); await p.click('.item[data-id="c-tile"] .go'); }],
    ['hide', async p => { await p.click('#a-showall'); await p.click('[data-tab=parts]'); await p.click('.item[data-id="water"] .eye'); await p.click('.item[data-id="pv-roof"] .eye'); await p.evaluate(() => { const o = document.querySelector('#op'); o.value = 45; o.dispatchEvent(new Event('input')); }); await p.click('[data-tab=views]'); await p.click('.item[data-id="qiao"] .go'); }],
    ['night', async p => { await p.click('#a-showall'); await p.click('#tods button[data-t="1"]'); await p.click('.item[data-id="ting"] .go'); await p.mouse.click(520, 700); }],
  ]);
  await run(390, 844, 'm', [
    ['home', async p => { }],
    ['sheet', async p => { await p.click('#mbar [data-sheet=explore]'); }],
    ['dock', async p => { await p.click('#mbar [data-sheet=dock]'); }],
    ['card', async p => { await p.click('#mbar [data-sheet=dock]'); await p.click('#mbar [data-sheet=explore]'); await p.click('.item[data-id="ting"] .go'); await p.click('#mbar [data-sheet=explore]'); }],
  ]);
})();
