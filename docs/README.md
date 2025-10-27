# Dokumentation

## Überblick

Homework Manager 2.0 bündelt Stundenpläne, Hausaufgabenverwaltung, Mitteilungen und Service-Seiten in einer einzigen Plattform. Das Repository enthält den Python-basierten Backend-Dienst, die lokalisierten statischen Frontends sowie Hilfsskripte für Migrationen und Datenimporte. Die Anwendung ist für den Betrieb in einer MySQL-Umgebung optimiert und stellt REST-Endpunkte für die Weboberfläche sowie ein moderiertes Kontaktformular zur Verfügung.

## Neue Funktionen in Version 2.0

* **Überarbeiteter Stundenplan-Importer:** `backend/scripts/import_schedule.py` validiert JSON-Eingaben, erzeugt einen Import-Hash und ersetzt bestehende Einträge inklusive Metadaten. Damit lassen sich mehrere Klassen nacheinander synchronisieren, ohne manuelle Bereinigungsschritte.
* **Feingranulares Rate-Limiting:** Login- und Verifikations-Endpunkte werden durch konfigurierbare Ratenbegrenzung geschützt. Die zugehörigen Umgebungsvariablen (`LOGIN_RATE_LIMIT_*`, `VERIFY_RATE_LIMIT_*`) ermöglichen eine Anpassung je Deployment.
* **Verbesserte SMTP-Integration:** Das Backend versucht automatisch STARTTLS (Port 587) und SMTPS (Port 465). Absender- und Empfängeradressen werden zentral über `config.get_contact_smtp_settings()` verwaltet, wodurch Secrets nicht mehr an mehreren Stellen gepflegt werden müssen.
* **Beta- und Produktions-Workflows:** Die Basis-URL für Verifizierungslinks orientiert sich am Beta-System (`PRIMARY_TEST_BASE_URL`). Fallback-Konfigurationen sind nicht mehr notwendig, Tests erfolgen direkt gegen die Beta-Instanz.
* **Erweiterte Protokollierung:** Rotierende Logfiles (`/tmp/hwm-backend.log` per Default) erleichtern das Debugging und liefern Kontext für Supportanfragen, ohne dass der Dienst neu gestartet werden muss.

## Projektstruktur

| Pfad | Beschreibung |
| --- | --- |
| `backend/` | Flask-Anwendung inklusive Authentifizierung, Kontaktformular, Import-Logik und Tests. |
| `backend/scripts/` | Hilfsskripte wie der Stundenplan-Importer. |
| `backend/migrations/` | SQL-Migrationsskripte für die aktuelle Datenstruktur. |
| `de/`, `en/`, `fr/`, `it/` | Lokalisierte statische Inhalte, die vom Backend ausgeliefert werden. |
| `frontend/locales/` | JSON-Übersetzungen für dynamische Frontend-Komponenten. |
| `docs/` | Projekt- und Betriebshandbücher (diese Datei). |
| `utils/` | Deployment-Helfer und Verwaltungs-Skripte. |

## Lokale Entwicklung

### Voraussetzungen

* Python 3.10 oder neuer
* MySQL 8.x oder eine kompatible MariaDB-Instanz
* Zugriff auf ein SMTP-Konto für Kontaktformular-Tests (optional)

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

export CONTACT_SMTP_HOST=localhost
export CONTACT_SMTP_USER=test@example.com
export CONTACT_SMTP_PASSWORD=secret
export CONTACT_RECIPIENT=admin@example.com
export CONTACT_FROM_ADDRESS=noreply@example.com

export LOGIN_RATE_LIMIT_WINDOW=300
export LOGIN_RATE_LIMIT_MAX=10
export VERIFY_RATE_LIMIT_WINDOW=3600
export VERIFY_RATE_LIMIT_MAX=5
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

Die Standard-URL für E-Mail-Verifikationen orientiert sich jetzt am Beta-System. Über die Variable `PRIMARY_TEST_BASE_URL` (Standard: `https://hwm-beta.akzuwo.ch`) lässt sich die Basis anpassen; sie definiert zugleich `EMAIL_VERIFICATION_LINK_BASE`, sofern letzteres nicht explizit gesetzt wird.

Bei Deployments sollte die Beta-Instanz als primärer Testlauf genutzt werden; ein Fallback ist nicht mehr nötig.

## Produktivbetrieb: SMTP-Konfiguration und Neustart

Für den Versand von Nachrichten aus dem Kontaktformular benötigt `backend/app.py` gültige SMTP-Zugangsdaten. In der produktiven `.env`-Datei (oder dem entsprechenden Secret des Deployments) müssen daher folgende Variablen gesetzt sein:

```
CONTACT_SMTP_HOST
CONTACT_SMTP_USER
CONTACT_SMTP_PASSWORD
CONTACT_RECIPIENT
CONTACT_FROM_ADDRESS (optional)
```

Der Backend-Dienst versucht automatisch die SMTP-Ports 587 (STARTTLS) und 465 (SMTPS); eine separate Port-Variable ist daher nicht mehr erforderlich. Pflegen Sie die produktiven Zugangsdaten zentral in Ihrer Secret-Verwaltung. Nach Änderungen an diesen Werten muss der Backend-Dienst neu gestartet werden, damit der Prozess die aktualisierten Variablen übernimmt, z. B. via `systemctl restart homework-manager-backend.service`.

## Internationalisierung & Inhalte

Die statischen Seiten (z. B. `de/index.html`, `fr/login.html`) werden direkt vom Backend ausgeliefert. Sprachspezifische Anpassungen erfolgen in den jeweiligen Ordnern. Übersetzungen für dynamische Inhalte der modernen Oberfläche liegen in `frontend/locales/` als JSON-Dateien. Neue Sprachen werden hinzugefügt, indem sowohl ein Sprachordner mit HTML/JS-Dateien als auch ein Übersetzungspaket angelegt und im Backend registriert wird.

