async function aktuellesFachLaden() {
    // Lokale Funktion für den Datenabruf
    async function update() {
        try {
            const res  = await fetch('https://homework-manager-2-0-backend.onrender.com/aktuelles_fach');
            const data = await res.json();

            document.getElementById('fachInfo').innerHTML = `
                <h2>Aktuelles Fach: ${data.fach}</h2>
                <p><strong>Verbleibend:</strong> ${data.verbleibend}</p>
                <p><strong>Raum:</strong> ${data.raum}</p>
                <hr>
                <h3>Nächste Stunde</h3>
                <p><strong>Fach:</strong> ${data.naechstes_fach}</p>
                <p><strong>Start:</strong> ${data.naechste_start}</p>
                <p><strong>Raum:</strong> ${data.naechster_raum}</p>
            `;
        } catch (error) {
            console.error('Fehler beim Abrufen des aktuellen Fachs:', error);
            document.getElementById('fachInfo').innerHTML =
                '<p>Fehler beim Laden der Daten.</p>';
        }
    }

    // Vorhandenes Intervall löschen, falls bereits gesetzt
    if (window.fachInterval) {
        clearInterval(window.fachInterval);
    }

    // Einmal direkt laden…
    await update();
    // …und dann jede Sekunde automatisch aktualisieren
    window.fachInterval = setInterval(update, 1000);
}

// Initialaufruf
aktuellesFachLaden();


