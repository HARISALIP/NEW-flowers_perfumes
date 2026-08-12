<?php
/**
 * auth-check.php — PHP session guard for admin API endpoints
 * Include at the top of every protected API file.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please log in.']);
    exit;
}
