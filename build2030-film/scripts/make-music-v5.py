"""
Trilha V5 (camada 01 · música): eletrônica mínima, percussão orgânica sutil, pulso suave, textura de synth
elegante e um motivo melódico discreto. 90 BPM (1 batida = 20 frames a 30 fps), Ré maior.
Grave só como pontuação: nada sustentado abaixo de ~110 Hz; o pulso é um "thud" curto (90 Hz com clique).
Estrutura e acentos seguem src/motion/timing.ts:
  0–240 intro · 240/280/320 MARCA·PRESENÇA·OPORTUNIDADES · 400 frente 01 · 800 frente 02 (arpejo, relógio)
  1240–1500 respiro do encontro (sem bateria) · 1440 AERA (sino) · 1565 sistema · 1601 movimento
  1656 a agência segue (o groove continua) · 1900/1960/2020 CONSTRUIR·ESCALAR·LIDERAR (Ré, Sol, Lá) · 2080 pouso em Ré maj9 · fim 2160 (corte seco).
Uso: python3 scripts/make-music-v5.py → public/audio/music/music_v5.wav
"""
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 48000
FPS = 30
END = 2160
N = int(SR * (END / FPS + 0.1))
rng = np.random.default_rng(5)
L = np.zeros(N)
R = np.zeros(N)


def fs(fr):
    return int(fr / FPS * SR)


def hz(note):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = note[:-1], int(note[-1])
    return 440 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def add(sig, at, gain=1.0, pan=0.0, bus=None):
    i0 = fs(at) if isinstance(at, (int, float)) and at < 10000 else at
    n = min(len(sig), N - i0)
    if n <= 0:
        return
    gl, gr = gain * np.sqrt((1 - pan) / 2), gain * np.sqrt((1 + pan) / 2)
    (bus or (L, R))[0][i0:i0 + n] += sig[:n] * gl
    (bus or (L, R))[1][i0:i0 + n] += sig[:n] * gr


# barramentos com envio para a reverb
VL, VR = np.zeros(N), np.zeros(N)  # envio de reverb
DL, DR = np.zeros(N), np.zeros(N)  # envio de delay (pluck)

# ------------------------------------------------------------------ harmonia
CH = {
    'D': ['D3', 'A3', 'C#4', 'E4', 'F#4'],
    'Bm': ['B2', 'F#3', 'A3', 'D4', 'E4'],
    'G': ['G2', 'D3', 'F#3', 'A3', 'B3'],
    'A': ['A2', 'E3', 'A3', 'B3', 'E4'],
}
ROOT = {'D': 'D3', 'Bm': 'B2', 'G': 'G2', 'A': 'A2'}
PROG = ['D', 'Bm', 'G', 'A']


def chord_at(fr):
    if 1900 <= fr < 1960:
        return 'D'
    if 1960 <= fr < 2020:
        return 'G'
    if 2020 <= fr < 2080:
        return 'A'
    if fr >= 2080:
        return 'D'
    if 1240 <= fr < 1500:  # respiro: harmonia mais lenta (2 compassos por acorde)
        return ['D', 'G'][int((fr - 1240) // 160) % 2]
    return PROG[int(fr // 80) % 4]


def env(points):
    xs, ys = zip(*points)
    return lambda fr: float(np.interp(fr, xs, ys))


# ------------------------------------------------------------------ 1 · pad (saws desafinadas, filtradas; sem grave)
def pad_note(f, dur, att=0.6, rel=1.2):
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.006, 0.0, 0.0065):
        ff = f * (1 + det)
        for h in range(1, 10):
            if ff * h > 7000:
                break
            out += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h
    a = np.clip(t / att, 0, 1) * np.clip((dur + rel - t) / rel, 0, 1)
    return out * a / 6


pad_lvl = env([(0, 0.0), (40, 0.6), (240, 0.75), (400, 0.6), (800, 0.55), (1226, 0.6), (1240, 0.95), (1500, 0.9), (1560, 0.6), (1900, 0.5), (2080, 1.0), (2160, 0.9)])
segs = []
fr = 0
while fr < END:
    c = chord_at(fr)
    nxt = fr + 1
    while nxt < END and chord_at(nxt) == c:
        nxt += 1
    segs.append((fr, nxt, c))
    fr = nxt
for a, b, c in segs:
    dur = (b - a) / FPS
    rel = 2.6 if b >= END else 1.0
    for k, nt in enumerate(CH[c]):
        s = pad_note(hz(nt), dur, att=0.5 if a > 0 else 2.2, rel=rel)
        s = hp(lp(s, 2600 if not (1240 <= a < 1500 or a >= 1840) else 3400), 170)
        g = 0.05 * pad_lvl(a + 1)
        pan = [-0.5, 0.4, -0.2, 0.55, -0.35][k]
        add(s, a, g, pan)
        add(s, a, g * 0.8, pan, (VL, VR))


# ------------------------------------------------------------------ 2 · motivo (pluck FM suave) com delay de colcheia pontuada
def pluck(f, dur=0.9, bright=1.4, decay=4.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    idx = bright * np.exp(-t * 14)
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 2 * f * t))
    s += 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9)
    return s * np.exp(-t * decay) * np.clip(t / 0.003, 0, 1)


MOTIF_A = [(0, 'A4'), (1, 'F#4'), (2.5, 'E4'), (3, 'B3')]
MOTIF_B = [(0, 'D5'), (1.5, 'B4'), (2, 'A4'), (3.5, 'F#4')]
MOTIF_HI = [(0, 'A5'), (0.5, 'F#5'), (1, 'E5'), (2, 'A5'), (2.5, 'B5'), (3, 'F#5')]
MOTIF_OPEN = [(0, 'F#4'), (2, 'A4')]


def motif_bar(bar):
    a = bar * 80
    if a < 40:
        return None
    if a < 240:
        return MOTIF_OPEN
    if 1240 <= a < 1500:
        return MOTIF_OPEN
    if 800 <= a < 1226 or 1600 <= a < 1880:
        return MOTIF_HI if bar % 2 else MOTIF_A
    if a >= 1880:
        return None
    return MOTIF_A if bar % 2 == 0 else MOTIF_B


plk_lvl = env([(0, 0.5), (240, 0.8), (800, 0.65), (1240, 0.7), (1500, 0.8), (1860, 0.7), (1890, 0)])
for bar in range(END // 80 + 1):
    m = motif_bar(bar)
    if not m:
        continue
    for beat, nt in m:
        at = bar * 80 + beat * 20
        if at >= 1880 and at < 2080:
            continue
        s = pluck(hz(nt), bright=1.5 if at < 240 else 2.1)
        g = 0.13 * plk_lvl(at) * (0.9 + 0.2 * rng.random())
        pan = rng.uniform(-0.3, 0.3)
        add(s, at, g, pan)
        add(s, at, g, pan, (DL, DR))
        add(s, at, g * 0.5, pan, (VL, VR))

# ------------------------------------------------------------------ 3 · arpejo de vidro (tecnologia, movimento)
ARP_ZONES = [(800, 1210), (1601, 1860)]
for a0, a1 in ARP_ZONES:
    step = 5  # semicolcheia = 5 frames
    k = 0
    for at in range(a0, a1, step):
        c = CH[chord_at(at)]
        nt = c[[2, 3, 4, 3][k % 4]]
        f = hz(nt) * 2
        n = int(0.22 * SR)
        t = np.arange(n) / SR
        s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t * 16) * np.clip(t / 0.002, 0, 1)
        ramp_in = min(1, (at - a0) / 60)
        g = 0.045 * ramp_in * (1.0 if k % 4 == 0 else 0.7)
        add(lp(s, 5000), at, g, 0.45 if k % 2 else -0.45)
        add(s, at, g * 0.6, 0, (VL, VR))
        k += 1


# ------------------------------------------------------------------ 4 · percussão orgânica
def shaker(vel=1.0):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.clip(t / 0.006, 0, 1) * np.exp(-t * 55)
    return bp(s, 5200, 11500) * vel


def rim(vel=1.0):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    s = bp(rng.standard_normal(n), 1400, 3200) * np.exp(-t * 90) + 0.5 * np.sin(2 * np.pi * 1180 * t) * np.exp(-t * 60)
    return s * vel


def wood(vel=1.0, f=880):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 45) + 0.35 * np.sin(2 * np.pi * 2.4 * f * t) * np.exp(-t * 70)
    return s * vel


def thud(vel=1.0):
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    f = 92 + 70 * np.exp(-t * 40)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 15) + 0.25 * bp(rng.standard_normal(n), 1500, 4000) * np.exp(-t * 200)
    return hp(s, 65) * vel


def bass(f, dur=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return lp(s * np.exp(-t * 7) * np.clip(t / 0.004, 0, 1), 900)


def drums_on(fr):
    """0..1: quanto da bateria toca neste ponto."""
    if fr < 120:
        return 0
    if fr < 240:
        return 0.35  # só shaker
    if 1226 <= fr < 1500:
        return 0.35  # respiro do encontro: só o shaker segura a cadência (sem queda de ambiência)
    if 1500 <= fr < 1560:
        return 0.3
    if fr >= 2040:
        return 0
    return 1


for beat16 in range(END * 4 // 20):
    at = beat16 * 5  # frame da semicolcheia
    d = drums_on(at)
    if d <= 0:
        continue
    pos = beat16 % 16  # posição no compasso
    swing = 0.012 * SR if pos % 2 else 0
    i0 = fs(at) + int(swing)
    # shaker: semicolcheias, acento nos "e"
    vel = (0.55 if pos % 4 == 2 else 0.32 if pos % 2 else 0.22) * (0.85 + 0.3 * rng.random())
    add(shaker(vel), i0, 0.22 * d, 0.35)
    add(shaker(vel * 0.6), i0 + int(0.007 * SR), 0.1 * d, -0.4)
    if at < 240:
        continue
    full = d >= 1 and at >= 400
    # rim nos tempos 2 e 4
    if pos in (4, 12):
        add(rim(0.9), i0, 0.06 * d, -0.2)
        add(rim(0.9), i0, 0.03 * d, 0, (VL, VR))
    # thud suave nos tempos 1 e 3 (a partir da frente 01)
    if full and pos in (0, 8):
        add(thud(1.0 if pos == 0 else 0.7), i0, 0.16)
    # wood: síncope na frente 02 e no movimento
    if full and (800 <= at < 1226 or 1600 <= at < 1680) and pos in (3, 6, 11, 14):
        add(wood(0.8, 880 if pos < 8 else 1180), i0, 0.05, 0.5 if pos < 8 else -0.5)
    # baixo dedilhado curto (colcheias, fundamental uma oitava acima do sub)
    if full and pos % 2 == 0 and pos not in (6, 14):
        add(bass(hz(ROOT[chord_at(at)])), i0, 0.07 * (1.0 if pos in (0, 8) else 0.7))


# ------------------------------------------------------------------ 5 · acentos
def riser(dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = rng.standard_normal(n) * (t / dur) ** 2
    return bp(s, 2500, 9000)


def stab(chord, vel=1.0):
    out = np.zeros(int(1.4 * SR))
    for nt in CH[chord][1:]:
        p = pluck(hz(nt) * 2, dur=1.4, bright=1.8, decay=3.2)
        out[: len(p)] += p
    return out * vel / 4


def bell(f, dur=3.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t + 1.2 * np.exp(-t * 3) * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t * 1.4)
    return s * np.clip(t / 0.004, 0, 1)


# MARCA · PRESENÇA · OPORTUNIDADES: três acentos leves
for k, at in enumerate([240, 280, 320]):
    add(thud(0.9), at, 0.2)
    add(stab(chord_at(at), 0.8 + 0.1 * k), at, 0.09, [-0.3, 0.3, 0][k])
    add(stab(chord_at(at)), at, 0.06, 0, (VL, VR))
# entrada das frentes
for at in (400, 800):
    add(riser(0.4), fs(at) - int(0.4 * SR), 0.05, 0)
    add(thud(0.8), at, 0.16)
# AERA na interseção: um sino, sem impacto
add(bell(hz('A5')), 1440, 0.07, 0.15)
add(bell(hz('A5')), 1440, 0.08, 0, (VL, VR))
add(bell(hz('E5')), 1450, 0.04, -0.2)
# "sistema": o encaixe
add(wood(1.0, 1320), 1553, 0.07, 0)
# CONSTRUIR · ESCALAR · LIDERAR: três acentos percussivos e harmônicos (Ré, Sol, Lá)
for k, (at, c) in enumerate(zip([1900, 1960, 2020], ['D', 'G', 'A'])):
    add(riser(0.35), fs(at) - int(0.35 * SR), 0.045, 0)
    add(thud(1.0), at, 0.3)
    add(rim(1.0), at, 0.09, 0)
    add(stab(c, 1.0), at, 0.14, [-0.25, 0.25, 0][k])
    add(stab(c), at, 0.1, 0, (VL, VR))
# pouso: Ré maj9 limpo em "2030" (o pad segura), sino e um único thud macio
add(stab('D', 1.0), 2080, 0.12, 0)
add(stab('D'), 2080, 0.12, 0, (VL, VR))
add(bell(hz('F#5'), 5.0), 2080, 0.05, 0.2)
add(bell(hz('A5'), 5.0), 2082, 0.04, -0.2)
add(thud(0.7), 2080, 0.12)

# ------------------------------------------------------------------ efeitos: delay (pluck) e reverb
dly = int(0.5 * SR)  # colcheia pontuada a 90 BPM
for _ in range(1):
    dl = np.zeros(N)
    dr = np.zeros(N)
    fbL, fbR = DL.copy(), DR.copy()
    for k in range(1, 6):
        g = 0.32 ** k
        sh = dly * k
        if sh >= N:
            break
        if k % 2:
            dr[sh:] += fbL[:-sh] * g
        else:
            dl[sh:] += fbR[:-sh] * g
    L += lp(dl, 3500)
    R += lp(dr, 3500)
    VL += dl * 0.5
    VR += dr * 0.5

# ar no topo: uma prateleira suave acima de 6 kHz
L += hp(L, 6000) * 0.35
R += hp(R, 6000) * 0.35
ir_n = int(2.4 * SR)
t = np.arange(ir_n) / SR
irL = lp(rng.standard_normal(ir_n), 6000) * np.exp(-t / 0.55)
irR = lp(rng.standard_normal(ir_n), 6000) * np.exp(-t / 0.55)
irL /= np.sqrt((irL ** 2).sum())
irR /= np.sqrt((irR ** 2).sum())
L += hp(fftconvolve(VL, irL)[:N], 200) * 0.55
R += hp(fftconvolve(VR, irR)[:N], 200) * 0.55

# ------------------------------------------------------------------ master
mix = np.stack([L, R], 1)
mix = hp(mix.T, 40, 4).T
fr = np.arange(N) / SR * FPS
fade = np.clip((END - fr) / 2, 0, 1) * np.clip(fr / 6, 0, 1)  # corte seco no fim
mix *= fade[:, None]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) / np.tanh(1.4) * 0.8
pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
with wave.open('public/audio/music/music_v5.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('music_v5.wav', round(N / SR, 1), 's')
