<?php
declare(strict_types=1);

// Zone PHP 8+: fixed recipient, no browser-supplied mail headers or credentials.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(int $status, bool $ok): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok]);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false);
}
if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['https://elinebeauty.ee', 'https://www.elinebeauty.ee'], true)) respond(403, false);
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') respond(415, false);
$raw = file_get_contents('php://input', false, null, 0, 4097);
if ($raw === false || strlen($raw) > 4096) respond(413, false);
$data = json_decode($raw, true);
if (!is_array($data) || !is_string($data['name'] ?? null)
    || !is_bool($data['attending'] ?? null) || !is_bool($data['plusOne'] ?? null)
    || !is_string($data['website'] ?? null)) respond(422, false);
$name = trim($data['name']);
if ($name === '' || strlen($name) > 480 || preg_match('//u', $name) !== 1
    || preg_match('/[\x00-\x1F\x7F]/u', $data['name']) || preg_match_all('/./u', $name) > 120
    || (!$data['attending'] && $data['plusOne'])) respond(422, false);
if ($data['website'] !== '') respond(422, false);

// One locked, bounded temp file; stores only hashed IPs and short-lived timestamps.
$lock = @fopen(sys_get_temp_dir() . '/elinebeauty-kutse-rate.json', 'c+');
if (!$lock || !flock($lock, LOCK_EX)) respond(503, false);
$rates = json_decode(stream_get_contents($lock), true) ?: [];
$now = time();
$rates = array_filter($rates, fn($t) => is_int($t) && $t > $now - 60);
$key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (isset($rates[$key]) || count($rates) >= 10000) {
    header('Retry-After: 60');
    respond(429, false);
}
$rates[$key] = $now;
$encoded = json_encode($rates);
rewind($lock);
if (!ftruncate($lock, 0) || fwrite($lock, $encoded) !== strlen($encoded) || !fflush($lock)) respond(503, false);
flock($lock, LOCK_UN);
fclose($lock);

$body = "Eline Beauty avamispidu — 28. november kell 18:00\n\n"
    . "Nimi: $name\n"
    . 'Osaleb: ' . ($data['attending'] ? 'Jah' : 'Ei') . "\n"
    . 'Kaaslane: ' . ($data['plusOne'] ? 'Jah' : 'Ei') . "\n";
$sent = @mail('info@elinebeauty.ee', 'Eline Beauty avamispidu - RSVP', $body, [
    'From' => 'Eline Beauty <info@elinebeauty.ee>',
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
]);
respond($sent ? 200 : 502, $sent);
