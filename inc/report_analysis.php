<?php
/** Build a repeatable summary of submitted fields; this function does not diagnose. */
function mcare_create_report_analysis(PDO $db, int $reportId, int $motherId, string $reference, array $report, array $symptomRows): array
{
    $symptomNames = array_values(array_unique(array_map(static fn(array $row): string => (string)$row['symptom_name'], $symptomRows)));
    $symptomIds = array_values(array_unique(array_map(static fn(array $row): int => (int)$row['symptom_id'], $symptomRows)));
    $prior = $db->prepare('SELECT report_id, symptoms_json FROM tbl_symptom_reports WHERE mother_id=? AND report_id<>? ORDER BY report_date DESC,report_id DESC LIMIT 30');
    $prior->execute([$motherId, $reportId]);
    $priorRows = $prior->fetchAll(PDO::FETCH_ASSOC);
    $overlapCounts = array_fill_keys($symptomIds, 0);
    foreach ($priorRows as $priorRow) {
        $priorIds = json_decode((string)$priorRow['symptoms_json'], true);
        foreach (array_intersect($symptomIds, array_map('intval', is_array($priorIds) ? $priorIds : [])) as $symptomId) {
            $overlapCounts[$symptomId]++;
        }
    }
    $repeatedNames = [];
    foreach ($symptomRows as $row) {
        if (($overlapCounts[(int)$row['symptom_id']] ?? 0) > 0) {
            $repeatedNames[] = (string)$row['symptom_name'];
        }
    }

    $missing = [];
    if (empty($report['onset_at'])) $missing[] = 'onset time';
    if (empty($report['severity'])) $missing[] = 'self-described severity';
    if (trim((string)($report['additional_notes'] ?? '')) === '') $missing[] = 'additional description';
    $maxCatalogueWeight = $symptomRows ? max(array_map(static fn(array $row): int => (int)($row['severity_weight'] ?? 1), $symptomRows)) : 0;
    $parts = [
        'Automated intake summary for report ' . $reference . '.',
        'Reported symptoms: ' . (implode(', ', $symptomNames) ?: 'none selected') . '.',
    ];
    if (!empty($report['severity'])) $parts[] = 'Self-described severity: ' . ucfirst((string)$report['severity']) . '.';
    if (!empty($report['symptom_pattern'])) $parts[] = 'Reported pattern: ' . str_replace('_', ' ', (string)$report['symptom_pattern']) . '.';
    $parts[] = 'Worsening reported: ' . (!empty($report['worsening']) ? 'yes' : 'no') . '.';
    $parts[] = 'Care already sought: ' . (!empty($report['already_sought_care']) ? 'yes' : 'no') . '.';
    $measurements = [];
    if (($report['reported_temperature'] ?? '') !== '') $measurements[] = 'temperature ' . $report['reported_temperature'] . ' °C';
    if (($report['reported_systolic'] ?? '') !== '' || ($report['reported_diastolic'] ?? '') !== '') {
        $measurements[] = 'blood pressure ' . (($report['reported_systolic'] ?? '') !== '' ? $report['reported_systolic'] : '—') . '/' . (($report['reported_diastolic'] ?? '') !== '' ? $report['reported_diastolic'] : '—');
    }
    if ($measurements) $parts[] = 'Measurements entered: ' . implode('; ', $measurements) . '.';
    if ($maxCatalogueWeight > 0) $parts[] = 'Configured symptom-catalogue maximum weight: ' . $maxCatalogueWeight . ' (routing metadata only).';
    $notes = trim((string)($report['additional_notes'] ?? ''));
    if ($notes !== '') {
        $noteExcerpt = mb_substr($notes, 0, 500, 'UTF-8');
        if (mb_strlen($notes, 'UTF-8') > 500) $noteExcerpt .= '…';
        $parts[] = 'Additional description in the reporter’s original wording: “' . $noteExcerpt . '”.';
    }
    $parts[] = 'Prior reports reviewed: ' . count($priorRows) . ' most recent report(s).' . ($repeatedNames ? ' Previously reported symptom(s) also selected: ' . implode(', ', array_unique($repeatedNames)) . '.' : ' No overlap with the selected catalogue symptoms was found in those records.');
    if ($missing) $parts[] = 'Not provided: ' . implode(', ', $missing) . '.';
    $parts[] = 'This summary restates submitted fields and recent report overlap. It is not a diagnosis or clinical triage decision; a qualified health worker must review it.';

    $findings = [
        'reported_symptoms' => $symptomNames,
        'self_described_severity' => $report['severity'] ?: null,
        'symptom_pattern' => $report['symptom_pattern'] ?: null,
        'worsening_reported' => !empty($report['worsening']),
        'care_already_sought' => !empty($report['already_sought_care']),
        'onset_at' => $report['onset_at'] ?: null,
        'measurements_entered' => $measurements,
        'catalogue_max_weight' => $maxCatalogueWeight,
        'additional_description_excerpt' => $notes === '' ? null : mb_substr($notes, 0, 500, 'UTF-8'),
        'prior_reports_reviewed' => count($priorRows),
        'previously_reported_selected_symptoms' => array_values(array_unique($repeatedNames)),
        'information_not_provided' => $missing,
        'summary_kind' => 'structured_intake_only',
    ];
    $summary = implode(' ', $parts);
    $save = $db->prepare("INSERT INTO tbl_report_analyses (report_id,analysis_version,summary_text,findings_json) VALUES (?,?,?,?)");
    $save->execute([$reportId, 'structured-intake-0.1', $summary, json_encode($findings, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE)]);
    return ['summary_text' => $summary, 'findings' => $findings, 'prior_reports_reviewed' => count($priorRows)];
}

/** Notify administrators plus the mother's assigned CHW and facility care staff. */
function mcare_notify_report_reviewers(PDO $db, array $mother, int $reportId, string $reference, string $priority): array
{
    $recipients = [];
    $admins = $db->query("SELECT u_id,preferred_language FROM tbl_users WHERE log_role=1 AND is_active=1 AND log_status=1")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($admins as $user) $recipients[(int)$user['u_id']] = $user['preferred_language'] ?? 'en';
    if (!empty($mother['chw_id'])) {
        $chw = $db->prepare('SELECT u_id,preferred_language FROM tbl_users WHERE u_id=? AND log_role=3 AND is_active=1 AND log_status=1');
        $chw->execute([(int)$mother['chw_id']]);
        if ($user = $chw->fetch(PDO::FETCH_ASSOC)) $recipients[(int)$user['u_id']] = $user['preferred_language'] ?? 'en';
    }
    if (!empty($mother['facility_id'])) {
        $staff = $db->prepare('SELECT u_id,preferred_language FROM tbl_users WHERE facility_id=? AND log_role IN (2,4) AND is_active=1 AND log_status=1');
        $staff->execute([(int)$mother['facility_id']]);
        foreach ($staff->fetchAll(PDO::FETCH_ASSOC) as $user) $recipients[(int)$user['u_id']] = $user['preferred_language'] ?? 'en';
    }
    $insert = $db->prepare('INSERT INTO tbl_notifications (user_id,notif_type,notif_message,reference_id,reference_type) VALUES (?,?,?,?,?)');
    foreach ($recipients as $userId => $language) {
        $message = $language === 'rw'
            ? "Raporo nshya y'ibimenyetso $reference irategereje gusuzumwa. Icyiciro cyo gukurikirana: " . strtoupper($priority) . ". Reba incamake yayo mu matangazo. Iki cyiciro ni icy'uburyo bwo gukurikirana gusa; si isuzuma ry'indwara."
            : "New symptom report $reference needs review. Catalogue routing priority: " . strtoupper($priority) . ". Open alerts to read its generated summary. This is an operational prompt, not a diagnosis.";
        $insert->execute([$userId, 'alert', $message, $reportId, 'symptom_report']);
    }
    return array_map('intval', array_keys($recipients));
}
