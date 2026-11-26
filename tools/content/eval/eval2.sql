-- مهارة لكل معيار داخل التقييم (تتغلب على مهارة المعيار) + فحصها؛ eval_public تستعمل المهارة الفعلية
create or replace function public.eval_skill_chk() returns trigger language plpgsql set search_path to 'public' as $$
declare c jsonb; s text;
begin
 for c in select * from jsonb_array_elements(new.criteria) loop
  s := nullif(c->>'skill','');
  if s is not null and not exists (select 1 from skills where id = s::uuid and status = 'active') then raise exception 'المهارة المرتبطة بالمعيار غير منشورة.'; end if;
 end loop; return new; end $$;
drop trigger if exists zz_eval_skill on public.proj_evals;
create trigger zz_eval_skill before insert or update on public.proj_evals for each row execute function public.eval_skill_chk();
-- (eval_public المحدّثة مطبّقة على الخادم: تستعمل coalesce(ce.v->>'skill', c.skill_id) لمهارة المعيار وموارده)
