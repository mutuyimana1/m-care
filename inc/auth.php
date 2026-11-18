<?php
if (!isset($_SESSION['u_id'])) {
    header('Location: ' . str_repeat('../', max(0, substr_count($_SERVER['PHP_SELF'], '/') - 2)) . 'index.php');
    exit;
}
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $submitted = $_POST['_csrf'] ?? '';
    if (!is_string($submitted) || !hash_equals($_SESSION['csrf_token'], $submitted)) {
        http_response_code(403);
        exit('Your form session expired. Reload the page and try again.');
    }
}
if (isset($_SESSION['password_change_required']) && $_SESSION['password_change_required']) {
    $current = basename($_SERVER['PHP_SELF'], '.php');
    if ($current !== 'update_password' && $current !== 'logout') {
        header('Location: update_password');
        exit;
    }
}

// Enforce page access on the server as well as hiding unavailable links in the menu.
$page = basename($_SERVER['PHP_SELF'], '.php');
$rolePages = [
    1 => ['*'],
    2 => ['home','chw_manual','mothers','mother_profile','mother_roadmap','outbound_calls','outbound_call_api','pregnancies','anc_visits','symptom_reports','alerts','referrals','chw_visits','nutrition_content','nutrition_checkins','education_content','reminders','messages','notifications','report_maternal','report_alerts','report_referrals','report_anc','maternal_intelligence','ai_training','set_language','profile','update_password','logout'],
    3 => ['home','chw_manual','mothers','mother_profile','mother_roadmap','outbound_calls','outbound_call_api','pregnancies','anc_visits','symptom_reports','alerts','referrals','chw_visits','nutrition_checkins','messages','notifications','maternal_intelligence','set_language','profile','update_password','logout'],
    4 => ['home','chw_manual','mothers','mother_profile','mother_roadmap','ivr_dashboard','ivr_api','pregnancies','anc_visits','symptom_reports','alerts','referrals','chw_visits','nutrition_checkins','nutrition_content','messages','notifications','report_maternal','report_alerts','report_referrals','report_anc','maternal_intelligence','ai_training','set_language','profile','update_password','logout'],
    5 => ['home','mother_portal','mother_roadmap','mother_report','mother_transcribe','mother_messages','mother_chat','mother_chatbot','mother_guidance','mother_assistant','mother_education','mother_nutrition','mother_followup','mother_updates','mother_language','set_language','profile','update_password','logout']
];
$allowed = $rolePages[(int)($_SESSION['log_role'] ?? 0)] ?? [];
if (!in_array('*', $allowed, true) && !in_array($page, $allowed, true)) {
    http_response_code(403);
    exit('You are not authorized to access this page.');
}
