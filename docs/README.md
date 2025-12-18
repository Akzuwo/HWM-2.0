# Dokumentation

## Überblick

Homework Manager 2.0 bündelt Stundenpläne, Hausaufgabenverwaltung, Mitteilungen und Service-Seiten in einer einzigen Plattform. Das Repository enthält den Python-basierten Backend-Dienst, die lokalisierten statischen Frontends sowie Hilfsskripte für Migrationen und Datenimporte. Die Anwendung ist für den Betrieb in einer MySQL-Umgebung optimiert, stellt REST-Endpunkte für die Weboberfläche bereit und verweist für Supportanfragen auf die zentrale Adresse support@akzuwo.ch.

## Neue Funktionen in Version 2.0

* **Überarbeiteter Stundenplan-Importer:** `backend/scripts/import_schedule.py` validiert JSON-Eingaben, erzeugt einen Import-Hash und ersetzt bestehende Einträge inklusive Metadaten. Damit lassen sich mehrere Klassen nacheinander synchronisieren, ohne manuelle Bereinigungsschritte.
* **Feingranulares Rate-Limiting:** Login- und Verifikations-Endpunkte werden durch konfigurierbare Ratenbegrenzung geschützt. Die zugehörigen Umgebungsvariablen (`LOGIN_RATE_LIMIT_*`, `VERIFY_RATE_LIMIT_*`) ermöglichen eine Anpassung je Deployment.
* **Direkter Support-Kanal:** Rückmeldungen laufen gebündelt über support@akzuwo.ch; das frühere Kontaktformular wurde entfernt.
* **Account System:** Jeder Benutzer hat seinen eigenen Account. Jeder Account ist einer Klasse zugeteilt und hat eine Rolle die ihm entsprechende Rechte geben.
* **Beta- und Produktions-Workflows:** Die Basis-URL für Verifizierungslinks orientiert sich am Beta-System (`PRIMARY_TEST_BASE_URL`). Fallback-Konfigurationen sind nicht mehr notwendig, Tests erfolgen direkt gegen die Beta-Instanz.
* **Erweiterte Protokollierung:** Rotierende Logfiles (`/tmp/hwm-backend.log` per Default) erleichtern das Debugging und liefern Kontext für Supportanfragen, ohne dass der Dienst neu gestartet werden muss.

## Projektstruktur

| Pfad | Beschreibung |
| --- | --- |
| `backend/` | Flask-Anwendung inklusive Authentifizierung, Import-Logik, Tests und REST-API. |
| `backend/scripts/` | Hilfsskripte wie der Stundenplan-Importer. |
| `backend/migrations/` | SQL-Migrationsskripte für die aktuelle Datenstruktur. |
| `de/`, `en/`, `fr/`, `it/` | Lokalisierte statische Inhalte, die vom Backend ausgeliefert werden. |
| `frontend/locales/` | JSON-Übersetzungen für dynamische Frontend-Komponenten. |
| `docs/` | Projekt- und Betriebshandbücher (diese Datei). |
| `utils/` | Deployment-Helfer und Verwaltungs-Skripte. |

## Wichtige API-Endpunkte

| Pfad | Methode(n) | Zweck | Berechtigungen |
| --- | --- | --- | --- |
| `/api/auth/register` | `POST` | Registriert Schüler:innen mit optionalem Klassen-Slug und triggert E-Mail-Verifizierung. | Öffentlich, Domain-Whitelist beachten. |
| `/api/auth/login`, `/api/login` | `POST` | Startet eine Session per Cookie. | Öffentlich, Rate-Limiting aktiv. |
| `/api/auth/logout`, `/api/logout` | `POST` | Beendet die aktuelle Session. | Angemeldete Nutzer:innen. |
| `/api/auth/verify` | `POST` | Bestätigt einen Verifizierungscode und setzt `email_verified_at`. | Öffentlich (per Code), Rate-Limiting aktiv. |
| `/api/auth/resend` | `POST` | Fordert einen neuen Verifizierungscode an. | Öffentlich (per E-Mail). |
| `/api/auth/password-reset` | `POST` | `action=request`/`create`: erzeugt Reset-Code; `action=confirm`/`reset`: setzt neues Passwort. | Öffentlich, getrennte Rate-Limits pro IP/User. |
| `/api/contact` | `POST` | Sendet eine Kontaktanfrage mit optionalem Anhang. | Angemeldet und aktiv. |
| `/api/classes` | `GET` | Listet Klassen (Admin/Teacher sehen alle, Class-Admin nur eigene). | Admin, Teacher, Class-Admin. |
| `/api/session/class` | `GET`, `PUT` | Liest oder setzt den Klassenkontext für weitere Requests. | Lesen: alle Rollen außer Gast; Setzen: Admin, Teacher. |
| `/api/users/<id>/class` | `PUT` | Ordnet einem Nutzer eine Klasse zu. | Admin. |
| `/api/me` | `GET`, `PUT`, `DELETE` | Liefert Profil, erlaubt Klassenwechsel (30-Tage-Cooldown) oder Soft-Delete des Kontos. | Angemeldet. |
| `/api/admin/logs` | `GET` | Liefert den aktuellen Logtail mit Begrenzung. | Admin. |
| `/api/admin/schedule-import` | `POST` | Importiert Stundenplan-JSON für eine Klasse (Upload oder Payload). | Admin. |
| `/api/admin/resend-verification` | `POST` | Schickt den Verifizierungscode erneut an das Admin-Konto. | Admin. |
| `/api/admin/users` | `GET`, `POST` | Paginierte Userliste bzw. Nutzer anlegen. | Admin. |
| `/api/admin/users/<id>` | `GET`, `PUT`, `DELETE` | Liest, aktualisiert oder löscht einen Nutzer. | Admin. |
| `/api/admin/classes` | `GET`, `POST` | Klassen auflisten oder neu anlegen. | Admin. |
| `/api/admin/classes/<id>` | `GET`, `PUT`, `DELETE` | Klassen lesen, ändern oder entfernen. | Admin. |
| `/api/admin/schedules` | `GET`, `POST` | Importhistorie/Metadaten lesen oder neuen Schedule-Eintrag anlegen. | Admin. |
| `/api/admin/schedules/<id>` | `GET`, `PUT`, `DELETE` | Schedule-Metadaten lesen, ändern oder löschen. | Admin. |
| `/api/admin/classes/<id>/schedule` | `DELETE` | Entfernt alle Stundenplan-Einträge einer Klasse. | Admin. |
| `/api/admin/schedule-entries` | `GET`, `POST` | Stundenplan-Einträge je Klasse abrufen oder neu anlegen. | Admin. |
| `/api/admin/schedule-entries/<id>` | `GET`, `PUT`, `DELETE` | Einzelnen Stundenplan-Eintrag lesen, ändern oder löschen. | Admin. |
| `/entries` | `GET` | Listet alle Hausaufgaben/Termine einer Klasse, sortiert nach Datum. | Session mit Klassenkontext erforderlich. |
| `/add_entry` | `POST` | Legt Einträge für eine oder mehrere Klassen an (IDs optional verknüpft). | Entry-Manager-Rollen (Admin/Teacher/Class-Admin). |
| `/update_entry` | `PUT` | Aktualisiert einen vorhandenen Eintrag inkl. Zeit- und Klassenfeldern. | Entry-Manager-Rollen (Admin/Teacher/Class-Admin). |
| `/delete_entry/<id>` | `DELETE` | Entfernt einen Eintrag für die gewählte Klasse. | Entry-Manager-Rollen (Admin/Teacher/Class-Admin). |
| `/stundenplan` | `GET` | Liefert den Stundenplan der aktuellen Klasse. | Session mit Klassenkontext erforderlich. |
| `/aktuelles_fach` | `GET` | Gibt aktuelles und nächstes Fach inkl. Restzeit zurück. | Session mit Klassenkontext erforderlich. |
| `/tagesuebersicht` | `GET` | Stundenplanübersicht für heute und morgen. | Session mit Klassenkontext erforderlich. |
| `/calendar.ics` | `GET` | Exportiert zukünftige Einträge als iCalendar-Datei. | Session mit Klassenkontext erforderlich. |

## Lokale Entwicklung

### Voraussetzungen

* Python 3.10 oder neuer
* MySQL 8.x oder eine kompatible MariaDB-Instanz

### Installation

```bash
cd HWM-2.0
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
```

### Konfiguration

Das Backend bezieht sämtliche Secrets aus Umgebungsvariablen oder dem Secrets-Verzeichnis. Für lokale Tests empfiehlt sich folgende Minimal-Konfiguration:

```bash
export DB_HOST=127.0.0.1
export DB_USER=hwm
export DB_PASSWORD=hwm
export DB_NAME=hwm
export DB_PORT=3306

export LOGIN_RATE_LIMIT_WINDOW=300
export LOGIN_RATE_LIMIT_MAX=10
export VERIFY_RATE_LIMIT_WINDOW=3600
export VERIFY_RATE_LIMIT_MAX=5
export PASSWORD_RESET_REQUEST_WINDOW=3600
export PASSWORD_RESET_REQUEST_MAX=5
export PASSWORD_RESET_VERIFY_WINDOW=3600
export PASSWORD_RESET_VERIFY_MAX=10
export PASSWORD_RESET_CODE_LIFETIME_SECONDS=900
```

Zusätzlich muss der Sitzungs-Secret-Schlüssel als Datei bereitstehen:

```bash
sudo mkdir -p /etc/secrets
echo "dev-session-secret" | sudo tee /etc/secrets/hwm-session-secret > /dev/null
```

### Anwendung starten

Für lokale Tests kann das Flask-Backend direkt ausgeführt werden:

```bash
export FLASK_APP=backend.app
flask run --host=0.0.0.0 --port=5000 --debug
```

Alternativ lässt sich der Produktions-Stack über Gunicorn starten:

```bash
gunicorn --chdir backend app:app
```

Das Backend liefert die statischen Sprachversionen aus den Verzeichnissen `de/`, `en/`, `fr/` und `it/`. Während der Entwicklung können Änderungen an HTML/JS-Dateien ohne erneuten Build getestet werden.

## Tests & Qualitätssicherung

Unit- und Integrationstests befinden sich im Verzeichnis `backend/tests`. Nach Aktivierung der virtuellen Umgebung lassen sich alle Tests mit `pytest` ausführen:

```bash
pytest backend/tests
```

Das Test-Setup mockt notwendige Secrets (z. B. `hwm-session-secret`) und stellt Dummy-Datenbanken bereit, sodass keine externe Infrastruktur benötigt wird.

### Manuelle QA (Passwort-Reset-Flow)

1. Öffne eine beliebige Sprachversion (`de/login.html`, `en/login.html`, `fr/login.html`, `it/login.html`) und starte den Login-Overlay.
2. Gib eine gültige oder dummy E-Mail-Adresse ein und klicke auf **„Password vergessen?“** / entsprechende Übersetzung. Prüfe, dass eine Erfolgsmeldung erscheint und der Overlay in den neuen Reset-Modus mit Code- und Passwortfeldern wechselt.
3. Teste den **„Reset-Code anfordern“**-Link innerhalb des Reset-Modus erneut; der Status sollte aktualisiert werden, ohne den Modus zu verlassen.
4. Validiere die Eingaben:
   * Leere Code-Eingabe → entsprechende Fehlermeldung.
   * Passwort kürzer als 8 Zeichen → Fehlermeldung zur Mindestlänge.
   * Abweichende Bestätigung → Fehlermeldung zur Übereinstimmung.
5. Gib einen Beispielcode (z. B. `123456`) und zwei identische Passwörter ein und bestätige. Da das Backend eventuell keinen echten Code akzeptiert, erwarte eine Fehlermeldung „Code ungültig“; bei echter Umgebung sollte eine Erfolgsmeldung erscheinen und der Overlay zurück in den Login-Modus wechseln.
6. Überprüfe, dass nach einer erfolgreichen oder simulierten Bestätigung die Login-Eingaben wieder sichtbar sind und die E-Mail erhalten bleibt, sodass ein erneuter Login möglich ist.

## Stundenplan-Import

Der CLI-Befehl [`backend/scripts/import_schedule.py`](../backend/scripts/import_schedule.py) importiert `stundenplan-<klasse>.json`-Dateien in die Tabelle `stundenplan_entries` der neuen Datenstruktur.

```bash
python backend/scripts/import_schedule.py path/zur/stundenplan-5a.json
```

Optional lässt sich die Zielklasse mit `--class <slug|id>` überschreiben sowie die Herkunftsangabe in `class_schedules.source` via `--source` setzen. Die Datenbank-Verbindung wird über die Umgebungsvariablen `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` und `DB_PORT` (Fallback: aktuelle Produktionswerte) konfiguriert.

### JSON-Format

Das Stundenplan-JSON ist ein Objekt mit Wochentags-Schlüsseln. Jeder Wochentag enthält eine Liste von Slots mit Start-/Endzeit, Fachbezeichnung und optionalem Raum.

```json
{
  "Monday": [
    {"start": "08:00", "end": "08:45", "fach": "Mathematik", "raum": "101"},
    {"start": "08:45", "end": "08:50", "fach": "Pause", "raum": "-"}
  ],
  "Tuesday": []
}
```

* Zeiten werden als Strings im Format `HH:MM` erwartet.
* `fach` ist verpflichtend, `raum` wird bei leeren Angaben automatisch zu `"-"` normalisiert.
* Nicht definierte Tage dürfen ausgelassen werden; sie werden intern als leere Listen behandelt.

Der Import löscht bestehende Einträge der Klasse und schreibt die neuen Werte inklusive Metadaten-Hash (`import_hash`) in `class_schedules`.

## Deployment & Test-Instanz

Neue Umgebungsvariablen steuern die Ratenbegrenzung der Login- und Verifikations-Endpunkte:

| Variable | Standardwert | Beschreibung |
| --- | --- | --- |
| `LOGIN_RATE_LIMIT_WINDOW` | `300` Sekunden | Zeitraum, in dem fehlgeschlagene Login-Versuche gezählt werden. |
| `LOGIN_RATE_LIMIT_MAX` | `10` Versuche | Maximal erlaubte Versuche pro IP im Fenster. |
| `VERIFY_RATE_LIMIT_WINDOW` | `3600` Sekunden | Zeitraum für `/api/auth/verify` Anfragen. |
| `VERIFY_RATE_LIMIT_MAX` | `5` Versuche | Maximal erlaubte Verifikationsversuche pro IP im Fenster. |
| `PASSWORD_RESET_REQUEST_WINDOW` | `3600` Sekunden | Zeitraum, in dem Anfragen zur Code-Erstellung pro Identität gezählt werden. |
| `PASSWORD_RESET_REQUEST_MAX` | `5` Versuche | Maximale Anzahl an Code-Anforderungen pro IP/E-Mail im Fenster. |
| `PASSWORD_RESET_VERIFY_WINDOW` | `3600` Sekunden | Zeitraum für Code-Einlösungen beim Passwort-Reset. |
| `PASSWORD_RESET_VERIFY_MAX` | `10` Versuche | Maximale Anzahl Code-Prüfungen pro IP/E-Mail im Fenster. |
| `PASSWORD_RESET_CODE_LIFETIME_SECONDS` | `900` Sekunden | Gültigkeitsdauer eines generierten Reset-Codes. |
| `PASSWORD_RESET_CODE_LENGTH` | `8` Ziffern | Länge des generierten Reset-Codes. |
| `PASSWORD_RESET_SUBJECT` | `Passwort zurücksetzen` | Betreffzeile der Reset-E-Mail. |

Die Standard-URL für E-Mail-Verifikationen orientiert sich jetzt am Beta-System. Über die Variable `PRIMARY_TEST_BASE_URL` (Standard: `https://hwm-beta.akzuwo.ch`) lässt sich die Basis anpassen; sie definiert zugleich `EMAIL_VERIFICATION_LINK_BASE`, sofern letzteres nicht explizit gesetzt wird.

Bei Deployments sollte die Beta-Instanz als primärer Testlauf genutzt werden; ein Fallback ist nicht mehr nötig.

## Support & Rückmeldungen

Technische Rückfragen, Bugreports und allgemeine Hinweise laufen zentral über [support@akzuwo.ch](mailto:support@akzuwo.ch). Bitte gib bei Produktionsvorfällen die betroffene Instanz und einen Zeitstempel an, damit Logs zielgerichtet ausgewertet werden können.

## Internationalisierung & Inhalte

Die statischen Seiten (z. B. `de/index.html`, `fr/login.html`) werden direkt vom Backend ausgeliefert. Sprachspezifische Anpassungen erfolgen in den jeweiligen Ordnern. Übersetzungen für dynamische Inhalte der modernen Oberfläche liegen in `frontend/locales/` als JSON-Dateien. Neue Sprachen werden hinzugefügt, indem sowohl ein Sprachordner mit HTML/JS-Dateien als auch ein Übersetzungspaket angelegt und im Backend registriert wird.
