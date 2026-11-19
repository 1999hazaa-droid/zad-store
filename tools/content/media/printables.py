# -*- coding: utf-8 -*-
import math
from common import *
NOTE = 'وسيلة قابلة للطباعة أصلية من إعداد زاد. اطبع بحجم ١٠٠٪ على ورق A4 دون تصغير. لم تُراجَع من جهة تعليمية رسمية.'
def SP(**k): k.setdefault('kind', 'printable'); k.setdefault('orient', 'portrait'); k.setdefault('note', NOTE); return k

@spec('pr-ruler')
def _():
    sp = SP(title='مسطرة ورقية للقص (١٥ سم)', desc='مسطرتان بطول ١٥ سنتيمترًا بتدريج دقيق (مليمتر وسنتيمتر) للقص والتلوين، مع خط اختبار طوله ١٠ سم للتأكد من الطباعة بالحجم الحقيقي.', levels=['g1', 'g2', 'g3'], subject='الرياضيات', topic='القياس', sort=1)
    def ruler(col):
        o = f'<rect x="1" y="1" width="168" height="30" rx="3" fill="{col}22" stroke="{col}" stroke-width=".6"/>'
        for mm in range(0, 151):
            x = 10 + mm; h = 8 if mm % 10 == 0 else 5 if mm % 5 == 0 else 3
            o += f'<line x1="{x}" y1="1" x2="{x}" y2="{1 + h}" stroke="#1b1430" stroke-width="{.35 if mm % 5 else .5}"/>'
        for cm in range(0, 16): o += f'<text x="{10 + cm * 10}" y="17" font-size="6" font-weight="700" text-anchor="middle" font-family="C,sans-serif" fill="#1b1430">{cm}</text>'
        o += f'<text x="160" y="27" font-size="4.5" font-weight="700" text-anchor="middle" font-family="C,sans-serif" fill="{col}">سم</text>'
        return f'<svg width="170mm" height="32mm" viewBox="0 0 170 32" style="margin:0 auto">{o}</svg>'
    test = '<svg width="170mm" height="14mm" viewBox="0 0 170 14" style="margin:0 auto"><line x1="10" y1="4" x2="110" y2="4" stroke="#e53935" stroke-width="1"/><line x1="10" y1="1" x2="10" y2="7" stroke="#e53935" stroke-width="1"/><line x1="110" y1="1" x2="110" y2="7" stroke="#e53935" stroke-width="1"/><text x="60" y="12" font-size="4.5" font-weight="700" text-anchor="middle" font-family="C,sans-serif" fill="#e53935">يجب أن يساوي هذا الخط ١٠ سم بالضبط عند القياس بمسطرة حقيقية</text></svg>'
    body = f'<div style="display:flex;flex-direction:column;gap:10mm;align-items:center;justify-content:center;flex:1">{ruler("#6a2bd9")}<div style="font-size:11pt;color:#4b4666">✂ قصّ على الحواف</div>{ruler("#e53935")}<div style="font-size:11pt;color:#4b4666">✂ قصّ على الحواف</div>{test}<div style="font-size:12.5pt;text-align:center;line-height:1.8;background:var(--t);border-radius:4mm;padding:3mm 6mm">تدرّب: قِس طول قلمك ودفترك ومحايتك، وسجّل الطول بالسنتيمتر</div></div>'
    return sp, [page(sp, 'مسطرة ورقية للقص', 'قصّ المسطرة واستخدمها في القياس', body)]

@spec('pr-paper-clock')
def _():
    sp = SP(title='ساعة ورقية للقص والتركيب', desc='وجه ساعة كبير بالأرقام والدقائق مع عقربين للقص والتثبيت بدبوس، لتدريب الطفل على قراءة الوقت.', levels=['a6', 'g1', 'g2'], subject='الرياضيات', topic='الزمن', sort=2)
    o = '<circle cx="100" cy="100" r="96" fill="#fff" stroke="#6a2bd9" stroke-width="5"/>'
    for i in range(60):
        a = math.radians(i * 6); r1 = 87 if i % 5 else 80
        o += f'<line x1="{100 + 92 * math.sin(a):.1f}" y1="{100 - 92 * math.cos(a):.1f}" x2="{100 + r1 * math.sin(a):.1f}" y2="{100 - r1 * math.cos(a):.1f}" stroke="#1b1430" stroke-width="{2.2 if i % 5 == 0 else .9}"/>'
    for n in range(1, 13):
        a = math.radians(n * 30); o += f'<text x="{100 + 66 * math.sin(a):.1f}" y="{100 - 66 * math.cos(a):.1f}" font-size="21" font-weight="700" text-anchor="middle" dominant-baseline="central" font-family="C,sans-serif">{n}</text>'
    o += '<circle cx="100" cy="100" r="3" fill="#1b1430"/>'
    face = f'<svg viewBox="0 0 200 200" style="width:128mm;height:128mm">{o}</svg>'
    hands = '<svg viewBox="0 0 200 70" style="width:190mm;height:66mm"><g stroke="#1b1430" stroke-width=".8" stroke-dasharray="3 2"><path d="M15,35 L40,24 L72,28 L72,42 L40,46 Z" fill="#ffcdd2"/><path d="M95,35 L125,22 L190,29 L190,41 L125,48 Z" fill="#bbdefb"/></g><circle cx="26" cy="35" r="2.2" fill="#fff" stroke="#1b1430"/><circle cx="106" cy="35" r="2.2" fill="#fff" stroke="#1b1430"/><text x="48" y="62" font-size="8" font-weight="700" text-anchor="middle" font-family="C,sans-serif" fill="#e53935">العقرب القصير (الساعات)</text><text x="142" y="62" font-size="8" font-weight="700" text-anchor="middle" font-family="C,sans-serif" fill="#1e88e5">العقرب الطويل (الدقائق)</text></svg>'
    body = f'<div style="display:flex;flex-direction:column;align-items:center;gap:2mm;flex:1;justify-content:center">{face}{hands}<div style="font-size:11.5pt;text-align:center;line-height:1.7;background:var(--t);border-radius:4mm;padding:2mm 6mm">قصّ الوجه والعقربين · اثقب الدائرة الصغيرة · ثبّت العقربين في مركز الوجه بدبوس تثبيت · حرّك العقربين واقرأ الوقت</div></div>'
    return sp, [page(sp, 'ساعة ورقية للقص والتركيب', 'نصنع ساعتنا ونقرأ الوقت', body)]

@spec('pr-routine-chart')
def _():
    sp = SP(title='جدول روتيني اليومي', desc='جدول أسبوعي لمتابعة ست عادات يومية للطفل: الاستيقاظ المبكر والفطور ونظافة الأسنان وترتيب الحقيبة والقراءة والنوم المبكر، مع خانات للتلوين أو وضع علامة.', levels=['a4', 'a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='الروتين اليومي', sort=3)
    T = [('x_sunrise', 'أستيقظ مبكرًا'), ('1f35e', 'أتناول فطوري'), ('1faa5', 'أنظّف أسناني'), ('1f392', 'أرتّب حقيبتي'), ('1f4d6', 'أقرأ قليلًا'), ('1f634', 'أنام مبكرًا')]
    D = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    h = '<div class="rg" style="background:var(--c);color:#fff">العادة</div>' + ''.join(f'<div class="rg" style="background:{PAL[i]};color:#fff;font-size:10.5pt">{d}</div>' for i, d in enumerate(D))
    r = ''
    for k, (ic, t) in enumerate(T):
        r += f'<div class="rg" style="justify-content:flex-start;gap:2mm;padding:0 3mm;background:{PAL[k % 8]}12;border:.4mm solid {PAL[k % 8]};text-align:start;font-size:12pt">{I(ic, 11)}<span>{t}</span></div>' + ''.join(f'<div class="rg" style="border:.5mm solid #cfc8ea;border-radius:3mm"><div style="width:11mm;height:11mm;border:.5mm dashed #b8b0d6;border-radius:50%"></div></div>' for _ in D)
    css = '<style>.rg{display:flex;align-items:center;justify-content:center;font-weight:700;border-radius:3mm;text-align:center}.rgg{display:grid;grid-template-columns:44mm repeat(7,1fr);grid-template-rows:10mm repeat(6,1fr);gap:1.5mm;flex:1;min-height:0}</style>'
    body = f'{css}<div class="rgg">{h}{r}</div><div style="text-align:center;font-size:12.5pt;margin-top:3mm;color:#4b4666">نلوّن الدائرة أو نضع نجمة كلما أنجزنا العادة</div>'
    return sp, [page(sp, 'جدول روتيني اليومي', 'أنجز عاداتي كل يوم', body)]
