import mysql.connector

DB_CONFIG = {
    "host":     "mc-mysql01.mc-host24.de",
    "user":     "u4203_Mtc42FNhxN",
    "password": "nA6U=8ecQBe@vli@SKXN9rK9",
    "database": "s4203_reports",
    "port":     3306
}

def column_exists(cursor, table, column):
    cursor.execute(f"SHOW COLUMNS FROM {table} LIKE %s", (column,))
    return cursor.fetchone() is not None


def main():
    conn = mysql.connector.connect(**DB_CONFIG)
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

    default_fach = 'ALLG'

    # Hausaufgaben übertragen
    if column_exists(cur, 'hausaufgaben', 'fachkuerzel'):
        cur.execute("SELECT fachkuerzel, beschreibung, faellig_am FROM hausaufgaben")
        hausaufgaben_rows = cur.fetchall()
        for fach, beschreibung, datum in hausaufgaben_rows:
            cur.execute(
                "INSERT INTO eintraege (beschreibung, datum, typ, fach) VALUES (%s,%s,%s,%s)",
                (beschreibung, datum, 'hausaufgabe', fach or default_fach)
            )
    else:
        cur.execute("SELECT beschreibung, faellig_am FROM hausaufgaben")
        for beschreibung, datum in cur.fetchall():
            cur.execute(
                "INSERT INTO eintraege (beschreibung, datum, typ, fach) VALUES (%s,%s,%s,%s)",
                (beschreibung, datum, 'hausaufgabe', default_fach)
            )

    # Prüfungen übertragen
    if column_exists(cur, 'pruefungen', 'fachkuerzel'):
        cur.execute("SELECT fachkuerzel, beschreibung, pruefungsdatum FROM pruefungen")
        pruefungen_rows = cur.fetchall()
        for fach, beschreibung, datum in pruefungen_rows:
            cur.execute(
                "INSERT INTO eintraege (beschreibung, datum, typ, fach) VALUES (%s,%s,%s,%s)",
                (beschreibung, datum, 'pruefung', fach or default_fach)
            )
    else:
        cur.execute("SELECT beschreibung, pruefungsdatum FROM pruefungen")
        for beschreibung, datum in cur.fetchall():
            cur.execute(
                "INSERT INTO eintraege (beschreibung, datum, typ, fach) VALUES (%s,%s,%s,%s)",
                (beschreibung, datum, 'pruefung', default_fach)
            )

    # Events übertragen
    event_fach_column = None
    for candidate in ('fach', 'fachkuerzel'):
        if column_exists(cur, 'events', candidate):
            event_fach_column = candidate
            break

    if event_fach_column:
        cur.execute(
            f"SELECT {event_fach_column}, beschreibung, startzeit FROM events"
        )
        event_rows = cur.fetchall()
        for fach, beschreibung, start in event_rows:
            date = start.date()
            start_time = start.time()
            cur.execute(
                "INSERT INTO eintraege (beschreibung, datum, startzeit, typ, fach) VALUES (%s,%s,%s,%s,%s)",
                (beschreibung, date, start_time, 'event', fach or default_fach)
            )
    else:
        cur.execute("SELECT beschreibung, startzeit FROM events")
        for beschreibung, start in cur.fetchall():
            date = start.date()
            start_time = start.time()
            cur.execute(
                "INSERT INTO eintraege (beschreibung, datum, startzeit, typ, fach) VALUES (%s,%s,%s,%s,%s)",
                (beschreibung, date, start_time, 'event', default_fach)
            )

    conn.commit()
    cur.close()
    conn.close()
    print("Migration abgeschlossen")

if __name__ == "__main__":
    main()
