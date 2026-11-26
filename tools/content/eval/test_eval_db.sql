do $t$
declare uid uuid; res text := ''; cid uuid[]; eid uuid; pj record; n int; j jsonb;
begin
 select id into uid from admin_users limit 1;
 perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role','authenticated')::text, true);
 perform set_config('request.jwt.claim.sub', uid::text, true);
 select * into pj from proj_items where kind='project' and status='published' and levels && array['g1'] and levels @> array['g1','g2'] limit 1;
 if pj.slug is null then select * into pj from proj_items where kind='project' and status='published' limit 1; end if;
 res := res || 'proj=' || pj.slug || ' lv=' || pj.levels::text || E'\n';
 select array_agg(id order by created_at) into cid from eval_criteria;
 -- 1 bad words rejected
 begin perform evalc_save('{"young":"درجة عالية","pre":"ابي","kid":"عبارة سليمة"}'::jsonb); res := res || 'FAIL1 ' || E'\n'; exception when others then res := res || 'ok1 ' || left(sqlerrm,40) || E'\n'; end;
 begin perform evalc_save('{"young":"نجح الطفل","pre":"أنت ضعيف في هذا","kid":"عبارة سليمة"}'::jsonb); res := res || 'FAIL2' || E'\n'; exception when others then res := res || 'ok2 ' || left(sqlerrm,40) || E'\n'; end;
 -- 2 good criterion save, edit
 declare nid uuid; begin
  nid := evalc_save('{"std":"skill","young":"جرّب بمساعدتك","pre":"جرّبت المهارة","kid":"طبّقت المهارة بنفسي"}'::jsonb);
  select count(*) into n from eval_criteria where id=nid and status='draft'; res := res || 'ok3 new draft=' || n || E'\n';
  perform evalc_delete(nid); select count(*) into n from eval_criteria where id=nid; res := res || 'ok4 deleted left=' || n || E'\n';
 end;
 -- 3 eval save validations
 j := jsonb_build_object('project', pj.slug, 'name','تقييم تجريبي','levels', to_jsonb(pj.levels[1:1]), 'criteria', jsonb_build_array(jsonb_build_object('id',cid[1]::text,'stage',''),jsonb_build_object('id',cid[2]::text,'stage','')),
   'closing', '{"kid":"ما الشيء الذي تعلمته؟"}'::jsonb, 'msgs', '{"done":["أحسنت! لقد تعلمت شيئا جديدا"],"help":["عمل رائع، راجع خطوة واحدة"],"retry":["كل محاولة تساعدك على التعلم"]}'::jsonb);
 eid := eval_save(j); res := res || 'ok5 saved draft' || E'\n';
 begin perform eval_save(j); res := res || 'FAIL6 dup' || E'\n'; exception when others then res := res || 'ok6 dup ' || left(sqlerrm,30) || E'\n'; end;
 begin perform eval_save(j || '{"msgs":{"done":["أنت فاشل"]}}'::jsonb || jsonb_build_object('id',eid)); res := res || 'FAIL7' || E'\n'; exception when others then res := res || 'ok7 neg msg' || E'\n'; end;
 begin perform eval_save(j || jsonb_build_object('id',eid,'levels','["g9"]'::jsonb)); res := res || 'FAIL8' || E'\n'; exception when others then res := res || 'ok8 level' || E'\n'; end;
 begin perform eval_save(j || jsonb_build_object('id',eid,'levels','["a2"]'::jsonb)); res := res || 'FAIL9' || E'\n'; exception when others then res := res || 'ok9 outside project levels' || E'\n'; end;
 begin perform eval_save(j || jsonb_build_object('id',eid,'criteria',(select jsonb_agg(jsonb_build_object('id',x::text)) from unnest(cid) x))); res := res || 'ok10 8 criteria for grades allowed' || E'\n'; exception when others then res := res || 'FAIL10 ' || sqlerrm || E'\n'; end;
 -- 4 not public while draft
 select jsonb_array_length(eval_public()->'items') into n; res := res || 'public before=' || n || E'\n';
 -- 5 publish rule: criteria draft -> refuse
 begin perform eval_status(eid,'active'); res := res || 'FAIL11' || E'\n'; exception when others then res := res || 'ok11 ' || left(sqlerrm,40) || E'\n'; end;
 update eval_criteria set status='active' where id = any(cid);
 perform eval_status(eid,'active');
 select jsonb_array_length(eval_public()->'items') into n; res := res || 'public after=' || n || E'\n';
 select jsonb_array_length(eval_public()->'items'->0->'criteria') into n; res := res || 'criteria in public=' || n || E'\n';
 res := res || 'public keys=' || (select string_agg(k,',') from jsonb_object_keys(eval_public()->'items'->0) k) || E'\n';
 -- 6 no personal data/ids leaked: updated_by absent
 res := res || 'leak updated_by=' || (eval_public()::text like '%updated_by%') || E'\n';
 -- 7 hide
 perform eval_status(eid,'hidden'); select jsonb_array_length(eval_public()->'items') into n; res := res || 'public hidden=' || n || E'\n';
 -- 8 criterion used cannot delete
 begin perform evalc_delete(cid[1]); res := res || 'FAIL12' || E'\n'; exception when others then res := res || 'ok12 in use' || E'\n'; end;
 -- 9 admin view
 res := res || 'admin criteria=' || jsonb_array_length(eval_admin()->'criteria') || ' projects=' || jsonb_array_length(eval_admin()->'projects') || E'\n';
 -- 10 anon blocked
 perform set_config('request.jwt.claims','{}',true); perform set_config('request.jwt.claim.sub','',true);
 begin perform eval_admin(); res := res || 'FAIL13' || E'\n'; exception when others then res := res || 'ok13 anon denied' || E'\n'; end;
 raise exception 'RESULT:%', E'\n' || res;
end $t$;
