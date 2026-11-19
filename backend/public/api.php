<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function respond(int $status, array $body): never {
  http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit;
}
function body(): array {
  $data = json_decode(file_get_contents('php://input') ?: '[]', true);
  return is_array($data) ? $data : [];
}
function publicUser(array $row): array {
  $role = appRole((string)$row['role']);
  if ($role === null) respond(403, ['error' => 'This account role cannot use the mobile app.']);
  return ['email' => $row['email'], 'name' => $row['full_name'], 'role' => $role];
}
function appRole(string $role): ?string {
  if ($role === 'mother') return 'mother';
  if ($role === 'chw') return 'chw';
  if (in_array($role, ['doctor','nurse','professional','hospital_staff','facility_admin','system_admin'], true)) return 'doctor';
  return null;
}
function legacyPatient(array $row): array {
  $blank = array_fill_keys([
    'nationalId','preferredLanguage','sector','cell','village','facilityContactPhone',
    'emergencyContactName','emergencyContactPhone','communityHealthWorker','consentRecordedAt',
    'confirmationMethod','pregnancyResult','confirmationDate','pregnancyTestDate','clinicianName',
    'lastMenstrualPeriod','datingMethod','datingSource','gestationalAgeDays','gravida','para',
    'previousPregnancies','livingChildren','pregnancyOutcomes','previousDeliveryMode','lastBirthDate',
    'birthSpacing','currentSymptoms','complications','conditions','surgicalHistory','familyHistory',
    'mentalHealthHistory','medications','allergies','systolic','diastolic','weightKg','heightCm',
    'temperatureC','pulse','respiratoryRate','oxygenSaturation','fundalHeightCm','fetalHeartRate',
    'estimatedBabyWeightGrams','hemoglobin','bloodGroup','rhesusFactor','hiv','syphilis','urineProtein',
    'urineGlucose','hepatitisB','malaria','sickleCell','ultrasoundSummary','investigationSource',
    'otherTests','nextAppointmentDate','riskFactors','priorityFindings','missingAssessments','followUp',
    'carePlan','referralFacility','referralReason','referralOutcome','postpartumFollowUpDate',
    'careTeamMessage','reviewedBy','reviewedAt'
  ], '');
  return array_merge($blank, [
    'id' => 'MC-' . $row['id'], 'name' => $row['full_name'], 'phone' => $row['phone'],
    'motherAccountEmail' => strtolower((string)($row['email'] ?? '')),
    'dateOfBirth' => (string)($row['date_of_birth'] ?? ''), 'district' => (string)($row['district_name'] ?? ''),
    'facility' => (string)($row['facility_name'] ?? ''), 'communityHealthWorker' => (string)($row['chw_name'] ?? ''),
    'estimatedDueDate' => (string)($row['expected_delivery'] ?? ''),
    'gestationalAgeWeeks' => (string)($row['gestation_weeks'] ?? ''),
    'estimatedDueDate' => (string)($row['expected_delivery'] ?? ''),
    'postpartumStatus' => !empty($row['is_postpartum']) ? 'postpartum' : 'pregnant',
    'deliveryDate' => (string)($row['delivery_date'] ?? ''), 'consent' => !empty($row['consent']),
    'clinicianApproved' => false, 'referralStatus' => 'not-started',
    'createdAt' => (string)$row['created_at'],
  ]);
}
function legacySymptom(array $row): array {
  $labels = ['HE'=>'Vaginal or heavy bleeding','AP'=>'Severe abdominal pain','BR'=>'Trouble breathing','SH'=>'Severe headache or vision changes','CO'=>'Convulsions','FE'=>'Fever','FM'=>'Reduced or no baby movement','SC'=>'Other concern'];
  $code = (string)$row['symptom_code'];
  return [
    'id' => 'SYM-' . $row['id'], 'patientId' => 'MC-' . $row['maternal_id'],
    'symptoms' => [$labels[$code] ?? $code], 'notes' => (string)($row['notes'] ?? ''),
    'onset' => '', 'severity' => ucfirst(strtolower((string)$row['severity'])),
    'pattern' => 'Constant', 'worsening' => 'Not sure', 'contactedChw' => false,
    'visitedFacility' => false, 'temperatureReading' => '', 'bloodPressureReading' => '',
    'reportedAt' => (string)$row['created_at'], 'status' => 'new', 'actions' => [], 'reviewed' => false,
  ];
}
function ownsPatient(PDO $db, string $patientId, string $email): bool {
  if (preg_match('/^MC-(\d+)$/', $patientId, $match)) {
    $stmt = $db->prepare('SELECT 1 FROM maternal_profiles WHERE id=? AND email=?');
    $stmt->execute([(int)$match[1], $email]);
    if ($stmt->fetchColumn()) return true;
  }
  $stmt = $db->prepare("SELECT 1 FROM mcare_app_records WHERE id=? AND record_type='patient' AND owner_email=?");
  $stmt->execute([$patientId, $email]);
  return (bool)$stmt->fetchColumn();
}

try {
  $dsn = getenv('MCARE_DB_DSN') ?: 'mysql:host=127.0.0.1;dbname=mcare;charset=utf8mb4';
  $db = new PDO($dsn, getenv('MCARE_DB_USER') ?: 'root', getenv('MCARE_DB_PASSWORD') ?: '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Throwable $e) {
  respond(503, ['error' => 'Database unavailable. Start MySQL and check the MCARE_DB_* settings.']);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = body();

if ($action === 'health') respond(200, ['ok' => true]);

if ($action === 'signup' && $method === 'POST') {
  $email = strtolower(trim((string)($input['email'] ?? '')));
  $name = trim((string)($input['name'] ?? ''));
  $password = (string)($input['password'] ?? '');
  if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $name === '' || strlen($password) < 10) {
    respond(422, ['error' => 'Enter a valid email, name, and password of at least 10 characters.']);
  }
  try {
    $stmt = $db->prepare("INSERT INTO users(email,full_name,role,password_hash,is_active) VALUES(?,?,'mother',?,1)");
    $stmt->execute([$email, $name, password_hash($password, PASSWORD_DEFAULT)]);
  } catch (PDOException $e) {
    if ($e->getCode() === '23000') respond(409, ['error' => 'An account with that email already exists.']);
    throw $e;
  }
  $user = ['email' => $email, 'full_name' => $name, 'role' => 'mother'];
  respond(201, ['user' => $user, 'token' => issueToken($db, (int)$db->lastInsertId())]);
}

if ($action === 'login' && $method === 'POST') {
  $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1');
  $stmt->execute([strtolower(trim((string)($input['email'] ?? '')))]);
  $row = $stmt->fetch();
  if (!$row || !password_verify((string)($input['password'] ?? ''), $row['password_hash'])) {
    respond(401, ['error' => 'Email or password is incorrect.']);
  }
  if (appRole((string)$row['role']) === null) respond(403, ['error' => 'This account role cannot use the mobile app.']);
  respond(200, ['user' => publicUser($row), 'token' => issueToken($db, (int)$row['id'])]);
}

$user = authenticatedUser($db);
if ($action === 'logout' && $method === 'POST') {
  $db->prepare('DELETE FROM mcare_api_sessions WHERE token_hash = ?')->execute([hash('sha256', bearerToken())]);
  respond(200, ['ok' => true]);
}

if ($action === 'records' && $method === 'GET') {
  $type = (string)($_GET['type'] ?? '');
  $allowed = ['patient','symptom','followup','nutrition','activity','voice'];
  if (!in_array($type, $allowed, true)) respond(422, ['error' => 'Unknown record type.']);
  if ($type === 'patient') {
    if ($user['role'] === 'mother') {
      $query = $db->prepare('SELECT m.*, d.name AS district_name, f.name AS facility_name, ch.full_name AS chw_name, (SELECT c.consented FROM consent_records c WHERE c.maternal_id=m.id ORDER BY c.recorded_at DESC LIMIT 1) AS consent, p.gestation_weeks, p.expected_delivery, p.is_postpartum, p.delivery_date FROM maternal_profiles m LEFT JOIN districts d ON d.id=m.district_id LEFT JOIN facilities f ON f.id=m.facility_id LEFT JOIN users ch ON ch.id=m.assigned_chw_id LEFT JOIN pregnancies p ON p.maternal_id=m.id WHERE m.email=? ORDER BY p.id DESC, m.id DESC');
      $query->execute([$user['email']]);
    } elseif ($user['role'] === 'chw') {
      $query = $db->prepare('SELECT m.*, d.name AS district_name, f.name AS facility_name, ch.full_name AS chw_name, (SELECT c.consented FROM consent_records c WHERE c.maternal_id=m.id ORDER BY c.recorded_at DESC LIMIT 1) AS consent, p.gestation_weeks, p.expected_delivery, p.is_postpartum, p.delivery_date FROM maternal_profiles m LEFT JOIN districts d ON d.id=m.district_id LEFT JOIN facilities f ON f.id=m.facility_id LEFT JOIN users ch ON ch.id=m.assigned_chw_id LEFT JOIN pregnancies p ON p.maternal_id=m.id WHERE m.assigned_chw_id=? ORDER BY p.id DESC, m.id DESC');
      $query->execute([$user['id']]);
    } else {
      $query = $db->query('SELECT m.*, d.name AS district_name, f.name AS facility_name, ch.full_name AS chw_name, (SELECT c.consented FROM consent_records c WHERE c.maternal_id=m.id ORDER BY c.recorded_at DESC LIMIT 1) AS consent, p.gestation_weeks, p.expected_delivery, p.is_postpartum, p.delivery_date FROM maternal_profiles m LEFT JOIN districts d ON d.id=m.district_id LEFT JOIN facilities f ON f.id=m.facility_id LEFT JOIN users ch ON ch.id=m.assigned_chw_id LEFT JOIN pregnancies p ON p.maternal_id=m.id ORDER BY p.id DESC, m.id DESC');
    }
    $legacyPatients = [];
    $seen = [];
    foreach ($query->fetchAll() as $row) {
      if (isset($seen[$row['id']])) continue;
      $seen[$row['id']] = true;
      $legacyPatients[] = legacyPatient($row);
    }
    $savedSql = "SELECT payload FROM mcare_app_records WHERE record_type='patient'";
    if ($user['role'] === 'mother') $savedSql .= ' AND owner_email=?';
    if ($user['role'] === 'chw') $savedSql .= " AND JSON_UNQUOTE(JSON_EXTRACT(payload,'$.communityHealthWorker'))=?";
    $saved = $db->prepare($savedSql . ' ORDER BY created_at DESC');
    $user['role'] === 'mother' ? $saved->execute([$user['email']]) : ($user['role'] === 'chw' ? $saved->execute([$user['full_name']]) : $saved->execute());
    $savedPatients = array_map(fn($r) => json_decode($r['payload'], true), $saved->fetchAll());
    foreach ($savedPatients as $record) {
      if ($record) $legacyPatients = array_values(array_filter($legacyPatients, fn($item) => $item['id'] !== $record['id']));
    }
    respond(200, ['records' => array_merge($savedPatients, $legacyPatients)]);
  }
  if ($type === 'symptom') {
    if ($user['role'] === 'mother') {
      $query = $db->prepare('SELECT r.* FROM symptom_reports r JOIN maternal_profiles m ON m.id=r.maternal_id WHERE m.email=? ORDER BY r.created_at DESC');
      $query->execute([$user['email']]);
    } elseif ($user['role'] === 'chw') {
      $query = $db->prepare('SELECT r.* FROM symptom_reports r JOIN maternal_profiles m ON m.id=r.maternal_id WHERE m.assigned_chw_id=? ORDER BY r.created_at DESC');
      $query->execute([$user['id']]);
    } else {
      $query = $db->query('SELECT * FROM symptom_reports ORDER BY created_at DESC');
    }
    $legacyReports = array_map('legacySymptom', $query->fetchAll());
    $savedSql = "SELECT payload FROM mcare_app_records WHERE record_type='symptom'";
    if ($user['role'] === 'mother') $savedSql .= ' AND patient_id IN (SELECT CONCAT(' . $db->quote('MC-') . ',id) FROM maternal_profiles WHERE email=?)';
    if ($user['role'] === 'chw') $savedSql .= ' AND patient_id IN (SELECT CONCAT(' . $db->quote('MC-') . ',id) FROM maternal_profiles WHERE assigned_chw_id=?)';
    $saved = $db->prepare($savedSql . ' ORDER BY created_at DESC');
    $user['role'] === 'mother' ? $saved->execute([$user['email']]) : ($user['role'] === 'chw' ? $saved->execute([$user['id']]) : $saved->execute());
    $savedReports = array_map(fn($r) => json_decode($r['payload'], true), $saved->fetchAll());
    respond(200, ['records' => array_merge($savedReports, $legacyReports)]);
  }
  if ($user['role'] === 'mother') {
    $stmt = $db->prepare("SELECT id FROM mcare_app_records WHERE record_type='patient' AND owner_email=?");
    $stmt->execute([$user['email']]);
    $ids = array_column($stmt->fetchAll(), 'id');
    if (!$ids) { respond(200, ['records' => []]); }
    else {
      $query = $db->prepare('SELECT payload FROM mcare_app_records WHERE record_type=? AND patient_id IN (' . implode(',', array_fill(0, count($ids), '?')) . ') ORDER BY created_at DESC');
      $query->execute(array_merge([$type], $ids));
    }
  } elseif ($user['role'] === 'chw') {
    $assigned = $db->prepare('SELECT CONCAT("MC-",id) AS id FROM maternal_profiles WHERE assigned_chw_id=?');
    $assigned->execute([$user['id']]);
    $patientIds = array_column($assigned->fetchAll(), 'id');
    if (!$patientIds) respond(200, ['records' => []]);
    $query = $db->prepare('SELECT payload FROM mcare_app_records WHERE record_type=? AND patient_id IN (' . implode(',', array_fill(0, count($patientIds), '?')) . ') ORDER BY created_at DESC');
    $query->execute(array_merge([$type], $patientIds));
  } else {
    $query = $db->prepare('SELECT payload FROM mcare_app_records WHERE record_type=? ORDER BY created_at DESC');
    $query->execute([$type]);
  }
  respond(200, ['records' => array_map(fn($r) => json_decode($r['payload'], true), $query->fetchAll())]);
}

if ($action === 'records' && $method === 'POST') {
  $type = (string)($input['type'] ?? ''); $record = $input['record'] ?? null;
  $allowed = ['patient','symptom','followup','nutrition','activity','voice'];
  if (!in_array($type, $allowed, true) || !is_array($record) || empty($record['id'])) respond(422, ['error' => 'Invalid record.']);
  if ($type === 'patient' && $user['role'] === 'mother') respond(403, ['error' => 'Only care staff can register a maternal record.']);
  $patientId = $type === 'patient' ? (string)$record['id'] : (string)($record['patientId'] ?? '');
  $owner = $type === 'patient' ? strtolower((string)($record['motherAccountEmail'] ?? '')) : null;
  if ($type !== 'patient' && $user['role'] === 'mother') {
    if (!ownsPatient($db, $patientId, $user['email'])) respond(403, ['error' => 'This record is not linked to your account.']);
  }
  $stmt = $db->prepare('INSERT INTO mcare_app_records(id,record_type,patient_id,owner_email,payload) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload), patient_id=VALUES(patient_id), owner_email=VALUES(owner_email)');
  $stmt->execute([(string)$record['id'], $type, $patientId ?: null, $owner ?: null, json_encode($record, JSON_THROW_ON_ERROR)]);
  respond(201, ['record' => $record]);
}

if ($action === 'records' && $method === 'PATCH') {
  $id = (string)($_GET['id'] ?? ''); $type = (string)($_GET['type'] ?? ''); $record = $input['record'] ?? null;
  if ($id === '' || !is_array($record) || ($record['id'] ?? '') !== $id) respond(422, ['error' => 'Invalid record update.']);
  $stmt = $db->prepare('SELECT patient_id,owner_email FROM mcare_app_records WHERE id=? AND record_type=?');
  $stmt->execute([$id, $type]); $existing = $stmt->fetch();
  if (!$existing) respond(404, ['error' => 'Record not found.']);
  if ($user['role'] === 'mother') {
    if ($type === 'patient' || !in_array($type, ['nutrition','voice'], true)) respond(403, ['error' => 'Not permitted.']);
    if (!ownsPatient($db, (string)$existing['patient_id'], $user['email'])) respond(403, ['error' => 'Not permitted.']);
  }
  $db->prepare('UPDATE mcare_app_records SET payload=? WHERE id=?')->execute([json_encode($record, JSON_THROW_ON_ERROR), $id]);
  respond(200, ['record' => $record]);
}

respond(404, ['error' => 'Unknown API action.']);

function bearerToken(): string {
  $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  return preg_match('/^Bearer\s+(.+)$/i', $header, $m) ? $m[1] : '';
}
function issueToken(PDO $db, int $userId): string {
  $token = bin2hex(random_bytes(32));
  $db->prepare('INSERT INTO mcare_api_sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(NOW(), INTERVAL 30 DAY))')
    ->execute([hash('sha256', $token), $userId]);
  return $token;
}
function authenticatedUser(PDO $db): array {
  $token = bearerToken(); if ($token === '') respond(401, ['error' => 'Sign in required.']);
  $stmt = $db->prepare('SELECT u.* FROM mcare_api_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>NOW() AND u.is_active=1');
  $stmt->execute([hash('sha256', $token)]); $user = $stmt->fetch();
  if (!$user) respond(401, ['error' => 'Session expired. Please sign in again.']);
  $user['role'] = appRole((string)$user['role']);
  if ($user['role'] === null) respond(403, ['error' => 'This account role cannot use the mobile app.']);
  return $user;
}
