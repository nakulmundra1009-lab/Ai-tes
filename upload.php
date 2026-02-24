<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('X-Content-Type-Options: nosniff');

$uploadDir = __DIR__ . '/uploads';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['library'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing library file']);
    exit;
}

$file = $_FILES['library'];
$name = basename($file['name']);
$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
if ($ext !== 'so') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Only .so files accepted']);
    exit;
}
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'File exceeds 10MB']);
    exit;
}

$safeName = uniqid('lib_', true) . '.so';
$dest = $uploadDir . '/' . $safeName;
if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Upload failed']);
    exit;
}

echo json_encode(['ok' => true, 'file' => $safeName]);
