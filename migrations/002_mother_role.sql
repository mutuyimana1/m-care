-- Migration 002: Add the pregnant/postpartum woman account role and link users to mother records
-- Apply once to an existing care_db before deploying the mother portal code.

INSERT INTO tbl_roles (role_id, role_name) VALUES (5, 'Pregnant/postpartum woman')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

SET @mother_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_users'
      AND column_name = 'mother_id'
);
SET @mother_column_sql = IF(
    @mother_column_exists = 0,
    'ALTER TABLE tbl_users ADD COLUMN mother_id INT NULL AFTER facility_id',
    'SELECT 1'
);
PREPARE mother_column_stmt FROM @mother_column_sql;
EXECUTE mother_column_stmt;
DEALLOCATE PREPARE mother_column_stmt;

SET @mother_fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND constraint_name = 'fk_user_mother'
);
SET @mother_fk_sql = IF(
    @mother_fk_exists = 0,
    'ALTER TABLE tbl_users ADD CONSTRAINT fk_user_mother FOREIGN KEY (mother_id) REFERENCES tbl_mothers(mother_id)',
    'SELECT 1'
);
PREPARE mother_fk_stmt FROM @mother_fk_sql;
EXECUTE mother_fk_stmt;
DEALLOCATE PREPARE mother_fk_stmt;
