-- مركز المسارات حسب المهارات، المرحلة الثانية: مستوى الصعوبة، مراحل بأسماء وشرح ومهارة مستهدفة، مهارات سابقة مقترحة، ومسارات الإبداع (مسودات).
-- كل شيء يُنشأ مسودة؛ النشر للمراجع فقط. لا يُحتسب إتقان ولا تُكتب درجات.

alter table paths add column if not exists diff text;
alter table paths drop constraint if exists paths_diff_chk;
alter table paths add constraint paths_diff_chk check (diff is null or diff in ('easy','mid','hard'));
comment on column paths.diff is 'مستوى الصعوبة: easy سهل، mid متوسط، hard أصعب قليلًا. القيمة الأولية اقتراح من عمر المسار، ويؤكدها أو يعدلها المحرر.';

create table if not exists path_stage_info (
  path_id uuid not null references paths(id) on delete cascade,
  stage text not null check (stage in ('recognize','understand','practice','apply','review')),
  name text not null check (char_length(btrim(name)) between 2 and 60),
  expl text not null default '' check (char_length(expl) <= 240),
  skill_id uuid references skills(id) on delete set null,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  primary key (path_id, stage)
);
alter table path_stage_info enable row level security;
drop policy if exists psi_staff on path_stage_info;
create policy psi_staff on path_stage_info for select using (cardinality(q_roles(auth.uid())) > 0);

create table if not exists path_prior (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references paths(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  note text not null default '' check (char_length(note) <= 160),
  ord int not null default 1,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (path_id, skill_id)
);
alter table path_prior enable row level security;
drop policy if exists ppr_staff on path_prior;
create policy ppr_staff on path_prior for select using (cardinality(q_roles(auth.uid())) > 0);

revoke all on path_stage_info, path_prior from public, anon;
grant select on path_stage_info, path_prior to authenticated;

-- حفظ مرحلة (اسم وشرح ومهارة مستهدفة)
create or replace function path_stage_save(p_path uuid, p_stage text, p_name text, p_expl text, p_skill uuid)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare pa paths%rowtype; sk skills%rowtype; nm text := btrim(coalesce(p_name,'')); ex text := btrim(coalesce(p_expl,''));
begin perform q_need(array['content_editor','edu_reviewer']);
  select * into pa from paths where id = p_path for update; if not found then raise exception 'المسار غير موجود.'; end if;
  if p_stage not in ('recognize','understand','practice','apply','review') then raise exception 'مرحلة غير صالحة.'; end if;
  if char_length(nm) < 2 then raise exception 'اكتب اسم المرحلة.'; end if;
  if char_length(nm) > 60 or char_length(ex) > 240 then raise exception 'اسم المرحلة حتى 60 حرفًا والشرح حتى 240 حرفًا.'; end if;
  if skp_bad(nm) or skp_bad(ex) then raise exception 'لا تستعمل عبارات إتقان أو درجات أو مقارنة في نص المرحلة.'; end if;
  if p_skill is not null then
    select * into sk from skills where id = p_skill and status = 'active'; if not found then raise exception 'المهارة غير موجودة أو غير منشورة.'; end if;
    if not (sk.levels && pa.levels) then raise exception 'لا يتقاطع عمر المهارة مع عمر المسار.'; end if;
  end if;
  insert into path_stage_info(path_id, stage, name, expl, skill_id, updated_by) values (p_path, p_stage, nm, ex, p_skill, auth.uid())
  on conflict (path_id, stage) do update set name = excluded.name, expl = excluded.expl, skill_id = excluded.skill_id, updated_by = excluded.updated_by, updated_at = now();
  perform path_touch(p_path, 'حُدّثت المرحلة ' || p_stage);
  return jsonb_build_object('ok', true);
end $$;

create or replace function path_stage_clear(p_path uuid, p_stage text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['content_editor','edu_reviewer']);
  delete from path_stage_info where path_id = p_path and stage = p_stage;
  perform path_touch(p_path, 'أُعيدت المرحلة إلى الافتراضي ' || p_stage);
  return jsonb_build_object('ok', true);
end $$;

-- مهارات سابقة مقترحة
create or replace function path_prior_save(p_path uuid, p_skill uuid, p_note text default '')
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare pa paths%rowtype; g goals%rowtype; sk skills%rowtype; nt text := btrim(coalesce(p_note,''));
begin perform q_need(array['content_editor','edu_reviewer']);
  select * into pa from paths where id = p_path for update; if not found then raise exception 'المسار غير موجود.'; end if;
  select * into g from goals where id = pa.goal_id;
  select * into sk from skills where id = p_skill and status = 'active'; if not found then raise exception 'المهارة غير موجودة أو غير منشورة.'; end if;
  if sk.id = g.skill_id then raise exception 'هذه مهارة المسار نفسها.'; end if;
  if char_length(nt) > 160 then raise exception 'الملاحظة حتى 160 حرفًا.'; end if;
  if skp_bad(nt) then raise exception 'لا تستعمل عبارات إتقان أو درجات أو مقارنة في الملاحظة.'; end if;
  if (select count(*) from path_prior where path_id = p_path and skill_id <> p_skill) >= 4 then raise exception 'حتى أربع مهارات سابقة مقترحة لكل مسار.'; end if;
  insert into path_prior(path_id, skill_id, note, ord, created_by) values (p_path, p_skill, nt, coalesce((select max(ord) + 1 from path_prior where path_id = p_path), 1), auth.uid())
  on conflict (path_id, skill_id) do update set note = excluded.note;
  perform path_touch(p_path, 'مهارة سابقة مقترحة');
  return jsonb_build_object('ok', true);
end $$;

create or replace function path_prior_remove(p_path uuid, p_skill uuid)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['content_editor','edu_reviewer']);
  delete from path_prior where path_id = p_path and skill_id = p_skill;
  perform path_touch(p_path, 'أُزيلت مهارة سابقة');
  return jsonb_build_object('ok', true);
end $$;

create or replace function path_diff_set(p_path uuid, p_diff text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
begin perform q_need(array['content_editor','edu_reviewer']);
  if p_diff is not null and p_diff not in ('easy','mid','hard') then raise exception 'مستوى صعوبة غير صالح.'; end if;
  update paths set diff = p_diff where id = p_path; if not found then raise exception 'المسار غير موجود.'; end if;
  perform path_touch(p_path, 'مستوى الصعوبة');
  return jsonb_build_object('ok', true);
end $$;

-- path_save: يسمح الآن بمجال الإبداع ويقبل مستوى الصعوبة (بقية القواعد كما هي)
create or replace function path_save(p jsonb, p_force boolean default false)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare r text[]; pid uuid := nullif(p->>'id','')::uuid; old paths%rowtype; g goals%rowtype; nm text := btrim(coalesce(p->>'name','')); nn text; lv text[]; st text; isrev boolean; dup record; cls boolean := false; est int := nullif(p->>'est_min','')::int; slug_ text; df text := nullif(p->>'diff','');
begin r := q_need(array['content_editor','edu_reviewer']); isrev := 'edu_reviewer' = any(r) or 'library_manager' = any(r);
  select * into g from goals where id = nullif(p->>'goal_id','')::uuid; if not found then raise exception 'اختر الهدف التعليمي للمسار.'; end if;
  if g.domain not in ('arabic','math','science','life','creative') then raise exception 'المسارات للغة العربية والرياضيات والعلوم والمهارات الحياتية والإبداع والفنون فقط.'; end if;
  if char_length(nm) < 6 then raise exception 'اكتب اسم المسار بوضوح.'; end if;
  if df is not null and df not in ('easy','mid','hard') then raise exception 'مستوى صعوبة غير صالح.'; end if;
  select coalesce(array(select jsonb_array_elements_text(coalesce(p->'levels','[]'::jsonb))),'{}') into lv;
  if cardinality(lv) = 0 or not (lv <@ array['a2','a3','a4','a5','a6','g1','g2','g3','g4']) then raise exception 'حدّد العمر أو الصف من النطاق المعتمد (سنة إلى 6 سنوات والصفوف 1–4).'; end if;
  if not (lv <@ g.levels) then raise exception 'عمر المسار يجب أن يقع ضمن عمر هدفه.'; end if;
  if est is not null and (est < 1 or est > 600) then raise exception 'المدة التقديرية بين 1 و600 دقيقة.'; end if;
  nn := skill_norm(nm);
  for dup in select id, name, name_norm, levels from paths where goal_id = g.id and id is distinct from pid loop
    if dup.name_norm = nn or (dup.levels @> lv and lv @> dup.levels) then
      if not (coalesce(p_force,false) and 'library_manager' = any(r)) or dup.name_norm = nn then raise exception using message = 'يوجد مسار مماثل لهذا الهدف وهذه الفئة: «' || dup.name || '». استعمله أو غيّر الفئة أو الاسم.'; end if;
    end if;
  end loop;
  st := coalesce(p->>'status','draft'); if st not in ('draft','active','hidden') then raise exception 'حالة غير صالحة.'; end if;
  if st = 'active' and not isrev then raise exception 'نشر المسار يحتاج مراجعًا تعليميًا.'; end if;
  if pid is null then
    if st = 'active' then raise exception 'يُنشر المسار بعد إضافة موارده ومراجعته، لا عند إنشائه.'; end if;
    slug_ := 'x-' || substr(md5(random()::text || clock_timestamp()::text),1,8);
    insert into paths(slug, goal_id, name, name_norm, descr, levels, est_min, sort, status, extra, diff) values (slug_, g.id, nm, nn, btrim(coalesce(p->>'descr','')), lv, est, coalesce((select max(sort)+1 from paths),1), st, true, df) returning id into pid;
    perform path_log_(pid,'created',nm,null); return jsonb_build_object('id',pid);
  end if;
  select * into old from paths where id = pid for update; if not found then raise exception 'المسار غير موجود.'; end if;
  cls := old.goal_id <> g.id or old.name_norm <> nn or old.levels <> lv;
  if st = 'active' and old.status <> 'active' and path_blocked(pid) then raise exception 'لا يُنشر مسار موارده الأساسية غير مكتملة أو غير مناسبة. راجع تبويب المراجعة.'; end if;
  if cls and not isrev and old.status = 'active' then st := 'draft'; end if;
  update paths set goal_id = g.id, name = nm, name_norm = nn, descr = btrim(coalesce(p->>'descr', old.descr)), levels = lv, est_min = est, diff = df, status = st,
   reviewed_by = case when st='active' and old.status <> 'active' then auth.uid() else old.reviewed_by end, reviewed_at = case when st='active' and old.status <> 'active' then now() else old.reviewed_at end, updated_at = now() where id = pid;
  if old.goal_id <> g.id then delete from path_items i where i.path_id = pid and not exists (select 1 from goal_links l where l.goal_id = g.id and l.item_key = i.item_key); end if;
  perform path_log_(pid,'saved',nm,jsonb_build_object('classification_changed',cls,'status',st));
  return jsonb_build_object('id',pid,'status',st);
end $$;

-- بيانات عامة إضافية للمسارات المنشورة فقط: الصعوبة والمراحل والمهارات السابقة
create or replace function paths_more()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', p.slug, 'diff', p.diff,
    'stages', coalesce((select jsonb_agg(jsonb_build_object('stage', i.stage, 'name', i.name, 'expl', i.expl, 'skill', s.slug, 'skillName', s.name) order by path_rank(i.stage))
                        from path_stage_info i left join skills s on s.id = i.skill_id and s.status = 'active' where i.path_id = p.id), '[]'::jsonb),
    'prior', coalesce((select jsonb_agg(jsonb_build_object('s', s.slug, 'name', s.name, 'note', r.note) order by r.ord)
                       from path_prior r join skills s on s.id = r.skill_id and s.status = 'active' where r.path_id = p.id), '[]'::jsonb)
  )), '[]'::jsonb) from paths p where p.status = 'active' $$;

revoke all on function path_stage_save(uuid,text,text,text,uuid), path_stage_clear(uuid,text), path_prior_save(uuid,uuid,text), path_prior_remove(uuid,uuid), path_diff_set(uuid,text), paths_more() from public, anon, authenticated;
grant execute on function path_stage_save(uuid,text,text,text,uuid), path_stage_clear(uuid,text), path_prior_save(uuid,uuid,text), path_prior_remove(uuid,uuid), path_diff_set(uuid,text) to authenticated;
grant execute on function paths_more() to anon, authenticated;
revoke all on function path_save(jsonb, boolean) from public, anon;
grant execute on function path_save(jsonb, boolean) to authenticated;
