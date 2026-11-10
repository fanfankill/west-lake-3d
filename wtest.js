// 运动镜头下的水面稳定性：连续 16 帧，量开阔水面相邻帧差是否均匀
const { open } = require('./tools-page'), fs = require('fs'), { execSync } = require('child_process');
(async () => { const { browser, page } = await open(960, 540, 'film');
  const dir = '/tmp/claude-0/-home-claude/b82a9ace-44e2-5845-882b-5ba8526925bd/scratchpad/wt'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => { WL.time = 3; WL.filmFrame(3, 1 / 30); WL.sync(); });
  for (let i = 0; i < 20; i++) { await page.evaluate(t => { WL.filmFrame(t, 1 / 30); WL.sync(); }, 3 + (i + 1) / 30); fs.writeFileSync(`${dir}/f${String(i).padStart(2, '0')}.png`, await page.screenshot({ type: 'png' })); }
  await browser.close();
  console.log(execSync(`cd ${dir} && ffmpeg -loglevel error -framerate 30 -i f%02d.png -vf "crop=250:150:0:380,format=gray" -f rawvideo - | python3 -c "
import sys,numpy as np
d=np.frombuffer(sys.stdin.buffer.read(),np.uint8).reshape(-1,150,250).astype(float)
v=[round(float(np.abs(d[i]-d[i-1]).mean()),1) for i in range(1,len(d))]
print(v, 'spread', round((max(v)-min(v))/np.mean(v),2))"`).toString());
})();
