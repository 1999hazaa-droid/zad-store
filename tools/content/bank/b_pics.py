# -*- coding: utf-8 -*-
"""رسومات التلوين: تُستعمل في bank/pics.js وفي أوراق PDF"""
import math
def P(part, tag, attrs, extra=''): return f'<{tag} class="pt" data-p="{part}" {attrs} {extra}/>'
def petals():
    return ''.join(P('petals', 'circle', f'cx="{100 + 30 * math.cos(math.radians(a)):.1f}" cy="{70 + 30 * math.sin(math.radians(a)):.1f}" r="17"') for a in range(-90, 270, 72))
PICS = {
 'house': [P('sun', 'circle', 'cx="165" cy="35" r="18"'), P('wall', 'rect', 'x="40" y="90" width="120" height="80"'), P('roof', 'polygon', 'points="30,92 100,35 170,92"'), P('door', 'rect', 'x="88" y="124" width="28" height="46"'), P('window', 'rect', 'x="55" y="108" width="24" height="24"')],
 'tree': [P('sky', 'rect', 'x="0" y="0" width="200" height="160"'), P('grass', 'rect', 'x="0" y="160" width="200" height="40"'), P('trunk', 'rect', 'x="88" y="95" width="24" height="75"'), P('leaves', 'ellipse', 'cx="100" cy="70" rx="58" ry="46"'), P('apple', 'circle', 'cx="122" cy="78" r="9"')],
 'fish': [P('water', 'rect', 'x="0" y="0" width="200" height="200"'), P('tail', 'polygon', 'points="140,100 182,70 182,130"'), P('body', 'ellipse', 'cx="95" cy="100" rx="55" ry="34"'), P('fin', 'polygon', 'points="85,70 108,46 122,74"'), '<circle cx="62" cy="92" r="5" fill="#222"/>'],
 'flower': [P('stem', 'rect', 'x="96" y="95" width="8" height="90"'), P('leaf', 'ellipse', 'cx="128" cy="145" rx="26" ry="11" transform="rotate(-25 128 145)"'), petals(), P('center', 'circle', 'cx="100" cy="70" r="17"')],
}
def svg(pic, fills=None, cls=''):
    body = ''.join(PICS[pic])
    if fills:
        for part, col in fills.items(): body = body.replace(f'data-p="{part}" ', f'data-p="{part}" style="fill:{col}" ')
    return f'<svg viewBox="0 0 200 200" class="{cls}" xmlns="http://www.w3.org/2000/svg">{body}</svg>'
if __name__ == '__main__':
    import json, os
    D = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(D + '/../../..')
    open(R + '/bank/pics.js', 'w', encoding='utf-8').write('window.BANK_PICS=' + json.dumps({k: '<svg viewBox="0 0 200 200" role="img" aria-label="رسمة للتلوين">' + ''.join(v) + '</svg>' for k, v in PICS.items()}, ensure_ascii=False) + ';')
    print('pics.js ok')
