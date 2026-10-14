"""
Bed grave da V3 (sem música): drone em Mi, ar filtrado, pulso que entra na régua (B04) e acumula
no B05, silêncio total de 738 a 750 (antes da proposta), campo claro depois da inversão.
Frames em 30 fps, iguais a src/motion/timing.ts.
Uso: python3 scripts/make-bed-v3.py  →  public/audio/bed/bed_v3.wav
"""
import wave

import numpy as np

SR = 48000
FPS = 30
DUR = 60.2
t = np.arange(int(SR * DUR)) / SR
fr = t * FPS
rng = np.random.default_rng(7)


def env(points):
    xs, ys = zip(*points)
    return np.interp(fr, xs, ys)


def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


# drone navy (antes da inversão)
lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t)
drone = (np.sin(2 * np.pi * 41.2 * t) * 0.55 + np.sin(2 * np.pi * 61.74 * t + 0.4) * 0.3 + np.sin(2 * np.pi * 82.41 * t + 1.1) * 0.22) * lfo
drone = np.tanh(drone * 1.4) * 0.55
drone *= env([(0, 0), (50, 0.75), (118, 0.6), (300, 0.7), (600, 0.95), (728, 1.0), (737, 0.0), (1184, 0.0), (1192, 0.8), (1392, 0.9), (1494, 0.6), (1525, 0.3), (1576, 0.7), (1675, 0.9), (1676, 0.0), (1689, 0.0), (1708, 0.45), (1797, 0.4), (1800, 0)])

# campo claro (depois da inversão): mais alto, mais aberto
bright = (np.sin(2 * np.pi * 82.41 * t) * 0.35 + np.sin(2 * np.pi * 123.47 * t + 0.3) * 0.25 + np.sin(2 * np.pi * 164.81 * t + 0.9) * 0.14)
bright = np.tanh(bright * 1.2) * 0.42 * env([(0, 0), (749, 0), (752, 0.55), (800, 0.85), (1180, 0.95), (1190, 0), (1398, 0), (1416, 0.35), (1478, 0.35), (1494, 0)])

# cor (B14): acorde aberto que sobe quando o panorama abre e sustenta até antes do silêncio
color = (np.sin(2 * np.pi * 82.41 * t) * 0.3 + np.sin(2 * np.pi * 123.47 * t) * 0.24 + np.sin(2 * np.pi * 164.81 * t) * 0.18 + np.sin(2 * np.pi * 246.94 * t) * 0.1)
color = np.tanh(color * 1.3) * 0.5 * env([(0, 0), (1518, 0), (1547, 0.9), (1645, 0.75), (1675, 0.6), (1676, 0), (1800, 0)])

# ar: ruído filtrado (respiro da imagem)
noise = rng.standard_normal(len(t))
air = noise - lowpass(noise, 1800)
air = lowpass(air, 7000) * 0.05 * env([(0, 0), (40, 0.6), (110, 1.0), (130, 0.3), (210, 0.4), (250, 0.9), (300, 0.3), (737, 0.3), (738, 0), (750, 0), (760, 0.5), (1185, 0.35), (1520, 0.9), (1560, 0.4), (1675, 0.4), (1676, 0), (1688, 0), (1708, 0.3), (1800, 0.2)])

# pulso: entra com a régua, acumula com as palavras, para antes da proposta
pulse = np.zeros_like(t)
beat = 60 / 96
start = 326 / FPS
stop = 728 / FPS
k = 0
times = []
while start + k * beat < stop:
    times.append(start + k * beat)
    k += 1
# pulso da tecnologia (B11–B12) e dos verbos (B15)
k = 0
while 1201 / FPS + k * (60 / 104) < 1380 / FPS:
    times.append(1201 / FPS + k * (60 / 104))
    k += 1
k = 0
while 1576 / FPS + k * (60 / 100) < 1672 / FPS:
    times.append(1576 / FPS + k * (60 / 100))
    k += 1
for t0 in times:
    i0 = int(t0 * SR)
    n = int(0.42 * SR)
    seg = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (52 + 30 * np.exp(-seg * 30)) * seg) * np.exp(-seg * 9)
    pulse[i0:i0 + n] += thump[: len(pulse) - i0]
pulse *= 0.32 * env([(0, 0), (326, 0.35), (360, 0.55), (615, 1.0), (700, 0.7), (728, 0), (1200, 0), (1201, 0.55), (1380, 0.7), (1390, 0), (1575, 0), (1576, 0.9), (1672, 1.0), (1676, 0)])

mix = drone + bright + color + air + pulse
# corte final seco (3 frames)
mix *= env([(0, 1), (1797, 1), (1800, 0)])
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.7
st = np.stack([mix, np.roll(mix, int(0.011 * SR)) * 0.96], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open('public/audio/bed/bed_v3.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('bed_v3.wav', DUR, 's')
