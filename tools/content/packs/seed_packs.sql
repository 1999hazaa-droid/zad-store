-- بذر الحزم من موارد منشورة موجودة فعلًا. يتجاهل أي حزمة لا يتوفر لها 4 موارد على الأقل.
-- كل مصدر: s=الجدول, c=التصنيفات (اختياري), sec=أقسام المكتبة, n=العدد, o=إزاحة
do $$
declare
  d jsonb; r jsonb; sp jsonb; lv text; tb text; col text; keys text[]; k text; i int; pid uuid; n_added int; rk int; sort_i int := 0;
  defs jsonb := $J$[
 {"slug":"a2-sounds-colors","t":"أصوات وألوان وحيوانات","lv":"a2","dom":"thinking","sk":["التعرّف على الألوان","تسمية الأشياء","الأصوات والمطابقة"],"s":"حزمة قصيرة لأصغر المتعلمين: صور وألوان وأصوات وتفاعل مع ولي الأمر.","src":[{"s":"lib","sec":["cards"],"n":3},{"s":"songs","n":2},{"s":"ready","c":["percep"],"n":2},{"s":"vid","c":["songs"],"n":1}]},
 {"slug":"a2-move-play","t":"ألعب وأتحرك","lv":"a2","dom":"thinking","sk":["الحركة والتآزر","المحاكاة","الاستماع"],"s":"أنشطة بسيطة للحركة والغناء والتقليد مع ولي الأمر.","src":[{"s":"ready","c":["motor"],"n":2},{"s":"bank","c":["motor"],"n":2},{"s":"songs","n":2,"o":2},{"s":"vid","c":["body"],"n":1}]},
 {"slug":"a3-colors-shapes-numbers","t":"ألوان وأشكال وأعداد","lv":"a3","dom":"math","sk":["الألوان والأشكال","العدّ الأولي","المطابقة"],"s":"ألوان وأشكال وعدّ من 1 إلى 5 بأنشطة قصيرة ومطابقة.","src":[{"s":"lib","sec":["cards","math"],"n":3},{"s":"bank","c":["math"],"n":3},{"s":"vid","c":["math"],"n":1},{"s":"ready","c":["math"],"n":1}]},
 {"slug":"a3-first-words","t":"كلماتي الأولى","lv":"a3","dom":"arabic","sk":["المفردات","الاستماع","التسمية"],"s":"مفردات وحروف أولى مع قصة وأنشطة لغة قصيرة.","src":[{"s":"stories","n":1},{"s":"bank","c":["arabic"],"n":3},{"s":"vid","c":["letters"],"n":1},{"s":"ready","c":["lang"],"n":2}]},
 {"slug":"a3-kind-values","t":"قيم جميلة","lv":"a3","dom":"values","sk":["اللطف والاحترام","التعاون","التعبير عن المشاعر"],"s":"مواقف وقصص قصيرة عن الاحترام والتعاون والصدق.","src":[{"s":"stories","c":["values"],"n":1},{"s":"val","c":["respect","coop","empathy","honesty"],"n":4},{"s":"bank","c":["values"],"n":2},{"s":"vid","c":["values"],"n":1}]},
 {"slug":"a4-first-letters","t":"حروفي الأولى","lv":"a4","dom":"arabic","sk":["التعرّف على الحروف","تتبّع الحروف","الأصوات"],"s":"تعرّف على الحروف وأشكالها وأصواتها وتدرّب على تتبّعها.","src":[{"s":"stories","c":["arabic"],"n":1},{"s":"vid","c":["letters"],"n":1},{"s":"bank","c":["arabic"],"n":3},{"s":"ready","c":["lang"],"n":1},{"s":"lib","sec":["letters"],"n":2},{"s":"quiz","c":["arabic"],"n":1}]},
 {"slug":"a4-count-compare","t":"أعدّ وأقارن","lv":"a4","dom":"math","sk":["العدّ من 1 إلى 10","المقارنة","ربط العدد بالكمية"],"s":"عدّ من 1 إلى 10 ومقارنة الكميات بأنشطة متدرجة.","src":[{"s":"vid","c":["math"],"n":1},{"s":"bank","c":["math"],"n":3,"o":3},{"s":"proj","c":["numbers"],"n":1},{"s":"lib","sec":["math"],"n":2},{"s":"quiz","c":["math"],"n":1}]},
 {"slug":"a4-english-first-words","t":"English: كلماتي الأولى","lv":"a4","dom":"english","sk":["مفردات إنجليزية أساسية","الاستماع","النطق"],"s":"كلمات إنجليزية أساسية بالصور والأنشطة والاختبار القصير.","src":[{"s":"vid","c":["english"],"n":1},{"s":"bank","c":["english"],"n":3},{"s":"proj","c":["english"],"n":1},{"s":"quiz","c":["english"],"n":1}]},
 {"slug":"a4-explore-world","t":"أستكشف حولي","lv":"a4","dom":"science","sk":["الملاحظة","الحيوانات والنباتات","المعرفة العامة"],"s":"استكشاف الحيوانات والنباتات والعالم من حولنا.","src":[{"s":"vid","c":["science","living"],"n":1},{"s":"exp","c":["animals","plants"],"n":3},{"s":"bank","c":["science"],"n":3},{"s":"quiz","c":["science"],"n":1}]},
 {"slug":"a5-letters-writing","t":"أستعد للحروف والكتابة","lv":"a5","dom":"arabic","sk":["الحروف وأشكالها","الكتابة الأولى","تكوين كلمات"],"s":"حروف وكلمات وتتبّع وكتابة أولى.","src":[{"s":"lib","sec":["letters"],"n":3},{"s":"bank","c":["arabic"],"n":3,"o":3},{"s":"proj","c":["words"],"n":1},{"s":"quiz","c":["arabic"],"n":1,"o":1}]},
 {"slug":"a5-my-nature","t":"طبيعتي وعالمي","lv":"a5","dom":"science","sk":["الملاحظة","البيئة","الكائنات الحية"],"s":"النبات والحيوان والأرض ومشروع صغير في الطبيعة.","src":[{"s":"vid","c":["science","living"],"n":1},{"s":"exp","c":["earth","plants","animals"],"n":3},{"s":"bank","c":["science"],"n":3,"o":3},{"s":"proj","c":["nature"],"n":1},{"s":"quiz","c":["science"],"n":1}]},
 {"slug":"a5-home-skills","t":"مهاراتي في البيت","lv":"a5","dom":"life","sk":["الاعتماد على النفس","النظافة والأمان","التعاون في البيت"],"s":"عادات يومية ومهارات بسيطة وأنشطة مع الأسرة.","src":[{"s":"life","c":["hyg","home","manners","safety"],"n":4},{"s":"ready","c":["indep"],"n":2},{"s":"lib","sec":["home"],"n":2},{"s":"vid","c":["life"],"n":1}]},
 {"slug":"a6-school-ready","t":"جاهز للمدرسة","lv":"a6","dom":"thinking","sk":["التركيز","الاستعداد للقراءة والحساب","الاعتماد على النفس"],"s":"مهارات التركيز والملاحظة والاستعداد للصف الأول.","src":[{"s":"vid","c":["ready"],"n":1},{"s":"ready","c":["chk","focus"],"n":4},{"s":"bank","c":["focus"],"n":2},{"s":"lib","sec":["think"],"n":2},{"s":"quiz","c":["early"],"n":1}]},
 {"slug":"a6-read-write","t":"أقرأ وأكتب","lv":"a6","dom":"arabic","sk":["القراءة الأولى","كتابة الحروف","فهم قصة قصيرة"],"s":"قصة وحروف وكلمات وكتابة أولى استعدادًا للصف الأول.","src":[{"s":"lib","sec":["stories","letters"],"n":3},{"s":"stories","c":["arabic"],"n":1},{"s":"bank","c":["arabic"],"n":3,"o":6},{"s":"proj","c":["arabic","words"],"n":1},{"s":"quiz","c":["arabic"],"n":1,"o":2}]},
 {"slug":"a6-add-subtract","t":"أجمع وأطرح حتى 10","lv":"a6","dom":"math","sk":["الجمع والطرح ضمن 10","مقارنة الأعداد","حل مسائل قصيرة"],"s":"جمع وطرح ضمن 10 بالأشياء والأنشطة.","src":[{"s":"lib","sec":["math"],"n":2},{"s":"bank","c":["math"],"n":3},{"s":"proj","c":["math","numbers"],"n":1},{"s":"quiz","c":["math"],"n":1}]},
 {"slug":"g1-arabic","t":"لغتي الجميلة – الصف الأول","lv":"g1","dom":"arabic","sk":["الحروف والقراءة","الكتابة","فهم المقروء"],"s":"حروف وكلمات وقراءة وتدريبات للصف الأول.","src":[{"s":"lib","sec":["letters","stories"],"n":3},{"s":"bank","c":["arabic"],"n":3},{"s":"proj","c":["arabic","think"],"n":1},{"s":"quiz","c":["arabic"],"n":1}]},
 {"slug":"g1-math","t":"رياضيات ممتعة – الصف الأول","lv":"g1","dom":"math","sk":["الأعداد والعمليات","الجمع والطرح","المقارنة"],"s":"أعداد وجمع وطرح ومقارنة بتدريبات متدرجة.","src":[{"s":"lib","sec":["math"],"n":3},{"s":"proj","c":["math"],"n":1},{"s":"quiz","c":["math"],"n":2},{"s":"vid","c":["review"],"n":1}]},
 {"slug":"g1-science-explore","t":"علوم واستكشاف – الصف الأول","lv":"g1","dom":"science","sk":["الملاحظة العلمية","الكائنات الحية","الأرض والفضاء"],"s":"تجارب واستكشاف لعالم الحيوان والنبات والأرض.","src":[{"s":"stories","c":["science"],"n":1},{"s":"vid","c":["science","living"],"n":1},{"s":"exp","c":["space","earth","body"],"n":3},{"s":"bank","c":["science"],"n":3},{"s":"quiz","c":["science"],"n":1}]},
 {"slug":"g1-values-life","t":"سلوك ومهارات حياتية – الصف الأول","lv":"g1","dom":"values","sk":["الصدق والمسؤولية","النظام والوقت","التعاون"],"s":"قيم ومواقف ومهارات يومية مناسبة للصف الأول.","src":[{"s":"vid","c":["values","life"],"n":1},{"s":"val","c":["honesty","resp","patience"],"n":3},{"s":"life","c":["time","manners"],"n":2},{"s":"quiz","c":["values"],"n":1}]},
 {"slug":"g2-math","t":"رياضيات ممتعة – الصف الثاني","lv":"g2","dom":"math","sk":["الجمع والطرح","جدول الضرب 2–5","حل المسائل"],"s":"عمليات وجدول ضرب 2 إلى 5 وتدريبات للصف الثاني.","src":[{"s":"lib","sec":["math"],"n":4},{"s":"vid","c":["review"],"n":1},{"s":"quiz","c":["math"],"n":1,"o":3}]},
 {"slug":"g2-reading","t":"قراءة وفهم – الصف الثاني","lv":"g2","dom":"arabic","sk":["القراءة الجهرية","فهم المقروء","ترتيب الأحداث"],"s":"قصص قصيرة وأسئلة فهم وتدريبات لغوية.","src":[{"s":"lib","sec":["stories"],"n":2},{"s":"stories","n":2},{"s":"bank","c":["arabic"],"n":3,"o":9},{"s":"quiz","c":["arabic","english"],"n":1}]},
 {"slug":"g2-science-values","t":"أكتشف وأتصرف بحكمة – الصف الثاني","lv":"g2","dom":"science","sk":["الملاحظة","المسؤولية","السلوك الإيجابي"],"s":"استكشاف علمي ومواقف قيمية وتفكير.","src":[{"s":"vid","c":["science"],"n":1},{"s":"exp","c":["animals","plants","invent"],"n":3},{"s":"val","c":["resp","coop"],"n":2},{"s":"bank","c":["science"],"n":2,"o":6}]},
 {"slug":"g3-math","t":"رياضيات ممتعة – الصف الثالث","lv":"g3","dom":"math","sk":["الضرب والقسمة","الكسور","حل المسائل"],"s":"ضرب وكسور وتدريبات متدرجة للصف الثالث.","src":[{"s":"lib","sec":["math"],"n":4},{"s":"vid","c":["review"],"n":1}]},
 {"slug":"g3-reading-thinking","t":"قراءة وتفكير – الصف الثالث","lv":"g3","dom":"arabic","sk":["قراءة وفهم","التفكير الناقد","التعبير"],"s":"قراءة وفهم مع قصة تفكير وأنشطة لغوية.","src":[{"s":"lib","sec":["stories"],"n":1},{"s":"stories","c":["thinking"],"n":1},{"s":"bank","c":["arabic"],"n":3,"o":12},{"s":"proj","c":["think"],"n":1},{"s":"val","c":["chal"],"n":2}]},
 {"slug":"g3-explore-world","t":"أكتشف العالم – الصف الثالث","lv":"g3","dom":"science","sk":["الملاحظة العلمية","الاختراعات","المعرفة العامة"],"s":"استكشاف علمي ومعرفة عامة ومشروع بيئي.","src":[{"s":"vid","c":["science","living"],"n":1},{"s":"exp","c":["space","earth","invent","places"],"n":4},{"s":"bank","c":["science"],"n":2,"o":9},{"s":"proj","c":["nature"],"n":1}]},
 {"slug":"g4-math","t":"رياضيات ممتعة – الصف الرابع","lv":"g4","dom":"math","sk":["الضرب والقسمة","الكسور","حل المسائل"],"s":"عمليات وكسور وتدريبات متدرجة للصف الرابع.","src":[{"s":"lib","sec":["math"],"n":4},{"s":"vid","c":["review"],"n":1}]},
 {"slug":"g4-reading-thinking","t":"قراءة وتفكير – الصف الرابع","lv":"g4","dom":"arabic","sk":["قراءة وفهم","التفكير","التعبير"],"s":"قراءة وفهم وتفكير وتحديات قيمية.","src":[{"s":"lib","sec":["stories"],"n":1},{"s":"stories","c":["thinking"],"n":1},{"s":"bank","c":["arabic"],"n":3,"o":15},{"s":"val","c":["chal"],"n":2}]},
 {"slug":"g4-explore-world","t":"أكتشف العالم – الصف الرابع","lv":"g4","dom":"science","sk":["الملاحظة العلمية","الاختراعات","المعرفة العامة"],"s":"استكشاف علمي ومعرفة عامة ومشروع بيئي.","src":[{"s":"vid","c":["science","living"],"n":1},{"s":"exp","c":["space","earth","invent","culture"],"n":4},{"s":"bank","c":["science"],"n":2,"o":12},{"s":"proj","c":["nature"],"n":1}]}
  ]$J$::jsonb;
  tbls jsonb := '{"bank":"bank_items","proj":"proj_items","life":"life_items","ready":"ready_items","val":"val_items","exp":"exp_items","vid":"video_items","songs":"song_items","stories":"stories","quiz":"qz_quizzes"}';
  rank jsonb := '{"vid":1,"stories":2,"songs":3,"exp":4,"life":4,"val":4,"ready":4,"bank":5,"proj":6,"lib":7,"quiz":9}';
  covers jsonb := '{"arabic":"images/zad/i_book.webp","math":"images/zad/i_numbers.webp","english":"images/zad/i_globe.webp","science":"images/zad/i_microscope.webp","thinking":"images/zad/i_brain.webp","life":"images/zad/i_home.webp","values":"images/zad/i_heart.webp","arts":"images/zad/i_palette.webp"}';
begin
  for d in select * from jsonb_array_elements(defs) loop
    lv := d->>'lv'; keys := '{}';
    for sp in select * from jsonb_array_elements(d->'src') loop
      if sp->>'s' = 'lib' then
        for k in select 'lib:'||coalesce(nullif(slug,''),id::text) from public.products
          where is_visible and lib_status='published' and lib_section = any(array(select jsonb_array_elements_text(sp->'sec'))) and lib_levels @> array[lv]
          order by price asc, created_at, slug offset coalesce((sp->>'o')::int,0) limit (sp->>'n')::int loop keys := keys || k; end loop;
      else
        tb := tbls->>(sp->>'s');
        for k in execute format('select %L||%L||slug from public.%I where status=%L and levels @> array[%L] %s order by sort_order, slug offset %s limit %s',
          sp->>'s', ':', tb, 'published', lv,
          case when sp ? 'c' then format('and %I = any(%L)', case when sp->>'s'='stories' then 'topic' else 'cat' end, array(select jsonb_array_elements_text(sp->'c'))) else '' end,
          coalesce(sp->>'o','0'), sp->>'n') loop keys := keys || k; end loop;
      end if;
    end loop;
    keys := array(select distinct x from unnest(keys) x);
    continue when coalesce(array_length(keys,1),0) < 4;
    sort_i := sort_i + 10;
    insert into public.packs(slug,title,summary,cover,levels,dom,skills,status,sort_order)
      values (d->>'slug', d->>'t', d->>'s', covers->>(d->>'dom'), array[lv], d->>'dom', array(select jsonb_array_elements_text(d->'sk')), 'published', sort_i)
      on conflict (slug) do nothing returning id into pid;
    continue when pid is null;
    i := 0;
    for k in select x from unnest(keys) x order by coalesce((rank->>split_part(x,':',1))::int,5), x loop
      i := i + 1; insert into public.pack_items(pack_id,key,pos) values (pid,k,i);
    end loop;
  end loop;
end $$;
