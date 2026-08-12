<?php
/**
 * api/products.php — GET all products with filtering & pagination
 * Public endpoint — no auth required
 *
 * Query params:
 *   ?search=    keyword search (title_en, title_ar, category, type_en)
 *   ?category=  filter by category
 *   ?sort=      new|low|high|best|featured
 *   ?page=      page number (default 1)
 *   ?limit=     items per page (default 0 = all)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/helpers.php';

$search   = isset($_GET['search'])   ? trim($_GET['search'])   : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$sort     = isset($_GET['sort'])     ? trim($_GET['sort'])     : '';
$page     = max(1, (int)($_GET['page']  ?? 1));
$limit    = max(0, (int)($_GET['limit'] ?? 0));

// Build query
$where  = ['1=1'];
$params = [];

if ($search !== '') {
    $where[]    = '(title_en LIKE :search OR title_ar LIKE :search OR category LIKE :search OR type_en LIKE :search)';
    $params[':search'] = '%' . $search . '%';
}

if ($category !== '' && $category !== 'all') {
    $where[]    = 'category = :category';
    $params[':category'] = $category;
}

$whereSQL = implode(' AND ', $where);

// Sorting
$orderSQL = 'id ASC';
switch ($sort) {
    case 'new':      $orderSQL = 'id DESC';                  break;
    case 'low':      $orderSQL = 'price ASC';                break;
    case 'high':     $orderSQL = 'price DESC';               break;
    case 'best':     $orderSQL = 'featured DESC, id DESC';   break;
    case 'featured': $orderSQL = 'featured DESC, id ASC';    break;
}

// Count total
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE $whereSQL");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// Paginate
$offsetSQL = '';
if ($limit > 0) {
    $offset   = ($page - 1) * $limit;
    $offsetSQL = " LIMIT :limit OFFSET :offset";
}

$sql  = "SELECT * FROM products WHERE $whereSQL ORDER BY $orderSQL $offsetSQL";
$stmt = $pdo->prepare($sql);

foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
if ($limit > 0) {
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
}

$stmt->execute();
$rows = $stmt->fetchAll();

// Decode sizes JSON back to array for frontend compatibility
foreach ($rows as &$row) {
    $row['sizes']    = json_decode($row['sizes'] ?? '[]', true) ?: [];
    $row['featured'] = (bool)$row['featured'];
    $row['is_placeholder_image'] = (bool)$row['is_placeholder_image'];
    $row['price']    = (string)$row['price']; // keep as string to match original JSON
}
unset($row);

echo json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
