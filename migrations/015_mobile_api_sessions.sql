CREATE TABLE IF NOT EXISTS tbl_mobile_api_sessions (
    session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id),
    UNIQUE KEY uq_mobile_api_sessions_token_hash (token_hash),
    KEY idx_mobile_api_sessions_user_expiry (user_id, expires_at),
    CONSTRAINT fk_mobile_api_session_user FOREIGN KEY (user_id)
        REFERENCES tbl_users (u_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
