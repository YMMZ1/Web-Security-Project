// ===================================================
// قاعدة البيانات (محاكاة)
// ===================================================

// إعدادات الاتصال (للعرض التعليمي فقط — لا تضع credentials حقيقية هنا)
const dbConfig = {
    host: "localhost",
    user: "db_user",
    password: "***HIDDEN***",
    database: "SecureStore_DB"
};

// جدول المستخدمين
const usersTable = [
    { id: 1, username: "admin",  password: "Password123!", role: "admin", name: "مدير النظام",   avatar: "م" },
    { id: 2, username: "user",   password: "Password123!", role: "user",  name: "بائع معتمد",   avatar: "ب" }
];

// جدول المنتجات
const productsTable = [
    {
        id: 101, name: "مفتاح أمان YubiKey 5C", category: "Cybersecurity",
        price: 75, oldPrice: 95,
        image: "https://placehold.co/400x300/1e293b/d4a843?text=YubiKey+5C",
        badge: "الأكثر مبيعاً", rating: 4.9, reviews: 128
    },
    {
        id: 102, name: "فلتر هواء احترافي - Equinox 2023", category: "Auto Parts",
        price: 45, oldPrice: null,
        image: "https://placehold.co/400x300/134e4a/34d399?text=Air+Filter+Pro",
        badge: null, rating: 4.5, reviews: 64
    },
    {
        id: 103, name: "جهاز كشف الأعطال OBD2 Pro+", category: "Auto Parts",
        price: 120, oldPrice: 160,
        image: "https://placehold.co/400x300/1e3a5f/60a5fa?text=OBD2+Scanner",
        badge: "خصم 25%", rating: 4.7, reviews: 89
    },
    {
        id: 104, name: "محول شبكات Alfa Network AWUS036ACH", category: "Cybersecurity",
        price: 60, oldPrice: null,
        image: "https://placehold.co/400x300/4c1d95/a78bfa?text=Alfa+Network",
        badge: null, rating: 4.6, reviews: 212
    },
    {
        id: 105, name: "سماعة Bose QuietComfort 45", category: "Electronics",
        price: 279, oldPrice: 329,
        image: "https://placehold.co/400x300/1a1a2e/e2e8f0?text=Bose+QC45",
        badge: "جديد", rating: 4.8, reviews: 354
    },
    {
        id: 106, name: "شاحن لاسلكي MagSafe 15W", category: "Electronics",
        price: 39, oldPrice: null,
        image: "https://placehold.co/400x300/27272a/f4f4f5?text=MagSafe+15W",
        badge: null, rating: 4.4, reviews: 176
    },
    {
        id: 107, name: "كيبورد ميكانيكي Keychron K2", category: "Electronics",
        price: 90, oldPrice: 110,
        image: "https://placehold.co/400x300/292524/fef3c7?text=Keychron+K2",
        badge: "عرض", rating: 4.9, reviews: 501
    },
    {
        id: 108, name: "VPN Router GL.iNet Beryl AX", category: "Cybersecurity",
        price: 89, oldPrice: null,
        image: "https://placehold.co/400x300/0f172a/38bdf8?text=GL.iNet+Router",
        badge: null, rating: 4.7, reviews: 93
    }
];

// بيانات التصنيفات
const categoriesData = [
    { id: "all",           name: "الكل",            icon: "🛍️", count: productsTable.length },
    { id: "Cybersecurity", name: "الأمن السيبراني", icon: "🔒", count: productsTable.filter(p => p.category === "Cybersecurity").length },
    { id: "Electronics",   name: "الإلكترونيات",    icon: "💻", count: productsTable.filter(p => p.category === "Electronics").length },
    { id: "Auto Parts",    name: "قطع السيارات",     icon: "🔧", count: productsTable.filter(p => p.category === "Auto Parts").length }
];