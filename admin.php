<?php
/**
 * admin.php — Admin Dashboard (PHP session-protected)
 * Replaces admin.html — same UI, real server-side auth guard
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Server-side guard: redirect if not logged in
if (empty($_SESSION['admin_logged_in'])) {
    header('Location: /login.php?redirect=admin');
    exit;
}

$adminName = htmlspecialchars($_SESSION['admin_name'] ?? 'Admin');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard | FLOWER Perfumes</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css?v=1.1">
    <script src="js/auth.js" defer></script>
    <script src="js/ui-loader.js?v=1.2" defer></script>

    <style>
        body { background: #000; color: #fff; }
        .admin-header { background: #050505; color: var(--gold); padding: 200px 0 80px 0; border-bottom: 1px solid #111; }
        .admin-header h1 { font-family: var(--font-display); color: var(--gold); font-size: 2.5rem; }

        .admin-table-container { background: #0a0a0a; border-radius: 12px; border: 1px solid #111; padding: 20px; margin-top: 40px; overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 15px; border-bottom: 1px solid #222; color: var(--gold); text-transform: uppercase; font-size: 0.8rem; }
        .admin-table td { padding: 15px; border-bottom: 1px solid #111; vertical-align: middle; }
        .admin-img-cell img { width: 60px; height: 60px; object-fit: cover; border-radius: 5px; border: 1px solid #222; }

        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; align-items: center; justify-content: center; }
        .modal.active { display: flex; }
        .modal-content { background: #0a0a0a; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 40px; border-radius: 15px; border: 1px solid var(--gold); position: relative; }
        .modal-close { position: absolute; top: 20px; right: 20px; font-size: 2rem; color: var(--gold); cursor: pointer; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: #aaa; font-size: 0.8rem; text-transform: uppercase; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; background: #111; border: 1px solid #222; color: #fff; border-radius: 5px; font-family: inherit; box-sizing: border-box; }
        .form-row { display: flex; gap: 20px; }
        .form-row .form-group { flex: 1; }

        .btn-gold { background: var(--gold-gradient-rich); color: #000; font-weight: 700; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; }
        .btn-icon { background: none; border: none; color: var(--gold); cursor: pointer; font-size: 1.1rem; margin: 0 5px; transition: 0.3s; }
        .btn-icon:hover { color: #fff; transform: scale(1.2); }
        .btn-delete:hover { color: #ff4444; }

        .toast { position: fixed; bottom: 30px; right: 30px; background: #1a2a1a; color: var(--gold); border: 1px solid var(--gold); padding: 14px 22px; border-radius: 8px; z-index: 99999; display: none; font-family: Montserrat, sans-serif; font-size: 0.9rem; }
        .toast.show { display: block; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }

        @media (max-width: 900px) {
            .admin-header { padding: 130px 0 44px 0; }
            .admin-header .container { flex-direction: column !important; align-items: flex-start !important; gap: 18px; }
            .admin-header .container > div:last-child { flex-wrap: wrap; width: 100%; }
            .form-row { flex-direction: column; gap: 0; }
            .modal-content { padding: 24px; }
        }
        @media (max-width: 480px) {
            .admin-header h1 { font-size: 2rem; }
            .admin-table th, .admin-table td { padding: 10px; }
            .modal-content { padding: 18px; width: calc(100% - 20px); }
        }
        
        /* Hide floating action buttons (circles) in admin panel */
        .floating-actions .btn-call,
        .floating-actions .btn-wa {
            display: none !important;
        }
    </style>
</head>
<body>

    <div id="header-placeholder"></div>

    <section class="admin-header">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1>Boutique Management</h1>
                <p style="color: #888;">Welcome, <?= $adminName ?>. Manage your exclusive FLOWER Perfumes collection.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <input type="file" id="bulk-upload-input" accept=".csv,.json" style="display: none;">
                <button class="btn-outline" id="bulk-upload-btn" style="background: none; border: 1px solid var(--gold); color: var(--gold); padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-file-upload"></i> Bulk Upload
                </button>
                <button class="btn-outline" id="sample-download-btn" style="background: none; border: 1px solid #333; color: #888; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-file-download"></i> Sample
                </button>
                <button class="btn-gold" onclick="openModal('add')" style="font-size: 0.85rem;">
                    <i class="fas fa-plus"></i> Add Perfume
                </button>
                <button onclick="doLogout()" style="background: none; border: 1px solid #333; color: #888; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    </section>

    <div class="container">
        <!-- Search Option -->
        <div class="search-container" style="margin-top: 30px; display: flex; justify-content: flex-end;">
            <div style="position: relative; width: 100%; max-width: 400px;">
                <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #888;"></i>
                <input type="text" id="admin-search-input" placeholder="Search product name or category..." style="width: 100%; padding: 12px 12px 12px 45px; background: #0a0a0a; border: 1px solid #222; color: #fff; border-radius: 8px; font-family: inherit; font-size: 0.9rem; box-sizing: border-box; transition: 0.3s;" onfocus="this.style.borderColor='var(--gold)';" onblur="this.style.borderColor='#222';">
            </div>
        </div>

        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th class="admin-img-cell">Img</th>
                        <th>Product (EN / AR)</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="admin-product-list">
                    <tr><td colspan="6" style="text-align:center; padding:40px; color:#555;">Loading products...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Product Modal -->
    <div class="modal" id="product-modal">
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            <h2 id="modal-title" style="color: var(--gold); font-family: var(--font-display); margin-bottom: 30px;">Add New Product</h2>

            <form id="product-form">
                <input type="hidden" id="edit-id">

                <div class="form-row">
                    <div class="form-group">
                        <label>Title (English)</label>
                        <input type="text" id="prod-title-en" required placeholder="e.g. MIDNIGHT OUD">
                    </div>
                    <div class="form-group">
                        <label>Title (Arabic)</label>
                        <input type="text" id="prod-title-ar" dir="rtl" placeholder="مثلاً: عود منتصف الليل">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Type (English)</label>
                        <input type="text" id="prod-type-en" placeholder="e.g. Extrait De Parfum">
                    </div>
                    <div class="form-group">
                        <label>Type (Arabic)</label>
                        <input type="text" id="prod-type-ar" dir="rtl" placeholder="عطر مركز">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <input type="text" id="prod-category" required placeholder="e.g. Signature, Oud, Floral">
                    </div>
                    <div class="form-group">
                        <label>Price (QR)</label>
                        <input type="number" id="prod-price" required placeholder="480">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Sizes (Comma Separated)</label>
                        <input type="text" id="prod-sizes" placeholder="e.g. 100ml, 50ml, 15ml">
                    </div>
                    <div class="form-group">
                        <label>Image URL / Path</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="prod-image" placeholder="images/perfume5.jpg" style="flex: 1;">
                            <label for="image-upload" style="background: none; border: 1px solid var(--gold); color: var(--gold); padding: 12px 18px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; margin: 0; white-space: nowrap; transition: 0.3s;" onmouseover="this.style.background='rgba(212,175,55,0.1)'" onmouseout="this.style.background='none'">
                                <i class="fas fa-upload"></i> Upload
                            </label>
                            <input type="file" id="image-upload" accept="image/*" style="display: none;">
                        </div>
                        <span id="upload-status" style="font-size: 0.75rem; color: #888; display: block; margin-top: 5px;"></span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Description (English)</label>
                        <textarea id="prod-desc-en" rows="3" placeholder="Dark, mysterious..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Description (Arabic)</label>
                        <textarea id="prod-desc-ar" dir="rtl" rows="3" placeholder="داكن، غامض..."></textarea>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Badge (English)</label>
                        <input type="text" id="prod-badge-en" placeholder="e.g. LONGEST-LASTING">
                    </div>
                    <div class="form-group">
                        <label>Badge (Arabic)</label>
                        <input type="text" id="prod-badge-ar" dir="rtl" placeholder="الأطول ثباتاً">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>EMI Text (English)</label>
                        <input type="text" id="prod-emi-en" placeholder="or QR 33/Month">
                    </div>
                    <div class="form-group">
                        <label>EMI Text (Arabic)</label>
                        <input type="text" id="prod-emi-ar" dir="rtl" placeholder="أو 33 ر.ق/شهر">
                    </div>
                </div>

                <div class="form-group">
                    <input type="checkbox" id="prod-featured" style="width: auto;">
                    <label for="prod-featured" style="display: inline; margin-left: 10px;">Feature on Homepage</label>
                </div>

                <button type="submit" class="btn-gold" style="width: 100%; margin-top: 20px;">Save Boutique Product</button>
            </form>
        </div>
    </div>

    <div class="toast" id="admin-toast"></div>
    <div id="footer-placeholder"></div>

    <script type="module" src="js/data.js"></script>
    <script>
        // ── Toast ──
        function showAdminToast(msg, duration = 3000) {
            const t = document.getElementById('admin-toast');
            t.textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), duration);
        }

        // ── Render table ──
        function displayProducts(products) {
            const list = document.getElementById('admin-product-list');
            if (!list) return;

            if (!products.length) {
                list.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#555;">No products found.</td></tr>';
                return;
            }

            list.innerHTML = products.map(p => `
                <tr>
                    <td class="admin-img-cell">
                        <img src="${p.image}" onerror="this.src='images/perfume-placeholder.svg'" alt="${p.title_en}">
                    </td>
                    <td>
                        <div style="font-weight:600;color:#fff;">${p.title_en || 'Untitled'}</div>
                        <div style="color:var(--gold);font-size:0.8rem;">${p.title_ar || ''}</div>
                    </td>
                    <td>${p.category || 'Perfume'}</td>
                    <td>QR ${p.price || '0'}</td>
                    <td>
                        <span style="padding:4px 10px;border-radius:20px;font-size:0.7rem;background:${p.featured ? 'rgba(212,175,55,0.1)' : '#111'};color:${p.featured ? 'var(--gold)' : '#555'};border:1px solid ${p.featured ? 'var(--gold)' : '#222'};">
                            ${p.featured ? 'FEATURED' : 'NORMAL'}
                        </span>
                    </td>
                    <td>
                        <div style="display:flex;gap:5px;">
                            <a href="product-detail.html?id=${p.id}" target="_blank" class="btn-icon" title="View"><i class="fas fa-eye"></i></a>
                            <button class="btn-icon" onclick="openEdit(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="confirmDelete(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function filterAdminProducts() {
            const query = (document.getElementById('admin-search-input')?.value || '').toLowerCase().trim();
            const products = window._adminProducts || [];

            if (!query) {
                displayProducts(products);
                return;
            }

            const filtered = products.filter(p => {
                const titleEn = (p.title_en || '').toLowerCase();
                const titleAr = (p.title_ar || '').toLowerCase();
                const category = (p.category || '').toLowerCase();
                return titleEn.includes(query) || titleAr.includes(query) || category.includes(query);
            });

            displayProducts(filtered);
        }

        async function renderAdminProducts() {
            const list = document.getElementById('admin-product-list');
            if (!list) return;
            list.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#555;">Loading...</td></tr>';

            try {
                const res  = await fetch('/api/admin-products.php');
                if (res.status === 401) {
                    window.location.href = '/login.php';
                    return;
                }
                const products = await res.json();

                // Store locally for edit lookups and search filtering
                window._adminProducts = products;

                filterAdminProducts();

            } catch(e) {
                list.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#f44;">Failed to load products.</td></tr>';
                console.error(e);
            }
        }

        // ── Modal open/close ──
        window.openModal = (mode) => {
            const form = document.getElementById('product-form');
            if (form) form.reset();
            document.getElementById('edit-id').value = '';
            document.getElementById('modal-title').innerText = mode === 'add' ? 'Add New Boutique Product' : 'Edit Product';
            document.getElementById('product-modal').classList.add('active');
        };
        window.closeModal = () => document.getElementById('product-modal').classList.remove('active');

        // ── Open Edit ──
        window.openEdit = (id) => {
            const products = window._adminProducts || [];
            const p = products.find(x => x.id == id);
            if (!p) return;
            window.openModal('edit');
            document.getElementById('edit-id').value         = p.id;
            document.getElementById('prod-title-en').value   = p.title_en || '';
            document.getElementById('prod-title-ar').value   = p.title_ar || '';
            document.getElementById('prod-type-en').value    = p.type_en  || '';
            document.getElementById('prod-type-ar').value    = p.type_ar  || '';
            document.getElementById('prod-desc-en').value    = p.desc_en  || '';
            document.getElementById('prod-desc-ar').value    = p.desc_ar  || '';
            document.getElementById('prod-category').value   = p.category || '';
            document.getElementById('prod-price').value      = p.price    || '';
            document.getElementById('prod-sizes').value      = Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || '');
            document.getElementById('prod-image').value      = p.image    || '';
            document.getElementById('prod-badge-en').value   = p.badge_en || '';
            document.getElementById('prod-badge-ar').value   = p.badge_ar || '';
            document.getElementById('prod-emi-en').value     = p.emi_en   || '';
            document.getElementById('prod-emi-ar').value     = p.emi_ar   || '';
            document.getElementById('prod-featured').checked = !!p.featured;
        };

        // ── Save (add/edit) ──
        document.getElementById('product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id         = document.getElementById('edit-id').value;
            const sizesInput = document.getElementById('prod-sizes').value;

            const formData = new FormData();
            if (id) formData.append('id', id);
            formData.append('title_en',  document.getElementById('prod-title-en').value);
            formData.append('title_ar',  document.getElementById('prod-title-ar').value);
            formData.append('type_en',   document.getElementById('prod-type-en').value);
            formData.append('type_ar',   document.getElementById('prod-type-ar').value);
            formData.append('desc_en',   document.getElementById('prod-desc-en').value);
            formData.append('desc_ar',   document.getElementById('prod-desc-ar').value);
            formData.append('category',  document.getElementById('prod-category').value);
            formData.append('price',     document.getElementById('prod-price').value);
            formData.append('sizes',     sizesInput);
            formData.append('image',     document.getElementById('prod-image').value);
            formData.append('badge_en',  document.getElementById('prod-badge-en').value);
            formData.append('badge_ar',  document.getElementById('prod-badge-ar').value);
            formData.append('emi_en',    document.getElementById('prod-emi-en').value);
            formData.append('emi_ar',    document.getElementById('prod-emi-ar').value);
            formData.append('featured',  document.getElementById('prod-featured').checked ? '1' : '0');

            const url = id ? '/api/update-product.php' : '/api/add-product.php';
            try {
                const res  = await fetch(url, { method: 'POST', body: formData });
                const json = await res.json();
                if (json.success) {
                    closeModal();
                    showAdminToast(id ? 'Product updated!' : 'Product added!');
                    renderAdminProducts();
                } else {
                    alert('Error: ' + (json.error || 'Unknown error'));
                }
            } catch(err) {
                alert('Network error. Check console.');
                console.error(err);
            }
        });

        // ── Delete ──
        window.confirmDelete = async (id) => {
            if (!confirm('Permanently remove this perfume from the boutique?')) return;
            const formData = new FormData();
            formData.append('id', id);
            try {
                const res  = await fetch('/api/delete-product.php', { method: 'POST', body: formData });
                const json = await res.json();
                if (json.success) {
                    showAdminToast('Product deleted.');
                    renderAdminProducts();
                } else {
                    alert('Error: ' + (json.error || 'Delete failed'));
                }
            } catch(e) { alert('Network error.'); }
        };

        // ── Bulk Upload ──
        document.getElementById('bulk-upload-btn').onclick = () => document.getElementById('bulk-upload-input').click();
        document.getElementById('bulk-upload-input').onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res  = await fetch('/api/bulk-upload.php', { method: 'POST', body: formData });
                const json = await res.json();
                if (json.success) {
                    showAdminToast(`Bulk upload: ${json.inserted} products added!`);
                    renderAdminProducts();
                } else {
                    alert('Bulk upload error: ' + (json.error || 'Unknown error'));
                }
            } catch(e) { alert('Network error during bulk upload.'); }
            e.target.value = '';
        };

        // ── Sample Download ──
        document.getElementById('sample-download-btn').onclick = () => {
            const sample = [{
                title_en: "MIDNIGHT OUD", title_ar: "عود منتصف الليل",
                type_en: "Extrait De Parfum", type_ar: "عطر مركز",
                desc_en: "Deep, mysterious oud.", desc_ar: "عود عميق وغامض.",
                category: "Signature", price: "450",
                image: "images/perfume1.jpg",
                badge_en: "BEST SELLER", badge_ar: "الأكثر مبيعاً",
                emi_en: "or QR 37/Month", emi_ar: "أو 37 ر.ق/شهر",
                sizes: ["100ml", "50ml"], featured: true
            }];
            const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'perfume_bulk_sample.json';
            a.click();
        };

        // ── Logout ──
        window.doLogout = async () => {
            if (!confirm('Do you want to logout?')) return;
            await fetch('/api/logout.php', { method: 'POST' });
            localStorage.removeItem('fp_user');
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/login.php';
        };

        // ── Image Upload Handling ──
        function initImageUpload() {
            const fileInput = document.getElementById('image-upload');
            const pathInput = document.getElementById('prod-image');
            const statusSpan = document.getElementById('upload-status');
            
            if (!fileInput || !pathInput || !statusSpan) return;
            
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                statusSpan.textContent = 'Uploading and compressing...';
                statusSpan.style.color = '#888';
                
                const formData = new FormData();
                formData.append('image', file);
                
                try {
                    const res = await fetch('/api/upload-image.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        pathInput.value = data.imageUrl;
                        statusSpan.textContent = 'Uploaded & compressed successfully!';
                        statusSpan.style.color = '#4caf50';
                        showAdminToast('Image uploaded successfully!');
                    } else {
                        statusSpan.textContent = 'Upload failed: ' + (data.error || 'Unknown error');
                        statusSpan.style.color = '#ff4444';
                        alert('Upload failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (err) {
                    statusSpan.textContent = 'Upload error.';
                    statusSpan.style.color = '#ff4444';
                    console.error(err);
                    alert('Network error during upload.');
                }
                
                // Clear file input value to allow uploading the same file again if desired
                fileInput.value = '';
            });
        }

        // ── Init ──
        document.addEventListener('DOMContentLoaded', () => {
            renderAdminProducts();
            initImageUpload();

            const searchInput = document.getElementById('admin-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', filterAdminProducts);
            }
        });
        window.renderAdminProducts = renderAdminProducts;
    </script>
</body>
</html>
