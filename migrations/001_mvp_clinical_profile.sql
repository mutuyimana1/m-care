-- Apply once to an existing M-CARE database before deploying the updated code.
ALTER TABLE tbl_mothers
  ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'rw' AFTER education_level,
  ADD COLUMN consent_given TINYINT DEFAULT 0 AFTER preferred_language,
  ADD COLUMN consent_at DATETIME NULL AFTER consent_given;
ALTER TABLE tbl_pregnancies
  ADD COLUMN dating_source VARCHAR(30) DEFAULT 'lmp' AFTER edd,
  ADD COLUMN dating_confidence VARCHAR(20) DEFAULT 'unknown' AFTER dating_source,
  ADD COLUMN ultrasound_edd DATE NULL AFTER dating_confidence;
ALTER TABLE tbl_anc_visits
  ADD COLUMN height_cm DECIMAL(5,2) NULL AFTER syphilis_status,
  ADD COLUMN temperature_c DECIMAL(4,1) NULL AFTER height_cm,
  ADD COLUMN respiratory_rate INT NULL AFTER temperature_c;
CREATE TABLE tbl_maternal_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  mother_id INT NOT NULL,
  pregnancy_id INT NOT NULL,
  previous_preeclampsia TINYINT DEFAULT 0,
  chronic_hypertension TINYINT DEFAULT 0,
  diabetes TINYINT DEFAULT 0,
  kidney_disease TINYINT DEFAULT 0,
  multiple_pregnancy TINYINT DEFAULT 0,
  previous_stillbirth TINYINT DEFAULT 0,
  previous_severe_complication TINYINT DEFAULT 0,
  medical_history TEXT,
  obstetric_history TEXT,
  recorded_by INT NOT NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_history_pregnancy (pregnancy_id),
  FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
  FOREIGN KEY (pregnancy_id) REFERENCES tbl_pregnancies(pregnancy_id),
  FOREIGN KEY (recorded_by) REFERENCES tbl_users(u_id),
  FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id)
);
ALTER TABLE tbl_symptom_reports
  ADD COLUMN onset_at DATETIME NULL AFTER symptoms_json,
  ADD COLUMN severity VARCHAR(20) NULL AFTER onset_at,
  ADD COLUMN symptom_pattern VARCHAR(30) NULL AFTER severity,
  ADD COLUMN worsening TINYINT DEFAULT 0 AFTER symptom_pattern,
  ADD COLUMN already_sought_care TINYINT DEFAULT 0 AFTER worsening,
  ADD COLUMN reported_temperature DECIMAL(4,1) NULL AFTER already_sought_care,
  ADD COLUMN reported_systolic INT NULL AFTER reported_temperature,
  ADD COLUMN reported_diastolic INT NULL AFTER reported_systolic,
  ADD COLUMN reference_code VARCHAR(24) NULL UNIQUE AFTER reported_diastolic;
ALTER TABLE tbl_nutrition_checkins
  ADD COLUMN has_eaten TINYINT DEFAULT 0 AFTER meals_per_day,
  ADD COLUMN fruit_vegetable TINYINT DEFAULT 0 AFTER has_eaten,
  ADD COLUMN nausea_or_difficulty TINYINT DEFAULT 0 AFTER fruit_vegetable,
  ADD COLUMN food_access_difficulty TINYINT DEFAULT 0 AFTER nausea_or_difficulty;

ALTER TABLE tbl_alerts ADD COLUMN facility_id INT NULL AFTER assigned_to, ADD CONSTRAINT fk_alert_facility FOREIGN KEY (facility_id) REFERENCES tbl_facilities(facility_id);
ALTER TABLE tbl_chw_visits
  ADD COLUMN contact_method VARCHAR(30) NULL AFTER visit_type,
  ADD COLUMN contact_result VARCHAR(30) NULL AFTER contact_method;
