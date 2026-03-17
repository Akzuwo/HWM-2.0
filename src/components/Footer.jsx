export function Footer() {
  return (
    <footer className="hm-footer">
      <div className="hm-footer__meta">
        <div className="hm-footer__brand">
          <span className="hm-footer__eyebrow">Homework Manager</span>
          <div className="hm-footer__legal">
            © <span>{new Date().getFullYear()}</span> <span>Timo Wigger</span>
          </div>
        </div>
        <p className="hm-footer__copy">A clearer, calmer way to organise homework, exams, schedules and class events.</p>
      </div>
      <nav className="hm-footer__links" aria-label="Footer navigation">
        <a className="hm-footer__link" href="mailto:support@akzuwo.ch" data-i18n="common.footer.contact">
          support@akzuwo.ch
        </a>
        <a className="hm-footer__link" href="/impressum.html" data-i18n="common.footer.imprint">
          Impressum
        </a>
        <a className="hm-footer__link" href="/datenschutz.html" data-i18n="common.footer.privacy">
          Datenschutz
        </a>
        <a className="hm-footer__link" href="/changelog.html" data-i18n="common.footer.changelog">
          Changelog
        </a>
      </nav>
    </footer>
  );
}
