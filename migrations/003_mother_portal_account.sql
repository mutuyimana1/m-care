-- Migration 003: Name the woman role and enforce one portal login per maternal profile.
-- Apply after 002_mother_role.sql on an existing database.

INSERT INTO tbl_roles (role_id, role_name) VALUES (5, 'Pregnant/postpartum woman')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

SET @mother_unique_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_users'
      AND index_name = 'uq_user_mother'
);
SET @mother_unique_sql = IF(
    @mother_unique_exists = 0,
    'ALTER TABLE tbl_users ADD UNIQUE KEY uq_user_mother (mother_id)',
    'SELECT 1'
);
PREPARE mother_unique_stmt FROM @mother_unique_sql;
EXECUTE mother_unique_stmt;
DEALLOCATE PREPARE mother_unique_stmt;
