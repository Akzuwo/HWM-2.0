import { Link } from 'react-router-dom';
import { usePageSetup } from '../hooks/usePageSetup';

export function NotFoundPage() {
  usePageSetup();
  return <main id="main" className="hm-state">
    <h1>Seite nicht gefunden</h1>
    <p>Diese Adresse ist nicht verfügbar. Über die Startseite findest du deine Aufgaben und Termine.</p>
    <Link to="/">Zur Startseite</Link>
  </main>;
}
