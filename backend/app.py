import os
import json
import datetime
import re
import time
import smtplib
from email.message import EmailMessage

from ics import Calendar, Event
import pytz
from flask import Flask, jsonify, request, session, make_response, send_from_directory, Response
from flask_cors import CORS
from mysql.connector import pooling

# ---------- APP INITIALISIEREN ----------
app = Flask(__name__, static_url_path="/")

# Session‐Cookies auch cross‐site erlauben
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True
)

# Secrets laden
with open('/etc/secrets/hwm-session-secret', encoding='utf-8') as f:
    app.secret_key = f.read().strip()
with open('/etc/secrets/hwm-pw', encoding='utf-8') as f:
    ADMIN_PASSWORD = f.read().strip()

# ---------- CORS ----------
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": [
        "https://*.homework-manager.pages.dev",
        "https://homework-manager.akzuwo.ch",
        "https://hw-manager.akzuwo.ch",
        "https://hwm-beta.akzuwo.ch"
    ]}},
    methods=["GET","HEAD","POST","OPTIONS","PUT","DELETE"],
    allow_headers=["Content-Type","X-Role"]
)
# ---------- DATABASE POOL ----------
DB_CONFIG = {
    "host":     "mc-mysql01.mc-host24.de",
    "user":     "u4203_Mtc42FNhxN",
    "password": "nA6U=8ecQBe@vli@SKXN9rK9",
    "database": "s4203_reports",
    "port":     3306
}
pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, pool_reset_session=True, **DB_CONFIG)
def get_connection():
    return pool.get_connection()


CONTACT_MAX_FILE_SIZE = int(os.getenv('CONTACT_MAX_FILE_SIZE', 2 * 1024 * 1024))
CONTACT_RATE_LIMIT = {}
CONTACT_RATE_LIMIT_WINDOW = int(os.getenv('CONTACT_RATE_LIMIT_WINDOW', 3600))
CONTACT_RATE_LIMIT_MAX = int(os.getenv('CONTACT_RATE_LIMIT_MAX', 5))
CONTACT_MIN_DURATION_MS = int(os.getenv('CONTACT_MIN_DURATION_MS', 3000))
CONTACT_MIN_MESSAGE_LENGTH = int(os.getenv('CONTACT_MIN_MESSAGE_LENGTH', 20))
CONTACT_SMTP_HOST = os.getenv('CONTACT_SMTP_HOST')
CONTACT_SMTP_PORT = int(os.getenv('CONTACT_SMTP_PORT', 587))
CONTACT_SMTP_USER = os.getenv('CONTACT_SMTP_USER')
CONTACT_SMTP_PASSWORD = os.getenv('CONTACT_SMTP_PASSWORD')
CONTACT_RECIPIENT = os.getenv('CONTACT_RECIPIENT') or CONTACT_SMTP_USER
CONTACT_FROM_ADDRESS = os.getenv('CONTACT_FROM_ADDRESS', CONTACT_SMTP_USER or CONTACT_RECIPIENT)
CONTACT_EMAIL_REGEX = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def _check_contact_rate_limit(ip_address: str) -> bool:
    now = time.time()
    entry = CONTACT_RATE_LIMIT.get(ip_address)
    if entry and now < entry['reset']:
        entry['count'] += 1
    else:
        entry = {'count': 1, 'reset': now + CONTACT_RATE_LIMIT_WINDOW}
        CONTACT_RATE_LIMIT[ip_address] = entry
    return entry['count'] <= CONTACT_RATE_LIMIT_MAX


def _send_contact_email(name: str, email_address: str, subject: str, body: str, attachment=None) -> None:
    if not CONTACT_SMTP_HOST or not CONTACT_RECIPIENT:
        raise RuntimeError('Contact email is not configured')

    message = EmailMessage()
    final_subject = subject.strip() or 'Kontaktanfrage'
    message['Subject'] = f"[Homework Manager] {final_subject}"
    sender = CONTACT_FROM_ADDRESS or email_address
    if sender:
        message['From'] = sender
    message['To'] = CONTACT_RECIPIENT
    if email_address:
        message['Reply-To'] = email_address

    message.set_content(body)

    if attachment:
        file_data, filename, content_type = attachment
        if file_data:
            maintype, subtype = (content_type or 'application/octet-stream').split('/', 1)
            message.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=filename)

    if CONTACT_SMTP_PORT == 465:
        server = smtplib.SMTP_SSL(CONTACT_SMTP_HOST, CONTACT_SMTP_PORT, timeout=10)
    else:
        server = smtplib.SMTP(CONTACT_SMTP_HOST, CONTACT_SMTP_PORT, timeout=10)
        server.starttls()

    if CONTACT_SMTP_USER and CONTACT_SMTP_PASSWORD:
        server.login(CONTACT_SMTP_USER, CONTACT_SMTP_PASSWORD)

    server.send_message(message)
    server.quit()


# Tabelle für den Stundenplan sicherstellen
def ensure_stundenplan_table():
    try:
        conn = get_connection()
    except Exception:
        return
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS stundenplan_entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tag VARCHAR(10) NOT NULL,
            start VARCHAR(5) NOT NULL,
            end VARCHAR(5) NOT NULL,
            fach VARCHAR(100) NOT NULL,
            raum VARCHAR(50) NOT NULL
        )
        """
    )
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM stundenplan_entries")
    if cur.fetchone()[0] == 0:
        path = os.path.join(os.path.dirname(__file__), "stundenplan.json")
        with open(path, encoding='utf-8') as f:
            plan = json.load(f)
        for tag, eintraege in plan.items():
            for e in eintraege:
                cur.execute(
                    "INSERT INTO stundenplan_entries (tag,start,end,fach,raum) VALUES (%s,%s,%s,%s,%s)",
                    (tag, e["start"], e["end"], e["fach"], e.get("raum", "-"))
                )
        conn.commit()
    cur.close()
    conn.close()


# Tabelle für allgemeine Einträge sicherstellen
def ensure_entries_table():
    try:
        conn = get_connection()
    except Exception:
        return
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS eintraege (
            id INT AUTO_INCREMENT PRIMARY KEY,
            beschreibung TEXT NOT NULL,
            datum DATE NOT NULL,
            startzeit TIME NULL,
            endzeit TIME NULL,
            typ ENUM('hausaufgabe','pruefung','event') NOT NULL,
            fach VARCHAR(100) NOT NULL DEFAULT ''
        )
        """
    )
    conn.commit()
    cur.execute("SHOW COLUMNS FROM eintraege LIKE 'fach'")
    if cur.fetchone() is None:
        cur.execute(
            "ALTER TABLE eintraege ADD COLUMN fach VARCHAR(100) NOT NULL DEFAULT '' AFTER typ"
        )
        conn.commit()
    cur.close()
    conn.close()


ensure_stundenplan_table()
ensure_entries_table()

# Hilfsfunktion für die Formatierung von Zeitwerten aus MySQL
def _format_time_value(value):
    if value is None:
        return None
    if isinstance(value, datetime.timedelta):
        total_seconds = int(value.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    if isinstance(value, datetime.datetime):
        return value.time().strftime('%H:%M:%S')
    if isinstance(value, datetime.time):
        return value.strftime('%H:%M:%S')
    if isinstance(value, str):
        return value
    return str(value)

# ---------- ROUTES ----------

@app.route("/")
def root():
    return send_from_directory(app.static_folder, "login.html")

@app.route('/calendar.ics')
def export_ics():
    """Erzeugt eine iCalendar-Datei mit allen zukünftigen Einträgen."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id, typ, beschreibung, datum, fach
        FROM eintraege
        WHERE datum >= CURDATE()
        ORDER BY datum ASC
        """
    )
    entries = cursor.fetchall()
    cursor.close()
    conn.close()

    cal = Calendar()
    for e in entries:
        due = e['datum']
        ev = Event()
        subject = e.get('fach', '').strip()
        typ_label = e['typ'].capitalize()
        title_parts = [typ_label]
        if subject:
            title_parts.append(subject)
        ev.name = " - ".join(title_parts)
        ev.description = e['beschreibung']
        ev.begin = due
        ev.make_all_day()
        ev.uid = f"eintrag-{e['id']}@homework-manager.akzuwo.ch"
        cal.events.add(ev)

    ics_text = str(cal)
    return Response(
        ics_text,
        mimetype='text/calendar',
        headers={'Content-Disposition': 'attachment; filename="homework.ics"'}
    )

@app.route('/entries')
def entries():
    """Gibt alle Einträge zurück."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, beschreibung, datum, startzeit, endzeit, typ, fach FROM eintraege"
    )
    rows = cursor.fetchall()
    for r in rows:
        r['datum'] = r['datum'].strftime('%Y-%m-%d')
        r['startzeit'] = _format_time_value(r.get('startzeit'))
        r['endzeit'] = _format_time_value(r.get('endzeit'))
    cursor.close()
    conn.close()
    return jsonify(rows)


@app.route('/api/contact', methods=['POST'])
def submit_contact():
    form = request.form
    honeypot = form.get('hm_contact_website')
    if honeypot:
        return jsonify({'status': 'ok'}), 200

    name = (form.get('name') or '').strip()
    email_address = (form.get('email') or '').strip()
    subject = (form.get('subject') or '').strip()
    message_text = (form.get('message') or '').strip()
    consent_given = form.get('consent') in ('true', 'on', '1')
    started_raw = form.get('hm-contact-start')

    errors = {}

    if not name:
        errors['name'] = 'required'
    if not email_address or not CONTACT_EMAIL_REGEX.match(email_address):
        errors['email'] = 'invalid'
    if not subject:
        errors['subject'] = 'required'
    if len(message_text) < CONTACT_MIN_MESSAGE_LENGTH:
        errors['message'] = 'too_short'
    if not consent_given:
        errors['consent'] = 'required'

    try:
        started_ms = int(started_raw) if started_raw else 0
    except ValueError:
        started_ms = 0

    if started_ms:
        elapsed = (time.time() * 1000) - started_ms
        if elapsed < CONTACT_MIN_DURATION_MS:
            errors['general'] = 'too_fast'

    attachment_tuple = None
    uploaded_file = request.files.get('attachment')
    if uploaded_file and uploaded_file.filename:
        try:
            uploaded_file.stream.seek(0, os.SEEK_END)
            size = uploaded_file.stream.tell()
            uploaded_file.stream.seek(0)
        except Exception:
            size = None
        if size and size > CONTACT_MAX_FILE_SIZE:
            return jsonify({'message': 'attachment_too_large'}), 413
        file_data = uploaded_file.read()
        if file_data and len(file_data) > CONTACT_MAX_FILE_SIZE:
            return jsonify({'message': 'attachment_too_large'}), 413
        if file_data:
            attachment_tuple = (file_data, uploaded_file.filename, uploaded_file.mimetype)

    if errors:
        return jsonify({'message': 'invalid', 'errors': errors}), 400

    if not (CONTACT_SMTP_HOST and CONTACT_RECIPIENT):
        return jsonify({'message': 'unavailable'}), 503

    forwarded_for = request.headers.get('X-Forwarded-For', '')
    ip_address = (forwarded_for.split(',')[0].strip() if forwarded_for else request.remote_addr) or 'unknown'

    if not _check_contact_rate_limit(ip_address):
        return jsonify({'message': 'rate_limited'}), 429

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    body = (
        f"Name: {name}\n"
        f"E-Mail: {email_address}\n"
        f"Betreff: {subject or '-'}\n"
        f"Einwilligung: {'ja' if consent_given else 'nein'}\n"
        f"IP-Adresse: {ip_address}\n"
        f"Zeitstempel: {timestamp}\n\n"
        f"Nachricht:\n{message_text.strip()}\n"
    )

    try:
        _send_contact_email(name, email_address, subject, body, attachment_tuple)
    except Exception as exc:
        app.logger.exception('Fehler beim Versenden der Kontaktanfrage: %s', exc)
        return jsonify({'message': 'send_failed'}), 502

    return jsonify({'status': 'ok'}), 200

# --- LOGIN / LOGOUT ---
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json or {}
    if data.get('password') == ADMIN_PASSWORD:
        session['role'] = 'admin'
        return jsonify(status='ok')
    return jsonify(status='error', message='Ungültiges Passwort'), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify(status='ok')

@app.route('/api/secure-data')
def secure_data():
    if session.get('role') != 'admin':
        return jsonify(status='error', message='Unauthorized'), 403
    return jsonify(status='ok', data='Hier sind geheime Daten!')

# --- UPDATE ENTRY ---
@app.route('/update_entry', methods=['OPTIONS', 'PUT'])
def update_entry():
    if request.method == 'OPTIONS':
        return _cors_preflight()
    if request.headers.get('X-Role') != 'admin':
        return jsonify(status='error', message='Forbidden'), 403

    data = request.json or {}
    id = data.get('id')
    desc = (data.get('description') or '').strip()
    date = data.get('date')
    start = data.get('startzeit') or None
    end = data.get('endzeit') or None
    typ = data.get('type')
    fach = (data.get('fach') or '').strip()

    if start:
        start = start.strip()
        if len(start) == 5:
            start = f"{start}:00"
        start = start[:8]
    if end:
        end = end.strip()
        if len(end) == 5:
            end = f"{end}:00"
        end = end[:8]

    if typ != 'event' and not fach:
        return jsonify(status='error', message='fach ist für diesen Typ erforderlich'), 400
    if typ == 'event' and not fach:
        fach = ''

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE eintraege SET beschreibung=%s, datum=%s, startzeit=%s, endzeit=%s, typ=%s, fach=%s WHERE id=%s",
            (desc, date, start, end, typ, fach, id)
        )
        conn.commit()
        return jsonify(status='ok')
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500
    finally:
        cur.close()
        conn.close()

# --- DELETE ENTRY ---
@app.route('/delete_entry/<int:id>', methods=['DELETE', 'OPTIONS'])
def delete_entry(id):
    # Auth per Header statt Session-Cookie
    if request.method == 'OPTIONS':
        return _cors_preflight()
    if request.headers.get('X-Role') != 'admin':
        return jsonify(status='error', message='Forbidden'), 403

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM eintraege WHERE id=%s", (id,))
        conn.commit()
        return jsonify(status='ok')
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500
    finally:
        cur.close()
        conn.close()

# CORS‐Preflight‐Helper
def _cors_preflight():
    resp = make_response()
    resp.headers.update({
        'Access-Control-Allow-Origin':  request.headers.get('Origin', '*'),
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true'
    })
    return resp, 200

# --- STUNDENPLAN / AKTUELLES_FACH ---
@app.route('/stundenplan')
def stundenplan():
    path = os.path.join(os.path.dirname(__file__), "stundenplan.json")
    with open(path, encoding='utf-8') as f:
        return jsonify(json.load(f))

@app.route('/aktuelles_fach')
def aktuelles_fach():
    tz = pytz.timezone('Europe/Berlin')
    now = datetime.datetime.now(tz)
    tag = now.strftime('%A')
    path = os.path.join(os.path.dirname(__file__), "stundenplan.json")
    with open(path, encoding='utf-8') as f:
        plan = json.load(f).get(tag, [])

    current  = {
        "fach": "Frei",
        "verbleibend": "-",
        "raum": "-",
        "start": None,
        "ende": None,
        "verbleibende_sekunden": 0,
        "gesamt_sekunden": 0,
    }
    next_cls = {"start":None,"fach":"-","raum":"-"}
    def parse_time(t):
        h,m = map(int,t.split(':'))
        return now.replace(hour=h,minute=m,second=0,microsecond=0)

    for slot in plan:
        start = parse_time(slot["start"])
        ende  = parse_time(slot["end"])
        if start <= now <= ende:
            gesamt = int((ende - start).total_seconds())
            verbleibend = max(int((ende - now).total_seconds()), 0)
            m, s = divmod(verbleibend, 60)
            current = {
                "fach": slot["fach"],
                "verbleibend": f"{m:02d}:{s:02d}",
                "raum": slot.get("raum", "-"),
                "start": start.strftime("%H:%M"),
                "ende": ende.strftime("%H:%M"),
                "verbleibende_sekunden": verbleibend,
                "gesamt_sekunden": gesamt,
            }
        elif start>now and slot.get("raum","-")!="-":
            if next_cls["start"] is None or start<next_cls["start"]:
                next_cls={"start":start,"fach":slot["fach"],"raum":slot["raum"]}

    next_start = f"{next_cls['start'].hour:02d}:{next_cls['start'].minute:02d}" if next_cls["start"] else "-"
    response = {
        **current,
        "naechste_start": next_start,
        "naechster_raum": next_cls["raum"],
        "naechstes_fach": next_cls["fach"],
    }
    if next_cls["start"]:
        response["naechste_start_iso"] = next_cls["start"].isoformat()
    return jsonify(response)


@app.route('/tagesuebersicht')
def tagesuebersicht():
    tz = pytz.timezone('Europe/Berlin')
    now = datetime.datetime.now(tz)
    heute = now.strftime('%A')
    morgen = (now + datetime.timedelta(days=1)).strftime('%A')
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT start, end, fach, raum FROM stundenplan_entries WHERE tag=%s ORDER BY start",
        (heute,)
    )
    heute_rows = cur.fetchall()
    cur.execute(
        "SELECT start, end, fach, raum FROM stundenplan_entries WHERE tag=%s ORDER BY start",
        (morgen,)
    )
    morgen_rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify({heute: heute_rows, morgen: morgen_rows})

# --- EINTRAG HINZUFÜGEN ---
@app.route('/add_entry', methods=['POST'])
def add_entry():
    data = request.json or {}
    beschreibung = (data.get("beschreibung") or '').strip()
    datum = data.get("datum")
    startzeit = data.get("startzeit")
    endzeit = data.get("endzeit")
    typ = data.get("typ")
    fach = (data.get("fach") or '').strip()

    if datum and 'T' in datum:
        date_part, time_part = datum.split('T', 1)
        if not startzeit:
            startzeit = time_part or None
        datum = date_part

    if startzeit == '':
        startzeit = None
    if endzeit == '':
        endzeit = None

    if startzeit:
        startzeit = startzeit.strip()
        if len(startzeit) == 5:
            startzeit = f"{startzeit}:00"
        startzeit = startzeit[:8]
    if endzeit:
        endzeit = endzeit.strip()
        if len(endzeit) == 5:
            endzeit = f"{endzeit}:00"
        endzeit = endzeit[:8]

    if not typ or not datum:
        return jsonify(status="error", message="typ und datum sind erforderlich"), 400
    if typ != 'event' and not fach:
        return jsonify(status="error", message="fach ist für diesen Typ erforderlich"), 400
    if typ == 'event' and not fach:
        fach = ''

    conn = get_connection(); cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO eintraege (beschreibung, datum, startzeit, endzeit, typ, fach) VALUES (%s,%s,%s,%s,%s,%s)",
            (beschreibung, datum, startzeit, endzeit, typ, fach)
        )
        conn.commit()
        return jsonify(status="ok")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500
    finally:
        cur.close(); conn.close()
        
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin']  = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,X-Role'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# ---------- SERVER START ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)


