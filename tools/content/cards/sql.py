import json, data
q = lambda s: "null" if s is None else "'" + str(s).replace("'", "''") + "'"
skills = sorted({c["skill"] for c in data.cards}); subs = sorted({c["subject"] for c in data.cards})
def short(p, kind):
    if p is None: return "null"
    for pre, code in (("images/zad/","z:"),("images/cards/","c:"),("learn/audio/","a:")):
        if p.startswith(pre): return q(code + p[len(pre):].rsplit(".",1)[0])
    return q(p)
rows = []
for c in data.cards:
    ok = c["img"] and c["ex"] and c["ar"]
    ex = {k:v for k,v in c["extra"].items() if v is not None}
    ex.pop("name_audio",None)
    if "obj" in ex: ex["obj"] = "z:" + ex["obj"][len("images/zad/"):].rsplit(".",1)[0]
    rows.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%d,%d,%s,%d)" % (q(c["key"]),q(c["cat"]),q(c["sub"]),q(c["ar"]),q(c["en"]),
      short(c["img"],0),short(c["audio"],1),q(c["ex"]),q(json.dumps(ex,ensure_ascii=False,separators=(",",":"))) if ex else "null",
      q("".join(map(str,c["ages"]))),q("".join(map(str,c["grades"]))),skills.index(c["skill"]),subs.index(c["subject"]),
      "1" if ok else "0",c["sort"]))
sk = ",".join("(%d,%s)"%(i,q(s)) for i,s in enumerate(skills)); sb = ",".join("(%d,%s)"%(i,q(s)) for i,s in enumerate(subs))
print("""with sk(i,n) as (values %s), sb(i,n) as (values %s),
r(slug,cat,sub,ar,en,img,au,ex,extra,ag,gr,si,bi,pub,so) as (values
%s)
insert into public.cards(slug,cat,sub,word_ar,word_en,image_url,audio_url,example,extra,ages,grades,skill,subject,status,sort_order)
select slug,cat,sub,ar,en,
 case when img like 'z:%%' then 'images/zad/'||substr(img,3)||'.webp' when img like 'c:%%' then 'images/cards/'||substr(img,3)||'.webp' end,
 case when au like 'a:%%' then 'learn/audio/'||substr(au,3)||'.mp3' end,
 ex, coalesce(regexp_replace(extra,'"obj":"z:([^"]+)"','"obj":"images/zad/\\1.webp"')::jsonb,'{}'::jsonb),
 regexp_split_to_array(ag,'')::int[], regexp_split_to_array(gr,'')::int[], (select n from sk where i=si),(select n from sb where i=bi),
 case when pub=1 then 'published' else 'draft' end, so from r on conflict (slug) do nothing;""" % (sk, sb, ",\n".join(rows)))
