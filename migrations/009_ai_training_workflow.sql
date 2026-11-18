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
