"""
Locução V4: corta cada tomada (uma por bloco, voz AERA F1) em frases pelo envelope real do áudio,
sem mexer no andamento (nada de atempo: o filme se ajusta à voz, não o contrário).
- cortes nos N-1 maiores silêncios de cada tomada;
- pré-rolo 0,12 s antes do ataque (lição do teaser: consoante inicial comida), cauda 0,22 s com fade;
- ganho estático por TOMADA para −18 LUFS (a dinâmica entre frases do mesmo bloco fica como a voz fez);
- palavras: alinhamento do ElevenLabs reancorado no ataque medido de cada frase.
Saída: public/audio/vo/v4_<id>.wav + src/data/voV4.json {lines: {id: {file, frames, words: [{w, f}]}}}.
Uso: python3 scripts/fit-vo-v4.py
"""
import json
import subprocess

import numpy as np

SR = 48000
FPS = 30
RAW = 'public/audio/vo/raw'
HOP = 480  # 10 ms

# tomada escolhida → ids das frases, na ordem
TAKES = {
    't1_b': ['a1', 'a2'],
    't2': ['b1', 'b2', 'b3'],
    't3': ['c1', 'c2', 'c3'],
    't4': ['d1'],
    't5': ['e1', 'e2'],
    't6': ['f1'],
    't7_d': ['g1', 'g2', 'g3'],
}


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def envelope(x):
    n = len(x) // HOP
    return 20 * np.log10(np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(1)) + 1e-9)


def loudness(x):
    p = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    for line in p.stderr.decode().splitlines()[::-1]:
        if line.strip().startswith('I:'):
            return float(line.split()[1])
    return -23.0


def words_of(al):
    out, cur = [], None
    for c, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if c.isspace():
            if cur:
                out.append(cur)
            cur = None
        else:
            if cur is None:
                cur = {'w': '', 's': s, 'e': e}
            cur['w'] += c
            cur['e'] = e
    if cur:
        out.append(cur)
    # tags de direção ([calm], [pause]) não são fala
    return [w for w in out if not (w['w'].startswith('[') and w['w'].endswith(']'))]


manifest = {'voice': 'SjR6urfwxmM7UisfZHpj', 'model': 'eleven_v3', 'lines': {}}
for take, ids in TAKES.items():
    x = load(f'{RAW}/v4_{take}.mp3')
    al = json.load(open(f'{RAW}/v4_{take}.json'))['alignment']
    words = words_of(al)
    db = envelope(x)
    thr = db.max() - 30
    on = db > thr
    idx = np.where(on)[0]
    # fala = do primeiro ataque até o último quadro acima do limiar perto do fim do alinhamento (ignora estalos depois)
    idx = idx[idx / 100 <= words[-1]['e'] + 0.5]
    first, last = idx[0], idx[-1]
    # respiração no fim/começo: um trecho fraco (18 dB abaixo do pico) separado da fala por 200 ms+ não é fala
    weak = db.max() - 18
    tail = np.where(on[first: last + 1])[0] + first
    for u, v in reversed(list(zip(tail[:-1], tail[1:]))):
        if v - u >= 20 and db[v: last + 1].max() < weak:
            last = u
        if v - u >= 20:
            break
    for u, v in zip(tail[:-1], tail[1:]):
        if v - u >= 20 and db[first: u + 1].max() < weak:
            first = v
        if v - u >= 20:
            break
    gaps, i = [], first
    while i < last:
        if not on[i]:
            j = i
            while j < last and not on[j]:
                j += 1
            gaps.append((j - i, i, j))
            i = j
        else:
            i += 1
    # palavras por frase: a pontuação final fecha a frase
    groups, cur = [], []
    for w in words:
        cur.append(w)
        if w['w'][-1] in '.?!':
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    # um corte por fronteira: o maior silêncio perto da fronteira que o alinhamento indica
    # o alinhamento do v3 vem deslocado: reancora no primeiro ataque medido; cortes sempre em ordem
    off = first / 100 - words[0]['s']
    cuts = []
    for k in range(len(groups) - 1):
        lo, hi = groups[k][-1]['s'] + off - 0.05, groups[k + 1][0]['s'] + off + 0.3
        after = cuts[-1][2] if cuts else first
        cand = [g for g in gaps if g[1] > after and g[2] / 100 >= lo and g[1] / 100 <= hi]
        cuts.append(max(cand))
    bounds = [first] + [g for gap in cuts for g in (gap[1], gap[2])] + [last + 1]
    segs = [(bounds[k], bounds[k + 1]) for k in range(0, len(bounds), 2)]
    gain = 10 ** ((-18 - loudness(x[first * HOP:(last + 1) * HOP])) / 20)
    assert len(groups) == len(ids) == len(segs), (take, len(groups), len(ids), len(segs))
    for k, (lid, (a, b), g) in enumerate(zip(ids, segs, groups)):
        prev_end = segs[k - 1][1] if k else 0
        next_on = segs[k + 1][0] if k + 1 < len(segs) else len(db)
        s0 = max(a - 12, (prev_end + a) // 2 if k else 0)
        s1 = min(b + 22, (b + next_on) // 2 if k + 1 < len(segs) else len(db))
        y = x[s0 * HOP: s1 * HOP] * gain
        fi, fo = int(0.012 * SR), int(0.08 * SR)
        y[:fi] *= np.linspace(0, 1, fi)
        y[-fo:] *= np.linspace(1, 0, fo)
        pcm = (np.clip(np.stack([y, y], 1), -1, 1) * 32767).astype('<i2')
        path = f'public/audio/vo/v4_{lid}.wav'
        import wave
        with wave.open(path, 'wb') as wf:
            wf.setnchannels(2)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            wf.writeframes(pcm.tobytes())
        # alinhamento → áudio medido: o intervalo [início da 1ª palavra, fim da última] é mapeado no [ataque, fim] medido
        onset, offset = a / 100, b / 100
        s0a, s1a = g[0]['s'], g[-1]['e']
        k_ = (offset - onset) / max(0.05, s1a - s0a)
        lead = (a - s0) / 100  # pré-rolo dentro do arquivo
        ws = [{'w': w['w'].strip('.,?!'), 'f': round((onset + (w['s'] - s0a) * k_ - onset + lead) * FPS)} for w in g]
        # atividade de fala por frame (para o ducking palavra a palavra)
        nfr = int(np.ceil(len(y) / SR * FPS))
        env = []
        for fr in range(nfr):
            c0 = s0 + int(fr * 100 / FPS)
            seg = db[c0: c0 + 4]
            env.append(1 if len(seg) and seg.max() > thr + 4 else 0)
        manifest['lines'][lid] = {'file': f'audio/vo/v4_{lid}.wav', 'frames': int(np.ceil(len(y) / SR * FPS)), 'lead': round(lead * FPS), 'speech': round((b - a) / 100 * FPS), 'words': ws, 'env': ''.join(map(str, env))}
        print(f'{lid}  {len(y)/SR:5.2f}s  fala {(b-a)/100:4.2f}s  ' + ' '.join(f"{w['w']}@{w['f']}" for w in ws))

json.dump(manifest, open('src/data/voV4.json', 'w'), ensure_ascii=False, indent=1)
print('ok → src/data/voV4.json')
