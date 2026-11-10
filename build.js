// 把 src/ 拼成单文件 dist/index.html（发布用片段）与 dist/west-lake.html（可直接双击打开的完整页面）
const fs = require('fs'), path = require('path');
const S = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const js = fs.readdirSync(path.join(__dirname, 'src')).filter(f => f.endsWith('.js')).sort().map(S).join('\n');
const frag = S('head.html') + S('body.html') +
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n' +
  '<script>\n(() => {\n"use strict";\n' + js + '\n})();\n</script>\n';
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), frag);
fs.writeFileSync(path.join(__dirname, 'dist', 'west-lake.html'), '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>*{box-sizing:border-box}body{margin:0}[hidden]{display:none!important}</style>\n' + S('head.html') + '</head>\n<body>\n' + frag.slice(S('head.html').length) + '</body>\n</html>\n');
console.log('built', (frag.length / 1024).toFixed(0) + ' KB');
