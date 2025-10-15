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

  const FALLBACK_TEXT = {
    'common.footer.navigation': 'Rechtliche Links',
    'common.footer.contact': 'Kontakt',
    'common.footer.imprint': 'Impressum',
    'common.footer.privacy': 'Datenschutz',
    'common.footer.changelog': 'Changelog',
    'contact.title': 'Kontakt aufnehmen',
    'contact.description': 'Schreibe uns eine Nachricht – wir melden uns so schnell wie möglich.',
    'contact.name': 'Name',
    'contact.email': 'E-Mail-Adresse',
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
    'contact.fallbackTitle': 'Alternativ kannst du uns auch per E-Mail erreichen:',
    'contact.fallbackCta': 'E-Mail schreiben',
    'contact.close': 'Schließen',
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
            <div class="hm-contact-modal__field">
              <label for="hm-contact-name">${translate('contact.name')}*</label>
              <input id="hm-contact-name" name="name" type="text" autocomplete="name" required aria-describedby="hm-contact-name-error" />
              <p class="hm-contact-modal__error" id="hm-contact-name-error"></p>
            </div>
            <div class="hm-contact-modal__field">
              <label for="hm-contact-email">${translate('contact.email')}*</label>
              <input id="hm-contact-email" name="email" type="email" autocomplete="email" required aria-describedby="hm-contact-email-error" />
              <p class="hm-contact-modal__error" id="hm-contact-email-error"></p>
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
            <a class="hm-contact-modal__fallback-link" href="mailto:kontakt@homework-manager.akzuwo.ch">${translate('contact.fallbackCta')}</a>
          </div>
          <input type="text" name="${HONEYPOT_FIELD}" class="hm-contact-modal__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    attachModalHandlers(modal);
  }

  function emailIsValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    ['name', 'email', 'subject', 'message', 'file', 'consent'].forEach((field) => clearError(field));
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
    payload.set('name', data.get('name'));
    payload.set('email', data.get('email'));
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
    clearError('name');
    clearError('email');
    clearError('subject');
    clearError('message');
    clearError('file');
    clearError('consent');

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const subject = form.elements.subject.value.trim();
    const message = form.elements.message.value.trim();
    const consent = form.elements.consent.checked;
    const fileInput = form.elements.attachment;

    if (!name) {
      setError('name', translate('contact.errorValidation'));
      valid = false;
    }
    if (!emailIsValid(email)) {
      setError('email', translate('contact.errorValidation'));
      valid = false;
    }
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
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || response.statusText);
        }
        return response.json();
      })
      .then(() => {
        resetForm(form);
        closeContactModal();
        if (global.hmToast) {
          global.hmToast.success(translate('contact.success'), { closeLabel: translate('contact.close') });
        }
      })
      .catch(() => {
        setLoading(form, false);
        const fallback = document.getElementById(FALLBACK_ID);
        if (fallback) {
          fallback.hidden = false;
        }
        if (global.hmToast) {
          global.hmToast.error(translate('contact.error'), { closeLabel: translate('contact.close') });
        }
      });
  }

  let lastFocused = null;

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

    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-visible');
    document.body.classList.add('hm-contact-modal-open');

    const form = modal.querySelector('form');
    if (form) {
      form.querySelector(`input[name="${START_FIELD}"]`).value = String(Date.now());
      const nameField = form.querySelector('#hm-contact-name');
      if (nameField) {
        nameField.focus();
        if (typeof nameField.select === 'function') {
          nameField.select();
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
