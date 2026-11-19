# -*- coding: utf-8 -*-
"""رسوم كرتونية أصلية للأجهزة (SVG) بهوية زاد البنفسجية: python3 dsvg.py"""
import os
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..'); OUT = ROOT + '/images/dig'
O = '#3b1a78'; P1 = '#8b5cf6'; P2 = '#c4b5fd'; P3 = '#ede9fe'; Y = '#fcd34d'; G = '#4ade80'; B = '#60a5fa'; R = '#fb7185'; W = '#ffffff'; GR = '#cbd5e1'
S = f'stroke="{O}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"'
def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">{body}</svg>'
def rr(x, y, w, h, r, f, extra=''): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{f}" {S} {extra}/>'
def face(cx, cy, s=1): return f'<circle cx="{cx-14*s}" cy="{cy}" r="{4*s}" fill="{O}"/><circle cx="{cx+14*s}" cy="{cy}" r="{4*s}" fill="{O}"/><path d="M{cx-9*s} {cy+10*s} Q{cx} {cy+19*s} {cx+9*s} {cy+10*s}" fill="none" {S.replace("6","4")}/>'
def screen(x, y, w, h, c=P3, fc=True): return rr(x, y, w, h, 10, GR) + rr(x + 10, y + 10, w - 20, h - 20, 6, c) + (face(x + w / 2, y + h / 2 - 2) if fc else '')
I = {}
I['dg_desktop'] = svg(screen(30, 28, 140, 102) + rr(88, 130, 24, 22, 3, GR) + rr(60, 152, 80, 16, 8, P2))
I['dg_screen'] = svg(screen(24, 34, 152, 110) + rr(90, 144, 20, 18, 3, GR) + rr(66, 162, 68, 12, 6, P2))
I['dg_laptop'] = svg(rr(46, 36, 108, 78, 8, GR) + rr(56, 46, 88, 58, 5, P3) + face(100, 72, .9) + f'<path d="M26 122 H174 L184 150 Q184 160 172 160 H28 Q16 160 16 150 Z" fill="{P2}" {S}/><rect x="84" y="134" width="32" height="8" rx="4" fill="{O}"/>')
I['dg_tablet'] = svg(rr(46, 22, 108, 156, 16, GR) + rr(58, 38, 84, 118, 6, P3) + face(100, 94, .9) + f'<circle cx="100" cy="167" r="5" fill="{O}"/>')
I['dg_phone'] = svg(rr(62, 16, 76, 168, 16, GR) + rr(72, 36, 56, 118, 5, P3) + face(100, 90, .7) + f'<circle cx="100" cy="168" r="5" fill="{O}"/>')
keys = ''.join(rr(34 + c * 24, 62 + r * 28, 20, 20, 4, W) for r in range(3) for c in range(6))
I['dg_keyboard'] = svg(rr(16, 46, 168, 108, 14, P2) + keys + rr(60, 128, 80, 18, 4, W))
I['dg_mouse'] = svg(f'<path d="M100 18 C145 18 150 60 150 110 C150 158 128 184 100 184 C72 184 50 158 50 110 C50 60 55 18 100 18Z" fill="{P2}" {S}/><path d="M100 18 V96 M50 96 H150" fill="none" {S}/><path d="M100 18 C60 18 52 50 50 96 H100Z" fill="{P1}" {S}/><rect x="92" y="52" width="16" height="30" rx="8" fill="{W}" {S.replace("6","4")}/>')
I['dg_printer'] = svg(rr(52, 20, 96, 56, 6, W) + rr(20, 70, 160, 78, 14, P2) + rr(48, 120, 104, 56, 6, W) + f'<circle cx="152" cy="92" r="6" fill="{G}" stroke="{O}" stroke-width="3"/><path d="M62 140 H138 M62 156 H118" {S.replace("6","4")}/>')
I['dg_headphones'] = svg(f'<path d="M36 120 V100 C36 56 64 32 100 32 C136 32 164 56 164 100 V120" fill="none" {S.replace("6","10")}/>' + rr(22, 104, 36, 62, 14, P1) + rr(142, 104, 36, 62, 14, P1) + f'<path d="M36 128 H46 M154 128 H164" {S.replace("6","4")}/>')
I['dg_speaker'] = svg(rr(48, 20, 104, 160, 18, P2) + f'<circle cx="100" cy="64" r="16" fill="{W}" {S}/><circle cx="100" cy="128" r="30" fill="{P1}" {S}/><circle cx="100" cy="128" r="12" fill="{W}" {S}/>')
I['dg_camera'] = svg(rr(24, 56, 152, 108, 20, P2) + rr(66, 38, 50, 28, 8, P1) + f'<circle cx="100" cy="112" r="34" fill="{W}" {S}/><circle cx="100" cy="112" r="18" fill="{B}" {S}/><circle cx="152" cy="80" r="7" fill="{Y}" stroke="{O}" stroke-width="3"/>')
I['dg_mic'] = svg(rr(74, 16, 52, 90, 26, P2) + f'<path d="M54 90 C54 134 146 134 146 90 M100 130 V166 M70 168 H130" fill="none" {S}/><path d="M80 44 H120 M80 62 H120 M80 80 H120" {S.replace("6","3")}/>')
I['dg_case'] = svg(rr(52, 14, 96, 172, 14, P2) + rr(66, 30, 68, 14, 4, W) + rr(66, 54, 68, 14, 4, W) + f'<circle cx="100" cy="128" r="22" fill="{W}" {S}/><circle cx="100" cy="128" r="6" fill="{O}"/><circle cx="82" cy="170" r="5" fill="{G}" stroke="{O}" stroke-width="3"/>')
I['dg_folder'] = svg(f'<path d="M22 54 Q22 40 36 40 H76 L92 58 H164 Q178 58 178 72 V150 Q178 164 164 164 H36 Q22 164 22 150Z" fill="{Y}" {S}/><path d="M22 84 H178" {S}/>')
I['dg_file'] = svg(f'<path d="M48 18 H116 L154 56 V172 Q154 184 142 184 H58 Q46 184 46 172 V30 Q46 18 58 18Z" fill="{W}" {S}/><path d="M116 18 V56 H154" fill="{P3}" {S}/><path d="M66 94 H134 M66 118 H134 M66 142 H110" {S.replace("6","5")}/>')
I['dg_bot'] = svg(f'<path d="M100 20 V40" {S}/><circle cx="100" cy="16" r="9" fill="{R}" {S}/>' + rr(48, 40, 104, 84, 22, P2) + f'<circle cx="78" cy="78" r="13" fill="{W}" {S}/><circle cx="122" cy="78" r="13" fill="{W}" {S}/><circle cx="80" cy="80" r="5" fill="{O}"/><circle cx="124" cy="80" r="5" fill="{O}"/><path d="M80 106 H120" {S}/>' + rr(60, 130, 80, 50, 14, P1) + rr(30, 134, 24, 14, 7, P2) + rr(146, 134, 24, 14, 7, P2))
I['dg_goal'] = svg(f'<path d="M62 176 V28" {S.replace("6","8")}/><path d="M66 32 H156 L134 66 L156 100 H66Z" fill="{G}" {S}/>')
I['dg_up'] = svg(rr(24, 24, 152, 152, 28, P2) + f'<path d="M100 144 V60 M66 94 L100 58 L134 94" fill="none" {S.replace("6","12")}/>')
I['dg_left'] = svg(rr(24, 24, 152, 152, 28, Y) + f'<path d="M142 140 V96 Q142 62 108 62 H62 M88 36 L62 62 L88 88" fill="none" {S.replace("6","11")}/>')
I['dg_right'] = svg(rr(24, 24, 152, 152, 28, B) + f'<path d="M58 140 V96 Q58 62 92 62 H138 M112 36 L138 62 L112 88" fill="none" {S.replace("6","11")}/>')
I['dg_repeat'] = svg(rr(24, 24, 152, 152, 28, G) + f'<path d="M60 100 V86 Q60 66 80 66 H140 M118 44 L142 66 L118 88 M140 100 V114 Q140 134 120 134 H60 M82 112 L58 134 L82 156" fill="none" {S.replace("6","9")}/>')
I['dg_wifi'] = svg(f'<path d="M26 82 Q100 14 174 82 M52 110 Q100 66 148 110 M78 138 Q100 118 122 138" fill="none" {S.replace("6","11")}/><circle cx="100" cy="164" r="10" fill="{O}"/>')
I['dg_ai'] = svg(rr(40, 40, 120, 110, 26, P3) + f'<circle cx="100" cy="95" r="22" fill="{P1}" {S}/><path d="M100 22 V40 M100 150 V172 M22 95 H40 M160 95 H178 M50 50 L40 40 M150 50 L160 40" {S}/><circle cx="100" cy="95" r="8" fill="{W}"/>')
I['dg_pw'] = svg(rr(24, 70, 152, 60, 16, W) + f'<circle cx="62" cy="100" r="9" fill="{O}"/><circle cx="100" cy="100" r="9" fill="{O}"/><circle cx="138" cy="100" r="9" fill="{O}"/>' + f'<path d="M70 70 V52 Q70 28 100 28 Q130 28 130 52 V70" fill="none" {S}/>')
I['dg_stranger'] = svg(f'<circle cx="100" cy="68" r="34" fill="{GR}" {S}/><path d="M36 176 Q36 120 100 120 Q164 120 164 176Z" fill="{GR}" {S}/><text x="100" y="82" font-size="44" text-anchor="middle" fill="{O}" font-family="Arial" font-weight="700">?</text>')
I['dg_slide'] = svg(rr(22, 38, 156, 108, 12, W) + f'<circle cx="62" cy="84" r="16" fill="{Y}" {S}/><path d="M92 76 H150 M92 98 H140" {S.replace("6","5")}/>' + rr(70, 150, 60, 14, 5, P2))
I['dg_card'] = svg(rr(26, 40, 148, 120, 16, Y) + f'<path d="M100 134 C60 104 70 74 100 92 C130 74 140 104 100 134Z" fill="{R}" {S.replace("6","4")}/>')
I['dg_pencil'] = svg(f'<path d="M40 160 L52 120 L132 40 L160 68 L80 148Z" fill="{Y}" {S}/><path d="M40 160 L52 120 L80 148Z" fill="{W}" {S}/><path d="M118 54 L146 82" {S}/>')
for k, v in I.items(): open(f'{OUT}/{k}.svg', 'w', encoding='utf-8').write(v)
print(len(I), 'svg')
