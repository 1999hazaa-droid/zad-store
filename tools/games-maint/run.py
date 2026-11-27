#!/usr/bin/env python3
"""فحص صيانة الألعاب المجانية في زاد التعليمية — يُشغَّل بعد أي تحديث للموقع.

  python3 tools/games-maint/run.py                          # سريع: عيّنة موزعة على كل المراحل (هاتف)
  python3 tools/games-maint/run.py --sample 60 --views phone,tablet,desktop
  python3 tools/games-maint/run.py --full --views phone     # كل الألعاب المعروضة (طويل)
  python3 tools/games-maint/run.py --ids k5_clean,opp       # ألعاب محددة (بعد إصلاح)
  python3 tools/games-maint/run.py --no-smoke               # فحص البيانات والتصنيف فقط (دقيقة)

يكتب تقريرًا في tools/games-maint/reports/ ولا يعدّل أي ملف من الموقع.
المتطلبات: python3 وplaywright (chromium). يشغّل خادمًا محليًا على 8765 إن لم يكن يعمل.
يخرج برمز 1 إن وُجدت مشكلة، و0 إن لم توجد.
"""
import argparse, asyncio, datetime, json, os, random, shutil, socket, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
AUD = os.path.join(ROOT, 'tools', 'audit')
PORT = int(os.environ.get('ZPORT', '8765'))  # اضبط ZPORT لفحص نسخة أخرى؛ ملاحظة: الفحص الآلي للألعاب (audit4) ثابت على 8765
BASE = f'http://localhost:{PORT}/games/'
VIEWS = {'phone': (390, 844), 'tablet': (768, 1024), 'desktop': (1280, 800)}
ALLOWED = {'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'}
STAGES = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
# ألعاب تحتاج حلّالات خاصة (tools/audit/special2.py) ولا يُنهيها الروبوت العام
SPECIAL = {'k_bal', 'k_shape', 'k_puz', 'k_feed', 'k_bubble', 'k_fly', 'k_paint', 'k4_draw', 'k5_maze',
           'k5_plant', 'k5_trace', 'k5_link', 'k5_share', 'k5_feedn', 'k6_code', 'k6_simon', 'k6_collect',
           'k6_catch', 'k6_amaze', 'match', 'sentence', 'k5_shop'}


def server():
    s = socket.socket()
    try:
        s.connect(('127.0.0.1', PORT)); s.close(); return None
    except OSError:
        p = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT,
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.5); return p


async def data_checks():
    from playwright.async_api import async_playwright
    out = {'problems': []}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:120]))
        await pg.route('**/*supabase.co/**', lambda r: r.abort())
        await pg.goto(BASE); await pg.wait_for_function('window.ZREG')
        rows = await pg.evaluate("ZREG.all().map(r=>({id:r.id,title:r.title,ages:r.ages||[],grades:r.grades||[]}))")
        await b.close()
    lv = lambda r: [*r['ages'], *r['grades']]
    listed = [r for r in rows if lv(r)]
    legacy = [r['id'] for r in rows if not lv(r)]
    # مصدر الحقيقة للحالة: games/registry.json (status = legacy تعني مخفية عن الأطفال حتى يُحدَّد عمرها وصفها)
    reg = json.load(open(os.path.join(ROOT, 'games', 'registry.json')))['games']
    reg = reg.values() if isinstance(reg, dict) else reg
    reg_legacy = sorted(x['id'] for x in reg if x.get('status') == 'legacy')
    out['reg_legacy'] = reg_legacy
    ui_listed_legacy = sorted(set(reg_legacy) & {r['id'] for r in listed})
    if ui_listed_legacy: out['problems'].append(f'ألعاب قديمة في السجل لكنها مُدرجة في مراحل الأطفال: {ui_listed_legacy}')
    if sorted(legacy) != reg_legacy: out['problems'].append(f'اختلاف بين الألعاب غير المصنفة في الصفحة والسجل: {sorted(set(legacy) ^ set(reg_legacy))}')
    out.update(total=len(rows), listed=len(listed), legacy=legacy, listed_ids=[r['id'] for r in listed])
    bad = [(r['id'], lv(r)) for r in rows if any(l not in ALLOWED for l in lv(r))]
    if bad: out['problems'].append(f'مراحل خارج 1–6 سنوات والصفوف 1–4: {bad}')
    seen = {}
    for r in listed: seen.setdefault(r['title'].strip(), []).append(r['id'])
    dup = {t: v for t, v in seen.items() if len(v) > 1}
    if dup: out['problems'].append(f'أسماء مكررة بين الألعاب المعروضة (يجب أن يميّزها الصف أو المستوى): {dup}')
    if errs: out['problems'].append(f'أخطاء JavaScript عند فتح الصفحة: {errs[:3]}')
    return out


async def legacy_shown(legacy):
    """هل تظهر ألعاب غير مصنفة كبطاقات في أي صفحة مرحلة؟"""
    from playwright.async_api import async_playwright
    shown = set()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        c = await b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
        pg = await c.new_page()
        await pg.route('**/*supabase.co/**', lambda r: r.abort())
        await pg.goto(BASE)
        sys.path.insert(0, AUD)
        from kidlib import wiz
        await wiz(pg, 'اختبار', 'b', age=3)  # ملف طفل تجريبي محلي فقط؛ لا يُرسل لأي خادم (اتصال Supabase محجوب)
        await pg.wait_for_timeout(1800)
        if not await pg.evaluate("typeof window.__zadStage==='function'"): raise SystemExit('تعذّر فتح صفحات المراحل: __zadStage غير موجودة')
        for st in STAGES:
            await pg.evaluate("s=>window.__zadStage(s)", st); await pg.wait_for_timeout(600)
            shown.update(await pg.evaluate("[...document.querySelectorAll('.gcard[data-g]')].map(e=>e.dataset.g)"))
        await b.close()
    return sorted(set(legacy) & shown), len(shown)


def prep():
    os.makedirs('/tmp/rd/aud', exist_ok=True)
    shutil.copy(os.path.join(AUD, 'kidlib.py'), '/tmp/kidlib.py')
    shutil.copy(os.path.join(AUD, 'botlib.py'), '/tmp/rd/botlib.py')
    subprocess.run([sys.executable, os.path.join(HERE, 'mk_stages.py')], check=True, stdout=subprocess.DEVNULL)


def pick(n, seed):
    D = json.load(open('/tmp/rd/stages.json'))
    per = {s: [g for g in x['cats']['all'] if g not in SPECIAL] for s, x in D.items()}
    tot = sum(len(v) for v in per.values()); rnd = random.Random(seed); out = []
    for v in per.values():
        k = max(2, round(n * len(v) / max(tot, 1))); out += rnd.sample(v, min(k, len(v)))
    return out


def smoke(ids, views):
    res = {}
    for v in views:
        w, h = VIEWS[v]; tag = 'm' + v[0]; f = f'/tmp/rd/aud/res_{tag}.json'
        if os.path.exists(f): os.remove(f)
        env = dict(os.environ, VW=str(w), VH=str(h), TAG=tag, NW='4')
        subprocess.run([sys.executable, os.path.join(AUD, 'audit4.py'), *ids], env=env,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        res[v] = json.load(open(f)) if os.path.exists(f) else {}
    return res


def summarize(res, ids):
    rows = []
    for v, r in res.items():
        for g in ids:
            x = r.get(g)
            if x is None: rows.append((v, g, ['لم يُنتج الاختبار نتيجة'])); continue
            pr = []
            if not x.get('finished'): pr.append('لم تكتمل المرحلة')
            if x.get('errs'): pr.append(f"أخطاء JS: {x['errs'][:2]}")
            if x.get('404'): pr.append(f"ملفات مفقودة: {x['404'][:3]}")
            if x.get('finished'):
                wb = x.get('wbtn') or ''
                if 'again' not in wb: pr.append('شاشة الفوز بلا زر «العب مرة أخرى»')
                if x.get('again') is False: pr.append('«العب مرة أخرى» لم يعمل')
            if x.get('backok') is False: pr.append('زر الرجوع لم يعمل')
            for ph in ('start', 'first', 'mid', 'win'):
                c = x.get(ph) or {}
                for k, lab in (('broken', 'صورة مكسورة'), ('off', 'عنصر خارج الشاشة'), ('clip', 'نص مقصوص')):
                    if c.get(k): pr.append(f'{lab} ({ph}): {str(c[k])[:80]}')
            if pr: rows.append((v, g, pr))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sample', type=int, default=40); ap.add_argument('--seed', type=int, default=int(time.time()) % 1000)
    ap.add_argument('--views', default='phone'); ap.add_argument('--full', action='store_true')
    ap.add_argument('--ids', default=''); ap.add_argument('--no-smoke', action='store_true')
    ap.add_argument('--out', default='')
    a = ap.parse_args()
    srv = server(); t0 = time.time(); date = datetime.date.today().isoformat()
    try:
        d = asyncio.run(data_checks())
        lg, nshown = asyncio.run(legacy_shown(d['reg_legacy']))
        if lg: d['problems'].append(f'ألعاب قديمة غير مصنفة تظهر للأطفال: {lg}')
        views = [v for v in a.views.split(',') if v in VIEWS]; ids = []; rows = []
        if not a.no_smoke:
            prep()
            ids = a.ids.split(',') if a.ids else pick(10 ** 6 if a.full else a.sample, a.seed)
            rows = summarize(smoke(ids, views), ids)
        probs = [f'- {p}' for p in d['problems']] + [f'- [{v}] {g}: {"؛ ".join(pr)}' for v, g, pr in rows]
        L = [f'# تقرير صيانة الألعاب المجانية – {date}', '', '## الفحص',
             f'- تاريخ الفحص: {date}',
             f'- في السجل: {d["total"]} لعبة؛ معروضة للأطفال: {d["listed"]}؛ قديمة غير مصنفة ومخفية: {len(d["legacy"])}',
             f'- بطاقات ظهرت في صفحات المراحل: {nshown} (لا يوجد بينها قديمة: {"نعم" if not lg else "لا"})',
             f'- ألعاب جُرّبت بالروبوت: {len(ids)} على {", ".join(views) if ids else "—"}']
        if ids: L.append('- رموزها: ' + ', '.join(ids))
        L += ['', '## المشكلات المكتشفة'] + (probs or ['- لا شيء'])
        L += ['', '## الإصلاحات المنفّذة', '- (تُكتب يدويًا: اسم اللعبة ورمزها والتعديل والملفات)',
              '', '## نتائج إعادة الاختبار', '- (تُكتب يدويًا)', '', '## حالة النشر', '- لم يُنشر', '',
              f'<!-- مدة الفحص: {round(time.time() - t0)} ثانية -->']
        os.makedirs(os.path.join(HERE, 'reports'), exist_ok=True)
        fn = a.out or os.path.join(HERE, 'reports', f'maintenance-{date}.md')
        open(fn, 'w').write('\n'.join(L) + '\n'); print('\n'.join(L)); print('\nالتقرير:', os.path.relpath(fn, ROOT))
        sys.exit(1 if probs else 0)
    finally:
        if srv: srv.terminate()


main()
