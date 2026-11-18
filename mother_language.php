<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';

if ((int)($_SESSION['log_role'] ?? 0) !== 5) {
    http_response_code(403);
    exit('Unauthorized');
}

$language = (string)($_POST['preferred_language'] ?? '');
$returnTo = basename((string)($_POST['return_to'] ?? 'mother_portal'));
$allowedPages = ['mother_portal','mother_report','mother_messages','mother_guidance','mother_education','mother_nutrition','mother_followup','mother_updates','profile'];
if (!in_array($returnTo, $allowedPages, true)) {
    $returnTo = 'mother_portal';
}

if (in_array($language, ['en','rw'], true)) {
    $db->prepare('UPDATE tbl_users SET preferred_language=? WHERE u_id=? AND is_active=1')->execute([$language,(int)$_SESSION['u_id']]);
    $q = $db->prepare('UPDATE tbl_mothers m JOIN tbl_users u ON u.mother_id=m.mother_id SET m.preferred_language=? WHERE u.u_id=? AND u.is_active=1 AND m.is_active=1');
    $q->execute([$language, (int)$_SESSION['u_id']]);
}

header('Location: ' . $returnTo);
exit;
