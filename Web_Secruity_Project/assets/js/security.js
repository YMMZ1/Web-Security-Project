// ===================================================
// SecurityManager — وحدة الأمان
// ===================================================
const SecurityManager = {

    // 1. تعقيم المدخلات (Input Sanitization) — الحماية من XSS
    sanitizeInput: function(input) {
        if (input === null || input === undefined) return "";
        const div = document.createElement('div');
        div.textContent = String(input);
        return div.innerHTML;
    },

    // 2. رمز CSRF (محاكاة)
    generateCSRFToken: function() {
        const token = btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
        sessionStorage.setItem('csrf_token', token);
        return token;
    },

    validateCSRFToken: function(token) {
        return token === sessionStorage.getItem('csrf_token');
    },

    // 3. التحقق من قوة كلمة المرور (0-100)
    getPasswordStrength: function(password) {
        let score = 0;
        if (!password) return { score: 0, label: "", color: "" };
        if (password.length >= 8)   score += 25;
        if (password.length >= 12)  score += 15;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
        let label = "", color = "";
        if (score < 40)  { label = "ضعيفة جداً"; color = "#e05252"; }
        else if (score < 60) { label = "ضعيفة";    color = "#f97316"; }
        else if (score < 80) { label = "متوسطة";   color = "#eab308"; }
        else                 { label = "قوية";      color = "#3ecf8e"; }
        return { score, label, color };
    },

    // 4. تحقق URL آمن (منع javascript: و data: في img src)
    sanitizeURL: function(url) {
        if (!url) return "";
        const trimmed = url.trim().toLowerCase();
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:text")) return "";
        return SecurityManager.sanitizeInput(url);
    },

    // 5. Rate limiting بسيط (محاكاة)
    _loginAttempts: {},
    checkRateLimit: function(username) {
        const now = Date.now();
        if (!this._loginAttempts[username]) this._loginAttempts[username] = [];
        // إزالة المحاولات القديمة (أكثر من 5 دقائق)
        this._loginAttempts[username] = this._loginAttempts[username].filter(t => now - t < 300000);
        if (this._loginAttempts[username].length >= 5) return false; // محظور
        this._loginAttempts[username].push(now);
        return true;
    }
};