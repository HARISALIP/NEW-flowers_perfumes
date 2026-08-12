<?php
/**
 * api/categories.php — GET distinct product categories
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../includes/db.php';

$stmt = $pdo->query("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category ASC");
$categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode($categories, JSON_UNESCAPED_UNICODE);
