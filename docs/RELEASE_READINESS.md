# HWM 3.0 – Selbsteinschätzung zur Release-Reife

Stand: 19. Juni 2026

## Kurzfazit

**Aktueller Status: Noch kein Release Candidate (No-Go für einen öffentlichen Produktionsrelease).**

Die Kernanwendung ist weit fortgeschritten und das Frontend lässt sich erfolgreich als Production-Build erstellen. Backend-Tests und zentrale Benutzerflüsse sind vorhanden beziehungsweise implementiert. Vor dem Release bestehen jedoch noch sicherheits- und betriebsrelevante Blocker: persistente Session-Secrets, das automatische Standard-Admin-Konto, fehlende CI-Gates sowie eine noch nicht vollständig geprüfte Produktionskonfiguration.

Als grobe Selbsteinschätzung liegt die Release-Reife bei **etwa 60 %**. Diese Zahl ist kein Testresultat, sondern eine Orientierung: Die Funktionsbreite ist hoch, die verbleibende Arbeit konzentriert sich auf Absicherung, automatisierte Qualitätssicherung und Produktionsbetrieb.

## Nachgewiesener Stand

| Bereich | Ergebnis | Bemerkung |
| --- | --- | --- |
| Frontend-Production-Build | Bestanden | `npm run build:frontend` |
| SQLite-Setup | Bestanden | `npm run check:backend` |
| Backend-Tests | Nicht ausgeführt | Acht Testdateien vorhanden; in der aktuellen Umgebung fehlt `pytest` |
| Control-Center-Build | Fehlgeschlagen | Abhängigkeiten sind lokal nicht installiert (`vite` nicht gefunden) |
| Frontend Dependency Audit | Handlungsbedarf | Zwei moderate Meldungen über `react-router-dom`/`react-router`; Update verfügbar |
| Control Center Dependency Audit | Bestanden | Keine Production-Vulnerabilities gemeldet |
| CI/CD-Qualitätsgates | Fehlen | Kein `.github/workflows`-Verzeichnis vorhanden |
| Frontend-E2E-/Komponententests | Fehlen | Im Repository wurden keine entsprechenden Tests gefunden |
| Arbeitsbaum | Nicht sauber | Header-/CSS-Änderungen sind noch nicht committed |

## P0 – Muss vor jedem öffentlichen Release erledigt sein

- [ ] **Persistentes Flask-Session-Secret einführen.** `apps/backend/app.py` erzeugt aktuell bei jedem Prozessstart mit `pysecrets.token_hex(32)` einen neuen Schlüssel. Dadurch werden Sessions bei Neustarts ungültig und mehrere Backend-Prozesse können Sessions nicht zuverlässig gemeinsam verwenden. Ein verpflichtendes Secret aus der Produktionsumgebung verwenden und den Start bei fehlendem Secret abbrechen.
- [ ] **Automatisches Standard-Admin-Konto absichern.** Der Backend-Start legt aktuell ohne explizite Aktivierung einen Admin mit `admin@localhost` und dem Fallback-Passwort `ChangeMe123!` an. Seeding nur nach expliziter Aktivierung erlauben, in Produktion kein Standardpasswort akzeptieren und vorhandene Standardzugänge vor dem Release entfernen.
- [ ] **Produktionsmodus eindeutig festlegen.** `HWM_DEBUG_MODE=0`, `HWM_LOCAL_DEV=0`, `FLASK_DEBUG=0`, sichere Cookies und die endgültigen CORS-Ursprünge in Staging und Produktion verifizieren. Lokale CORS-Muster sollten nicht Teil der Produktions-Allowlist sein.
- [ ] **Frontend-API-Ziel finalisieren.** `VITE_API_BASE_URL` muss beim Production-Build auf die endgültige HTTPS-API zeigen; CORS, Cookies und Login müssen über die echten Domains gemeinsam getestet werden.
- [ ] **Moderate React-Router-Sicherheitsmeldung beheben.** `react-router-dom` auf eine Version aktualisieren, die GHSA-2j2x-hqr9-3h42 behebt, danach Build und Navigation erneut testen.
- [ ] **Backend-Test-Suite vollständig grün ausführen.** Entwicklungsabhängigkeiten aus `apps/backend/requirements-dev.txt` installieren und `python -m pytest apps/backend/tests -q` als Release-Gate verwenden.
- [ ] **Kritische End-to-End-Flows auf Staging abnehmen:** Registrierung, E-Mail-Verifikation, Login/Logout, Passwort-Reset, Rollen/Rechte, Kalender CRUD, ToDos, Notentresor, Profiländerung und Account-Löschung.
- [ ] **Backup und Restore praktisch testen.** SQLite-Datenbank, Uploads/Imports und relevante Konfiguration sichern, Wiederherstellung in einer frischen Umgebung durchführen und dokumentieren.
- [ ] **Rechtliches und Datenschutz final prüfen.** Impressum, Datenschutzerklärung, Cookie-Einwilligung, Cloudflare-Observability sowie Verarbeitung von Konto-, Schul- und Notendaten müssen zur tatsächlichen Produktionsarchitektur passen.

## P1 – Für einen belastbaren Release Candidate

- [ ] **CI einrichten.** Bei jedem Pull Request mindestens Frontend-Build, Backend-Tests, SQLite-Check und Dependency Audit ausführen.
- [ ] **Frontend-Smoke-/E2E-Tests ergänzen.** Mindestens Navigation, Responsive Header/Drawer, Sprachwechsel, Auth-Anzeige und die wichtigsten datenabhängigen Seiten automatisieren.
- [ ] **Alle primären Routen manuell prüfen.** Die 19 in `src/app/App.jsx` definierten Seiten auf Desktop und Mobile testen: Ladezustand, leere Daten, Fehlerzustand, Auth-Zustände und Browser-Konsole.
- [ ] **Unfertige sichtbare Inhalte entscheiden.** Die Geschichtsseite bezeichnet sich als noch in Entwicklung; die Startseite besitzt News-Platzhalter. Vor Release entweder fertigstellen oder bewusst aus Navigation und Sitemap entfernen.
- [ ] **Darkmode-UI eindeutig behandeln.** Der Schalter ist aktuell nur vorbereitet und ändert kein Theme. Bis zur Implementierung deaktiviert und als „Demnächst“ kennzeichnen oder vollständig ausblenden, damit keine funktionslose Bedienung veröffentlicht wird.
- [ ] **E-Mail-Zustellung testen.** SMTP, Registrierung, Verifikation, Passwort-Reset und Kontaktformular mit Produktionsabsender testen; SPF, DKIM und DMARC kontrollieren.
- [ ] **Rate Limits produktionsfest machen.** Die aktuellen In-Memory-Limits werden bei Neustarts zurückgesetzt und gelten nicht gemeinsam über mehrere Prozesse. Für mehrere Worker/Instanzen einen gemeinsamen Store verwenden.
- [ ] **Control Center in den Release-Scope einordnen.** Entweder Abhängigkeiten installieren, Build und Paketierung testen oder klar dokumentieren, dass Version 0.1.1 nicht Bestandteil des HWM-3.0-Releases ist. Die Root-Dokumentation beschreibt es derzeit noch als Platzhalter.
- [ ] **Staging-Deployment testen.** Direkte SPA-Unterseiten, Cache-Verhalten, Assets, HTTPS, Sicherheitsheader, API-Erreichbarkeit und Rollback prüfen.
- [ ] **Produktionsbetrieb vorbereiten.** Healthcheck, strukturierte Logs, Alarmierung, Speicherplatzüberwachung, Datenbank-Wartung und Verantwortlichkeiten für Störungen festlegen.

## P2 – Kurz nach dem Release oder bei verbleibender Zeit

- [ ] Frontend-Bundle und die große globale CSS-Datei analysieren und nach Seiten aufteilen.
- [ ] Legacy-JavaScript schrittweise in getestete React-Module überführen.
- [ ] Das rund 270 KB große Backend-Modul `app.py` in fachliche Module/Blueprints zerlegen.
- [ ] Gemeinsame API-Verträge und Konstanten in `packages/shared` etablieren.
- [ ] Barrierefreiheit systematisch prüfen: Tastatur, Fokusführung, Screenreader-Bezeichnungen, Kontrast und reduzierte Bewegung.
- [ ] Browser-Matrix definieren und mindestens aktuelles Chrome, Firefox, Safari und Edge abnehmen.

## Empfohlenes Release-Gate

Ein Release darf erst als **Go** markiert werden, wenn:

1. alle P0-Punkte abgeschlossen sind,
2. Frontend-Build, Backend-Tests und Dependency Audits grün sind,
3. Staging mindestens einen vollständigen Auth- und Kalender-Durchlauf bestanden hat,
4. Backup und Restore nachweislich funktionieren,
5. keine bekannten kritischen oder hohen Sicherheitsprobleme offen sind,
6. Rollback-Verantwortung und Produktionskonfiguration dokumentiert sind.

## Wiederholbare Prüfkommandos

```powershell
npm install --prefix apps/frontend
npm run build:frontend
npm audit --prefix apps/frontend --omit=dev

python -m pip install -r apps/backend/requirements.txt -r apps/backend/requirements-dev.txt
python -m pytest apps/backend/tests -q
npm run check:backend

npm install --prefix apps/control-center
npm run build:control
npm audit --prefix apps/control-center --omit=dev
```

Diese Datei sollte bei jedem erreichten Meilenstein aktualisiert werden. Erledigte Punkte werden erst abgehakt, wenn ein reproduzierbarer Test, ein Deployment-Nachweis oder eine dokumentierte manuelle Abnahme vorliegt.
