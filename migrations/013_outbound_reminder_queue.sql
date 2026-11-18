-- Link automated calls to an existing reminder without changing the reminder
-- delivery state used by other M-CARE notification channels.
ALTER TABLE mcare_outbound_calls
    MODIFY purpose ENUM('test','anc_followup','appointment_reminder','postnatal_followup','missed_appointment','worker_followup','medication_reminder') NOT NULL,
    ADD COLUMN source_reminder_id INT DEFAULT NULL AFTER mother_id,
    ADD UNIQUE KEY uq_mcare_outbound_reminder (source_reminder_id),
    ADD CONSTRAINT fk_mcare_outbound_reminder FOREIGN KEY (source_reminder_id) REFERENCES tbl_reminders(reminder_id) ON DELETE SET NULL;
