<?php
require_once __DIR__ . '/inc/mother_session.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}
if (!function_exists('curl_init')) {
    http_response_code(503);
    echo json_encode(['error' => 'Voice transcription is unavailable. Enter your report as text.']);
    exit;
}
if (!isset($_FILES['audio']) || !is_uploaded_file($_FILES['audio']['tmp_name'])) {
    http_response_code(422);
    echo json_encode(['error' => 'Record or select an audio clip first.']);
    exit;
}
$upload = $_FILES['audio'];
if ((int)$upload['error'] !== UPLOAD_ERR_OK || (int)$upload['size'] > 25 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['error' => 'Audio upload failed or exceeded the 25 MB limit.']);
    exit;
}
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($upload['tmp_name']) ?: '';
if (!in_array($mime, ['audio/wav', 'audio/x-wav', 'audio/vnd.wave', 'application/octet-stream'], true)) {
    http_response_code(415);
    echo json_encode(['error' => 'The recording format is not supported.']);
    exit;
}
$serviceUrl = rtrim((string)(getenv('MCARE_ASR_SERVICE_URL') ?: ''), '/');
$serviceToken = (string)(getenv('MCARE_ASR_SERVICE_TOKEN') ?: '');
if ($serviceUrl === '' || $serviceToken === '') {
    http_response_code(503);
    echo json_encode(['error' => 'Kinyarwanda voice transcription is not configured. You can enter the report as text.']);
    exit;
}
$file = new CURLFile($upload['tmp_name'], $mime, 'mother-report.wav');
$curl = curl_init($serviceUrl . '/v1/transcribe');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => ['file' => $file],
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $serviceToken],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 180,
]);
$response = curl_exec($curl);
$status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);
if (!is_string($response) || $status < 200 || $status >= 300) {
    http_response_code(503);
    echo json_encode(['error' => 'Speech recognition is unavailable. Please enter the report as text.']);
    exit;
}
$result = json_decode($response, true);
if (!is_array($result) || empty($result['text'])) {
    http_response_code(503);
    echo json_encode(['error' => 'No transcript was returned. Please enter the report as text.']);
    exit;
}
echo json_encode([
    'transcript' => (string)$result['text'],
    'language' => 'rw',
    'transcript_review_required' => true,
], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
