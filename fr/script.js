// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    empty: 'Veuillez saisir un mot de passe.',
    wrong: 'Mot de passe incorrect – veuillez réessayer.'
};

const CREATE_DISABLED_MESSAGE = (window.hmI18n && window.hmI18n.get('calendar.actions.create.disabled'))
    || 'Seuls les administrateurs peuvent créer des entrées';

const CALENDAR_MODAL_SCOPE = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const CALENDAR_MODAL_BUTTONS = {
    add: CALENDAR_MODAL_SCOPE('buttons.add', 'Ajouter une entrée'),
    addLoading: CALENDAR_MODAL_SCOPE('buttons.addLoading', 'Ajout en cours…'),
    save: CALENDAR_MODAL_SCOPE('buttons.save', 'Enregistrer'),
    saveLoading: CALENDAR_MODAL_SCOPE('buttons.saveLoading', 'Enregistrement…')
};

const CALENDAR_MODAL_MESSAGES = {
    saveSuccess: CALENDAR_MODAL_SCOPE('messages.saveSuccess', 'Entrée enregistrée avec succès !'),
    saveRetry: CALENDAR_MODAL_SCOPE('messages.saveRetry', 'Impossible d’enregistrer l’entrée après plusieurs tentatives. Veuillez réessayer plus tard.')
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
    const languages = [
        { code: 'de', short: 'DE', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'en', short: 'EN', name: 'English', flag: '🇬🇧' },
        { code: 'it', short: 'IT', name: 'Italiano', flag: '🇮🇹' },
        { code: 'fr', short: 'FR', name: 'Français', flag: '🇫🇷' }
    ];

    const langMap = languages.reduce((map, entry) => {
        map[entry.code] = entry;
        return map;
    }, {});

    const dropdowns = Array.from(document.querySelectorAll('[data-language]'));
    if (!dropdowns.length) {
        return;
    }

    const getCurrentLanguage = () => {
        const parts = window.location.pathname.split('/');
        const candidate = (parts[1] || '').toLowerCase();
        return langMap[candidate] ? candidate : 'de';
    };

    const updateButtonLabel = (button, langCode) => {
        const data = langMap[langCode] || langMap.en;
        const code = button.querySelector('.language-button__code');
        if (code) {
            code.textContent = data.short;
        }
    };

    const closeDropdown = (dropdown) => {
        dropdown.classList.remove('is-open');
        const button = dropdown.querySelector('[data-language-toggle]');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
        dropdown.querySelectorAll('[data-lang]').forEach((item) => {
            item.setAttribute('tabindex', '-1');
        });
    };

    const openDropdown = (dropdown) => {
        dropdown.classList.add('is-open');
        const button = dropdown.querySelector('[data-language-toggle]');
        if (button) {
            button.setAttribute('aria-expanded', 'true');
        }
    };

    const closeAll = (except) => {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== except) {
                closeDropdown(dropdown);
            }
        });
    };

    dropdowns.forEach((dropdown, index) => {
        const button = dropdown.querySelector('[data-language-toggle]');
        const menu = dropdown.querySelector('[data-language-menu]');
        if (!button || !menu) {
            return;
        }

        const menuId = menu.id || `language-menu-${index + 1}`;
        menu.id = menuId;
        menu.setAttribute('role', 'menu');
        button.setAttribute('aria-controls', menuId);
        button.setAttribute('aria-expanded', 'false');

        const items = Array.from(menu.querySelectorAll('[data-lang]'));

        const syncOptionState = (currentLang) => {
            items.forEach((item) => {
                const lang = item.dataset.lang;
                const data = langMap[lang] || langMap.en;
                const code = item.querySelector('.language-option__code');
                if (code) code.textContent = data.short;
                const name = item.querySelector('.language-option__name');
                if (name) name.textContent = data.name;
                const flag = item.querySelector('.language-option__flag');
                if (flag) flag.textContent = data.flag;
                item.setAttribute('role', 'menuitem');
                item.setAttribute('tabindex', '-1');
                if (lang === currentLang) {
                    item.setAttribute('aria-current', 'true');
                } else {
                    item.removeAttribute('aria-current');
                }
            });
        };

        const focusItem = (indexToFocus) => {
            if (!items.length) {
                return;
            }
            const targetIndex = Math.max(0, Math.min(indexToFocus, items.length - 1));
            items.forEach((item, position) => {
                item.setAttribute('tabindex', position === targetIndex ? '0' : '-1');
            });
            const target = items[targetIndex];
            if (target) {
                target.focus();
            }
        };

        const getCurrentIndex = (langCode) => {
            const idx = items.findIndex((item) => item.dataset.lang === langCode);
            return idx === -1 ? 0 : idx;
        };

        const selectLanguage = (lang) => {
            if (!langMap[lang]) {
                return;
            }
            closeDropdown(dropdown);
            const parts = window.location.pathname.split('/');
            if (parts.length > 1) {
                parts[1] = lang;
            } else {
                parts.push(lang);
            }
            const nextPath = parts.join('/').replace(/\/{2,}/g, '/');
            window.location.pathname = nextPath;
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();
            const isOpen = dropdown.classList.contains('is-open');
            closeAll(dropdown);
            if (!isOpen) {
                openDropdown(dropdown);
                const current = getCurrentLanguage();
                syncOptionState(current);
                focusItem(getCurrentIndex(current));
            } else {
                closeDropdown(dropdown);
            }
        });

        button.addEventListener('keydown', (event) => {
            const current = getCurrentLanguage();
            switch (event.key) {
                case 'ArrowDown':
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    if (!dropdown.classList.contains('is-open')) {
                        closeAll(dropdown);
                        openDropdown(dropdown);
                        syncOptionState(current);
                    }
                    focusItem(getCurrentIndex(current));
                    break;
                }
                case 'ArrowUp': {
                    event.preventDefault();
                    if (!dropdown.classList.contains('is-open')) {
                        closeAll(dropdown);
                        openDropdown(dropdown);
                        syncOptionState(current);
                    }
                    focusItem(items.length - 1);
                    break;
                }
                case 'Escape': {
                    event.preventDefault();
                    closeDropdown(dropdown);
                    button.focus();
                    break;
                }
                default:
                    break;
            }
        });

        items.forEach((item, itemIndex) => {
            item.addEventListener('click', () => selectLanguage(item.dataset.lang));
            item.addEventListener('keydown', (event) => {
                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        focusItem((itemIndex + 1) % items.length);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        focusItem((itemIndex - 1 + items.length) % items.length);
                        break;
                    case 'Home':
                        event.preventDefault();
                        focusItem(0);
                        break;
                    case 'End':
                        event.preventDefault();
                        focusItem(items.length - 1);
                        break;
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        selectLanguage(item.dataset.lang);
                        break;
                    case 'Escape':
                        event.preventDefault();
                        closeDropdown(dropdown);
                        button.focus();
                        break;
                    default:
                        break;
                }
            });
        });

        const initialLang = getCurrentLanguage();
        updateButtonLabel(button, initialLang);
        syncOptionState(initialLang);
    });

    document.addEventListener('click', (event) => {
        if (!dropdowns.some((dropdown) => dropdown.contains(event.target))) {
            dropdowns.forEach(closeDropdown);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openDropdownEl = dropdowns.find((dropdown) => dropdown.classList.contains('is-open'));
            if (openDropdownEl) {
                closeDropdown(openDropdownEl);
                const trigger = openDropdownEl.querySelector('[data-language-toggle]');
                trigger?.focus();
            }
        }
    });
}


function initSimpleNav() {
    const nav = document.querySelector('.simple-nav');
    if (!nav || nav.dataset.enhanced === 'true') {
        return;
    }

    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');

    if (links && !links.id) {
        links.id = `nav-links-${Math.random().toString(36).slice(2, 9)}`;
    }

    if (toggle && links) {
        toggle.setAttribute('aria-controls', links.id);
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('simple-nav--open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    const closeMenu = () => {
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
        nav.classList.remove('simple-nav--open');
    };

    if (links) {
        links.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                closeMenu();
            }
        });
    }

    document.addEventListener('click', (event) => {
        if (!nav.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    nav.dataset.enhanced = 'true';
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
    invalidDate: 'Please enter a valid date in the format DD.MM.YYYY.',
    invalidEnd: 'The end time must not be earlier than the start time.',
    missingSubject: 'Please choose a subject.',
    missingEventTitle: 'Please enter an event title.'
};

if (window.hmI18n) {
    const formMessages = window.hmI18n.get('calendar.formMessages');
    if (formMessages && typeof formMessages === 'object') {
        Object.assign(ENTRY_FORM_MESSAGES, formMessages);
    }
}

function parseSwissDate(value) {
    if (!value) return null;
    const trimmed = value.trim();

    let day;
    let month;
    let year;

    let match = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) {
        day = Number(match[1]);
        month = Number(match[2]);
        year = Number(match[3]);
    } else {
        match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
            return null;
        }
        year = Number(match[1]);
        month = Number(match[2]);
        day = Number(match[3]);
    }

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
            subjectGroup.classList.toggle('is-hidden', Boolean(isEvent));
        }
        if (subjectSelect) {
            subjectSelect.required = !isEvent;
            if (isEvent) {
                subjectSelect.value = '';
                subjectSelect.setCustomValidity('');
            }
        }
        if (eventTitleGroup) {
            eventTitleGroup.classList.toggle('is-hidden', !isEvent);
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
        showOverlay(CREATE_DISABLED_MESSAGE);
        return;
    }
    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (!overlay || !form) {
        console.error('Entry overlay not found.');
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
        saveButton.textContent = CALENDAR_MODAL_BUTTONS.add;
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
        console.error('Entry form missing.');
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
        console.error('Form fields are missing.');
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
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.saveLoading;

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
                showOverlay(CALENDAR_MODAL_MESSAGES.saveSuccess);
                closeEntryModal();
                document.getElementById('overlay-close')
                    .addEventListener('click', () => location.reload(), { once: true });
                if (form) {
                    form.reset();
                    controller?.setType('event');
                }
            } else {
                console.error("Server error while saving:", result.message);
            }
        } catch (error) {
            console.error("Network error while saving:", error);
        }

        if (!success) {
            attempt++;
            console.warn(`Save attempt ${attempt} failed. Retrying in 2 seconds.`);
            // Warte 2000ms, bevor erneut versucht wird
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!success) {
        showOverlay(CALENDAR_MODAL_MESSAGES.saveRetry);
    } else {
        // Reset input fields
        if (form) {
            form.reset();
            controller?.setType('event');
        }
    }

    // Re-enable button
    saveButton.disabled = false;
    saveButton.innerText = CALENDAR_MODAL_BUTTONS.add;
}



// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', initLanguageSelector);
window.addEventListener('DOMContentLoaded', () => {
    setupModalFormInteractions(document.getElementById('entry-form'));
    setupModalFormInteractions(document.getElementById('fc-edit-form'));
});
window.addEventListener('DOMContentLoaded', initSimpleNav);
