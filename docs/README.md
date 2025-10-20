# Dokumentation

## Stundenplan-Import

Der CLI-Befehl [`backend/scripts/import_schedule.py`](../backend/scripts/import_schedule.py) importiert
`stundenplan-<klasse>.json`-Dateien in die Tabelle `stundenplan_entries` der neuen Datenstruktur.

```bash
python backend/scripts/import_schedule.py path/zur/stundenplan-5a.json
```

Optional lässt sich die Zielklasse mit `--class <slug|id>` überschreiben sowie die Herkunftsangabe in
`class_schedules.source` via `--source` setzen. Die Datenbank-Verbindung wird über die Umgebungsvariablen
`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` und `DB_PORT` (Fallback: aktuelle Produktionswerte) konfiguriert.

### JSON-Format

Das Stundenplan-JSON ist ein Objekt mit Wochentags-Schlüsseln. Jeder Wochentag enthält eine Liste von Slots mit
Start-/Endzeit, Fachbezeichnung und optionalem Raum.

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

Der Import löscht bestehende Einträge der Klasse und schreibt die neuen Werte inklusive Metadaten-Hash (`import_hash`) in
`class_schedules`.

## Deployment & Test-Instanz

Neue Umgebungsvariablen steuern die Ratenbegrenzung der Login- und Verifikations-Endpunkte:

| Variable | Standardwert | Beschreibung |
| --- | --- | --- |
| `LOGIN_RATE_LIMIT_WINDOW` | `300` Sekunden | Zeitraum, in dem fehlgeschlagene Login-Versuche gezählt werden. |
| `LOGIN_RATE_LIMIT_MAX` | `10` Versuche | Maximal erlaubte Versuche pro IP im Fenster. |
| `VERIFY_RATE_LIMIT_WINDOW` | `3600` Sekunden | Zeitraum für `/api/auth/verify` Anfragen. |
| `VERIFY_RATE_LIMIT_MAX` | `5` Versuche | Maximal erlaubte Verifikationsversuche pro IP im Fenster. |

Die Standard-URL für E-Mail-Verifikationen orientiert sich jetzt am Beta-System. Über die Variable
`PRIMARY_TEST_BASE_URL` (Standard: `https://hwm-beta.akzuwo.ch`) lässt sich die Basis anpassen; sie definiert zugleich
`EMAIL_VERIFICATION_LINK_BASE`, sofern letzteres nicht explizit gesetzt wird.

Bei Deployments sollte die Beta-Instanz als primärer Testlauf genutzt werden; ein Fallback ist nicht mehr nötig.

## Produktivbetrieb: SMTP-Konfiguration und Neustart

Für den Versand von Nachrichten aus dem Kontaktformular benötigt `backend/app.py` gültige SMTP-Zugangsdaten.
In der produktiven `.env`-Datei (oder dem entsprechenden Secret des Deployments) müssen daher folgende Variablen
gesetzt sein:

```
CONTACT_SMTP_HOST
CONTACT_SMTP_PORT
CONTACT_SMTP_USER
CONTACT_SMTP_PASSWORD
CONTACT_RECIPIENT
CONTACT_FROM_ADDRESS (optional)
```

Die Datei `backend/.env.production` enthält eine Referenzkonfiguration, die Host, Port, Absender- und
Empfängeradressen sowie das verwendete Konto für den Gmail-Versand vorgibt. Nach Änderungen an diesen Werten muss
der Backend-Dienst neu gestartet werden, damit der Prozess die aktualisierten Variablen übernimmt, z. B. via
`systemctl restart homework-manager-backend.service`.
