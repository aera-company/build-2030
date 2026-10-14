"""
Encaixe da locução V3.1 com tempo por palavra preservado.
Para cada fala em public/audio/vo/raw/v3_<id>.mp3 (+ .json do ElevenLabs with-timestamps):
  1. corta o silêncio das pontas;
  2. encurta pausas internas maiores que PAUSE[id] para KEEP s (com crossfade de 12 ms);
  3. comprime o tempo uniformemente (atempo ≤ 1,1) só se ainda não couber em WINDOW[id] frames;
  4. nivela em −18 LUFS.
Grava public/audio/vo/v3_<id>.wav e src/data/voV3.json com {file, frames, words:[{w, f}]} (f = frame relativo ao início da fala).
Uso: python3 scripts/fit-vo.py
"""
import json, os, subprocess, wave
import numpy as np

SR = 48000
FPS = 30
VO = 'public/audio/vo'
WINDOW = {'v01': 80, 'v02': 80, 'v03': 100, 'v04': 98, 'v05': 172, 'v06': 143, 'v07': 206, 'v08': 110, 'v09': 74, 'v10': 100, 'v11': 60}
PAUSE = {'v06': 0.36, 'v07': 0.24, 'v08': 0.24}
KEEP = {'v06': 0.30, 'v07': 0.18, 'v08': 0.18}


def decode(path):
    raw = subprocess.check_output(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'])
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768


def words_of(al):
    out, cur, s0, pe = [], '', None, 0
    for c, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if c == ' ':
            if cur:
                out.append([cur, s0, pe])
            cur = ''
            continue
        if not cur:
            s0 = s
        cur += c
        pe = e
    if cur:
        out.append([cur, s0, pe])
    return out


manifest = {'lines': {}}
for fname in sorted(os.listdir(f'{VO}/raw')):
    if not fname.endswith('.mp3'):
        continue
    vid = fname[3:-4]
    x = decode(f'{VO}/raw/{fname}')
    meta = json.load(open(f'{VO}/raw/v3_{vid}.json'))
    words = words_of(meta['alignment'])
    # envelope de energia (10 ms)
    hop = SR // 100
    env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x), hop)])
    db = 20 * np.log10(env + 1e-9)
    voiced = db > -42
    first = max(0, np.argmax(voiced) * hop - int(0.03 * SR))
    last = min(len(x), (len(voiced) - np.argmax(voiced[::-1])) * hop + int(0.12 * SR))
    # mapa de tempo original → novo
    segs = []  # (orig_start, orig_end) que ficam
    t = first
    if vid in PAUSE:
        silent = ~voiced
        i = first // hop
        while i < last // hop:
            if silent[i]:
                j = i
                while j < len(silent) and silent[j] and j < last // hop:
                    j += 1
                dur = (j - i) * hop / SR
                if dur > PAUSE[vid] and i * hop > first + SR * 0.1:
                    keep = int(KEEP[vid] * SR)
                    cut_a = i * hop + keep // 2
                    cut_b = j * hop - keep // 2
                    segs.append((t, cut_a))
                    t = cut_b
                i = j
            else:
                i += 1
    segs.append((t, last))
    fade = int(0.012 * SR)
    pieces = []
    for a, b in segs:
        p = x[a:b].copy()
        if len(p) > 2 * fade:
            p[:fade] *= np.linspace(0, 1, fade)
            p[-fade:] *= np.linspace(1, 0, fade)
        pieces.append(p)
    y = np.concatenate(pieces)

    def remap(ts):
        s = ts * SR
        acc = 0
        for a, b in segs:
            if s < a:
                return acc / SR
            if s <= b:
                return (acc + s - a) / SR
            acc += b - a
        return acc / SR

    dur = len(y) / SR
    r = max(1.0, min(1.1, dur / (WINDOW[vid] / FPS)))
    tmp = f'{VO}/_t.wav'
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
    out = f'{VO}/v3_{vid}.wav'
    loud = subprocess.run(['ffmpeg', '-nostdin', '-i', tmp, '-af', f'atempo={r:.4f},ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float([l for l in loud.split('Integrated loudness')[1].splitlines() if 'I:' in l][0].split()[1])
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-af', f'atempo={r:.4f},volume={-18 - I:.2f}dB', '-ar', str(SR), '-ac', '2', out], check=True)
    os.remove(tmp)
    frames = round(dur / r * FPS)
    ws = [{'w': w, 'f': round(remap(s) / r * FPS)} for w, s, e in words]
    manifest['lines'][vid] = {'file': out.replace('public/', ''), 'frames': frames, 'words': ws}
    print(f'{vid:4s} {len(x)/SR:5.2f}s → {dur:5.2f}s → ×{r:.3f} → {frames:3d}f (janela {WINDOW[vid]}f)  ' + ' '.join(f"{w['w']}@{w['f']}" for w in ws))
json.dump(manifest, open('src/data/voV3.json', 'w'), indent=1, ensure_ascii=False)
