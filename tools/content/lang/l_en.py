# -*- coding: utf-8 -*-
from lcommon import *
import lcommon
# ===== Sentence order =====
ORD('en-o01', 'en', 'Put the words in order: I like apples', '1f34e', T1b, ['I', 'like', 'apples'], 10)
ORD('en-o02', 'en', 'Put the words in order: This is my cat', '1f431', T1b, ['This', 'is', 'my', 'cat'], 11)
ORD('en-o03', 'en', 'Put the words in order: The sun is hot', '2600', T1b, ['The', 'sun', 'is', 'hot'], 12)
ORD('en-o04', 'en', 'Put the words in order: I have a red ball', '26bd', T2, ['I', 'have', 'a', 'red', 'ball'], 20)
ORD('en-o05', 'en', 'Put the words in order: She is my sister', '1f469', T2, ['She', 'is', 'my', 'sister'], 21)
ORD('en-o06', 'en', 'Put the words in order: We go to school', '1f392', T2, ['We', 'go', 'to', 'school'], 22)
ORD('en-o07', 'en', 'Put the words in order: The bird can fly', '1f426', T2, ['The', 'bird', 'can', 'fly'], 23)
ORD('en-o08', 'en', 'Put the words in order: He likes to play football', '26bd', T2, ['He', 'likes', 'to', 'play', 'football'], 24)
ORD('en-o09', 'en', 'Put the words in order: They are playing in the park', 'x6_park', T3, ['They', 'are', 'playing', 'in', 'the', 'park'], 30)
ORD('en-o10', 'en', 'Put the words in order: My mother cooks dinner every day', '1f37d', T3, ['My', 'mother', 'cooks', 'dinner', 'every', 'day'], 31)
ORD('en-o11', 'en', 'Put the words in order: I can see a big tree', '1f333', T3, ['I', 'can', 'see', 'a', 'big', 'tree'], 32)
ORD('en-o12', 'en', 'Put the words in order: We eat breakfast at home', '1f35e', T3, ['We', 'eat', 'breakfast', 'at', 'home'], 33)
# ===== Fill: pronouns, verbs, words in context =====
FILL('en-f01', 'en', 'Choose the word: ___ am a student', '1f392', T2, '___ am a student.', ['I', 'He', 'They'], 0, 'الضمائر الأساسية', 40)
FILL('en-f02', 'en', 'Choose the word: ___ is my brother', '1f9d2', T2, '___ is my brother.', ['He', 'I', 'They'], 0, 'الضمائر الأساسية', 41)
FILL('en-f03', 'en', 'Choose the word: ___ is my sister', '1f469', T2, '___ is my sister.', ['She', 'He', 'We'], 0, 'الضمائر الأساسية', 42)
FILL('en-f04', 'en', 'Choose the word: ___ are friends', '1f604', T2, '___ are friends.', ['We', 'I', 'She'], 0, 'الضمائر الأساسية', 43)
FILL('en-f05', 'en', 'Choose the word: I ___ a book', '1f4d6', T2, 'I ___ a book.', ['read', 'drink', 'wear'], 0, 'الأفعال اليومية', 44)
FILL('en-f06', 'en', 'Choose the word: I ___ water', '1f4a7', T2, 'I ___ water.', ['drink', 'read', 'jump'], 0, 'الأفعال اليومية', 45)
FILL('en-f07', 'en', 'Choose the word: Birds can ___', '1f426', T1b, 'Birds can ___.', ['fly', 'drive', 'cook'], 0, 'الأفعال اليومية', 46)
FILL('en-f08', 'en', 'Choose the word: Fish live in the ___', '1f41f', T1b, 'Fish live in the ___.', ['water', 'tree', 'house'], 0, 'استخدام الكلمة في جملة', 47)
FILL('en-f09', 'en', 'Choose the word: I write with a ___', '270f', T1b, 'I write with a ___.', ['pencil', 'spoon', 'shoe'], 0, 'استخدام الكلمة في جملة', 48)
FILL('en-f10', 'en', 'Choose the word: She ___ a doctor', 'x_doctor', T3, 'She ___ a doctor.', ['is', 'am', 'are'], 0, 'تكوين الجمل البسيطة', 50)
FILL('en-f11', 'en', 'Choose the word: They ___ in the garden', 'x6_park', T3, 'They ___ in the garden.', ['are', 'is', 'am'], 0, 'تكوين الجمل البسيطة', 51)
FILL('en-f12', 'en', 'Choose the word: I ___ to school every day', '1f68c', T3, 'I ___ to school every day.', ['go', 'eat', 'sleep'], 0, 'الأفعال اليومية', 52)
FILL('en-f13', 'en', 'Choose the word: It is ___ in winter', '1f327', T3, 'It is ___ in winter.', ['cold', 'hot', 'soft'], 0, 'استخدام الكلمة في جملة', 53)
FILL('en-f14', 'en', 'Choose the word: We use a ___ to cut paper', 'i_scissors', T3, 'We use ___ to cut paper.', ['scissors', 'a spoon', 'a pillow'], 0, 'استخدام الكلمة في جملة', 54)
# ===== Reading =====
VOC = {'en-p01': [['puppy', 'جرو: كلب صغير'], ['bone', 'عظمة']], 'en-p02': [['garden', 'حديقة'], ['water', 'يسقي / ماء']], 'en-p03': [['brother', 'أخ'], ['ride', 'يركب'], ['bike', 'دراجة']], 'en-p04': [['rainy', 'ممطر'], ['umbrella', 'مظلة'], ['puddle', 'بركة ماء صغيرة']], 'en-p05': [['library', 'مكتبة'], ['borrow', 'يستعير'], ['return', 'يُرجع']], 'en-p06': [['sunny', 'مشمس'], ['picnic', 'نزهة وأكل في الخلاء'], ['sandwich', 'شطيرة']]}
def PAS(slug, lang, title, icon, levels, text, qs, events, sort): lcommon.PAS(slug, lang, title, icon, levels, text, VOC[slug], qs, events, sort)
PAS('en-p01', 'en', 'My puppy', '1f436', T2, 'I have a puppy. His name is Max. Max is brown. He likes his bone.', [['What is the puppy\'s name?', ['Max', 'Sam', 'Tom'], 0], ['What color is Max?', ['brown', 'red', 'blue'], 0], ['What does Max like?', ['his bone', 'his book', 'his cap'], 0]], None, 70)
PAS('en-p02', 'en', 'In the garden', '1f337', T2, 'Mona is in the garden. She has a small red flower. She waters the flower every day.', [['Where is Mona?', ['in the garden', 'in the school', 'in the car'], 0], ['What does Mona have?', ['a small red flower', 'a big blue ball', 'a yellow bird'], 0], ['When does she water the flower?', ['every day', 'on Friday only', 'at night only'], 0]], None, 71)
PAS('en-p03', 'en', 'My brother and his bike', '1f6b2', T3, 'My brother has a new bike. It is green and fast. Every Friday we ride our bikes in the park. I am happy when we ride together.', [['What color is the bike?', ['green', 'red', 'black'], 0], ['When do they ride bikes?', ['every Friday', 'every night', 'in the school'], 0], ['Where do they ride?', ['in the park', 'at the beach', 'at home'], 0]], ['My brother got a new bike', 'We ride in the park on Friday', 'I feel happy'], 72)
PAS('en-p04', 'en', 'A rainy day', '1f327', T3, 'It is a rainy day. Sara takes her yellow umbrella and walks to school. She sees a big puddle. She jumps over it and smiles.', [['What is the weather?', ['rainy', 'sunny', 'snowy'], 0], ['What color is Sara\'s umbrella?', ['yellow', 'pink', 'white'], 0], ['What does Sara do at the puddle?', ['jumps over it', 'drinks from it', 'runs away'], 0]], ['Sara takes her umbrella', 'Sara sees a big puddle', 'Sara jumps over the puddle'], 73)
PAS('en-p05', 'en', 'The new library', '1f4da', T3, 'Our school has a new library. There are many books about animals and space. Students can borrow one book for a week. Then they must return it.', [['What is new at the school?', ['the library', 'the playground', 'the bus'], 0], ['What are the books about?', ['animals and space', 'cars and trains', 'food and clothes'], 0], ['How long can students keep a book?', ['a week', 'a day', 'a year'], 0]], None, 74)
PAS('en-p06', 'en', 'A sunny picnic', '2600', T3, 'It is a sunny Saturday. Amir and his family go to the park for a picnic. They eat sandwiches and fruit. After lunch, Amir plays football with his father.', [['What day is the picnic?', ['Saturday', 'Monday', 'Friday'], 0], ['What do they eat?', ['sandwiches and fruit', 'pizza and cake', 'rice and fish'], 0], ['Who plays football with Amir?', ['his father', 'his teacher', 'his sister'], 0]], None, 75)
# ===== Opposites =====
OPP('en-opp1', 'en', 'Opposites: basic words', 'i_puzzle', T1b, [['big', 'small'], ['hot', 'cold'], ['up', 'down'], ['happy', 'sad'], ['day', 'night'], ['open', 'close']], 80)
OPP('en-opp2', 'en', 'Opposites: more words', 'i_puzzle', T2, [['fast', 'slow'], ['old', 'new'], ['tall', 'short'], ['hard', 'soft'], ['clean', 'dirty'], ['full', 'empty']], 81)
OPP('en-opp3', 'en', 'Opposites: advanced', 'i_puzzle', T3, [['easy', 'difficult'], ['early', 'late'], ['heavy', 'light'], ['strong', 'weak'], ['wide', 'narrow'], ['rich', 'poor']], 82)
# ===== Odd one out =====
ODD('en-odd1', 'en', 'Which word is different? (basic)', 'i_search', T1b, [(['cat', 'dog', 'apple', 'horse'], 2, 'apple is a fruit; the others are animals'), (['banana', 'orange', 'elephant', 'grapes'], 2, 'elephant is an animal; the others are fruits'), (['red', 'blue', 'green', 'book'], 3, 'book is not a color'), (['car', 'bus', 'train', 'chair'], 3, 'chair is not transportation')], 90)
ODD('en-odd2', 'en', 'Which word is different? (school and family)', 'i_search', T2, [(['pencil', 'book', 'ruler', 'pillow'], 3, 'pillow is not a school item'), (['mother', 'father', 'sister', 'table'], 3, 'table is not a family member'), (['doctor', 'teacher', 'farmer', 'bed'], 3, 'bed is not a job'), (['summer', 'winter', 'spring', 'Monday'], 3, 'Monday is a day; the others are seasons')], 91)
ODD('en-odd3', 'en', 'Which word is different? (advanced)', 'i_search', T3, [(['eagle', 'hawk', 'owl', 'fox'], 3, 'a fox cannot fly; the others are birds'), (['square', 'circle', 'triangle', 'window'], 3, 'window is not a shape'), (['mountain', 'river', 'sea', 'phone'], 3, 'phone is not part of nature'), (['run', 'jump', 'swim', 'blue'], 3, 'blue is not a verb')], 92)
# ===== Writing =====
WRT('en-w01', 'en', 'Write a sentence: the cat', '1f431', T2, 'Write a short sentence using these words', ['cat', 'black'], 100)
WRT('en-w02', 'en', 'Write a sentence: my school', '1f392', T2, 'Write a short sentence using these words', ['school', 'I', 'like'], 101)
WRT('en-w03', 'en', 'Write a sentence: the park', 'x6_park', T3, 'Write a sentence using these words', ['park', 'children', 'play'], 102)
WRT('en-w04', 'en', 'Write a sentence: my family', '1f468-1f469-1f467', T3, 'Write a sentence using these words', ['family', 'happy', 'home'], 103)
