async function aktuellesFachLaden() {
    // Funzione locale per il recupero dei dati
    async function update() {
        try {
            const res  = await fetch('https://homework-manager-2-0-backend.onrender.com/aktuelles_fach');
            const data = await res.json();

            document.getElementById('fachInfo').innerHTML = `
                <h2>Materia attuale: ${data.fach}</h2>
                <p><strong>Rimanente:</strong> ${data.verbleibend}</p>
                <p><strong>Aula:</strong> ${data.raum}</p>
                <hr>
                <h3>Lezione successiva</h3>
                <p><strong>Materia:</strong> ${data.naechstes_fach}</p>
                <p><strong>Inizio:</strong> ${data.naechste_start}</p>
                <p><strong>Aula:</strong> ${data.naechster_raum}</p>
            `;
        } catch (error) {
            console.error('Errore durante il recupero della materia attuale:', error);
            document.getElementById('fachInfo').innerHTML =
                '<p>Errore durante il caricamento dei dati.</p>';
        }
    }

    // Cancella l'intervallo esistente se impostato
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


