import mysql.connector

DB_CONFIG = {
    "host":     "mc-mysql01.mc-host24.de",
    "user":     "u4203_Mtc42FNhxN",
    "password": "nA6U=8ecQBe@vli@SKXN9rK9",
    "database": "s4203_reports",
    "port":     3306
}

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
            typ ENUM('hausaufgabe','pruefung','event') NOT NULL
        )
        """
    )
    conn.commit()

    # Hausaufgaben übertragen
    cur.execute("SELECT beschreibung, faellig_am FROM hausaufgaben")
    for beschreibung, datum in cur.fetchall():
        cur.execute(
            "INSERT INTO eintraege (beschreibung, datum, typ) VALUES (%s,%s,%s)",
            (beschreibung, datum, 'hausaufgabe')
        )

    # Prüfungen übertragen
    cur.execute("SELECT beschreibung, pruefungsdatum FROM pruefungen")
    for beschreibung, datum in cur.fetchall():
        cur.execute(
            "INSERT INTO eintraege (beschreibung, datum, typ) VALUES (%s,%s,%s)",
            (beschreibung, datum, 'pruefung')
        )

    # Events übertragen
    cur.execute("SELECT beschreibung, startzeit FROM events")
    for beschreibung, start in cur.fetchall():
        date = start.date()
        start_time = start.time()
        cur.execute(
            "INSERT INTO eintraege (beschreibung, datum, startzeit, typ) VALUES (%s,%s,%s,%s)",
            (beschreibung, date, start_time, 'event')
        )

    conn.commit()
    cur.close()
    conn.close()
    print("Migration abgeschlossen")

if __name__ == "__main__":
    main()
