<?php
/** Summarize recorded information for professional review; never diagnose. */
function mcare_maternal_summary(array $pregnancy, ?array $history, ?array $latestAnc): array {
    $today = new DateTimeImmutable('today');
    $edd = !empty($pregnancy['edd']) ? new DateTimeImmutable($pregnancy['edd']) : null;
    $lmp = !empty($pregnancy['lmp']) ? new DateTimeImmutable($pregnancy['lmp']) : null;
    $days = $lmp ? (int)$lmp->diff($today)->format('%r%a') : ($edd ? 280 - (int)$today->diff($edd)->format('%r%a') : null);
    $weeks = $days !== null && $days >= 0 ? intdiv($days, 7) : null;
    $flags = [];
    if ($history) {
        foreach (['previous_preeclampsia','chronic_hypertension','diabetes','kidney_disease','multiple_pregnancy','previous_stillbirth','previous_severe_complication'] as $key) {
            if (!empty($history[$key])) $flags[] = $key;
        }
    }
    $missing = [];
    if (!$latestAnc) $missing[] = 'No ANC visit is recorded for this pregnancy.';
    else {
        foreach (['bp_systolic'=>'Blood pressure','weight'=>'Weight','temperature_c'=>'Temperature','hiv_status'=>'HIV screening status','syphilis_status'=>'Syphilis screening status'] as $field=>$label) {
            if ($latestAnc[$field] === null || $latestAnc[$field] === '') $missing[] = $label . ' is not recorded in the latest ANC visit.';
        }
    }
    if (!$history) $missing[] = 'Maternal history has not been recorded for this pregnancy.';
    return [
        'gestational_age_weeks'=>$weeks,
        'trimester'=>$weeks === null ? null : ($weeks < 14 ? 1 : ($weeks < 28 ? 2 : 3)),
        'dating_source'=>$pregnancy['dating_source'] ?? 'unknown',
        'dating_confidence'=>$pregnancy['dating_confidence'] ?? 'unknown',
        'estimated_due_date'=>$pregnancy['edd'] ?? null,
        'historical_risk_factors'=>$flags,
        'latest_anc'=>$latestAnc,
        'information_gaps'=>$missing,
        'clinical_interpretation'=>'Not provided. This is a summary of recorded data for a qualified professional to review.'
    ];
}
