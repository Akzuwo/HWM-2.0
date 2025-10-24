// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    title: '🔒 Connexion',
    registerTitle: '🆕 Créer un compte',
    registerSubtitle: 'Inscris-toi avec ton adresse e-mail scolaire.',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'nom@example.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Mot de passe',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    emailRequired: 'Saisis une adresse e-mail.',
    passwordRequired: 'Saisis un mot de passe.',
    invalidCredentials: 'Adresse e-mail ou mot de passe incorrect.',
    inactive: 'Ton compte a été désactivé. Contacte un administrateur.',
    emailNotVerified: 'Merci de vérifier d’abord ton adresse e-mail.',
    verificationStepTitle: 'Vous y êtes presque !',
    verificationStepSubtitle: 'Confirme ton e-mail pour commencer.',
    verificationCodeLabel: 'Code de vérification',
    verificationCodePlaceholder: 'Code à 8 chiffres',
    verificationCodeHint: '⚠️ L’envoi de l’e-mail peut prendre jusqu’à 2 minutes.',
    verificationCodeSubmit: 'Confirmer le code',
    verificationCodeSubmitLoading: 'Vérification…',
    verificationCodeResend: 'Renvoyer le code',
    verificationCodeResendLoading: 'Envoi…',
    verificationCodeInvalid: 'Le code est invalide ou a expiré.',
    verificationCodeSuccess: 'Succès ! Ton adresse e-mail a été confirmée. Tu peux te connecter.',
    resendSuccess: 'Si un compte existe, nous avons renvoyé le code. La livraison peut prendre quelques minutes.',
    resendError: 'Impossible d’envoyer l’e-mail. Réessaie plus tard.',
    cooldownWarning: 'Merci de patienter un instant avant de réessayer.',
    forgotPassword: 'Mot de passe oublié ?',
    forgotPasswordMissingEmail: 'Saisis d’abord ton adresse e-mail.',
    passwordResetSent: 'Si un compte existe, nous avons envoyé un lien de réinitialisation.',
    passwordResetError: 'Impossible de réinitialiser pour le moment. Réessaie plus tard.',
    submit: 'Se connecter',
    submitLoading: 'Connexion…',
    registerSubmit: 'S\'inscrire',
    registerSubmitLoading: 'Inscription…',
    guestButton: 'Continuer en tant qu’invité',
    guestInfo: 'Continuer sans compte',
    loginButton: '🔐 Se connecter',
    logoutButton: '🚪 Se déconnecter',
    adminNavButton: '🛠️ Administration',
    authStatusGuest: 'Non connecté',
    authStatusSignedIn: (roleLabel) => `Connecté en tant que ${roleLabel}`,
    roleLabels: {
        admin: 'Administrateur',
        teacher: 'Enseignant',
        class_admin: 'Admin de classe',
        student: 'Élève',
        guest: 'Invité'
    },
    genericError: 'Une erreur est survenue lors de la connexion. Réessaie plus tard.',
    registerPasswordMismatch: 'Les mots de passe ne correspondent pas.',
    registerWeakPassword: 'Le mot de passe doit contenir au moins 8 caractères.',
    registerEmailInvalid: 'Saisis une adresse e-mail scolaire valide.',
    registerEmailExists: 'Un compte existe déjà pour cette adresse e-mail.',
    registerPasswordConfirmLabel: 'Confirmer le mot de passe',
    registerClassLabel: 'Classe (facultatif)',
    registerClassPlaceholder: 'p. ex. 3a',
    registerClassNotFound: 'Cette classe est introuvable.',
    registerGenericError: 'L’inscription est momentanément indisponible. Réessaie plus tard.',
    registerSuccess: 'Presque terminé ! Saisis le code reçu par e-mail.',
    switchToRegister: 'Nouveau ici ? Créer un compte',
    switchToLogin: 'Déjà inscrit ? Se connecter',
    close: 'Fermer'
};

const API_BASE = (() => {
    const base = 'https://homework-manager-2-5-backend.onrender.com';
    if (typeof window !== 'undefined') {
        window.__HM_RESOLVED_API_BASE__ = base;
        window.hmResolveApiBase = () => base;
    }
    return base;
})();

const AUTH_API = {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    logout: `${API_BASE}/api/auth/logout`,
    resend: `${API_BASE}/api/auth/resend`,
    verify: `${API_BASE}/api/auth/verify`,
    passwordReset: `${API_BASE}/api/auth/password-reset`
};

const AUTH_PATHS = {
    home: 'index.html',
    admin: 'admin/dashboard.html',
    login: 'login.html'
};

const VERIFICATION_ACTION_COOLDOWN_MS = 30000;
const actionCooldowns = {
    register: 0,
    resend: 0
};

function getNow() {
    return Date.now();
}

function setActionCooldown(action, duration = VERIFICATION_ACTION_COOLDOWN_MS) {
    actionCooldowns[action] = getNow() + Math.max(duration, 0);
}

function getActionCooldownRemaining(action) {
    const until = actionCooldowns[action] || 0;
    return Math.max(until - getNow(), 0);
}

function isActionOnCooldown(action) {
    return getActionCooldownRemaining(action) > 0;
}

function scheduleCooldownReset(action) {
    const remaining = getActionCooldownRemaining(action);
    if (remaining <= 0) {
        applyActionCooldown(action);
        return;
    }
    window.setTimeout(() => {
        if (isActionOnCooldown(action)) {
            scheduleCooldownReset(action);
        } else {
            applyActionCooldown(action);
        }
    }, remaining + 50);
}

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
let currentVerificationEmail = '';
let authOverlayInitialized = false;
let authOverlayPreviousFocus = null;

function normalizeRole(value) {
    if (!value) {
        return 'guest';
    }
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'admin' || normalized === 'teacher' || normalized === 'class_admin' || normalized === 'student') {
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
        isClassAdmin: role === 'admin' || role === 'class_admin'
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

function getAdminNavButton() {
    const links = document.querySelector('.nav-links');
    if (!links) {
        return null;
    }
    let button = links.querySelector('[data-admin-link]');
    if (!button) {
        button = document.createElement('a');
        button.className = 'nav-link nav-link--admin';
        button.href = AUTH_PATHS.admin;
        button.setAttribute('data-admin-link', 'true');
        button.textContent = LOGIN_TEXT.adminNavButton || '🛠️ Admin';
        button.hidden = true;
        const authButton = links.querySelector('[data-auth-button]');
        if (authButton && authButton.parentElement === links) {
            links.insertBefore(button, authButton);
        } else {
            links.appendChild(button);
        }
    }
    return button;
}

function updateAdminNavButton() {
    const button = getAdminNavButton();
    if (!button) {
        return;
    }
    button.textContent = LOGIN_TEXT.adminNavButton || '🛠️ Admin';
    const visible = isAdmin();
    button.hidden = !visible;
    button.classList.toggle('is-hidden', !visible);
    if (visible) {
        button.removeAttribute('tabindex');
        button.setAttribute('aria-hidden', 'false');
    } else {
        button.setAttribute('tabindex', '-1');
        button.setAttribute('aria-hidden', 'true');
    }
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
    updateAdminNavButton();
    updateRoleHint();
    updateAuthStatus();
    updateFeatureVisibility();
}

function queryAuthForms() {
    return Array.from(document.querySelectorAll('[data-auth-form]'));
}

function applyActionCooldown(action) {
    if (action === 'register') {
        queryAuthForms().forEach(applyRegisterCooldown);
    } else if (action === 'resend') {
        queryAuthForms().forEach(applyResendCooldown);
    }
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
    const mode = form.dataset.authMode;
    if (mode === 'register' || mode === 'verification') {
        return mode;
    }
    return 'login';
}

function applyRegisterCooldown(form) {
    if (!form) {
        return;
    }
    const submit = form.querySelector('[data-auth-submit]');
    if (!submit) {
        return;
    }
    if (submit.dataset.loading === 'true') {
        return;
    }
    const shouldDisable = getAuthMode(form) === 'register' && isActionOnCooldown('register');
    submit.disabled = shouldDisable;
}

function applyResendCooldown(form) {
    if (!form) {
        return;
    }
    const button = form.querySelector('[data-auth-resend]');
    if (!button || button.dataset.locked === 'true') {
        return;
    }
    button.disabled = isActionOnCooldown('resend');
}

function getSubmitLabel(form, isLoading) {
    const mode = getAuthMode(form);
    if (mode === 'register') {
        return isLoading ? LOGIN_TEXT.registerSubmitLoading : LOGIN_TEXT.registerSubmit;
    }
    if (mode === 'verification') {
        return isLoading ? LOGIN_TEXT.verificationCodeSubmitLoading : LOGIN_TEXT.verificationCodeSubmit;
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

function setFormLoading(form, isLoading) {
    if (!form) {
        return;
    }
    const submit = form.querySelector('[data-auth-submit]');
    if (submit) {
        if (isLoading) {
            submit.disabled = true;
            submit.dataset.loading = 'true';
            submit.textContent = getSubmitLabel(form, true);
        } else {
            submit.textContent = getSubmitLabel(form, false);
            delete submit.dataset.loading;
            applyRegisterCooldown(form);
            if (submit.disabled && getAuthMode(form) !== 'register') {
                submit.disabled = false;
            }
        }
    }
    const codeButton = form.querySelector('[data-auth-code-submit]');
    if (codeButton) {
        if (isLoading && getAuthMode(form) === 'verification') {
            codeButton.disabled = true;
            codeButton.dataset.loading = 'true';
            codeButton.textContent = LOGIN_TEXT.verificationCodeSubmitLoading;
        } else {
            codeButton.textContent = LOGIN_TEXT.verificationCodeSubmit;
            if (codeButton.dataset.loading === 'true') {
                delete codeButton.dataset.loading;
            }
            if (getAuthMode(form) === 'verification') {
                codeButton.disabled = false;
            }
        }
    }
    const resend = form.querySelector('[data-auth-resend]');
    if (resend) {
        if (isLoading && resend.dataset.locked === 'true') {
            resend.disabled = true;
        } else if (resend.dataset.locked !== 'true') {
            applyResendCooldown(form);
        }
    }
}

function rememberEmail(email) {
    if (!email) {
        return;
    }
    lastAuthEmail = email;
}

function setVerificationEmail(form, email) {
    const normalized = (email || '').trim().toLowerCase();
    if (form) {
        if (normalized) {
            form.dataset.authVerificationEmail = normalized;
        } else {
            delete form.dataset.authVerificationEmail;
        }
    }
    if (normalized) {
        currentVerificationEmail = normalized;
        rememberEmail(normalized);
    }
}

function getVerificationEmail(form) {
    if (form && form.dataset.authVerificationEmail) {
        return form.dataset.authVerificationEmail;
    }
    return currentVerificationEmail || lastAuthEmail || '';
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

    const { preserveFeedback = false } = options;
    const normalizedMode = mode === 'register' ? 'register' : mode === 'verification' ? 'verification' : 'login';
    form.dataset.authMode = normalizedMode;
    form.classList.toggle('is-register-mode', normalizedMode === 'register');
    form.classList.toggle('is-verification-mode', normalizedMode === 'verification');

    const container = form.closest('.login-container');
    if (container) {
        const title = container.querySelector('[data-auth-title]');
        if (title) {
            if (normalizedMode === 'register') {
                title.textContent = LOGIN_TEXT.registerTitle;
            } else if (normalizedMode === 'verification') {
                title.textContent = LOGIN_TEXT.verificationStepTitle;
            } else {
                title.textContent = LOGIN_TEXT.title;
            }
        }
        const description = container.querySelector('[data-auth-description]');
        if (description) {
            if (normalizedMode === 'register' && LOGIN_TEXT.registerSubtitle) {
                description.textContent = LOGIN_TEXT.registerSubtitle;
                description.hidden = false;
            } else if (normalizedMode === 'verification') {
                description.textContent = LOGIN_TEXT.verificationStepSubtitle;
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
        element.hidden = normalizedMode !== 'login';
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
        forgotButton.hidden = normalizedMode !== 'login';
    }

    const submit = form.querySelector('[data-auth-submit]');
    if (submit) {
        submit.hidden = normalizedMode === 'verification';
        submit.textContent = getSubmitLabel(form, false);
    }

    const credentials = form.querySelector('[data-auth-credentials]');
    if (credentials) {
        credentials.hidden = normalizedMode === 'verification';
    }

    const verificationStep = form.querySelector('[data-auth-code-step]');
    if (verificationStep) {
        verificationStep.hidden = normalizedMode !== 'verification';
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

    applyRegisterCooldown(form);
    applyResendCooldown(form);
}

function bindAuthForms() {
    queryAuthForms().forEach((form) => {
        if (form.dataset.authBound === 'true') {
            setAuthMode(form, getAuthMode(form), { preserveFeedback: true, preserveVerification: true });
            applyEmailPrefill(form);
            applyRegisterCooldown(form);
            applyResendCooldown(form);
            return;
        }

        setAuthMode(form, form.dataset.authMode || 'login');
        applyRegisterCooldown(form);
        applyResendCooldown(form);

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

        const codeInput = form.querySelector('[data-auth-code-input]');
        if (codeInput) {
            codeInput.addEventListener('input', () => {
                codeInput.value = codeInput.value.replace(/[^0-9]/g, '').slice(0, 8);
                setLoginFeedback('', 'neutral', form);
            });
            codeInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    verifyCode(form);
                }
            });
        }

        const codeButton = form.querySelector('[data-auth-code-submit]');
        if (codeButton) {
            codeButton.addEventListener('click', () => verifyCode(form));
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
                <div class="login-feedback" data-auth-feedback role="alert" aria-live="polite" hidden></div>
                <div data-auth-credentials>
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
                </div>
                <div class="verification-step" data-auth-code-step hidden>
                    <div class="form-group">
                        <label for="overlay-code">${LOGIN_TEXT.verificationCodeLabel}</label>
                        <input type="text" id="overlay-code" class="form-control" placeholder="${LOGIN_TEXT.verificationCodePlaceholder}" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" maxlength="8" data-auth-code-input>
                        <p class="login-hint" data-auth-code-hint>${LOGIN_TEXT.verificationCodeHint}</p>
                    </div>
                    <div class="login-actions">
                        <button type="button" class="login-button" data-auth-code-submit>${LOGIN_TEXT.verificationCodeSubmit}</button>
                        <button type="button" class="login-link" data-auth-resend>${LOGIN_TEXT.verificationCodeResend}</button>
                    </div>
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
    if (form) {
        setVerificationEmail(form, '');
        setAuthMode(form, 'login');
        setLoginFeedback('', 'neutral', form);
        applyEmailPrefill(form);
    }

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
    if (form) {
        setAuthMode(form, 'login');
        setVerificationEmail(form, '');
        setLoginFeedback('', 'neutral', form);
    }

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
    const mode = getAuthMode(form);
    if (mode === 'register') {
        register(form);
    } else if (mode === 'verification') {
        verifyCode(form);
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

    if (isActionOnCooldown('register')) {
        setLoginFeedback(LOGIN_TEXT.cooldownWarning, 'error', targetForm);
        return;
    }

    setLoginFeedback('', 'neutral', targetForm);
    setActionCooldown('register');
    applyActionCooldown('register');
    scheduleCooldownReset('register');
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
        setVerificationEmail(targetForm, email);

        if (passwordInput) {
            passwordInput.value = '';
        }
        if (confirmInput) {
            confirmInput.value = '';
        }
        if (classInput) {
            classInput.value = '';
        }

        setAuthMode(targetForm, 'verification', { preserveFeedback: true });
        const codeInput = targetForm.querySelector('[data-auth-code-input]');
        if (codeInput) {
            codeInput.value = '';
            codeInput.focus();
        }
        const resendButton = targetForm.querySelector('[data-auth-resend]');
        if (resendButton) {
            resendButton.textContent = LOGIN_TEXT.verificationCodeResend;
            resendButton.disabled = false;
            delete resendButton.dataset.locked;
            applyResendCooldown(targetForm);
        }
    } catch (error) {
        console.error('L\'inscription a échoué', error);
        setLoginFeedback(LOGIN_TEXT.registerGenericError, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
        applyActionCooldown('register');
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
                setVerificationEmail(targetForm, email);
                rememberEmail(email);
                setAuthMode(targetForm, 'verification', { preserveFeedback: true });
                setLoginFeedback(LOGIN_TEXT.emailNotVerified, 'error', targetForm);
                const codeInput = targetForm.querySelector('[data-auth-code-input]');
                if (codeInput) {
                    codeInput.value = '';
                    codeInput.focus();
                }
                const resendButton = targetForm.querySelector('[data-auth-resend]');
                if (resendButton) {
                    resendButton.textContent = LOGIN_TEXT.verificationCodeResend;
                    resendButton.disabled = false;
                    delete resendButton.dataset.locked;
                    applyResendCooldown(targetForm);
                }
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

        if (window.location.pathname.toLowerCase().endsWith('login.html')) {
            window.location.href = AUTH_PATHS.home;
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error('Connexion impossible', error);
        setLoginFeedback(LOGIN_TEXT.genericError, 'error', targetForm);
    } finally {
        setFormLoading(targetForm, false);
    }
}

async function verifyCode(form) {
    const targetForm = form || getActiveAuthForm();
    if (!targetForm) {
        return;
    }

    const codeInput = targetForm.querySelector('[data-auth-code-input]');
    const rawCode = codeInput ? codeInput.value.trim() : '';
    const normalizedCode = rawCode.replace(/[^0-9]/g, '').slice(0, 8);
    if (codeInput && rawCode !== normalizedCode) {
        codeInput.value = normalizedCode;
    }

    if (!normalizedCode || normalizedCode.length !== 8) {
        setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
        codeInput?.focus();
        return;
    }

    const storedEmail = getVerificationEmail(targetForm);
    let email = storedEmail;
    if (!email) {
        const emailInput = getEmailInput(targetForm);
        if (emailInput && emailInput.value) {
            email = emailInput.value.trim().toLowerCase();
        }
    }

    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        const emailInput = getEmailInput(targetForm);
        emailInput?.focus();
        setAuthMode(targetForm, 'login', { preserveFeedback: true });
        return;
    }

    setVerificationEmail(targetForm, email);
    setFormLoading(targetForm, true);

    try {
        const response = await fetch(AUTH_API.verify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code: normalizedCode })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (data && (data.message === 'invalid_code' || data.message === 'verification_not_found')) {
                setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
                codeInput?.focus();
                return;
            }
            if (data && data.message === 'code_expired') {
                setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
                codeInput?.focus();
                return;
            }
            if (data && data.message === 'rate_limited') {
                setLoginFeedback(LOGIN_TEXT.cooldownWarning, 'error', targetForm);
                return;
            }
            if (data && data.message === 'already_verified') {
                setLoginFeedback(LOGIN_TEXT.verificationCodeSuccess, 'success', targetForm);
                setAuthMode(targetForm, 'login', { preserveFeedback: true });
                focusPasswordField(targetForm);
                return;
            }
            setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
            codeInput?.focus();
            return;
        }

        setLoginFeedback(LOGIN_TEXT.verificationCodeSuccess, 'success', targetForm);
        setAuthMode(targetForm, 'login', { preserveFeedback: true });
        if (codeInput) {
            codeInput.value = '';
        }
        focusPasswordField(targetForm);
    } catch (error) {
        console.error('Échec de la vérification', error);
        setLoginFeedback(LOGIN_TEXT.verificationCodeInvalid, 'error', targetForm);
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
    const storedEmail = getVerificationEmail(targetForm);
    const email = storedEmail || (emailInput && emailInput.value ? emailInput.value.trim().toLowerCase() : lastAuthEmail);
    if (!email) {
        setLoginFeedback(LOGIN_TEXT.emailRequired, 'error', targetForm);
        emailInput?.focus();
        return;
    }
    if (isActionOnCooldown('resend')) {
        setLoginFeedback(LOGIN_TEXT.cooldownWarning, 'error', targetForm);
        applyResendCooldown(targetForm);
        return;
    }
    setActionCooldown('resend');
    applyActionCooldown('resend');
    scheduleCooldownReset('resend');
    const button = targetForm.querySelector('[data-auth-resend]');
    if (button) {
        button.disabled = true;
        button.dataset.locked = 'true';
        button.textContent = LOGIN_TEXT.verificationCodeResendLoading;
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
            setVerificationEmail(targetForm, email);
        } else {
            setLoginFeedback(LOGIN_TEXT.resendError, 'error', targetForm);
        }
    } catch (error) {
        console.error('Échec de l’envoi du code', error);
        setLoginFeedback(LOGIN_TEXT.resendError, 'error', targetForm);
    } finally {
        if (button) {
            button.dataset.locked = 'false';
            button.textContent = LOGIN_TEXT.verificationCodeResend;
            applyResendCooldown(targetForm);
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
        console.error('Réinitialisation impossible', error);
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
        console.error('Déconnexion impossible', error);
    } finally {
        clearSessionState();
        window.location.reload();
    }
}

const CREATE_DISABLED_MESSAGE = (window.hmI18n && window.hmI18n.get('calendar.actions.create.disabled'))
    || 'Seuls les admins peuvent créer des entrées';

const CALENDAR_MODAL_SCOPE = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const CALENDAR_MODAL_BUTTONS = {
    add: CALENDAR_MODAL_SCOPE('buttons.add', 'Ajouter une entrée'),
    addLoading: CALENDAR_MODAL_SCOPE('buttons.addLoading', 'Ajout…'),
    save: CALENDAR_MODAL_SCOPE('buttons.save', 'Enregistrer'),
    saveLoading: CALENDAR_MODAL_SCOPE('buttons.saveLoading', 'Enregistrement…')
};

const CALENDAR_MODAL_MESSAGES = {
    saveSuccess: CALENDAR_MODAL_SCOPE('messages.saveSuccess', 'Entrée enregistrée avec succès !'),
    saveRetry: CALENDAR_MODAL_SCOPE(
        'messages.saveRetry',
        'Impossible d’enregistrer l’entrée après plusieurs tentatives. Réessaie plus tard.'
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
        const code = button.querySelector('.lang-switch__code');
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

function checkLogin() {
    const pathname = window.location.pathname.toLowerCase();
    const isLoginPage = pathname.endsWith('login.html');

    initAuthOverlay();
    bindAuthForms();
    updateAuthUI();
    setupAuthButton();

    if (isLoginPage && isAuthenticated()) {
        window.location.replace(AUTH_PATHS.home);
        return;
    }
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
            throw new Error(`API error (${res.status})`);
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
        console.error('Error loading or rendering the calendar:', err);
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
      <h2>Current Subject: ${data.fach}</h2>
      <h3>Remaining: ${data.verbleibend}</h3>
      <p><strong>Room:</strong> ${data.raum}</p>
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
    <p><strong>Subject:</strong> ${data.fach}</p>
    <p><strong>Ends at:</strong> ${data.endet || '-'} </p>
    <p><strong>Remaining:</strong> ${data.verbleibend}</p>
    <p><strong>Room:</strong> ${data.raum}</p>
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
    invalidDate: 'Please enter a valid date in the format DD.MM.YYYY.',
    invalidEnd: 'The end time must not be earlier than the start time.',
    missingSubject: 'Please choose a subject.',
    missingEventTitle: 'Please enter an event title.'
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
        console.error('Entry overlay not found.');
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
        console.error('Entry form missing.');
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
        console.error('Form fields are missing.');
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
                console.error("Server error while saving:", result.message);
            }
        } catch (error) {
            console.error("Network error while saving:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Save attempt ${attempt} failed. Retrying in 2 seconds.`);
            // Warte 2000ms, bevor erneut versucht wird
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success) {
        showOverlay(CALENDAR_MODAL_MESSAGES.saveRetry);
    } else {
        // Reset input fields
        if (form) {
            form.reset();
            controller?.setType('event');
        }
    }

    // Re-enable button
    saveButton.disabled = false;
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.add;
}



// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', () => {
    setupModalFormInteractions(document.getElementById('entry-form'));
    setupModalFormInteractions(document.getElementById('fc-edit-form'));
});

window.addEventListener('hm:header-ready', () => {
    initLanguageSelector();
    setupAuthButton();
    updateAuthUI();
});
