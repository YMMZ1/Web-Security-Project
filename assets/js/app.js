// ===================================================
// SecureStore — التطبيق الرئيسي
// ===================================================

let currentUser = null;
let cart = [];
let currentCategory = "all";
let currentSort = "default";
let attacksBlocked = 0;

// ===================================================
// TOAST NOTIFICATIONS
// ===================================================
function showToast(message, type = "info", duration = 3500) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "toastIn 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===================================================
// CART
// ===================================================
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    renderCart();
}

function addToCart(productId) {
    if (typeof productId !== 'number') { attacksBlocked++; return; }
    const product = productsTable.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartBadge();
    showToast(`تمت إضافة "${SecurityManager.sanitizeInput(product.name)}" إلى السلة`, "success");
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    const badge = document.getElementById('cart-count');
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛍️</div>
                <p>سلتك فارغة</p>
            </div>`;
        totalEl.textContent = "$0.00";
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        const safeName = SecurityManager.sanitizeInput(item.name);
        const safeImg  = SecurityManager.sanitizeURL(item.image);
        return `
        <div class="cart-item">
            <img src="${safeImg}" alt="${safeName}" class="cart-item-img" onerror="this.src='https://placehold.co/56x56/1a1f30/d4a843?text=?'">
            <div class="cart-item-info">
                <div class="cart-item-name">${safeName}</div>
                <div class="cart-item-price">$${item.price} × ${item.qty}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
        </div>`;
    }).join('');
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) { showToast("سلتك فارغة!", "error"); return; }
    showToast("جارٍ المعالجة... (تجريبي)", "info");
    setTimeout(() => {
        cart = [];
        updateCartBadge();
        renderCart();
        showToast("تم إتمام الطلب بنجاح! شكراً لك 🎉", "success", 5000);
    }, 1500);
}

// ===================================================
// NAVBAR
// ===================================================
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
}

function updateNavbar() {
    const btn = document.getElementById('auth-buttons');
    if (!btn) return;
    if (!currentUser) {
        btn.innerHTML = `<button class="auth-login-btn" onclick="navigate('login')">تسجيل الدخول</button>`;
    } else {
        const panel = currentUser.role === 'admin' ? 'adminPanel' : 'userPanel';
        btn.innerHTML = `<button class="auth-panel-btn" onclick="navigate('${panel}')">لوحتي — ${SecurityManager.sanitizeInput(currentUser.name)}</button>`;
    }
}

// ===================================================
// ROUTER
// ===================================================
function navigate(page) {
    const content = document.getElementById('app-content');
    const footer  = document.getElementById('site-footer');

    if (page === 'userPanel' && (!currentUser || currentUser.role !== 'user')) {
        showToast("يجب تسجيل الدخول أولاً!", "error");
        return navigate('login');
    }
    if (page === 'adminPanel' && (!currentUser || currentUser.role !== 'admin')) {
        showToast("هذه الصفحة للمدراء فقط!", "error");
        return navigate('login');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateNavbar();

    const noFooter = ['login'];
    footer.style.display = noFooter.includes(page) ? 'none' : '';

    switch (page) {
        case 'home':      renderHome(content);      break;
        case 'shop':      renderShop(content);      break;
        case 'login':     renderLogin(content);     break;
        case 'userPanel': renderUserPanel(content); break;
        case 'adminPanel':renderAdminPanel(content);break;
        case 'about':     renderAbout(content);     break;
        default:
            content.innerHTML = `<div class="section-container"><div class="empty-state"><div class="empty-state-icon">404</div><h3>الصفحة غير موجودة</h3><button class="btn-primary" onclick="navigate('home')">الرئيسية</button></div></div>`;
    }
}

// ===================================================
// HOME
// ===================================================
function renderHome(el) {
    el.innerHTML = `
    <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-grid"></div>
        <div class="hero-container">
            <div class="hero-text">
                <div class="hero-badge">
                    <div class="hero-badge-dot"></div>
                    متجر آمن ومعتمد
                </div>
                <h1>التسوق الذكي<br>بأعلى <span class="highlight">معايير الأمان</span></h1>
                <p class="hero-desc">منصة تجارية متكاملة مصممة بأحدث تقنيات حماية البيانات وأمن الويب. تسوق بثقة تامة.</p>
                <div class="hero-actions">
                    <button class="btn-primary" onclick="navigate('shop')">تصفح المنتجات →</button>
                    <button class="btn-secondary" onclick="navigate('about')">من نحن</button>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat"><div class="hero-stat-num">+8</div><div class="hero-stat-label">منتج مختار</div></div>
                    <div class="hero-stat"><div class="hero-stat-num">100%</div><div class="hero-stat-label">تسوق آمن</div></div>
                    <div class="hero-stat"><div class="hero-stat-num">4.8★</div><div class="hero-stat-label">تقييم العملاء</div></div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-card-stack">
                    <div class="product-card-preview">
                        <div class="preview-img"><img src="${productsTable[0].image}" alt=""></div>
                        <div class="preview-category">Cybersecurity</div>
                        <div class="preview-name">${productsTable[0].name}</div>
                        <div class="preview-price">$${productsTable[0].price}</div>
                    </div>
                    <div class="product-card-preview">
                        <div class="preview-img"><img src="${productsTable[4].image}" alt=""></div>
                        <div class="preview-category">Electronics</div>
                        <div class="preview-name">${productsTable[4].name}</div>
                        <div class="preview-price">$${productsTable[4].price}</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div class="features-strip">
        <div class="features-inner">
            <div class="feature-item">
                <div class="feature-icon">🚚</div>
                <div><div class="feature-title">شحن مجاني</div><div class="feature-desc">على الطلبات فوق $100</div></div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">🔒</div>
                <div><div class="feature-title">دفع آمن 100%</div><div class="feature-desc">تشفير SSL من طرف لطرف</div></div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">↩️</div>
                <div><div class="feature-title">إرجاع مجاني</div><div class="feature-desc">خلال 30 يوم بدون أسئلة</div></div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">💬</div>
                <div><div class="feature-title">دعم 24/7</div><div class="feature-desc">فريق متخصص دائماً معك</div></div>
            </div>
        </div>
    </div>

    <section class="section">
        <div class="section-container">
            <div class="section-header">
                <div class="section-tag">تصفح حسب الفئة</div>
                <h2 class="section-title">اختر ما يناسبك</h2>
                <p class="section-desc">منتجات مختارة بعناية في مجالات التقنية والأمن والإلكترونيات</p>
            </div>
            <div class="categories-grid">
                ${categoriesData.map(cat => `
                <div class="category-card" onclick="navigate('shop'); filterByCategory('${cat.id}')">
                    <div class="category-icon">${cat.icon}</div>
                    <div class="category-name">${cat.name}</div>
                    <div class="category-count">${cat.count} منتج</div>
                </div>`).join('')}
            </div>
        </div>
    </section>

    <section class="section" style="background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
        <div class="section-container">
            <div class="section-header">
                <div class="section-tag">الأكثر مبيعاً</div>
                <h2 class="section-title">المنتجات المميزة</h2>
            </div>
            <div class="products-grid" id="home-featured"></div>
            <div style="text-align:center; margin-top: 40px;">
                <button class="btn-secondary" onclick="navigate('shop')">عرض جميع المنتجات →</button>
            </div>
        </div>
    </section>`;

    renderProductsTo('home-featured', productsTable.slice(0, 4));
}

// ===================================================
// SHOP
// ===================================================
function renderShop(el) {
    el.innerHTML = `
    <div class="shop-layout">
        <div class="shop-top">
            <div>
                <h1 class="shop-title">المتجر</h1>
                <p style="color:var(--muted); font-size:14px; margin-top:4px;" id="product-count"></p>
            </div>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <div class="shop-filters" id="category-filters"></div>
                <select class="sort-select" onchange="changeSort(this.value)">
                    <option value="default">الترتيب الافتراضي</option>
                    <option value="price-asc">السعر: من الأقل</option>
                    <option value="price-desc">السعر: من الأعلى</option>
                    <option value="rating">الأعلى تقييماً</option>
                </select>
            </div>
        </div>
        <div class="products-grid" id="shop-products-grid"></div>
    </div>`;

    renderCategoryFilters();
    renderShopProducts();
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    container.innerHTML = categoriesData.map(cat => `
        <button class="filter-btn ${currentCategory === cat.id ? 'active' : ''}"
                onclick="filterByCategory('${cat.id}')">
            ${cat.icon} ${cat.name}
        </button>`).join('');
}

function filterByCategory(catId) {
    currentCategory = catId;
    if (document.getElementById('category-filters')) {
        renderCategoryFilters();
        renderShopProducts();
    } else {
        navigate('shop');
    }
}

function changeSort(value) {
    currentSort = value;
    renderShopProducts();
}

function getFilteredProducts() {
    let list = currentCategory === 'all' ? [...productsTable] : productsTable.filter(p => p.category === currentCategory);
    if (currentSort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (currentSort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (currentSort === 'rating')     list.sort((a, b) => b.rating - a.rating);
    return list;
}

function renderShopProducts() {
    const grid = document.getElementById('shop-products-grid');
    const countEl = document.getElementById('product-count');
    if (!grid) return;
    const products = getFilteredProducts();
    if (countEl) countEl.textContent = `${products.length} منتج`;
    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔍</div><h3>لا توجد منتجات</h3><p>جرب تصنيفاً آخر</p></div>`;
        return;
    }
    renderProductsTo('shop-products-grid', products);
}

function renderProductsTo(gridId, products) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    products.forEach((product, i) => {
        const safeName = SecurityManager.sanitizeInput(product.name);
        const safeCat  = SecurityManager.sanitizeInput(product.category);
        const safeImg  = SecurityManager.sanitizeURL(product.image);
        const badge    = product.badge ? `<span class="product-badge ${product.badge === 'جديد' ? 'new' : product.badge.includes('خصم') ? 'sale' : ''}">${SecurityManager.sanitizeInput(product.badge)}</span>` : '';
        const oldPrice = product.oldPrice ? `<small>$${product.oldPrice}</small>` : '';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${i * 60}ms`;
        card.innerHTML = `
            <div class="product-card-img">
                <img src="${safeImg}" alt="${safeName}" loading="lazy" onerror="this.src='https://placehold.co/400x300/1a1f30/d4a843?text=?'">
                ${badge}
                <button class="product-wishlist" title="إضافة للمفضلة">♡</button>
            </div>
            <div class="product-card-body">
                <div class="product-category">${safeCat}</div>
                <div class="product-name">${safeName}</div>
                <div class="product-footer">
                    <div class="product-price">${oldPrice}$${product.price}</div>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">أضف للسلة</button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

// ===================================================
// LOGIN
// ===================================================
function renderLogin(el) {
    el.innerHTML = `
    <div class="auth-page">
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo">SECURE<span style="color:var(--gold)">STORE</span></div>
                <h2>تسجيل الدخول</h2>
                <p>أدخل بياناتك للوصول إلى حسابك</p>
            </div>
            <div class="demo-hint">
                <strong>بيانات تجريبية:</strong><br>
                مدير: <code>admin</code> / <code>Password123!</code><br>
                بائع: <code>user</code> / <code>Password123!</code>
            </div>
            <input type="hidden" id="csrf_token" value="${SecurityManager.generateCSRFToken()}">
            <div class="form-group">
                <label class="form-label">اسم المستخدم</label>
                <input type="text" id="username" class="form-input" placeholder="أدخل اسم المستخدم" required autocomplete="username">
            </div>
            <div class="form-group">
                <label class="form-label">كلمة المرور</label>
                <input type="password" id="password" class="form-input" placeholder="أدخل كلمة المرور" required autocomplete="current-password" oninput="updatePasswordStrength(this.value)">
                <div class="password-strength"><div class="password-strength-bar" id="strength-bar"></div></div>
                <div style="font-size:12px; color:var(--muted); margin-top:4px;" id="strength-label"></div>
            </div>
            <button class="btn-submit" onclick="handleLogin()">دخول الآن</button>
        </div>
    </div>`;
    document.getElementById('username').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
    document.getElementById('password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
}

function updatePasswordStrength(value) {
    const { score, label, color } = SecurityManager.getPasswordStrength(value);
    const bar = document.getElementById('strength-bar');
    const lbl = document.getElementById('strength-label');
    if (bar) { bar.style.width = score + '%'; bar.style.background = color; }
    if (lbl) { lbl.textContent = label; lbl.style.color = color; }
}

function handleLogin() {
    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value;
    const csrf     = document.getElementById('csrf_token')?.value;

    if (!username || !password) { showToast("يرجى ملء جميع الحقول", "error"); return; }
    if (!SecurityManager.validateCSRFToken(csrf)) { showToast("خطأ أمني: رمز CSRF غير صالح", "error"); return; }
    if (!SecurityManager.checkRateLimit(username)) {
        showToast("محاولات كثيرة جداً! حاول بعد 5 دقائق.", "error");
        return;
    }

    const found = usersTable.find(u => u.username === username && u.password === password);
    if (found) {
        currentUser = found;
        showToast(`مرحباً، ${SecurityManager.sanitizeInput(found.name)}! 👋`, "success");
        if (found.role === 'admin') navigate('adminPanel');
        else navigate('userPanel');
    } else {
        showToast("اسم المستخدم أو كلمة المرور غير صحيحة", "error");
    }
}

function logout() {
    const name = currentUser?.name || '';
    currentUser = null;
    showToast(`تم تسجيل خروج ${SecurityManager.sanitizeInput(name)} بنجاح`, "info");
    navigate('home');
}

// ===================================================
// USER PANEL
// ===================================================
function renderUserPanel(el) {
    el.innerHTML = `
    <div class="panel-page">
        <div class="panel-header user-header">
            <div>
                <h2>لوحة تحكم البائع</h2>
                <p style="color:rgba(255,255,255,0.6); font-size:14px; margin-top:4px;">إضافة وإدارة منتجاتك</p>
            </div>
            <div class="panel-user">
                <div class="panel-avatar">${SecurityManager.sanitizeInput(currentUser.avatar)}</div>
                <span style="font-weight:600">${SecurityManager.sanitizeInput(currentUser.name)}</span>
                <button class="btn-logout" onclick="logout()">خروج</button>
            </div>
        </div>
        <div class="panel-body">
            <h3 class="panel-section-title">إضافة منتج جديد</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">اسم المنتج</label>
                    <input type="text" id="new-prod-name" class="form-input" placeholder="اسم المنتج" required>
                </div>
                <div class="form-group">
                    <label class="form-label">التصنيف</label>
                    <select id="new-prod-cat" class="form-input sort-select">
                        <option>Cybersecurity</option>
                        <option>Electronics</option>
                        <option>Auto Parts</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">السعر ($)</label>
                    <input type="number" id="new-prod-price" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">رابط الصورة</label>
                    <input type="url" id="new-prod-image" class="form-input" placeholder="https://..." required>
                </div>
            </div>
            <button class="btn-primary" onclick="handleAddProduct()" style="margin-top:8px">رفع المنتج بأمان ✓</button>
            <h3 class="panel-section-title" style="margin-top:40px">منتجاتي (${productsTable.length})</h3>
            <div id="user-products-preview" class="products-grid" style="margin-top:0"></div>
        </div>
    </div>`;
    renderProductsTo('user-products-preview', productsTable.slice(0,4));
}

function handleAddProduct() {
    const name  = document.getElementById('new-prod-name')?.value?.trim();
    const cat   = document.getElementById('new-prod-cat')?.value;
    const price = document.getElementById('new-prod-price')?.value;
    const image = document.getElementById('new-prod-image')?.value?.trim();

    if (!name || !price || !image) { showToast("يرجى ملء جميع الحقول", "error"); return; }
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) { showToast("السعر غير صالح", "error"); return; }

    const safeProduct = {
        id:       Math.floor(Math.random() * 90000) + 10000,
        name:     SecurityManager.sanitizeInput(name),
        category: SecurityManager.sanitizeInput(cat),
        price:    parseFloat(parseFloat(price).toFixed(2)),
        oldPrice: null,
        image:    SecurityManager.sanitizeURL(image),
        badge:    "جديد", rating: 0, reviews: 0
    };

    productsTable.push(safeProduct);
    showToast(`تم إضافة "${safeProduct.name}" بنجاح! ✓`, "success");
    ['new-prod-name','new-prod-price','new-prod-image'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// ===================================================
// ADMIN PANEL
// ===================================================
function renderAdminPanel(el) {
    el.innerHTML = `
    <div class="panel-page">
        <div class="panel-header admin-header">
            <div>
                <h2>لوحة الإدارة</h2>
                <p style="color:var(--muted); font-size:14px; margin-top:4px;">إحصائيات ومراقبة النظام</p>
            </div>
            <div class="panel-user">
                <div class="panel-avatar" style="background:var(--gold)">${SecurityManager.sanitizeInput(currentUser.avatar)}</div>
                <span style="font-weight:600">${SecurityManager.sanitizeInput(currentUser.name)}</span>
                <button class="btn-logout" onclick="logout()">خروج</button>
            </div>
        </div>
        <div class="panel-body">
            <h3 class="panel-section-title">إحصائيات النظام</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="stat-products">${productsTable.length}</div>
                    <div class="stat-label">إجمالي المنتجات</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${usersTable.length}</div>
                    <div class="stat-label">المستخدمون</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="stat-attacks">${attacksBlocked}</div>
                    <div class="stat-label">هجمات تم صدّها</div>
                </div>
            </div>

            <h3 class="panel-section-title">جدول المنتجات</h3>
            <div style="overflow-x:auto">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>التصنيف</th>
                            <th>السعر</th>
                            <th>التقييم</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsTable.map(p => `
                        <tr>
                            <td style="color:var(--muted); font-size:12px">${p.id}</td>
                            <td><img src="${SecurityManager.sanitizeURL(p.image)}" class="table-img" onerror="this.src='https://placehold.co/48x48/1a1f30/d4a843?text=?'"></td>
                            <td style="font-weight:600">${SecurityManager.sanitizeInput(p.name)}</td>
                            <td><span style="background:rgba(212,168,67,0.1);color:var(--gold);padding:3px 10px;border-radius:100px;font-size:12px;font-weight:700">${SecurityManager.sanitizeInput(p.category)}</span></td>
                            <td style="font-weight:700; color:var(--gold2)">$${p.price}</td>
                            <td style="color:var(--muted)">${p.rating ? p.rating + '★' : '—'}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

// ===================================================
// ABOUT
// ===================================================
function renderAbout(el) {
    el.innerHTML = `
    <div class="about-hero">
        <div class="section-tag">من نحن</div>
        <h1 class="section-title" style="margin-bottom:16px">نبني ثقة حقيقية مع عملائنا</h1>
        <p class="section-desc" style="margin:0 auto">منصة SecureStore تجمع بين التسوق السهل وأعلى معايير أمن الويب الحديثة</p>
    </div>
    <div class="about-content">
        <div class="about-text">
            <h3>قصتنا</h3>
            <p>انطلقنا بفكرة بسيطة: التسوق الإلكتروني يجب أن يكون آمناً بالكامل. طورنا منصتنا باستخدام أحدث تقنيات أمن الويب — من الحماية ضد XSS وSQL Injection إلى CSRF Tokens ونظام Rate Limiting.</p>
            <p>كل سطر من كودنا مكتوب مع الأمان في الاعتبار. بياناتك ليست للبيع — هي في عهدتنا.</p>
        </div>
        <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:32px;">
            <h4 style="font-size:16px; font-weight:700; margin-bottom:20px; color:var(--gold)">تقنيات الأمان المستخدمة</h4>
            ${['🛡️ Input Sanitization — XSS Protection','🔑 CSRF Token Validation','⏱️ Rate Limiting للحماية من Brute Force','🔐 Role-Based Access Control (RBAC)','🌐 Content Security Policy (CSP)','✅ Client-Side Data Validation'].map(item => `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); font-size:14px; color:var(--muted)">${item}</div>`).join('')}
        </div>
    </div>
    <div class="about-values">
        ${[
            {icon:'🔒', title:'الأمان أولاً', desc:'كل ميزة مبنية مع الأمان في الاعتبار. لا تنازلات في حماية بياناتك.'},
            {icon:'⚡', title:'أداء عالٍ', desc:'واجهة سريعة وسلسة مبنية على HTML/CSS/JS نقي بدون تبعيات ثقيلة.'},
            {icon:'🌍', title:'للجميع', desc:'دعم كامل للغة العربية وتصميم RTL احترافي لتجربة مثالية.'},
            {icon:'📦', title:'منتجات موثوقة', desc:'كل منتج مختار بعناية ومراجع من فريق متخصص قبل إضافته للمتجر.'}
        ].map(v => `
        <div class="value-card">
            <div class="value-icon">${v.icon}</div>
            <h4>${v.title}</h4>
            <p>${v.desc}</p>
        </div>`).join('')}
    </div>`;
}

// ===================================================
// NEWSLETTER
// ===================================================
function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email')?.value?.trim();
    if (!email || !email.includes('@')) { showToast("يرجى إدخال بريد إلكتروني صالح", "error"); return; }
    showToast("تم الاشتراك في النشرة البريدية! ✓", "success");
    const emailEl = document.getElementById('newsletter-email');
    if (emailEl) emailEl.value = '';
}

// ===================================================
// INIT
// ===================================================
window.onload = () => {
    updateNavbar();
    navigate('home');
};