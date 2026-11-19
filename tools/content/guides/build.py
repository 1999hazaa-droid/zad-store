# -*- coding: utf-8 -*-
"""python3 build.py <slug…|all> — يولّد PDF + غلاف لكل دليل ويحدّث guides.json"""
import sys, os, json, glob
sys.path.insert(0, os.path.dirname(__file__))
from gcommon import *
import g_parents, g_teachers, g_children, g_ages, g_sections, g_templates  # noqa
from playwright.sync_api import sync_playwright
from PIL import Image
TMP = '/tmp/claude-0/-home-claude/f8f16bbd-fb86-5b0f-ab89-39a21cbeece6/scratchpad/guides'; os.makedirs(TMP, exist_ok=True)
def main(names):
    if names == ['all']: names = list(GUIDES)
    meta = {}; mp = os.path.join(os.path.dirname(__file__), 'guides.json')
    if os.path.exists(mp): meta = json.load(open(mp, encoding='utf-8'))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for n in names:
            g = GUIDES[n]()
            hp = f'{TMP}/{n}.html'; open(hp, 'w', encoding='utf-8').write(guide_html(g))
            pg = b.new_page(); pg.goto('file://' + hp); pg.wait_for_timeout(400)
            pdf = f'{ROOT}/files/guides/{n}.pdf'; os.makedirs(os.path.dirname(pdf), exist_ok=True)
            pg.pdf(path=pdf, prefer_css_page_size=True, print_background=True); pg.close()
            cp = f'{TMP}/{n}-cover.html'; open(cp, 'w', encoding='utf-8').write(cover_html(g))
            pg = b.new_page(viewport={'width': 440, 'height': 330}, device_scale_factor=2); pg.goto('file://' + cp); pg.wait_for_timeout(300)
            d = f'{ROOT}/images/guides/{n}'; os.makedirs(d, exist_ok=True)
            pg.screenshot(path=f'{TMP}/{n}-cover.png'); pg.close()
            Image.open(f'{TMP}/{n}-cover.png').convert('RGB').save(f'{d}/cover.webp', quality=84)
            import subprocess
            npg = int(subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout.split('Pages:')[1].split()[0])
            g['pages'] = npg; g['size'] = os.path.getsize(pdf); meta[n] = g
            print(n, npg, g['size'])
        b.close()
    json.dump(meta, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if __name__ == '__main__': main(sys.argv[1:] or sys.exit('give slugs'))
