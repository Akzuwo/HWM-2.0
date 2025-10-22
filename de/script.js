// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    title: '🔒 Login',
    registerTitle: '🆕 Konto erstellen',
    registerSubtitle: 'Registriere dich mit deiner Schul-E-Mail-Adresse.',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Passwort',
    passwordPlaceholder: 'Passwort',
    show: 'Passwort anzeigen',
    hide: 'Passwort verbergen',
    emailRequired: 'Bitte gib eine E-Mail-Adresse ein.',
    passwordRequired: 'Bitte gib ein Passwort ein.',
    invalidCredentials: 'E-Mail oder Passwort ist falsch.',
    inactive: 'Dein Konto wurde deaktiviert. Bitte kontaktiere eine Lehrkraft oder den Administrator.',
    emailNotVerified: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
    verificationTitle: 'E-Mail-Bestätigung erforderlich',
    verificationDescription: 'Wir haben dir einen Link zur Bestätigung gesendet. Du kannst hier eine neue E-Mail anfordern.',
    verificationResend: 'Bestätigungsmail erneut senden',
    verificationResendLoading: 'Sende …',
    resendSuccess: 'Falls ein Konto existiert, wurde der Link erneut verschickt.',
    resendError: 'Die E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.',
    forgotPassword: 'Passwort vergessen?',
    forgotPasswordMissingEmail: 'Bitte gib zuerst deine E-Mail-Adresse ein.',
    passwordResetSent: 'Falls ein Konto existiert, wurde ein Reset-Link gesendet.',
    passwordResetError: 'Zurücksetzen nicht möglich. Versuche es später noch einmal.',
    submit: 'Anmelden',
    submitLoading: 'Anmelden …',
    registerSubmit: 'Registrieren',
    registerSubmitLoading: 'Registrieren …',
    guestButton: 'Als Gast fortfahren',
    guestInfo: 'Fortfahren ohne Konto',
    loginButton: '🔐 Anmelden',
    logoutButton: '🚪 Abmelden',
    authStatusGuest: 'Nicht angemeldet',
    authStatusSignedIn: (roleLabel) => `Angemeldet als ${roleLabel}`,
    roleLabels: {
        admin: 'Administrator',
        teacher: 'Class-Admin',
        student: 'Schüler',
        guest: 'Gast'
    },
    genericError: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
    registerPasswordMismatch: 'Die Passwörter stimmen nicht überein.',
    registerWeakPassword: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
    registerEmailInvalid: 'Bitte gib eine gültige Schul-E-Mail-Adresse ein.',
    registerEmailExists: 'Für diese E-Mail-Adresse existiert bereits ein Konto.',
    registerPasswordConfirmLabel: 'Passwort bestätigen',
    registerClassLabel: 'Klasse (optional)',
    registerClassPlaceholder: 'z. B. 3a',
    registerClassNotFound: 'Diese Klasse wurde nicht gefunden.',
    registerGenericError: 'Registrierung derzeit nicht möglich. Bitte versuche es später erneut.',
    registerSuccess: 'Fast geschafft! Wir haben dir eine Bestätigungsmail gesendet.',
    switchToRegister: 'Neu hier? Konto erstellen',
    switchToLogin: 'Schon registriert? Anmelden',
    close: 'Schließen'
};

const API_BASE = (() => {
    const FALLBACK_BASES = [
        'https://homework-manager.akzuwo.ch',
        'https://hw-manager.akzuwo.ch',
        'https://hwm-beta.akzuwo.ch',
        'https://homework-manager-2-0-backend.onrender.com',
    ];

    const sanitizeBase = (value) => {
        if (!value) {
            return '';
        }
        return String(value).trim().replace(/\/$/, '');
    };

    const pickFirst = (values) => {
        for (const candidate of values) {
            const sanitized = sanitizeBase(candidate);
            if (sanitized) {
                return sanitized;
            }
        }
        return '';
    };

    const resolveFromLocation = () => {
        if (typeof window === 'undefined') {
            return '';
        }

        const { location } = window;
        if (!location) {
            return '';
        }

        const protocol = (location.protocol || '').toLowerCase();
        if (!protocol.startsWith('http')) {
            return '';
        }

        const host = location.host || '';
        const hostname = (location.hostname || '').toLowerCase();
        if (!host || !hostname) {
            return '';
        }

        const isAkzuwoDomain = hostname.endsWith('.akzuwo.ch');
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        if (!isAkzuwoDomain && !isLocalhost) {
            return '';
        }

        return sanitizeBase(`${location.protocol}//${host}`);
    };

    const defineResolver = () => {
        return () => {
            if (typeof window !== 'undefined') {
                const cached = sanitizeBase(window.__HM_RESOLVED_API_BASE__);
                if (cached) {
                    return cached;
                }

                const globalOverride = sanitizeBase(window.__HM_API_BASE__);
                if (globalOverride) {
                    window.__HM_RESOLVED_API_BASE__ = globalOverride;
                    return globalOverride;
                }

                if (typeof document !== 'undefined') {
                    const metaOverride = document.querySelector('meta[name="hm-api-base"]');
                    const metaBase = sanitizeBase(metaOverride && metaOverride.content);
                    if (metaBase) {
                        window.__HM_RESOLVED_API_BASE__ = metaBase;
                        return metaBase;
                    }
                }

                const locationBase = resolveFromLocation();
                if (locationBase) {
                    window.__HM_RESOLVED_API_BASE__ = locationBase;
                    return locationBase;
                }
            }

            const fallbackBase = pickFirst(FALLBACK_BASES);
            if (typeof window !== 'undefined' && fallbackBase) {
                window.__HM_RESOLVED_API_BASE__ = fallbackBase;
            }
            return fallbackBase;
        };
    };

    const resolver =
        (typeof window !== 'undefined' && typeof window.hmResolveApiBase === 'function')
            ? window.hmResolveApiBase
            : defineResolver();

    if (typeof window !== 'undefined') {
        window.hmResolveApiBase = resolver;
    }

    return resolver();
})();

const AUTH_API = {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    logout: `${API_BASE}/api/auth/logout`,
    resend: `${API_BASE}/api/auth/resend`,
    passwordReset: `${API_BASE}/api/auth/password-reset`
};

const AUTH_PATHS = {
    home: 'index.html',
    admin: 'admin/dashboard.html',
    login: 'login.html'
};

const SESSION_STORAGE_KEY = 'hm.session';

const DEFAULT_SESSION = {
    role: 'guest',
    email: '',
    emailVerified: false,
    isAdmin: false,
    isClassAdmin: false
};

let sessionState = normalizeSession(loadStoredSession());
let lastAuthEmail = sessionState.email || '';
let authOverlayInitialized = false;
let authOverlayPreviousFocus = null;

function normalizeRole(value) {
    if (!value) {
        return 'guest';
    }
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'admin' || normalized === 'teacher' || normalized === 'student') {
        return normalized;
    }
    if (normalized === 'guest') {
        return 'guest';
    }
    return 'student';
}

function normalizeSession(data = {}) {
    const role = normalizeRole(data.role);
    return {
        role,
        email: data.email || '',
        emailVerified: Boolean(data.emailVerified),
        isAdmin: role === 'admin',
        isClassAdmin: role === 'admin' || role === 'teacher'
    };
}

function loadStoredSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) {
            return { ...DEFAULT_SESSION };
        }
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SESSION, ...parsed };
    } catch (error) {
        return { ...DEFAULT_SESSION };
    }
}

function persistSession() {
    sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
            role: sessionState.role,
            email: sessionState.email,
            emailVerified: sessionState.emailVerified
        })
    );
}

function setAuthenticatedSession(role, email) {
    sessionState = normalizeSession({
        role,
        email,
        emailVerified: true
    });
    lastAuthEmail = email;
    persistSession();
    updateAuthUI();
}

function clearSessionState() {
    sessionState = { ...DEFAULT_SESSION };
    lastAuthEmail = '';
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    updateAuthUI();
}

function isAdmin() {
    return sessionState.isAdmin;
}

function isClassAdmin() {
    return sessionState.isClassAdmin;
}

function isAuthenticated() {
    return sessionState.role !== 'guest';
}

function getRoleLabel(role = sessionState.role) {
    const labels = LOGIN_TEXT.roleLabels || {};
    return labels[role] || role;
}

function getAuthStatusText() {
    if (!isAuthenticated()) {
        return LOGIN_TEXT.authStatusGuest;
    }
    const roleLabel = getRoleLabel();
    if (typeof LOGIN_TEXT.authStatusSignedIn === 'function') {
        return LOGIN_TEXT.authStatusSignedIn(roleLabel);
    }
    return LOGIN_TEXT.authStatusSignedIn || roleLabel;
}

function updateAuthStatus() {
    const text = getAuthStatusText();
    const authenticated = isAuthenticated();
    document.querySelectorAll('[data-auth-status]').forEach((element) => {
        element.textContent = text;
        element.classList.toggle('is-authenticated', authenticated);
    });
}

function ensureRoleHintElement(button) {
    if (!button) {
        return null;
    }
    let hint = button.nextElementSibling;
    if (!hint || !hint.hasAttribute('data-auth-role-hint')) {
        hint = document.createElement('span');
        hint.className = 'auth-role-hint';
        hint.setAttribute('data-auth-role-hint', 'true');
        button.insertAdjacentElement('afterend', hint);
    }
    return hint;
}

function updateRoleHint() {
    const button = document.querySelector('[data-auth-button]');
    const hint = ensureRoleHintElement(button);
    if (!hint) {
        return;
    }
    const text = getAuthStatusText();
    hint.textContent = text;
    hint.dataset.role = sessionState.role;
    hint.classList.toggle('is-hidden', !text);
    hint.classList.toggle('is-authenticated', isAuthenticated());
}

function updateAuthButton() {
    const button = document.querySelector('[data-auth-button]');
    if (!button) {
        return;
    }
    button.textContent = isAuthenticated() ? LOGIN_TEXT.logoutButton : LOGIN_TEXT.loginButton;
}

function setupAuthButton() {
    const button = document.querySelector('[data-auth-button]');
    if (!button) {
        return;
    }

    if (button.dataset.authBound === 'true') {
        updateAuthButton();
        return;
    }

    button.addEventListener('click', () => {
        if (isAuthenticated()) {
            logout();
        } else {
            openAuthOverlay(button);
        }
    });

    button.dataset.authBound = 'true';
    updateAuthButton();
}

function updateFeatureVisibility() {
    const shouldHide = !isAuthenticated();
    const actionBar = document.querySelector('.calendar-action-bar');
    if (actionBar) {
        actionBar.classList.toggle('is-hidden', shouldHide);
    }
    document.querySelectorAll('[data-action="create"]').forEach((element) => {
        const hideForNonAdmins = !isAdmin();
        element.classList.toggle('is-hidden', hideForNonAdmins);
    });
}

function updateAuthUI() {
    updateAuthButton();
    updateRoleHint();
    updateAuthStatus();
    updateFeatureVisibility();
}

function queryAuthForms() {
    return Array.from(document.querySelectorAll('[data-auth-form]'));
}

function getEmailInput(form) {
    return form ? form.querySelector('[data-auth-email]') : null;
}

function getPasswordInput(form) {
    return form ? form.querySelector('[data-auth-password]') : null;
}

function getPasswordConfirmInput(form) {
    return form ? form.querySelector('[data-auth-password-confirm]') : null;
}

function getClassInput(form) {
    return form ? form.querySelector('[data-auth-class]') : null;
}

function getAuthMode(form) {
    if (!form) {
        return 'login';
    }
    return form.dataset.authMode === 'register' ? 'register' : 'login';
}

function getSubmitLabel(form, isLoading) {
    const mode = getAuthMode(form);
    if (mode === 'register') {
        return isLoading ? LOGIN_TEXT.registerSubmitLoading : LOGIN_TEXT.registerSubmit;
    }
    return isLoading ? LOGIN_TEXT.submitLoading : LOGIN_TEXT.submit;
}

function setLoginFeedback(message = '', variant = 'neutral', form = null) {
    const targets = form ? [form] : queryAuthForms();
    targets.forEach((currentForm) => {
        const feedback = currentForm.querySelector('[data-auth-feedback]');
        if (!feedback) {
            return;
        }
        feedback.textContent = message;
        const isError = variant === 'error' && Boolean(message);
        const isSuccess = variant === 'success' && Boolean(message);
        feedback.classList.toggle('error', isError);
        feedback.classList.toggle('success', isSuccess);
        feedback.hidden = !message;
    });
}

function togglePasswordVisibility(form) {
    const input = getPasswordInput(form);
    const toggle = form ? form.querySelector('[data-auth-toggle]') : null;
    if (!input || !toggle) {
        return;
    }
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    toggle.setAttribute('aria-label', shouldShow ? LOGIN_TEXT.hide : LOGIN_TEXT.show);
    toggle.classList.toggle('visible', shouldShow);
    input.focus();
}

function focusPasswordField(form) {
    const input = getPasswordInput(form);
    if (input) {
        input.focus();
        if (typeof input.select === 'function') {
            input.select();
        }
    }
}

function getVerificationBanner(form) {
    return form ? form.querySelector('[data-auth-verification]') : null;
}

function hideVerificationBanner(form) {
    const banner = getVerificationBanner(form);
    if (banner) {
        banner.hidden = true;
    }
}

function showVerificationBanner(form) {
    const banner = getVerificationBanner(form);
    if (!banner) {
        return;
    }
    banner.hidden = false;
}

function setFormLoading(form, isLoading) {
    if (!form) {
        return;
    }
    const submit = form.querySelector('[data-auth-submit]');
    if (submit) {
        submit.disabled = Boolean(isLoading);
        submit.textContent = getSubmitLabel(form, Boolean(isLoading));
    }
    const resend = form.querySelector('[data-auth-resend]');
    if (resend && resend.dataset.locked === 'true') {
        resend.disabled = Boolean(isLoading);
    }
}

function rememberEmail(email) {
    if (!email) {
        return;
    }
    lastAuthEmail = email;
}

function applyEmailPrefill(form) {
    if (!form || !lastAuthEmail) {
        return;
    }
    const emailInput = getEmailInput(form);
    if (emailInput && !emailInput.value) {
        emailInput.value = lastAuthEmail;
    }
}

function setAuthMode(form, mode, options = {}) {
    if (!form) {
        return;
    }

    const { preserveFeedback = false, preserveVerification = false } = options;
    const normalizedMode = mode === 'register' ? 'register' : 'login';
    form.dataset.authMode = normalizedMode;
    form.classList.toggle('is-register-mode', normalizedMode === 'register');

    const container = form.closest('.login-container');
    if (container) {
        const title = container.querySelector('[data-auth-title]');
        if (title) {
            title.textContent = normalizedMode === 'register' ? LOGIN_TEXT.registerTitle : LOGIN_TEXT.title;
        }
        const description = container.querySelector('[data-auth-description]');
        if (description) {
            if (normalizedMode === 'register' && LOGIN_TEXT.registerSubtitle) {
                description.textContent = LOGIN_TEXT.registerSubtitle;
                description.hidden = false;
            } else {
                description.hidden = true;
            }
        }
    }

    form.querySelectorAll('[data-auth-register-only]').forEach((element) => {
        element.hidden = normalizedMode !== 'register';
    });
    form.querySelectorAll('[data-auth-login-only]').forEach((element) => {
        element.hidden = normalizedMode === 'register';
    });

    const switchToRegister = form.querySelector('[data-auth-switch="register"]');
    const switchToLogin = form.querySelector('[data-auth-switch="login"]');
    if (switchToRegister) {
        switchToRegister.hidden = normalizedMode === 'register';
    }
    if (switchToLogin) {
        switchToLogin.hidden = normalizedMode !== 'register';
    }

    const forgotButton = form.querySelector('[data-auth-forgot]');
    if (forgotButton) {
        forgotButton.hidden = normalizedMode === 'register';
    }

    const submit = form.querySelector('[data-auth-submit]');
    if (submit) {
        submit.textContent = getSubmitLabel(form, false);
    }

    const passwordInput = getPasswordInput(form);
    if (passwordInput) {
        passwordInput.setAttribute('autocomplete', normalizedMode === 'register' ? 'new-password' : 'current-password');
    }

    const confirmInput = getPasswordConfirmInput(form);
    if (confirmInput) {
        confirmInput.required = normalizedMode === 'register';
        if (normalizedMode !== 'register') {
            confirmInput.value = '';
        }
    }

    if (!preserveFeedback) {
        setLoginFeedback('', 'neutral', form);
    }

    if (!preserveVerification) {
        hideVerificationBanner(form);
    }
}

function bindAuthForms() {
    queryAuthForms().forEach((form) => {
        if (form.dataset.authBound === 'true') {
            setAuthMode(form, getAuthMode(form), { preserveFeedback: true, preserveVerification: true });
            applyEmailPrefill(form);
            return;
        }

        setAuthMode(form, form.dataset.authMode || 'login');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleAuthSubmit(form);
        });

        const emailInput = getEmailInput(form);
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                rememberEmail(emailInput.value.trim());
                setLoginFeedback('', 'neutral', form);
            });
            emailInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAuthSubmit(form);
                }
            });
        }

        const passwordInput = getPasswordInput(form);
        if (passwordInput) {
            passwordInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
            passwordInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAuthSubmit(form);
                }
            });
        }

        const confirmInput = getPasswordConfirmInput(form);
        if (confirmInput) {
            confirmInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
            confirmInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAuthSubmit(form);
                }
            });
        }

        const classInput = getClassInput(form);
        if (classInput) {
            classInput.addEventListener('input', () => setLoginFeedback('', 'neutral', form));
        }

        const toggle = form.querySelector('[data-auth-toggle]');
        if (toggle) {
            toggle.addEventListener('click', () => togglePasswordVisibility(form));
        }

        form.querySelectorAll('[data-auth-switch]').forEach((button) => {
            button.addEventListener('click', () => {
                const targetMode = button.dataset.authSwitch === 'register' ? 'register' : 'login';
                setAuthMode(form, targetMode);
                if (targetMode === 'register') {
                    const targetPassword = getPasswordInput(form);
                    if (targetPassword) {
                        targetPassword.focus();
                    }
                } else {
                    focusPasswordField(form);
                }
            });
        });

        const guestButton = form.querySelector('[data-auth-guest]');
        if (guestButton) {
            guestButton.addEventListener('click', () => guestLogin());
        }

        const resendButton = form.querySelector('[data-auth-resend]');
        if (resendButton) {
            resendButton.addEventListener('click', () => resendVerification(form));
        }

        const forgotButton = form.querySelector('[data-auth-forgot]');
        if (forgotButton) {
            forgotButton.addEventListener('click', () => handlePasswordReset(form));
        }

        form.dataset.authBound = 'true';
        applyEmailPrefill(form);
    });
}

function getActiveAuthForm() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay && overlay.classList.contains('is-visible')) {
        const overlayForm = overlay.querySelector('[data-auth-form]');
        if (overlayForm) {
            return overlayForm;
        }
    }
    const standalone = document.querySelector('.login-container [data-auth-form]');
    if (standalone) {
        return standalone;
    }
    return queryAuthForms()[0] || null;
}

function handleAuthOverlayEscape(event) {
    if (event.key === 'Escape') {
        closeAuthOverlay();
    }
}

function createAuthOverlay() {
    let overlay = document.getElementById('auth-overlay');
    if (overlay) {
        bindAuthForms();
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.className = 'auth-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="auth-overlay__backdrop" data-auth-close></div>
        <div class="login-container" role="dialog" aria-modal="true" aria-labelledby="auth-overlay-title">
            <button type="button" class="auth-overlay__close" data-auth-close aria-label="${LOGIN_TEXT.close}">×</button>
            <img src="../media/logo.png" alt="Logo" class="login-logo">
            <h2 class="login-title" id="auth-overlay-title" data-auth-title>${LOGIN_TEXT.title}</h2>
            <p class="login-description" data-auth-description hidden>${LOGIN_TEXT.registerSubtitle}</p>
            <p class="login-status" data-auth-status>${getAuthStatusText()}</p>
            <form class="login-form" data-auth-form novalidate>
                <div class="login-banner" data-auth-verification hidden>
                    <strong>${LOGIN_TEXT.verificationTitle}</strong>
                    <p>${LOGIN_TEXT.verificationDescription}</p>
                    <button type="button" class="login-link" data-auth-resend>${LOGIN_TEXT.verificationResend}</button>
                </div>
                <div class="form-group">
                    <label for="overlay-email">${LOGIN_TEXT.emailLabel}</label>
                    <input type="email" id="overlay-email" class="form-control" placeholder="${LOGIN_TEXT.emailPlaceholder}" autocomplete="email" data-auth-email>
                </div>
                <div class="form-group">
                    <label for="overlay-password">${LOGIN_TEXT.passwordLabel}</label>
                    <div class="password-field">
                        <input type="password" id="overlay-password" class="form-control" placeholder="${LOGIN_TEXT.passwordPlaceholder}" autocomplete="current-password" data-auth-password>
                        <button type="button" class="toggle-password" data-auth-toggle aria-label="${LOGIN_TEXT.show}">
                            <span class="eye-icon" aria-hidden="true"></span>
                        </button>
                    </div>
                    <div class="login-feedback" data-auth-feedback role="alert" aria-live="polite" hidden></div>
                </div>
                <div class="form-group" data-auth-register-only hidden>
                    <label for="overlay-password-confirm">${LOGIN_TEXT.registerPasswordConfirmLabel}</label>
                    <input type="password" id="overlay-password-confirm" class="form-control" placeholder="${LOGIN_TEXT.passwordPlaceholder}" autocomplete="new-password" data-auth-password-confirm>
                </div>
                <div class="form-group" data-auth-register-only hidden>
                    <label for="overlay-class">${LOGIN_TEXT.registerClassLabel}</label>
                    <input type="text" id="overlay-class" class="form-control" placeholder="${LOGIN_TEXT.registerClassPlaceholder}" autocomplete="organization" data-auth-class>
                </div>
                <div class="login-links">
                    <button type="button" class="login-link" data-auth-forgot data-auth-login-only>${LOGIN_TEXT.forgotPassword}</button>
                    <button type="button" class="login-link" data-auth-switch="register">${LOGIN_TEXT.switchToRegister}</button>
                    <button type="button" class="login-link" data-auth-switch="login" hidden>${LOGIN_TEXT.switchToLogin}</button>
                </div>
                <div class="login-actions">
                    <button type="submit" class="login-button" data-auth-submit>${LOGIN_TEXT.submit}</button>
                    <button type="button" class="guest-button" data-auth-guest>${LOGIN_TEXT.guestButton}</button>
                    <p class="guest-info">${LOGIN_TEXT.guestInfo}</p>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('[data-auth-close]').forEach((element) => {
        element.addEventListener('click', closeAuthOverlay);
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeAuthOverlay();
        }
    });

    bindAuthForms();

    return overlay;
}

function initAuthOverlay() {
    if (!authOverlayInitialized) {
        createAuthOverlay();
        authOverlayInitialized = true;
    } else {
        bindAuthForms();
    }
    return document.getElementById('auth-overlay');
}

function openAuthOverlay(trigger) {
    const overlay = initAuthOverlay();
    if (!overlay) {
        return;
    }

    authOverlayPreviousFocus = trigger || document.activeElement;

    const form = overlay.querySelector('[data-auth-form]');
    hideVerificationBanner(form);
    setLoginFeedback('', 'neutral', form);
    setAuthMode(form, 'login');
    applyEmailPrefill(form);

    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-auth-overlay');
    bindAuthForms();
    updateAuthStatus();

    window.setTimeout(() => focusPasswordField(form), 0);
    document.addEventListener('keydown', handleAuthOverlayEscape);
}

function closeAuthOverlay() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) {
        return;
    }

    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-auth-overlay');
    document.removeEventListener('keydown', handleAuthOverlayEscape);

    const form = overlay.querySelector('[data-auth-form]');
    hideVerificationBanner(form);
    setLoginFeedback('', 'neutral', form);

    if (authOverlayPreviousFocus && typeof authOverlayPreviousFocus.focus === 'function') {
        try {
            authOverlayPreviousFocus.focus();
        } catch (error) {
            /* ignore */
        }
    }

    authOverlayPreviousFocus = null;
}

function handleAuthSubmit(form) {
    if (getAuthMode(form) === 'register') {
        register(form);
    } else {
        login(form);
    }
}

async function register(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const emailInput = getEmailInput(targetForm);
    const passwordInput = getPasswordInput(targetForm);
    const confirmInput = getPasswordConfirmInput(targetForm);
    const classInput = getClassInput(targetForm);

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmation = confirmInput ? confirmInput.value : '';
    const classIdentifier = classInput ? classInput.value.trim() : '';

    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }

    if (!password) {
        setLoginFeedback(LOGIN_TEXT.passwordRequired, 'error', targetForm);
        if (passwordInput) {
            passwordInput.focus();
        }
        return;
    }

    if (password.length < 8) {
        setLoginFeedback(LOGIN_TEXT.registerWeakPassword, 'error', targetForm);
        if (passwordInput) {
            passwordInput.focus();
        }
        return;
    }

    if (confirmInput && password !== confirmation) {
        setLoginFeedback(LOGIN_TEXT.registerPasswordMismatch, 'error', targetForm);
        confirmInput.focus();
        return;
    }

    setLoginFeedback('', 'neutral', targetForm);
    hideVerificationBanner(targetForm);
    setFormLoading(targetForm, true);

    try {
        const payload = { email, password };
        if (classIdentifier) {
            payload.class = classIdentifier;
        }

        const response = await fetch(AUTH_API.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 400 && data && data.errors) {
                if (data.errors.email === 'invalid_email') {
                    setLoginFeedback(LOGIN_TEXT.registerEmailInvalid, 'error', targetForm);
                    emailInput?.focus();
                    return;
                }
                if (data.errors.password === 'weak_password') {
                    setLoginFeedback(LOGIN_TEXT.registerWeakPassword, 'error', targetForm);
                    if (passwordInput) {
                        passwordInput.focus();
                    }
                    return;
                }
            }

            if (response.status === 404 && data && data.message === 'class_not_found') {
                setLoginFeedback(LOGIN_TEXT.registerClassNotFound, 'error', targetForm);
                classInput?.focus();
                return;
            }

            if (response.status === 409 && data && data.message === 'email_exists') {
                setLoginFeedback(LOGIN_TEXT.registerEmailExists, 'error', targetForm);
                emailInput?.focus();
                return;
            }

            setLoginFeedback(LOGIN_TEXT.registerGenericError, 'error', targetForm);
            return;
        }

        setLoginFeedback(LOGIN_TEXT.registerSuccess, 'success', targetForm);
        rememberEmail(email);

        if (passwordInput) {
            passwordInput.value = '';
        }
        if (confirmInput) {
            confirmInput.value = '';
        }
        if (classInput) {
            classInput.value = '';
        }

        setAuthMode(targetForm, 'login', { preserveFeedback: true, preserveVerification: true });
        showVerificationBanner(targetForm);
        focusPasswordField(targetForm);
    } catch (error) {
        console.error('Registrierung fehlgeschlagen', error);
        setLoginFeedback(LOGIN_TEXT.registerGenericError, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
    }
}

async function login(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const emailInput = getEmailInput(targetForm);
    const passwordInput = getPasswordInput(targetForm);
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }

    if (!password) {
        setLoginFeedback(LOGIN_TEXT.passwordRequired, 'error', targetForm);
        focusPasswordField(targetForm);
        return;
    }

    setLoginFeedback('', 'neutral', targetForm);
    hideVerificationBanner(targetForm);
    setFormLoading(targetForm, true);

    try {
        const response = await fetch(AUTH_API.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (data && data.message === 'email_not_verified') {
                setLoginFeedback(LOGIN_TEXT.emailNotVerified, 'error', targetForm);
                showVerificationBanner(targetForm);
                rememberEmail(email);
            } else if (data && data.message === 'invalid_credentials') {
                setLoginFeedback(LOGIN_TEXT.invalidCredentials, 'error', targetForm);
                focusPasswordField(targetForm);
            } else if (data && data.message === 'inactive') {
                setLoginFeedback(LOGIN_TEXT.inactive, 'error', targetForm);
            } else {
                setLoginFeedback(LOGIN_TEXT.genericError, 'error', targetForm);
            }
            return;
        }

        const role = data && data.role ? data.role : 'student';
        setAuthenticatedSession(role, email);
        closeAuthOverlay();

        if (isAdmin()) {
            window.location.href = AUTH_PATHS.admin;
            return;
        }

        if (window.location.pathname.toLowerCase().includes(AUTH_PATHS.login)) {
            window.location.href = AUTH_PATHS.home;
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error('Login fehlgeschlagen', error);
        setLoginFeedback(LOGIN_TEXT.genericError, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
    }
}

async function resendVerification(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }
    const emailInput = getEmailInput(targetForm);
    const email = emailInput && emailInput.value ? emailInput.value.trim().toLowerCase() : lastAuthEmail;
    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }
    const button = targetForm.querySelector('[data-auth-resend]');
    if (button) {
        button.disabled = true;
        button.dataset.locked = 'true';
        button.textContent = LOGIN_TEXT.verificationResendLoading;
    }
    try {
        const response = await fetch(AUTH_API.resend, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (response.ok) {
            setLoginFeedback(LOGIN_TEXT.resendSuccess, 'success', targetForm);
            rememberEmail(email);
        } else {
            setLoginFeedback(LOGIN_TEXT.resendError, 'error', targetForm);
        }
    } catch (error) {
        console.error('Resend fehlgeschlagen', error);
        setLoginFeedback(LOGIN_TEXT.resendError, 'error', targetForm);
    } finally {
        if (button) {
            button.disabled = false;
            button.dataset.locked = 'false';
            button.textContent = LOGIN_TEXT.verificationResend;
        }
    }
}

async function handlePasswordReset(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const emailInput = getEmailInput(targetForm);
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    if (!email) {
        setLoginFeedback(LOGIN_TEXT.forgotPasswordMissingEmail, 'error', targetForm);
        emailInput?.focus();
        return;
    }

    const button = targetForm.querySelector('[data-auth-forgot]');
    if (button) {
        button.disabled = true;
    }

    try {
        const response = await fetch(AUTH_API.passwordReset, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            setLoginFeedback(LOGIN_TEXT.passwordResetSent, 'success', targetForm);
            rememberEmail(email);
        } else {
            setLoginFeedback(LOGIN_TEXT.passwordResetError, 'error', targetForm);
        }
    } catch (error) {
        console.error('Passwort-Zurücksetzen fehlgeschlagen', error);
        setLoginFeedback(LOGIN_TEXT.passwordResetError, 'error', targetForm);
    } finally {
        if (button) {
            button.disabled = false;
        }
    }
}

function guestLogin() {
    clearSessionState();
    closeAuthOverlay();
}

async function logout() {
    try {
        await fetch(AUTH_API.logout, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout fehlgeschlagen', error);
    } finally {
        clearSessionState();
        window.location.reload();
    }
}

const CREATE_DISABLED_MESSAGE = (window.hmI18n && window.hmI18n.get('calendar.actions.create.disabled'))
    || 'Nur Admins können Einträge erstellen';

const CALENDAR_MODAL_SCOPE = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const CALENDAR_MODAL_BUTTONS = {
    add: CALENDAR_MODAL_SCOPE('buttons.add', 'Hinzufügen'),
    addLoading: CALENDAR_MODAL_SCOPE('buttons.addLoading', 'Hinzufügen …'),
    save: CALENDAR_MODAL_SCOPE('buttons.save', 'Speichern'),
    saveLoading: CALENDAR_MODAL_SCOPE('buttons.saveLoading', 'Speichern …')
};

const CALENDAR_MODAL_MESSAGES = {
    saveSuccess: CALENDAR_MODAL_SCOPE('messages.saveSuccess', 'Eintrag wurde erfolgreich gespeichert!'),
    saveRetry: CALENDAR_MODAL_SCOPE(
        'messages.saveRetry',
        'Der Eintrag konnte nach mehreren Versuchen nicht gespeichert werden. Bitte versuche es später noch einmal.'
    )
};

function menuButton() {
    const links = document.getElementById('navbarlinks');
    if (links.style.display === 'block') {
        links.style.display = 'none';
    } else {
        links.style.display = 'block';
    }
}

function initLanguageSelector() {
    const languages = [
        { code: 'de', short: 'DE', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'en', short: 'EN', name: 'English', flag: '🇬🇧' },
        { code: 'it', short: 'IT', name: 'Italiano', flag: '🇮🇹' },
        { code: 'fr', short: 'FR', name: 'Français', flag: '🇫🇷' }
    ];

    const langMap = languages.reduce((map, entry) => {
        map[entry.code] = entry;
        return map;
    }, {});

    const dropdowns = Array.from(document.querySelectorAll('[data-language]'));
    if (!dropdowns.length) {
        return;
    }

    const getCurrentLanguage = () => {
        const parts = window.location.pathname.split('/');
        const candidate = (parts[1] || '').toLowerCase();
        return langMap[candidate] ? candidate : 'de';
    };

    const updateButtonLabel = (button, langCode) => {
        const data = langMap[langCode] || langMap.en;
        const code = button.querySelector('.language-button__code');
        if (code) {
            code.textContent = data.short;
        }
    };

    const closeDropdown = (dropdown) => {
        dropdown.classList.remove('is-open');
        const button = dropdown.querySelector('[data-language-toggle]');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
        dropdown.querySelectorAll('[data-lang]').forEach((item) => {
            item.setAttribute('tabindex', '-1');
        });
    };

    const openDropdown = (dropdown) => {
        dropdown.classList.add('is-open');
        const button = dropdown.querySelector('[data-language-toggle]');
        if (button) {
            button.setAttribute('aria-expanded', 'true');
        }
    };

    const closeAll = (except) => {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== except) {
                closeDropdown(dropdown);
            }
        });
    };

    dropdowns.forEach((dropdown, index) => {
        const button = dropdown.querySelector('[data-language-toggle]');
        const menu = dropdown.querySelector('[data-language-menu]');
        if (!button || !menu) {
            return;
        }

        const menuId = menu.id || `language-menu-${index + 1}`;
        menu.id = menuId;
        menu.setAttribute('role', 'menu');
        button.setAttribute('aria-controls', menuId);
        button.setAttribute('aria-expanded', 'false');

        const items = Array.from(menu.querySelectorAll('[data-lang]'));

        const syncOptionState = (currentLang) => {
            items.forEach((item) => {
                const lang = item.dataset.lang;
                const data = langMap[lang] || langMap.en;
                const code = item.querySelector('.language-option__code');
                if (code) code.textContent = data.short;
                const name = item.querySelector('.language-option__name');
                if (name) name.textContent = data.name;
                const flag = item.querySelector('.language-option__flag');
                if (flag) flag.textContent = data.flag;
                item.setAttribute('role', 'menuitem');
                item.setAttribute('tabindex', '-1');
                if (lang === currentLang) {
                    item.setAttribute('aria-current', 'true');
                } else {
                    item.removeAttribute('aria-current');
                }
            });
        };

        const focusItem = (indexToFocus) => {
            if (!items.length) {
                return;
            }
            const targetIndex = Math.max(0, Math.min(indexToFocus, items.length - 1));
            items.forEach((item, position) => {
                item.setAttribute('tabindex', position === targetIndex ? '0' : '-1');
            });
            const target = items[targetIndex];
            if (target) {
                target.focus();
            }
        };

        const getCurrentIndex = (langCode) => {
            const idx = items.findIndex((item) => item.dataset.lang === langCode);
            return idx === -1 ? 0 : idx;
        };

        const selectLanguage = (lang) => {
            if (!langMap[lang]) {
                return;
            }
            closeDropdown(dropdown);
            const parts = window.location.pathname.split('/');
            if (parts.length > 1) {
                parts[1] = lang;
            } else {
                parts.push(lang);
            }
            const nextPath = parts.join('/').replace(/\/{2,}/g, '/');
            window.location.pathname = nextPath;
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();
            const isOpen = dropdown.classList.contains('is-open');
            closeAll(dropdown);
            if (!isOpen) {
                openDropdown(dropdown);
                const current = getCurrentLanguage();
                syncOptionState(current);
                focusItem(getCurrentIndex(current));
            } else {
                closeDropdown(dropdown);
            }
        });

        button.addEventListener('keydown', (event) => {
            const current = getCurrentLanguage();
            switch (event.key) {
                case 'ArrowDown':
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    if (!dropdown.classList.contains('is-open')) {
                        closeAll(dropdown);
                        openDropdown(dropdown);
                        syncOptionState(current);
                    }
                    focusItem(getCurrentIndex(current));
                    break;
                }
                case 'ArrowUp': {
                    event.preventDefault();
                    if (!dropdown.classList.contains('is-open')) {
                        closeAll(dropdown);
                        openDropdown(dropdown);
                        syncOptionState(current);
                    }
                    focusItem(items.length - 1);
                    break;
                }
                case 'Escape': {
                    event.preventDefault();
                    closeDropdown(dropdown);
                    button.focus();
                    break;
                }
                default:
                    break;
            }
        });

        items.forEach((item, itemIndex) => {
            item.addEventListener('click', () => selectLanguage(item.dataset.lang));
            item.addEventListener('keydown', (event) => {
                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        focusItem((itemIndex + 1) % items.length);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        focusItem((itemIndex - 1 + items.length) % items.length);
                        break;
                    case 'Home':
                        event.preventDefault();
                        focusItem(0);
                        break;
                    case 'End':
                        event.preventDefault();
                        focusItem(items.length - 1);
                        break;
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        selectLanguage(item.dataset.lang);
                        break;
                    case 'Escape':
                        event.preventDefault();
                        closeDropdown(dropdown);
                        button.focus();
                        break;
                    default:
                        break;
                }
            });
        });

        const initialLang = getCurrentLanguage();
        updateButtonLabel(button, initialLang);
        syncOptionState(initialLang);
    });

    document.addEventListener('click', (event) => {
        if (!dropdowns.some((dropdown) => dropdown.contains(event.target))) {
            dropdowns.forEach(closeDropdown);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openDropdownEl = dropdowns.find((dropdown) => dropdown.classList.contains('is-open'));
            if (openDropdownEl) {
                closeDropdown(openDropdownEl);
                const trigger = openDropdownEl.querySelector('[data-language-toggle]');
                trigger?.focus();
            }
        }
    });
}


function initSimpleNav() {
    const nav = document.querySelector('.simple-nav');
    if (!nav || nav.dataset.enhanced === 'true') {
        return;
    }

    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');

    if (links && !links.id) {
        links.id = `nav-links-${Math.random().toString(36).slice(2, 9)}`;
    }

    if (toggle && links) {
        toggle.setAttribute('aria-controls', links.id);
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('simple-nav--open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    const closeMenu = () => {
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
        nav.classList.remove('simple-nav--open');
    };

    if (links) {
        links.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                closeMenu();
            }
        });
    }

    document.addEventListener('click', (event) => {
        if (!nav.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    nav.dataset.enhanced = 'true';
}

function checkLogin() {
    const pathname = window.location.pathname.toLowerCase();
    const isLoginPage = pathname.endsWith('login.html');

    bindAuthForms();
    updateAuthUI();
    setupAuthButton();

    if (isLoginPage) {
        if (isAdmin()) {
            window.location.replace(AUTH_PATHS.admin);
            return;
        }
        if (isAuthenticated()) {
            window.location.replace(AUTH_PATHS.home);
            return;
        }
    }

    initAuthOverlay();
}

  

  

function clearContent() {
    document.getElementById('content').innerHTML = "";
}

/** KALENDER-FUNKTION **/
async function openCalendar() {
    try {
        clearContent();

        const res = await fetch(`${API_BASE}/entries`);
        if (!res.ok) {
            throw new Error(`API-Fehler (${res.status})`);
        }
        const entries = await res.json();
        const colorMap = { hausaufgabe: '#007bff', pruefung: '#dc3545', event: '#28a745' };
        const sanitizeTime = (type, value) => {
            if (!value) return '';
            const trimmed = String(value).trim();
            if (!trimmed) return '';
            if (type === 'event' && (trimmed === '00:00:00' || trimmed === '00:00')) {
                return '';
            }
            return trimmed;
        };
        const events = entries.map(e => {
            const startTime = sanitizeTime(e.typ, e.startzeit);
            return {
                title: e.beschreibung,
                start: startTime ? `${e.datum}T${startTime}` : e.datum,
                color: colorMap[e.typ] || '#000'
            };
        });

        document.getElementById('content').innerHTML = '<div id="calendar"></div>';

        const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events
        });

        calendar.render();
    } catch (err) {
        console.error('Fehler beim Laden oder Rendern des Kalenders:', err);
    }
}

/** AKTUELLES FACH MIT AUTOMATISCHER AKTUALISIERUNG **/
let fachInterval;

async function loadCurrentSubject() {
  clearContent();
  async function update() {
    const res = await fetch(`${API_BASE}/aktuelles_fach`);
    const data = await res.json();
    document.getElementById('content').innerHTML = `
      <h2>Aktuelles Fach: ${data.fach}</h2>
      <h3>Verbleibend: ${data.verbleibend}</h3>
      <p><strong>Raum:</strong> ${data.raum}</p>
    `;
  }
  clearInterval(fachInterval);
  await update();
  fachInterval = setInterval(update, 1000);
}

/** EINMALIGE ABFRAGE (ohne Intervall) **/
async function aktuellesFachLaden() {
  const res = await fetch(`${API_BASE}/aktuelles_fach`);
  const data = await res.json();
  document.getElementById('fachInfo').innerHTML = `
    <p><strong>Fach:</strong> ${data.fach}</p>
    <p><strong>Endet um:</strong> ${data.endet || '-'} </p>
    <p><strong>Verbleibend:</strong> ${data.verbleibend}</p>
    <p><strong>Raum:</strong> ${data.raum}</p>
  `;
}



/** EINTRAG ERFASSEN MIT DROPDOWN UND DB-ANBINDUNG **/
function closeEntryModal() {
    const overlay = document.getElementById('entry-modal-overlay');
    if (overlay) {
        if (window.hmModal) {
            window.hmModal.close(overlay);
        } else {
            overlay.classList.remove('is-open');
        }
    }
    const form = document.getElementById('entry-form');
    if (form) {
        form.reset();
        form.dataset.allowEmptySubject = 'false';
        const controller = setupModalFormInteractions(form);
        controller?.setType('event');
        controller?.evaluate();
    }
}

const ENTRY_FORM_MESSAGES = {
    invalidDate: 'Bitte gib ein gültiges Datum im Format TT.MM.JJJJ ein.',
    invalidEnd: 'Die Endzeit darf nicht vor der Startzeit liegen.',
    missingSubject: 'Bitte wähle ein Fach aus.',
    missingEventTitle: 'Bitte gib einen Event-Titel ein.'
};

if (window.hmI18n) {
    const formMessages = window.hmI18n.get('calendar.formMessages');
    if (formMessages && typeof formMessages === 'object') {
        Object.assign(ENTRY_FORM_MESSAGES, formMessages);
    }
}

function parseSwissDate(value) {
    if (!value) return null;
    const trimmed = value.trim();

    let day;
    let month;
    let year;

    let match = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) {
        day = Number(match[1]);
        month = Number(match[2]);
        year = Number(match[3]);
    } else {
        match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
            return null;
        }
        year = Number(match[1]);
        month = Number(match[2]);
        day = Number(match[3]);
    }

    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return `${year.toString().padStart(4, '0')}-${month
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function setupModalFormInteractions(form, initialMessages = ENTRY_FORM_MESSAGES) {
    if (!form) {
        return null;
    }
    if (!('allowEmptySubject' in form.dataset)) {
        form.dataset.allowEmptySubject = 'false';
    }
    if (form.dataset.enhanced === 'true' && form._modalController) {
        form._modalController.evaluate();
        return form._modalController;
    }

    let messages = { ...initialMessages };
    const typeSelect = form.querySelector('[data-field="type"] select');
    const subjectGroup = form.querySelector('[data-field="subject"]');
    const subjectSelect = subjectGroup ? subjectGroup.querySelector('select') : null;
    const eventTitleGroup = form.querySelector('[data-field="event-title"]');
    const eventTitleInput = eventTitleGroup ? eventTitleGroup.querySelector('input') : null;
    const dateInput = form.querySelector('[data-field="date"] input');
    const startInput = form.querySelector('[data-field="start"] input');
    const endInput = form.querySelector('[data-field="end"] input');
    const saveButton = form.querySelector('[data-role="submit"]');
    const cancelButton = form.querySelector('[data-role="cancel"]');

    const setInvalidState = (input) => {
        if (!input) return;
        input.classList.toggle('is-invalid', !input.checkValidity());
    };

    const evaluate = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';
        const allowEmptySubject = form.dataset.allowEmptySubject === 'true';

        if (dateInput) {
            const iso = parseSwissDate(dateInput.value);
            if (!iso) {
                dateInput.setCustomValidity(messages.invalidDate || '');
            } else {
                dateInput.setCustomValidity('');
            }
        }

        if (subjectSelect) {
            const shouldRequireSubject = !isEvent && !allowEmptySubject;
            subjectSelect.required = shouldRequireSubject;
            if (shouldRequireSubject && !subjectSelect.value) {
                subjectSelect.setCustomValidity(messages.missingSubject || '');
            } else {
                subjectSelect.setCustomValidity('');
            }
        }

        if (eventTitleInput) {
            if (isEvent) {
                const trimmed = eventTitleInput.value.trim();
                if (!trimmed) {
                    eventTitleInput.setCustomValidity(messages.missingEventTitle || '');
                } else {
                    eventTitleInput.setCustomValidity('');
                }
            } else {
                eventTitleInput.setCustomValidity('');
            }
        }

        if (startInput && endInput) {
            if (!startInput.value) {
                endInput.value = '';
                endInput.disabled = true;
                endInput.setCustomValidity('');
            } else {
                endInput.disabled = false;
                if (endInput.value && endInput.value < startInput.value) {
                    endInput.setCustomValidity(messages.invalidEnd || '');
                } else {
                    endInput.setCustomValidity('');
                }
            }
        }

        [dateInput, startInput, endInput, subjectSelect, eventTitleInput].forEach(setInvalidState);

        if (saveButton) {
            saveButton.disabled = !form.checkValidity();
        }
    };

    const toggleTypeFields = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';
        const allowEmptySubject = form.dataset.allowEmptySubject === 'true';
        if (subjectGroup) {
            subjectGroup.classList.toggle('is-hidden', Boolean(isEvent));
        }
        if (subjectSelect) {
            subjectSelect.required = !isEvent && !allowEmptySubject;
            if (isEvent) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            } else if (!subjectSelect.required && !subjectSelect.value) {
                subjectSelect.setCustomValidity('');
            }
        }
        if (eventTitleGroup) {
            eventTitleGroup.classList.toggle('is-hidden', !isEvent);
        }
        if (eventTitleInput) {
            eventTitleInput.required = isEvent;
            if (!isEvent) {
                eventTitleInput.value = '';
                eventTitleInput.setCustomValidity('');
            }
        }
        evaluate();
    };

    if (typeSelect) {
        typeSelect.addEventListener('change', toggleTypeFields);
    }

    [dateInput, startInput, endInput, subjectSelect, eventTitleInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', evaluate);
        input.addEventListener('blur', () => setInvalidState(input));
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', evaluate);
        }
    });

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            if (form.id === 'entry-form') {
                closeEntryModal();
            } else {
                closeModal();
            }
        });
    }

    form.addEventListener('reset', () => {
        window.setTimeout(() => {
            if (dateInput) {
                dateInput.value = '';
                dateInput.setCustomValidity('');
            }
            if (startInput) {
                startInput.value = '';
            }
            if (endInput) {
                endInput.value = '';
                endInput.disabled = true;
                endInput.setCustomValidity('');
            }
            if (eventTitleInput) {
                eventTitleInput.value = '';
                eventTitleInput.setCustomValidity('');
            }
            if (subjectSelect) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            }
            if (typeSelect) {
                typeSelect.value = 'event';
            }
            toggleTypeFields();
        }, 0);
    });

    form.dataset.enhanced = 'true';

    const controller = {
        evaluate,
        toggleTypeFields,
        setMessages(nextMessages) {
            messages = { ...messages, ...nextMessages };
            evaluate();
        },
        setType(value) {
            if (typeSelect) {
                typeSelect.value = value;
                toggleTypeFields();
            }
        }
    };

    form._modalController = controller;

    toggleTypeFields();
    evaluate();

    return controller;
}

function showEntryForm() {
    if (!isAdmin()) {
        showOverlay(CREATE_DISABLED_MESSAGE);
        return;
    }
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (!overlay || !form) {
        console.error('Eintrags-Overlay nicht gefunden.');
        return;
    }

    form.reset();
    form.dataset.allowEmptySubject = 'false';
    const controller = setupModalFormInteractions(form);
    if (controller) {
        controller.setType('event');
        controller.evaluate();
    }
    const saveButton = form.querySelector('#saveButton');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = CALENDAR_MODAL_BUTTONS.add;
    }

    const initialFocus = form.querySelector('[data-hm-modal-initial-focus]') || form.querySelector('select, input, textarea, button');
    if (window.hmModal) {
        window.hmModal.open(overlay, {
            initialFocus,
            onRequestClose: closeEntryModal
        });
    } else {
        overlay.classList.add('is-open');
        if (initialFocus && typeof initialFocus.focus === 'function') {
            try {
                initialFocus.focus({ preventScroll: true });
            } catch (err) {
                initialFocus.focus();
            }
        }
    }
}

async function saveEntry(event) {
    if (event) {
        event.preventDefault();
    }

    const form = document.getElementById('entry-form');
    if (!form) {
        console.error('Eintragsformular fehlt.');
        return;
    }

    const controller = setupModalFormInteractions(form);
    controller?.evaluate();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const typeField = document.getElementById('typ');
    const subjectField = document.getElementById('fach');
    const descriptionField = document.getElementById('beschreibung');
    const dateField = document.getElementById('datum');
    const startField = document.getElementById('startzeit');
    const endField = document.getElementById('endzeit');
    const eventTitleField = document.getElementById('event-titel');
    const saveButton = document.getElementById('saveButton');

    if (!typeField || !dateField || !startField || !saveButton) {
        console.error('Formularfelder fehlen.');
        return;
    }

    const typ = typeField.value;
    const fach = subjectField ? subjectField.value.trim() : '';
    const beschreibung = descriptionField ? descriptionField.value.trim() : '';
    const datumInput = dateField.value.trim();
    const startzeitInput = startField.value;
    const endzeitInput = endField && !endField.disabled ? endField.value : '';
    const eventTitle = eventTitleField ? eventTitleField.value.trim() : '';

    const isoDate = parseSwissDate(datumInput);
    if (!isoDate) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidDate);
        dateField.focus();
        return;
    }

    if (endzeitInput && startzeitInput && endzeitInput < startzeitInput) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidEnd);
        return;
    }

    const startzeit = startzeitInput ? `${startzeitInput}:00` : null;
    const endzeit = endzeitInput ? `${endzeitInput}:00` : null;
    const isEvent = typ === 'event';

    const payloadBeschreibung = isEvent
        ? eventTitle + (beschreibung ? `\n\n${beschreibung}` : '')
        : beschreibung;
    const payloadSubject = isEvent ? '' : fach;

    saveButton.disabled = true;
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.saveLoading;

    let success = false;
    let attempt = 0;
    const maxAttempts = 10;

    while (!success && attempt < maxAttempts) {
        try {
            const response = await fetch(`${API_BASE}/add_entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ typ, fach: payloadSubject, beschreibung: payloadBeschreibung, datum: isoDate, startzeit, endzeit })
            });
            const result = await response.json();

            if (result.status === "ok") {
                success = true;
                showOverlay(CALENDAR_MODAL_MESSAGES.saveSuccess);
                closeEntryModal();
                document.getElementById('overlay-close')
                    .addEventListener('click', () => location.reload(), { once: true });
                if (form) {
                    form.reset();
                    controller?.setType('event');
                }
            } else {
                console.error("Server-Fehler beim Speichern:", result.message);
            }
        } catch (error) {
            console.error("Netzwerk-Fehler beim Speichern:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Speicher-Versuch ${attempt} fehlgeschlagen. Neuer Versuch in 2 Sekunden.`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success) {
        showOverlay(CALENDAR_MODAL_MESSAGES.saveRetry);
    } else {
        if (form) {
            form.reset();
            controller?.setType('event');
        }
    }

    // Button wieder aktivieren
    saveButton.disabled = false;
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.add;
}

// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', initLanguageSelector);
window.addEventListener('DOMContentLoaded', () => {
    setupModalFormInteractions(document.getElementById('entry-form'));
    setupModalFormInteractions(document.getElementById('fc-edit-form'));
});
window.addEventListener('DOMContentLoaded', initSimpleNav);

