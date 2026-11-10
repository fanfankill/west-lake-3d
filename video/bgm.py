# 网页背景音乐《湖上四时》长版：沿用 music.py 的乐器（古筝拨弦、拉弦主旋律、箫、钟、铺底、水声），约 104 秒
# 结构：引子 → 主题 A → 箫过门 → 主题 B → 古筝独奏过门 → 主题 A 再现 → 夜曲 C → 尾声。首尾淡入淡出，网页里前后两遍交叠着循环
# 用法：python3 video/bgm.py out.wav && ffmpeg -i out.wav -ar 44100 -c:a libmp3lame -b:a 96k assets/bgm.mp3
import os, sys
DUR = 104.0
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music.py'), encoding='utf8').read().split('# —— 引子')[0].replace('SR, DUR = 48000, 36.0', 'SR, DUR = 48000, %.1f' % DUR)
exec(_src, globals())

A_ = [[('B4', 1.0), ('A4', .5), ('F#4', .5), ('E4', .5), ('F#4', .5), ('A4', 1.0)],
      [('B4', .5), ('D5', .5), ('E5', 1.0), ('D5', .5), ('B4', .5), ('A4', 1.0)],
      [('F#5', 1.0), ('E5', .5), ('D5', .5), ('B4', .5), ('A4', .5), ('F#4', 1.0)],
      [('E4', .5), ('F#4', .5), ('A4', .5), ('B4', .5), ('B4', 2.0)]]
HA = [('B', 'D'), ('B', 'A'), ('D', 'E'), ('A', 'B')]
B_ = [[('D5', 1.0), ('E5', .5), ('F#5', .5), ('A5', 1.0), ('F#5', .5), ('E5', .5)],
      [('D5', .5), ('E5', .5), ('D5', .5), ('B4', .5), ('A4', 1.0), ('B4', 1.0)],
      [('F#5', .5), ('A5', .5), ('B5', 1.0), ('A5', .5), ('F#5', .5), ('E5', 1.0)],
      [('D5', .5), ('B4', .5), ('A4', .5), ('F#4', .5), ('B4', 2.0)]]
HB = [('D', 'A'), ('B', 'E'), ('D', 'A'), ('E', 'B')]
C_ = [[('F#4', 1.5), ('E4', .5), ('D4', 1.0), ('B3', 1.0)],
      [('A3', 1.0), ('B3', .5), ('D4', .5), ('E4', 2.0)],
      [('F#4', 1.0), ('A4', .5), ('B4', .5), ('A4', 1.0), ('F#4', 1.0)],
      [('E4', .5), ('D4', .5), ('B3', 3.0)]]
HC = [('B', 'B'), ('A', 'E'), ('D', 'B'), ('E', 'B')]

def section(theme, harm, t0, lead=.33, acc=.2):
    for k in range(4):
        t = t0 + 4 * k
        put(bowed(theme[k]), t, lead if k < 3 else lead * .92, 0.12)
        arp(harm[k][0], t, acc); arp(harm[k][1], t + 2, acc if k < 3 else acc * .8)
        note(CH[harm[k][0]][0], t, acc * 1.3, .2, 4.0, .22); note(CH[harm[k][1]][0], t + 2, acc * 1.1, .2, 4.0, .22)

# 引子 0–7
gliss(['B3', 'D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5'], 0.7, 0.06, 0.24)
for nm, t, a in [('B3', 1.9, .36), ('F#4', 2.9, .32), ('A4', 3.9, .32), ('F#4', 4.7, .2), ('B4', 4.9, .38), ('E5', 5.9, .2)]: note(nm, t, a, -0.1)
for nm, t in [('B2', 1.9), ('D3', 3.9), ('E3', 5.9)]: note(nm, t, .28, .15, 4.0, .25)
# 主题 A 7–23
section(A_, HA, 7.0)
gliss(['F#4', 'A4', 'B4', 'D5', 'E5', 'F#5'], 14.6, 0.05, 0.15, -.4, .4)
# 箫过门 23–31
for nm, t, d in [('F#4', 23.2, 2.1), ('A4', 25.2, 1.5), ('B4', 26.6, 3.0)]: put(xiao(F[nm], d), t, .24, .25)
for nm, t in [('B2', 23.2), ('F#3', 23.25), ('D3', 25.2), ('E3', 26.6), ('B3', 26.65)]: note(nm, t, .28, -.25, 4.0, .3)
for nm, t in [('F#5', 24.2), ('A5', 25.9), ('B5', 27.8), ('F#5', 29.2)]: note(nm, t, .15, .35, 3.0, .12)
gliss(['B3', 'D4', 'E4', 'F#4', 'A4', 'B4', 'D5'], 30.2, 0.06, 0.18, -.5, .3)
# 主题 B 31–47：音区上行，更明亮
section(B_, HB, 31.0, .31, .19)
for k, nm in enumerate(['A5', 'B5', 'E5', 'B4']): note(nm, 31.0 + 4 * k + 3.5, .13, .4, 3.0, .15)
# 古筝独奏过门 47–55
for i, nm in enumerate(['B4', 'A4', 'F#4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'D5', 'B4', 'A4']):
    t = 47.2 + [0, .5, 1, 1.5, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5][i]; note(nm, t, .36, -.05 + .02 * i, 3.0, .6)
for nm, t in [('B2', 47.2), ('F#3', 48.2), ('A2', 49.2), ('E3', 50.2), ('D3', 51.2), ('A3', 52.2), ('E3', 53.2), ('B3', 54.2)]: note(nm, t, .26, .2, 3.6, .25)
gliss(['E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5'], 54.45, 0.05, 0.18, -.4, .4)
# 主题 A 再现 55–71：拉弦稍轻，古筝在句尾作答
section(A_, HA, 55.0, .3, .18)
for k, ans in enumerate([['B4', 'D5'], ['E5', 'B4'], ['A4', 'B4'], ['F#4', 'B4']]):
    for j, nm in enumerate(ans): note(nm, 55.0 + 4 * k + 3.0 + j * .5, .2, -.3, 2.6, .5)
# 夜曲 C 71–87：钟声起，音区下沉
put(bell(123.47), 70.6, .18, 0.0)
section(C_, HC, 71.0, .27, .14)
for nm, t, d in [('B4', 75.2, 2.4), ('F#4', 83.2, 3.0)]: put(xiao(F[nm], d), t, .13, .3)
# 尾声 87–100
put(bowed([('A4', .5), ('F#4', .5), ('B4', 2.6)]), 87.4, .24, 0.12); arp('A', 87.4, .13)
gliss(['B5', 'A5', 'F#5', 'E5', 'D5', 'B4', 'A4', 'F#4', 'E4', 'D4', 'B3'], 88.3, 0.065, 0.2, .5, -.5)
for i, nm in enumerate(['B2', 'F#3', 'B3', 'F#4', 'B4']): note(nm, 88.5 + i * 0.05, .3, -.2 + .1 * i, 2.6, .35)
put(xiao(F['B4'], 3.6), 91.2, .15, .25)
for nm, t, a in [('B3', 93.4, .26), ('F#4', 94.9, .22), ('B4', 96.4, .2), ('F#5', 97.6, .12)]: note(nm, t, a, -.1, 3.4, .35)
note('B2', 93.4, .24, .2, 4.0, .22)

# 铺底、水声、混响、收尾（同 music.py）
t = np.arange(N) / SR; pad = np.zeros(N)
for f, a in [(61.74, .16), (123.47, .26), (185.0, .22), (246.94, .18), (369.99, .08)]:
    for det in (-0.3, 0.27): pad += a * np.sin(2 * np.pi * (f + det) * t + rng.uniform(0, 6.28)) * (0.75 + 0.25 * np.sin(2 * np.pi * rng.uniform(.05, .13) * t + rng.uniform(0, 6.28)))
env = np.clip(t / 3.0, 0, 1) * (0.75 + 0.25 * np.clip((t - 68) / 5, 0, 1))
mix[:, 0] += pad * env * 0.04; mix[:, 1] += np.roll(pad, 240) * env * 0.04
for ch in (0, 1):
    nz = lfilter(*butter(2, [350 / (SR / 2), 2600 / (SR / 2)], 'band'), rng.normal(0, 1, N)); lap = np.zeros(N)
    for _ in range(86): c = rng.uniform(0, DUR); w = rng.uniform(.35, .9); lap += rng.uniform(.4, 1) * np.exp(-((t - c) / w) ** 2)
    mix[:, ch] += nz * (0.25 + lap) * 0.008
bh, ah = butter(2, 48 / (SR / 2), 'high')
for ch in (0, 1): mix[:, ch] = lfilter(bh, ah, mix[:, ch])
ir_n = int(2.6 * SR); ti = np.arange(ir_n) / SR; wet = np.zeros_like(mix)
for ch in (0, 1):
    ir = rng.normal(0, 1, ir_n) * np.exp(-ti * 2.4); ir = lfilter(*butter(1, 2800 / (SR / 2)), ir); ir[:int(.012 * SR)] = 0
    wet[:, ch] = fftconvolve(mix[:, ch], ir)[:N]
wet /= np.max(np.abs(wet)) + 1e-9
out = mix / (np.max(np.abs(mix)) + 1e-9) * 0.8 + wet * 0.34
out *= (np.clip(t / 0.5, 0, 1) * np.clip((DUR - t) / 5.0, 0, 1) ** 1.5)[:, None]
bl, al = butter(1, 7000 / (SR / 2))
for ch in (0, 1): out[:, ch] = 0.55 * out[:, ch] + 0.45 * lfilter(bl, al, out[:, ch])
out = np.tanh(out * 1.15); out = out / np.max(np.abs(out)) * 0.84
wavfile.write(sys.argv[1], SR, (out * 32767).astype(np.int16))
print('ok', sys.argv[1], out.shape)
