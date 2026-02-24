<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('X-Frame-Options: DENY');

$payload = json_decode(file_get_contents('php://input'), true);
$file = $payload['file'] ?? '';
$targets = $payload['targets'] ?? [];

$allowedTargets = [
  'https://kuro-api-pannel.vercel.app/connect',
  'https://rjloader.vippanel.online/connect',
  'https://gamesever.vippanel.space/connect'
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Invalid request method']);
  exit;
}

if ($targets !== $allowedTargets) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Target URL list mismatch']);
  exit;
}

$uploadDir = __DIR__ . '/uploads';
$protectedDir = __DIR__ . '/protected';
if (!is_dir($protectedDir)) mkdir($protectedDir, 0755, true);

$sourcePath = realpath($uploadDir . '/' . basename($file));
if (!$sourcePath || !str_starts_with($sourcePath, realpath($uploadDir))) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid file']);
  exit;
}

$data = file_get_contents($sourcePath);
if ($data === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Unable to read file']);
  exit;
}

$matches = 0;
$originalSize = strlen($data);

foreach ($allowedTargets as $target) {
  if (strpos($data, $target) !== false) {
    $matches++;
    $enc = '';
    for ($i = 0; $i < strlen($target); $i++) {
      $enc .= chr(ord($target[$i]) ^ (0xAA ^ $i));
    }
    $data = str_replace($target, $enc, $data);
  }
}

$marker = "\nIKRU_X_YUVI_META_V1:" . json_encode(['targets' => count($allowedTargets), 'xor' => '0xAA^idx']) . "\n";
$data .= $marker;

$outName = 'protected_' . basename($file);
$outPath = $protectedDir . '/' . $outName;
file_put_contents($outPath, $data);

@unlink($sourcePath);

$deltaKb = round((strlen($data) - $originalSize) / 1024, 2);

echo json_encode([
  'ok' => true,
  'download' => 'protected/' . $outName,
  'matches' => $matches,
  'delta_kb' => $deltaKb
]);
