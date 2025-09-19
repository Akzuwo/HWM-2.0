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

const ENTRY_FORM_MESSAGES = {
    invalidDate: 'Inserisci una data valida nel formato GG.MM.AAAA.',
    invalidEnd: "L'orario di fine non può essere precedente all'inizio."
};

function parseSwissDate(value) {
    if (!value) return null;
    const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }
    return `${year.toString().padStart(4, '0')}-${month
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function setupEntryFormInteractions(form) {
    if (!form || form.dataset.enhanced === 'true') {
        return;
    }
    form.dataset.enhanced = 'true';

    const typeSelect = form.querySelector('#typ');
    const subjectGroup = form.querySelector('[data-field="subject"]');
    const subjectSelect = form.querySelector('#fach');
    const eventTitleGroup = form.querySelector('[data-field="event-title"]');
    const eventTitleInput = form.querySelector('#event-titel');
    const dateInput = form.querySelector('#datum');
    const startInput = form.querySelector('#startzeit');
    const endInput = form.querySelector('#endzeit');
    const saveButton = form.querySelector('#saveButton');

    const evaluate = () => {
        if (dateInput) {
            const iso = parseSwissDate(dateInput.value);
            if (!iso) {
                dateInput.setCustomValidity(ENTRY_FORM_MESSAGES.invalidDate);
            } else {
                dateInput.setCustomValidity('');
            }
        }

        if (startInput && endInput) {
            if (endInput.value && startInput.value && endInput.value < startInput.value) {
                endInput.setCustomValidity(ENTRY_FORM_MESSAGES.invalidEnd);
            } else {
                endInput.setCustomValidity('');
            }
        }

        if (saveButton) {
            saveButton.disabled = !form.checkValidity();
        }
    };

    const toggleTypeFields = () => {
        if (!typeSelect) return;
        const isEvent = typeSelect.value === 'event';
        if (subjectGroup) {
            subjectGroup.style.display = isEvent ? 'none' : '';
        }
        if (subjectSelect) {
            subjectSelect.required = !isEvent;
            subjectSelect.classList.toggle('optional', isEvent);
            if (isEvent) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            }
        }
        if (eventTitleGroup) {
            eventTitleGroup.style.display = isEvent ? '' : 'none';
        }
        if (eventTitleInput) {
            eventTitleInput.required = isEvent;
            if (!isEvent) {
                eventTitleInput.value = '';
                eventTitleInput.setCustomValidity('');
            }
        }
        evaluate();
    };

    if (typeSelect) {
        typeSelect.addEventListener('change', toggleTypeFields);
    }

    [dateInput, startInput, endInput, subjectSelect, eventTitleInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', evaluate);
    });

    form.addEventListener('reset', () => {
        window.setTimeout(() => {
            if (dateInput) {
                dateInput.value = '';
                dateInput.setCustomValidity('');
            }
            if (startInput) {
                startInput.value = '';
            }
            if (endInput) {
                endInput.value = '';
                endInput.setCustomValidity('');
            }
            if (eventTitleInput) {
                eventTitleInput.value = '';
                eventTitleInput.setCustomValidity('');
            }
            if (subjectSelect) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            }
            if (typeSelect) {
                typeSelect.value = 'event';
            }
            toggleTypeFields();
            evaluate();
        }, 0);
    });

    toggleTypeFields();
    evaluate();
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
            setupEntryFormInteractions(form);
            const typeSelect = form.querySelector('#typ');
            if (typeSelect) {
                typeSelect.value = 'event';
                typeSelect.dispatchEvent(new Event('change'));
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
            <label data-field="subject">
                Materia:
                <select id="fach" required>
                    <option value="">– seleziona –</option>
                    ${[
                        'MA','DE','EN','PS','SPM-PS','SPM-MA','SPM-ES','SP','WR','GS',
                        'GG','IN','IT','FR','BG','MU','BI','Sport','CH','PH','SMU'
                    ].map(f => `<option>${f}</option>`).join('')}
                </select>
            </label><br>
            <label data-field="event-title" style="display:none;">
                Titolo evento:
                <input type="text" id="event-titel" minlength="80" maxlength="120" placeholder="Titolo di 80-120 caratteri" required>
            </label><br>
            <label>
                Descrizione (facoltativa):
                <textarea id="beschreibung" rows="3" placeholder="Breve descrizione"></textarea>
            </label><br>
            <label>
                Data (GG.MM.AAAA):
                <input type="text" id="datum" placeholder="18.09.2025" inputmode="numeric" required>
            </label><br>
            <label>
                Ora di inizio:
                <input type="time" id="startzeit" required>
            </label><br>
            <label>
                Orario di fine (opzionale):
                <input type="time" id="endzeit">
            </label><br>
            <button type="submit" id="saveButton">Aggiungi</button>
        </form>
    `;

    setupEntryFormInteractions(document.getElementById('entry-form'));
}

async function saveEntry(event) {
    if (event) {
        event.preventDefault();
    }

    const typeField = document.getElementById('typ');
    const subjectField = document.getElementById('fach');
    const descriptionField = document.getElementById('beschreibung');
    const dateField = document.getElementById('datum');
    const startField = document.getElementById('startzeit');
    const endField = document.getElementById('endzeit');
    const eventTitleField = document.getElementById('event-titel');

    if (!typeField || !dateField || !startField) {
        console.error('Campi del modulo mancanti.');
        return;
    }

    const typ = typeField.value;
    const fach = subjectField ? subjectField.value.trim() : '';
    const beschreibung = descriptionField ? descriptionField.value.trim() : '';
    const datumInput = dateField.value.trim();
    const startzeitInput = startField.value;
    const endzeitInput = endField ? endField.value : '';
    const eventTitle = eventTitleField ? eventTitleField.value.trim() : '';
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

    const isEvent = typ === 'event';

    if (!isEvent && !fach) {
        showOverlay('Seleziona una materia (non necessario per gli eventi).');
        return;
    }
    if (isEvent) {
        if (!eventTitle || eventTitle.length < 80 || eventTitle.length > 120) {
            showOverlay('Inserisci un titolo evento tra 80 e 120 caratteri.');
            return;
        }
    }
    if (!datumInput) {
        showOverlay('Inserisci una data.');
        return;
    }

    const isoDate = parseSwissDate(datumInput);
    if (!isoDate) {
        showOverlay('Inserisci una data valida nel formato GG.MM.AAAA.');
        return;
    }

    if (!startzeitInput) {
        showOverlay('Inserisci un orario di inizio.');
        return;
    }

    if (endzeitInput && endzeitInput < startzeitInput) {
        showOverlay("L'orario di fine non può essere precedente all'inizio.");
        return;
    }

    const startzeit = `${startzeitInput}:00`;
    const endzeit = endzeitInput ? `${endzeitInput}:00` : null;

    const payloadBeschreibung = isEvent
        ? eventTitle + (beschreibung ? `\n\n${beschreibung}` : '')
        : beschreibung;
    const payloadSubject = isEvent ? '' : fach;

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
                body: JSON.stringify({ typ, fach: payloadSubject, beschreibung: payloadBeschreibung, datum: isoDate, startzeit, endzeit })
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
window.addEventListener('DOMContentLoaded', () => {
    setupEntryFormInteractions(document.getElementById('entry-form'));
});
