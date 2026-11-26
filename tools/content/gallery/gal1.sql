-- مركز معرض المشاريع الآمن: إعدادات فقط (محتوى الأطفال يبقى على أجهزتهم ولا يصل إلى الخادم)
create table if not exists public.gallery_settings (
  id int primary key check (id = 1),
  cfg jsonb not null default '{}'::jsonb,
  updated_by uuid, updated_at timestamptz not null default now()
);
alter table public.gallery_settings enable row level security;
insert into public.gallery_settings(id, cfg) values (1, jsonb_build_object(
 'domains', jsonb_build_array(
  jsonb_build_object('slug','science','title','العلوم والاستكشاف','on',true),jsonb_build_object('slug','math','title','الرياضيات','on',true),
  jsonb_build_object('slug','arabic','title','اللغة العربية والقراءة والكتابة','on',true),jsonb_build_object('slug','english','title','اللغة الإنجليزية','on',true),
  jsonb_build_object('slug','art','title','الفنون والإبداع','on',true),jsonb_build_object('slug','nature','title','البيئة والنظافة','on',true),
  jsonb_build_object('slug','life','title','المهارات الحياتية','on',true),jsonb_build_object('slug','multi','title','متعدد المجالات','on',true)),
 'types', jsonb_build_array(
  jsonb_build_object('slug','project','title','مشروع','on',true),jsonb_build_object('slug','craft','title','عمل يدوي وفني','on',true),
  jsonb_build_object('slug','experiment','title','تجربة وملاحظة','on',true),jsonb_build_object('slug','story','title','قصة أو كتابة','on',true),
  jsonb_build_object('slug','building','title','بناء وتركيب','on',true)),
 'msgs', jsonb_build_array('أحسنت! أضفت إنجازًا جديدًا إلى معرضك','مشروع جميل يوضح ما تعلمته','كل مشروع جديد هو خطوة في رحلة التعلم','احتفظ بإنجازك لتتذكر ما تعلمته'),
 'allow_print', true, 'allow_photos', true)) on conflict (id) do nothing;

create or replace function public.gallery_cfg_public() returns jsonb language sql stable security definer set search_path to 'public' as $$
 select coalesce((select cfg from gallery_settings where id = 1), '{}'::jsonb) $$;
create or replace function public.gallery_cfg_admin() returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin perform q_need(array['content_editor','edu_reviewer']); return coalesce((select cfg from gallery_settings where id = 1), '{}'::jsonb); end $$;

create or replace function public.gallery_cfg_save(p jsonb) returns void language plpgsql security definer set search_path to 'public' as $$
declare x jsonb; k text; n int; arr jsonb; t text; slugs text[];
begin perform q_need(array['content_editor','edu_reviewer']);
 foreach k in array array['domains','types'] loop
  arr := p->k; if jsonb_typeof(arr) <> 'array' then raise exception 'القائمة غير صالحة.'; end if;
  n := jsonb_array_length(arr); if n < 1 or n > 14 then raise exception 'عدد عناصر القائمة من 1 إلى 14.'; end if;
  slugs := '{}';
  for x in select * from jsonb_array_elements(arr) loop
   if coalesce(x->>'slug','') !~ '^[a-z][a-z0-9_]{1,24}$' then raise exception 'المعرّف يتكون من حروف إنجليزية صغيرة وأرقام.'; end if;
   if (x->>'slug') = any(slugs) then raise exception 'معرّف مكرر.'; end if; slugs := slugs || (x->>'slug');
   t := btrim(coalesce(x->>'title','')); if length(t) < 2 or length(t) > 40 then raise exception 'اسم العنصر من 2 إلى 40 حرفًا.'; end if;
   if series_bad_words(t) or eval_bad(t) then raise exception 'تجنّب عبارات المقارنة والضعف في الأسماء.'; end if;
   if jsonb_typeof(x->'on') <> 'boolean' then raise exception 'حالة العنصر غير صالحة.'; end if;
  end loop;
  if not exists (select 1 from jsonb_array_elements(arr) y where (y->>'on')::boolean) then raise exception 'فعّل عنصرًا واحدًا على الأقل.'; end if;
 end loop;
 arr := p->'msgs'; if jsonb_typeof(arr) <> 'array' or jsonb_array_length(arr) < 1 or jsonb_array_length(arr) > 10 then raise exception 'رسائل التشجيع من 1 إلى 10.'; end if;
 for x in select * from jsonb_array_elements(arr) loop
  if jsonb_typeof(x) <> 'string' or length(btrim(x #>> '{}')) < 3 or length(x #>> '{}') > 100 then raise exception 'الرسالة من 3 إلى 100 حرف.'; end if;
  if series_bad_words(x #>> '{}') or eval_bad(x #>> '{}') or (x #>> '{}') ~ '(فشل|ضعيف|سيئ|أفضل|أحسن من|ترتيب|المركز الأول)' then raise exception 'الرسائل مشجعة بلا مقارنة ولا ترتيب.'; end if;
 end loop;
 if jsonb_typeof(p->'allow_print') <> 'boolean' or jsonb_typeof(p->'allow_photos') <> 'boolean' then raise exception 'إعدادات المشاركة غير صالحة.'; end if;
 update gallery_settings set cfg = jsonb_build_object('domains', p->'domains', 'types', p->'types', 'msgs', p->'msgs', 'allow_print', p->'allow_print', 'allow_photos', p->'allow_photos'), updated_by = auth.uid(), updated_at = now() where id = 1;
end $$;

do $g$ declare f text; begin
 foreach f in array array['gallery_cfg_public()','gallery_cfg_admin()','gallery_cfg_save(jsonb)'] loop execute 'revoke all on function public.' || f || ' from public, anon, authenticated'; end loop;
 grant execute on function public.gallery_cfg_public() to anon, authenticated;
 grant execute on function public.gallery_cfg_admin(), public.gallery_cfg_save(jsonb) to authenticated;
end $g$;
