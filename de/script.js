// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    show: 'Passwort anzeigen',
    hide: 'Passwort verbergen',
    empty: 'Bitte gib ein Passwort ein.',
    wrong: 'Falsches Passwort – bitte erneut versuchen.'
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
            throw new Error(`API-Fehler (${res.status})`);
        }
        const entries = await res.json();
        const colorMap = { hausaufgabe: '#007bff', pruefung: '#dc3545', event: '#28a745' };
        const sanitizeTime = (type, value) => {
            if (!value) return '';
            const trimmed = String(value).trim();
            if (!trimmed) return '';
            if (type === 'event' && (trimmed === '00:00:00' || trimmed === '00:00')) {
                return '';
            }
            return trimmed;
        };
        const events = entries.map(e => {
            const startTime = sanitizeTime(e.typ, e.startzeit);
            return {
                title: e.beschreibung,
                start: startTime ? `${e.datum}T${startTime}` : e.datum,
                color: colorMap[e.typ] || '#000'
            };
        });

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
      <h2>Aktuelles Fach: ${data.fach}</h2>
      <h3>Verbleibend: ${data.verbleibend}</h3>
      <p><strong>Raum:</strong> ${data.raum}</p>
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
    <p><strong>Fach:</strong> ${data.fach}</p>
    <p><strong>Endet um:</strong> ${data.endet || '-'} </p>
    <p><strong>Verbleibend:</strong> ${data.verbleibend}</p>
    <p><strong>Raum:</strong> ${data.raum}</p>
  `;
}



/** EINTRAG ERFASSEN MIT DROPDOWN UND DB-ANBINDUNG **/
function closeEntryModal() {
    const overlay = document.getElementById('entry-modal-overlay');
    if (overlay) {
        if (window.hmModal) {
            window.hmModal.close(overlay);
        } else {
            overlay.classList.remove('is-open');
        }
    }
    const form = document.getElementById('entry-form');
    if (form) {
        form.reset();
        const controller = setupModalFormInteractions(form);
        controller?.setType('event');
        controller?.evaluate();
    }
}

const ENTRY_FORM_MESSAGES = {
    invalidDate: 'Bitte gib ein gültiges Datum im Format TT.MM.JJJJ ein.',
    invalidEnd: 'Die Endzeit darf nicht vor der Startzeit liegen.',
    missingSubject: 'Bitte wähle ein Fach aus.',
    missingEventTitle: 'Bitte gib einen Event-Titel ein.'
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

function setupModalFormInteractions(form, initialMessages = ENTRY_FORM_MESSAGES) {
    if (!form) {
        return null;
    }
    if (form.dataset.enhanced === 'true' && form._modalController) {
        form._modalController.evaluate();
        return form._modalController;
    }

    let messages = { ...initialMessages };
    const typeSelect = form.querySelector('[data-field="type"] select');
    const subjectGroup = form.querySelector('[data-field="subject"]');
    const subjectSelect = subjectGroup ? subjectGroup.querySelector('select') : null;
    const eventTitleGroup = form.querySelector('[data-field="event-title"]');
    const eventTitleInput = eventTitleGroup ? eventTitleGroup.querySelector('input') : null;
    const dateInput = form.querySelector('[data-field="date"] input');
    const startInput = form.querySelector('[data-field="start"] input');
    const endInput = form.querySelector('[data-field="end"] input');
    const saveButton = form.querySelector('[data-role="submit"]');
    const cancelButton = form.querySelector('[data-role="cancel"]');

    const setInvalidState = (input) => {
        if (!input) return;
        input.classList.toggle('is-invalid', !input.checkValidity());
    };

    const evaluate = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';

        if (dateInput) {
            const iso = parseSwissDate(dateInput.value);
            if (!iso) {
                dateInput.setCustomValidity(messages.invalidDate || '');
            } else {
                dateInput.setCustomValidity('');
            }
        }

        if (subjectSelect) {
            if (!isEvent && !subjectSelect.value) {
                subjectSelect.setCustomValidity(messages.missingSubject || '');
            } else {
                subjectSelect.setCustomValidity('');
            }
        }

        if (eventTitleInput) {
            if (isEvent) {
                const trimmed = eventTitleInput.value.trim();
                if (!trimmed) {
                    eventTitleInput.setCustomValidity(messages.missingEventTitle || '');
                } else {
                    eventTitleInput.setCustomValidity('');
                }
            } else {
                eventTitleInput.setCustomValidity('');
            }
        }

        if (startInput && endInput) {
            if (!startInput.value) {
                endInput.value = '';
                endInput.disabled = true;
                endInput.setCustomValidity('');
            } else {
                endInput.disabled = false;
                if (endInput.value && endInput.value < startInput.value) {
                    endInput.setCustomValidity(messages.invalidEnd || '');
                } else {
                    endInput.setCustomValidity('');
                }
            }
        }

        [dateInput, startInput, endInput, subjectSelect, eventTitleInput].forEach(setInvalidState);

        if (saveButton) {
            saveButton.disabled = !form.checkValidity();
        }
    };

    const toggleTypeFields = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';
        if (subjectGroup) {
            subjectGroup.style.display = isEvent ? 'none' : '';
        }
        if (subjectSelect) {
            subjectSelect.required = !isEvent;
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
        input.addEventListener('blur', () => setInvalidState(input));
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', evaluate);
        }
    });

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            if (form.id === 'entry-form') {
                closeEntryModal();
            } else {
                closeModal();
            }
        });
    }

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
                endInput.disabled = true;
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
        }, 0);
    });

    form.dataset.enhanced = 'true';

    const controller = {
        evaluate,
        toggleTypeFields,
        setMessages(nextMessages) {
            messages = { ...messages, ...nextMessages };
            evaluate();
        },
        setType(value) {
            if (typeSelect) {
                typeSelect.value = value;
                toggleTypeFields();
            }
        }
    };

    form._modalController = controller;

    toggleTypeFields();
    evaluate();

    return controller;
}

function showEntryForm() {
    if (sessionStorage.getItem('role') !== 'admin') {
        showOverlay('Nur Admin darf Einträge erstellen!');
        return;
    }
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (!overlay || !form) {
        console.error('Eintrags-Overlay nicht gefunden.');
        return;
    }

    form.reset();
    const controller = setupModalFormInteractions(form);
    if (controller) {
        controller.setType('event');
        controller.evaluate();
    }
    const saveButton = form.querySelector('#saveButton');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Hinzufügen';
    }

    const initialFocus = form.querySelector('[data-hm-modal-initial-focus]') || form.querySelector('select, input, textarea, button');
    if (window.hmModal) {
        window.hmModal.open(overlay, {
            initialFocus,
            onRequestClose: closeEntryModal
        });
    } else {
        overlay.classList.add('is-open');
        if (initialFocus && typeof initialFocus.focus === 'function') {
            try {
                initialFocus.focus({ preventScroll: true });
            } catch (err) {
                initialFocus.focus();
            }
        }
    }
}

async function saveEntry(event) {
    if (event) {
        event.preventDefault();
    }

    const form = document.getElementById('entry-form');
    if (!form) {
        console.error('Eintragsformular fehlt.');
        return;
    }

    const controller = setupModalFormInteractions(form);
    controller?.evaluate();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const typeField = document.getElementById('typ');
    const subjectField = document.getElementById('fach');
    const descriptionField = document.getElementById('beschreibung');
    const dateField = document.getElementById('datum');
    const startField = document.getElementById('startzeit');
    const endField = document.getElementById('endzeit');
    const eventTitleField = document.getElementById('event-titel');
    const saveButton = document.getElementById('saveButton');

    if (!typeField || !dateField || !startField || !saveButton) {
        console.error('Formularfelder fehlen.');
        return;
    }

    const typ = typeField.value;
    const fach = subjectField ? subjectField.value.trim() : '';
    const beschreibung = descriptionField ? descriptionField.value.trim() : '';
    const datumInput = dateField.value.trim();
    const startzeitInput = startField.value;
    const endzeitInput = endField && !endField.disabled ? endField.value : '';
    const eventTitle = eventTitleField ? eventTitleField.value.trim() : '';

    const isoDate = parseSwissDate(datumInput);
    if (!isoDate) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidDate);
        dateField.focus();
        return;
    }

    if (endzeitInput && startzeitInput && endzeitInput < startzeitInput) {
        showOverlay(ENTRY_FORM_MESSAGES.invalidEnd);
        return;
    }

    const startzeit = startzeitInput ? `${startzeitInput}:00` : null;
    const endzeit = endzeitInput ? `${endzeitInput}:00` : null;
    const isEvent = typ === 'event';

    const payloadBeschreibung = isEvent
        ? eventTitle + (beschreibung ? `\n\n${beschreibung}` : '')
        : beschreibung;
    const payloadSubject = isEvent ? '' : fach;

    saveButton.disabled = true;
    saveButton.innerText = 'Speichern…';

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
                showOverlay("Eintrag wurde erfolgreich gespeichert!");
                closeEntryModal();
                document.getElementById('overlay-close')
                    .addEventListener('click', () => location.reload(), { once: true });
                if (form) {
                    form.reset();
                    controller?.setType('event');
                }
            } else {
                console.error("Server-Fehler beim Speichern:", result.message);
            }
        } catch (error) {
            console.error("Netzwerk-Fehler beim Speichern:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Speicher-Versuch ${attempt} fehlgeschlagen. Neuer Versuch in 2 Sekunden.`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success) {
        showOverlay("Der Eintrag konnte nach mehreren Versuchen nicht gespeichert werden. Bitte versuche es später noch einmal.");
    } else {
        if (form) {
            form.reset();
            controller?.setType('event');
        }
    }

    // Button wieder aktivieren
    saveButton.disabled = false;
    saveButton.innerText = 'Hinzufügen';
}

// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', initLanguageSelector);
window.addEventListener('DOMContentLoaded', () => {
    setupModalFormInteractions(document.getElementById('entry-form'));
    setupModalFormInteractions(document.getElementById('fc-edit-form'));
});

