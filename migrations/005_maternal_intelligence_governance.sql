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
