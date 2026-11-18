<?php
session_start();
date_default_timezone_set('Africa/Kigali');

$db_host = getenv('MCARE_DB_HOST') ?: 'localhost';
$db_port = (int)(getenv('MCARE_DB_PORT') ?: 3306);
$db_user = getenv('MCARE_DB_USER') ?: 'root';
$db_pass = getenv('MCARE_DB_PASSWORD') ?: '';
$db_database = getenv('MCARE_DB_DATABASE') ?: 'care_db';

try {
    $db = new PDO("mysql:host=$db_host;port=$db_port;dbname=$db_database;charset=utf8mb4", $db_user, $db_pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn = $db;
} catch (PDOException $e) {
    error_log('DB connection failed: ' . $e->getMessage());
    die("Contact system support if this error continues [DB Con err]");
}

$msg = '';
$msge = '';

$sqlsettings = $db->prepare("SELECT * FROM tbl_system_settings LIMIT 1");
$sqlsettings->execute();
$rowsettings = $sqlsettings->fetch(PDO::FETCH_ASSOC);
$com_name    = $rowsettings['system_name'] ?? 'M-CARE';
$com_email   = $rowsettings['system_email'] ?? '';
$com_contact = $rowsettings['system_contact'] ?? '';
$com_address = $rowsettings['system_address'] ?? '';
$com_logo    = $rowsettings['system_logo'] ?? 'logo.png';

function encryptor($action, $string) {
    $encrypt_method = "AES-256-CBC";
    $key = hash('sha256', 'MCARE_SECRET');
    $iv  = substr(hash('sha256', 'mcare@kigali'), 0, 16);
    if ($action == 'encrypt') return base64_encode(openssl_encrypt($string, $encrypt_method, $key, 0, $iv));
    return openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
}

function generate_uuid(): string { return bin2hex(random_bytes(16)); }

function audit_log($db, $user_id, $action, $table, $record_id, $old = null, $new = null) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $stmt = $db->prepare("INSERT INTO tbl_audit_log (user_id,action,table_name,record_id,old_values,new_values,ip_address) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([$user_id, $action, $table, $record_id, $old ? json_encode($old) : null, $new ? json_encode($new) : null, $ip]);
}
