# -*- coding: utf-8 -*-
"""رسوم أصلية للاستعداد المدرسي: أشكال وألوان وأحجام ومواقع (SVG): python3 rsvg.py"""
import os
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..'); OUT = ROOT + '/images/ready'; os.makedirs(OUT, exist_ok=True)
O = '#3b1a78'; S = f'stroke="{O}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"'
C = {'red': '#f87171', 'blue': '#60a5fa', 'yellow': '#fde047', 'green': '#4ade80'}
def svg(b): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">{b}</svg>'
def shine(cx, cy): return f'<circle cx="{cx}" cy="{cy}" r="7" fill="#fff" opacity=".7"/>'
I = {}
for n, c in C.items():
    I[f'rd_circle_{n}'] = svg(f'<circle cx="100" cy="100" r="74" fill="{c}" {S}/>' + shine(72, 72))
    I[f'rd_square_{n}'] = svg(f'<rect x="30" y="30" width="140" height="140" rx="12" fill="{c}" {S}/>' + shine(58, 58))
    I[f'rd_triangle_{n}'] = svg(f'<path d="M100 26 L176 168 H24Z" fill="{c}" {S}/>' + shine(86, 90))
    I[f'rd_rect_{n}'] = svg(f'<rect x="14" y="56" width="172" height="88" rx="12" fill="{c}" {S}/>' + shine(40, 80))
for n, r in [('big', 84), ('mid', 54), ('small', 28)]:
    I[f'rd_{n}'] = svg(f'<circle cx="100" cy="100" r="{r}" fill="#a78bfa" {S}/>' + shine(100 - r * .4, 100 - r * .4))
ball = lambda x, y, r=22: f'<circle cx="{x}" cy="{y}" r="{r}" fill="#f87171" {S}/>'
box = lambda x, y, w, h: f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#fde047" {S}/>'
I['rd_on'] = svg(box(50, 110, 100, 64) + ball(100, 86))
I['rd_under'] = svg(f'<path d="M30 80 H170" {S}/><path d="M50 80 V60 M150 80 V60" {S}/>' + ball(100, 140))
I['rd_in'] = svg(f'<path d="M50 90 V170 H150 V90" fill="#fde047" {S}/>' + ball(100, 130))
I['rd_beside'] = svg(box(24, 100, 80, 64) + ball(150, 140))
for k, v in I.items(): open(f'{OUT}/{k}.svg', 'w', encoding='utf-8').write(v)
print(len(I), 'svgs')
