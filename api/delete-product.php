<?php
/**
 * api/delete-product.php — POST: Delete a product by ID (protected)
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

$stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
$stmt->execute([':id' => $id]);

if ($stmt->rowCount() === 0) {
    jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
}

jsonResponse(['success' => true, 'message' => 'Product deleted successfully']);
