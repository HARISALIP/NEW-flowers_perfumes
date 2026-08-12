<?php
/**
 * login.php — Admin Login Page (PHP session-based)
 * Replaces login.html — same UI, real backend auth
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Already logged in → redirect to admin
if (!empty($_SESSION['admin_logged_in'])) {
    header('Location: /admin.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | FLOWER Perfumes</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/auth.js" defer></script>
    <script src="js/ui-loader.js" defer></script>
    <style>
        body { background: #f8f9fa; }
        .auth-container { max-width: 900px; margin: 100px auto; padding: 20px; }
        .auth-grid { display: grid; grid-template-columns: 1fr 1fr; background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); overflow: hidden; }
        .auth-form-side { padding: 50px; }
        .auth-form-side h2 { font-family: 'Poppins', sans-serif; margin-bottom: 20px; }
        .auth-image-side { background: linear-gradient(135deg, #0a0a0a, #1a1a2e); color: #fff; padding: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .auth-image-side img { max-width: 80%; margin-bottom: 30px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5)); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.95rem; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Inter', sans-serif; transition: border 0.3s; box-sizing: border-box; }
        .form-group input:focus { border-color: var(--primary); outline: none; }
        .error-msg { background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.3); color: #c0392b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: none; font-size: 0.9rem; }
        .error-msg.show { display: block; }
        @media(max-width: 768px) {
            .auth-container { margin: 120px auto 40px; padding: 16px; }
            .auth-grid { grid-template-columns: 1fr; }
            .auth-image-side { display: none; }
            .auth-form-side { padding: 28px; }
        }
    </style>
</head>

<body>
    <div id="header-placeholder"></div>

    <div class="auth-container">
        <div class="auth-grid">
            <div class="auth-form-side">
                <h2>Admin Login</h2>
                <p style="color: #666; margin-bottom: 30px;">Sign in to manage your FLOWER Perfumes boutique.</p>

                <div class="error-msg" id="login-error">Invalid email or password.</div>

                <form id="login-form-el">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="log-email" required placeholder="Flowerperfumes1989@gmail.com" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="log-pass" required placeholder="••••••••" autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="login-btn" style="width: 100%;">Sign In</button>
                </form>
            </div>

            <div class="auth-image-side" style="background: var(--bg-dark); color: var(--gold);">
                <img src="images/perfume1.jpg" alt="Perfume" style="border: 2px solid var(--gold); border-radius: 8px;">
                <h3 style="color: var(--gold); font-family: var(--font-display);">The Art of Fragrance</h3>
                <p style="color: #fff; opacity: 0.8; margin-top: 10px;">Experience the most exquisite collection of luxury perfumes.</p>
            </div>
        </div>
    </div>

    <div id="footer-placeholder"></div>

    <script>
        document.getElementById('login-form-el').addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn   = document.getElementById('login-btn');
            const errEl = document.getElementById('login-error');
            const email = document.getElementById('log-email').value;
            const pass  = document.getElementById('log-pass').value;

            btn.textContent = 'Signing in...';
            btn.disabled    = true;
            errEl.classList.remove('show');

            try {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', pass);

                const res  = await fetch('/api/login.php', { method: 'POST', body: formData });
                const json = await res.json();

                if (json.success) {
                    // Store in localStorage for UI updates
                    localStorage.setItem('fp_user', JSON.stringify(json.user));
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = '/admin.php';
                } else {
                    errEl.textContent = json.error || 'Invalid email or password.';
                    errEl.classList.add('show');
                    btn.textContent = 'Sign In';
                    btn.disabled    = false;
                }
            } catch (err) {
                errEl.textContent = 'Connection error. Please try again.';
                errEl.classList.add('show');
                btn.textContent = 'Sign In';
                btn.disabled    = false;
            }
        });
    </script>
</body>

</html>
