// LOGIN & SESSION MANAGEMENT
function login() {
    const pw = document.getElementById('passwort').value;
    if (pw === 'l23a-admin') {
        sessionStorage.setItem('role', 'admin');
        window.location.href = 'index.html';
    } else {
        showOverlay('Password errata!');
    }
}

function guestLogin() {
    sessionStorage.setItem('role', 'guest');
    window.location.href = 'index.html';
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function menuButton() {
    const links = document.getElementById('navbarlinks');
    if (links.style.display === 'block') {
        links.style.display = 'none';
    } else {
        links.style.display = 'block';
    }
}

function checkLogin() {
    const role = sessionStorage.getItem('role');
    const isLoginPage = window.location.href.toLowerCase().includes('login');

    // Kein eingeloggter Benutzer → nur weiterleiten, wenn wir nicht bereits auf der Login-Seite sind
    if (!role) {
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
        return;
    }

    // Eingeloggt, aber auf der Login-Seite? Dann direkt zum Dashboard
    if (isLoginPage) {
        window.location.href = 'index.html';
        return;
    }

}

  

  

function clearContent() {
    document.getElementById('content').innerHTML = "";
}

/** KALENDER-FUNKTION **/
async function openCalendar() {
    try {
        clearContent();

        const resHA = await fetch('https://homework-manager-2-0-backend.onrender.com/hausaufgaben');
        const hausaufgaben = await resHA.json();

        const resPR = await fetch('https://homework-manager-2-0-backend.onrender.com/pruefungen');
        const pruefungen = await resPR.json();

        const events = [
            ...hausaufgaben.map(h => ({
                title: `Compito ${h.fach}`,
                start: h.faellig_am,
                color: '#007bff'  // Blau
            })),
            ...pruefungen.map(p => ({
                title: `Esame ${p.fach}`,
                start: p.pruefungsdatum,
                color: '#dc3545'  // Rot
            }))
        ];

        document.getElementById('content').innerHTML = '<div id="calendar"></div>';

        const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: events
        });

        calendar.render();
    } catch (err) {
        console.error('Fehler beim Laden oder Rendern des Kalenders:', err);
    }
}

/** AKTUELLES FACH MIT AUTOMATISCHER AKTUALISIERUNG **/
let fachInterval;

async function loadCurrentSubject() {
  clearContent();
  async function update() {
    const res = await fetch('https://homework-manager-2-0-backend.onrender.com/aktuelles_fach');
    const data = await res.json();
    document.getElementById('content').innerHTML = `
      <h2>Materia attuale: ${data.fach}</h2>
      <h3>Rimanente: ${data.verbleibend}</h3>
      <p><strong>Aula:</strong> ${data.raum}</p>
    `;
  }
  clearInterval(fachInterval);
  await update();
  fachInterval = setInterval(update, 1000);
}

/** EINMALIGE ABFRAGE (ohne Intervall) **/
async function aktuellesFachLaden() {
  const res = await fetch('https://homework-manager-2-0-backend.onrender.com/aktuelles_fach');
  const data = await res.json();
  document.getElementById('fachInfo').innerHTML = `
    <p><strong>Materia:</strong> ${data.fach}</p>
    <p><strong>Termina alle:</strong> ${data.endet || '-'} </p>
    <p><strong>Rimanente:</strong> ${data.verbleibend}</p>
    <p><strong>Aula:</strong> ${data.raum}</p>
  `;
}



/** EINTRAG ERFASSEN MIT DROPDOWN UND DB-ANBINDUNG **/
function closeEntryModal() {
    const overlay = document.getElementById('entry-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function showEntryForm() {
    if (sessionStorage.getItem('role') !== 'admin') {
        showOverlay('Solo l\'admin può creare voci!');
        return;
    }
    const overlay = document.getElementById('entry-modal-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        return;
    }
    clearContent();
    document.getElementById('content').innerHTML = `
        <h2>📝 Crea nuova voce</h2>
        <select id="typ">
            <option value="hausaufgabe">Compito</option>
            <option value="pruefung">Esame</option>
        </select><br>
        <select id="fach">
            ${[
                'MA','DE','EN','PS','SPM-PS','SPM-MA','SPM-ES','SP','WR','GS',
                'GG','IN','IT','FR','BG','MU','BI','Sport','CH','PH','SMU'
            ].map(f => `<option>${f}</option>`).join('')}
        </select><br>
        <input id="beschreibung" placeholder="Descrizione"><br>
        <input type="datetime-local" id="datum"><br>
        <button id="saveButton" onclick="saveEntry()">Aggiungi</button>

    `;
}

async function saveEntry() {
    const typ = document.getElementById('typ').value;
    const fach = document.getElementById('fach').value;
    const beschreibung = document.getElementById('beschreibung').value;
    const datum = document.getElementById('datum').value;
    const saveButton = document.getElementById('saveButton');  // Stelle sicher, dass der Button diese ID hat

    // Button deaktivieren und visuelles Feedback geben (optional)
    saveButton.disabled = true;
    saveButton.innerText = "Salvataggio in corso...";

    let success = false;
    let attempt = 0;
    // Maximal 10 Versuche (optional; du kannst hier auch unbegrenzt versuchen, solltest aber eine Abbruchlogik einbauen)
    const maxAttempts = 10;

    while (!success && attempt < maxAttempts) {
        try {
            const response = await fetch('https://homework-manager-2-0-backend.onrender.com/add_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ typ, fach, beschreibung, datum })
            });
            const result = await response.json();

            if (result.status === "ok") {
                success = true;
                showOverlay("Voce salvata con successo!");
                closeEntryModal();
                document.getElementById('overlay-close')
                    .addEventListener('click', () => location.reload(), { once: true });
            } else {
                console.error("Errore del server durante il salvataggio:", result.message);
            }
        } catch (error) {
            console.error("Errore di rete durante il salvataggio:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Tentativo di salvataggio ${attempt} fallito. Nuovo tentativo tra 2 secondi.`);
            // Warte 2000ms, bevor erneut versucht wird
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success) {
        showOverlay("La voce non è stata salvata dopo diversi tentativi. Riprova più tardi.");
    } else {
        // Reimposta campi di input
        document.getElementById('typ').value = "";
        document.getElementById('fach').value = "";
        document.getElementById('beschreibung').value = "";
        document.getElementById('datum').value = "";
    }

    // Button wieder aktivieren
    saveButton.disabled = false;
    saveButton.innerText = "Aggiungi";
}



// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
