<?php
/**
 * api/admin-products.php — GET all products for admin panel (protected)
 */

require_once __DIR__ . '/../includes/auth-check.php';
require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

$stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
$rows = $stmt->fetchAll();

foreach ($rows as &$row) {
    $row['sizes']    = json_decode($row['sizes'] ?? '[]', true) ?: [];
    $row['featured'] = (bool)$row['featured'];
    $row['price']    = (string)$row['price'];
}
unset($row);

echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
