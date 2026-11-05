"""Pre-record every sentence of Sibol Reads with the Piper neural voice.
Letter sounds (sss, mmm, ah...) are fed to the voice as real phonemes so they come out as true phonics sounds."""
import json, os, re, subprocess, sys, wave
import numpy as np
from piper import PiperVoice

MODEL, OUT = sys.argv[1], sys.argv[2]
data = json.load(open('phrases.json'))
voice = PiperVoice.load(MODEL)
print('piper api:', [a for a in dir(voice) if not a.startswith('_')])
cfg = voice.config
sr = cfg.sample_rate
idmap = cfg.phoneme_id_map
print('sample rate', sr, 'phonemes known', len(idmap))

LETTER_NAMES = dict(a='ay', b='bee', c='see', d='dee', e='ee', f='ef', g='jee', h='aitch', i='eye', j='jay', k='kay', l='el', m='em',
                    n='en', o='oh', p='pee', q='cue', r='ar', s='ess', t='tee', u='you', v='vee', w='double you', x='ex', y='why', z='zee')
LETTER_CTX = {'letter', 'write', 'with', 'five', "that's", 'find'}

def speakable(text):
    """Turn single letters into their spoken names (keeps the article 'a' and the word 'I')."""
    words = text.split(' ')
    out = []
    for i, w in enumerate(words):
        core = re.sub(r'[^A-Za-z]', '', w)
        prev = re.sub(r"[^a-z']", '', words[i-1].lower()) if i else ''
        if len(core) == 1 and core != 'I':
            lower = core.lower()
            if core.isupper() or lower != 'a' or prev in LETTER_CTX or len(words) == 1 and w != core:
                w = w.replace(core, LETTER_NAMES[lower])
        out.append(w)
    return ' '.join(out)

sounds = data['sounds']
pat = re.compile(r"(?<![A-Za-z'])(" + '|'.join(sorted(map(re.escape, sounds), key=len, reverse=True)) + r")(?![A-Za-z'])", re.I)

def phon(text):
    if not re.search(r'[A-Za-z]', text):
        return [c for c in text if c in idmap]
    res = voice.phonemize(text)
    flat = []
    for sent in res:
        flat += list(sent) + [' ']
    return flat[:-1]

def phonemes_for(text):
    out = []
    for i, part in enumerate(pat.split(text)):
        if not part:
            continue
        if i % 2 == 1:
            ipa = sounds[part.lower()]
            out += ['ˈ'] + [c for c in ipa if c in idmap]
        else:
            out += phon(speakable(part))
    bad = [p for p in out if p not in idmap]
    if bad:
        print('  skipping unknown phonemes', set(bad), 'in', text)
    return [p for p in out if p in idmap]

def synth(phonemes):
    ids = voice.phonemes_to_ids(phonemes)
    if hasattr(voice, 'phoneme_ids_to_audio'):
        try:
            from piper import SynthesisConfig
            a = voice.phoneme_ids_to_audio(ids, SynthesisConfig(length_scale=1.12))
        except Exception:
            a = voice.phoneme_ids_to_audio(ids)
        a = np.asarray(a)
        if a.dtype != np.int16:
            a = (np.clip(a, -1, 1) * 32767).astype(np.int16)
        return a.tobytes()
    return voice.synthesize_ids_to_raw(ids, length_scale=1.12)

os.makedirs(OUT, exist_ok=True)
amap = {}
for n, s in enumerate(data['sentences']):
    ph = phonemes_for(s['text'])
    if not ph:
        continue
    raw = synth(ph)
    wav = f'/tmp/{n}.wav'
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(raw)
    name = f'{n:04d}.ogg'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.08',
                    '-ac', '1', '-c:a', 'libopus', '-b:a', '32k', os.path.join(OUT, name)], check=True)
    amap[s['key']] = name
    if n < 3 or pat.search(s['text']):
        if n < 40:
            print(repr(s['text']), '->', ''.join(ph))
open(os.path.join(OUT, 'manifest.js'), 'w').write('window.AUDIO_MAP=' + json.dumps(amap, ensure_ascii=False) + ';')
print('recorded', len(amap), 'sentences')
