// LOGIN & SESSION MANAGEMENT
const LOGIN_TEXT = {
    show: 'Mostra password',
    hide: 'Nascondi password',
    empty: 'Inserisci una password.',
    wrong: 'Password errata – riprova.'
};

const CREATE_DISABLED_MESSAGE = (window.hmI18n && window.hmI18n.get('calendar.actions.create.disabled'))
    || 'Solo gli admin possono creare voci';

const CALENDAR_MODAL_SCOPE = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const CALENDAR_MODAL_BUTTONS = {
    add: CALENDAR_MODAL_SCOPE('buttons.add', 'Aggiungi'),
    addLoading: CALENDAR_MODAL_SCOPE('buttons.addLoading', 'Aggiunta …'),
    save: CALENDAR_MODAL_SCOPE('buttons.save', 'Salva'),
    saveLoading: CALENDAR_MODAL_SCOPE('buttons.saveLoading', 'Salvataggio …')
};

const CALENDAR_MODAL_MESSAGES = {
    saveSuccess: CALENDAR_MODAL_SCOPE('messages.saveSuccess', 'Voce salvata con successo!'),
    saveRetry: CALENDAR_MODAL_SCOPE(
        'messages.saveRetry',
        'Non è stato possibile salvare la voce dopo vari tentativi. Riprova più tardi.'
    )
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
            throw new Error(`Errore API (${res.status})`);
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
    invalidDate: 'Inserisci una data valida nel formato GG.MM.AAAA.',
    invalidEnd: "L'orario di fine non può precedere l'inizio.",
    missingSubject: 'Seleziona una materia.',
    missingEventTitle: "Inserisci un titolo per l\'evento.",
    missingStart: 'Inserisci un orario di inizio.',
    missingType: 'Seleziona un tipo di voce.'
};

if (window.hmI18n) {
    const formMessages = window.hmI18n.get('calendar.formMessages');
    if (formMessages && typeof formMessages === 'object') {
        Object.assign(ENTRY_FORM_MESSAGES, formMessages);
    }
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

function formatSwissDate(value) {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year.padStart(4, '0')}`;
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
    const fieldGroups = new Map();
    form.querySelectorAll('.hm-modal__field').forEach((group) => {
        const key = group.dataset.field;
        if (key) {
            fieldGroups.set(key, group);
        }
    });
    const errorTargets = new Map();
    form.querySelectorAll('.hm-modal__error').forEach((node) => {
        const key = node.dataset.errorFor;
        if (key) {
            errorTargets.set(key, node);
        }
    });

    const typeSelect = form.querySelector('[data-field="type"] select');
    const subjectGroup = form.querySelector('[data-field="subject"]');
    const subjectSelect = subjectGroup ? subjectGroup.querySelector('select') : null;
    const eventTitleGroup = form.querySelector('[data-field="event-title"]');
    const eventTitleInput = eventTitleGroup ? eventTitleGroup.querySelector('input') : null;
    const dateInput = form.querySelector('[data-field="date"] input');
    const startInput = form.querySelector('[data-field="start"] input');
    const endInput = form.querySelector('[data-field="end"] input');
    const descriptionInput = form.querySelector('[data-field="description"] textarea');
    const saveButton = form.querySelector('[data-role="submit"]');
    const cancelButton = form.querySelector('[data-role="cancel"]');

    const setFieldError = (name, message) => {
        const group = fieldGroups.get(name);
        const errorNode = errorTargets.get(name);
        const hasMessage = Boolean(message);
        if (group) {
            group.classList.toggle('is-invalid', hasMessage);
        }
        if (errorNode) {
            errorNode.textContent = message || '';
            errorNode.classList.toggle('is-visible', hasMessage);
        }
    };

    const clearAllErrors = () => {
        errorTargets.forEach((_, key) => setFieldError(key, ''));
        [typeSelect, subjectSelect, eventTitleInput, dateInput, startInput, endInput, descriptionInput].forEach((input) => {
            if (input) {
                input.setCustomValidity('');
            }
        });
    };

    const syncEndAvailability = () => {
        if (!endInput) return;
        const hasStart = Boolean(startInput && startInput.value);
        if (!hasStart) {
            endInput.value = '';
            endInput.disabled = true;
            endInput.setCustomValidity('');
            setFieldError('end', '');
        } else {
            endInput.disabled = false;
        }
    };

    const evaluate = () => {
        const typeValue = typeSelect ? typeSelect.value : '';
        if (typeSelect) {
            if (!typeValue) {
                typeSelect.setCustomValidity(messages.missingType || '');
                setFieldError('type', messages.missingType || '');
            } else {
                typeSelect.setCustomValidity('');
                setFieldError('type', '');
            }
        }

        const isEvent = typeValue === 'event';

        if (subjectSelect) {
            subjectSelect.required = !isEvent;
            if (!isEvent && !subjectSelect.value) {
                subjectSelect.setCustomValidity(messages.missingSubject || '');
                setFieldError('subject', messages.missingSubject || '');
            } else {
                subjectSelect.setCustomValidity('');
                setFieldError('subject', '');
            }
        }

        if (eventTitleInput) {
            eventTitleInput.required = isEvent;
            if (isEvent && !eventTitleInput.value.trim()) {
                eventTitleInput.setCustomValidity(messages.missingEventTitle || '');
                setFieldError('event-title', messages.missingEventTitle || '');
            } else {
                eventTitleInput.setCustomValidity('');
                setFieldError('event-title', '');
            }
        }

        if (dateInput) {
            const iso = parseSwissDate(dateInput.value);
            if (!iso) {
                dateInput.setCustomValidity(messages.invalidDate || '');
                setFieldError('date', messages.invalidDate || '');
            } else {
                dateInput.setCustomValidity('');
                setFieldError('date', '');
                dateInput.dataset.isoValue = iso;
            }
        }

        syncEndAvailability();

        if (startInput) {
            if (!startInput.value) {
                startInput.setCustomValidity(messages.missingStart || '');
                setFieldError('start', messages.missingStart || '');
            } else {
                startInput.setCustomValidity('');
                setFieldError('start', '');
            }
        }

        if (endInput && !endInput.disabled) {
            if (endInput.value && startInput && startInput.value && endInput.value < startInput.value) {
                endInput.setCustomValidity(messages.invalidEnd || '');
                setFieldError('end', messages.invalidEnd || '');
            } else {
                endInput.setCustomValidity('');
                setFieldError('end', '');
            }
        }

        if (saveButton) {
            saveButton.disabled = !form.checkValidity();
        }

        return form.checkValidity();
    };

    const toggleTypeFields = () => {
        const isEvent = typeSelect && typeSelect.value === 'event';
        if (subjectGroup) {
            subjectGroup.classList.toggle('is-hidden', Boolean(isEvent));
        }
        if (eventTitleGroup) {
            eventTitleGroup.classList.toggle('is-hidden', !isEvent);
        }
        if (isEvent && subjectSelect) {
            subjectSelect.value = '';
            subjectSelect.setCustomValidity('');
            setFieldError('subject', '');
        }
        if (!isEvent && eventTitleInput) {
            eventTitleInput.value = '';
            eventTitleInput.setCustomValidity('');
            setFieldError('event-title', '');
        }
        evaluate();
    };

    if (typeSelect) {
        typeSelect.addEventListener('change', () => {
            toggleTypeFields();
        });
    }

    [dateInput, startInput, endInput, subjectSelect, eventTitleInput, descriptionInput].forEach((input) => {
        if (!input) return;
        const events = ['input'];
        if (input.tagName === 'SELECT') {
            events.push('change');
        }
        events.forEach((evt) => input.addEventListener(evt, () => evaluate()));
        input.addEventListener('blur', () => evaluate());
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
            clearAllErrors();
            if (dateInput) {
                dateInput.value = '';
                dateInput.dataset.isoValue = '';
            }
            if (startInput) {
                startInput.value = '';
            }
            if (endInput) {
                endInput.value = '';
                endInput.disabled = true;
            }
            if (eventTitleInput) {
                eventTitleInput.value = '';
            }
            if (subjectSelect) {
                subjectSelect.value = '';
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
        },
        clearErrors: clearAllErrors,
        syncEnd: syncEndAvailability
    };

    form._modalController = controller;

    syncEndAvailability();
    toggleTypeFields();
    evaluate();

    return controller;
}

function showEntryForm(preselectedIsoDate = null) {
    if (sessionStorage.getItem('role') !== 'admin') {
        if (window.hmToast) {
            window.hmToast.show({ message: CREATE_DISABLED_MESSAGE, variant: 'info' });
        } else {
            showOverlay(CREATE_DISABLED_MESSAGE);
        }
        return;
    }

    const overlay = document.getElementById('entry-modal-overlay');
    const form = document.getElementById('entry-form');
    if (!overlay || !form) {
        console.error('Overlay del modal non trovato.');
        return;
    }

    form.reset();
    entryFormController = setupModalFormInteractions(form);
    if (entryFormController) {
        entryFormController.clearErrors?.();
        entryFormController.setType('event');
        entryFormController.syncEnd?.();
        entryFormController.evaluate();
    }

    const dateInput = form.querySelector('[data-field="date"] input');
    if (preselectedIsoDate && dateInput) {
        dateInput.value = formatSwissDate(preselectedIsoDate);
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const saveButton = form.querySelector('#saveButton');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = CALENDAR_MODAL_BUTTONS.add;
    }

    const initialFocus =
        form.querySelector('[data-hm-modal-initial-focus]') || form.querySelector('select, input, textarea, button');

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
        console.error('Modulo di inserimento mancante.');
        return;
    }

    entryFormController = setupModalFormInteractions(form);
    entryFormController?.evaluate();

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
        console.error('Campi del modulo mancanti.');
        return;
    }

    const typ = typeField.value;
    const fach = subjectField ? subjectField.value.trim() : '';
    const beschreibung = descriptionField ? descriptionField.value.trim() : '';
    const datumIso = parseSwissDate(dateField.value.trim());
    const startzeitInput = startField.value;
    const endzeitInput = endField && !endField.disabled ? endField.value : '';
    const eventTitle = eventTitleField ? eventTitleField.value.trim() : '';

    if (!datumIso) {
        entryFormController?.evaluate();
        dateField.focus();
        return;
    }

    if (endzeitInput && startzeitInput && endzeitInput < startzeitInput) {
        if (endField) {
            endField.setCustomValidity(ENTRY_FORM_MESSAGES.invalidEnd || '');
        }
        entryFormController?.evaluate();
        endField?.focus();
        return;
    }

    const isEvent = typ === 'event';
    const payloadBeschreibung = isEvent
        ? eventTitle + (beschreibung ? `\n\n${beschreibung}` : '')
        : beschreibung;
    const payloadSubject = isEvent ? '' : fach;

    const startzeit = startzeitInput ? `${startzeitInput}:00` : null;
    const endzeit = endzeitInput ? `${endzeitInput}:00` : null;

    saveButton.disabled = true;
    saveButton.textContent = CALENDAR_MODAL_BUTTONS.addLoading;

    try {
        const response = await fetch('https://homework-manager-2-0-backend.onrender.com/add_entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ typ, fach: payloadSubject, beschreibung: payloadBeschreibung, datum: datumIso, startzeit, endzeit })
        });

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }

        const result = await response.json().catch(() => ({}));
        if (!result || result.status !== 'ok') {
            throw new Error(result?.message || 'unknown_error');
        }

        if (window.hmToast) {
            window.hmToast.show({ message: CALENDAR_MODAL_MESSAGES.saveSuccess, variant: 'success' });
        } else {
            showOverlay(CALENDAR_MODAL_MESSAGES.saveSuccess);
        }

        closeEntryModal();
        window.hmCalendar?.refresh?.();
    } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        const errorMessage = CALENDAR_MODAL_MESSAGES.saveError || CALENDAR_MODAL_MESSAGES.saveRetry;
        if (window.hmToast) {
            window.hmToast.show({ message: errorMessage, variant: 'error' });
        } else {
            showOverlay(errorMessage);
        }
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = CALENDAR_MODAL_BUTTONS.add;
    }
}

// Initialcheck beim Laden der Seite
window.addEventListener('DOMContentLoaded', checkLogin);
window.addEventListener('DOMContentLoaded', initLanguageSelector);
window.addEventListener('DOMContentLoaded', () => {
    setupModalFormInteractions(document.getElementById('entry-form'));
    setupModalFormInteractions(document.getElementById('fc-edit-form'));
});
window.addEventListener('DOMContentLoaded', initSimpleNav);
