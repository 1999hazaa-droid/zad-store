# -*- coding: utf-8 -*-
"""python3 build.py <slug> [slug…] — يولّد PDF + PDF أبيض/أسود + صور معاينة لكل صفحة + غلاف. لا تستورد بدون وسائط."""
import sys, os, glob, json, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from common import *
import posters, mindmaps, mindmaps2, slides2, posters2, posters3, toddlers, kids46, grades14, grades14b, pract, pract2, boards2, infos2, infographics, tables, diagrams, explainers, cardsets, printables, slides, boards  # noqa
from playwright.sync_api import sync_playwright
from PIL import Image
TMP = '/tmp/claude-0/-home-claude/f8f16bbd-fb86-5b0f-ab89-39a21cbeece6/scratchpad/media'
os.makedirs(TMP, exist_ok=True)
OUTW = {'portrait': (900, 1273), 'landscape': (1100, 778), 'slide': (1100, 619)}
def main(names):
    meta = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for n in names:
            sp, pages = REG[n]()
            sp['slug'] = n
            hp = f'{TMP}/{n}.html'; open(hp, 'w', encoding='utf-8').write(doc(sp, pages))
            pg = b.new_page(); pg.goto('file://' + hp); pg.wait_for_timeout(500)
            pdf = f'{ROOT}/files/media/{n}.pdf'; os.makedirs(os.path.dirname(pdf), exist_ok=True)
            pg.pdf(path=pdf, prefer_css_page_size=True, print_background=True); pg.close()
            bw = f'{ROOT}/files/media/{n}-bw.pdf'
            subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-sColorConversionStrategy=Gray', '-dProcessColorModel=/DeviceGray', f'-sOutputFile={bw}', pdf], check=True)
            d = f'{ROOT}/images/media/{n}'; os.makedirs(d, exist_ok=True)
            for f in glob.glob(f'{d}/*.webp'): os.remove(f)
            for f in glob.glob(f'{TMP}/{n}-*.png'): os.remove(f)
            subprocess.run(['pdftoppm', '-r', '130', '-png', pdf, f'{TMP}/{n}'], check=True)
            pngs = sorted(glob.glob(f'{TMP}/{n}-*.png'))
            W, H = OUTW[sp['orient']]
            for i, f in enumerate(pngs, 1): Image.open(f).convert('RGB').resize((W, H)).save(f'{d}/p{i:02d}.webp', quality=84)
            tw, th = (W * 2 // 5, H * 2 // 5)
            Image.open(pngs[0]).convert('RGB').resize((tw, th)).save(f'{d}/thumb.webp', quality=82)
            meta[n] = dict(pages=len(pngs), size=os.path.getsize(pdf), orient='landscape' if sp['orient'] != 'portrait' else 'portrait', kind=sp['kind'], title=sp['title'], desc=sp['desc'], levels=sp['levels'], subject=sp['subject'], topic=sp.get('topic', ''), note=sp.get('note', ''), sort=sp.get('sort', 0))
            print(n, meta[n]['pages'], meta[n]['size'])
        b.close()
    old = {}
    mp = f'{ROOT}/tools/content/media/meta.json'
    if os.path.exists(mp): old = json.load(open(mp, encoding='utf-8'))
    old.update(meta); json.dump(old, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if __name__ == '__main__': main(sys.argv[1:] or sys.exit('give slugs'))
