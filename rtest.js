const { open } = require('./tools-page');
(async () => { const { browser, page } = await open(480, 270, 'film');
  const r = await page.evaluate(() => { const e = WL.dbg.MESHES.find(e => e.part === 'pv-roof' && e.matId === 'tile'), p = e.mesh.geometry.attributes.position, out = {};
    // 统计各朝向上，法线朝下（背面朝上）的大三角形数量
    for (let i = 0; i < p.count; i += 3) { const ax = p.getX(i), ay = p.getY(i), az = p.getZ(i), bx = p.getX(i + 1) - ax, by = p.getY(i + 1) - ay, bz = p.getZ(i + 1) - az, cx = p.getX(i + 2) - ax, cy = p.getY(i + 2) - ay, cz = p.getZ(i + 2) - az;
      const nx = by * cz - bz * cy, ny = bz * cx - bx * cz, nz = bx * cy - by * cx, area = Math.hypot(nx, ny, nz) / 2; if (area < .02) continue;
      const dx = ax + (bx + cx) / 3 + 36, dz = az + (bz + cz) / 3 + 6, side = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'E' : 'W') : (dz > 0 ? 'S' : 'N'); const k = side + (ny > 0 ? ' up' : ' down'); out[k] = (out[k] || 0) + 1; }
    return out; });
  console.log(JSON.stringify(r)); await browser.close(); })();
