<?php
/**
 * api/product.php — GET single product by ID
 * Usage: /api/product.php?id=123
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../includes/db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid product ID']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Product not found']);
    exit;
}

$product['sizes']    = json_decode($product['sizes'] ?? '[]', true) ?: [];
$product['featured'] = (bool)$product['featured'];
$product['is_placeholder_image'] = (bool)$product['is_placeholder_image'];
$product['price']    = (string)$product['price'];

echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
