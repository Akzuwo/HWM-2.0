(function (global) {
  const FOOTER_CLASS = 'hm-footer';
  const MODAL_ID = 'hm-contact-modal';
  const FORM_ID = 'hm-contact-form';
  const FALLBACK_ID = 'hm-contact-fallback';
  const START_FIELD = 'hm-contact-start';
  const HONEYPOT_FIELD = 'hm_contact_website';
  const SUPPORTED_LOCALES = ['de', 'en', 'it', 'fr'];
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const MIN_MESSAGE_LENGTH = 20;
  const MIN_DURATION_MS = 3000;
  const AUTH_EVENT_NAME = 'hm:auth-changed';

  const FALLBACK_TEXT = {
    'common.footer.navigation': 'Rechtliche Links',
    'common.footer.contact': 'Kontakt',
    'common.footer.imprint': 'Impressum',
    'common.footer.privacy': 'Datenschutz',
    'common.footer.changelog': 'Changelog',
    'contact.title': 'Kontakt aufnehmen',
    'contact.description': 'Schreibe uns eine Nachricht – wir melden uns so schnell wie möglich.',
    'contact.subject': 'Betreff',
    'contact.message': 'Nachricht',
    'contact.attachment': 'Datei anhängen (optional)',
    'contact.attachmentHint': 'Max. 2 MB',
    'contact.privacy': 'Mit dem Absenden stimme ich der Verarbeitung meiner Angaben zu.',
    'contact.submit': 'Nachricht senden',
    'contact.cancel': 'Abbrechen',
    'contact.success': 'Vielen Dank! Deine Nachricht wurde verschickt.',
    'contact.error': 'Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.',
    'contact.errorValidation': 'Bitte überprüfe die markierten Felder.',
    'contact.errorAuth': 'Bitte melde dich an, um eine Nachricht zu senden.',
    'contact.error429': 'Bitte warte kurz, bevor du eine weitere Nachricht sendest.',
    'contact.fallbackTitle': 'Alternativ kannst du uns auch per E-Mail erreichen:',
    'contact.fallbackCta': 'E-Mail schreiben',
    'contact.close': 'Schließen',
    'contact.userInfo': 'Angemeldet als {email}',
    'contact.userMissing': 'Bitte melde dich an, um das Kontaktformular zu verwenden.',
    'contact.cooldown': 'Du kannst nur alle 2 Minuten eine Nachricht senden.',
  };

  function translate(key) {
    if (global.hmI18n && typeof global.hmI18n.get === 'function') {
      const value = global.hmI18n.get(key);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return FALLBACK_TEXT[key] || key;
  }

  function currentLocale() {
    if (global.hmI18n && typeof global.hmI18n.getLocale === 'function') {
      const detected = global.hmI18n.getLocale();
      if (detected && SUPPORTED_LOCALES.includes(detected)) {
        return detected;
      }
    }
    const parts = window.location.pathname.split('/').filter(Boolean);
    const candidate = (parts[0] || '').toLowerCase();
    return SUPPORTED_LOCALES.includes(candidate) ? candidate : 'de';
  }

  function getAuthBridge() {
    return global.hmAuth || null;
  }

  function userIsAuthenticated() {
    const auth = getAuthBridge();
    if (auth && typeof auth.isAuthenticated === 'function') {
      try {
        return Boolean(auth.isAuthenticated());
      } catch (error) {
        return false;
      }
    }
    if (auth && typeof auth.isAuthenticated === 'boolean') {
      return Boolean(auth.isAuthenticated);
    }
    return false;
  }

  function getAuthenticatedEmail() {
    const auth = getAuthBridge();
    if (!auth) {
      return '';
    }
    if (typeof auth.currentEmail === 'function') {
      try {
        return auth.currentEmail() || '';
      } catch (error) {
        return '';
      }
    }
    if (typeof auth.email === 'string') {
      return auth.email;
    }
    return '';
  }

  function getAuthenticatedLabel() {
    const auth = getAuthBridge();
    if (auth) {
      if (typeof auth.currentDisplayName === 'function') {
        try {
          const value = auth.currentDisplayName();
          if (value) {
            return value;
          }
        } catch (error) {
          /* ignore display name errors */
        }
      }
      if (typeof auth.displayName === 'string' && auth.displayName) {
        return auth.displayName;
      }
    }
    return getAuthenticatedEmail();
  }

  function showToast(message, type = 'error') {
    if (global.hmToast && typeof global.hmToast[type] === 'function') {
      global.hmToast[type](message, { closeLabel: translate('contact.close') });
      return;
    }
    if (type === 'success') {
      // eslint-disable-next-line no-alert
      window.alert(message);
    } else {
      // eslint-disable-next-line no-alert
      window.alert(message);
    }
  }

  function notifyAuthRequired() {
    showToast(translate('contact.errorAuth'));
  }

  function formatUserInfo() {
    const label = getAuthenticatedLabel();
    if (!label) {
      return translate('contact.userMissing');
    }
    return translate('contact.userInfo').replace('{email}', label);
  }

  function updateModalAuthState() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) {
      return;
    }
    const note = modal.querySelector('[data-auth-note]');
    const submit = modal.querySelector('[data-submit]');
    const authenticated = userIsAuthenticated();
    if (note) {
      note.textContent = authenticated ? formatUserInfo() : translate('contact.userMissing');
      note.classList.toggle('is-warning', !authenticated);
    }
    if (submit) {
      submit.disabled = !authenticated;
    }
  }

  function removeLegacyFooters() {
    document.querySelectorAll('.site-footer, .current-subject__footer').forEach((node) => node.remove());
  }

  function buildFooter() {
    const footer = document.createElement('footer');
    footer.className = FOOTER_CLASS;

    const year = new Date().getFullYear();
    const legal = document.createElement('div');
    legal.className = 'hm-footer__legal';
    legal.innerHTML = `© <span>${year}</span> <span>Timo Wigger</span>`;
    footer.appendChild(legal);

    const links = document.createElement('nav');
    links.className = 'hm-footer__links';
    links.setAttribute('aria-label', translate('common.footer.navigation'));

    const addDivider = () => {
      const divider = document.createElement('span');
      divider.className = 'hm-footer__divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = '·';
      links.appendChild(divider);
    };

    const createLink = (href, label, isButton = false) => {
      if (isButton) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'hm-footer__link';
        button.textContent = label;
        button.addEventListener('click', openContactModal);
        links.appendChild(button);
        return;
      }
      const anchor = document.createElement('a');
      anchor.className = 'hm-footer__link';
      anchor.href = href;
      anchor.textContent = label;
      anchor.rel = 'noopener';
      links.appendChild(anchor);
    };

    createLink('#', translate('common.footer.contact'), true);

    const locale = currentLocale();
    const base = `/${locale}/`;
    const imprint = `${base}impressum.html`;
    const privacy = `${base}datenschutz.html`;
    const changelog = `${base}changelog.html`;

    addDivider();
    createLink(imprint, translate('common.footer.imprint'));
    addDivider();
    createLink(privacy, translate('common.footer.privacy'));
    addDivider();
    createLink(changelog, translate('common.footer.changelog'));

    footer.appendChild(links);
    return footer;
  }

  function ensureFooter() {
    if (!document.querySelector(`.${FOOTER_CLASS}`)) {
      document.body.appendChild(buildFooter());
    }
  }

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'hm-contact-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="hm-contact-modal__backdrop" data-close></div>
      <div class="hm-contact-modal__dialog" role="document">
        <button type="button" class="hm-contact-modal__close" data-close aria-label="${translate('contact.close')}">×</button>
        <header class="hm-contact-modal__header">
          <h2 id="hm-contact-title">${translate('contact.title')}</h2>
          <p class="hm-contact-modal__lead">${translate('contact.description')}</p>
        </header>
        <form id="${FORM_ID}" class="hm-contact-modal__form" novalidate>
          <input type="hidden" name="${START_FIELD}" value="">
          <div class="hm-contact-modal__grid">
            <div class="hm-contact-modal__meta">
              <p class="hm-contact-modal__note" id="hm-contact-user-note" data-auth-note></p>
              <p class="hm-contact-modal__hint hm-contact-modal__hint--info">${translate('contact.cooldown')}</p>
            </div>
            <div class="hm-contact-modal__field hm-contact-modal__field--full">
              <label for="hm-contact-subject">${translate('contact.subject')}*</label>
              <input id="hm-contact-subject" name="subject" type="text" required aria-describedby="hm-contact-subject-error" />
              <p class="hm-contact-modal__error" id="hm-contact-subject-error"></p>
            </div>
            <div class="hm-contact-modal__field hm-contact-modal__field--full">
              <label for="hm-contact-message">${translate('contact.message')}*</label>
              <textarea id="hm-contact-message" name="message" rows="5" minlength="${MIN_MESSAGE_LENGTH}" required aria-describedby="hm-contact-message-error"></textarea>
              <p class="hm-contact-modal__error" id="hm-contact-message-error"></p>
            </div>
            <div class="hm-contact-modal__field hm-contact-modal__field--full hm-contact-modal__field--file">
              <label for="hm-contact-file">${translate('contact.attachment')}</label>
              <input id="hm-contact-file" name="attachment" type="file" aria-describedby="hm-contact-file-error hm-contact-file-hint" />
              <p class="hm-contact-modal__hint" id="hm-contact-file-hint">${translate('contact.attachmentHint')}</p>
              <p class="hm-contact-modal__error" id="hm-contact-file-error"></p>
            </div>
          </div>
          <div class="hm-contact-modal__privacy">
            <label class="hm-contact-modal__checkbox">
              <input type="checkbox" id="hm-contact-consent" name="consent" required aria-describedby="hm-contact-consent-error" />
              <span>${translate('contact.privacy')}</span>
            </label>
            <p class="hm-contact-modal__error" id="hm-contact-consent-error"></p>
          </div>
          <div class="hm-contact-modal__actions">
            <button type="button" class="hm-contact-modal__button hm-contact-modal__button--secondary" data-close>${translate('contact.cancel')}</button>
            <button type="submit" class="hm-contact-modal__button hm-contact-modal__button--primary" data-submit>
              <span class="hm-contact-modal__button-label">${translate('contact.submit')}</span>
              <span class="hm-contact-modal__spinner" aria-hidden="true"></span>
            </button>
          </div>
          <div class="hm-contact-modal__fallback" id="${FALLBACK_ID}" hidden>
            <strong>${translate('contact.fallbackTitle')}</strong>
            <a class="hm-contact-modal__fallback-link" href="mailto:timowigger8@gmail.com">${translate('contact.fallbackCta')}</a>
          </div>
          <input type="text" name="${HONEYPOT_FIELD}" class="hm-contact-modal__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    attachModalHandlers(modal);
    updateModalAuthState();

    if (!authListenerAttached && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener(AUTH_EVENT_NAME, updateModalAuthState);
      authListenerAttached = true;
    }
  }

  function setError(field, message) {
    const input = document.getElementById(`hm-contact-${field}`);
    const error = document.getElementById(`hm-contact-${field}-error`);
    if (!error) {
      return;
    }
    if (input) {
      input.setAttribute('aria-invalid', 'true');
    }
    error.textContent = message;
  }

  function clearError(field) {
    const input = document.getElementById(`hm-contact-${field}`);
    const error = document.getElementById(`hm-contact-${field}-error`);
    if (input) {
      input.removeAttribute('aria-invalid');
    }
    if (error) {
      error.textContent = '';
    }
  }

  function resetForm(form) {
    form.reset();
    form.querySelector(`input[name="${START_FIELD}"]`).value = String(Date.now());
    ['subject', 'message', 'file', 'consent'].forEach((field) => clearError(field));
    const fallback = document.getElementById(FALLBACK_ID);
    if (fallback) {
      fallback.hidden = true;
    }
    const submit = form.querySelector('[data-submit]');
    if (submit) {
      submit.disabled = false;
      submit.removeAttribute('data-loading');
      submit.removeAttribute('aria-busy');
    }
  }

  function serialize(form) {
    const data = new FormData(form);
    const payload = new FormData();
    payload.set('subject', data.get('subject'));
    payload.set('message', data.get('message'));
    payload.set('consent', data.get('consent') ? 'true' : 'false');
    payload.set(START_FIELD, data.get(START_FIELD));
    payload.set(HONEYPOT_FIELD, data.get(HONEYPOT_FIELD));
    const file = data.get('attachment');
    if (file instanceof File && file.size > 0) {
      payload.set('attachment', file, file.name);
    }
    return payload;
  }

  function validate(form) {
    let valid = true;
    clearError('subject');
    clearError('message');
    clearError('file');
    clearError('consent');

    const subject = form.elements.subject.value.trim();
    const message = form.elements.message.value.trim();
    const consent = form.elements.consent.checked;
    const fileInput = form.elements.attachment;

    if (!subject) {
      setError('subject', translate('contact.errorValidation'));
      valid = false;
    }
    if (message.length < MIN_MESSAGE_LENGTH) {
      setError('message', translate('contact.errorValidation'));
      valid = false;
    }
    if (!consent) {
      setError('consent', translate('contact.errorValidation'));
      valid = false;
    }
    if (fileInput && fileInput.files && fileInput.files[0] && fileInput.files[0].size > MAX_FILE_SIZE) {
      setError('file', translate('contact.attachmentHint'));
      valid = false;
    }

    return valid;
  }

  function setLoading(form, isLoading) {
    const submit = form.querySelector('[data-submit]');
    if (!submit) return;
    submit.disabled = isLoading;
    submit.toggleAttribute('data-loading', isLoading);
    submit.setAttribute('aria-busy', String(isLoading));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    if (!userIsAuthenticated()) {
      notifyAuthRequired();
      closeContactModal();
      return;
    }

    const start = Number(form.querySelector(`input[name="${START_FIELD}"]`).value || '0');
    if (start && Date.now() - start < MIN_DURATION_MS) {
      setError('message', translate('contact.errorValidation'));
      return;
    }

    if (!validate(form)) {
      if (global.hmToast) {
        global.hmToast.error(translate('contact.errorValidation'), { closeLabel: translate('contact.close') });
      }
      return;
    }

    setLoading(form, true);

    fetch('/api/contact', {
      method: 'POST',
      body: serialize(form),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data.message || response.statusText);
          error.status = response.status;
          error.payload = data;
          throw error;
        }
        return data;
      })
      .then(() => {
        resetForm(form);
        closeContactModal();
        showToast(translate('contact.success'), 'success');
      })
      .catch((error) => {
        setLoading(form, false);
        const fallback = document.getElementById(FALLBACK_ID);
        const status = error && typeof error.status === 'number' ? error.status : 0;
        if (status === 403) {
          notifyAuthRequired();
          updateModalAuthState();
          closeContactModal();
          return;
        }
        if (status === 429) {
          showToast(translate('contact.error429'));
        } else {
          if (fallback) {
            fallback.hidden = false;
          }
          showToast(translate('contact.error'));
        }
      });
  }

  let lastFocused = null;
  let authListenerAttached = false;

  function trapFocus(modal) {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const focusable = Array.from(modal.querySelectorAll(selectors.join(',')));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function openContactModal() {
    ensureModal();
    const modal = document.getElementById(MODAL_ID);
    if (!modal || modal.getAttribute('aria-hidden') === 'false') {
      return;
    }

    updateModalAuthState();

    if (!userIsAuthenticated()) {
      notifyAuthRequired();
      return;
    }

    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-visible');
    document.body.classList.add('hm-contact-modal-open');

    const form = modal.querySelector('form');
    if (form) {
      form.querySelector(`input[name="${START_FIELD}"]`).value = String(Date.now());
      const subjectField = form.querySelector('#hm-contact-subject');
      if (subjectField) {
        subjectField.focus();
        if (typeof subjectField.select === 'function') {
          subjectField.select();
        }
      }
    }
    trapFocus(modal);
  }

  function closeContactModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || modal.getAttribute('aria-hidden') === 'true') {
      return;
    }
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-visible');
    document.body.classList.remove('hm-contact-modal-open');
    const form = modal.querySelector('form');
    if (form) {
      resetForm(form);
    }
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function attachModalHandlers(modal) {
    const form = modal.querySelector('form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
      form.addEventListener('input', (event) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const field = target.id.replace('hm-contact-', '');
          clearError(field);
        }
      });
    }
    modal.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', closeContactModal);
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeContactModal();
      }
    });
  }

  function shouldAnimatePageTransition() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initPageTransitions() {
    if (!shouldAnimatePageTransition()) {
      return;
    }

    if (document.querySelector('.hm-page-transition')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'hm-page-transition is-active';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    const finishEnter = () => {
      requestAnimationFrame(() => {
        overlay.classList.remove('is-active');
        document.body.classList.remove('is-transitioning');
      });
    };

    const startExit = () => {
      document.body.classList.add('is-transitioning');
      overlay.classList.add('is-active');
    };

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        finishEnter();
      }
    });

    finishEnter();

    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      if (anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return;
      }

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch (error) {
        return;
      }

      if (!['http:', 'https:'].includes(url.protocol)) {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      const isSameLocation = url.pathname === window.location.pathname && url.search === window.location.search;
      if (isSameLocation && !url.hash) {
        return;
      }

      event.preventDefault();
      startExit();

      window.setTimeout(() => {
        window.location.href = url.href;
      }, 220);
    });

    window.addEventListener('beforeunload', () => {
      startExit();
    });
  }

  function init() {
    removeLegacyFooters();
    ensureFooter();
    ensureModal();
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.openContactModal = openContactModal;
  global.closeContactModal = closeContactModal;
})(window);
