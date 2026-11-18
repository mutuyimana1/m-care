-- Store the interface language for every authenticated user account.
-- Idempotent so an installation that already has the column can be upgraded safely.
SET @mcare_language_column_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tbl_users'
      AND column_name = 'preferred_language'
);
SET @mcare_language_ddl = IF(
    @mcare_language_column_exists = 0,
    'ALTER TABLE tbl_users ADD COLUMN preferred_language VARCHAR(10) NOT NULL DEFAULT ''en'' AFTER log_role',
    'SELECT 1'
);
PREPARE mcare_language_stmt FROM @mcare_language_ddl;
EXECUTE mcare_language_stmt;
DEALLOCATE PREPARE mcare_language_stmt;

-- Keep existing maternal account choices in sync with the user-wide setting.
UPDATE tbl_users u
JOIN tbl_mothers m ON m.mother_id=u.mother_id
SET u.preferred_language=CASE WHEN m.preferred_language='rw' THEN 'rw' ELSE 'en' END
WHERE u.log_role=5;
