-- Development-only IVR simulator and local Asterisk call records.
-- No live telephone integrations, patient identifiers, or outbound-call jobs are stored here.

CREATE TABLE IF NOT EXISTS ivr_calls (
    ivr_call_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    call_uuid CHAR(36) NOT NULL,
    call_source ENUM('web_simulator','asterisk_local') NOT NULL DEFAULT 'web_simulator',
    is_test TINYINT(1) NOT NULL DEFAULT 1,
    caller_number VARCHAR(32) NOT NULL,
    caller_fixture VARCHAR(40) DEFAULT NULL,
    language VARCHAR(2) DEFAULT NULL,
    state VARCHAR(32) NOT NULL DEFAULT 'welcome',
    current_menu VARCHAR(32) NOT NULL DEFAULT 'welcome',
    last_input VARCHAR(16) DEFAULT NULL,
    status ENUM('active','queued','answered_simulated','completed','failed') NOT NULL DEFAULT 'active',
    created_by INT DEFAULT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at DATETIME DEFAULT NULL,
    ended_at DATETIME DEFAULT NULL,
    duration_seconds INT UNSIGNED DEFAULT NULL,
    waiting_seconds INT UNSIGNED DEFAULT NULL,
    error_message VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ivr_call_uuid (call_uuid),
    KEY idx_ivr_calls_active (is_test,status,started_at),
    KEY idx_ivr_calls_created_by (created_by,created_at),
    KEY idx_ivr_calls_language (language,created_at),
    CONSTRAINT fk_ivr_calls_user FOREIGN KEY (created_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_call_events (
    event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ivr_call_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    menu_key VARCHAR(40) DEFAULT NULL,
    event_value VARCHAR(100) DEFAULT NULL,
    event_payload LONGTEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ivr_events_call_time (ivr_call_id,created_at),
    KEY idx_ivr_events_type_time (event_type,created_at),
    CONSTRAINT fk_ivr_events_call FOREIGN KEY (ivr_call_id) REFERENCES ivr_calls(ivr_call_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_call_queue (
    queue_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ivr_call_id BIGINT UNSIGNED NOT NULL,
    queue_status ENUM('waiting','answered','rejected','cancelled') NOT NULL DEFAULT 'waiting',
    handled_by INT DEFAULT NULL,
    queued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME DEFAULT NULL,
    resolution_note VARCHAR(255) DEFAULT NULL,
    KEY idx_ivr_queue_status_time (queue_status,queued_at),
    UNIQUE KEY uq_ivr_queue_call (ivr_call_id),
    CONSTRAINT fk_ivr_queue_call FOREIGN KEY (ivr_call_id) REFERENCES ivr_calls(ivr_call_id) ON DELETE CASCADE,
    CONSTRAINT fk_ivr_queue_user FOREIGN KEY (handled_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_emergency_escalations (
    escalation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ivr_call_id BIGINT UNSIGNED NOT NULL,
    signal_key VARCHAR(60) NOT NULL,
    escalation_status ENUM('recorded_test','reviewed_test') NOT NULL DEFAULT 'recorded_test',
    reviewed_by INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME DEFAULT NULL,
    KEY idx_ivr_escalation_time (created_at),
    CONSTRAINT fk_ivr_escalation_call FOREIGN KEY (ivr_call_id) REFERENCES ivr_calls(ivr_call_id) ON DELETE CASCADE,
    CONSTRAINT fk_ivr_escalation_user FOREIGN KEY (reviewed_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_test_config (
    config_key VARCHAR(80) NOT NULL PRIMARY KEY,
    config_value VARCHAR(500) NOT NULL,
    updated_by INT DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ivr_config_user FOREIGN KEY (updated_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_voice_prompts (
    prompt_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prompt_key VARCHAR(60) NOT NULL,
    language VARCHAR(2) NOT NULL,
    prompt_text TEXT NOT NULL,
    audio_path VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    updated_by INT DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ivr_prompt_language (prompt_key,language),
    KEY idx_ivr_prompt_active (is_active,prompt_key),
    CONSTRAINT fk_ivr_prompt_user FOREIGN KEY (updated_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_menu_options (
    option_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    menu_key VARCHAR(40) NOT NULL,
    language VARCHAR(2) NOT NULL,
    digit CHAR(1) NOT NULL,
    option_label VARCHAR(180) NOT NULL,
    action_key VARCHAR(40) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
    updated_by INT DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ivr_menu_digit_language (menu_key,language,digit),
    KEY idx_ivr_menu_active_order (menu_key,language,is_active,sort_order),
    CONSTRAINT fk_ivr_menu_user FOREIGN KEY (updated_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ivr_test_fixture_data (
    fixture_data_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fixture_key VARCHAR(40) NOT NULL,
    data_type ENUM('appointment','medication_reminder') NOT NULL,
    label_en VARCHAR(180) NOT NULL,
    label_rw VARCHAR(180) NOT NULL,
    details_en TEXT NOT NULL,
    details_rw TEXT NOT NULL,
    scheduled_at DATETIME DEFAULT NULL,
    UNIQUE KEY uq_ivr_fixture_data_type (fixture_key,data_type),
    KEY idx_ivr_fixture_schedule (fixture_key,scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO ivr_test_config (config_key,config_value) VALUES
('max_concurrent_calls','10'),('speech_test_enabled','1');

INSERT IGNORE INTO ivr_voice_prompts (prompt_key,language,prompt_text) VALUES
('welcome','en','Welcome to M-CARE. This is a development test call. Press 1 for Kinyarwanda or 2 for English.'),
('welcome','rw','Murakaza neza kuri M-CARE. Iki ni ikigeragezo. Kanda 1 ukoreshe Ikinyarwanda cyangwa 2 ukoreshe Icyongereza.'),
('main','en','For pregnancy information press 1. For urgent warning signs press 2. For pregnancy nutrition and education press 3. For appointment information press 4. For medication reminders press 5. To request a simulated healthcare worker connection press 6. To repeat press 7. To end this test call press 8.'),
('main','rw','Ku makuru yo gutwita kanda 1. Ku bimenyetso by’akaga kanda 2. Ku mirire n’inyigisho kanda 3. Ku makuru y’igihe cyo kwisuzumisha kanda 4. Ku kwibutswa imiti kanda 5. Gusaba kuganira n’umukozi w’ubuzima mu kigeragezo kanda 6. Gusubiramo kanda 7. Gusoza ikigeragezo kanda 8.'),
('education','en','Press 1 for first trimester information, 2 for second trimester, 3 for third trimester, 4 for general pregnancy guidance, or 9 to return.'),
('education','rw','Ku makuru y’igihembwe cya mbere kanda 1, icya kabiri kanda 2, icya gatatu kanda 3, inama rusange kanda 4, cyangwa 9 usubire inyuma.'),
('emergency','en','If you may be experiencing a pregnancy emergency, seek immediate professional medical care now. This test call cannot contact emergency services. Press 1 to record a test escalation, or 9 to return to the main menu.'),
('emergency','rw','Niba ushobora kuba ufite ikibazo cyihutirwa mu gihe cyo gutwita, hita ushaka ubufasha bw’umukozi w’ubuzima. Iki kigeragezo ntigihamagara ubutabazi. Kanda 1 kugira ngo wandike ikigeragezo cy’ubutabazi, cyangwa 9 usubire ku ntangiriro.'),
('appointment','en','This synthetic test caller has no appointment records. No real appointment information was accessed.'),
('appointment','rw','Uyu muntu w’ikigeragezo nta makuru y’igihe cyo kwisuzumisha afite. Nta makuru y’umuntu nyawe yakoreshejwe.'),
('medication','en','This synthetic test caller has no medication reminder records. Follow instructions from your healthcare professional.'),
('medication','rw','Uyu muntu w’ikigeragezo nta makuru yo kwibutswa imiti afite. Kurikiza amabwiriza y’umukozi w’ubuzima.'),
('queue','en','Your test call has been placed in the simulated healthcare worker queue. No real call is being transferred.'),
('queue','rw','Ikigeragezo cyawe cyashyizwe ku rutonde rw’ikigeragezo rw’abakozi b’ubuzima. Nta guhamagara nyakuri kurimo gukorwa.'),
('emergency_instruction','en','Seek immediate medical care now. Do not wait for a return call or message.'),
('emergency_instruction','rw','Hita ushaka ubuvuzi. Ntutegereze ko baguhamagara cyangwa bakwandikira.'),
('invalid','en','That option is not available. Please try again.'),
('invalid','rw','Icyo wahisemo ntikiboneka. Ongera ugerageze.'),
('ended','en','Thank you. This M-CARE development test call has ended.'),
('ended','rw','Urakoze. Ikigeragezo cya M-CARE kirarangiye.');

INSERT IGNORE INTO ivr_menu_options (menu_key,language,digit,option_label,action_key,sort_order) VALUES
('welcome','en','1','Kinyarwanda','set_rw',1),('welcome','en','2','English','set_en',2),
('welcome','rw','1','Ikinyarwanda','set_rw',1),('welcome','rw','2','Icyongereza','set_en',2),
('main','en','1','Pregnancy health information','pregnancy_info',1),('main','en','2','Pregnancy danger signs and emergency guidance','emergency',2),('main','en','3','Pregnancy nutrition and health education','nutrition',3),('main','en','4','Appointment information','appointment',4),('main','en','5','Medication reminders','medication',5),('main','en','6','Speak to a healthcare worker','queue',6),('main','en','7','Repeat the menu','repeat',7),('main','en','8','End the call','hangup',8),
('main','rw','1','Amakuru ku gutwita','pregnancy_info',1),('main','rw','2','Ibimenyetso by’akaga n’ubufasha bwihuse','emergency',2),('main','rw','3','Imirire n’inyigisho ku buzima','nutrition',3),('main','rw','4','Amakuru yo kwisuzumisha','appointment',4),('main','rw','5','Kwibutswa imiti','medication',5),('main','rw','6','Kuvugana n’umukozi w’ubuzima','queue',6),('main','rw','7','Subiramo amahitamo','repeat',7),('main','rw','8','Soza ikigeragezo','hangup',8),
('education','en','1','First trimester','trimester_1',1),('education','en','2','Second trimester','trimester_2',2),('education','en','3','Third trimester','trimester_3',3),('education','en','4','General guidance','trimester_all',4),('education','en','9','Return to main menu','back',9),
('education','rw','1','Igihembwe cya mbere','trimester_1',1),('education','rw','2','Igihembwe cya kabiri','trimester_2',2),('education','rw','3','Igihembwe cya gatatu','trimester_3',3),('education','rw','4','Inama rusange','trimester_all',4),('education','rw','9','Subira ku ntangiriro','back',9),
('emergency','en','1','Record a test emergency escalation','escalate_test',1),('emergency','en','9','Return to main menu','back',9),
('emergency','rw','1','Andika ikigeragezo cy’ubutabazi','escalate_test',1),('emergency','rw','9','Subira ku ntangiriro','back',9);

-- Synthetic reminders are explicitly unrelated to real mothers and clinical records.
INSERT IGNORE INTO ivr_test_fixture_data (fixture_key,data_type,label_en,label_rw,details_en,details_rw,scheduled_at) VALUES
('synthetic_pregnancy_1','appointment','ANC test appointment','Igihe cy’ikigeragezo cyo kwisuzumisha inda','Synthetic demonstration appointment only. Confirm actual appointments with your care team.','Iki ni igihe cy’ikigeragezo gusa. Emeza igihe nyacyo n’itsinda ry’ubuzima.',DATE_ADD(NOW(),INTERVAL 7 DAY)),
('synthetic_pregnancy_2','appointment','ANC test appointment','Igihe cy’ikigeragezo cyo kwisuzumisha inda','Synthetic demonstration appointment only. Confirm actual appointments with your care team.','Iki ni igihe cy’ikigeragezo gusa. Emeza igihe nyacyo n’itsinda ry’ubuzima.',DATE_ADD(NOW(),INTERVAL 7 DAY)),
('synthetic_pregnancy_3','appointment','ANC test appointment','Igihe cy’ikigeragezo cyo kwisuzumisha inda','Synthetic demonstration appointment only. Confirm actual appointments with your care team.','Iki ni igihe cy’ikigeragezo gusa. Emeza igihe nyacyo n’itsinda ry’ubuzima.',DATE_ADD(NOW(),INTERVAL 7 DAY)),
('synthetic_pregnancy_2','medication_reminder','Generic test medication reminder','Kwibutswa imiti mu kigeragezo','Synthetic reminder only; no medicine or dose is specified. Follow only your own clinician-approved instructions.','Kwibutsa mu kigeragezo gusa; nta muti cyangwa ingano byavuzwe. Kurikiza amabwiriza yemejwe n’umukozi w’ubuzima wawe gusa.',DATE_ADD(NOW(),INTERVAL 1 DAY)),
('synthetic_pregnancy_3','medication_reminder','Generic test medication reminder','Kwibutswa imiti mu kigeragezo','Synthetic reminder only; no medicine or dose is specified. Follow only your own clinician-approved instructions.','Kwibutsa mu kigeragezo gusa; nta muti cyangwa ingano byavuzwe. Kurikiza amabwiriza yemejwe n’umukozi w’ubuzima wawe gusa.',DATE_ADD(NOW(),INTERVAL 1 DAY));
