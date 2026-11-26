-- مركز المشاريع الأسبوعية والشهرية: توسيع proj_items (لا جدول جديد)
alter table public.proj_items add column if not exists span text not null default 'short';
alter table public.proj_items drop constraint if exists proj_items_span_check;
alter table public.proj_items add constraint proj_items_span_check check (span in ('short','weekly','monthly'));

create or replace function public.proj_span_guard() returns trigger
language plpgsql set search_path to 'public' as $fn$
declare
  d jsonb := coalesce(new.data,'{}'::jsonb);
  st jsonb; s jsonb; r jsonb; n int; allt text := ''; stages text[] := '{}'; g text; nres int; young boolean;
begin
  if new.kind = 'challenge' and new.span <> 'short' then
    raise exception 'SPAN: التحدي قصير فقط ولا يكون أسبوعيا ولا شهريا.' using errcode = 'P0001';
  end if;
  if new.kind <> 'project' or new.status <> 'published' then return new; end if;

  st := case when jsonb_typeof(d->'steps') = 'array' then d->'steps' else '[]'::jsonb end;
  n := jsonb_array_length(st);
  allt := coalesce(d->>'goal','') || ' ' || coalesce(d->>'safety','') || ' ' || coalesce(d->>'parent','') || ' ' || coalesce(d->>'reflect','');
  if jsonb_typeof(d->'tools') = 'array' then
    for s in select * from jsonb_array_elements(d->'tools') loop allt := allt || ' ' || coalesce(s #>> '{}',''); end loop;
  end if;
  for s in select * from jsonb_array_elements(st) loop
    allt := allt || ' ' || coalesce(s->>'t','') || ' ' || coalesce(s->>'p','');
    g := coalesce(s->>'g','');
    if g <> '' and not (g = any(stages)) then stages := stages || g; end if;
  end loop;

  if daily_unsafe(regexp_replace(regexp_replace(allt,'قليل\S*','','g'),'(غير|ليست|ليس) حاد(ة|ات|ين|)','','g')) then
    raise exception 'SAFETY: الأدوات الحادة أو الساخنة أو الكهربائية تحتاج عبارة «بإشراف شخص بالغ»، ولا يجوز طلب بيانات شخصية أو مالية حقيقية.' using errcode = 'P0001';
  end if;
  if series_bad_words(allt) then
    raise exception 'WORDING: عبارات تصف الطفل بالضعف أو التأخر غير مقبولة.' using errcode = 'P0001';
  end if;

  young := new.levels && array['a2','a3'];
  if young then
    if coalesce(d->>'adult','') <> 'true' then
      raise exception 'SAFETY: مشاريع الأعمار الصغيرة تتطلب مشاركة شخص بالغ.' using errcode = 'P0001';
    end if;
    if allt ~ '(خرز|حبوب|حبة |حبات|أزرار|عملات|دبابيس|مشابك|بالون|بذور|حصى|عدس|فشار|مكسرات|قطع صغيرة|أشياء صغيرة)' then
      raise exception 'SAFETY: أدوات تسبب الاختناق (أشياء صغيرة تدخل الفم) غير مقبولة لمن هم دون ٤ سنوات.' using errcode = 'P0001';
    end if;
  end if;

  if new.span <> 'short' then
    if young or (new.span = 'monthly' and new.levels && array['a4']) then
      raise exception 'SPAN: المشاريع الأسبوعية من ٤ سنوات والشهرية من ٥ سنوات.' using errcode = 'P0001';
    end if;
    if new.span = 'weekly' and (n < 5 or n > 14) then raise exception 'SPAN: المشروع الأسبوعي من ٥ إلى ١٤ خطوة.' using errcode = 'P0001'; end if;
    if new.span = 'monthly' and (n < 6 or n > 16) then raise exception 'SPAN: المشروع الشهري من ٦ إلى ١٦ خطوة.' using errcode = 'P0001'; end if;
    if (select count(*) from jsonb_array_elements(st) x where coalesce(x->>'g','') = '') > 0 then
      raise exception 'SPAN: لكل خطوة في المشروع الأسبوعي أو الشهري اسم مرحلة (اليوم أو الأسبوع).' using errcode = 'P0001';
    end if;
    if new.span = 'weekly' and (cardinality(stages) < 2 or cardinality(stages) > 7) then raise exception 'SPAN: المشروع الأسبوعي من يومين إلى ٧ أيام.' using errcode = 'P0001'; end if;
    if new.span = 'monthly' and (cardinality(stages) < 3 or cardinality(stages) > 5) then raise exception 'SPAN: المشروع الشهري من ٣ إلى ٥ مراحل.' using errcode = 'P0001'; end if;
    if length(coalesce(d->>'reflect','')) < 10 then raise exception 'SPAN: سؤال التأمل مطلوب.' using errcode = 'P0001'; end if;
    if length(coalesce(d->>'parent','')) < 10 then raise exception 'SPAN: دور ولي الأمر مطلوب.' using errcode = 'P0001'; end if;
    if new.minutes is null or new.minutes < 5 or new.minutes > 45 then raise exception 'SPAN: زمن الجلسة من ٥ إلى ٤٥ دقيقة.' using errcode = 'P0001'; end if;
  end if;

  if d->'res' is not null then
    if jsonb_typeof(d->'res') <> 'array' or jsonb_array_length(d->'res') > 6 then
      raise exception 'RES: روابط المكتبة حتى ستة.' using errcode = 'P0001';
    end if;
    for r in select * from jsonb_array_elements(d->'res') loop
      if coalesce(r->>'href','') !~ '^[a-z0-9_-]+(/[a-z0-9_.-]*)*$' or length(coalesce(r->>'label','')) < 2 or length(r->>'label') > 60 then
        raise exception 'RES: رابط المكتبة داخلي فقط (مثل stories/) مع اسم واضح.' using errcode = 'P0001';
      end if;
    end loop;
  end if;
  return new;
end $fn$;

drop trigger if exists zz_pspan_guard on public.proj_items;
create trigger zz_pspan_guard before insert or update on public.proj_items for each row execute function public.proj_span_guard();
