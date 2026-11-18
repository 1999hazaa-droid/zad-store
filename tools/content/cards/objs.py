# -*- coding: utf-8 -*-
"""رسومات أصلية للبطاقات الخمس الناقصة: ذرة، ملكة، شاحنة صغيرة، إكسيلوفون، يويو (نفس أسلوب images.py)."""
import math
from PIL import ImageDraw
from images import canvas, save, shade, S, W, PUR

def sh(d, box):  # ظل أرضي
    d.ellipse(box, fill=(0,0,0,40))
def E(d, b, c, o=None, w=0): d.ellipse([v*S for v in b], fill=c, outline=o, width=w*S)
def R(d, b, c, r=0, o=None, w=0): d.rounded_rectangle([v*S for v in b], radius=r*S, fill=c, outline=o, width=w*S)
def P(d, pts, c, o=None): d.polygon([(x*S,y*S) for x,y in pts], fill=c, outline=o)
def L(d, pts, c, w): d.line([(x*S,y*S) for x,y in pts], fill=c, width=w*S, joint="curve")
def eyes(d, x, y, gap, r=9):
    for dx in (-gap, gap):
        E(d,(x+dx-r,y-r,x+dx+r,y+r),"#3b2a50"); E(d,(x+dx-r*0.4,y-r*0.7,x+dx+r*0.2,y-r*0.1),"white")

def corn():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(120*S,440*S,400*S,490*S))
    # أوراق خلفية
    P(d,[(256,470),(110,250),(150,120),(256,330)],"#3d9a45"); P(d,[(256,470),(402,250),(362,120),(256,330)],"#3d9a45")
    # كوز الذرة
    E(d,(170,40,342,470),"#f9c522","#d99a0b",6)
    for r in range(8):
        for c in range(4):
            x=198+c*38+(r%2)*0; y=80+r*45
            E(d,(x-14,y-17,x+14,y+17),"#ffe066","#e0a410",3)
    # أوراق أمامية
    P(d,[(256,480),(150,300),(190,200),(256,380)],"#56b85c","#2d7a35"); P(d,[(256,480),(362,300),(322,200),(256,380)],"#56b85c","#2d7a35")
    eyes(d,256,200,30,10); L(d,[(238,232),(256,246),(274,232)],"#3b2a50",5)
    save(im,"obj/corn.webp")

def queen():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(110*S,470*S,402*S,505*S))
    # شعر خلف
    R(d,(120,170,392,470),"#7a4a2a",60)
    # فستان
    P(d,[(256,330),(120,500),(392,500)],"#9b59ff","#6a2fd0")
    E(d,(176,420,336,500),"#b685ff")
    # الرأس
    E(d,(150,130,362,370),"#ffd9b8","#e0aa80",5)
    # التاج
    P(d,[(170,170),(180,70),(220,120),(256,50),(292,120),(332,70),(342,170)],"#ffc928","#d99a0b")
    R(d,(168,160,344,190),"#ffb300",8,"#d99a0b",4)
    for x,c in ((220,"#e53935"),(256,"#29b6f6"),(292,"#e53935")): E(d,(x-9,168,x+9,186),c)
    # وجه
    eyes(d,256,255,48,13)
    E(d,(168,280,208,312),"#ff9db0"); E(d,(304,280,344,312),"#ff9db0")
    L(d,[(226,308),(256,334),(286,308)],"#c2410c",6)
    save(im,"obj/queen.webp")

def van():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(50*S,420*S,470*S,470*S))
    R(d,(40,170,470,400),"#29b6f6",50,"#0d7fb5",6)
    R(d,(60,120,330,250),"#29b6f6",40,"#0d7fb5",6)
    P(d,[(330,170),(330,250),(450,250),(400,170)],"#e1f5fe","#0d7fb5")
    R(d,(85,145,170,225),"#e1f5fe",14,"#0d7fb5",4); R(d,(185,145,310,225),"#e1f5fe",14,"#0d7fb5",4)
    R(d,(40,300,470,330),"#7c4dff"); R(d,(440,260,470,290),"#ffe066",8)
    for cx in (140,370):
        E(d,(cx-58,342,cx+58,458),"#37474f"); E(d,(cx-30,370,cx+30,430),"#cfd8dc"); E(d,(cx-10,390,cx+10,410),"#78909c")
    save(im,"obj/van.webp")

def xylo():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(60*S,450*S,460*S,495*S))
    L(d,[(110,150),(60,440)],"#8d5a2b",16); L(d,[(402,150),(452,440)],"#8d5a2b",16)
    L(d,[(120,380),(392,380)],"#8d5a2b",14)
    cols=["#e53935","#fb8c00","#fdd835","#43a047","#29b6f6","#5c6bc0","#8e24aa"]
    for i,c in enumerate(cols):
        w=52; x=70+i*52; top=130+i*14; bot=370-i*14
        R(d,(x,top,x+w-6,bot),c,14,shade(c,0.7),4)
        E(d,(x+w/2-3-7,top+22,x+w/2-3+7,top+36),shade(c,0.6))
        E(d,(x+w/2-3-7,bot-36,x+w/2-3+7,bot-22),shade(c,0.6))
    for sx,sy,ex,ey in ((380,60,300,140),(140,30,220,120)):
        L(d,[(sx,sy),(ex,ey)],"#c9a06b",10); E(d,(sx-22,sy-22,sx+22,sy+22),"#ff7043","#c2410c",4)
    save(im,"obj/xylophone.webp")

def yoyo():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(120*S,462*S,392*S,500*S))
    L(d,[(256,24),(256,170)],"#8d6e63",8)
    E(d,(226,4,286,44),None,"#8d6e63",8)
    E(d,(78,170,434,490),"#ff7043","#c2410c",6)
    E(d,(120,212,392,448),"#ff8a65")
    E(d,(150,240,362,420),"#ff7043","#c2410c",5)
    E(d,(196,282,316,382),"#7c4dff","#5326b5",5)
    E(d,(232,314,280,350),"#ffe066")
    E(d,(110,200,200,260),(255,255,255,120))
    save(im,"obj/yoyo.webp")

if __name__=="__main__":
    corn(); queen(); van(); xylo(); yoyo(); print("ok")
