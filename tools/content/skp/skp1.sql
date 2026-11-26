-- مركز عرض المهارات المكتسبة من المشاريع: معلومات المهارة + ربط المشروع بالمهارة (أساسية/مساندة)
create table if not exists public.skill_info (
  skill_id uuid primary key references public.skills(id) on delete cascade,
  goal text not null,
  goal_kid text not null,
  examples text[] not null default '{}',
  min_proj int not null default 2 check (min_proj between 1 and 6),
  status text not null default 'draft' check (status in ('draft','active','hidden')),
  updated_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.proj_skills (
  id uuid primary key default gen_random_uuid(),
  project text not null,
  skill_id uuid not null references public.skills(id) on delete cascade,
  role text not null default 'support' check (role in ('main','support')),
  goal text not null,
  ord int not null default 0,
  status text not null default 'draft' check (status in ('draft','active','hidden')),
  updated_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (project, skill_id)
);
alter table public.skill_info enable row level security;
alter table public.proj_skills enable row level security;

create or replace function public.skp_bad(t text) returns boolean language sql immutable set search_path to 'public' as $$
 select coalesce(t,'') ~ '(أتقن|اتقن|يتقن|تتقن|نتقن|إتقان|اتقان|متقن|درجة|درجات|رسوب|عقوبة|أفضل من|أسوأ|الأول على|ترتيب الأطفال|منافسة|ضعيف|فاشل|متأخر عن)' $$;

-- العرض العام: مهارات منشورة فقط، وروابط مشاريع منشورة ضمن النطاق (سنة إلى 6 سنوات والصفوف 1-4)
create or replace function public.skp_public() returns jsonb language sql stable security definer set search_path to 'public' as $$
 select jsonb_build_object(
  'domains', coalesce((select jsonb_agg(jsonb_build_object('slug',d.slug,'name',d.name,'icon',d.icon,'color',d.color) order by d.sort) from skill_domains d where d.status='active'),'[]'::jsonb),
  'skills', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'slug',s.slug,'domain',s.domain,'name',s.name,'descr',s.descr,'levels',s.levels,
      'goal',i.goal,'goal_kid',i.goal_kid,'examples',to_jsonb(i.examples),'min_proj',i.min_proj) order by d.sort, s.sort)
     from skills s join skill_info i on i.skill_id=s.id and i.status='active' join skill_domains d on d.slug=s.domain and d.status='active'
     where s.status='active' and s.levels <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(jsonb_build_object('slug',p.slug,'title',p.title,'icon',p.icon,'cat',p.cat,'levels',p.levels,'goal',coalesce(p.data->>'goal',p.instr))) from proj_items p
     where p.kind='project' and p.status='published' and p.levels <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']
       and exists (select 1 from proj_skills l join skills s on s.id=l.skill_id and s.status='active' join skill_info i on i.skill_id=s.id and i.status='active' where l.project=p.slug and l.status='active')),'[]'::jsonb),
  'plinks', coalesce((select jsonb_agg(jsonb_build_object('p',l.project,'s',l.skill_id,'r',l.role,'g',l.goal,'o',l.ord) order by l.project, (l.role='main') desc, l.ord)
     from proj_skills l join skills s on s.id=l.skill_id and s.status='active' join skill_info i on i.skill_id=s.id and i.status='active'
     join proj_items p on p.slug=l.project and p.kind='project' and p.status='published' and p.levels && s.levels where l.status='active'),'[]'::jsonb),
  'links', coalesce((select jsonb_agg(jsonb_build_object('s',l.skill_id,'k',l.item_key,'r',l.role,'g',l.stage,'o',l.ord))
     from skill_links l join skills s on s.id=l.skill_id and s.status='active' join skill_info i on i.skill_id=s.id and i.status='active'
     join quality_items q on q.key=l.item_key and q.status='published' and not q.gone),'[]'::jsonb)) $$;

-- مهارات مشروع واحد (لصفحة المشروع)
create or replace function public.skp_project(p_slug text) returns jsonb language sql stable security definer set search_path to 'public' as $$
 select coalesce(jsonb_agg(jsonb_build_object('slug',s.slug,'name',s.name,'domain',s.domain,'color',d.color,'icon',d.icon,'role',l.role,'goal',l.goal,'goal_kid',i.goal_kid,'levels',s.levels) order by (l.role='main') desc, l.ord, s.name),'[]'::jsonb)
 from proj_skills l join skills s on s.id=l.skill_id and s.status='active' join skill_info i on i.skill_id=s.id and i.status='active' join skill_domains d on d.slug=s.domain
 join proj_items p on p.slug=l.project and p.kind='project' and p.status='published' and p.levels && s.levels
 where l.project=p_slug and l.status='active' $$;

create or replace function public.skp_admin() returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin perform q_need(array['content_editor','edu_reviewer']);
 return jsonb_build_object(
  'domains', coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'name',name) order by sort) from skill_domains where status='active'),'[]'::jsonb),
  'skills', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'slug',s.slug,'domain',s.domain,'name',s.name,'descr',s.descr,'levels',s.levels,'sstatus',s.status,
     'info', case when i.skill_id is null then null else jsonb_build_object('goal',i.goal,'goal_kid',i.goal_kid,'examples',to_jsonb(i.examples),'min_proj',i.min_proj,'status',i.status) end,
     'res', (select count(*) from skill_links l join quality_items q on q.key=l.item_key and q.status='published' and not q.gone where l.skill_id=s.id)) order by s.domain, s.sort) from skills s left join skill_info i on i.skill_id=s.id),'[]'::jsonb),
  'plinks', coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'project',l.project,'skill',l.skill_id,'role',l.role,'goal',l.goal,'ord',l.ord,'status',l.status) order by l.project, l.ord) from proj_skills l),'[]'::jsonb),
  'projects', coalesce((select jsonb_agg(jsonb_build_object('slug',p.slug,'title',p.title,'levels',p.levels,'status',p.status,'cat',p.cat) order by p.sort_order, p.title) from proj_items p where p.kind='project'),'[]'::jsonb)); end $$;

create or replace function public.skp_info_save(p jsonb) returns uuid language plpgsql security definer set search_path to 'public' as $$
declare r text[]; sid uuid := nullif(p->>'skill','')::uuid; g text; gk text; ex text[]; e text; mp int; old record;
begin perform q_need(array['content_editor','edu_reviewer']); r := q_roles(auth.uid());
 if not exists (select 1 from skills where id = sid) then raise exception 'المهارة غير موجودة.'; end if;
 if not exists (select 1 from skills where id = sid and levels <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']) then raise exception 'المهارة خارج النطاق المعتمد.'; end if;
 g := btrim(coalesce(p->>'goal','')); gk := btrim(coalesce(p->>'goal_kid',''));
 if length(g) < 8 or length(g) > 200 then raise exception 'الهدف التعليمي من 8 إلى 200 حرف.'; end if;
 if length(gk) < 5 or length(gk) > 120 then raise exception 'صياغة الطفل من 5 إلى 120 حرفًا.'; end if;
 select coalesce(array_agg(btrim(v)),'{}') into ex from jsonb_array_elements_text(coalesce(p->'examples','[]'::jsonb)) v where btrim(v) <> '';
 if cardinality(ex) > 5 then raise exception 'حتى 5 أمثلة.'; end if;
 foreach e in array ex loop if length(e) < 3 or length(e) > 100 then raise exception 'المثال من 3 إلى 100 حرف.'; end if; end loop;
 mp := coalesce(nullif(p->>'min_proj','')::int, 2); if mp < 1 or mp > 6 then raise exception 'معيار الممارسة من 1 إلى 6.'; end if;
 if skp_bad(g||' '||gk||' '||array_to_string(ex,' ')) or series_bad_words(g||' '||gk||' '||array_to_string(ex,' ')) then raise exception 'تجنّب عبارات الإتقان والدرجات والمنافسة؛ هذا المركز يعرض الممارسة لا الإتقان.'; end if;
 select * into old from skill_info where skill_id = sid for update;
 if not found then insert into skill_info(skill_id, goal, goal_kid, examples, min_proj, status, updated_by) values (sid, g, gk, ex, mp, 'draft', auth.uid());
 else update skill_info set goal = g, goal_kid = gk, examples = ex, min_proj = mp, updated_by = auth.uid(), updated_at = now(),
   status = case when old.status = 'active' and not ('edu_reviewer' = any(r) or 'library_manager' = any(r)) then 'draft' else old.status end where skill_id = sid; end if;
 return sid; end $$;

create or replace function public.skp_info_status(p_skill uuid, p_status text) returns void language plpgsql security definer set search_path to 'public' as $$
declare i record;
begin perform q_need(array['edu_reviewer']);
 if p_status not in ('draft','active','hidden') then raise exception 'حالة غير صالحة.'; end if;
 select * into i from skill_info where skill_id = p_skill for update; if not found then raise exception 'احفظ بيانات المهارة أولًا.'; end if;
 if p_status = 'active' then
  if cardinality(i.examples) < 1 then raise exception 'أضف مثالًا واحدًا على الأقل قبل النشر.'; end if;
  if not exists (select 1 from skills where id = p_skill and levels <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']) then raise exception 'المهارة خارج النطاق المعتمد.'; end if;
  update skills set status = 'active', updated_at = now() where id = p_skill and status <> 'active';
 end if;
 update skill_info set status = p_status, updated_by = auth.uid(), updated_at = now() where skill_id = p_skill; end $$;

create or replace function public.skp_link_save(p jsonb) returns uuid language plpgsql security definer set search_path to 'public' as $$
declare r text[]; lid uuid := nullif(p->>'id','')::uuid; pj record; sk record; ro text := coalesce(p->>'role','support'); g text; od int := coalesce(nullif(p->>'ord','')::int,0); nid uuid; old record; n int;
begin perform q_need(array['content_editor','edu_reviewer']); r := q_roles(auth.uid());
 select * into pj from proj_items where slug = p->>'project' and kind = 'project'; if pj.slug is null then raise exception 'اختر مشروعًا موجودًا.'; end if;
 select * into sk from skills where id = nullif(p->>'skill','')::uuid; if sk.id is null then raise exception 'اختر مهارة موجودة.'; end if;
 if ro not in ('main','support') then raise exception 'الدور أساسية أو مساندة.'; end if;
 if not (sk.levels <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']) or not (pj.levels <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']) then raise exception 'خارج النطاق المعتمد.'; end if;
 if not (sk.levels && pj.levels) then raise exception 'أعمار المهارة لا تتقاطع مع أعمار المشروع.'; end if;
 g := btrim(coalesce(p->>'goal','')); if length(g) < 5 or length(g) > 140 then raise exception 'هدف المهارة في هذا المشروع من 5 إلى 140 حرفًا.'; end if;
 if skp_bad(g) or series_bad_words(g) then raise exception 'تجنّب عبارات الإتقان والدرجات والمنافسة.'; end if;
 select count(*) into n from proj_skills where project = pj.slug and id is distinct from lid;
 if n >= 6 then raise exception 'حتى 6 مهارات لكل مشروع؛ القوائم الطويلة مشتتة.'; end if;
 if ro = 'main' and (select count(*) from proj_skills where project = pj.slug and role = 'main' and id is distinct from lid) >= 3 then raise exception 'حتى 3 مهارات أساسية لكل مشروع.'; end if;
 if lid is null then
  if exists (select 1 from proj_skills where project = pj.slug and skill_id = sk.id) then raise exception 'هذه المهارة مرتبطة بالمشروع بالفعل؛ عدّل الربط.'; end if;
  insert into proj_skills(project, skill_id, role, goal, ord, status, updated_by) values (pj.slug, sk.id, ro, g, od, 'draft', auth.uid()) returning proj_skills.id into nid;
 else
  select * into old from proj_skills where proj_skills.id = lid for update; if not found then raise exception 'الربط غير موجود.'; end if;
  if (old.project <> pj.slug or old.skill_id <> sk.id) and exists (select 1 from proj_skills where project = pj.slug and skill_id = sk.id) then raise exception 'هذه المهارة مرتبطة بالمشروع بالفعل.'; end if;
  update proj_skills set project = pj.slug, skill_id = sk.id, role = ro, goal = g, ord = od, updated_by = auth.uid(), updated_at = now(),
   status = case when old.status = 'active' and not ('edu_reviewer' = any(r) or 'library_manager' = any(r)) then 'draft' else old.status end where proj_skills.id = lid; nid := lid;
 end if; return nid; end $$;

create or replace function public.skp_link_status(p_id uuid, p_status text) returns void language plpgsql security definer set search_path to 'public' as $$
declare x record;
begin perform q_need(array['edu_reviewer']);
 if p_status not in ('draft','active','hidden') then raise exception 'حالة غير صالحة.'; end if;
 select * into x from proj_skills where id = p_id for update; if not found then raise exception 'الربط غير موجود.'; end if;
 if p_status = 'active' then
  if not exists (select 1 from proj_items where slug = x.project and status = 'published') then raise exception 'لا يُنشر الربط قبل نشر المشروع نفسه.'; end if;
  if not exists (select 1 from skill_info where skill_id = x.skill_id and status = 'active') then raise exception 'انشر صفحة المهارة أولًا.'; end if;
 end if;
 update proj_skills set status = p_status, updated_by = auth.uid(), updated_at = now() where id = p_id; end $$;

create or replace function public.skp_link_delete(p_id uuid) returns void language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['edu_reviewer']); delete from proj_skills where id = p_id; end $$;

do $g$ declare f text; begin
 foreach f in array array['skp_bad(text)','skp_public()','skp_project(text)','skp_admin()','skp_info_save(jsonb)','skp_info_status(uuid,text)','skp_link_save(jsonb)','skp_link_status(uuid,text)','skp_link_delete(uuid)'] loop
  execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
 end loop;
 grant execute on function public.skp_public(), public.skp_project(text) to anon, authenticated;
 grant execute on function public.skp_admin(), public.skp_info_save(jsonb), public.skp_info_status(uuid,text), public.skp_link_save(jsonb), public.skp_link_status(uuid,text), public.skp_link_delete(uuid) to authenticated;
end $g$;
