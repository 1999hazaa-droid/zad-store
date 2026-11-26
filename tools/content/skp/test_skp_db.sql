do $t$
declare uid uuid; res text := ''; n int; j jsonb; lid uuid; sid uuid; sid2 uuid; l2 uuid; l3 uuid; l4 uuid; x text;
begin
 select id into uid from admin_users limit 1;
 perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role','authenticated')::text, true);
 perform set_config('request.jwt.claim.sub', uid::text, true);
 select id into sid from skills where slug='m-count'; select id into sid2 from skills where slug='m-multdiv';
 -- 1 رفض عبارات الإتقان/الدرجات
 begin perform skp_info_save(jsonb_build_object('skill',sid,'goal','يتقن الطفل العد تمامًا','goal_kid','أعد الأشياء','examples','[]'::jsonb)); res := res||'FAIL1 '; exception when others then res := res||'ok1 '; end;
 begin perform skp_info_save(jsonb_build_object('skill',sid,'goal','يعد الطفل الأشياء ويعرف عددها','goal_kid','أعد الأشياء','examples','["احصل على درجة عالية"]'::jsonb)); res := res||'FAIL2 '; exception when others then res := res||'ok2 '; end;
 begin perform skp_info_save(jsonb_build_object('skill',sid,'goal','قصير','goal_kid','أعد الأشياء')); res := res||'FAIL3 '; exception when others then res := res||'ok3 '; end;
 begin perform skp_info_save(jsonb_build_object('skill',sid,'goal','يعد الطفل الأشياء ويعرف عددها','goal_kid','أعد الأشياء','min_proj',9)); res := res||'FAIL4 '; exception when others then res := res||'ok4 '; end;
 -- 2 تحديث معلومات المهارة يبقيها مسودة
 perform skp_info_save(jsonb_build_object('skill',sid,'goal','يعد الطفل الأشياء ويعرف عددها','goal_kid','أعد الأشياء','examples','["يعد الأشكال"]'::jsonb,'min_proj',3));
 select count(*) into n from skill_info where skill_id=sid and status='draft' and min_proj=3; res := res||'ok5 draft='||n||' ';
 -- 3 قبل النشر لا يظهر شيء
 j := skp_public(); res := res||'pub0='||jsonb_array_length(j->'skills')||' ';
 -- 4 ربط: مشروع غير موجود / مهارة لا تتقاطع أعمارها
 begin perform skp_link_save('{"project":"nope","skill":"x","role":"main","goal":"هدف قصير"}'::jsonb); res := res||'FAIL6 '; exception when others then res := res||'ok6 '; end;
 begin perform skp_link_save(jsonb_build_object('project','pj_lif04','skill',sid2,'role','main','goal','هدف الربط هنا')); res := res||'FAIL7 '; exception when others then res := res||'ok7 nonoverlap '; end;
 -- 5 ربط صحيح + تكرار + حدود
 lid := skp_link_save(jsonb_build_object('project','pj_mat01','skill',sid,'role','main','goal','يعد الأشياء في اللوحة'));
 select count(*) into n from proj_skills where id=lid and status='draft'; res := res||'ok8 draft='||n||' ';
 begin perform skp_link_save(jsonb_build_object('project','pj_mat01','skill',sid,'role','support','goal','هدف الربط هنا')); res := res||'FAIL9 '; exception when others then res := res||'ok9 dup '; end;
 begin perform skp_link_save(jsonb_build_object('project','pj_mat01','skill',(select id from skills where slug='m-compare'),'role','support','goal','يقارن أعدادًا ويتقن المقارنة')); res := res||'FAIL10 '; exception when others then res := res||'ok10 mastery word '; end;
 -- 6 نشر الربط قبل نشر المهارة مرفوض
 begin perform skp_link_status(lid,'active'); res := res||'FAIL11 '; exception when others then res := res||'ok11 need skill '; end;
 perform skp_info_status(sid,'active'); perform skp_link_status(lid,'active');
 j := skp_public();
 select count(*) into n from jsonb_array_elements(j->'skills') s where s->>'slug'='m-count'; res := res||'pubskill='||n||' ';
 select count(*) into n from jsonb_array_elements(j->'plinks') s where s->>'p'='pj_mat01' and s->>'r'='main'; res := res||'publink='||n||' ';
 select count(*) into n from jsonb_array_elements(j->'projects') s where s->>'slug'='pj_mat01'; res := res||'pubproj='||n||' ';
 select count(*) into n from jsonb_array_elements(j->'skills') s where (s->'levels') ?| array['g5','g6','g7','g8']; res := res||'above_g4='||n||' ';
 select count(*) into n from jsonb_array_elements(j->'links') l where (l->>'s')::uuid<>sid; res := res||'links_other_skills='||n||' ';
 -- 7 skp_project
 select jsonb_array_length(skp_project('pj_mat01')) into n; res := res||'proj_skills='||n||' ';
 select skp_project('pj_mat01')->0->>'role' into x; res := res||'role='||x||' ';
 -- 8 مسودة أخرى لا تظهر
 l2 := skp_link_save(jsonb_build_object('project','pj_mat01','skill',(select id from skills where slug='m-number-recog'),'role','support','goal','يتعرف على الأرقام'));
 select jsonb_array_length(skp_project('pj_mat01')) into n; res := res||'draft_hidden='||n||' ';
 -- 9 إخفاء المهارة يخفي الرابط
 perform skp_info_status(sid,'hidden'); select jsonb_array_length(skp_project('pj_mat01')) into n; res := res||'hidden_skill='||n||' ';
 select count(*) into n from jsonb_array_elements(skp_public()->'plinks'); res := res||'plinks_after_hide='||n||' ';
 -- 10 حد 3 أساسية و6 إجمالًا
 perform skp_info_status(sid,'active');
 l3 := skp_link_save(jsonb_build_object('project','pj_mat01','skill',(select id from skills where slug='m-shapes'),'role','main','goal','يميز الأشكال هنا'));
 l4 := skp_link_save(jsonb_build_object('project','pj_mat01','skill',(select id from skills where slug='m-patterns'),'role','main','goal','يكتشف نمطًا هنا'));
 begin perform skp_link_save(jsonb_build_object('project','pj_mat01','skill',(select id from skills where slug='m-compare'),'role','main','goal','يقارن بين الأعداد')); res := res||'FAIL12 '; exception when others then res := res||'ok12 max3main '; end;
 -- 11 حذف
 perform skp_link_delete(l2); select count(*) into n from proj_skills where id=l2; res := res||'deleted_left='||n||' ';
 -- 12 الصلاحيات
 res := res||'anon_pub='||has_function_privilege('anon','public.skp_public()','execute')||' anon_admin='||has_function_privilege('anon','public.skp_admin()','execute')||' anon_save='||has_function_privilege('anon','public.skp_link_save(jsonb)','execute')||' auth_admin='||has_function_privilege('authenticated','public.skp_admin()','execute')||' ';
 select count(*) into n from pg_class where relname in ('skill_info','proj_skills') and relrowsecurity; res := res||'rls='||n;
 raise exception 'RESULT:%', res;
end $t$;
