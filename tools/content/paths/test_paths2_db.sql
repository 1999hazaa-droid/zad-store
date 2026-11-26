-- اختبار حقيقي على قاعدة البيانات لمرحلة المسارات الثانية. يُشغَّل عبر execute_sql وينتهي بـ raise exception لإلغاء كل تغيير.
do $$
declare uid uuid; pid uuid; gid uuid; cg uuid; ok int := 0; bad text := ''; r jsonb; msg text; n int; sk uuid; sk2 uuid; skfar uuid;
begin
  select id into uid from admin_users limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('role', 'authenticated', true);

  -- 1 مجال الإبداع مسموح، ومجال المعرفة مرفوض
  select id into cg from goals where slug = 'g-cr-draw';
  begin r := path_save(jsonb_build_object('goal_id', cg, 'name', 'مسار اختبار الرسم الصغير', 'levels', jsonb_build_array('a2'), 'diff', 'easy'));
    pid := (r->>'id')::uuid; if (select diff from paths where id = pid) = 'easy' and (select status from paths where id = pid) = 'draft' then ok := ok + 1; else bad := bad || ' [1a diff/draft]'; end if;
  exception when others then bad := bad || ' [1a ' || sqlerrm || ']'; end;
  begin perform path_save(jsonb_build_object('goal_id', (select id from goals where domain = 'cognitive' limit 1), 'name', 'مسار معرفي مرفوض', 'levels', jsonb_build_array('a4')));
    bad := bad || ' [1b cognitive accepted]'; exception when others then ok := ok + 1; end;
  begin perform path_save(jsonb_build_object('id', pid, 'goal_id', cg, 'name', 'مسار اختبار الرسم الصغير', 'levels', jsonb_build_array('a2'), 'diff', 'x'));
    bad := bad || ' [1c bad diff accepted]'; exception when others then ok := ok + 1; end;
  begin perform path_save(jsonb_build_object('goal_id', cg, 'name', 'مسار خارج النطاق', 'levels', jsonb_build_array('g5')));
    bad := bad || ' [1d g5 accepted]'; exception when others then ok := ok + 1; end;
  begin perform path_save(jsonb_build_object('goal_id', cg, 'name', 'مسار مجهول المستوى', 'levels', jsonb_build_array('a3'), 'status', 'active'));
    bad := bad || ' [1e active at create]'; exception when others then ok := ok + 1; end;

  -- 2 المراحل
  select id into sk from skills where slug = 'cr-draw'; select id into sk2 from skills where slug = 'cr-art';
  select id into skfar from skills where status = 'active' and not (levels && array['a2']) limit 1;
  begin perform path_stage_save(pid, 'practice', 'نرسم ونلوّن', 'نمسك القلم ونرسم خطوطًا.', sk); ok := ok + 1; exception when others then bad := bad || ' [2a ' || sqlerrm || ']'; end;
  begin perform path_stage_save(pid, 'practice', 'نرسم ونلوّن', 'حتى نتقن الرسم تمامًا', sk); bad := bad || ' [2b mastery accepted]'; exception when others then ok := ok + 1; end;
  begin perform path_stage_save(pid, 'practice', 'ا', 'x', sk); bad := bad || ' [2c short name]'; exception when others then ok := ok + 1; end;
  begin perform path_stage_save(pid, 'badstage', 'اسم', 'x', sk); bad := bad || ' [2d bad stage]'; exception when others then ok := ok + 1; end;
  if skfar is not null then begin perform path_stage_save(pid, 'apply', 'نطبق', 'x', skfar); bad := bad || ' [2e skill no overlap]'; exception when others then ok := ok + 1; end; else ok := ok + 1; end if;
  begin perform path_stage_save(pid, 'apply', 'نطبق ما تعلمناه', 'مشروع صغير.', null); ok := ok + 1; exception when others then bad := bad || ' [2f null skill ' || sqlerrm || ']'; end;
  select count(*) into n from path_stage_info where path_id = pid; if n = 2 then ok := ok + 1; else bad := bad || ' [2g count ' || n || ']'; end if;
  begin perform path_stage_save(pid, 'practice', 'نرسم ونلوّن', 'تعديل الشرح.', sk); select count(*) into n from path_stage_info where path_id = pid and stage = 'practice'; if n = 1 and (select expl from path_stage_info where path_id = pid and stage = 'practice') = 'تعديل الشرح.' then ok := ok + 1; else bad := bad || ' [2h upsert]'; end if; exception when others then bad := bad || ' [2h ' || sqlerrm || ']'; end;
  perform path_stage_clear(pid, 'apply'); select count(*) into n from path_stage_info where path_id = pid; if n = 1 then ok := ok + 1; else bad := bad || ' [2i clear]'; end if;

  -- 3 المهارات السابقة
  begin perform path_prior_save(pid, sk, ''); bad := bad || ' [3a own skill]'; exception when others then ok := ok + 1; end;
  begin perform path_prior_save(pid, sk2, 'يفيد قبل البدء'); ok := ok + 1; exception when others then bad := bad || ' [3b ' || sqlerrm || ']'; end;
  begin perform path_prior_save(pid, sk2, 'أفضل من غيره'); bad := bad || ' [3c comparison accepted]'; exception when others then ok := ok + 1; end;
  perform path_prior_save(pid, (select id from skills where slug = 'cr-form'), '');
  perform path_prior_save(pid, (select id from skills where slug = 'cr-design'), '');
  perform path_prior_save(pid, (select id from skills where slug = 'cr-ideas'), '');
  begin perform path_prior_save(pid, (select id from skills where slug = 'cr-story'), ''); bad := bad || ' [3d fifth accepted]'; exception when others then ok := ok + 1; end;
  perform path_prior_remove(pid, sk2); select count(*) into n from path_prior where path_id = pid; if n = 3 then ok := ok + 1; else bad := bad || ' [3e remove ' || n || ']'; end if;

  -- 4 الصعوبة
  perform path_diff_set(pid, 'hard'); if (select diff from paths where id = pid) = 'hard' then ok := ok + 1; else bad := bad || ' [4a]'; end if;
  perform path_diff_set(pid, null); if (select diff from paths where id = pid) is null then ok := ok + 1; else bad := bad || ' [4b]'; end if;
  begin perform path_diff_set(pid, 'impossible'); bad := bad || ' [4c]'; exception when others then ok := ok + 1; end;

  -- 5 paths_more للمنشور فقط
  perform path_diff_set(pid, 'mid');
  perform set_config('role', 'postgres', true);
  update paths set status = 'active' where id = pid;
  r := paths_more();
  if exists (select 1 from jsonb_array_elements(r) x where x->>'slug' = (select slug from paths where id = pid) and x->>'diff' = 'mid' and jsonb_array_length(x->'stages') = 1 and jsonb_array_length(x->'prior') = 3) then ok := ok + 1; else bad := bad || ' [5a paths_more content]'; end if;
  update paths set status = 'draft' where id = pid; r := paths_more();
  if not exists (select 1 from jsonb_array_elements(r) x where x->>'slug' = (select slug from paths where id = pid)) then ok := ok + 1; else bad := bad || ' [5b draft leaked]'; end if;

  -- 6 من ليس من الفريق لا يحرر
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  begin perform path_stage_save(pid, 'review', 'مراجعة', 'x', null); bad := bad || ' [6a stranger saved]'; exception when others then ok := ok + 1; end;
  begin perform path_diff_set(pid, 'easy'); bad := bad || ' [6b stranger diff]'; exception when others then ok := ok + 1; end;
  begin perform path_prior_save(pid, sk2, ''); bad := bad || ' [6c stranger prior]'; exception when others then ok := ok + 1; end;

  -- 7 الصلاحيات على مستوى الدوال والجداول
  if has_function_privilege('anon', 'paths_more()', 'execute') then ok := ok + 1; else bad := bad || ' [7a anon paths_more]'; end if;
  if not has_function_privilege('anon', 'path_stage_save(uuid,text,text,text,uuid)', 'execute') and not has_function_privilege('anon', 'path_prior_save(uuid,uuid,text)', 'execute') and not has_function_privilege('anon', 'path_diff_set(uuid,text)', 'execute') and not has_function_privilege('anon', 'path_save(jsonb,boolean)', 'execute') then ok := ok + 1; else bad := bad || ' [7b anon admin rpcs]'; end if;
  if not has_table_privilege('anon', 'path_stage_info', 'select') and not has_table_privilege('anon', 'path_prior', 'select') then ok := ok + 1; else bad := bad || ' [7c anon tables]'; end if;

  -- 8 حالة البيانات الحقيقية
  select count(*) into n from paths p join goals g on g.id = p.goal_id where g.domain = 'creative'; if n = 8 then ok := ok + 1; else bad := bad || ' [8a creative paths ' || n || ']'; end if;
  select count(*) into n from paths where diff is null; if n = 0 then ok := ok + 1; else bad := bad || ' [8b null diff ' || n || ']'; end if;
  select count(*) into n from paths where levels && array['g5','g6']; if n = 0 then ok := ok + 1; else bad := bad || ' [8c scope]'; end if;

  raise exception 'RESULT: ok=% bad=%', ok, coalesce(nullif(bad, ''), 'none');
end $$;
