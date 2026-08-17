import { Link } from 'react-router-dom';
import { openCookieSettings } from './CookieConsentBanner';

function FooterIcon({ children }) {
  return (
    <svg className="hm-footer__icon" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="hm-footer">
      <div className="hm-footer__inner">
        <div className="hm-footer__left hm-footer__meta">
          <div className="hm-footer__brand">
            <img className="hm-footer__logo" src="/media/logo.png" alt="" aria-hidden="true" width="50" height="50" />
            <span className="hm-footer__eyebrow">Homework Manager</span>
          </div>
          <p className="hm-footer__legal">
            © <span>{new Date().getFullYear()}</span> <span>Timo Wigger</span>
          </p>
        </div>

        <nav className="hm-footer__section hm-footer__quick-links" aria-label="Quick Links">
          <h2 className="hm-footer__heading">Quick Links</h2>
          <Link className="hm-footer__link" to="/impressum">
            <FooterIcon>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6M8 13h8M8 17h8" />
            </FooterIcon>
            <span data-i18n="common.footer.imprint">Impressum</span>
          </Link>
          <Link className="hm-footer__link" to="/datenschutz">
            <FooterIcon>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="M12 2v20" />
            </FooterIcon>
            <span data-i18n="common.footer.privacy">Datenschutz</span>
          </Link>
          <Link className="hm-footer__link" to="/changelog">
            <FooterIcon>
              <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
            </FooterIcon>
            <span data-i18n="common.footer.changelog">Changelog</span>
          </Link>
        </nav>

        <div className="hm-footer__right hm-footer__section hm-footer__contact">
          <h2 className="hm-footer__heading">Kontakt/Support</h2>
          <a className="hm-footer__link" href="mailto:support@akzuwo.ch">
            <FooterIcon>
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
            </FooterIcon>
            <span data-i18n="common.footer.contact">support@akzuwo.ch</span>
          </a>
          <button className="hm-footer__link hm-footer__button" type="button" onClick={openCookieSettings}>
            <FooterIcon>
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.1 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.5 4.1a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2.3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.1a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.5c.15.38.36.72.66 1 .3.26.69.4 1.09.4h.1a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.1.4c-.3.28-.52.62-.66 1Z" />
            </FooterIcon>
            <span>Cookie-Einstellungen</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
