<?php
/**
 * api/add-product.php — POST: Add a new product (protected)
 */

require_once __DIR__ . '/../includes/auth-check.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$sizes = parseSizes(postField('sizes'));

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
]);

$newId = (int)$pdo->lastInsertId();
jsonResponse(['success' => true, 'id' => $newId, 'message' => 'Product added successfully']);
