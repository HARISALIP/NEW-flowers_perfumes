<?php
/**
 * api/login.php — Admin login via PHP session
 * POST: email, password
 */

if (session_status() === PHP_SESSION_NONE) session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$email    = postField('email');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['success' => false, 'error' => 'Email and password are required'], 400);
}

// Look up admin user
$stmt = $pdo->prepare('SELECT * FROM admin_users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid email or password'], 401);
}

// Set session
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_id']        = $admin['id'];
$_SESSION['admin_email']     = $admin['email'];
$_SESSION['admin_name']      = $admin['name'];

$user = [
    'id'    => $admin['id'],
    'name'  => $admin['name'],
    'email' => $admin['email'],
    'role'  => 'admin',
];

jsonResponse(['success' => true, 'user' => $user]);
