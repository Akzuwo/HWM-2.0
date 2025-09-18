async function aktuellesFachLaden() {
    // Local function for data retrieval
    async function update() {
        try {
            const res  = await fetch('https://homework-manager-2-0-backend.onrender.com/aktuelles_fach');
            const data = await res.json();

            document.getElementById('fachInfo').innerHTML = `
                <h2>Current Subject: ${data.fach}</h2>
                <p><strong>Remaining:</strong> ${data.verbleibend}</p>
                <p><strong>Room:</strong> ${data.raum}</p>
                <hr>
                <h3>Next Lesson</h3>
                <p><strong>Subject:</strong> ${data.naechstes_fach}</p>
                <p><strong>Start:</strong> ${data.naechste_start}</p>
                <p><strong>Room:</strong> ${data.naechster_raum}</p>
            `;
        } catch (error) {
            console.error('Error fetching current subject:', error);
            document.getElementById('fachInfo').innerHTML =
                '<p>Error loading data.</p>';
        }
    }

    // Clear existing interval if set
    if (window.fachInterval) {
        clearInterval(window.fachInterval);
    }

    // Load once immediately…
    await update();
    // …and then refresh automatically every 500 ms
    window.fachInterval = setInterval(update, 500);
}

// Initial call
aktuellesFachLaden();


