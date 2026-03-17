const navItems = [
  { href: '/index.html', label: 'Startseite', key: 'common.nav.home' },
  { href: '/kalender.html', label: 'Kalender', key: 'common.nav.calendar' },
  { href: '/upcoming.html', label: 'Anstehend', key: 'common.nav.upcoming' },
  { href: '/weekly-preview.html', label: 'Wochenvorschau', key: 'common.nav.weeklyPreview' },
  { href: '/stundenplan.html', label: 'Aktuelles Fach', key: 'common.nav.currentSubject' },
  { href: '/notenrechner.html', label: 'Notenrechner', key: 'common.nav.grades' }
];

const locales = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Francais' }
];

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/index.html';
  }

  const path = window.location.pathname.toLowerCase();
  if (path === '/' || path.endsWith('/')) {
    return '/index.html';
  }

  return path;
}

function NavLinks() {
  const currentPath = getCurrentPath();

  return navItems.map((item) => (
    <a
      key={item.href}
      className="nav-link"
      href={item.href}
      data-route={item.href.replace(/^\//, '')}
      data-i18n={item.key}
      aria-current={currentPath === item.href.toLowerCase() ? 'page' : undefined}
    >
      {item.label}
    </a>
  ));
}

function LanguageSwitcher() {
  return (
    <div className="language-switcher" data-language="">
      <button
        className="lang-switch"
        type="button"
        data-language-toggle=""
        aria-haspopup="true"
        aria-expanded="false"
        data-i18n-attr="aria-label:common.nav.language"
      >
        <span className="lang-switch__icon" aria-hidden="true">
          🌐
        </span>
        <span className="lang-switch__code">EN</span>
        <svg className="lang-switch__caret" viewBox="0 0 12 12" focusable="false" aria-hidden="true">
          <path d="M2.47 4.47a.75.75 0 0 1 1.06 0L6 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L6.53 9.47a.75.75 0 0 1-1.06 0L2.47 5.53a.75.75 0 0 1 0-1.06z" />
        </svg>
      </button>
      <ul className="language-menu" data-language-menu="">
        {locales.map((locale) => (
          <li key={locale.code}>
            <button type="button" className="language-option" data-lang={locale.code}>
              <span className="language-option__flag" aria-hidden="true">
                {locale.code === 'de' ? '🇩🇪' : locale.code === 'en' ? '🇬🇧' : locale.code === 'it' ? '🇮🇹' : '🇫🇷'}
              </span>
              <span className="language-option__text">
                <span className="language-option__code">{locale.code.toUpperCase()}</span>
                <span className="language-option__separator" aria-hidden="true">
                  –
                </span>
                <span className="language-option__name">{locale.label}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserArea() {
  return (
    <div className="user-area" data-user-area="">
      <button className="btn-login" type="button" data-auth-button="" aria-label="Login">
        <span className="btn-login__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.33 0-10 1.667-10 5v2h20v-2c0-3.333-6.67-5-10-5Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="btn-login__label">Login</span>
      </button>
      <div className="account-control is-hidden" data-account-control="" aria-hidden="true">
        <button
          className="account-switch"
          type="button"
          data-account-toggle=""
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="Account"
        >
          <span className="account-switch__label" data-account-label="">
            Account
          </span>
          <svg className="account-switch__caret" viewBox="0 0 12 12" focusable="false" aria-hidden="true">
            <path d="M2.47 4.47a.75.75 0 0 1 1.06 0L6 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L6.53 9.47a.75.75 0 0 1-1.06 0L2.47 5.53a.75.75 0 0 1 0-1.06z" />
          </svg>
        </button>
        <ul className="account-menu" data-account-menu="" role="menu">
          <li>
            <a className="account-option" href="/profile.html" data-account-profile="" role="menuitem">
              Profil
            </a>
          </li>
          <li>
            <button className="account-option" type="button" data-account-logout="" role="menuitem">
              Abmelden
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="hm-navbar" data-nav="" data-i18n-attr="aria-label:common.nav.primary" role="navigation" aria-label="Main navigation">
      <div className="hm-navbar__inner header">
        <div className="header-left logo">
          <a className="logo-link" href="/index.html" data-brand-link="">
            <img data-logo="" alt="" aria-hidden="true" width="32" height="32" src="/media/logo.png" />
            <span className="brand-mark" data-i18n="common.appName">
              Homework Manager
            </span>
          </a>
        </div>

        <div className="header-center">
          <nav className="nav-links" aria-label="Main navigation">
            <NavLinks />
          </nav>
        </div>

        <div className="header-right">
          <div className="nav-right nav-right--desktop">
            <div className="nav-right__actions">
              <LanguageSwitcher />
              <UserArea />
            </div>
          </div>
          <div className="nav-mobile">
            <button
              className="hm-navbar__toggle hamburger-btn"
              type="button"
              data-nav-toggle=""
              aria-expanded="false"
              aria-controls="hm-navbar-drawer"
              data-i18n-attr="aria-label:common.nav.toggle"
            >
              <span className="hm-navbar__toggle-box" aria-hidden="true">
                <span className="hm-navbar__toggle-line"></span>
                <span className="hm-navbar__toggle-line"></span>
                <span className="hm-navbar__toggle-line"></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="hm-navbar__overlay" data-nav-overlay="" hidden></div>

      <aside className="mobile-sidebar" data-nav-drawer="" id="hm-navbar-drawer" aria-hidden="true">
        <nav className="nav-links nav-links--mobile" aria-label="Main navigation">
          <NavLinks />
        </nav>
        <div className="nav-right nav-right--mobile">
          <div className="nav-right__actions">
            <LanguageSwitcher />
            <UserArea />
          </div>
        </div>
      </aside>
    </header>
  );
}
