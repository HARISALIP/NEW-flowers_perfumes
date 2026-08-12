<?php
/**
 * database/import_products.php
 * ─────────────────────────────────────────────────────────────
 * Imports all products from products.json into MySQL.
 * Run this ONCE after uploading: visit it in your browser or run via CLI.
 *
 * Usage (browser): https://yourdomain.com/database/import_products.php
 * Usage (CLI):     php database/import_products.php
 *
 * DUPLICATE PROTECTION: Uses (title_en, category) uniqueness check —
 * running this script multiple times will not create duplicates.
 * ─────────────────────────────────────────────────────────────
 */

// Only accessible from CLI or with a secret token in production
$allowCLI   = (PHP_SAPI === 'cli');
$token      = $_GET['token'] ?? '';
$secretToken = 'import_flower_2026';   // Change this or remove after first import

if (!$allowCLI && $token !== $secretToken) {
    http_response_code(403);
    echo "Access denied. Add ?token=import_flower_2026 to the URL.";
    exit;
}

header('Content-Type: text/plain; charset=utf-8');

// Load DB connection
$dbFile = __DIR__ . '/../includes/db.php';
if (!file_exists($dbFile)) {
    echo "ERROR: includes/db.php not found. Please configure it first.\n";
    exit(1);
}
require_once $dbFile;

// Load products.json (sibling of the project, or look in the project root)
$jsonPaths = [
    __DIR__ . '/../../flowers-perfumes/products.json',   // sibling folder (dev)
    __DIR__ . '/../products.json',                        // root of hostinger folder
];

$jsonFile = null;
foreach ($jsonPaths as $p) {
    if (file_exists($p)) { $jsonFile = $p; break; }
}

if (!$jsonFile) {
    echo "ERROR: products.json not found.\n";
    echo "Tried:\n";
    foreach ($jsonPaths as $p) echo "  - $p\n";
    echo "\nPlease upload products.json to the root of flowers-perfumes-hostinger/ and retry.\n";
    exit(1);
}

echo "Reading products from: $jsonFile\n";
$content  = file_get_contents($jsonFile);
$products = json_decode($content, true);

if (!is_array($products)) {
    echo "ERROR: Could not parse products.json.\n";
    exit(1);
}

echo "Found " . count($products) . " products in JSON.\n\n";

// Prepare INSERT + duplicate check
$checkStmt = $pdo->prepare(
    'SELECT id FROM products WHERE title_en = :title_en AND category = :category LIMIT 1'
);

$insertStmt = $pdo->prepare("
    INSERT INTO products
        (title_en, title_ar, type_en, type_ar, desc_en, desc_ar,
         price, badge_en, badge_ar, image, sizes, emi_en, emi_ar,
         category, featured, is_placeholder_image, image_note_en, image_note_ar)
    VALUES
        (:title_en, :title_ar, :type_en, :type_ar, :desc_en, :desc_ar,
         :price, :badge_en, :badge_ar, :image, :sizes, :emi_en, :emi_ar,
         :category, :featured, :is_placeholder_image, :image_note_en, :image_note_ar)
");

$inserted  = 0;
$skipped   = 0;
$errors    = [];

foreach ($products as $idx => $p) {
    $titleEn   = $p['title_en']   ?? '';
    $category  = $p['category']   ?? 'Perfume';

    // Duplicate check
    $checkStmt->execute([':title_en' => $titleEn, ':category' => $category]);
    if ($checkStmt->fetch()) {
        $skipped++;
        echo "SKIP (exists): [$idx] $titleEn — $category\n";
        continue;
    }

    $sizes = $p['sizes'] ?? [];
    if (!is_array($sizes)) {
        $sizes = array_map('trim', explode(',', (string)$sizes));
    }

    try {
        $insertStmt->execute([
            ':title_en'              => $titleEn,
            ':title_ar'              => $p['title_ar']         ?? '',
            ':type_en'               => $p['type_en']          ?? 'Extrait De Parfum',
            ':type_ar'               => $p['type_ar']          ?? 'عطر مركز',
            ':desc_en'               => $p['desc_en']          ?? '',
            ':desc_ar'               => $p['desc_ar']          ?? '',
            ':price'                 => (float)($p['price']    ?? 0),
            ':badge_en'              => $p['badge_en']         ?? '',
            ':badge_ar'              => $p['badge_ar']         ?? '',
            ':image'                 => $p['image']            ?? 'images/perfume-placeholder.svg',
            ':sizes'                 => json_encode($sizes),
            ':emi_en'                => $p['emi_en']           ?? '',
            ':emi_ar'                => $p['emi_ar']           ?? '',
            ':category'              => $category,
            ':featured'              => !empty($p['featured']) ? 1 : 0,
            ':is_placeholder_image'  => !empty($p['isPlaceholderImage']) ? 1 : 0,
            ':image_note_en'         => $p['imageNote_en']     ?? '',
            ':image_note_ar'         => $p['imageNote_ar']     ?? '',
        ]);
        $inserted++;
        echo "OK [$idx]: $titleEn — $category\n";
    } catch (Exception $e) {
        $errors[] = "Row $idx ($titleEn): " . $e->getMessage();
        echo "ERROR [$idx]: " . $e->getMessage() . "\n";
    }
}

echo "\n═══════════════════════════════════\n";
echo "Import complete!\n";
echo "  Inserted : $inserted\n";
echo "  Skipped  : $skipped\n";
echo "  Errors   : " . count($errors) . "\n";
if ($errors) {
    echo "\nErrors:\n";
    foreach ($errors as $err) echo "  - $err\n";
}
echo "═══════════════════════════════════\n";
