<?php
/**
 * api/upload-image.php — POST: Upload product image (protected)
 * Returns: { success: true, imageUrl: "images/filename.jpg" }
 */

require_once __DIR__ . '/../includes/auth-check.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['success' => false, 'error' => 'No file uploaded or upload error'], 400);
}

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
$fileType     = mime_content_type($_FILES['image']['tmp_name']);

if (!in_array($fileType, $allowedTypes)) {
    jsonResponse(['success' => false, 'error' => 'Invalid file type. Allowed: jpg, png, webp, gif, svg'], 400);
}

$maxSize = 5 * 1024 * 1024; // 5MB
if ($_FILES['image']['size'] > $maxSize) {
    jsonResponse(['success' => false, 'error' => 'File too large. Max 5MB allowed'], 400);
}

$uploadDir = __DIR__ . '/../images/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext      = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
$destPath = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
    jsonResponse(['success' => false, 'error' => 'Failed to save file'], 500);
}

jsonResponse(['success' => true, 'imageUrl' => 'images/' . $filename]);
