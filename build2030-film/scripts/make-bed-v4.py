"""
Bed da V4 (camada 01): escuro, moderno, textural, grave controlado. Não é música.
Uma cor por ato, sempre em movimento; quatro silêncios reais (antes da AERA, antes da tecnologia,
antes de BUILD 2030, antes da assinatura). Frames a 30 fps, iguais a src/motion/timing.ts.
Uso: python3 scripts/make-bed-v4.py  →  public/audio/bed/bed_v4.wav
"""
import wave

import numpy as np

SR = 48000
FPS = 30
END = 2280
DUR = END / FPS + 0.2
t = np.arange(int(SR * DUR)) / SR
fr = t * FPS
rng = np.random.default_rng(11)

SILENCES = [(956, 970), (1446, 1456), (1563, 1572), (1897, 1908), (2190, 2200)]


def env(points):
    xs, ys = zip(*points)
    return np.interp(fr, xs, ys)


def onepole(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def band(x, lo, hi):
    return onepole(x - onepole(x, lo), hi)


# --- drone navy: Mi grave com quinta; respira devagar (LFO), satura de leve
lfo = 0.86 + 0.14 * np.sin(2 * np.pi * 0.09 * t)
drone = (np.sin(2 * np.pi * 41.2 * t) * 0.5 + np.sin(2 * np.pi * 61.74 * t + 0.4) * 0.3 + np.sin(2 * np.pi * 82.41 * t + 1.1) * 0.2) * lfo
drone = np.tanh(drone * 1.4) * 0.55
drone *= env([(0, 0), (60, 0.55), (168, 0.6), (290, 0.7), (392, 0.8), (664, 0.9), (930, 1.0), (952, 1.0), (956, 0), (970, 0), (980, 0.25), (1300, 0.3), (1440, 0.4), (1446, 0), (1456, 0), (1470, 0.8), (1563, 0.85), (1572, 0.9), (1734, 0.8), (1816, 0.6), (1842, 0.4), (1897, 0.5), (1908, 0.0), (1912, 0.55), (2008, 0.7), (2190, 0.9), (2200, 0), (2214, 0.45), (2276, 0.4), (2280, 0)])

# --- textura: ruído em banda que abre e fecha devagar (avanço sem pulso)
noise = rng.standard_normal(len(t))
sweep = band(noise, 260, 1400) * 0.9 + band(noise, 1400, 5200) * 0.35
sweep *= 0.07 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t - 1.2))
sweep *= env([(0, 0), (40, 0.6), (130, 1.0), (170, 0.5), (290, 0.9), (360, 0.5), (664, 0.7), (930, 1.0), (956, 0), (970, 0), (990, 0.4), (1440, 0.5), (1446, 0), (1456, 0), (1470, 0.6), (1563, 0), (1572, 0.7), (1816, 0.5), (1897, 0), (1908, 0), (1930, 0.4), (2190, 0.5), (2200, 0), (2230, 0.3), (2280, 0)])

# --- informação (C e E): grãos curtos e irregulares, como dados passando
grain = np.zeros_like(t)
for lo, hi, rate in [(664, 956, 11.0), (1470, 1734, 9.0)]:
    n = int((hi - lo) / FPS * rate)
    for s in np.sort(rng.uniform(lo / FPS, hi / FPS, n)):
        i0 = int(s * SR)
        m = int(0.012 * SR)
        g = rng.standard_normal(m) * np.hanning(m) * rng.uniform(0.3, 1.0)
        grain[i0:i0 + m] += g[: len(grain) - i0]
grain = band(grain, 2500, 9000) * 0.5 * env([(0, 0), (664, 0), (700, 0.6), (840, 0.9), (952, 1.0), (956, 0), (1470, 0), (1500, 0.6), (1563, 0.7), (1564, 0), (1572, 0), (1594, 0.8), (1734, 0.4), (1760, 0)])

# --- campo claro (D): quinta aberta, mais alta, sem peso
bright = np.sin(2 * np.pi * 82.41 * t) * 0.35 + np.sin(2 * np.pi * 123.47 * t + 0.3) * 0.26 + np.sin(2 * np.pi * 164.81 * t + 0.9) * 0.14 + np.sin(2 * np.pi * 246.94 * t + 0.2) * 0.05
bright = np.tanh(bright * 1.2) * 0.4 * env([(0, 0), (968, 0), (976, 0.5), (1040, 0.7), (1240, 0.85), (1330, 0.95), (1440, 0.95), (1446, 0)])

# --- cor (F): acorde que abre com o panorama e volta depois de BUILD 2030
color = np.sin(2 * np.pi * 82.41 * t) * 0.3 + np.sin(2 * np.pi * 123.47 * t) * 0.24 + np.sin(2 * np.pi * 164.81 * t) * 0.18 + np.sin(2 * np.pi * 246.94 * t) * 0.1 + np.sin(2 * np.pi * 329.63 * t) * 0.04
color = np.tanh(color * 1.3) * 0.5 * env([(0, 0), (1842, 0), (1868, 0.85), (1896, 0.8), (1897, 0), (1908, 0), (1916, 0.5), (2008, 0.6), (2190, 0.7), (2200, 0), (2216, 0.35), (2276, 0.3), (2280, 0)])

# --- pulso: só onde há avanço (marca · sistema em movimento · tecnologia · verbos)
pulse = np.zeros_like(t)
times = []
for lo, hi, bpm in [(392, 930, 92), (1325, 1440, 100), (1594, 1734, 104), (2008, 2190, 96)]:
    k = 0
    while lo / FPS + k * 60 / bpm < hi / FPS:
        times.append(lo / FPS + k * 60 / bpm)
        k += 1
for t0 in times:
    i0 = int(t0 * SR)
    n = int(0.42 * SR)
    seg = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (50 + 28 * np.exp(-seg * 30)) * seg) * np.exp(-seg * 9)
    pulse[i0:i0 + n] += thump[: len(pulse) - i0]
pulse *= 0.3 * env([(0, 0), (392, 0.35), (588, 0.7), (664, 0.5), (900, 0.3), (930, 0), (1325, 0), (1326, 0.6), (1440, 0.8), (1446, 0), (1594, 0.6), (1734, 0.7), (1740, 0), (2008, 0.7), (2190, 0.9), (2192, 0)])

# --- ar: brilho da imagem, só nos planos abertos
air = noise - onepole(noise, 1800)
air = onepole(air, 7000) * 0.045 * env([(0, 0), (40, 0.6), (110, 1.0), (170, 0.3), (300, 0.9), (360, 0.3), (956, 0.2), (956, 0), (970, 0), (990, 0.5), (1446, 0), (1456, 0), (1842, 0.3), (1870, 0.9), (1897, 0), (1908, 0), (1930, 0.4), (2200, 0), (2230, 0.2), (2280, 0)])

mix = drone + sweep + grain + bright + color + pulse + air
# grave controlado: nada abaixo de ~32 Hz
mix = mix - onepole(mix, 32)
# silêncios reais (com 3 frames de rampa) e corte seco no fim
gate = np.ones_like(t)
for a, b in SILENCES:
    gate = np.minimum(gate, np.clip(np.maximum((a - fr) / 3, (fr - b) / 3), 0, 1))
mix *= gate * env([(0, 1), (END - 3, 1), (END, 0)])
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.7
st = np.stack([mix, np.roll(mix, int(0.011 * SR)) * 0.96], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open('public/audio/bed/bed_v4.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('bed_v4.wav', round(DUR, 1), 's')
