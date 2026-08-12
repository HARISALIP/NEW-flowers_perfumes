<?php
/**
 * api/update-product.php — POST: Update a product (protected)
 * Requires POST field: id
 */

require_once __DIR__ . '/../includes/auth-check.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$id = (int)postField('id');
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid product ID'], 400);
}

// Verify product exists
$check = $pdo->prepare('SELECT id FROM products WHERE id = :id');
$check->execute([':id' => $id]);
if (!$check->fetch()) {
    jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
}

$sizes = parseSizes(postField('sizes'));

$stmt = $pdo->prepare("
    UPDATE products SET
        title_en             = :title_en,
        title_ar             = :title_ar,
        type_en              = :type_en,
        type_ar              = :type_ar,
        desc_en              = :desc_en,
        desc_ar              = :desc_ar,
        price                = :price,
        badge_en             = :badge_en,
        badge_ar             = :badge_ar,
        image                = :image,
        sizes                = :sizes,
        emi_en               = :emi_en,
        emi_ar               = :emi_ar,
        category             = :category,
        featured             = :featured,
        is_placeholder_image = :is_placeholder_image,
        image_note_en        = :image_note_en,
        image_note_ar        = :image_note_ar,
        updated_at           = NOW()
    WHERE id = :id
");

$stmt->execute([
    ':title_en'              => postField('title_en'),
    ':title_ar'              => postField('title_ar'),
    ':type_en'               => postField('type_en', 'Extrait De Parfum'),
    ':type_ar'               => postField('type_ar', 'عطر مركز'),
    ':desc_en'               => postField('desc_en'),
    ':desc_ar'               => postField('desc_ar'),
    ':price'                 => (float)(postField('price', '0')),
    ':badge_en'              => postField('badge_en'),
    ':badge_ar'              => postField('badge_ar'),
    ':image'                 => postField('image', 'images/perfume-placeholder.svg'),
    ':sizes'                 => json_encode($sizes),
    ':emi_en'                => postField('emi_en'),
    ':emi_ar'                => postField('emi_ar'),
    ':category'              => postField('category', 'Perfume'),
    ':featured'              => parseBool(postField('featured', '0')) ? 1 : 0,
    ':is_placeholder_image'  => parseBool(postField('is_placeholder_image', '0')) ? 1 : 0,
    ':image_note_en'         => postField('image_note_en'),
    ':image_note_ar'         => postField('image_note_ar'),
    ':id'                    => $id,
]);

jsonResponse(['success' => true, 'message' => 'Product updated successfully']);
