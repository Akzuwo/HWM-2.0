// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    show: 'Mostra password',
    hide: 'Nascondi password',
    empty: 'Inserisci una password.',
    wrong: 'Password errata – riprova.'
};

function setLoginFeedback(message = '', isError = false) {
    const feedback = document.getElementById('login-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    if (message) {
        feedback.classList.toggle('error', Boolean(isError));
    } else {
        feedback.classList.remove('error');
    }
}

function focusPasswordField() {
    const input = document.getElementById('passwort');
    if (input) {
        input.focus();
        if (typeof input.select === 'function') {
            input.select();
        }
    }
}

function togglePasswordVisibility() {
    const input = document.getElementById('passwort');
    const toggle = document.getElementById('toggle-password');
    if (!input || !toggle) return;
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    toggle.setAttribute('aria-label', shouldShow ? LOGIN_TEXT.hide : LOGIN_TEXT.show);
    toggle.classList.toggle('visible', shouldShow);
    input.focus();
}

function handlePasswordKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        login();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('passwort');
    if (!input) return;
    input.addEventListener('input', () => setLoginFeedback(''));
});

function login() {
    const input = document.getElementById('passwort');
    if (!input) return;
    const pw = input.value.trim();
    if (!pw) {
        setLoginFeedback(LOGIN_TEXT.empty, true);
        focusPasswordField();
        return;
    }
    if (pw === 'l23a-admin') {
        sessionStorage.setItem('role', 'admin');
        setLoginFeedback('');
        window.location.href = 'index.html';
    } else {
        setLoginFeedback(LOGIN_TEXT.wrong, true);
        focusPasswordField();
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

function initLanguageSelector() {
    const langMap = {
        de: { short: 'DE', long: 'Deutsch' },
        en: { short: 'EN', long: 'English' },
        it: { short: 'IT', long: 'Italiano' }
    };

    function setup(id) {
        const container = document.getElementById(id);
        if (!container) return;
        const button = container.querySelector('.language-button');
        const currentSpan = button.querySelector('.current-lang');
        const arrow = button.querySelector('.arrow');
        const menu = container.querySelector('.language-menu');
        const currentLang = window.location.pathname.split('/')[1];
        const names = langMap[currentLang] || langMap.en;
        currentSpan.textContent = names.short;
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = container.classList.toggle('open');
            arrow.textContent = open ? '▲' : '▼';
            currentSpan.textContent = open ? names.long : names.short;
        });
        menu.querySelectorAll('div').forEach(opt => {
            const lang = opt.dataset.lang;
            opt.textContent = langMap[lang].long;
            opt.addEventListener('click', () => {
                const parts = window.location.pathname.split('/');
                parts[1] = lang;
                window.location.pathname = parts.join('/');
            });
        });
    }

    setup('language-dropdown');
    setup('language-dropdown-mobile');

    document.addEventListener('click', () => {
        document.querySelectorAll('.language-dropdown.open').forEach(c => {
            c.classList.remove('open');
            const arrow = c.querySelector('.arrow');
            const currentSpan = c.querySelector('.current-lang');
            const currentLang = window.location.pathname.split('/')[1];
            const names = langMap[currentLang] || langMap.en;
            if (arrow) arrow.textContent = '▼';
            if (currentSpan) currentSpan.textContent = names.short;
        });
    });
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

        const res = await fetch('https://homework-manager-2-0-backend.onrender.com/entries');
        if (!res.ok) {
            throw new Error(`Errore API (${res.status})`);
        }
        const entries = await res.json();
        const colorMap = { hausaufgabe: '#007bff', pruefung: '#dc3545', event: '#28a745' };
        const events = entries.map(e => ({
            title: e.beschreibung,
            start: e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum,
            color: colorMap[e.typ] || '#000'
        }));

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
        console.error('Errore durante il caricamento o il rendering del calendario:', err);
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
        const form = document.getElementById('entry-form');
        if (form) {
            form.reset();
            const typeSelect = document.getElementById('typ');
            if (typeSelect) {
                typeSelect.value = 'event';
            }
        }
        return;
    }
    clearContent();
    document.getElementById('content').innerHTML = `
        <h2>📝 Crea una nuova voce</h2>
        <form id="entry-form" onsubmit="saveEntry(event)">
            <label>
                Tipo:
                <select id="typ" required>
                    <option value="hausaufgabe">Compito</option>
                    <option value="pruefung">Esame</option>
                    <option value="event" selected>Evento</option>
                </select>
            </label><br>
            <label>
                Materia:
                <select id="fach" required>
                    <option value="">– seleziona –</option>
                    ${[
                        'MA','DE','EN','PS','SPM-PS','SPM-MA','SPM-ES','SP','WR','GS',
                        'GG','IN','IT','FR','BG','MU','BI','Sport','CH','PH','SMU'
                    ].map(f => `<option>${f}</option>`).join('')}
                </select>
            </label><br>
            <label>
                Descrizione (facoltativa):
                <textarea id="beschreibung" rows="3" placeholder="Breve descrizione"></textarea>
            </label><br>
            <label>
                Data e ora:
                <input type="datetime-local" id="datum" required>
            </label><br>
            <label>
                Orario di fine (opzionale):
                <input type="time" id="endzeit">
            </label><br>
            <button type="submit" id="saveButton">Aggiungi</button>
        </form>
    `;

    const typeSelect = document.getElementById('typ');
    const subjectSelect = document.getElementById('fach');
    if (typeSelect && subjectSelect) {
        const updateSubjectRequirement = () => {
            const isEvent = typeSelect.value === 'event';
            subjectSelect.required = !isEvent;
            subjectSelect.classList.toggle('optional', isEvent);
        };
        typeSelect.addEventListener('change', updateSubjectRequirement);
        updateSubjectRequirement();
    }
}

async function saveEntry(event) {
    if (event) {
        event.preventDefault();
    }

    const typ = document.getElementById('typ').value;
    const fach = document.getElementById('fach').value;
    const beschreibung = document.getElementById('beschreibung').value.trim();
    const datumInput = document.getElementById('datum').value;
    const endzeitField = document.getElementById('endzeit');
    const endzeitInput = endzeitField ? endzeitField.value : '';
    const saveButton = document.getElementById('saveButton');
    const form = document.getElementById('entry-form');
    const resetTypeSelection = () => {
        const typeSelect = document.getElementById('typ');
        if (typeSelect) {
            typeSelect.value = 'event';
            typeSelect.dispatchEvent(new Event('change'));
        }
    };

    if (!saveButton) {
        console.error('Pulsante di salvataggio non trovato.');
        return;
    }

    if (typ !== 'event' && !fach) {
        showOverlay('Seleziona una materia (non necessario per gli eventi).');
        return;
    }
    if (!datumInput) {
        showOverlay('Seleziona una data.');
        return;
    }

    const [datePart, timePartRaw] = datumInput.split('T');
    const startzeit = timePartRaw ? `${timePartRaw}:00` : null;
    const endzeit = endzeitInput ? `${endzeitInput}:00` : null;

    // Disabilita il pulsante per feedback
    saveButton.disabled = true;
    saveButton.innerText = "Salvataggio in corso...";

    let success = false;
    let attempt = 0;
    const maxAttempts = 10;

    while (!success && attempt < maxAttempts) {
        try {
            const response = await fetch('https://homework-manager-2-0-backend.onrender.com/add_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ typ, fach, beschreibung, datum: datePart, startzeit, endzeit })
            });
            const result = await response.json();

            if (result.status === "ok") {
                success = true;
                showOverlay("Voce salvata con successo!");
                closeEntryModal();
                document.getElementById('overlay-close')
                    .addEventListener('click', () => location.reload(), { once: true });
                if (form) {
                    form.reset();
                    resetTypeSelection();
                }
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
        if (form) {
            form.reset();
            resetTypeSelection();
        }
    }

    // Riattiva il pulsante
    saveButton.disabled = false;
    saveButton.innerText = "Aggiungi";
}



// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', initLanguageSelector);
