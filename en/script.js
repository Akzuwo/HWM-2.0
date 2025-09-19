// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    show: 'Show password',
    hide: 'Hide password',
    empty: 'Please enter a password.',
    wrong: 'Wrong password – please try again.'
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
            throw new Error(`API error (${res.status})`);
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
        console.error('Error loading or rendering the calendar:', err);
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
      <h2>Current Subject: ${data.fach}</h2>
      <h3>Remaining: ${data.verbleibend}</h3>
      <p><strong>Room:</strong> ${data.raum}</p>
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
    <p><strong>Subject:</strong> ${data.fach}</p>
    <p><strong>Ends at:</strong> ${data.endet || '-'} </p>
    <p><strong>Remaining:</strong> ${data.verbleibend}</p>
    <p><strong>Room:</strong> ${data.raum}</p>
  `;
}



/** ENTRY CREATION WITH DROPDOWN AND BACKEND INTEGRATION **/
const API_BASE_URL = 'https://homework-manager-2-0-backend.onrender.com';
const OVERLAY_VISIBLE_CLASS = 'is-visible';
const OVERLAY_CLOSING_CLASS = 'closing';
const OVERLAY_TRANSITION_MS = 200;

const ENTRY_FORM_COPY = {
    create: {
        title: '📝 Create a New Entry',
        submit: 'Add',
        success: 'Entry saved successfully!'
    },
    edit: {
        title: '✏️ Edit Entry',
        submit: 'Save',
        success: 'Changes saved successfully!'
    },
    saving: 'Saving…'
};

const ENTRY_FORM_MESSAGES = {
    invalidDate: 'Please enter a valid date in the format DD.MM.YYYY.',
    endBeforeStart: 'End time is earlier than start time',
    missingSubject: 'Please choose a subject',
    missingEventTitle: 'Please provide an event title'
};

function animateOverlay(overlay, show) {
    if (!overlay) return;
    overlay.classList.remove(OVERLAY_CLOSING_CLASS);
    if (show) {
        overlay.classList.add(OVERLAY_VISIBLE_CLASS);
        return;
    }
    overlay.classList.remove(OVERLAY_VISIBLE_CLASS);
    overlay.classList.add(OVERLAY_CLOSING_CLASS);
    window.setTimeout(() => overlay.classList.remove(OVERLAY_CLOSING_CLASS), OVERLAY_TRANSITION_MS);
}

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

function formatIsoToSwiss(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) {
        return value;
    }
    return `${day}.${month}.${year}`;
}

function formatTimeForPayload(value) {
    return value ? `${value}:00` : null;
}

function splitEventDescription(description) {
    if (!description) {
        return { title: '', details: '' };
    }
    const segments = description.split(/\n\s*/);
    const title = segments.shift() || '';
    const details = segments.join('\n').trim();
    return { title: title.trim(), details };
}

function ensureEntryFormSetup(form) {
    if (!form) return null;
    if (!form.__entryFormState) {
        setupEntryFormInteractions(form);
    }
    return form.__entryFormState || null;
}

function setEntryFormMode(form, mode) {
    if (!form) return;
    const normalizedMode = mode === 'edit' ? 'edit' : 'create';
    form.dataset.mode = normalizedMode;
    if (normalizedMode === 'create') {
        form.dataset.entryId = '';
    }
    const copy = ENTRY_FORM_COPY[normalizedMode];
    const heading = document.getElementById('entry-form-title');
    const state = ensureEntryFormSetup(form);
    if (heading && copy) {
        heading.textContent = copy.title;
    }
    if (state?.saveButton && copy) {
        state.saveButton.textContent = copy.submit;
    }
    state?.evaluate?.();
}

function resetEntryForm(form) {
    if (!form) return;
    form.dataset.mode = 'create';
    form.dataset.entryId = '';
    form.reset();
    window.setTimeout(() => {
        setEntryFormMode(form, 'create');
        const state = ensureEntryFormSetup(form);
        state?.toggleTypeFields?.();
        state?.evaluate?.();
    }, 0);
}

function closeEntryModal() {
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (form) {
        resetEntryForm(form);
    }
    animateOverlay(overlay, false);
}
window.closeEntryModal = closeEntryModal;

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
    const descriptionInput = form.querySelector('#beschreibung');
    const dateInput = form.querySelector('#datum');
    const startInput = form.querySelector('#startzeit');
    const endInput = form.querySelector('#endzeit');
    const saveButton = form.querySelector('#saveButton');

    const evaluate = () => {
        if (dateInput) {
            const trimmed = dateInput.value.trim();
            const iso = trimmed ? parseSwissDate(trimmed) : null;
            if (trimmed && !iso) {
                dateInput.setCustomValidity(ENTRY_FORM_MESSAGES.invalidDate);
            } else {
                dateInput.setCustomValidity('');
            }
        }

        if (startInput && endInput) {
            if (endInput.value && startInput.value && endInput.value < startInput.value) {
                endInput.setCustomValidity(ENTRY_FORM_MESSAGES.endBeforeStart);
            } else {
                endInput.setCustomValidity('');
            }
        }

        if (subjectSelect) {
            if (subjectSelect.required && !subjectSelect.value) {
                subjectSelect.setCustomValidity(ENTRY_FORM_MESSAGES.missingSubject);
            } else {
                subjectSelect.setCustomValidity('');
            }
        }

        if (eventTitleInput) {
            if (eventTitleInput.required && !eventTitleInput.value.trim()) {
                eventTitleInput.setCustomValidity(ENTRY_FORM_MESSAGES.missingEventTitle);
            } else {
                eventTitleInput.setCustomValidity('');
            }
        }

        if (saveButton) {
            saveButton.disabled = !form.checkValidity();
        }
    };

    const toggleTypeFields = () => {
        const value = typeSelect ? typeSelect.value : '';
        const isEvent = value === 'event';
        if (subjectGroup) {
            subjectGroup.hidden = isEvent;
        }
        if (subjectSelect) {
            subjectSelect.required = !isEvent;
            if (isEvent) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            }
        }
        if (eventTitleGroup) {
            eventTitleGroup.hidden = !isEvent;
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

    [dateInput, startInput, endInput, subjectSelect, eventTitleInput, descriptionInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', evaluate);
        input.addEventListener('change', evaluate);
    });

    form.addEventListener('reset', () => {
        window.setTimeout(() => {
            if (typeSelect) {
                typeSelect.value = '';
            }
            if (subjectSelect) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            }
            if (eventTitleInput) {
                eventTitleInput.value = '';
                eventTitleInput.setCustomValidity('');
            }
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
            toggleTypeFields();
            evaluate();
        }, 0);
    });

    form.__entryFormState = {
        typeSelect,
        subjectGroup,
        subjectSelect,
        eventTitleGroup,
        eventTitleInput,
        descriptionInput,
        dateInput,
        startInput,
        endInput,
        saveButton,
        evaluate,
        toggleTypeFields
    };

    toggleTypeFields();
    evaluate();
}

function showEntryForm() {
    if (sessionStorage.getItem('role') !== 'admin') {
        showOverlay('Only admins may create entries!');
        return;
    }
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (overlay && form) {
        resetEntryForm(form);
        animateOverlay(overlay, true);
        const state = ensureEntryFormSetup(form);
        window.setTimeout(() => state?.typeSelect?.focus(), 0);
        return;
    }
    clearContent();
    document.getElementById('content').innerHTML = `
        <h2 id="entry-form-title">📝 Create a New Entry</h2>
        <form id="entry-form" data-mode="create" onsubmit="saveEntry(event)">
            <input type="hidden" id="entry-id" name="entry-id">
            <div class="fc-form-group">
                <label for="typ">Type</label>
                <select id="typ" name="typ" required>
                    <option value="" disabled selected>Please choose a type</option>
                    <option value="hausaufgabe">Homework</option>
                    <option value="pruefung">Exam</option>
                    <option value="event">Event</option>
                </select>
            </div>
            <div class="fc-form-group" data-field="subject">
                <label for="fach">Subject</label>
                <select id="fach" name="fach" required>
                    <option value="" disabled selected>– please select –</option>
                    ${[
                        'MA','DE','EN','PS','SPM-PS','SPM-MA','SPM-ES','SP','WR','GS',
                        'GG','IN','IT','FR','BG','MU','BI','Sport','CH','PH','SMU'
                    ].map(f => `<option>${f}</option>`).join('')}
                </select>
            </div>
            <div class="fc-form-group" data-field="event-title" hidden>
                <label for="event-titel">Event title</label>
                <input
                    type="text"
                    id="event-titel"
                    name="event-titel"
                    maxlength="120"
                    placeholder="Short and snappy (e.g. Info Night)"
                    required
                >
            </div>
            <div class="fc-form-group">
                <label for="beschreibung">Description (optional)</label>
                <textarea
                    id="beschreibung"
                    name="beschreibung"
                    rows="3"
                    placeholder="Add supporting details"
                    aria-describedby="beschreibung-hint"
                ></textarea>
                <p class="fc-field-hint" id="beschreibung-hint">Share extra context, links or reminders. This field is optional.</p>
            </div>
            <div class="fc-form-group">
                <label for="datum">Date (DD.MM.YYYY)</label>
                <input
                    type="text"
                    id="datum"
                    name="datum"
                    placeholder="18.09.2025"
                    inputmode="numeric"
                    required
                >
            </div>
            <div class="fc-form-group">
                <label for="startzeit">Start time</label>
                <input type="time" id="startzeit" name="startzeit" required>
            </div>
            <div class="fc-form-group">
                <label for="endzeit">End time (optional)</label>
                <input type="time" id="endzeit" name="endzeit">
            </div>
            <button type="submit" id="saveButton">Add</button>
        </form>
    `;

    const dynamicForm = document.getElementById('entry-form');
    setupEntryFormInteractions(dynamicForm);
}

function openEntryEditor(entry) {
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (!overlay || !form) {
        console.warn('Edit form is not available.');
        return;
    }
    const state = ensureEntryFormSetup(form);
    form.dataset.entryId = entry?.id ? String(entry.id) : '';
    setEntryFormMode(form, 'edit');

    if (state?.typeSelect) {
        state.typeSelect.value = entry?.type || '';
        state.typeSelect.dispatchEvent(new Event('change'));
    }

    if (state?.subjectSelect) {
        state.subjectSelect.value = entry?.type === 'event' ? '' : (entry?.fach || '');
    }

    const eventSegments = entry?.type === 'event'
        ? splitEventDescription(entry?.description || '')
        : { title: '', details: entry?.description || '' };

    if (state?.eventTitleInput) {
        state.eventTitleInput.value = eventSegments.title || '';
    }

    if (state?.descriptionInput) {
        state.descriptionInput.value = eventSegments.details || '';
    }

    if (state?.dateInput) {
        state.dateInput.value = entry?.datum ? formatIsoToSwiss(entry.datum) : '';
    }

    if (state?.startInput) {
        state.startInput.value = entry?.startzeit ? entry.startzeit.slice(0, 5) : '';
    }

    if (state?.endInput) {
        state.endInput.value = entry?.endzeit ? entry.endzeit.slice(0, 5) : '';
    }

    window.setTimeout(() => {
        state?.toggleTypeFields?.();
        state?.evaluate?.();
    }, 0);

    animateOverlay(overlay, true);
    window.setTimeout(() => state?.typeSelect?.focus(), 0);
}
window.openEntryEditor = openEntryEditor;

async function saveEntry(event) {
    if (event) {
        event.preventDefault();
    }

    const form = document.getElementById('entry-form');
    if (!form) {
        console.error('No form found to save.');
        return;
    }
    const state = ensureEntryFormSetup(form);
    state?.evaluate?.();
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const mode = form.dataset.mode === 'edit' ? 'edit' : 'create';
    const copy = ENTRY_FORM_COPY[mode];
    const type = state?.typeSelect ? state.typeSelect.value : '';
    const isEvent = type === 'event';
    const subject = state?.subjectSelect ? state.subjectSelect.value.trim() : '';
    const eventTitle = state?.eventTitleInput ? state.eventTitleInput.value.trim() : '';
    const description = state?.descriptionInput ? state.descriptionInput.value.trim() : '';
    const dateInput = state?.dateInput ? state.dateInput.value.trim() : '';
    const startInput = state?.startInput ? state.startInput.value : '';
    const endInput = state?.endInput ? state.endInput.value : '';
    const entryId = form.dataset.entryId || '';
    const saveButton = state?.saveButton;

    const isoDate = parseSwissDate(dateInput);
    if (!isoDate) {
        state?.dateInput?.setCustomValidity(ENTRY_FORM_MESSAGES.invalidDate);
        form.reportValidity();
        return;
    }

    const startzeit = formatTimeForPayload(startInput);
    const endzeit = formatTimeForPayload(endInput);

    const payloadDescription = isEvent
        ? `${eventTitle}${description ? `\n\n${description}` : ''}`
        : description;
    const payloadSubject = isEvent ? '' : subject;

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = ENTRY_FORM_COPY.saving;
    }

    const role = sessionStorage.getItem('role') || 'guest';

    try {
        if (mode === 'edit') {
            const response = await fetch(`${API_BASE_URL}/update_entry`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Role': role
                },
                body: JSON.stringify({
                    id: entryId,
                    type,
                    date: isoDate,
                    description: payloadDescription,
                    startzeit,
                    endzeit,
                    fach: payloadSubject
                })
            });
            if (!response.ok) {
                const message = await response.text().catch(() => '');
                throw new Error(message || `Status ${response.status}`);
            }
            showOverlay(copy.success);
            closeEntryModal();
            document.getElementById('overlay-close')
                .addEventListener('click', () => location.reload(), { once: true });
            return;
        }

        let success = false;
        let attempt = 0;
        const maxAttempts = 10;

        while (!success && attempt < maxAttempts) {
            try {
                const response = await fetch(`${API_BASE_URL}/add_entry`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Role': role
                    },
                    body: JSON.stringify({
                        typ: type,
                        fach: payloadSubject,
                        beschreibung: payloadDescription,
                        datum: isoDate,
                        startzeit,
                        endzeit
                    })
                });
                const result = await response.json();
                if (response.ok && result.status === 'ok') {
                    success = true;
                    showOverlay(copy.success);
                    closeEntryModal();
                    document.getElementById('overlay-close')
                        .addEventListener('click', () => location.reload(), { once: true });
                } else {
                    const message = result.message || `Status ${response.status}`;
                    throw new Error(message);
                }
            } catch (requestError) {
                attempt += 1;
                if (attempt >= maxAttempts) {
                    throw requestError;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    } catch (error) {
        console.error('Error saving:', error);
        showOverlay(`Error saving:\n${error.message}`);
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = copy.submit;
        }
    }
}

// Initial checks on page load
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', initLanguageSelector);
window.addEventListener('DOMContentLoaded', () => {
    setupEntryFormInteractions(document.getElementById('entry-form'));
});
