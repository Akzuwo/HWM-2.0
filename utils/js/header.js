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

  const directoriesAfterLanguage = languageIndex >= 0 ? directories.slice(languageIndex + 1) : directories.slice(1);
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
      existing.remove();
    }
    body.insertBefore(header, body.firstChild);

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
