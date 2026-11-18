-- Persist structured state for the existing M-CARE maternal chatbot.
-- Message content is retained only to support the active conversation and its
-- symptom context; this is not training data and must not be used for model
-- improvement without a separate consent and review workflow.
CREATE TABLE IF NOT EXISTS tbl_mcare_chat_conversations (
    conversation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    user_id INT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'rw',
    status ENUM('active','closed') NOT NULL DEFAULT 'active',
    conversation_state JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_mcare_chat_owner_status (mother_id,user_id,status,updated_at),
    CONSTRAINT fk_mcare_chat_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id),
    CONSTRAINT fk_mcare_chat_user FOREIGN KEY (user_id) REFERENCES tbl_users(u_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_mcare_chat_turns (
    turn_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT UNSIGNED NOT NULL,
    speaker ENUM('mother','mcare') NOT NULL,
    original_text MEDIUMTEXT NOT NULL,
    normalized_text MEDIUMTEXT NULL,
    structured_data JSON NULL,
    intent VARCHAR(80) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_mcare_chat_turn_order (conversation_id,turn_id),
    CONSTRAINT fk_mcare_chat_turn_conversation FOREIGN KEY (conversation_id)
        REFERENCES tbl_mcare_chat_conversations(conversation_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
