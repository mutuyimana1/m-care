-- Migration 004: Add Kinyarwanda labels for the mother-facing symptom catalogue.
SET @symptom_rw_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_symptoms'
      AND column_name = 'symptom_name_rw'
);
SET @symptom_rw_sql = IF(
    @symptom_rw_exists = 0,
    'ALTER TABLE tbl_symptoms ADD COLUMN symptom_name_rw VARCHAR(120) NULL AFTER symptom_name',
    'SELECT 1'
);
PREPARE symptom_rw_stmt FROM @symptom_rw_sql;
EXECUTE symptom_rw_stmt;
DEALLOCATE PREPARE symptom_rw_stmt;

UPDATE tbl_symptoms SET symptom_name_rw=CASE symptom_name
    WHEN 'Severe headache' THEN 'Umutwe uribwa cyane'
    WHEN 'Blurred vision' THEN 'Kutabona neza'
    WHEN 'Swelling of face/hands/feet' THEN 'Kubyimba mu maso, mu ntoki cyangwa mu birenge'
    WHEN 'Vaginal bleeding' THEN 'Kuva amaraso mu gitsina'
    WHEN 'Severe abdominal pain' THEN 'Ububabare bukabije mu nda'
    WHEN 'Reduced fetal movement' THEN 'Kugabanuka kw’ingendo z’umwana uri mu nda'
    WHEN 'Fever' THEN 'Umuriro'
    WHEN 'Difficulty breathing' THEN 'Guhumeka bigoranye'
    WHEN 'Convulsions' THEN 'Gufatwa n’igicuri'
    WHEN 'Vomiting' THEN 'Kuruka'
    WHEN 'Dizziness' THEN 'Kuzungera'
    WHEN 'Chest pain' THEN 'Kubabara mu gatuza'
    WHEN 'Leaking fluid' THEN 'Amazi ava mu nda ibyara'
    WHEN 'Painful urination' THEN 'Kubabara igihe cyo kwihagarika'
    WHEN 'Fatigue' THEN 'Umunaniro'
    ELSE symptom_name_rw END;
