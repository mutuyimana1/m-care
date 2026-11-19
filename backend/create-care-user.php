<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli' || $argc !== 4) {
  fwrite(STDERR, "Usage: php backend/create-care-user.php <doctor|chw> <name> <email>\n");
  exit(2);
}
$role = $argv[1];
$name = trim($argv[2]);
$email = strtolower(trim($argv[3]));
if (!in_array($role, ['doctor', 'chw'], true) || $name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  fwrite(STDERR, "Provide a valid role, name, and email.\n"); exit(2);
}
fwrite(STDOUT, 'New password (minimum 10 characters): ');
$terminal = trim((string)shell_exec('stty -g 2>/dev/null'));
if ($terminal !== '') shell_exec('stty -echo');
$password = rtrim((string)fgets(STDIN), "\r\n");
if ($terminal !== '') { shell_exec('stty ' . escapeshellarg($terminal)); fwrite(STDOUT, "\n"); }
if (strlen($password) < 10) { fwrite(STDERR, "Password is too short.\n"); exit(2); }
$dsn = getenv('MCARE_DB_DSN') ?: 'mysql:host=127.0.0.1;dbname=mcare;charset=utf8mb4';
$db = new PDO($dsn, getenv('MCARE_DB_USER') ?: 'root', getenv('MCARE_DB_PASSWORD') ?: '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$storedRole = $role === 'doctor' ? 'nurse' : 'chw';
$stmt = $db->prepare('INSERT INTO users(email,full_name,role,password_hash,is_active) VALUES(?,?,?,?,1)');
$stmt->execute([$email, $name, $storedRole, password_hash($password, PASSWORD_DEFAULT)]);
fwrite(STDOUT, "Created $role account for $email.\n");
