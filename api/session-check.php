<?php
/**
 * api/session-check.php — Lightweight session status check
 * Called by auth.js on every page load to sync PHP session → JS state
 */

if (session_status() === PHP_SESSION_NONE) session_start();

header('Content-Type: application/json; charset=utf-8');

if (!empty($_SESSION['admin_logged_in'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => [
            'id'    => $_SESSION['admin_id']    ?? 0,
            'name'  => $_SESSION['admin_name']  ?? '',
            'email' => $_SESSION['admin_email'] ?? '',
            'role'  => 'admin',
        ]
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
