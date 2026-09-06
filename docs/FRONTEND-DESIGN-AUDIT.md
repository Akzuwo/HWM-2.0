# Frontend-Prüfung gegen DESIGN.md

Stand: 6. September 2026. Umfang: die Website in `apps/frontend`, ihre 19 Seiten und die ergänzte 404-Ansicht. Die Electron-Anwendung `apps/control-center` ist eine separate Anwendung und war nicht Teil dieser Website-Prüfung.

## Umgesetzte Korrekturen

| Bereich aus DESIGN.md | Änderungen |
| --- | --- |
| Grundlagen, Abstände, Farben, Ebenen | Gemeinsame semantische Tokens und Zustandsregeln in `src/styles/design-system.css`; vorhandene Radius-Tokens weiterverwendet; definierte Ebenen für Navigation, Drawer, Dialoge und Meldungen. |
| Responsive Layout | Fehlende Regeln der kompakten ToDo-Ansicht ergänzt; echte Checkbox-Schaltflächen, lesbare Schritte und Filter; Kalenderbreite und abgeschnittene Spalten korrigiert; Abfahrtskarten auf Mobile verdichtet; ausgeblendete Abfahrten über „Alle anzeigen“ erreichbar. |
| Dark Mode | Funktionierende, gespeicherte Theme-Auswahl, Systempräferenz beim ersten Besuch; angepasste Text-, Status-, Formular-, Kalender-, Tabellen- und Dialogflächen. |
| Navigation und Motion | Header bleibt beim Seitenwechsel bestehen; kurzer Opacity-Übergang; Reduced Motion berücksichtigt; Hover-Regeln nur auf Geräten mit Hover; dekorative Bewegungen und wiederholte Scroll-Reveals reduziert; Skip-Link und aktive Navigation für URL-Aliasse. |
| Dialoge und Formulare | Gemeinsame Fokusfalle, Escape, Fokuswiederherstellung und Scroll-Sperre; Kalenderdialoge als React-Portale mit sauberem Unmount; Filterdialog auf Desktop und Mobile sichtbar; Löschbestätigungen; sichtbare Feldlabels und Passwortanzeige. |
| Laden, Fehler, Offline, Leerzustände | Inline-Fehler mit Anmeldung oder Wiederholen; erhaltene Daten bei Aktualisierungsfehlern; entfernte Wochenvorschau-Skeletons nach Erfolg; Offline-Hinweis; fehlende 404-Ansicht ergänzt. |
| Verlässliches Speichern | ToDo-Mutationen gegen Mehrfachausführung geschützt; gezielter Rollback; Entwürfe bei Fehlern und Änderungen während des Speicherns erhalten; lokale Noten-Speicherfehler sichtbar; Cloud-Speicherzustand berücksichtigt zwischenzeitliche Änderungen. |
| Daten und Lebenszyklus | Endlosschleife bei Berechtigungsänderungen behoben; Klassenwahl und laufende Ansichten auf Seitenwechsel aufgeräumt; veraltete Stundenplan- und Admin-Antworten ignoriert; automatische Wiederholung von Kalender-POSTs verhindert doppelte Einträge. |
| Inhalt und Feedback | Erfundenes Notenziel und News-Platzhalter entfernt; Kalender-Testdaten nur noch explizit aktivierbar; Emoji-Icons in der regulären Oberfläche entfernt; Meldungen vereinheitlicht, begrenzt und bei Maus-/Tastaturfokus pausiert. |

## Verifikation

Chromium mit synthetischen, ausschließlich im Testbrowser abgefangenen API-Antworten; Viewports 1440 × 900 und 390 × 900, Interaktionstests zusätzlich mit Reduced Motion. Es wurden keine Konten oder produktiven Daten verändert.

| Prüflauf | Anzahl Seiten-/Viewport-Kombinationen | Ergebnis |
| --- | ---: | --- |
| Gefüllte Ansichten, hell | 40 | Bestanden |
| Gefüllte Ansichten, dunkel | 40 | Bestanden nach gezielter Nachprüfung des Abfahrten-Kontrasts |
| Leere Datenansichten | 18 | Bestanden |
| Fehlerantworten | 22 | Bestanden nach gezielter Nachprüfung der Admin-Ergebnistabelle |

In diesen 120 Kombinationen nach den Korrekturen: keine erfassten unbehandelten JavaScript-Fehler, keine horizontale Überbreite des Dokuments, keine zurückgebliebenen sichtbaren Skeletons und keine Befunde der aktivierten axe-Regeln für WCAG A/AA (2.0 und 2.1).

Zusätzliche Interaktionstests bestanden:

- Noten hinzufügen, bearbeiten, Dialogfokus, Escape, Löschung abbrechen und Persistenz nach Reload.
- ToDo-Update genau einmal senden; Schritte aufklappen; Entwurf bei fehlgeschlagenem Speichern erhalten; neu eingegebenen Entwurf während des Speicherns erhalten; Offline-Hinweis.
- Wiederholte SPA-Navigation zwischen Kalender, Wochenvorschau und anstehenden Terminen.
- Kalenderfilter öffnen, Fokus halten und schließen; Kalenderdialoge beim Verlassen entfernen und beim Wiederbesuch genau einmal anlegen.
- Admin-Erstellungsdialog und Wechsel zwischen Klassen, News und Stundenplänen.
- Kontolöschung abbrechen ohne DELETE-Anfrage.
- Mobile Navigation mit Fokusfalle und Escape.

`npm run build:frontend` besteht. Der Build meldet lediglich einen veralteten Browserslist-Datensatz. `git diff --check` wurde ebenfalls geprüft.

## Reproduzieren

Die Prüfskripte liegen in `tools/frontend-design-audit.cjs`, `tools/frontend-interactions.cjs` und `tools/frontend-audit-fixtures.cjs`. Benötigt werden Playwright, dessen Chromium-Browser und `@axe-core/playwright` in einem separaten Testverzeichnis. `HWM_AUDIT_MODULES` bezeichnet dessen `node_modules`-Verzeichnis. Standard ist `%TEMP%/hwm-design-audit/node_modules`.

```powershell
npm --prefix apps/frontend run dev -- --host 127.0.0.1 --port 5174 --mode audit
```

In einer zweiten Shell:

```powershell
$env:HWM_AUDIT_SCENARIO = 'success'
node tools/frontend-design-audit.cjs
node tools/frontend-interactions.cjs
```

Optionen: `HWM_AUDIT_THEME=dark`, `HWM_AUDIT_SCENARIO=empty|error|guest`, `HWM_AUDIT_WIDTHS=1440,390`, `HWM_AUDIT_ROUTES` als kommagetrennte Pfade und `HWM_AUDIT_OUTPUT` für JSON/Screenshots. `HWM_AUDIT_URL` überschreibt die lokale Adresse. Der Audit-Modus lässt ausschließlich den lokalen Cloudflare-Worker weg; der Produktionsbuild verwendet weiterhin die reguläre Cloudflare-Konfiguration.

## Aussagegrenzen

Die Prüfung kombiniert Quelltextprüfung, Screenshots, automatisierte Zustandsprüfungen und ausgewählte echte Browserinteraktionen. Sie ist keine vollständige WCAG-Zertifizierung und kein Beweis für jeden möglichen Dateninhalt oder jedes Gerät. Reale Anmeldung, E-Mail-Verifikation, verschlüsselter Cloud-Abgleich, produktive Rollen und externe Echtzeitdienste wurden nicht Ende-zu-Ende gegen einen laufenden Backend-Dienst geprüft. Nicht alle Sprachkombinationen wurden visuell durchgetestet. Es wurde nichts veröffentlicht.

Die bestehenden Stylesheets bleiben erhalten. Die gemeinsame CSS-Schicht korrigiert deren sichtbare Zustände; eine vollständige Migration sämtlicher historischer CSS-Werte auf Tokens ist damit nicht behauptet.
