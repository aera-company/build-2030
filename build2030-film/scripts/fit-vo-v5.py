"""
Locução V5: FLUXO. Cada bloco (uma tomada da voz AERA F1) vira um arquivo só, com as pausas internas
comprimidas para as faixas do brief, sem mexer no andamento das palavras:
  fim de frase (. ! ?)  → 240 ms
  dois-pontos           → 220 ms
  vírgula / respiro      → no máximo 180 ms (pausa natural menor fica como está)
Os verbos (t7) saem um por arquivo, para cair nos acentos da música.
As pausas ENTRE blocos (350–500 ms; 500–650 ms antes dos verbos) são decididas em src/motion/timing.ts.
Palavras: alinhamento do ElevenLabs mapeado no intervalo de fala medido e depois através dos cortes.
Ganho estático por tomada para −18 LUFS. Saída: public/audio/vo/v5_<id>.wav + src/data/voV5.json.
Uso: python3 scripts/fit-vo-v5.py
"""
import json
import subprocess
import wave

import numpy as np

SR = 48000
FPS = 30
HOP = 480  # 10 ms
RAW = 'public/audio/vo/raw'
GAP_SENT, GAP_COLON, GAP_COMMA = 0.24, 0.22, 0.18
PAD = 0.04  # respiro mantido de cada lado da fala dentro de um corte

# tomada → id do arquivo (ou lista de ids, um por frase)
TAKES = {'t1': 'v1', 't2': 'v2', 't3_c': 'v3', 't4_b': 'v4', 't5': 'v5', 't6': 'v6', 'ta': 'va', 't7': ['g1', 'g2', 'g3'], 't8_b': 'v8'}
# o "Gávia Build 2030" final é o MESMO áudio da abertura (recortado de t1), não uma geração nova
REUSE_END = ('t1', 'v8r')


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


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
    return [w for w in out if not (w['w'].startswith('[') or w['w'].endswith(']'))]


def write(path, y):
    pcm = (np.clip(np.stack([y, y], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


manifest = {'voice': 'SjR6urfwxmM7UisfZHpj', 'model': 'eleven_v3', 'lines': {}}
for take, ids in TAKES.items():
    x = load(f'{RAW}/v5_{take}.mp3')
    al = json.load(open(f'{RAW}/v5_{take}.json'))['alignment']
    words = words_of(al)
    n = len(x) // HOP
    db = 20 * np.log10(np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(1)) + 1e-9)
    thr = db.max() - 30
    on = db > thr
    idx = np.where(on)[0]
    idx = idx[idx / 100 <= words[-1]['e'] + 0.6]
    # estalo/respiro solto no fim: trecho fraco depois de 250 ms de silêncio não é fala
    last = idx[-1]
    for u, v in reversed(list(zip(idx[:-1], idx[1:]))):
        if v - u >= 25 and db[v: last + 1].max() < db.max() - 18:
            last = u
        if v - u >= 25:
            break
    first = idx[0]
    # trechos de fala separados por silêncios de 60 ms+
    segs, a = [], first
    i = first
    while i <= last:
        if not on[i]:
            j = i
            while j <= last and not on[j]:
                j += 1
            if j - i >= 6:
                segs.append((a, i))
                a = j
            i = j
        else:
            i += 1
    segs.append((a, last + 1))
    # alinhamento → tempo medido, por trechos: cada pausa do alinhamento é casada com uma pausa medida no áudio
    k_ = (last + 1 - first) / 100 / max(0.05, words[-1]['e'] - words[0]['s'])
    lin = lambda s: first / 100 + (s - words[0]['s']) * k_
    a_gaps = [(words[i]['e'], words[i + 1]['s']) for i in range(len(words) - 1) if words[i + 1]['s'] - words[i]['e'] > 0.12]
    m_gaps = [(segs_[j][1] / 100, segs_[j + 1][0] / 100) for segs_ in [None] for j in range(0)]  # preenchido abaixo
    m_gaps = [(segs[j][1] / 100, segs[j + 1][0] / 100) for j in range(len(segs) - 1)]
    anchors = [(words[0]['s'], first / 100), (words[-1]['e'], (last + 1) / 100)]
    used = -1
    for ga0, ga1 in a_gaps:
        guess = lin((ga0 + ga1) / 2)
        cands = [(abs((m0 + m1) / 2 - guess), j) for j, (m0, m1) in enumerate(m_gaps) if j > used and abs((m0 + m1) / 2 - guess) < 0.6]
        if not cands:
            continue
        _, j = min(cands)
        used = j
        anchors += [(ga0, m_gaps[j][0]), (ga1, m_gaps[j][1])]
    anchors.sort()
    ax_, ay_ = zip(*anchors)
    tm = lambda s: float(np.interp(s, ax_, ay_))
    # pontuação: fim de cada palavra com pontuação, em tempo medido
    marks = [(tm(w['e']), w['w'][-1]) for w in words if w['w'][-1] in '.!?:,']
    gain = 10 ** ((-18 - loudness(x[first * HOP:(last + 1) * HOP])) / 20)

    def gap_target(g0, g1):
        near = [p for t, p in marks if g0 / 100 - 0.25 <= t <= g1 / 100 + 0.15]
        if any(p in '.!?' for p in near):
            return GAP_SENT, '.'
        if ':' in near:
            return GAP_COLON, ':'
        return GAP_COMMA, ','

    # monta: fala + pausas comprimidas; guarda o mapa tempo original → tempo novo
    pieces, cuts, tnew = [], [], 0.0  # cuts: (orig_ini, novo_ini) por trecho
    sentence_breaks = []
    for si, (s0, s1) in enumerate(segs):
        a0 = max(0, s0 / 100 - PAD)
        a1 = s1 / 100 + PAD
        if si:
            prev_end = segs[si - 1][1] / 100 + PAD
            g_orig = s0 / 100 - PAD - prev_end
            tgt, kind = gap_target(segs[si - 1][1], s0)
            g = min(g_orig, tgt) if kind == ',' else tgt
            if kind == '.':
                sentence_breaks.append(tnew + g / 2)
            # o respiro usa o próprio ar da tomada (nada de silêncio digital no meio da voz)
            ga = x[int(prev_end * SR): int((s0 / 100 - PAD) * SR)].copy()
            n_t = int(max(0, g) * SR)
            if len(ga) > n_t > 0:
                h_ = n_t // 2
                xf = min(int(0.006 * SR), h_)
                a_, b_ = ga[:h_].copy(), ga[len(ga) - (n_t - h_):].copy()
                if xf > 0:
                    a_[-xf:] *= np.linspace(1, 0, xf)
                    b_[:xf] *= np.linspace(0, 1, xf)
                    a_[-xf:] += b_[:xf]
                    ga = np.concatenate([a_, b_[xf:]])
                else:
                    ga = np.concatenate([a_, b_])
            pieces.append(ga.astype(np.float32))
            tnew += len(ga) / SR
        seg = x[int(a0 * SR): int(a1 * SR)].copy()
        f_ = int(0.008 * SR)
        seg[:f_] *= np.linspace(0, 1, f_)
        seg[-f_:] *= np.linspace(1, 0, f_)
        cuts.append((a0, a1, tnew))
        pieces.append(seg)
        tnew += len(seg) / SR
    y = np.concatenate(pieces) * gain
    lead = 0.10
    # bordas com o ar da própria tomada (fade de 60 ms), não com zero
    a_first = max(0.0, segs[0][0] / 100 - PAD)
    pre = x[max(0, int((a_first - lead) * SR)): int(a_first * SR)].copy() * gain
    pre = np.concatenate([np.zeros(int(lead * SR) - len(pre), np.float32), pre]) if len(pre) < int(lead * SR) else pre
    z_end = segs[-1][1] / 100 + PAD
    post = x[int(z_end * SR): int((z_end + 0.25) * SR)].copy() * gain
    post = np.concatenate([post, np.zeros(int(0.25 * SR) - len(post), np.float32)])
    pre[: int(0.06 * SR)] *= np.linspace(0, 1, int(0.06 * SR))
    post[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))
    y = np.concatenate([pre.astype(np.float32), y, post.astype(np.float32)])

    def remap(t):  # tempo medido original → tempo no arquivo novo
        for a0, a1, tn in cuts:
            if t < a1:
                return lead + tn + max(0.0, t - a0)
        a0, a1, tn = cuts[-1]
        return lead + tn + (a1 - a0)

    ws = [{'w': w['w'].strip('.,?!:'), 'f': round(remap(tm(w['s'])) * FPS)} for w in words]
    # atividade de fala por frame (ducking palavra a palavra)
    yn = len(y)
    env = []
    for fr in range(int(np.ceil(yn / SR * FPS))):
        seg = y[int(fr / FPS * SR): int((fr + 1) / FPS * SR)]
        env.append(1 if len(seg) and 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9) > -38 else 0)

    if isinstance(ids, list):
        # uma frase por arquivo: corta nas quebras de frase
        bounds = [0.0] + [lead + b for b in sentence_breaks] + [yn / SR]
        assert len(bounds) - 1 == len(ids), (take, len(bounds) - 1)
        for k, lid in enumerate(ids):
            a, b = bounds[k], bounds[k + 1]
            z = y[int(a * SR): int(b * SR)]
            z = np.concatenate([np.zeros(int(0.04 * SR), np.float32), z]) if k else z
            write(f'public/audio/vo/v5_{lid}.wav', z)
            sub = [{'w': w['w'], 'f': w['f'] - round(a * FPS) + (1 if k else 0)} for w in ws if a * FPS <= w['f'] < b * FPS]
            e = env[round(a * FPS): round(b * FPS)]
            manifest['lines'][lid] = {'file': f'audio/vo/v5_{lid}.wav', 'frames': int(np.ceil(len(z) / SR * FPS)), 'words': sub, 'env': ''.join(map(str, e))}
            print(f'{lid}  {len(z)/SR:5.2f}s  ' + ' '.join(f"{w['w']}@{w['f']}" for w in sub))
    else:
        if take == REUSE_END[0]:
            # a mesma performance da abertura: do respiro antes de "Gávia" até o fim
            gav = next(w['f'] for w in ws if w['w'].startswith('Gáv')) / FPS
            starts = [lead + tn for a0, a1, tn in cuts if lead + tn <= gav + 0.05]
            a = max(starts) - 0.09  # o trecho de fala de "Gávia", com o respiro de entrada
            z = y[int(a * SR):].copy()
            z[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
            sub = [{'w': w['w'], 'f': w['f'] - round(a * FPS)} for w in ws if w['f'] >= a * FPS]
            e = env[round(a * FPS):]
            write(f'public/audio/vo/v5_{REUSE_END[1]}.wav', z)
            manifest['lines'][REUSE_END[1]] = {'file': f'audio/vo/v5_{REUSE_END[1]}.wav', 'frames': int(np.ceil(len(z) / SR * FPS)), 'words': sub, 'env': ''.join(map(str, e))}
            print(f'{REUSE_END[1]}  {len(z)/SR:5.2f}s  (recorte da abertura) ' + ' '.join(f"{w['w']}@{w['f']}" for w in sub))
        write(f'public/audio/vo/v5_{ids}.wav', y)
        manifest['lines'][ids] = {'file': f'audio/vo/v5_{ids}.wav', 'frames': int(np.ceil(yn / SR * FPS)), 'words': ws, 'env': ''.join(map(str, env))}
        print(f'{ids}  {(last + 1 - first)/100:5.2f}s → {yn/SR:5.2f}s  ' + ' '.join(f"{w['w']}@{w['f']}" for w in ws))

json.dump(manifest, open('src/data/voV5.json', 'w'), ensure_ascii=False, indent=1)
print('ok → src/data/voV5.json')
