import { useState } from 'react';

export function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  return <div className="hm-password-field">
    <input {...props} type={visible ? 'text' : 'password'} />
    <button type="button" aria-pressed={visible} aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'} onClick={() => setVisible(value => !value)}>
      {visible ? 'Verbergen' : 'Anzeigen'}
    </button>
  </div>;
}
