import json,re,time,urllib.parse,uuid,base64
def mkrows():
    R=[]
    secs=['ws','math','letters','cards','stories','color','home','review']
    for i in range(12):
        R.append(dict(id=f"00000000-0000-0000-0000-{i:012d}",name=f"ملف رقم {i}",price=0,old_price=None,image_url="images/zad/i_books.webp",thumb_url=None,description="وصف كافٍ للملف التعليمي رقم %d"%i,file_url=f"files/lib/a2-big-shapes.pdf",bw_url=None,pages=5,lib_section=secs[i%8],lib_levels=['g1'] if i%2 else ['a3','a4'],lib_subject="الرياضيات" if i%3 else "اللغة العربية",lib_skill="مهارة",lib_type=None,lib_unit=None,lib_keywords=None,lib_status='published',lib_order=None,is_visible=True,is_available=True,created_at=f"2026-11-{i+1:02d}T10:00:00Z",slug=f"s{i}",category_id=None,sort_order=i,stock=None,is_best_seller=False,is_new_arrival=False,file_type="PDF"))
    R[3].update(lib_status='draft',is_visible=False,name="مسودة تجريبية",description="قصير")
    return R
TAX=[dict(kind='subject',key=k,label=k,sort=i,active=True) for i,k in enumerate(["الرياضيات","اللغة العربية"])]+[dict(kind='section',key=k,label=v,sort=i,active=True) for i,(k,v) in enumerate([('ws','أوراق العمل'),('math','الرياضيات'),('letters','الحروف'),('cards','بطاقات'),('stories','قصص'),('color','تلوين'),('home','منزلية'),('review','مراجعات')])]+[dict(kind='type',key='worksheet',label='ورقة عمل',sort=1,active=True),dict(kind='age',key='a3',label='3 سنوات',sort=1,active=True),dict(kind='age',key='a4',label='4 سنوات',sort=2,active=True),dict(kind='grade',key='g1',label='الصف الأول',sort=1,active=True)]
class DB:
    def __init__(s): s.p=mkrows(); s.tax=[dict(t) for t in TAX]; s.audit=[]; s.log=[]
    def sync(s,old,new):
        if not new.get('lib_section'): return
        if old is None:
            if new.get('lib_status') is None: new['lib_status']='published' if new.get('is_visible') else 'unpublished'
            else: new['is_visible']=new['lib_status']=='published'
        else:
            if new.get('lib_status')!=old.get('lib_status') and new.get('lib_status'): new['is_visible']=new['lib_status']=='published'
            elif new.get('is_visible')!=old.get('is_visible'): new['lib_status']='published' if new['is_visible'] else 'unpublished'
    def filt(s,rows,q):
        for k,v in q.items():
            if k in('select','order','limit','offset','on_conflict','columns'): continue
            v=v[0]
            if v.startswith('eq.'): rows=[r for r in rows if str(r.get(k))==v[3:] or (v[3:]=='true' and r.get(k) is True) or (v[3:]=='false' and r.get(k) is False)]
            elif v.startswith('neq.'): rows=[r for r in rows if str(r.get(k))!=v[4:]]
            elif v=='not.is.null': rows=[r for r in rows if r.get(k) is not None]
            elif v.startswith('in.('): vals=v[4:-1].split(','); rows=[r for r in rows if str(r.get(k)) in vals]
        return rows
def install(page,db,fails=None):
    async def h(route):
        req=route.request;u=urllib.parse.urlparse(req.url);q=urllib.parse.parse_qs(u.query);path=u.path;m=req.method;acc=req.headers.get('accept','')
        H={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*','access-control-expose-headers':'content-range'}
        if m=='OPTIONS': return await route.fulfill(status=204,headers=H)
        body=None
        try: body=json.loads(req.post_data) if req.post_data else None
        except: pass
        def J(data,status=200,extra=None):
            hh=dict(H);hh['content-type']='application/json'
            if extra: hh.update(extra)
            return route.fulfill(status=status,headers=hh,body=json.dumps(data,ensure_ascii=False))
        if '/auth/v1/' in path:
            return await J(dict(id='adm1',aud='authenticated',email='a@b.c'))
        if '/storage/v1/object' in path:
            if fails and fails.get('upload'): return await J(dict(message='boom'),400)
            db.log.append(('upload',path)); return await J(dict(Key=path))
        if path.endswith('/rpc/lib_set_order'):
            ids=body['ids']; 
            for i,x in enumerate(ids):
                for r in db.p:
                    if r['id']==x: r['lib_order']=i+1
            db.log.append(('rpc','set_order')); return await J(len(ids))
        if path.endswith('/rpc/lib_restore'):
            a=[x for x in db.audit if x['id']==body['aid']][0]; db.p=[r for r in db.p if r['id']!=a['product_id']]; db.p.append(a['before']); db.log.append(('rpc','restore')); return await J(a['product_id'])
        if path.endswith('/rpc/lib_rename_subject'):
            for r in db.p:
                if r['lib_subject']==body['old_label']: r['lib_subject']=body['new_label']
            for t in db.tax:
                if t['kind']=='subject' and t['key']==body['old_label']: t['key']=t['label']=body['new_label']
            return await J(None,204)
        t=path.split('/rest/v1/')[-1]
        if t=='admin_users': return await J([dict(id='adm1')])
        if t=='lib_taxonomy':
            if m=='GET': return await J(sorted(db.tax,key=lambda r:r['sort']))
            if m=='POST': db.tax.append(dict(body,active=True)); return await J([],201)
            rows=db.filt(db.tax,q)
            if m=='PATCH':
                for r in rows: r.update(body)
            if m=='DELETE': db.tax=[r for r in db.tax if r not in rows]
            return await J(None,204)
        if t=='lib_audit': return await J(list(reversed(db.audit))[:60])
        if t=='product_media': return await J([])
        if t!='products': return await J([])
        if m in('GET','HEAD'):
            rows=db.filt(db.p,q)
            if 'limit' in q: rows=rows[:int(q['limit'][0])]
            if 'pgrst.object' in acc: return await J(rows[0] if rows else None,200 if rows else 406)
            return await J(rows if m=='GET' else [],200,{'content-range':f'0-{max(0,len(rows)-1)}/{len(rows)}'})
        if m=='POST':
            for r in (body if isinstance(body,list) else [body]):
                row=dict(mkrows()[0],**r); row.setdefault('created_at','2026-11-18T10:00:00Z'); row['created_at']=r.get('created_at','2026-11-18T10:00:00Z'); db.sync(None,row); db.p.append(row); db.audit.append(dict(id=len(db.audit)+1,at='2026-11-18T10:00:00Z',action='create',product_id=row['id'],product_name=row['name'],changed=None,before=None))
            return await J([],201)
        if m=='PATCH':
            rows=db.filt(db.p,q)
            for r in rows:
                old=dict(r); r.update(body); db.sync(old,r)
                ch=[k for k in body if old.get(k)!=r.get(k) and k!='lib_order']
                if ch: db.audit.append(dict(id=len(db.audit)+1,at='2026-11-18T10:00:00Z',action='status' if 'lib_status' in ch else 'update',product_id=r['id'],product_name=r['name'],changed=ch,before=old))
            return await J(None,204)
        if m=='DELETE':
            rows=db.filt(db.p,q)
            for r in rows: db.audit.append(dict(id=len(db.audit)+1,at='2026-11-18T10:00:00Z',action='delete',product_id=r['id'],product_name=r['name'],changed=None,before=dict(r)))
            db.p=[r for r in db.p if r not in rows]; return await J(None,204)
        return await J([])
    return h
SESSION=json.dumps(dict(access_token='x.y.z',refresh_token='r',expires_at=int(time.time())+99999,expires_in=99999,token_type='bearer',user=dict(id='adm1',aud='authenticated',email='a@b.c')))
