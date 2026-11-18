-- M-CARE outbound calling foundation. Requires a separately authorized PSTN/SIP
-- provider; this migration does not configure or originate a phone call.

CREATE TABLE IF NOT EXISTS mcare_call_consent (
    mother_id INT NOT NULL PRIMARY KEY,
    consent_status ENUM('not_recorded','granted','withdrawn') NOT NULL DEFAULT 'not_recorded',
    consent_source VARCHAR(255) DEFAULT NULL,
    consented_at DATETIME DEFAULT NULL,
    withdrawn_at DATETIME DEFAULT NULL,
    recorded_by INT DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mcare_call_consent_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id) ON DELETE CASCADE,
    CONSTRAINT fk_mcare_call_consent_user FOREIGN KEY (recorded_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mcare_outbound_calls (
    call_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    call_uuid CHAR(36) NOT NULL,
    mother_id INT NOT NULL,
    destination_number VARCHAR(20) NOT NULL,
    purpose ENUM('test','anc_followup','appointment_reminder','postnatal_followup','missed_appointment','worker_followup') NOT NULL,
    language VARCHAR(2) NOT NULL DEFAULT 'rw',
    status ENUM('pending','queued','initiating','ringing','answered','in_progress','completed','busy','no_answer','failed','cancelled') NOT NULL DEFAULT 'pending',
    scheduled_at DATETIME DEFAULT NULL,
    started_at DATETIME DEFAULT NULL,
    answered_at DATETIME DEFAULT NULL,
    ended_at DATETIME DEFAULT NULL,
    duration_seconds INT UNSIGNED DEFAULT NULL,
    retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
    initiated_by INT DEFAULT NULL,
    ami_action_id VARCHAR(80) DEFAULT NULL,
    asterisk_uniqueid VARCHAR(80) DEFAULT NULL,
    asterisk_channel VARCHAR(255) DEFAULT NULL,
    failure_reason VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_mcare_outbound_uuid (call_uuid),
    UNIQUE KEY uq_mcare_outbound_action (ami_action_id),
    KEY idx_mcare_outbound_status_schedule (status,scheduled_at),
    KEY idx_mcare_outbound_mother_time (mother_id,created_at),
    KEY idx_mcare_outbound_asterisk (asterisk_uniqueid),
    CONSTRAINT fk_mcare_outbound_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id) ON DELETE RESTRICT,
    CONSTRAINT fk_mcare_outbound_user FOREIGN KEY (initiated_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mcare_outbound_call_events (
    event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    call_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    event_detail VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_mcare_outbound_events_call (call_id,created_at),
    CONSTRAINT fk_mcare_outbound_event_call FOREIGN KEY (call_id) REFERENCES mcare_outbound_calls(call_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mcare_call_back_requests (
    callback_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    call_id BIGINT UNSIGNED NOT NULL,
    mother_id INT NOT NULL,
    status ENUM('pending','contacted','cancelled') NOT NULL DEFAULT 'pending',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME DEFAULT NULL,
    handled_by INT DEFAULT NULL,
    UNIQUE KEY uq_mcare_callback_call (call_id),
    KEY idx_mcare_callback_status (status,requested_at),
    CONSTRAINT fk_mcare_callback_call FOREIGN KEY (call_id) REFERENCES mcare_outbound_calls(call_id) ON DELETE CASCADE,
    CONSTRAINT fk_mcare_callback_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id) ON DELETE RESTRICT,
    CONSTRAINT fk_mcare_callback_user FOREIGN KEY (handled_by) REFERENCES tbl_users(u_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mcare_outbound_runtime (
    runtime_key VARCHAR(50) NOT NULL PRIMARY KEY,
    runtime_status ENUM('connected','disconnected') NOT NULL DEFAULT 'disconnected',
    heartbeat_at DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Production prompts have separate keys from the synthetic development prompts.
-- Upload approved mono 8 kHz PCM WAV files from the IVR settings panel before enabling calls.
INSERT IGNORE INTO ivr_voice_prompts (prompt_key,language,prompt_text) VALUES
('outbound_gate','rw','M-CARE iraguhamagaye. Niba ushaka kumva ubutumwa rusange kanda 1. Guhagarika kanda 0.'),
('outbound_gate','en','This is M-CARE. Press 1 to hear a general message, or 0 to end the call.'),
('outbound_language','rw','Gukomeza mu Kinyarwanda kanda 1. Continue in English, press 2.'),
('outbound_language','en','For Kinyarwanda, press 1. For English, press 2.'),
('outbound_welcome','rw','Murakaza neza kuri M-CARE. Turahari kugira ngo tugufashe. Iyi ni telefoni rusange. Nta makuru bwite ari buvugwe kuri iyi telefoni.'),
('outbound_welcome','en','Welcome to M-CARE. We are here to support you. This is a general automated call. We will not share personal health information on this call.'),
('outbound_menu','rw','Ku butumwa rusange ku buzima bwo gutwita kanda 1. Gusaba ko itsinda ry’ubuzima riguhamagara kanda 2. Gusoza kanda 0.'),
('outbound_menu','en','For general pregnancy health information, press 1. To request a call back from your care team, press 2. To end, press 0.'),
('outbound_general_info','rw','Jya kwisuzumisha inda ku gihe kandi ukurikize inama z’abakozi b’ubuzima. Niba ufite amaraso, ububabare bukabije, umutwe uribwa cyane, cyangwa guhumeka bigoranye, hita ushaka ubuvuzi.'),
('outbound_general_info','en','Attend antenatal care on schedule and follow your health worker’s advice. For bleeding, severe pain, a severe headache, or difficulty breathing, seek professional care promptly.'),
('outbound_callback_ack','rw','Twakiriye ubusabe bwawe. Itsinda ry’ubuzima rizasuzuma ubusabe bwo kuguhamagara.'),
('outbound_callback_ack','en','Your request has been recorded. Your care team will review the request to call you back.'),
('outbound_goodbye','rw','Murakoze. M-CARE iragushimira. Murabeho.'),
('outbound_goodbye','en','Thank you for listening. Goodbye.'),
('outbound_invalid','rw','Icyo wahisemo nticyumvikanye. Ongera ugerageze.'),
('outbound_invalid','en','That selection was not recognized. Please try again.');
