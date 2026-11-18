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
