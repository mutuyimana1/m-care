ALTER TABLE mcare_outbound_calls
    ADD COLUMN call_priority TINYINT UNSIGNED NOT NULL DEFAULT 5 AFTER status,
    ADD KEY idx_mcare_outbound_priority_schedule (status,call_priority,scheduled_at);
