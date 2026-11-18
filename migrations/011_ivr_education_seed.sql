-- migrations/011_ivr_education_seed.sql
-- Adds minimal approved IVR education and nutrition content in English and Kinyarwanda.
-- All content is generic maternal health guidance. Requires clinical review before deployment.
-- Reversible: DELETE FROM tbl_education_content WHERE created_by IS NULL AND category IN ('pregnancy','danger_signs','anc');
--             DELETE FROM tbl_nutrition_content WHERE created_by IS NULL;

INSERT IGNORE INTO tbl_education_content (title, content_body, category, trimester, language, is_active) VALUES

-- English · Trimester 1
('First Trimester: What to Expect',
 'Weeks 1–12. Your baby''s major organs begin forming. You may feel nausea, fatigue, and breast tenderness. Take folic acid daily. Attend your first ANC visit as early as possible.',
 'pregnancy', '1', 'en', 1),

('First Trimester: Danger Signs',
 'Seek care immediately if you have heavy bleeding, severe abdominal pain, high fever, or fainting. Do not wait — go to the nearest health facility.',
 'danger_signs', '1', 'en', 1),

-- English · Trimester 2
('Second Trimester: What to Expect',
 'Weeks 13–26. Nausea usually improves. You will begin to feel the baby move around week 18–20. Attend your scheduled ANC visits. Monitor blood pressure.',
 'pregnancy', '2', 'en', 1),

('Second Trimester: Danger Signs',
 'Seek care immediately for severe headache, blurred vision, swelling of face or hands, reduced baby movement, or any bleeding.',
 'danger_signs', '2', 'en', 1),

-- English · Trimester 3
('Third Trimester: What to Expect',
 'Weeks 27–40. Your baby grows rapidly. Prepare your birth plan and know your nearest health facility. Attend all ANC visits. Rest and monitor baby movements daily.',
 'pregnancy', '3', 'en', 1),

('Third Trimester: Danger Signs',
 'Go to a health facility immediately for heavy bleeding, severe abdominal pain, no baby movement for several hours, severe headache, or difficulty breathing.',
 'danger_signs', '3', 'en', 1),

-- English · General
('ANC Visits: Why They Matter',
 'Antenatal care visits help detect problems early. You should have at least 8 ANC contacts during pregnancy. Bring your health card to every visit.',
 'anc', 'all', 'en', 1),

('Pregnancy Warning Signs',
 'Always seek immediate care for: heavy bleeding, severe headache, blurred vision, convulsions, difficulty breathing, high fever, or no baby movement. These are emergencies.',
 'danger_signs', 'all', 'en', 1),

-- Kinyarwanda · Trimester 1
('Igihembwe cya mbere: Ibyo gutegereza',
 'Indwi 1–12. Ingingo z''umwana zitangira gushingwa. Ushobora kumva isesemi, umunaniro, n''ububabare bw''amabere. Fata acide folique buri munsi. Genda kwisuzumisha vuba.',
 'pregnancy', '1', 'rw', 1),

('Igihembwe cya mbere: Ibimenyetso by''akaga',
 'Hita ushaka ubufasha niba ufite: amaraso menshi, ububabare bukabije mu nda, umuriro mwinshi, cyangwa guhindukira. Ntutegereze — genda ku kigo nderabuzima hafi.',
 'danger_signs', '1', 'rw', 1),

-- Kinyarwanda · Trimester 2
('Igihembwe cya kabiri: Ibyo gutegereza',
 'Indwi 13–26. Isesemi ikunze gukira. Uzatangira kumva umwana anyeganyeza hagati y''indwi 18–20. Genda kwisuzumisha nk''uko byateganyijwe. Genzura umuvuduko w''amaraso.',
 'pregnancy', '2', 'rw', 1),

('Igihembwe cya kabiri: Ibimenyetso by''akaga',
 'Hita ushaka ubufasha niba ufite: umutwe uribwa cyane, kutabona neza, kubyimba mu maso cyangwa mu ntoki, umwana ataginyeganyeza, cyangwa amaraso.',
 'danger_signs', '2', 'rw', 1),

-- Kinyarwanda · Trimester 3
('Igihembwe cya gatatu: Ibyo gutegereza',
 'Indwi 27–40. Umwana akura vuba. Tegura gahunda yo kubyarira no kumenya ikigo nderabuzima hafi. Genda kwisuzumisha buri gihe. Ruhuka kandi ugenzure inyeganyeza z''umwana buri munsi.',
 'pregnancy', '3', 'rw', 1),

('Igihembwe cya gatatu: Ibimenyetso by''akaga',
 'Genda vuba ku kigo nderabuzima niba ufite: amaraso menshi, ububabare bukabije mu nda, umwana ataginyeganyeza amasaha menshi, umutwe uribwa cyane, cyangwa guhumeka bigoranye.',
 'danger_signs', '3', 'rw', 1),

-- Kinyarwanda · General
('Kwisuzumisha inda: Impamvu bifite akamaro',
 'Kwisuzumisha inda bigufasha kumenya ibibazo vuba. Ugomba kwisuzumisha inshuro 8 nibura mu gihe cyo gutwita. Zana ikarita y''ubuzima buri gihe.',
 'anc', 'all', 'rw', 1),

('Ibimenyetso by''akaga mu gutwita',
 'Hita ushaka ubufasha niba ufite: amaraso menshi, umutwe uribwa cyane, kutabona neza, igicuri, guhumeka bigoranye, umuriro mwinshi, cyangwa umwana ataginyeganyeza. Izi ni impanuka.',
 'danger_signs', 'all', 'rw', 1);


INSERT IGNORE INTO tbl_nutrition_content (title, content_body, trimester, content_type, language, is_active) VALUES

-- English
('Nutrition in Pregnancy: Key Foods',
 'Eat a variety of foods including vegetables, fruits, beans, eggs, and dairy. Iron-rich foods like dark leafy greens and meat help prevent anaemia. Drink clean water throughout the day.',
 'all', 'general', 'en', 1),

('First Trimester Nutrition',
 'Take folic acid supplements to prevent birth defects. Eat small frequent meals to manage nausea. Avoid alcohol, raw meat, and unpasteurised dairy.',
 '1', 'general', 'en', 1),

('Second Trimester Nutrition',
 'Increase iron and calcium intake. Eat beans, lentils, milk, and fortified foods. Your baby''s bones are developing — calcium is essential.',
 '2', 'general', 'en', 1),

('Third Trimester Nutrition',
 'Eat protein-rich foods to support baby''s growth. Continue iron and folic acid supplements. Avoid large meals before bed. Stay hydrated.',
 '3', 'general', 'en', 1),

-- Kinyarwanda
('Imirire mu gihe cyo gutwita: Ibiryo by''ingenzi',
 'Rya ibiryo bitandukanye harimo imboga, imbuto, ibishyimbo, amagi, n''amata. Ibiryo birimo icyuma nk''imboga z''icyatsi gikijije bigufasha kwirinda indwara y''amaraso macye. Nywa amazi meza buri munsi.',
 'all', 'general', 'rw', 1),

('Imirire mu gihembwe cya mbere',
 'Fata imiti ya acide folique kugirango wirinde indwara z''inzira z''inda. Rya kenshi ariko bike kugirango ugabanya isesemi. Irinde inzoga, inyama zitabitse, n''amata adatetse.',
 '1', 'general', 'rw', 1),

('Imirire mu gihembwe cya kabiri',
 'Ongerera icyuma na calcium mu mirire yawe. Rya ibishyimbo, amata, n''ibiryo byongewemo intungamubiri. Amagufwa y''umwana akura — calcium ni ngombwa.',
 '2', 'general', 'rw', 1),

('Imirire mu gihembwe cya gatatu',
 'Rya ibiryo birimo poroteyine nyinshi kugirango umwana akure neza. Komeza gufata imiti ya icyuma na acide folique. Irinde kurya byinshi mbere yo kuryama. Nywa amazi ahagije.',
 '3', 'general', 'rw', 1);
