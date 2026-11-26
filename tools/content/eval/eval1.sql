-- مركز معايير تقييم المشاريع التعليمية المبسطة
create table if not exists public.eval_criteria (
  id uuid primary key default gen_random_uuid(),
  std text check (std in ('understand','steps','tools','skill','complete','express','reflect','care')),
  txt_young text not null, txt_pre text not null, txt_kid text not null,
  skill_id uuid references public.skills(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','active','hidden')),
  updated_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.proj_evals (
  id uuid primary key default gen_random_uuid(),
  project text not null unique,
  name text not null,
  levels text[] not null,
  criteria jsonb not null default '[]'::jsonb,
  closing jsonb not null default '{}'::jsonb,
  msgs jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','hidden')),
  updated_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.eval_criteria enable row level security;
alter table public.proj_evals enable row level security;

create or replace function public.eval_bad(t text) returns boolean language sql immutable set search_path to 'public' as $$
 select coalesce(t,'') ~ '(درجة|درجات|رسوب|عقوبة|عقاب|أفضل من|أسوأ|الأول على|ترتيب الأطفال|ترتيبك بين|منافسة|ممتاز جدا|ناجح|راسب)' $$;

create or replace function public.eval_public() returns jsonb language sql stable security definer set search_path to 'public' as $$
 select jsonb_build_object('items', coalesce((select jsonb_agg(jsonb_build_object(
   'slug', e.project, 'name', e.name, 'levels', e.levels, 'closing', e.closing, 'msgs', e.msgs,
   'project', jsonb_build_object('title', p.title, 'icon', p.icon, 'goal', coalesce(p.data->>'goal', p.instr), 'cat', p.cat, 'span', p.span, 'levels', p.levels),
   'criteria', (select jsonb_agg(jsonb_build_object('id', c.id, 'young', c.txt_young, 'pre', c.txt_pre, 'kid', c.txt_kid, 'stage', ce.v->>'stage',
        'skill', case when k.id is null then null else jsonb_build_object('slug', k.slug, 'name', k.name) end,
        'res', coalesce((select jsonb_agg(x.item_key) from (select l.item_key from skill_links l join quality_items q on q.key = l.item_key and q.status = 'published' and not q.gone and q.levels && e.levels where l.skill_id = c.skill_id order by l.item_key limit 4) x), '[]'::jsonb)) order by ce.o)
     from jsonb_array_elements(e.criteria) with ordinality as ce(v, o)
     join eval_criteria c on c.id = (ce.v->>'id')::uuid and c.status = 'active'
     left join skills k on k.id = c.skill_id and k.status = 'active')) order by e.created_at)
   from proj_evals e join proj_items p on p.slug = e.project and p.status = 'published' and p.kind = 'project'
   where e.status = 'active' and exists (select 1 from jsonb_array_elements(e.criteria) ce(v) join eval_criteria c on c.id = (ce.v->>'id')::uuid and c.status = 'active')), '[]'::jsonb)) $$;

create or replace function public.eval_admin() returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin perform q_need(array['content_editor','edu_reviewer']);
 return jsonb_build_object(
  'criteria', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'std', c.std, 'young', c.txt_young, 'pre', c.txt_pre, 'kid', c.txt_kid, 'skill', c.skill_id, 'status', c.status, 'used', (select count(*) from proj_evals e where e.criteria @> jsonb_build_array(jsonb_build_object('id', c.id::text)))) order by c.created_at) from eval_criteria c), '[]'::jsonb),
  'evals', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'project', e.project, 'name', e.name, 'levels', e.levels, 'criteria', e.criteria, 'closing', e.closing, 'msgs', e.msgs, 'status', e.status) order by e.created_at) from proj_evals e), '[]'::jsonb),
  'projects', coalesce((select jsonb_agg(jsonb_build_object('slug', p.slug, 'title', p.title, 'levels', p.levels, 'status', p.status,
      'stages', case when jsonb_typeof(p.data->'steps') = 'array' then coalesce((select jsonb_agg(g) from (select distinct s->>'g' as g from jsonb_array_elements(p.data->'steps') s where coalesce(s->>'g','') <> '') z), '[]'::jsonb) else '[]'::jsonb end) order by p.sort_order, p.title) from proj_items p where p.kind = 'project'), '[]'::jsonb)); end $$;

create or replace function public.evalc_save(p jsonb) returns uuid language plpgsql security definer set search_path to 'public' as $$
declare r text[]; nid uuid; pid uuid := nullif(p->>'id','')::uuid; y text; pr text; k text; sk uuid := nullif(p->>'skill','')::uuid; sd text := nullif(p->>'std',''); old record;
begin perform q_need(array['content_editor','edu_reviewer']); r := q_roles(auth.uid());
 y := btrim(coalesce(p->>'young','')); pr := btrim(coalesce(p->>'pre','')); k := btrim(coalesce(p->>'kid',''));
 if series_bad_words(y||' '||pr||' '||k) or eval_bad(y||' '||pr||' '||k) then raise exception 'تجنّب الدرجات والمنافسة والعبارات التي تصف الطفل بالضعف؛ استخدم صياغة داعمة.'; end if;
 if length(y) < 3 or length(y) > 60 then raise exception 'صياغة الأعمار الصغيرة (ملاحظة ولي الأمر) من 3 إلى 60 حرفًا.'; end if;
 if length(pr) < 3 or length(pr) > 80 then raise exception 'صياغة من 4 إلى 6 سنوات من 3 إلى 80 حرفًا.'; end if;
 if length(k) < 3 or length(k) > 140 then raise exception 'صياغة الصفوف من 3 إلى 140 حرفًا.'; end if;
 if sd is not null and sd not in ('understand','steps','tools','skill','complete','express','reflect','care') then raise exception 'نوع المعيار القياسي غير صالح.'; end if;
 if sk is not null and not exists (select 1 from skills where id = sk and status = 'active') then raise exception 'المهارة المرتبطة غير منشورة.'; end if;
 if pid is null then
  insert into eval_criteria(std, txt_young, txt_pre, txt_kid, skill_id, status, updated_by) values (sd, y, pr, k, sk, 'draft', auth.uid()) returning eval_criteria.id into nid;
 else
  select * into old from eval_criteria where eval_criteria.id = pid for update; if not found then raise exception 'المعيار غير موجود.'; end if;
  update eval_criteria set std = sd, txt_young = y, txt_pre = pr, txt_kid = k, skill_id = sk, updated_by = auth.uid(), updated_at = now(),
   status = case when old.status = 'active' and not ('edu_reviewer' = any(r) or 'library_manager' = any(r)) then 'draft' else old.status end where eval_criteria.id = pid; nid := pid;
 end if; return nid; end $$;

create or replace function public.evalc_status(p_id uuid, p_status text) returns void language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['edu_reviewer']);
 if p_status not in ('draft','active','hidden') then raise exception 'حالة غير صالحة.'; end if;
 update eval_criteria set status = p_status, updated_by = auth.uid(), updated_at = now() where id = p_id; if not found then raise exception 'المعيار غير موجود.'; end if; end $$;

create or replace function public.evalc_delete(p_id uuid) returns void language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['edu_reviewer']);
 if exists (select 1 from proj_evals e where e.criteria @> jsonb_build_array(jsonb_build_object('id', p_id::text))) then raise exception 'المعيار مستخدم في تقييم؛ أزله منه أولًا.'; end if;
 delete from eval_criteria where id = p_id; end $$;

create or replace function public.eval_save(p jsonb) returns uuid language plpgsql security definer set search_path to 'public' as $$
declare r text[]; nid uuid; pid uuid := nullif(p->>'id','')::uuid; pj record; nm text; lv text[]; cr jsonb := coalesce(p->'criteria','[]'::jsonb); c jsonb; cl jsonb := coalesce(p->'closing','{}'::jsonb); ms jsonb := coalesce(p->'msgs','{}'::jsonb); seen text[] := '{}'; kk text; mx int; old record; arr jsonb; t jsonb;
begin perform q_need(array['content_editor','edu_reviewer']); r := q_roles(auth.uid());
 select * into pj from proj_items where slug = p->>'project' and kind = 'project'; if pj.slug is null then raise exception 'اختر مشروعًا موجودًا.'; end if;
 nm := btrim(coalesce(p->>'name','')); if length(nm) < 3 or length(nm) > 80 then raise exception 'اسم التقييم من 3 إلى 80 حرفًا.'; end if;
 select coalesce(array_agg(value),'{}') into lv from jsonb_array_elements_text(coalesce(p->'levels','[]'::jsonb));
 if cardinality(lv) = 0 or not (lv <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']) then raise exception 'حدّد أعمارًا أو صفوفًا ضمن النطاق من سنتين إلى الصف الرابع.'; end if;
 if not (lv <@ pj.levels) then raise exception 'الأعمار المحددة يجب أن تقع ضمن أعمار المشروع.'; end if;
 mx := case when lv && array['a2','a3'] then 4 when lv && array['a4','a5','a6'] then 6 else 8 end;
 if jsonb_typeof(cr) <> 'array' or jsonb_array_length(cr) < 1 or jsonb_array_length(cr) > mx then raise exception using message = 'عدد المعايير من 1 إلى ' || mx || ' لهذه الفئة؛ القوائم الطويلة مرهقة.'; end if;
 for c in select * from jsonb_array_elements(cr) loop
  kk := c->>'id'; if kk is null or kk = any(seen) then raise exception 'معيار مكرر أو غير صالح.'; end if; seen := seen || kk;
  if not exists (select 1 from eval_criteria where id = kk::uuid) then raise exception 'معيار غير موجود.'; end if;
  if length(coalesce(c->>'stage','')) > 40 then raise exception 'اسم المرحلة حتى 40 حرفًا.'; end if;
 end loop;
 foreach kk in array array['young','pre','early','late'] loop
  if length(coalesce(cl->>kk,'')) > 120 then raise exception 'السؤال الختامي حتى 120 حرفًا.'; end if;
  if series_bad_words(cl->>kk) or eval_bad(cl->>kk) then raise exception 'تجنّب الدرجات والمنافسة وعبارات الضعف في السؤال الختامي.'; end if;
 end loop;
 foreach kk in array array['done','help','retry'] loop
  arr := coalesce(ms->kk,'[]'::jsonb); if jsonb_typeof(arr) <> 'array' or jsonb_array_length(arr) > 5 then raise exception 'حتى 5 رسائل لكل حالة.'; end if;
  for t in select * from jsonb_array_elements(arr) loop
   if jsonb_typeof(t) <> 'string' or length(btrim(t #>> '{}')) < 3 or length(t #>> '{}') > 100 then raise exception 'الرسالة التشجيعية من 3 إلى 100 حرف.'; end if;
   if series_bad_words(t #>> '{}') or eval_bad(t #>> '{}') or (t #>> '{}') ~ '(فشل|ضعيف|سيئ|خطأ كبير)' then raise exception 'الرسائل يجب أن تكون مشجعة بلا عبارات سلبية.'; end if;
  end loop;
 end loop;
 if series_bad_words(nm) or eval_bad(nm) then raise exception 'تجنّب الدرجات والمنافسة والعبارات السلبية في الاسم.'; end if;
 if pid is null then
  if exists (select 1 from proj_evals where project = pj.slug) then raise exception 'لهذا المشروع تقييم موجود؛ عدّله بدل إنشاء آخر.'; end if;
  insert into proj_evals(project, name, levels, criteria, closing, msgs, status, updated_by) values (pj.slug, nm, lv, cr, cl, ms, 'draft', auth.uid()) returning proj_evals.id into nid;
 else
  select * into old from proj_evals where proj_evals.id = pid for update; if not found then raise exception 'التقييم غير موجود.'; end if;
  if old.project <> pj.slug and exists (select 1 from proj_evals where project = pj.slug) then raise exception 'لهذا المشروع تقييم موجود.'; end if;
  update proj_evals set project = pj.slug, name = nm, levels = lv, criteria = cr, closing = cl, msgs = ms, updated_by = auth.uid(), updated_at = now(),
   status = case when old.status = 'active' and not ('edu_reviewer' = any(r) or 'library_manager' = any(r)) then 'draft' else old.status end where proj_evals.id = pid; nid := pid;
 end if; return nid; end $$;

create or replace function public.eval_status(p_id uuid, p_status text) returns void language plpgsql security definer set search_path to 'public' as $$
declare x record; c jsonb;
begin perform q_need(array['edu_reviewer']);
 if p_status not in ('draft','active','hidden') then raise exception 'حالة غير صالحة.'; end if;
 select * into x from proj_evals where id = p_id for update; if not found then raise exception 'التقييم غير موجود.'; end if;
 if p_status = 'active' then
  if not exists (select 1 from proj_items where slug = x.project and status = 'published') then raise exception 'لا يُنشر التقييم قبل نشر المشروع نفسه.'; end if;
  for c in select * from jsonb_array_elements(x.criteria) loop
   if not exists (select 1 from eval_criteria where id = (c->>'id')::uuid and status = 'active') then raise exception 'لا يُنشر التقييم وفيه معيار غير منشور.'; end if;
  end loop;
 end if;
 update proj_evals set status = p_status, updated_by = auth.uid(), updated_at = now() where id = p_id; end $$;

create or replace function public.eval_delete(p_id uuid) returns void language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['edu_reviewer']); delete from proj_evals where id = p_id; end $$;

do $g$ declare f text; begin
 foreach f in array array['eval_bad(text)','eval_public()','eval_admin()','evalc_save(jsonb)','evalc_status(uuid,text)','evalc_delete(uuid)','eval_save(jsonb)','eval_status(uuid,text)','eval_delete(uuid)'] loop
  execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
 end loop;
 grant execute on function public.eval_public() to anon, authenticated;
 grant execute on function public.eval_admin(), public.evalc_save(jsonb), public.evalc_status(uuid,text), public.evalc_delete(uuid), public.eval_save(jsonb), public.eval_status(uuid,text), public.eval_delete(uuid) to authenticated;
end $g$;
