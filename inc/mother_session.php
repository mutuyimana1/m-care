<?php
require_once __DIR__ . '/connect.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/mother_i18n.php';

if ((int)($_SESSION['log_role'] ?? 0) !== 5) {
    http_response_code(403);
    exit('This page is for pregnant and postpartum women.');
}
$motherAccount = $db->prepare('SELECT u.mother_id,m.* FROM tbl_users u JOIN tbl_mothers m ON m.mother_id=u.mother_id WHERE u.u_id=? AND u.is_active=1 AND m.is_active=1');
$motherAccount->execute([(int)$_SESSION['u_id']]);
$mother = $motherAccount->fetch(PDO::FETCH_ASSOC);
if (!$mother) {
    http_response_code(403);
    exit('Your account is not linked to an active maternal profile. Please contact your M-CARE care team.');
}
$motherId = (int)$mother['mother_id'];
$language = $mother['preferred_language'] === 'rw' ? 'rw' : 'en';
$t = fn($label) => mcare_mother_t($label, $language);
$e = fn($value) => htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
