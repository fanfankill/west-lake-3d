# 原创配乐《湖上四时》：B 羽五声（B D E F# A），二胡式主旋律 + 古筝分解和弦 + 箫 + 铺底 + 水声 + 晚钟，36 秒
# 段落与画面对齐：0–5.5 引子；5.5–21.5 主题四句（春夏秋冬各一句）；21.5–28 日暮（箫）；28–36 夜（主题再现、收束）
import numpy as np, sys
from scipy.signal import lfilter, butter, fftconvolve
from scipy.io import wavfile

SR, DUR = 48000, 36.0
N = int(SR * DUR)
rng = np.random.default_rng(1090)
mix = np.zeros((N, 2))
F = {'A2': 110.0, 'B2': 123.47, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'A3': 220.0, 'B3': 246.94, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99,
     'A4': 440.0, 'B4': 493.88, 'D5': 587.33, 'E5': 659.26, 'F#5': 739.99, 'A5': 880.0, 'B5': 987.77}

def put(sig, t, amp=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + n, 0] += sig[:n] * amp * l; mix[i:i + n, 1] += sig[:n] * amp * r

def pluck(f, dur=3.0, bright=0.5, decay=0.996):
    # Karplus–Strong，在整数周期的采样率下合成后重采样，保证音准
    P = int(round(4 * SR / f)); fs = P * f; n = int(dur * fs)
    x = np.zeros(n); burst = rng.uniform(-1, 1, P)
    b, a = butter(2, min(0.99, (800 + 3600 * bright) / (fs / 2))); burst = lfilter(b, a, burst); burst -= burst.mean()
    x[:P] = burst
    den = np.zeros(P + 2); den[0] = 1; den[P] = -decay * 0.5; den[P + 1] = -decay * 0.5
    y = lfilter([1], den, x)
    t_out = np.arange(int(dur * SR)) / SR
    y = np.interp(t_out * fs, np.arange(n), y)
    y *= np.minimum(1, t_out / 0.004) * np.exp(-t_out * 0.35)
    return y / (np.max(np.abs(y)) + 1e-9)

def bowed(notes, vib=0.009):
    # 连弓的拉弦音色：音高带滑音与迟到的揉弦，谐波叠加后过共鸣峰
    total = sum(d for _, d in notes); n = int((total + 0.5) * SR); t = np.arange(n) / SR
    logf = np.zeros(n); vibm = np.zeros(n); amp = np.zeros(n); pos = 0.0
    for k, (nm, d) in enumerate(notes):
        i0, i1 = int(pos * SR), int((pos + d) * SR); logf[i0:] = np.log(F[nm])
        tt = t[i0:i1] - pos; vibm[i0:i1] = np.clip((tt - 0.22) / 0.35, 0, 1) if d >= 0.75 else 0
        amp[i0:i1] = (0.82 + 0.18 * np.sin(np.pi * np.clip(tt / d, 0, 1))) * (1 - 0.22 * np.exp(-tt / 0.03))
        pos += d
    a1 = np.exp(-1 / (0.03 * SR)); logf = lfilter([1 - a1], [1, -a1], logf, zi=[logf[0] * a1])[0]
    f = np.exp(logf) * (1 + vib * vibm * np.sin(2 * np.pi * 5.6 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; y = np.zeros(n)
    for h in range(1, 13): y += np.sin(h * ph) / h ** 1.35 * (1 if h % 2 else 0.8)
    b1, a1_ = butter(1, [800 / (SR / 2), 1700 / (SR / 2)], 'band'); b2, a2 = butter(1, [2300 / (SR / 2), 3300 / (SR / 2)], 'band')
    y = 0.55 * y + 1.1 * lfilter(b1, a1_, y) + 0.35 * lfilter(b2, a2, y)
    bl, al = butter(2, 4800 / (SR / 2)); y = lfilter(bl, al, y)
    y += 0.012 * lfilter(*butter(2, [1500 / (SR / 2), 5000 / (SR / 2)], 'band'), rng.normal(0, 1, n)) * amp
    env = np.clip(t / 0.09, 0, 1) * np.clip((total + 0.18 - t) / 0.3, 0, 1)
    y *= amp * env
    return y / (np.max(np.abs(y)) + 1e-9)

def xiao(f, dur, vib=0.006):
    t = np.arange(int(dur * SR)) / SR
    v = vib * np.clip((t - 0.35) / 0.5, 0, 1) * np.sin(2 * np.pi * 4.6 * t)
    ph = 2 * np.pi * np.cumsum(f * (1 + v)) / SR
    y = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.07 * np.sin(3 * ph)
    b, a = butter(2, [f * 0.8 / (SR / 2), min(0.9, f * 3.2 / (SR / 2))], 'band')
    y += 0.14 * lfilter(b, a, rng.normal(0, 1, len(t)))
    return y * np.clip(t / 0.22, 0, 1) ** 1.5 * np.clip((dur - t) / 0.7, 0, 1) ** 1.3 * 0.5

def bell(f0, dur=7.0):
    t = np.arange(int(dur * SR)) / SR; y = np.zeros_like(t)
    for m, a, d in [(1, 1, 6.5), (2.0, .55, 5), (2.76, .36, 3.6), (3.3, .2, 2.6), (4.14, .12, 1.8), (5.43, .07, 1.2)]:
        y += a * np.sin(2 * np.pi * f0 * m * t + rng.uniform(0, 6.28)) * np.exp(-t * 4.5 / d)
    return y * np.minimum(1, t / 0.01) / np.max(np.abs(y))

def note(name, t, amp=0.5, pan=0.0, dur=3.2, bright=0.5):
    put(pluck(F[name], dur, bright), t, amp, pan)

def gliss(names, t, step, amp, pan0=-0.5, pan1=0.5):
    for i, nm in enumerate(names): note(nm, t + i * step, amp * (0.75 + 0.25 * i / len(names)), pan0 + (pan1 - pan0) * i / max(1, len(names) - 1), 2.6, 0.75)

CH = {'B': ['B2', 'F#3', 'B3', 'D4'], 'D': ['D3', 'A3', 'D4', 'F#4'], 'A': ['A2', 'E3', 'A3', 'E4'], 'E': ['E3', 'B3', 'E4', 'B3']}
def arp(ch, t, amp=0.2):
    c = CH[ch]
    for i, k in enumerate([0, 1, 2, 3, 2, 1][:4] if True else []): note(c[k], t + i * 0.5, amp * (1.15 if i == 0 else 0.85), -0.35 + 0.22 * i, 2.8, 0.42)

# —— 引子 0–5.5 ——
gliss(['B3', 'D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5'], 0.5, 0.06, 0.26)
for nm, t, a in [('B3', 1.6, .38), ('F#4', 2.6, .34), ('A4', 3.6, .34), ('F#4', 4.4, .22), ('B4', 4.6, .4)]: note(nm, t, a, -0.1)
for nm, t in [('B2', 1.6), ('D3', 3.6)]: note(nm, t, .3, .15, 4.0, .25)
# —— 主题四句 5.5–21.5：春、夏、秋、冬 ——
THEME = [[('B4', 1.0), ('A4', .5), ('F#4', .5), ('E4', .5), ('F#4', .5), ('A4', 1.0)],
         [('B4', .5), ('D5', .5), ('E5', 1.0), ('D5', .5), ('B4', .5), ('A4', 1.0)],
         [('F#5', 1.0), ('E5', .5), ('D5', .5), ('B4', .5), ('A4', .5), ('F#4', 1.0)],
         [('E4', .5), ('F#4', .5), ('A4', .5), ('B4', .5), ('B4', 2.0)]]
HARM = [('B', 'D'), ('B', 'A'), ('D', 'E'), ('A', 'B')]
for k in range(4):
    t0 = 5.5 + 4 * k
    put(bowed(THEME[k]), t0, .33 if k < 3 else .3, 0.12)
    arp(HARM[k][0], t0, .2); arp(HARM[k][1], t0 + 2, .2 if k < 3 else .16)
    note(CH[HARM[k][0]][0], t0, .26, .2, 4.0, .22); note(CH[HARM[k][1]][0], t0 + 2, .22, .2, 4.0, .22)
gliss(['F#4', 'A4', 'B4', 'D5', 'E5', 'F#5'], 13.1, 0.05, 0.16, -.4, .4)   # 入秋前的一抹
# —— 日暮 21.5–28：箫 ——
for nm, t, d in [('F#4', 21.7, 2.1), ('A4', 23.7, 1.5), ('B4', 25.1, 2.8)]: put(xiao(F[nm], d), t, .24, .25)
for nm, t in [('B2', 21.7), ('F#3', 21.75), ('D3', 23.7), ('E3', 25.1), ('B3', 25.15)]: note(nm, t, .28, -.25, 4.0, .3)
for nm, t in [('F#5', 22.7), ('A5', 24.4), ('B5', 26.3)]: note(nm, t, .16, .35, 3.0, .12)
# —— 入夜 28–36：钟声，主题再现，收束 ——
put(bell(123.47), 28.0, .2, 0.0)
put(bowed(THEME[0]), 28.5, .24, 0.12); arp('B', 28.5, .15); arp('D', 30.5, .15); note('B2', 28.5, .22, .2, 4, .22); note('D3', 30.5, .2, .2, 4, .22)
put(bowed([('A4', .5), ('F#4', .5), ('B4', 2.4)]), 32.5, .22, 0.12); arp('A', 32.5, .13)
gliss(['B5', 'A5', 'F#5', 'E5', 'D5', 'B4', 'A4', 'F#4', 'E4', 'D4', 'B3'], 33.35, 0.065, 0.2, .5, -.5)
for i, nm in enumerate(['B2', 'F#3', 'B3', 'F#4', 'B4']): note(nm, 33.55 + i * 0.05, .3, -.2 + .1 * i, 2.6, .35)

# 铺底：B–F# 持续音
t = np.arange(N) / SR; pad = np.zeros(N)
for f, a in [(61.74, .16), (123.47, .26), (185.0, .22), (246.94, .18), (369.99, .08)]:
    for det in (-0.3, 0.27): pad += a * np.sin(2 * np.pi * (f + det) * t + rng.uniform(0, 6.28)) * (0.75 + 0.25 * np.sin(2 * np.pi * rng.uniform(.05, .13) * t + rng.uniform(0, 6.28)))
env = np.clip(t / 3.0, 0, 1) * (0.75 + 0.25 * np.clip((t - 21) / 5, 0, 1))
mix[:, 0] += pad * env * 0.04; mix[:, 1] += np.roll(pad, 240) * env * 0.04
# 水声
for ch in (0, 1):
    nz = lfilter(*butter(2, [350 / (SR / 2), 2600 / (SR / 2)], 'band'), rng.normal(0, 1, N)); lap = np.zeros(N)
    for _ in range(30): c = rng.uniform(0, DUR); w = rng.uniform(.35, .9); lap += rng.uniform(.4, 1) * np.exp(-((t - c) / w) ** 2)
    mix[:, ch] += nz * (0.25 + lap) * 0.008

bh, ah = butter(2, 48 / (SR / 2), 'high')
for ch in (0, 1): mix[:, ch] = lfilter(bh, ah, mix[:, ch])
# 混响
ir_n = int(2.6 * SR); ti = np.arange(ir_n) / SR; wet = np.zeros_like(mix)
for ch in (0, 1):
    ir = rng.normal(0, 1, ir_n) * np.exp(-ti * 2.4); ir = lfilter(*butter(1, 2800 / (SR / 2)), ir); ir[:int(.012 * SR)] = 0
    wet[:, ch] = fftconvolve(mix[:, ch], ir)[:N]
wet /= np.max(np.abs(wet)) + 1e-9
out = mix / (np.max(np.abs(mix)) + 1e-9) * 0.8 + wet * 0.34
out *= (np.clip(t / 0.4, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1) ** 1.5)[:, None]
bl, al = butter(1, 7000 / (SR / 2))
for ch in (0, 1): out[:, ch] = 0.55 * out[:, ch] + 0.45 * lfilter(bl, al, out[:, ch])
out = np.tanh(out * 1.15); out = out / np.max(np.abs(out)) * 0.84
wavfile.write(sys.argv[1], SR, (out * 32767).astype(np.int16))
print('ok', sys.argv[1], out.shape)
