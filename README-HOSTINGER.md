# FLOWER Perfumes — Hostinger Deployment Guide

> This is the PHP + MySQL version of the FLOWER Perfumes website, ready for Hostinger shared hosting.
> No Node.js is required.

---

## 📁 What's In This Folder

```
flowers-perfumes-hostinger/
├── index.html          Homepage
├── shop.html           All perfumes
├── product-detail.html Single product
├── cart.html           Shopping cart
├── checkout.html       Checkout
├── contact.html        Contact page
├── privacy-policy.html
├── terms.html
├── shipping.html
├── returns.html
├── header.html         Shared header partial
├── footer.html         Shared footer partial
├── login.php           Admin login (PHP session)
├── admin.php           Admin dashboard (protected)
├── logout.php          Logout handler
├── css/                Stylesheets
├── js/                 JavaScript files
├── images/             Product & site images
├── api/                PHP API endpoints
├── includes/           PHP shared files (db.php excluded from git)
├── database/           SQL schema + import script
├── .htaccess           Apache config & security
└── .gitignore
```

---

## 🚀 Step-by-Step Upload to Hostinger

### Step 1 — Log into Hostinger hPanel
Go to [hpanel.hostinger.com](https://hpanel.hostinger.com) and open your hosting.

### Step 2 — Open File Manager
Navigate to **Files → File Manager** and go to your `public_html` folder.

### Step 3 — Upload Files
Upload **all contents** of `flowers-perfumes-hostinger/` into `public_html/`.

> ⚠️ Upload the **contents** of the folder (not the folder itself).
> After upload, `public_html/index.html` should exist.

### Step 4 — Create MySQL Database
1. In hPanel go to **Databases → MySQL Databases**
2. Create database: `u265225504_flowers`
3. Create user: `u265225504_flowersdb`
4. Assign user to database with **All Privileges**

### Step 5 — Set the Database Password in `includes/db.php`
Edit `public_html/includes/db.php` and replace:
```php
define('DB_PASS', 'YOUR_DB_PASSWORD_HERE');
```
with your actual MySQL password.

> 🔒 Never commit `includes/db.php` to GitHub — it is in `.gitignore`.

### Step 6 — Run the Schema SQL
1. In hPanel go to **Databases → phpMyAdmin**
2. Select your database `u265225504_flowers`
3. Click **Import**
4. Upload the file: `database/schema.sql`
5. Click **Go**

This creates the `products` and `admin_users` tables.

### Step 7 — Import Products from products.json
Upload `products.json` to the **root** of `public_html/` (same level as `index.html`).

Then visit in your browser:
```
https://yourdomain.com/database/import_products.php?token=import_flower_2026
```

You will see each product listed as OK or SKIP. All ~350 products will be imported.

> After importing successfully, delete `products.json` from `public_html/` for security.

---

## 🔐 Admin Login

| Field | Value |
|-------|-------|
| URL | `https://yourdomain.com/login.php` |
| Email | Set in the database |
| Password | Set in the database |

> 🔒 Admin credentials are set in the database. Change the password after first login.
> To update the password, generate a new hash in phpMyAdmin or via PHP:
> ```php
> echo password_hash('YourNewPassword', PASSWORD_DEFAULT);
> ```
> Then run:
> ```sql
> UPDATE admin_users SET password_hash='<generated_hash>' WHERE email='your@email.com';
> ```

---

## ✅ Post-Upload Checklist

- [ ] Homepage loads (`https://yourdomain.com/`)
- [ ] CSS and images load correctly
- [ ] Shop loads products from MySQL (`/api/products.php`)
- [ ] Product detail page works (`?id=1`)
- [ ] Cart add/remove works (localStorage)
- [ ] Login page works (`/login.php`)
- [ ] Login with correct credentials redirects to admin
- [ ] Wrong credentials show an error
- [ ] Admin dashboard shows all products
- [ ] Add product → appears in table
- [ ] Edit product → changes saved
- [ ] Delete product → removed
- [ ] Logout destroys session
- [ ] Direct visit to `/admin.php` without login → redirected to `/login.php`
- [ ] `/includes/db.php` is not accessible via browser (should return 403)
- [ ] `/database/schema.sql` is not accessible via browser (should return 403)
- [ ] No console errors in browser DevTools

---

## 🔒 Security Notes

- `includes/db.php` is protected by `.htaccess` and `.gitignore`
- All admin API endpoints (`/api/add-product.php`, etc.) require a PHP session
- Directory listing is disabled via `Options -Indexes` in `.htaccess`
- Security headers are set (X-Frame-Options, X-Content-Type-Options, etc.)
- Image uploads validate MIME type and enforce a 5MB limit

---

## 📝 Notes

- **Cart** is localStorage-only (no backend) — this matches the original Node version
- **Admin credentials** in the database use `password_hash()` / `password_verify()` — never plain text
- The `products.json` import script is idempotent — running it multiple times skips duplicates
- The original Node/Express version (`flowers-perfumes/`) is **not modified** at all
