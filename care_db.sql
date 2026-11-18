-- M-CARE Database Schema
CREATE DATABASE IF NOT EXISTS care_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE care_db;

CREATE TABLE tbl_system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    system_name VARCHAR(100) DEFAULT 'M-CARE',
    system_email VARCHAR(100),
    system_contact VARCHAR(20),
    system_address VARCHAR(200),
    system_logo VARCHAR(100) DEFAULT 'logo.png'
);
INSERT INTO tbl_system_settings (system_name, system_email, system_contact, system_address) VALUES ('M-CARE', 'admin@mcare.rw', '+250700000000', 'Kigali, Rwanda');

CREATE TABLE tbl_roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL
);
INSERT INTO tbl_roles (role_id, role_name) VALUES (1,'Administrator'),(2,'Healthcare Professional'),(3,'Community Health Worker'),(4,'Supervisor'),(5,'Pregnant/postpartum woman');

CREATE TABLE tbl_users (
    u_id INT PRIMARY KEY AUTO_INCREMENT,
    f_name VARCHAR(50) NOT NULL,
    l_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    usn VARCHAR(50) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    log_role INT NOT NULL DEFAULT 3,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    facility_id INT,
    mother_id INT UNIQUE,
    is_active TINYINT DEFAULT 1,
    log_status TINYINT DEFAULT 1,
    last_logged_in DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_role) REFERENCES tbl_roles(role_id)
);

CREATE TABLE tbl_password_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    password_updated TINYINT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_user_session (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sess_id VARCHAR(64),
    username VARCHAR(100),
    ip VARCHAR(45),
    time_login DATETIME,
    time_logout DATETIME,
    status VARCHAR(5) DEFAULT 'ON'
);

CREATE TABLE tbl_facilities (
    facility_id INT PRIMARY KEY AUTO_INCREMENT,
    facility_name VARCHAR(100) NOT NULL,
    facility_type VARCHAR(50),
    district VARCHAR(50),
    sector VARCHAR(50),
    contact VARCHAR(20),
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_mothers (
    mother_id INT PRIMARY KEY AUTO_INCREMENT,
    national_id VARCHAR(20),
    f_name VARCHAR(50) NOT NULL,
    l_name VARCHAR(50) NOT NULL,
    dob DATE,
    phone VARCHAR(20),
    address VARCHAR(200),
    district VARCHAR(50),
    sector VARCHAR(50),
    cell VARCHAR(50),
    village VARCHAR(50),
    education_level VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'rw',
    consent_given TINYINT DEFAULT 0,
    consent_at DATETIME,
    chw_id INT,
    facility_id INT,
    is_active TINYINT DEFAULT 1,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chw_id) REFERENCES tbl_users(u_id),
    FOREIGN KEY (facility_id) REFERENCES tbl_facilities(facility_id),
    FOREIGN KEY (created_by) REFERENCES tbl_users(u_id)
);

ALTER TABLE tbl_users
    ADD CONSTRAINT fk_user_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id);

CREATE TABLE tbl_pregnancies (
    pregnancy_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    lmp DATE COMMENT 'Last Menstrual Period',
    edd DATE COMMENT 'Estimated Due Date',
    dating_source VARCHAR(30) DEFAULT 'lmp',
    dating_confidence VARCHAR(20) DEFAULT 'unknown',
    ultrasound_edd DATE,
    gravida INT DEFAULT 1,
    parity INT DEFAULT 0,
    pregnancy_status VARCHAR(20) DEFAULT 'active' COMMENT 'active,delivered,lost',
    confirmed_by INT,
    confirmed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (confirmed_by) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_anc_visits (
    anc_id INT PRIMARY KEY AUTO_INCREMENT,
    pregnancy_id INT NOT NULL,
    mother_id INT NOT NULL,
    visit_number INT DEFAULT 1,
    visit_date DATE NOT NULL,
    gestational_age_weeks INT,
    weight DECIMAL(5,2),
    bp_systolic INT,
    bp_diastolic INT,
    fundal_height DECIMAL(5,2),
    fetal_heart_rate INT,
    hemoglobin DECIMAL(4,2),
    urine_protein VARCHAR(10),
    urine_glucose VARCHAR(10),
    hiv_status VARCHAR(20),
    syphilis_status VARCHAR(20),
    height_cm DECIMAL(5,2),
    temperature_c DECIMAL(4,1),
    respiratory_rate INT,
    tetanus_dose VARCHAR(20),
    iron_folic_given TINYINT DEFAULT 0,
    itn_given TINYINT DEFAULT 0,
    next_visit_date DATE,
    notes TEXT,
    recorded_by INT,
    facility_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pregnancy_id) REFERENCES tbl_pregnancies(pregnancy_id),
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (recorded_by) REFERENCES tbl_users(u_id)
);

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
    reviewed_by INT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_history_pregnancy (pregnancy_id),
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (pregnancy_id) REFERENCES tbl_pregnancies(pregnancy_id),
    FOREIGN KEY (recorded_by) REFERENCES tbl_users(u_id),
    FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_symptoms (
    symptom_id INT PRIMARY KEY AUTO_INCREMENT,
    symptom_name VARCHAR(100) NOT NULL,
    symptom_name_rw VARCHAR(120),
    symptom_category VARCHAR(50),
    severity_weight INT DEFAULT 1 COMMENT '1=low,2=medium,3=high',
    is_active TINYINT DEFAULT 1
);
INSERT INTO tbl_symptoms (symptom_name, symptom_category, severity_weight) VALUES
('Severe headache','Neurological',3),('Blurred vision','Neurological',3),('Swelling of face/hands/feet','Cardiovascular',2),
('Vaginal bleeding','Obstetric',3),('Severe abdominal pain','Obstetric',3),('Reduced fetal movement','Obstetric',2),
('Fever','Infection',2),('Difficulty breathing','Respiratory',3),('Convulsions','Neurological',3),
('Vomiting','Gastrointestinal',1),('Dizziness','Neurological',2),('Chest pain','Cardiovascular',3),
('Leaking fluid','Obstetric',2),('Painful urination','Infection',1),('Fatigue','General',1);

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

CREATE TABLE tbl_symptom_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    pregnancy_id INT,
    reported_by INT COMMENT 'user_id of reporter (mother app or CHW)',
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    symptoms_json TEXT COMMENT 'JSON array of symptom_ids',
    onset_at DATETIME,
    severity VARCHAR(20),
    symptom_pattern VARCHAR(30),
    worsening TINYINT DEFAULT 0,
    already_sought_care TINYINT DEFAULT 0,
    reported_temperature DECIMAL(4,1),
    reported_systolic INT,
    reported_diastolic INT,
    reference_code VARCHAR(24) UNIQUE,
    voice_recording VARCHAR(200),
    additional_notes TEXT,
    alert_generated TINYINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending,reviewed,closed',
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (pregnancy_id) REFERENCES tbl_pregnancies(pregnancy_id)
);

CREATE TABLE tbl_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    mother_id INT NOT NULL,
    pregnancy_id INT,
    alert_level VARCHAR(20) NOT NULL COMMENT 'low,medium,high,critical',
    alert_message TEXT,
    assigned_to INT COMMENT 'CHW or health professional user_id',
    facility_id INT,
    acknowledged_by INT,
    acknowledged_at DATETIME,
    escalated_to INT,
    escalated_at DATETIME,
    status VARCHAR(20) DEFAULT 'open' COMMENT 'open,acknowledged,escalated,closed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES tbl_symptom_reports(report_id),
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (assigned_to) REFERENCES tbl_users(u_id),
    FOREIGN KEY (facility_id) REFERENCES tbl_facilities(facility_id),
    FOREIGN KEY (acknowledged_by) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_referrals (
    referral_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    alert_id INT,
    referred_by INT NOT NULL,
    referred_to_facility INT,
    referral_reason TEXT,
    referral_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    transport_arranged TINYINT DEFAULT 0,
    transport_notes VARCHAR(200),
    arrival_confirmed TINYINT DEFAULT 0,
    arrival_date DATETIME,
    outcome VARCHAR(50),
    outcome_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending,in_transit,arrived,completed,cancelled',
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (referred_by) REFERENCES tbl_users(u_id),
    FOREIGN KEY (referred_to_facility) REFERENCES tbl_facilities(facility_id)
);

CREATE TABLE tbl_chw_visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    chw_id INT NOT NULL,
    alert_id INT,
    visit_date DATE NOT NULL,
    visit_type VARCHAR(50) COMMENT 'routine,alert_followup,referral_followup,postnatal',
    contact_method VARCHAR(30),
    contact_result VARCHAR(30),
    visit_notes TEXT,
    mother_condition VARCHAR(50),
    action_taken TEXT,
    next_visit_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (chw_id) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    mother_id INT COMMENT 'context: about which mother',
    subject VARCHAR(200),
    message_body TEXT NOT NULL,
    is_read TINYINT DEFAULT 0,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES tbl_users(u_id),
    FOREIGN KEY (receiver_id) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_mcare_chat_conversations (
    conversation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    user_id INT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'rw',
    status ENUM('active','closed') NOT NULL DEFAULT 'active',
    conversation_state JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_mcare_chat_owner_status (mother_id,user_id,status,updated_at),
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    FOREIGN KEY (user_id) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tbl_mcare_chat_turns (
    turn_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT UNSIGNED NOT NULL,
    speaker ENUM('mother','mcare') NOT NULL,
    original_text MEDIUMTEXT NOT NULL,
    normalized_text MEDIUMTEXT NULL,
    structured_data JSON NULL,
    intent VARCHAR(80) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_mcare_chat_turn_order (conversation_id,turn_id),
    FOREIGN KEY (conversation_id) REFERENCES tbl_mcare_chat_conversations(conversation_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tbl_nutrition_content (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content_body TEXT NOT NULL,
    trimester VARCHAR(10) COMMENT '1,2,3,all',
    content_type VARCHAR(50) COMMENT 'education,food_guide,tip',
    language VARCHAR(10) DEFAULT 'en',
    created_by INT,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_nutrition_checkins (
    checkin_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    pregnancy_id INT,
    checkin_date DATE NOT NULL,
    meals_per_day INT,
    has_eaten TINYINT DEFAULT 0,
    fruit_vegetable TINYINT DEFAULT 0,
    nausea_or_difficulty TINYINT DEFAULT 0,
    food_access_difficulty TINYINT DEFAULT 0,
    food_groups_json TEXT,
    iron_supplement TINYINT DEFAULT 0,
    folic_acid TINYINT DEFAULT 0,
    notes TEXT,
    recorded_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id)
);

CREATE TABLE tbl_education_content (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content_body TEXT NOT NULL,
    category VARCHAR(50) COMMENT 'anc,danger_signs,postnatal,newborn',
    trimester VARCHAR(10),
    language VARCHAR(10) DEFAULT 'en',
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_reminders (
    reminder_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    reminder_type VARCHAR(50) COMMENT 'anc_appointment,medication,checkin',
    reminder_message TEXT,
    reminder_date DATETIME,
    is_sent TINYINT DEFAULT 0,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id)
);

CREATE TABLE tbl_notifications (
    notif_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notif_type VARCHAR(50),
    notif_message TEXT,
    reference_id INT,
    reference_type VARCHAR(50),
    is_read TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(u_id)
);

CREATE TABLE tbl_audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    table_name VARCHAR(50),
    record_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (password: Admin@1234)
INSERT INTO tbl_users (f_name, l_name, email, phone, usn, pwd, log_role, is_active, log_status)
VALUES ('System', 'Admin', 'admin@mcare.rw', '+250700000000', 'admin', '$2y$12$ozji3gFglrAjlkosrQfG9ePAlWLW3DPAhH332/qyVYpowIgnlnZBS', 1, 1, 1);
INSERT INTO tbl_password_updates (user_id, password_updated) VALUES (1, 0);
-- M-CARE maternal intelligence foundation. Additive migration; clinical rules
-- start in draft and disabled until a qualified clinical approver enables them.
CREATE TABLE IF NOT EXISTS tbl_clinical_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    rule_code VARCHAR(80) NOT NULL,
    version VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    rule_definition JSON NOT NULL,
    approval_status ENUM('draft','approved','retired') NOT NULL DEFAULT 'draft',
    is_enabled TINYINT(1) NOT NULL DEFAULT 0,
    effective_at DATETIME NULL,
    review_due_at DATETIME NULL,
    created_by INT NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_clinical_rule_version (rule_code, version),
    KEY idx_clinical_rule_active (approval_status, is_enabled, effective_at),
    CONSTRAINT fk_clinical_rule_creator FOREIGN KEY (created_by) REFERENCES tbl_users(u_id),
    CONSTRAINT fk_clinical_rule_approver FOREIGN KEY (approved_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_knowledge_documents (
    document_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(250) NOT NULL,
    source_organization VARCHAR(200) NOT NULL,
    version VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL,
    applicable_stage VARCHAR(40) NOT NULL DEFAULT 'all',
    content_category VARCHAR(60) NOT NULL,
    content_body MEDIUMTEXT NOT NULL,
    approval_status ENUM('draft','approved','retired') NOT NULL DEFAULT 'draft',
    effective_at DATE NULL,
    review_due_at DATE NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ai_knowledge_lookup (approval_status, language, applicable_stage, content_category),
    CONSTRAINT fk_ai_knowledge_approver FOREIGN KEY (approved_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_model_versions (
    model_id INT PRIMARY KEY AUTO_INCREMENT,
    model_name VARCHAR(120) NOT NULL,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(60) NOT NULL,
    status ENUM('development','validated','active','disabled','retired') NOT NULL DEFAULT 'development',
    evaluation_summary JSON NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ai_model_version (model_name, version),
    CONSTRAINT fk_ai_model_approver FOREIGN KEY (approved_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_maternal_ai_events (
    event_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    pregnancy_id INT NULL,
    actor_user_id INT NULL,
    event_type VARCHAR(60) NOT NULL,
    source_type VARCHAR(60) NULL,
    source_id BIGINT NULL,
    language VARCHAR(10) NULL,
    model_name VARCHAR(120) NULL,
    model_version VARCHAR(50) NULL,
    rule_code VARCHAR(80) NULL,
    rule_version VARCHAR(30) NULL,
    input_digest CHAR(64) NULL COMMENT 'Hash only; raw patient prompts are not stored here',
    result_summary JSON NULL,
    review_status ENUM('not_required','pending','reviewed','disputed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_maternal_ai_event (mother_id, created_at),
    KEY idx_ai_event_review (review_status, created_at),
    CONSTRAINT fk_ai_event_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    CONSTRAINT fk_ai_event_pregnancy FOREIGN KEY (pregnancy_id) REFERENCES tbl_pregnancies(pregnancy_id),
    CONSTRAINT fk_ai_event_actor FOREIGN KEY (actor_user_id) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_feedback (
    feedback_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    reviewed_by INT NOT NULL,
    feedback_category ENUM('correct','incorrect','incomplete','needs_review','routing_issue','language_issue') NOT NULL,
    feedback_note TEXT NULL,
    verified_outcome VARCHAR(120) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ai_feedback_date (created_at),
    CONSTRAINT fk_ai_feedback_event FOREIGN KEY (event_id) REFERENCES tbl_maternal_ai_events(event_id),
    CONSTRAINT fk_ai_feedback_reviewer FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_alert_events (
    alert_event_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_id INT NOT NULL,
    actor_user_id INT NULL,
    event_type ENUM('created','assigned','notified','acknowledged','escalated','closed','reopened') NOT NULL,
    from_user_id INT NULL,
    to_user_id INT NULL,
    event_note VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_alert_events_timeline (alert_id, created_at),
    CONSTRAINT fk_alert_event_alert FOREIGN KEY (alert_id) REFERENCES tbl_alerts(alert_id),
    CONSTRAINT fk_alert_event_actor FOREIGN KEY (actor_user_id) REFERENCES tbl_users(u_id),
    CONSTRAINT fk_alert_event_from_user FOREIGN KEY (from_user_id) REFERENCES tbl_users(u_id),
    CONSTRAINT fk_alert_event_to_user FOREIGN KEY (to_user_id) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Store a traceable, structured-intake summary for each maternal symptom report.
-- This is an administrative summary for professional review, not a diagnosis.
CREATE TABLE IF NOT EXISTS tbl_report_analyses (
    analysis_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    analysis_version VARCHAR(40) NOT NULL DEFAULT 'structured-intake-0.1',
    summary_text MEDIUMTEXT NOT NULL,
    findings_json JSON NOT NULL,
    review_status ENUM('pending','reviewed','disputed') NOT NULL DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    review_note VARCHAR(1000) NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_report_analysis_report (report_id),
    KEY idx_report_analysis_review (review_status, generated_at),
    CONSTRAINT fk_report_analysis_report FOREIGN KEY (report_id) REFERENCES tbl_symptom_reports(report_id),
    CONSTRAINT fk_report_analysis_reviewer FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Governed dataset preparation, offline training jobs, and held-out evaluation.
-- Raw conversations are not training data; only explicitly de-identified,
-- authorized and professionally reviewed examples belong in these tables.
CREATE TABLE IF NOT EXISTS tbl_ai_datasets (
    dataset_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    dataset_name VARCHAR(180) NOT NULL,
    dataset_version VARCHAR(50) NOT NULL,
    language_scope VARCHAR(40) NOT NULL DEFAULT 'en,rw',
    purpose VARCHAR(80) NOT NULL,
    status ENUM('draft','review','approved','retired') NOT NULL DEFAULT 'draft',
    source_description VARCHAR(500) NULL,
    deidentification_method VARCHAR(200) NULL,
    consent_basis VARCHAR(500) NULL,
    created_by INT NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ai_dataset_version (dataset_name,dataset_version),
    KEY idx_ai_dataset_status (status,purpose),
    CONSTRAINT fk_ai_dataset_creator FOREIGN KEY (created_by) REFERENCES tbl_users(u_id),
    CONSTRAINT fk_ai_dataset_approver FOREIGN KEY (approved_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_dataset_examples (
    example_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    dataset_id BIGINT UNSIGNED NOT NULL,
    split_name ENUM('train','validation','test') NOT NULL,
    language VARCHAR(10) NOT NULL,
    input_text MEDIUMTEXT NOT NULL,
    expected_output MEDIUMTEXT NULL,
    annotations JSON NOT NULL,
    source_digest CHAR(64) NULL COMMENT 'Optional deduplication hash; no patient identifier',
    quality_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ai_examples_dataset_split (dataset_id,split_name,quality_status),
    KEY idx_ai_examples_dedup (dataset_id,source_digest),
    CONSTRAINT fk_ai_example_dataset FOREIGN KEY (dataset_id) REFERENCES tbl_ai_datasets(dataset_id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_example_reviewer FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_training_jobs (
    job_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    dataset_id BIGINT UNSIGNED NOT NULL,
    base_model_id INT NULL,
    output_model_id INT NULL,
    job_type ENUM('classifier_training','fine_tuning','evaluation','embedding_index') NOT NULL,
    status ENUM('queued','running','succeeded','failed','cancelled') NOT NULL DEFAULT 'queued',
    configuration JSON NOT NULL,
    metrics JSON NULL,
    artifact_path VARCHAR(500) NULL,
    error_summary TEXT NULL,
    requested_by INT NOT NULL,
    started_at DATETIME NULL,
    finished_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ai_training_queue (status,created_at),
    KEY idx_ai_training_dataset (dataset_id,created_at),
    CONSTRAINT fk_ai_training_dataset FOREIGN KEY (dataset_id) REFERENCES tbl_ai_datasets(dataset_id),
    CONSTRAINT fk_ai_training_base_model FOREIGN KEY (base_model_id) REFERENCES tbl_ai_model_versions(model_id),
    CONSTRAINT fk_ai_training_output_model FOREIGN KEY (output_model_id) REFERENCES tbl_ai_model_versions(model_id),
    CONSTRAINT fk_ai_training_requester FOREIGN KEY (requested_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_training_job_logs (
    log_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT UNSIGNED NOT NULL,
    log_level ENUM('info','warning','error') NOT NULL DEFAULT 'info',
    message VARCHAR(2000) NOT NULL,
    details JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ai_job_log_order (job_id,log_id),
    CONSTRAINT fk_ai_job_log_job FOREIGN KEY (job_id) REFERENCES tbl_ai_training_jobs(job_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_model_evaluations (
    evaluation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    dataset_id BIGINT UNSIGNED NOT NULL,
    job_id BIGINT UNSIGNED NULL,
    evaluation_scope VARCHAR(80) NOT NULL,
    metrics JSON NOT NULL,
    reviewer_notes TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ai_eval_model (model_id,created_at),
    KEY idx_ai_eval_dataset (dataset_id,evaluation_scope),
    CONSTRAINT fk_ai_eval_model FOREIGN KEY (model_id) REFERENCES tbl_ai_model_versions(model_id),
    CONSTRAINT fk_ai_eval_dataset FOREIGN KEY (dataset_id) REFERENCES tbl_ai_datasets(dataset_id),
    CONSTRAINT fk_ai_eval_job FOREIGN KEY (job_id) REFERENCES tbl_ai_training_jobs(job_id),
    CONSTRAINT fk_ai_eval_reviewer FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ai_knowledge_chunks (
    chunk_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    chunk_index INT UNSIGNED NOT NULL,
    chunk_text MEDIUMTEXT NOT NULL,
    embedding_model VARCHAR(120) NULL,
    embedding JSON NULL,
    content_hash CHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ai_knowledge_chunk (document_id,chunk_index),
    KEY idx_ai_knowledge_chunk_hash (content_hash),
    CONSTRAINT fk_ai_knowledge_chunk_document FOREIGN KEY (document_id) REFERENCES tbl_ai_knowledge_documents(document_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
