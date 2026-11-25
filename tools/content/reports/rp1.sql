create table if not exists public.rp_config(
 slug text primary key, kind text not null check (kind in ('domain','indicator','reco')), title text not null,
 data jsonb not null default '{}'::jsonb, status text not null default 'active' check (status in ('active','off')),
 sort_order int not null default 0, updated_at timestamptz not null default now());
create table if not exists public.rp_stats(id bigserial primary key, kind text not null check (kind in ('week','month','custom','print')), level text, created_at timestamptz not null default now());
alter table public.rp_config enable row level security; alter table public.rp_stats enable row level security;
drop policy if exists rp_config_read on public.rp_config; create policy rp_config_read on public.rp_config for select to anon, authenticated using (status='active');
drop policy if exists rp_config_admin on public.rp_config; create policy rp_config_admin on public.rp_config for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists rp_stats_ins on public.rp_stats; create policy rp_stats_ins on public.rp_stats for insert to anon, authenticated with check (kind in ('week','month','custom','print') and (level is null or length(level)<=3));
drop policy if exists rp_stats_admin on public.rp_stats; create policy rp_stats_admin on public.rp_stats for select to authenticated using (public.is_admin());
revoke all on public.rp_stats from anon, authenticated; grant insert on public.rp_stats to anon, authenticated; grant select on public.rp_stats to authenticated;
grant usage, select on sequence public.rp_stats_id_seq to anon, authenticated;
revoke all on public.rp_config from anon; grant select on public.rp_config to anon;
insert into public.rp_config (slug,kind,title,data,status,sort_order) values
('arabic','domain','اللغة العربية','{"quiz": ["arabic"], "src": ["stories:arabic"], "words": ["حرف", "حروف", "كلمة", "كلمات", "قراءة", "كتابة", "إملاء", "جملة", "جمل", "مفردات", "الأضداد", "الفتحة", "اللام", "الهجائية", "القصة", "ترديد", "الإنصات", "الاستماع", "الحفظ", "الآيات", "الأدعية"], "icon": "🔤"}'::jsonb,'active',1),
('math','domain','الرياضيات','{"quiz": ["math"], "src": [], "words": ["رياض", "عد", "العدّ", "أعداد", "الأعداد", "رقم", "الأرقام", "جمع", "طرح", "ضرب", "قسمة", "القسمة", "مقارنة", "أشكال", "الأشكال", "هندس", "الساعة", "الكسور", "النقود", "قياس", "الأطوال", "الأحجام", "الأيام"], "icon": "🔢"}'::jsonb,'active',2),
('english','domain','اللغة الإنجليزية','{"quiz": ["english"], "src": ["stories:english"], "words": ["english", "إنجليز", "الإنجليزية", "spelling", "words", "letters", "greetings", "colors", "numbers", "animals", "fruits"], "icon": "🔠"}'::jsonb,'active',3),
('science','domain','العلوم والمعرفة العامة','{"quiz": ["science"], "src": ["exp", "stories:science", "stories:animals"], "words": ["علوم", "علمية", "نبات", "حيوان", "الحيوانات", "كائنات", "الحواس", "طقس", "الفصول", "كواكب", "الشمس", "القمر", "بيئة", "الماء", "مواد", "ظواهر", "تجربة", "تجارب", "جسم", "معرفة"], "icon": "🔬"}'::jsonb,'active',4),
('thinking','domain','مهارات التفكير والتعلم المبكر','{"quiz": ["early"], "src": ["ready", "dig", "stories:thinking"], "words": ["تفكير", "ذاكرة", "تركيز", "انتباه", "ملاحظة", "نمط", "أنماط", "تصنيف", "ألغاز", "اكتشاف", "استعداد", "تسلسل", "ترتيب", "مطابقة", "الاستنتاج", "التذكر"], "icon": "🧩"}'::jsonb,'active',5),
('life','domain','المهارات الحياتية','{"quiz": [], "src": ["life"], "words": ["حياتية", "الحياة اليومية", "نظافة", "النظافة", "غسل", "أسنان", "وقت", "تنظيم", "المسؤولية", "الاعتماد على النفس", "عبور الطريق", "السلامة", "الطعام الصحي", "العادات", "الملابس", "النفايات"], "icon": "🧼"}'::jsonb,'active',6),
('values','domain','القيم والسلوك الإيجابي','{"quiz": ["values"], "src": ["val", "stories:values"], "words": ["قيم", "القيم", "سلوك", "تعاون", "احترام", "صدق", "الصدق", "مشاعر", "الشكر", "أدب", "الخلافات"], "icon": "🤝"}'::jsonb,'active',7),
('arts','domain','الفنون والإبداع','{"quiz": [], "src": ["songs"], "words": ["فن", "الفنون", "إبداع", "الإبداع", "تلوين", "التلوين", "رسم", "الرسم", "ألوان", "الألوان", "قص", "الأشغال", "خيال", "تصميم", "مجسم"], "icon": "🎨"}'::jsonb,'active',8),
('rule_complete','indicator','شروط احتساب النشاط المكتمل','{"gameStars": 1, "quizMinQ": 3, "note": "تُحتسب اللعبة إن نالت نجمة واحدة على الأقل، والاختبار إن أُجيب فيه عن ٣ أسئلة على الأقل."}'::jsonb,'active',20),
('ind_retrain','indicator','مؤشر: عدد مرات إعادة التدريب','{"note": "عدد مرات إعادة اختبار سبق إكماله."}'::jsonb,'active',21),
('ind_progress','indicator','مؤشر: مهارة أظهرت تقدمًا','{"minGain": 1, "note": "تحسن نتيجة اختبار بين أول محاولة وآخر محاولة في الفترة."}'::jsonb,'active',22),
('ind_need','indicator','مؤشر: مهارة تحتاج مزيدًا من التدريب','{"minAns": 3, "rate": 0.6, "note": "أجاب عن ٣ أسئلة على الأقل في المهارة وكانت الإجابات الصحيحة أقل من ٦ من كل ١٠."}'::jsonb,'active',23),
('ind_chart','indicator','مؤشر: الرسم البياني اليومي','{"note": "أعمدة عدد الإنجازات في كل يوم."}'::jsonb,'active',24),
('reco_low_skill','reco','أعد اختبار «{title}»، فقد أجبت فيه عن بع','{"type": "low_skill", "text": "أعد اختبار «{title}»، فقد أجبت فيه عن بعض الأسئلة بصورة غير كاملة وأفضل نتيجة سابقة {best} من {tot}."}'::jsonb,'active',40),
('reco_retrain','reco','أعد النشاط «{title}» الذي أتممته سابقًا،','{"type": "retrain", "text": "أعد النشاط «{title}» الذي أتممته سابقًا، فلم يتدرب الطفل على مجال «{domain}» في هذه الفترة."}'::jsonb,'active',41),
('reco_story','reco','اقرأ القصة «{title}»، فهي مناسبة لمستوى ','{"type": "story", "text": "اقرأ القصة «{title}»، فهي مناسبة لمستوى الطفل ولم يقرأها بعد."}'::jsonb,'active',42),
('reco_worksheet','reco','جرّب النشاط «{title}»، فهو مناسب لمستوى ','{"type": "worksheet", "text": "جرّب النشاط «{title}»، فهو مناسب لمستوى الطفل في مجال «{domain}»."}'::jsonb,'active',43),
('reco_empty','reco','لم يبدأ الطفل مجال «{domain}» بعد. ابدأ ','{"type": "empty", "text": "لم يبدأ الطفل مجال «{domain}» بعد. ابدأ بـ «{title}»."}'::jsonb,'active',44),
('reco_quiz','reco','جرّب الاختبار «{title}»، فلم يشارك الطفل','{"type": "quiz", "text": "جرّب الاختبار «{title}»، فلم يشارك الطفل في اختبار خلال هذه الفترة."}'::jsonb,'active',45)
on conflict (slug) do nothing;
