import os
import json
import datetime
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
        "https://hw-manager.akzuwo.ch"
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


# Tabelle für Events sicherstellen
def ensure_events_table():
    try:
        conn = get_connection()
    except Exception:
        return
    cur = conn.cursor()
    cur.execute("SHOW TABLES LIKE 'events'")
    if cur.fetchone() is None:
        cur.execute(
            """
            CREATE TABLE events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titel VARCHAR(255) NOT NULL,
                beschreibung TEXT,
                startzeit DATETIME NOT NULL
            )
            """
        )
        conn.commit()
        print("Created table 'events'")
    cur.close()
    conn.close()


ensure_stundenplan_table()
ensure_events_table()

# ---------- ROUTES ----------

@app.route("/")
def root():
    return send_from_directory(app.static_folder, "login.html")

@app.route('/calendar.ics')
def export_ics():
    """Erzeugt eine iCalendar-Datei mit allen zukünftigen Hausaufgaben,
    Prüfungen und Events."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id, typ, fach, beschreibung, datum FROM (
            SELECT id, 'hausaufgabe' AS typ, fachkuerzel AS fach, beschreibung, faellig_am AS datum
            FROM hausaufgaben
            UNION ALL
            SELECT id, 'pruefung' AS typ, fachkuerzel AS fach, beschreibung, pruefungsdatum AS datum
            FROM pruefungen
            UNION ALL
            SELECT id, 'event' AS typ, titel AS fach, beschreibung, startzeit AS datum
            FROM events
        ) AS zusammen
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
        ev.name = f"{e['typ'].capitalize()}: {e['fach']}"
        ev.description = e['beschreibung']
        ev.begin = due.date()
        ev.make_all_day()
        ev.uid = f"aufgabe-{e['id']}@homework-manager.akzuwo.ch"
        cal.events.add(ev)

    ics_text = str(cal)
    return Response(
        ics_text,
        mimetype='text/calendar',
        headers={'Content-Disposition': 'attachment; filename="homework.ics"'}
    )

@app.route('/events')
def events():
    """Gibt alle Events zurück."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, titel, beschreibung, DATE(startzeit) AS startzeit FROM events"
    )
    rows = cursor.fetchall()
    for r in rows:
        r['startzeit'] = r['startzeit'].strftime('%Y-%m-%d')
    cursor.close()
    conn.close()
    return jsonify(rows)

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

    data       = request.json or {}
    entry_type = data.get('type')
    id         = data.get('id')
    fach       = data.get('fach')
    date       = data.get('date')
    desc       = data.get('description')

    conn = get_connection()
    cur  = conn.cursor()
    try:
        if entry_type == 'hausaufgabe':
            cur.execute(
                "UPDATE hausaufgaben SET fachkuerzel=%s, beschreibung=%s, faellig_am=%s WHERE id=%s",
                (fach, desc, date, id)
            )
        elif entry_type == 'pruefung':
            cur.execute(
                "UPDATE pruefungen SET fachkuerzel=%s, beschreibung=%s, pruefungsdatum=%s WHERE id=%s",
                (fach, desc, date, id)
            )
        else:
            return jsonify(status='error', message='Ungültiger Typ'), 400
        conn.commit()
        return jsonify(status='ok')
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500
    finally:
        cur.close()
        conn.close()

# --- DELETE ENTRY ---
@app.route('/delete_entry/<entry_type>/<int:id>', methods=['DELETE', 'OPTIONS'])
def delete_entry(entry_type, id):
    # Auth per Header statt Session-Cookie
    if request.method == 'OPTIONS':
        return _cors_preflight()
    if request.headers.get('X-Role') != 'admin':
        return jsonify(status='error', message='Forbidden'), 403

    conn = get_connection()
    cur  = conn.cursor()
    try:
        if entry_type == 'hausaufgabe':
            cur.execute("DELETE FROM hausaufgaben WHERE id=%s", (id,))
        elif entry_type == 'pruefung':
            cur.execute("DELETE FROM pruefungen WHERE id=%s", (id,))
        else:
            return jsonify(status='error', message='Ungültiger Typ'), 400

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

    current  = {"fach":"Frei","verbleibend":"-","raum":"-"}
    next_cls = {"start":None,"fach":"-","raum":"-"}
    def parse_time(t):
        h,m = map(int,t.split(':'))
        return now.replace(hour=h,minute=m,second=0,microsecond=0)

    for slot in plan:
        start = parse_time(slot["start"])
        ende  = parse_time(slot["end"])
        if start <= now <= ende:
            delta = int((ende-now).total_seconds())
            m,s = divmod(delta,60)
            current = {"fach":slot["fach"],"verbleibend":f"{m:02d}:{s:02d}","raum":slot.get("raum","-")}
        elif start>now and slot.get("raum","-")!="-":
            if next_cls["start"] is None or start<next_cls["start"]:
                next_cls={"start":start,"fach":slot["fach"],"raum":slot["raum"]}

    next_start = f"{next_cls['start'].hour:02d}:{next_cls['start'].minute:02d}" if next_cls["start"] else "-"
    return jsonify({**current,"naechste_start":next_start,"naechster_raum":next_cls["raum"],"naechstes_fach":next_cls["fach"]})


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

# --- HAUSAUFGABEN / PRÜFUNGEN ---
@app.route('/hausaufgaben')
def hausaufgaben():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, fachkuerzel AS fach, beschreibung, DATE(faellig_am) AS faellig_am "
        "FROM hausaufgaben"
    )
    rows = cursor.fetchall()
    for r in rows:
        r['faellig_am'] = r['faellig_am'].strftime('%Y-%m-%d')
    cursor.close(); conn.close()
    return jsonify(rows)

@app.route('/pruefungen')
def pruefungen():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, fachkuerzel AS fach, beschreibung, DATE(pruefungsdatum) AS pruefungsdatum "
        "FROM pruefungen"
    )
    rows = cursor.fetchall()
    for r in rows:
        r['pruefungsdatum'] = r['pruefungsdatum'].strftime('%Y-%m-%d')
    cursor.close(); conn.close()
    return jsonify(rows)

# --- EINTRAG HINZUFÜGEN ---
@app.route('/add_entry', methods=['POST'])
def add_entry():
    data = request.json or {}
    typ = data.get("typ"); fach = data.get("fach")
    beschreibung = data.get("beschreibung"); datum = data.get("datum")
    conn = get_connection(); cur = conn.cursor()
    try:
        if typ=="hausaufgabe":
            cur.execute(
                "INSERT INTO hausaufgaben (fachkuerzel,beschreibung,faellig_am) VALUES (%s,%s,%s)",
                (fach,beschreibung,datum)
            )
        elif typ=="pruefung":
            cur.execute(
                "INSERT INTO pruefungen (fachkuerzel,beschreibung,pruefungsdatum) VALUES (%s,%s,%s)",
                (fach,beschreibung,datum)
            )
        else:
            return jsonify(status="error",message="Ungültiger Typ"),400
        conn.commit()
        return jsonify(status="ok")
    except Exception as e:
        return jsonify(status="error",message=str(e)),500
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
