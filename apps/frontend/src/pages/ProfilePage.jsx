import { PasswordField } from '../components/PasswordField';
import { usePageSetup } from '../hooks/usePageSetup';

export function ProfilePage() {
  usePageSetup({
    bodyClass: 'profile-page',
    scripts: ['profile']
  });

  return (
    <>
      <main id="main" className="profile">
        <div id="profile-load-status" role="status">Profil wird geladen…</div>
        <div className="profile__container">
          <header className="profile__header">
            <p className="profile__eyebrow" data-i18n="profile.eyebrow">
              Account
            </p>
            <h1 data-i18n="profile.title">Profile</h1>
            <p className="profile__subtitle" data-i18n="profile.subtitle">
              Manage your personal details, class assignment, and security.
            </p>
          </header>

          <section className="profile__grid">
            <article className="profile-card profile-card--wide">
              <div className="profile-card__header">
                <div>
                  <p className="profile__eyebrow" data-i18n="profile.overviewLabel">
                    Overview
                  </p>
                  <h2 data-i18n="profile.overviewTitle">Account overview</h2>
                </div>
                <p className="muted" data-i18n="profile.overviewDescription">
                  Your current account details at a glance.
                </p>
              </div>
              <dl className="profile-meta">
                <div className="profile-meta__item">
                  <dt data-i18n="profile.userId">User ID</dt>
                  <dd id="profile-id">–</dd>
                </div>
                <div className="profile-meta__item">
                  <dt data-i18n="profile.email">Email</dt>
                  <dd id="profile-email">–</dd>
                </div>
                <div className="profile-meta__item">
                  <dt data-i18n="profile.class">Class</dt>
                  <dd id="profile-class">–</dd>
                </div>
                <div className="profile-meta__item">
                  <dt data-i18n="profile.classId">Class ID</dt>
                  <dd id="profile-class-id">–</dd>
                </div>
                <div className="profile-meta__item">
                  <dt data-i18n="profile.accountAge">Account age</dt>
                  <dd id="profile-age">–</dd>
                </div>
                <div className="profile-meta__item">
                  <dt data-i18n="profile.accountCreated">Created on</dt>
                  <dd id="profile-created">–</dd>
                </div>
                <div className="profile-meta__item">
                  <dt data-i18n="profile.lastClassChange">Last class change</dt>
                  <dd id="profile-last-change">–</dd>
                </div>
              </dl>
            </article>

            <article className="profile-card profile-card--wide">
              <header className="profile-card__header">
                <div>
                  <p className="profile__eyebrow">Personalisierung</p>
                  <h2>Eigene Stunden</h2>
                </div>
                <p className="muted">Ergänzungs- und Freifächer erscheinen nur in deinem Stundenplan. Maximal 5 Einträge.</p>
              </header>
              <form className="profile-form profile-personal-timetable__form" id="personal-timetable-form">
                <label className="profile-form__label" htmlFor="personal-day">Wochentag</label>
                <select id="personal-day" className="profile-input" required defaultValue="Monday">
                  <option value="Monday">Montag</option><option value="Tuesday">Dienstag</option><option value="Wednesday">Mittwoch</option>
                  <option value="Thursday">Donnerstag</option><option value="Friday">Freitag</option><option value="Saturday">Samstag</option><option value="Sunday">Sonntag</option>
                </select>
                <label className="profile-form__label" htmlFor="personal-subject">Fach</label>
                <input id="personal-subject" className="profile-input" maxLength="120" required placeholder="z. B. Philosophie" />
                <label className="profile-form__label" htmlFor="personal-start">Beginn</label>
                <input id="personal-start" className="profile-input" type="time" required />
                <label className="profile-form__label" htmlFor="personal-end">Ende</label>
                <input id="personal-end" className="profile-input" type="time" required />
                <label className="profile-form__label" htmlFor="personal-room">Raum (optional)</label>
                <input id="personal-room" className="profile-input" maxLength="120" placeholder="z. B. A204" />
                <div className="profile-actions">
                  <button type="submit" id="personal-timetable-save" className="button ripple">Stunde hinzufügen</button>
                  <button type="button" id="personal-timetable-cancel" className="button ripple" hidden>Bearbeiten abbrechen</button>
                </div>
              </form>
              <p className="profile-help" id="personal-timetable-count">0 von 5 Stunden</p>
              <div className="profile-personal-timetable__list" id="personal-timetable-list"></div>
            </article>

            <article className="profile-card">
              <header className="profile-card__header">
                <div>
                  <p className="profile__eyebrow" data-i18n="profile.securityLabel">
                    Security
                  </p>
                  <h2 data-i18n="profile.passwordTitle">Change password</h2>
                </div>
                <p className="muted" data-i18n="profile.passwordDescription">
                  Update your password and receive a confirmation email once the change succeeds.
                </p>
              </header>
              <form className="profile-form" id="password-form">
                <label className="profile-form__label" htmlFor="current-password" data-i18n="profile.currentPassword">
                  Current password
                </label>
                <PasswordField id="current-password" className="profile-input" type="password" autoComplete="current-password" />

                <label className="profile-form__label" htmlFor="new-password" data-i18n="profile.newPassword">
                  New password
                </label>
                <PasswordField id="new-password" className="profile-input" type="password" autoComplete="new-password" />

                <label className="profile-form__label" htmlFor="confirm-password" data-i18n="profile.confirmPassword">
                  Confirm password
                </label>
                <PasswordField id="confirm-password" className="profile-input" type="password" autoComplete="new-password" />

                <p className="profile-help" data-i18n="profile.passwordHint">
                  Use at least 8 characters.
                </p>
                <div className="profile-actions">
                  <button type="submit" id="change-password-btn" className="button ripple">
                    <span data-i18n="profile.passwordChangeButton">Update password</span>
                  </button>
                </div>
                <p role="status" aria-live="polite" id="password-email-status" className="profile-help"></p>
              </form>
            </article>

            <article className="profile-card profile-card--danger">
              <header className="profile-card__header">
                <div>
                  <p className="profile__eyebrow" data-i18n="profile.dangerZone">
                    Danger zone
                  </p>
                  <h2 data-i18n="profile.deleteTitle">Delete account</h2>
                </div>
                <p className="muted" data-i18n="profile.deleteWarning">
                  This will permanently remove your account.
                </p>
              </header>
              <div className="profile-actions">
                <button id="delete-account-btn" className="button button--danger ripple" type="button" data-i18n="profile.deleteButton">
                  Delete account
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>
    </>
  );
}

