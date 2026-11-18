# -*- coding: utf-8 -*-
import sys, os, subprocess, glob, json
sys.path.insert(0, os.path.dirname(__file__))
from libgen import *
from libspecs import ALL
from playwright.sync_api import sync_playwright
from PIL import Image
TMP = '/tmp/claude-0/-home-claude/f8f16bbd-fb86-5b0f-ab89-39a21cbeece6/scratchpad/gen'
os.makedirs(TMP, exist_ok=True)
names = sys.argv[1:] or list(ALL)
meta = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for n in names:
        spec, pages = ALL[n]()
        slug = spec['slug']
        hp = f'{TMP}/{slug}.html'
        open(hp, 'w', encoding='utf-8').write(wrap(spec, pages))
        pg = b.new_page(); pg.goto('file://' + hp); pg.wait_for_timeout(600)
        pdf = f'{ROOT}/files/lib/{slug}.pdf'
        pg.pdf(path=pdf, format='A4', print_background=True, prefer_css_page_size=True); pg.close()
        bw = f'{ROOT}/files/lib/{slug}-bw.pdf'
        subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-sColorConversionStrategy=Gray', '-dProcessColorModel=/DeviceGray', f'-sOutputFile={bw}', pdf], check=True)
        d = f'{ROOT}/images/lib/{slug}'; os.makedirs(d, exist_ok=True)
        for f in glob.glob(f'{TMP}/{slug}-*.png'): os.remove(f)
        subprocess.run(['pdftoppm', '-r', '110', '-png', pdf, f'{TMP}/{slug}'], check=True)
        pngs = sorted(glob.glob(f'{TMP}/{slug}-*.png'))
        for i, f in enumerate(pngs, 1):
            Image.open(f).convert('RGB').resize((900, 1274)).save(f'{d}/p{i:02d}.webp', quality=82)
        Image.open(pngs[0]).convert('RGB').resize((420, 595)).save(f'{d}/thumb.webp', quality=82)
        meta[slug] = dict(pages=len(pngs), size=os.path.getsize(pdf), bw=os.path.getsize(bw))
        print(slug, meta[slug])
    b.close()
json.dump(meta, open(f'{TMP}/meta.json', 'w'))
