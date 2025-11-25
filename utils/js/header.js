const HEADER_URL = new URL('../components/header.html', import.meta.url);

function computePathInfo() {
  const rawPath = window.location.pathname;
  const trimmed = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const segments = trimmed.split('/').filter(Boolean);
  const hasFile = segments.length > 0 && segments[segments.length - 1].includes('.');
  const directories = hasFile ? segments.slice(0, -1) : segments;
  const docLanguage = (document.documentElement.lang || '').toLowerCase();
  const docLanguageBase = docLanguage.includes('-') ? docLanguage.split('-')[0] : docLanguage;

  let languageIndex = -1;
  if (docLanguage) {
    languageIndex = directories.findIndex((segment) => segment.toLowerCase() === docLanguage);
  }
  if (languageIndex === -1 && docLanguageBase) {
    languageIndex = directories.findIndex((segment) => segment.toLowerCase() === docLanguageBase);
  }

  const languageSegment = languageIndex >= 0 ? directories[languageIndex] : '';
  const language = languageSegment || docLanguageBase || directories[0] || 'en';

  const directoriesAfterLanguageRaw = languageIndex >= 0 ? directories.slice(languageIndex + 1) : directories.slice(1);
  const directoriesAfterLanguage =
    !hasFile && directoriesAfterLanguageRaw.length
      ? directoriesAfterLanguageRaw.slice(0, -1)
      : directoriesAfterLanguageRaw;
  const languagePrefix = directoriesAfterLanguage.length ? '../'.repeat(directoriesAfterLanguage.length) : '';

  const rootDepth = languageIndex >= 0 ? directories.length - languageIndex : Math.max(directories.length - 1, 0);
  const rootPrefix = rootDepth > 0 ? '../'.repeat(rootDepth) : '';
  return {
    language,
    languagePrefix,
    rootPrefix,
    directories,
    hasFile,
    rawPath,
  };
}

function normalizePathname(path) {
  if (!path) return '/';
  if (path.endsWith('/')) {
    return path.toLowerCase();
  }
  return path.toLowerCase();
}

function markActiveLink(header, info) {
  const { language } = info;
  const navLinks = header.querySelectorAll('.nav-link[data-route]');
  if (!navLinks.length) return;

  let currentPath = normalizePathname(window.location.pathname);
  if (currentPath.endsWith('/')) {
    currentPath = `${currentPath}index.html`;
  }
  if (!currentPath.endsWith('.html')) {
    currentPath = `${currentPath.replace(/\/?$/, '/')}index.html`;
  }

  navLinks.forEach((link) => {
    const route = link.getAttribute('data-route');
    const expected = language ? `/${language}/${route}`.replace('//', '/') : `/${route}`;
    const alt = route === 'index.html' && language ? `/${language}/` : route === 'index.html' ? '/' : null;
    const matches = currentPath === expected.toLowerCase() || (alt && normalizePathname(window.location.pathname) === alt.toLowerCase());
    if (matches) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function applyLanguageCode(header, languageCode) {
  const codeEl = header.querySelector('.lang-switch__code');
  if (codeEl) {
    codeEl.textContent = languageCode.toUpperCase();
  }
}

function populateRoutes(header, info) {
  const { languagePrefix, rootPrefix, language } = info;
  header.querySelectorAll('.nav-link[data-route]').forEach((link) => {
    const route = link.getAttribute('data-route');
    const prefix = languagePrefix || '';
    link.setAttribute('href', `${prefix}${route}`);
  });
  const logo = header.querySelector('[data-logo]');
  if (logo) {
    logo.src = `${rootPrefix}media/logo.png`;
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
  }
  const brandLink = header.querySelector('[data-brand-link]');
  if (brandLink) {
    const prefix = languagePrefix || '';
    const brandText = header.querySelector('.brand');
    const label = brandText ? brandText.textContent.trim() : '';
    brandLink.setAttribute('href', `${prefix}index.html`);
    brandLink.setAttribute('aria-label', label || 'Homework Manager');
  }
  const loginButton = header.querySelector('[data-auth-button]');
  if (loginButton) {
    loginButton.setAttribute('data-lang', language);
  }
}

function localizedLoggedInPrefix(lang) {
  switch ((lang || '').toLowerCase()) {
    case 'de':
      return 'Angemeldet als';
    case 'fr':
      return 'Connecté en tant que';
    case 'it':
      return 'Connesso come';
    default:
      return 'Signed in as';
  }
}

async function tryInjectUserBadge(header, info) {
  const userArea = header.querySelector('[data-user-area]');
  if (!userArea) return;
  const prefix = info.languagePrefix || '';
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return; // not logged in or error
    const payload = await res.json().catch(() => null);
    if (!payload || payload.status !== 'ok' || !payload.data) return;
    const data = payload.data;

    const labelPrefix = localizedLoggedInPrefix(info.language);
    const display = data.role ? `${labelPrefix} ${data.role}` : `${labelPrefix} ${data.email || ''}`;

    const a = document.createElement('a');
    a.className = 'user-badge nav-link';
    const profileHref = info.language ? `/${info.language}/profile.html` : '/profile.html';
    a.setAttribute('href', profileHref);
    a.setAttribute('title', display);
    a.textContent = display;

    // replace contents of userArea
    userArea.innerHTML = '';
    userArea.appendChild(a);
  } catch (err) {
    // ignore: keep login button
    return;
  }
}

function setupMobileNavigation(header) {
  const toggle = header.querySelector('[data-nav-toggle]');
  const drawer = header.querySelector('[data-nav-drawer]');
  const overlay = header.querySelector('[data-nav-overlay]');
  const inner = header.querySelector('.hm-navbar__inner');

  if (!toggle || !drawer || !overlay || !inner) {
    return;
  }

  if (typeof window.__hmNavCleanup === 'function') {
    window.__hmNavCleanup();
    window.__hmNavCleanup = null;
  }

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;
  let isCondensed = false;

  const updateDrawerAria = () => {
    if (!isCondensed) {
      drawer.setAttribute('aria-hidden', 'false');
      return;
    }
    drawer.setAttribute('aria-hidden', drawer.classList.contains('is-open') ? 'false' : 'true');
  };

  const closeDrawer = ({ restoreFocus = true } = {}) => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (!overlay.hasAttribute('hidden')) {
      overlay.setAttribute('hidden', '');
    }
    drawer.classList.remove('is-open');
    updateDrawerAria();
    toggle.setAttribute('aria-expanded', 'false');
    const focusTarget = previousFocus;
    previousFocus = null;
    if (restoreFocus && focusTarget instanceof HTMLElement && document.contains(focusTarget)) {
      focusTarget.focus();
    }
  };

  const openDrawer = () => {
    if (!isCondensed || drawer.classList.contains('is-open')) {
      return;
    }
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawer.classList.add('is-open');
    updateDrawerAria();
    overlay.classList.add('is-open');
    overlay.removeAttribute('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    const firstFocusable = drawer.querySelector(focusableSelector);
    if (firstFocusable instanceof HTMLElement) {
      try {
        firstFocusable.focus({ preventScroll: true });
      } catch (error) {
        firstFocusable.focus();
      }
    }
  };

  const handleToggleClick = () => {
    if (!isCondensed) {
      return;
    }
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const handleOverlayClick = () => {
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  };

  const handleDrawerClick = (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('a.nav-link') : null;
    if (target) {
      closeDrawer({ restoreFocus: false });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      event.preventDefault();
      closeDrawer();
    }
  };

  const detectWrap = () => {
    const children = Array.from(inner.children).filter(
      (child) => child instanceof HTMLElement && child.offsetParent !== null
    );
    if (!children.length) {
      return false;
    }

    const tops = new Set(children.map((child) => Math.round(child.getBoundingClientRect().top)));
    if (tops.size > 1) {
      return true;
    }

    const scrollDelta = inner.scrollHeight - inner.clientHeight;
    return scrollDelta > 1;
  };

  const setCondensed = (nextCondensed) => {
    const previous = isCondensed;
    isCondensed = nextCondensed;
    header.classList.toggle('is-condensed', isCondensed);

    if (previous !== isCondensed) {
      closeDrawer({ restoreFocus: false });
      return;
    }

    updateDrawerAria();
    toggle.setAttribute('aria-expanded', drawer.classList.contains('is-open') ? 'true' : 'false');
    if (!isCondensed) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      if (!overlay.hasAttribute('hidden')) {
        overlay.setAttribute('hidden', '');
      }
    }
  };

  const evaluateLayout = () => {
    header.classList.add('is-measuring');
    header.classList.remove('is-condensed');
    const shouldCondense = detectWrap();
    header.classList.remove('is-measuring');
    setCondensed(shouldCondense);
  };

  toggle.addEventListener('click', handleToggleClick);
  overlay.addEventListener('click', handleOverlayClick);
  drawer.addEventListener('click', handleDrawerClick);
  document.addEventListener('keydown', handleKeyDown);

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    evaluateLayout();
  }) : null;

  if (resizeObserver) {
    resizeObserver.observe(inner);
  }

  window.addEventListener('resize', evaluateLayout);
  window.addEventListener('load', evaluateLayout, { once: true });

  let fontsListener = null;
  if (document && document.fonts && typeof document.fonts.addEventListener === 'function') {
    fontsListener = () => {
      evaluateLayout();
      if (document && document.fonts && typeof document.fonts.removeEventListener === 'function' && fontsListener) {
        document.fonts.removeEventListener('loadingdone', fontsListener);
      }
      fontsListener = null;
    };
    document.fonts.addEventListener('loadingdone', fontsListener);
  } else if (document && document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready.then(() => evaluateLayout());
  }

  overlay.setAttribute('aria-hidden', 'true');
  if (!overlay.hasAttribute('hidden')) {
    overlay.setAttribute('hidden', '');
  }

  evaluateLayout();
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => evaluateLayout());
  }

  window.__hmNavCleanup = () => {
    toggle.removeEventListener('click', handleToggleClick);
    overlay.removeEventListener('click', handleOverlayClick);
    drawer.removeEventListener('click', handleDrawerClick);
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', evaluateLayout);
    window.removeEventListener('load', evaluateLayout);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (fontsListener && document && document.fonts && typeof document.fonts.removeEventListener === 'function') {
      document.fonts.removeEventListener('loadingdone', fontsListener);
      fontsListener = null;
    }
    header.classList.remove('is-condensed', 'is-measuring');
    closeDrawer({ restoreFocus: false });
  };
}

async function loadHeader() {
  try {
    const response = await fetch(HEADER_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load header (${response.status})`);
    }
    const markup = await response.text();
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    const header = template.content.firstElementChild;
    if (!header) {
      return;
    }
    const info = computePathInfo();
    populateRoutes(header, info);
    applyLanguageCode(header, info.language.slice(0, 2));
    markActiveLink(header, info);

    const body = document.body;
    if (!body) {
      return;
    }
    const existing = body.querySelector('.hm-navbar');
    if (existing) {
      if (typeof window.__hmNavCleanup === 'function') {
        window.__hmNavCleanup();
        window.__hmNavCleanup = null;
      }
      existing.remove();
    }
    body.insertBefore(header, body.firstChild);
    setupMobileNavigation(header);
    // attempt to render user badge after header is in the DOM and navigation is initialized
    tryInjectUserBadge(header, info);

    window.dispatchEvent(
      new CustomEvent('hm:header-ready', {
        detail: {
          header,
          pathInfo: info,
        },
      })
    );
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', loadHeader);
