<?php
/**
 * api/bulk-upload.php — POST: Bulk import products from CSV or JSON (protected)
 * Accepts: multipart file upload with field name "file"
 */

require_once __DIR__ . '/../includes/auth-check.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['success' => false, 'error' => 'No file uploaded'], 400);
}

$filename = $_FILES['file']['name'];
$tmpPath  = $_FILES['file']['tmp_name'];
$ext      = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

$newProducts = [];

if ($ext === 'json') {
    $content = file_get_contents($tmpPath);
    $data    = json_decode($content, true);
    if (!is_array($data)) {
        jsonResponse(['success' => false, 'error' => 'Invalid JSON format'], 400);
    }
    $newProducts = $data;

} elseif ($ext === 'csv') {
    $handle = fopen($tmpPath, 'r');
    if (!$handle) {
        jsonResponse(['success' => false, 'error' => 'Cannot read CSV file'], 500);
    }
    $headers = fgetcsv($handle);
    if (!$headers) {
        fclose($handle);
        jsonResponse(['success' => false, 'error' => 'Empty CSV file'], 400);
    }
    $headers = array_map('trim', $headers);
    while (($row = fgetcsv($handle)) !== false) {
        if (count($row) >= count($headers)) {
            $newProducts[] = array_combine($headers, array_map('trim', $row));
        }
    }
    fclose($handle);
} else {
    jsonResponse(['success' => false, 'error' => 'Unsupported file type. Use .json or .csv'], 400);
}

if (empty($newProducts)) {
    jsonResponse(['success' => false, 'error' => 'No valid products found in file'], 400);
}

// Insert each product
$inserted = 0;
$errors   = [];

$stmt = $pdo->prepare("
    INSERT INTO products
        (title_en, title_ar, type_en, type_ar, desc_en, desc_ar,
         price, badge_en, badge_ar, image, sizes, emi_en, emi_ar,
         category, featured, is_placeholder_image, image_note_en, image_note_ar)
    VALUES
        (:title_en, :title_ar, :type_en, :type_ar, :desc_en, :desc_ar,
         :price, :badge_en, :badge_ar, :image, :sizes, :emi_en, :emi_ar,
         :category, :featured, :is_placeholder_image, :image_note_en, :image_note_ar)
");

foreach ($newProducts as $idx => $p) {
    try {
        $sizes = isset($p['sizes'])
            ? (is_array($p['sizes']) ? $p['sizes'] : parseSizes((string)$p['sizes']))
            : [];

        $stmt->execute([
            ':title_en'              => $p['title_en']    ?? '',
            ':title_ar'              => $p['title_ar']    ?? '',
            ':type_en'               => $p['type_en']     ?? 'Extrait De Parfum',
            ':type_ar'               => $p['type_ar']     ?? 'عطر مركز',
            ':desc_en'               => $p['desc_en']     ?? '',
            ':desc_ar'               => $p['desc_ar']     ?? '',
            ':price'                 => (float)($p['price'] ?? 0),
            ':badge_en'              => $p['badge_en']    ?? '',
            ':badge_ar'              => $p['badge_ar']    ?? '',
            ':image'                 => $p['image']       ?? 'images/perfume-placeholder.svg',
            ':sizes'                 => json_encode($sizes),
            ':emi_en'                => $p['emi_en']      ?? '',
            ':emi_ar'                => $p['emi_ar']      ?? '',
            ':category'              => $p['category']    ?? 'Perfume',
            ':featured'              => parseBool($p['featured'] ?? false) ? 1 : 0,
            ':is_placeholder_image'  => parseBool($p['isPlaceholderImage'] ?? false) ? 1 : 0,
            ':image_note_en'         => $p['imageNote_en'] ?? '',
            ':image_note_ar'         => $p['imageNote_ar'] ?? '',
        ]);
        $inserted++;
    } catch (Exception $e) {
        $errors[] = "Row $idx: " . $e->getMessage();
    }
}

jsonResponse([
    'success'  => true,
    'inserted' => $inserted,
    'errors'   => $errors,
    'message'  => "Bulk upload complete. $inserted products added."
]);
