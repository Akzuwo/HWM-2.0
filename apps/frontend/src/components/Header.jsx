import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDialog } from '../hooks/useDialog';
import { toggleTheme } from '../theme';

function ThemeToggle({ compact = false }) {
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark');
  useEffect(() => {
    const update = () => setDark(document.documentElement.dataset.theme === 'dark');
    window.addEventListener('hm:theme-changed', update);
    return () => window.removeEventListener('hm:theme-changed', update);
  }, []);
  return <button type="button" className={compact ? 'mobile-sidebar__theme-toggle' : 'settings-option'}
    aria-pressed={dark} aria-label="Darkmode" onClick={toggleTheme}>
    {compact ? <span className="mobile-sidebar__theme-knob" aria-hidden="true" /> : <span>Darkmode: {dark ? 'Ein' : 'Aus'}</span>}
  </button>;
}

const navigationGroups = [
  {
    id: 'calendar',
    label: 'Kalender',
    key: 'common.nav.calendar',
    href: '/kalender'
  },
  {
    id: 'preparation',
    label: 'Vorbereitung',
    key: 'common.nav.preparation',
    items: [
      { href: '/upcoming', label: 'Anstehend', key: 'common.nav.upcoming', description: 'Termine und Abgaben im Blick behalten', descriptionKey: 'common.nav.upcomingHint' },
      { href: '/tagesuebersicht', label: 'Tagesvorschau', key: 'common.nav.dayPreview', description: 'Unterricht und Räume des Tages', descriptionKey: 'common.nav.dayPreviewHint' },
      { href: '/timetable-week', label: 'Wochenvorschau', key: 'common.nav.weekPreview', description: 'Der Stundenplan der ganzen Woche', descriptionKey: 'common.nav.weekPreviewHint' },
      { href: '/weekly-preview', label: 'Daybrief', key: 'common.nav.dayBrief', description: 'Kompakte Zusammenfassung deiner nächsten Tage', descriptionKey: 'common.nav.dayBriefHint' }
    ]
  },
  {
    id: 'now',
    label: 'Jetzt',
    key: 'common.nav.now',
    hint: 'Während der Schule',
    hintKey: 'common.nav.schoolTime',
    items: [
      { href: '/abfahrten', label: 'Abfahrten', key: 'common.nav.departures', description: 'Die nächsten Verbindungen', descriptionKey: 'common.nav.departuresHint' },
      { href: '/stundenplan', label: 'Aktuelles Fach', key: 'common.nav.currentSubject', description: 'Was jetzt läuft und was danach kommt', descriptionKey: 'common.nav.currentSubjectHint' }
    ]
  },
  {
    id: 'other',
    label: 'Sonstiges',
    key: 'common.nav.other',
    items: [
      { href: '/todos', label: "ToDo's", key: 'common.nav.todos', description: 'Persönliche Aufgaben organisieren', descriptionKey: 'common.nav.todosHint' },
      { href: '/notenrechner', label: 'Notenrechner', key: 'common.nav.grades', description: 'Noten und Ziele berechnen', descriptionKey: 'common.nav.gradesHint' }
    ]
  }
];

const locales = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Francais' }
];

function ChevronIcon({ className = '', direction = 'down' }) {
  const transforms = {
    down: '',
    right: 'rotate(-90 6 6)',
    left: 'rotate(90 6 6)'
  };

  return (
    <svg className={className} viewBox="0 0 12 12" focusable="false" aria-hidden="true">
      <path
        d="M2.47 4.47a.75.75 0 0 1 1.06 0L6 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L6.53 9.47a.75.75 0 0 1-1.06 0L2.47 5.53a.75.75 0 0 1 0-1.06z"
        transform={transforms[direction] || ''}
        fill="currentColor"
      />
    </svg>
  );
}

function GearIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M19.43 12.98a7.9 7.9 0 0 0 .05-.98 7.9 7.9 0 0 0-.05-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98l-.38-2.65a.5.5 0 0 0-.5-.42h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.28 7.28 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.9 7.9 0 0 0-.05.98 7.9 7.9 0 0 0 .05.98L2.46 14.63a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.39 1.09.72 1.69.98l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65c.6-.26 1.17-.59 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowBackIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M10.78 5.47a.75.75 0 0 1 0 1.06L6.31 11H20a.75.75 0 0 1 0 1.5H6.31l4.47 4.47a.75.75 0 1 1-1.06 1.06l-5.75-5.75a.75.75 0 0 1 0-1.06l5.75-5.75a.75.75 0 0 1 1.06 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlobeIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path
        d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5Zm6.98 8.5h-3.08a14.8 14.8 0 0 0-1.08-4.03 7.8 7.8 0 0 1 4.16 4.03Zm-6.23-4.76c.64.86 1.36 2.55 1.63 4.76h-4.76c.27-2.21.99-3.9 1.63-4.76a1.9 1.9 0 0 1 1.5 0Zm-3.57.73A14.8 14.8 0 0 0 8.1 11.25H5.02a7.8 7.8 0 0 1 4.16-4.03ZM4.59 12.75H7.9c.08 1.58.37 3.1.85 4.5H5.78a7.73 7.73 0 0 1-1.19-4.5Zm2.27 6h2.88c.41.85.92 1.6 1.51 2.19a7.76 7.76 0 0 1-4.39-2.19Zm3.79-1.5a12.59 12.59 0 0 1-.9-4.5h4.5a12.59 12.59 0 0 1-.9 4.5h-2.7Zm1.35 2.88c-.3-.16-.73-.52-1.14-1.38h2.28c-.41.86-.84 1.22-1.14 1.38Zm1.75.81c.59-.59 1.1-1.34 1.51-2.19h2.88a7.76 7.76 0 0 1-4.39 2.19Zm2.01-3.69a14.13 14.13 0 0 0 .85-4.5h3.31a7.73 7.73 0 0 1-1.19 4.5h-2.97Z"
        fill="currentColor"
      />
    </svg>
  );
}

function normalizePath(pathname) {
  const path = String(pathname || '').toLowerCase();
  if (!path || path === '/') {
    return '/';
  }

  return path.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
}

function isItemActive(item, currentPath) {
  return currentPath === normalizePath(item.href);
}

function NavGroupMenu({ group, currentPath, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const items = group.items || [];
  const hasActiveItem = items.some((item) => isItemActive(item, currentPath));

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && menuRef.current?.contains(event.target)) {
        event.preventDefault();
        const links = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
        const index = links.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + links.length) % links.length;
        links[next]?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!items.length) {
    return null;
  }

  return (
    <div ref={menuRef} className={`more-menu nav-group-menu${isOpen ? ' is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`nav-link nav-link--more${hasActiveItem ? ' is-active' : ''}`}
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-haspopup="menu"
        aria-controls={`nav-group-${group.id}`}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
            window.requestAnimationFrame(() => panelRef.current?.querySelector('a')?.focus());
          }
        }}
      >
        <span {...(group.key ? { 'data-i18n': group.key } : {})}>{group.label}</span>
        {group.hint ? <span className="nav-group-menu__hint" {...(group.hintKey ? { 'data-i18n': group.hintKey } : {})}>{group.hint}</span> : null}
        <ChevronIcon className="more-menu__chevron" />
      </button>
      <div ref={panelRef} className="more-menu__panel nav-group-menu__panel" id={`nav-group-${group.id}`} role="menu">
        <div className="nav-group-menu__heading" role="presentation">
          <strong {...(group.key ? { 'data-i18n': group.key } : {})}>{group.label}</strong>
          {group.hint ? <span {...(group.hintKey ? { 'data-i18n': group.hintKey } : {})}>{group.hint}</span> : null}
        </div>
        {items.map((item) => (
          <Link
            key={item.href}
            className="more-menu__link"
            to={item.href}
            role="menuitem"
            aria-current={isItemActive(item, currentPath) ? 'page' : undefined}
            onClick={(event) => {
              setIsOpen(false);
              onNavigate?.(event);
            }}
          >
            <span {...(item.key ? { 'data-i18n': item.key } : {})}>{item.label}</span>
            <small {...(item.descriptionKey ? { 'data-i18n': item.descriptionKey } : {})}>{item.description}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobileNavigation({ currentPath, onNavigate }) {
  return navigationGroups.map((group) => {
    if (group.href) {
      return (
        <section key={group.id} className="mobile-nav-group mobile-nav-group--single">
          <Link
            className="nav-link"
            to={group.href}
            onClick={onNavigate}
            aria-current={isItemActive(group, currentPath) ? 'page' : undefined}
            {...(group.key ? { 'data-i18n': group.key } : {})}
          >
            {group.label}
          </Link>
        </section>
      );
    }
    return (
      <section key={group.id} className="mobile-nav-group" aria-labelledby={`mobile-nav-${group.id}`}>
        <div className="mobile-nav-group__heading">
          <span id={`mobile-nav-${group.id}`} {...(group.key ? { 'data-i18n': group.key } : {})}>{group.label}</span>
          {group.hint ? <small {...(group.hintKey ? { 'data-i18n': group.hintKey } : {})}>{group.hint}</small> : null}
        </div>
        <div className="mobile-nav-group__links">
          {group.items.map((item) => (
            <Link
              key={item.href}
              className="nav-link"
              to={item.href}
              onClick={onNavigate}
              aria-current={isItemActive(item, currentPath) ? 'page' : undefined}
              {...(item.key ? { 'data-i18n': item.key } : {})}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    );
  });
}

function SettingsDropdown({ mobile = false }) {
  return (
    <div className={`settings-dropdown${mobile ? ' settings-dropdown--mobile' : ''}`} data-settings="">
      <button
        className={`lang-switch settings-trigger${mobile ? ' settings-trigger--mobile' : ''}`}
        type="button"
        data-settings-toggle=""
        aria-expanded="false"
        data-i18n-attr="aria-label:common.settings.ariaLabel"
      >
        <span className="settings-trigger__icon" aria-hidden="true">
          <GearIcon />
        </span>
        {mobile ? (
          <>
            <span className="settings-trigger__label">
              <span className="settings-trigger__title" data-i18n="common.settings.ariaLabel">
                Einstellungen
              </span>
            </span>
            <ChevronIcon className="settings-trigger__chevron" />
          </>
        ) : null}
      </button>
      <div className="settings-menu" data-settings-menu="">
        <div className="settings-menu__inner" data-settings-menu-inner="">
          <div className="settings-panel settings-panel--main" data-settings-panel="main">
            <ThemeToggle />
            <button type="button" className="settings-option" data-settings-open-panel="language">
              <span className="settings-option__icon" aria-hidden="true">
                <GlobeIcon />
              </span>
              <span className="settings-option__text" data-i18n="common.settings.language">
                Sprache
              </span>
              <ChevronIcon className="settings-option__chevron" direction="right" />
            </button>
          </div>

          <div className="settings-panel settings-panel--sub" data-settings-panel="language">
            <button type="button" className="settings-option settings-option--back" data-settings-back="">
              <span className="settings-option__icon" aria-hidden="true">
                <ChevronIcon direction="left" />
              </span>
              <span className="settings-option__text" data-i18n="common.settings.language">
                Sprache
              </span>
            </button>
            {locales.map((locale) => (
              <button key={locale.code} type="button" className="settings-option" data-settings-lang={locale.code}>
                <span className="settings-option__icon settings-option__icon--flag" aria-hidden="true">
                  <GlobeIcon />
                </span>
                <span className="settings-option__text">{locale.label}</span>
                <span className="settings-option__meta">{locale.code.toUpperCase()}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
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
            <Link className="account-option is-hidden" to="/admin/dashboard" data-account-admin="" role="menuitem" aria-hidden="true" tabIndex="-1">
              Adminbereich
            </Link>
          </li>
          <li>
            <Link className="account-option" to="/profile" data-account-profile="" role="menuitem">
              Profil
            </Link>
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

function getStoredLocale() {
  if (typeof window === 'undefined') {
    return 'de';
  }
  return window.localStorage?.getItem('hm.locale') || document.documentElement.getAttribute('data-locale') || 'de';
}

export function Header() {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [drawerView, setDrawerView] = useState('main');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(getStoredLocale);
  const toggleRef = useRef(null);
  const currentPath = normalizePath(location.pathname);
  const drawerRef = useDialog(isNavOpen, () => setIsNavOpen(false));
  useEffect(() => {
    const close = () => setIsNavOpen(false);
    window.addEventListener('hm:modal-open', close);
    return () => window.removeEventListener('hm:modal-open', close);
  }, []);
  useLayoutEffect(() => {
    if (isNavOpen) drawerRef.current?.querySelector('.mobile-sidebar__view.is-active button')?.focus();
  }, [drawerView, isNavOpen, drawerRef]);

  useEffect(() => {
    if (!isNavOpen || typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      if (window.innerWidth > 1080) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isNavOpen]);

  const closeNav = () => {
    setIsNavOpen(false);
    setDrawerView('main');
    setIsLanguageOpen(false);
  };

  const toggleNav = () => {
    setIsNavOpen((open) => {
      if (!open) {
        setDrawerView('main');
        setIsLanguageOpen(false);
      }
      return !open;
    });
  };

  const openSettingsView = () => {
    setDrawerView('settings');
    setIsLanguageOpen(false);
  };

  const showMainView = () => {
    setDrawerView('main');
    setIsLanguageOpen(false);
  };

  const updateLocale = (nextLocale) => {
    setSelectedLocale(nextLocale);
    setIsLanguageOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('hm.locale', nextLocale);
      window.hmI18n?.setLocale?.(nextLocale);
    }
  };

  return (
    <>
      <header className="hm-navbar">
        <div className="hm-navbar__inner header">
          <div className="header-left logo">
            <Link className="logo-link" to="/" data-brand-link="" aria-label="Homework Manager – Startseite">
              <img data-logo="" alt="" aria-hidden="true" width="32" height="32" src="/media/logo.png" />
              <span className="brand-mark" data-i18n="common.appName">
                Homework Manager
              </span>
            </Link>
          </div>

          <div className="header-center">
            <div className="nav-desktop-shell">
              <nav className="nav-links nav-links--desktop" aria-label="Main navigation" data-i18n-attr="aria-label:common.nav.primary">
                {navigationGroups.map((group) => group.href ? (
                  <Link
                    key={group.id}
                    className="nav-link"
                    to={group.href}
                    {...(group.key ? { 'data-i18n': group.key } : {})}
                    aria-current={isItemActive(group, currentPath) ? 'page' : undefined}
                  >
                    {group.label}
                  </Link>
                ) : (
                  <NavGroupMenu key={group.id} group={group} currentPath={currentPath} />
                ))}
              </nav>
            </div>
          </div>

          <div className="header-right">
            <div className="nav-right nav-right--desktop">
              <div className="nav-right__actions">
                <SettingsDropdown />
                <UserArea />
              </div>
            </div>
            <div className="nav-mobile">
              <button
                ref={toggleRef}
                className={`hm-navbar__toggle hamburger-btn${isNavOpen ? ' is-active' : ''}`}
                type="button"
                aria-expanded={isNavOpen ? 'true' : 'false'}
                aria-controls="hm-navbar-drawer"
                data-i18n-attr="aria-label:common.nav.toggle"
                onClick={toggleNav}
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
      </header>

      <div
        className={`hm-navbar__overlay${isNavOpen ? ' is-open' : ''}`}
        aria-hidden={isNavOpen ? 'false' : 'true'}
        onClick={closeNav}
      ></div>

      <aside
        ref={drawerRef}
        tabIndex={-1}
        inert={isNavOpen ? undefined : ''}
        className={`mobile-sidebar${isNavOpen ? ' is-open' : ''}${drawerView === 'settings' ? ' is-settings-view' : ''}`}
        id="hm-navbar-drawer"
        aria-hidden={isNavOpen ? 'false' : 'true'}
        aria-modal={isNavOpen ? 'true' : undefined}
        role="dialog"
        aria-label="Navigation"
        data-i18n-attr="aria-label:common.nav.primary"
      >
        <div className="mobile-sidebar__views">
          <div
            className={`mobile-sidebar__view mobile-sidebar__view--main${drawerView === 'main' ? ' is-active' : ''}`}
            aria-hidden={drawerView === 'main' ? 'false' : 'true'}
            inert={drawerView === 'main' ? undefined : ''}
          >
            <div className="mobile-sidebar__inner">
              <div className="mobile-sidebar__header">
                <Link className="mobile-sidebar__brand" to="/" onClick={closeNav}>
                  <span className="mobile-sidebar__logo-frame" aria-hidden="true">
                    <img alt="" width="40" height="40" src="/media/logo.png" />
                  </span>
                  <span className="mobile-sidebar__title" data-i18n="common.appName">
                    Homework Manager
                  </span>
                </Link>
                <button className="mobile-sidebar__close" type="button" aria-label="Menü schließen" data-i18n-attr="aria-label:common.nav.close" onClick={closeNav}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <nav className="nav-links nav-links--mobile" aria-label="Main navigation" data-i18n-attr="aria-label:common.nav.primary">
                <div className="nav-links--mobile__list">
                  <MobileNavigation currentPath={currentPath} onNavigate={closeNav} />
                  <button className="mobile-sidebar__settings-row" type="button" onClick={openSettingsView}>
                    <span className="mobile-sidebar__settings-row-icon" aria-hidden="true">
                      <GearIcon />
                    </span>
                    <span data-i18n="common.settings.label">Einstellungen</span>
                    <ChevronIcon className="mobile-sidebar__settings-row-chevron" direction="right" />
                  </button>
                </div>
              </nav>

              <footer className="mobile-sidebar__footer">
                <div className="nav-right nav-right--mobile">
                  <UserArea />
                </div>
              </footer>
            </div>
          </div>

          <div
            className={`mobile-sidebar__view mobile-sidebar__view--settings${drawerView === 'settings' ? ' is-active' : ''}`}
            aria-hidden={drawerView === 'settings' ? 'false' : 'true'}
            inert={drawerView === 'settings' ? undefined : ''}
          >
            <div className="mobile-sidebar__inner mobile-sidebar__inner--settings">
              <div className="mobile-sidebar__header mobile-sidebar__header--settings">
                <button className="mobile-sidebar__circle-button" type="button" aria-label="Zurück" data-i18n-attr="aria-label:common.nav.back" onClick={showMainView}>
                  <ArrowBackIcon />
                </button>
                <h2 className="mobile-sidebar__settings-title" data-i18n="common.settings.label">Einstellungen</h2>
                <button className="mobile-sidebar__close" type="button" aria-label="Menü schließen" data-i18n-attr="aria-label:common.nav.close" onClick={closeNav}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="mobile-sidebar__settings-content">
                <section className="mobile-sidebar__settings-group">
                  <span className="mobile-sidebar__settings-label" data-i18n="common.settings.preferences">Präferenzen</span>
                  <div className="mobile-sidebar__field">
                    <span className="mobile-sidebar__field-label" data-i18n="common.settings.language">Sprache</span>
                    <div className={`mobile-sidebar__language-select${isLanguageOpen ? ' is-open' : ''}`}>
                      <button
                        className="mobile-sidebar__select"
                        type="button"
                        aria-expanded={isLanguageOpen ? 'true' : 'false'}
                        aria-controls="mobile-language-options"
                        onClick={() => setIsLanguageOpen((open) => !open)}
                      >
                        <span>
                          {(locales.find((locale) => locale.code === selectedLocale) || locales[0]).label} ({selectedLocale.toUpperCase()})
                        </span>
                        <ChevronIcon className="mobile-sidebar__select-chevron" />
                      </button>
                      <div className="mobile-sidebar__language-menu" id="mobile-language-options" role="listbox" aria-label="Sprache" hidden={!isLanguageOpen}
                        onKeyDown={event => {
                          if (event.key === 'Escape') { event.stopPropagation(); setIsLanguageOpen(false); event.currentTarget.previousElementSibling?.focus(); return; }
                          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                          event.preventDefault();
                          const options = [...event.currentTarget.querySelectorAll('[role="option"]')];
                          const current = options.indexOf(document.activeElement);
                          const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
                          options[next]?.focus();
                        }}>
                        {locales.map((locale) => (
                          <button
                            key={locale.code}
                            className="mobile-sidebar__language-option"
                            type="button"
                            role="option"
                            aria-selected={selectedLocale === locale.code ? 'true' : 'false'}
                            onClick={() => updateLocale(locale.code)}
                          >
                            {locale.label} ({locale.code.toUpperCase()})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mobile-sidebar__toggle-row">
                    <span>
                      <strong>Darkmode</strong>
                      <small>Dunkles Erscheinungsbild</small>
                    </span>
                    <ThemeToggle compact />
                  </div>
                </section>

                <section className="mobile-sidebar__settings-group">
                  <span className="mobile-sidebar__settings-label" data-i18n="common.settings.appInfo">App Info</span>
                  <div className="mobile-sidebar__info-row">
                    <span data-i18n="common.settings.version">Version</span>
                    <strong>3.0.0</strong>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
