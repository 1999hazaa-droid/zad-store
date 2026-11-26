-- بذور المرحلة الثانية (كلها مسودات): مستوى الصعوبة المقترح، وأهداف ومسارات الإبداع والفنون.
-- مستوى الصعوبة اقتراح من أعلى فئة عمرية في المسار: حتى 4 سنوات سهل، من 5 سنوات حتى الصف الأول متوسط، الصف الثاني فما فوق أصعب قليلًا.
update paths set diff = case
  when (select max(array_position(array['a2','a3','a4','a5','a6','g1','g2','g3','g4'], l)) from unnest(levels) l) <= 3 then 'easy'
  when (select max(array_position(array['a2','a3','a4','a5','a6','g1','g2','g3','g4'], l)) from unnest(levels) l) <= 6 then 'mid'
  else 'hard' end
where diff is null;

do $$
declare
  gdef record; pdef record; gid uuid; pid uuid; sid uuid; k int := 0; ord_ int; it record;
  allv text[] := array['a2','a3','a4','a5','a6','g1','g2','g3','g4'];
begin
  if exists (select 1 from goals where domain = 'creative') then return; end if;

  for gdef in select * from (values
    (1,'g-cr-draw','cr-draw','يرسم ويلوّن أشكالًا وأفكارًا بسيطة بثقة',
      'من الخطوط والألوان الأولى إلى رسم مشاهد وأفكار من الخيال والواقع.',
      array['يمسك أدوات الرسم ويرسم خطوطًا وأشكالًا بسيطة','يلوّن داخل الأشكال بألوان يختارها','يرسم مشهدًا أو فكرة من خياله'],
      'اطلب منه أن يرسم شكلًا يختاره ويلوّنه، ثم يحدثك عما رسم.',
      'اترك له حرية اختيار الألوان والأفكار، وامدح الجهد والتنوع لا الدقة.'),
    (2,'g-cr-art','cr-art','يشكّل أعمالًا فنية بسيطة بالألوان والأشكال',
      'أعمال فنية صغيرة بالتلوين والقص والتشكيل بمواد آمنة.',
      array['يجرب أكثر من لون وشكل في عمله الفني','يركّب أشكالًا لتكوين عمل فني بسيط','يعرض عمله ويقول ما أعجبه فيه'],
      'اطلب منه أن يعرض عمله ويحكي كيف صنعه.',
      'جهّز مواد آمنة ومساحة يمكن أن تتسخ، ودع الطفل يقرر شكل العمل.'),
    (3,'g-cr-ideas','cr-ideas','يعبّر عن أفكاره بمشروع فني بسيط',
      'مشاريع فنية صغيرة تجمع الفكرة والتنفيذ والعرض.',
      array['يختار فكرة لمشروعه الفني','ينفذ مشروعه على خطوات بسيطة','يعرض مشروعه ويشرح فكرته'],
      'اطلب منه أن يشرح فكرة مشروعه وخطواته بكلماته.',
      'ساعده على تقسيم المشروع إلى خطوات صغيرة، ولا تنفذ العمل عنه.')
  ) as t(n,slug,skill,name,descr,outcomes,verify,tip) loop
    select id into sid from skills where slug = gdef.skill and status = 'active';
    if sid is null then continue; end if;
    insert into goals(slug, domain, skill_id, name, name_norm, descr, levels, outcomes, verify, tip, sort, status)
      values (gdef.slug, 'creative', sid, gdef.name, skill_norm(gdef.name), gdef.descr, allv, to_jsonb(gdef.outcomes), gdef.verify, gdef.tip, 100 + gdef.n, 'draft')
      returning id into gid;
    -- روابط الهدف: موارد منشورة مرتبطة بالمهارة نفسها (وبمهارات الفكرة والمشاريع للهدف الثالث)
    insert into goal_links(goal_id, item_key, role, stage, ord, origin, reviewed)
      select gid, l.item_key, l.role, l.stage, row_number() over (order by path_rank(l.stage), l.item_key), 'rule', false
      from (select distinct on (sl.item_key) sl.item_key, sl.role, sl.stage from skill_links sl join skills s on s.id = sl.skill_id join quality_items q on q.key = sl.item_key
            where q.status = 'published' and not q.gone
              and (s.slug = gdef.skill or (gdef.skill = 'cr-ideas' and s.slug in ('cr-ideas','cr-story','cr-design','cr-form') ) )
            order by sl.item_key, path_rank(sl.stage)) l;
  end loop;

  for pdef in select * from (values
    ('g-cr-draw','الرسم والتلوين: بداية الخط واللون',array['a3','a4'],'خطوط وألوان وأشكال أولى بأنشطة ممتعة.'),
    ('g-cr-draw','الرسم والتلوين: أشكال وأفكار',array['a5','a6'],'رسم أشكال وتلوينها بتحكم أكبر وأفكار جديدة.'),
    ('g-cr-draw','الرسم والتلوين: رسم من الخيال والواقع',array['g1','g2'],'رسم مشاهد وأفكار من الخيال والملاحظة.'),
    ('g-cr-art','أعمال فنية بسيطة بالألوان والأشكال',array['a4','a5'],'تلوين وتشكيل أعمال صغيرة ومشروع فني بسيط.'),
    ('g-cr-art','تشكيل أعمال فنية أجمل',array['a6','g1','g2'],'تجارب فنية أوسع ومشاريع بسيطة للعرض.'),
    ('g-cr-ideas','التعبير الإبداعي: مشاريع فنية بسيطة',array['a5','a6','g1','g2'],'من الفكرة إلى التنفيذ والعرض في مشاريع صغيرة.'),
    ('g-cr-ideas','مشاريع فنية للصفين الثالث والرابع',array['g3','g4'],'مشاريع فنية أكبر تجمع الفكرة والتصميم والعرض.')
  ) as t(gslug,name,lv,descr) loop
    select id into gid from goals where slug = pdef.gslug; if gid is null then continue; end if;
    k := k + 1;
    insert into paths(slug, goal_id, name, name_norm, descr, levels, sort, status, extra, diff)
      values ('p-cr-' || substr(md5(pdef.name), 1, 8), gid, pdef.name, skill_norm(pdef.name), pdef.descr, pdef.lv, (select coalesce(max(sort),0) + 1 from paths), 'draft', false,
              case when (select max(array_position(allv, l)) from unnest(pdef.lv) l) <= 3 then 'easy' when (select max(array_position(allv, l)) from unnest(pdef.lv) l) <= 6 then 'mid' else 'hard' end)
      returning id into pid;
    ord_ := 0;
    for it in select gl.item_key, gl.stage from goal_links gl join quality_items q on q.key = gl.item_key
              where gl.goal_id = gid and q.status = 'published' and not q.gone and q.levels && pdef.lv
              order by path_rank(gl.stage), gl.ord, gl.item_key limit 15 loop
      ord_ := ord_ + 1;
      insert into path_items(path_id, item_key, stage, ord, required, origin) values (pid, it.item_key, it.stage, ord_, it.stage <> 'apply', 'rule');
    end loop;
  end loop;
end $$;
