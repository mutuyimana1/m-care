-- Additive M-CARE app tables. The existing users, maternal_profiles,
-- pregnancies, and symptom_reports tables are preserved as-is.
USE mcare;

CREATE TABLE IF NOT EXISTS mcare_api_sessions (
  token_hash CHAR(64) NOT NULL PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX mcare_api_sessions_user_idx (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mcare_app_records (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  record_type VARCHAR(40) NOT NULL,
  patient_id VARCHAR(100) NULL,
  owner_email VARCHAR(254) NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX mcare_app_records_type_idx (record_type),
  INDEX mcare_app_records_patient_idx (patient_id),
  INDEX mcare_app_records_owner_idx (owner_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
