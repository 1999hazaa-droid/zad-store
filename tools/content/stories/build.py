# -*- coding: utf-8 -*-
import sys, os, json, random, html, subprocess
sys.path.insert(0, '..')
from data import STORIES
from libgen import wrap, ROOT, E, K
from libspecs3 import tiles, chips, line_match, I
from libspecs4 import order_rows
from playwright.sync_api import sync_playwright
from PIL import Image
TMP = '/tmp/claude-0/-home-claude/f8f16bbd-fb86-5b0f-ab89-39a21cbeece6/scratchpad/gen/stories'
os.makedirs(TMP, exist_ok=True)
IMG = 'file://' + ROOT + '/images/zad/'
TOPIC = {'educational': ('تربوية', '#7c3aed', '#efe6ff'), 'teaching': ('تعليمية', '#2563eb', '#dfe9ff'), 'animals': ('عن الحيوانات', '#ea580c', '#ffeadb'), 'adventure': ('مغامرات', '#db2777', '#fde7f1'),
         'science': ('علمية مبسطة', '#16a34a', '#e0f7e8'), 'values': ('قيم وأخلاق', '#0891b2', '#dcf4fa'), 'thinking': ('تنمية التفكير', '#ca8a04', '#fdf3cf'), 'arabic': ('تعلّم العربية', '#0d9488', '#dcf7f2'), 'english': ('تعلّم الإنجليزية', '#4f46e5', '#e6e7ff')}
LV = {'a3': '3 سنوات', 'a4': '4 سنوات', 'a5': '5 سنوات', 'a6': '6 سنوات', 'g1': 'الصف الأول', 'g2': 'الصف الثاني', 'g3': 'الصف الثالث', 'g4': 'الصف الرابع', 'g5': 'الصف الخامس', 'g6': 'الصف السادس'}
isen = lambda t: t.split('\n')[0].replace(' ', '').isascii()
def img(n, h): return f'<img src="{IMG}{n}.webp" style="height:{h}mm;max-width:46%;object-fit:contain">'
def text_html(t):
    parts = t.split('\n')
    if isen(t):
        return f'<div dir="ltr" style="font-size:26pt;font-weight:700;line-height:1.5;text-align:center">{E(parts[0])}</div>' + (f'<div style="font-size:16pt;color:#5a5473;text-align:center;margin-top:3mm">{E(parts[1])}</div>' if len(parts) > 1 else '')
    return f'<div style="font-size:20pt;line-height:2.4">{E(t)}</div>'
def spec(s):
    n, c, t = TOPIC[s['topic']]
    return dict(slug=s['slug'], title=s['title'], subtitle=s['summary'], chips=[' · '.join(LV[x] for x in s['levels'][:2]), 'قصة ' + n, 'قصة مصوّرة'], color=c, tint=t, note='اقرأ القصة مع طفلك وانظر إلى الصور، ثم أجب عن الأسئلة في ملف الأنشطة.')
def story_pdf_pages(s):
    n, c, t = TOPIC[s['topic']]
    out = []
    for i, p in enumerate(s['pages'], 1):
        pics = ''.join(img(x, 78 if len(p['images']) < 3 else 54) for x in p['images'])
        body = (f'<div style="height:92mm;border-radius:7mm;border:.8mm solid {c};background:linear-gradient(180deg,{t},#fff);display:flex;align-items:center;justify-content:center;gap:6mm">{pics}</div>'
                f'<div class="bx" style="margin-top:8mm;padding:7mm;border-style:solid">{text_html(p["text"])}</div>')
        out.append((f'{s["title"]} — {i}', '', body, 'card'))
    return out
def sh(lst, seed):
    r = random.Random(seed); x = list(lst); r.shuffle(x); return x
def act_pages(s):
    n, c, t = TOPIC[s['topic']]
    body, key = '', []
    for i, q in enumerate(s['questions']):
        d = 'dir="auto"'
        if q['t'] == 'mcq':
            opts = sh(list(enumerate(q['o'])), i + 3)
            body += f'<div class="bx"><b>{i+1})</b> <span {d}>{E(q["q"])}</span><br>' + ''.join(f'<span class="opt" dir="auto">{E(o)}</span>' for _, o in opts) + '</div>'
            key.append(f'({i+1}) {E(q["o"][q["a"]])}')
        elif q['t'] == 'order':
            body += f'<div class="bx"><b>{i+1})</b> {E(q["q"])}</div>' + order_rows([E(x) for x in sh(q['items'], i + 5)])
            key.append(f'({i+1}) ' + ' ← '.join(f'{k+1}) {E(x)}' for k, x in enumerate(q['items'])))
        else:
            left = [E(a) for a, _ in q['pairs']]; right = [E(b) for _, b in sh(q['pairs'], i + 7)]
            body += f'<div class="bx"><b>{i+1})</b> {E(q["q"])}</div>' + line_match(left, right)
            key.append(f'({i+1}) ' + '، '.join(f'{E(a)} ← {E(b)}' for a, b in q['pairs']))
    return [('أسئلة الفهم', f'أسئلة قصة «{s["title"]}». أجب بقلم رصاص.', body, 'ws'), ('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', '<div class="key">' + '<br>'.join(key) + '</div>', 'key')]
def cover_html(s):
    n, c, t = TOPIC[s['topic']]
    pics = ''.join(f'<img src="{IMG}{x}.webp" style="height:200px">' for x in s['pages'][0]['images'][:2])
    lv = ' · '.join(LV[x] for x in s['levels'][:2])
    return f'''<html><head><meta charset="utf-8"><style>@font-face{{font-family:C;src:url(file://{ROOT}/fonts/cairo-bold.woff);font-weight:700}}
body{{margin:0;width:600px;height:800px;font-family:C;direction:rtl;background:linear-gradient(160deg,{c},{c}cc 55%,{t});display:flex;flex-direction:column;align-items:center;padding:30px;box-sizing:border-box;position:relative;overflow:hidden}}
.b{{background:#fff;color:{c};border-radius:30px;padding:6px 22px;font-size:26px;font-weight:700}}
.p{{flex:1;display:flex;align-items:center;justify-content:center;gap:14px;width:100%;margin-top:10px}}
.t{{background:#fff;border-radius:34px;padding:22px 20px;width:100%;text-align:center;font-size:{44 if len(s["title"])<18 else 36}px;font-weight:700;color:{c};line-height:1.35;box-shadow:0 8px 0 #0002;direction:{'ltr' if isen(s['title']) else 'rtl'}}}
.f{{margin-top:16px;color:#fff;font-size:24px;font-weight:700}}</style></head><body><div class="b">قصة {n}</div><div class="p">{pics}</div><div class="t">{E(s['title'])}</div><div class="f">{lv} · زاد التعليمية</div></body></html>'''
def sql_str(x): return "'" + x.replace("'", "''") + "'"
def arr(a): return "array[" + ','.join(sql_str(x) for x in a) + "]::text[]" if a else "'{}'::text[]"
if __name__ == '__main__':
    os.makedirs(f'{ROOT}/files/stories', exist_ok=True)
    sql = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for s in STORIES:
            sp = spec(s); slug = s['slug']
            d = f'{ROOT}/images/stories/{slug}'; os.makedirs(d, exist_ok=True)
            # غلاف
            hp = f'{TMP}/{slug}-cover.html'; open(hp, 'w', encoding='utf-8').write(cover_html(s))
            pg = b.new_page(viewport={'width': 600, 'height': 800}); pg.goto('file://' + hp); pg.wait_for_timeout(400); pg.screenshot(path=f'{TMP}/{slug}-cover.png'); pg.close()
            im = Image.open(f'{TMP}/{slug}-cover.png').convert('RGB'); im.save(f'{d}/cover.webp', quality=84); im.resize((300, 400)).save(f'{d}/thumb.webp', quality=80)
            # PDFs
            for suffix, pages in (('', story_pdf_pages(s)), ('-activities', act_pages(s))):
                hp = f'{TMP}/{slug}{suffix}.html'; open(hp, 'w', encoding='utf-8').write(wrap(sp if not suffix else dict(sp, subtitle='أسئلة وأنشطة قصة «' + s['title'] + '»'), pages))
                pg = b.new_page(); pg.goto('file://' + hp); pg.wait_for_timeout(500)
                pg.pdf(path=f'{ROOT}/files/stories/{slug}{suffix}.pdf', format='A4', print_background=True, prefer_css_page_size=True); pg.close()
            # SQL
            sql.append(f"insert into stories(slug,title,summary,goal,topic,levels,cover_url,pdf_url,activities_pdf_url,questions,status,sort_order) values ({sql_str(slug)},{sql_str(s['title'])},{sql_str(s['summary'])},{sql_str(s['goal'])},{sql_str(s['topic'])},{arr(s['levels'])},{sql_str('images/stories/'+slug+'/cover.webp')},{sql_str('files/stories/'+slug+'.pdf')},{sql_str('files/stories/'+slug+'-activities.pdf')},{sql_str(json.dumps(s['questions'], ensure_ascii=False))}::jsonb,'published',{s['order']});")
            for i, pgd in enumerate(s['pages'], 1):
                sql.append(f"insert into story_pages(story_id,n,text,images) select id,{i},{sql_str(pgd['text'])},{arr(['images/zad/'+x+'.webp' for x in pgd['images']])} from stories where slug={sql_str(slug)};")
            print(slug, 'ok')
    open(f'{TMP}/stories.sql', 'w', encoding='utf-8').write('\n'.join(sql))
