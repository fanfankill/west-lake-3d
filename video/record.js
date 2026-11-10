// 逐帧录制：驱动页面的 WL.filmFrame(t)，JPEG 截图经管道交给 ffmpeg，每段一个 mp4
// 用法：node video/record.js <outDir> [firstChunk] [lastChunk]
const { open } = require('../tools-page'), { spawn } = require('child_process'), fs = require('fs'), path = require('path');
const OUT = process.argv[2], STEP = +(process.env.STEP || 1), FPS = 30 / STEP, TOTAL = 36 * FPS, CH = Math.round(180 / STEP), W = +(process.env.W || 1920), H = +(process.env.H || 1080);
const c0 = +(process.argv[3] || 0), c1 = +(process.argv[4] || Math.ceil(TOTAL / CH) - 1);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { browser, page, logs } = await open(W, H, 'film');
  await page.evaluate(() => document.fonts.ready);
  // 预热到起始时刻，保持水面与季相的连续
  await page.evaluate(([t, dt]) => { WL.time = t; WL.filmFrame(Math.max(t, 0), dt); WL.sync(); }, [c0 * CH / FPS, 1 / FPS]);
  const T0 = Date.now();
  for (let c = c0; c <= c1; c++) {
    const tmp = path.join(OUT, `part${c}.tmp.mp4`), fin = path.join(OUT, `part${c}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('exit', code => code === 0 ? res() : rej(new Error('ffmpeg ' + code))));
    for (let i = c * CH; i < Math.min((c + 1) * CH, TOTAL); i++) {
      await page.evaluate(([t, dt]) => { WL.filmFrame(t, dt); WL.sync(); }, [i / FPS, 1 / FPS]);
      const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % Math.round(FPS) === 0) console.log(`frame ${i}/${TOTAL}  ${((Date.now() - T0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await done; fs.renameSync(tmp, fin); console.log('chunk', c, 'done');
  }
  const L = logs.filter(l => !/ReadPixels|program not valid/.test(l)).join('\n'); if (L) console.log('LOGS', L.slice(0, 1500));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
