import { createTable, createDialog, createForm } from './admin-shared.js';

const API_BASE = (() => {
  const base = 'https://homework-manager-2-5-backend.onrender.com';
  if (typeof window !== 'undefined') {
    window.__HM_RESOLVED_API_BASE__ = base;
    window.hmResolveApiBase = () => base;
  }
  return base;
})();

const SESSION_STORAGE_KEY = 'hm.session';

const TRANSLATIONS = {
  de: {
    title: 'Admin-Dashboard',
    subtitle: 'Verwalte Nutzer, Rollen, Klassen und Stundenpläne.',
    nav: {
      users: 'Nutzer',
      classes: 'Klassen',
      schedules: 'Stundenpläne',
    },
    create: {
      users: 'Neuen Nutzer anlegen',
      classes: 'Neue Klasse anlegen',
      schedules: 'Stundenplan importieren',
    },
    buttons: {
      edit: 'Bearbeiten',
      delete: 'Löschen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      downloadLogs: 'API-Logs herunterladen',
      import: 'Importieren',
    },
    confirmDelete: 'Soll dieser Eintrag wirklich gelöscht werden?',
    table: {
      email: 'E-Mail',
      role: 'Rolle',
      classId: 'Klasse',
      classSlug: 'Klassen-Kurzname',
      status: 'Status',
      updatedAt: 'Aktualisiert',
      createdAt: 'Erstellt',
      classTitle: 'Klassenname',
      source: 'Quelle',
      importHash: 'Import-Hash',
      importedAt: 'Importiert am',
    },
    fields: {
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      passwordNew: 'Neues Passwort',
      role: 'Rolle',
      classId: 'Klassen-ID',
      isActive: 'Aktiv',
      slug: 'Kurzname',
      title: 'Titel',
      description: 'Beschreibung',
      source: 'Quelle',
      importHash: 'Import-Hash',
      importedAt: 'Importiert am',
      classIdentifier: 'Klassen-ID oder -Slug',
      file: 'Datei',
    },
    help: {
      passwordOptional: 'Leer lassen, um das Passwort unverändert zu lassen.',
      classIdentifier: 'Gib die ID oder den Slug der Klasse an.',
    },
    status: {
      active: 'Aktiv',
      inactive: 'Inaktiv',
    },
    roles: {
      admin: 'Administrator',
      teacher: 'Lehrkraft',
      class_admin: 'Klassen-Admin',
      student: 'Schüler',
    },
    messages: {
      created: 'Erfolgreich erstellt.',
      updated: 'Änderungen gespeichert.',
      deleted: 'Eintrag gelöscht.',
      loadFailed: 'Daten konnten nicht geladen werden.',
      unauthorized: 'Bitte erneut anmelden.',
      unknownError: 'Es ist ein unbekannter Fehler aufgetreten.',
      logsDownloaded: 'Protokolle heruntergeladen.',
      logsFailed: 'Protokolle konnten nicht heruntergeladen werden.',
      fileRequired: 'Bitte eine Datei auswählen.',
      classIdentifierRequired: 'Bitte eine Klassen-ID oder einen Slug angeben.',
      scheduleImported: (count, hash) => `${count} Stunden importiert (Hash: ${hash}).`,
    },
    empty: 'Keine Daten vorhanden.',
    pagination: {
      summary: (page, pages, total) => `Seite ${page} von ${pages} (${total} Einträge)`
    },
  },
  en: {
    title: 'Admin Dashboard',
    subtitle: 'Manage users, roles, classes, and schedules.',
    nav: {
      users: 'Users',
      classes: 'Classes',
      schedules: 'Schedules',
    },
    create: {
      users: 'Create user',
      classes: 'Create class',
      schedules: 'Import schedule',
    },
    buttons: {
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      downloadLogs: 'Download API logs',
      import: 'Import',
    },
    confirmDelete: 'Are you sure you want to delete this item?',
    table: {
      email: 'Email',
      role: 'Role',
      classId: 'Class',
      classSlug: 'Class slug',
      status: 'Status',
      updatedAt: 'Updated',
      createdAt: 'Created',
      classTitle: 'Class name',
      source: 'Source',
      importHash: 'Import hash',
      importedAt: 'Imported at',
    },
    fields: {
      email: 'Email address',
      password: 'Password',
      passwordNew: 'New password',
      role: 'Role',
      classId: 'Class ID',
      isActive: 'Active',
      slug: 'Slug',
      title: 'Title',
      description: 'Description',
      source: 'Source',
      importHash: 'Import hash',
      importedAt: 'Imported at',
      classIdentifier: 'Class ID or slug',
      file: 'File',
    },
    help: {
      passwordOptional: 'Leave blank to keep the current password.',
      classIdentifier: 'Provide the class ID or slug.',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
    },
    roles: {
      admin: 'Administrator',
      teacher: 'Teacher',
      class_admin: 'Class admin',
      student: 'Student',
    },
    messages: {
      created: 'Created successfully.',
      updated: 'Changes saved.',
      deleted: 'Entry deleted.',
      loadFailed: 'Failed to load data.',
      unauthorized: 'Please sign in again.',
      unknownError: 'An unknown error occurred.',
      logsDownloaded: 'Logs downloaded.',
      logsFailed: 'Unable to download logs.',
      fileRequired: 'Please choose a file.',
      classIdentifierRequired: 'Please provide a class ID or slug.',
      scheduleImported: (count, hash) => `Imported ${count} lessons (hash: ${hash}).`,
    },
    empty: 'No data available.',
    pagination: {
      summary: (page, pages, total) => `Page ${page} of ${pages} (${total} items)`
    },
  },
  fr: {
    title: 'Tableau de bord administrateur',
    subtitle: 'Gérez les utilisateurs, les rôles, les classes et les horaires.',
    nav: {
      users: 'Utilisateurs',
      classes: 'Classes',
      schedules: 'Horaires',
    },
    create: {
      users: 'Créer un utilisateur',
      classes: 'Créer une classe',
      schedules: 'Importer un horaire',
    },
    buttons: {
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      downloadLogs: 'Télécharger les journaux API',
      import: 'Importer',
    },
    confirmDelete: 'Voulez-vous vraiment supprimer cet élément ?',
    table: {
      email: 'E-mail',
      role: 'Rôle',
      classId: 'Classe',
      classSlug: 'Slug de classe',
      status: 'Statut',
      updatedAt: 'Mis à jour',
      createdAt: 'Créé',
      classTitle: 'Nom de la classe',
      source: 'Source',
      importHash: 'Hash d’import',
      importedAt: 'Importé le',
    },
    fields: {
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      passwordNew: 'Nouveau mot de passe',
      role: 'Rôle',
      classId: 'ID de classe',
      isActive: 'Actif',
      slug: 'Identifiant',
      title: 'Titre',
      description: 'Description',
      source: 'Source',
      importHash: 'Hash d’import',
      importedAt: 'Importé le',
      classIdentifier: 'ID ou slug de classe',
      file: 'Fichier',
    },
    help: {
      passwordOptional: 'Laissez vide pour conserver le mot de passe actuel.',
      classIdentifier: 'Indiquez l’ID ou le slug de la classe.',
    },
    status: {
      active: 'Actif',
      inactive: 'Inactif',
    },
    roles: {
      admin: 'Administrateur',
      teacher: 'Enseignant',
      class_admin: 'Admin de classe',
      student: 'Élève',
    },
    messages: {
      created: 'Création effectuée.',
      updated: 'Modifications enregistrées.',
      deleted: 'Élément supprimé.',
      loadFailed: 'Impossible de charger les données.',
      unauthorized: 'Veuillez vous reconnecter.',
      unknownError: 'Une erreur inconnue est survenue.',
      logsDownloaded: 'Journaux téléchargés.',
      logsFailed: 'Impossible de télécharger les journaux.',
      fileRequired: 'Veuillez sélectionner un fichier.',
      classIdentifierRequired: 'Veuillez indiquer un ID ou un slug de classe.',
      scheduleImported: (count, hash) => `${count} cours importés (hash : ${hash}).`,
    },
    empty: 'Aucune donnée disponible.',
    pagination: {
      summary: (page, pages, total) => `Page ${page} sur ${pages} (${total} éléments)`
    },
  },
  it: {
    title: 'Pannello di amministrazione',
    subtitle: 'Gestisci utenti, ruoli, classi e orari.',
    nav: {
      users: 'Utenti',
      classes: 'Classi',
      schedules: 'Orari',
    },
    create: {
      users: 'Crea utente',
      classes: 'Crea classe',
      schedules: 'Importa orario',
    },
    buttons: {
      edit: 'Modifica',
      delete: 'Elimina',
      cancel: 'Annulla',
      save: 'Salva',
      downloadLogs: 'Scarica i log API',
      import: 'Importa',
    },
    confirmDelete: 'Eliminare veramente questo elemento?',
    table: {
      email: 'Email',
      role: 'Ruolo',
      classId: 'Classe',
      classSlug: 'Slug classe',
      status: 'Stato',
      updatedAt: 'Aggiornato',
      createdAt: 'Creato',
      classTitle: 'Nome classe',
      source: 'Fonte',
      importHash: 'Hash importazione',
      importedAt: 'Importato il',
    },
    fields: {
      email: 'Indirizzo email',
      password: 'Password',
      passwordNew: 'Nuova password',
      role: 'Ruolo',
      classId: 'ID classe',
      isActive: 'Attivo',
      slug: 'Slug',
      title: 'Titolo',
      description: 'Descrizione',
      source: 'Fonte',
      importHash: 'Hash importazione',
      importedAt: 'Importato il',
      classIdentifier: 'ID o slug della classe',
      file: 'File',
    },
    help: {
      passwordOptional: 'Lascia vuoto per mantenere la password attuale.',
      classIdentifier: 'Indica l’ID o lo slug della classe.',
    },
    status: {
      active: 'Attivo',
      inactive: 'Inattivo',
    },
    roles: {
      admin: 'Amministratore',
      teacher: 'Docente',
      class_admin: 'Admin di classe',
      student: 'Studente',
    },
    messages: {
      created: 'Creato correttamente.',
      updated: 'Modifiche salvate.',
      deleted: 'Elemento eliminato.',
      loadFailed: 'Impossibile caricare i dati.',
      unauthorized: 'Effettua di nuovo l’accesso.',
      unknownError: 'Si è verificato un errore sconosciuto.',
      logsDownloaded: 'Log scaricati.',
      logsFailed: 'Impossibile scaricare i log.',
      fileRequired: 'Seleziona un file.',
      classIdentifierRequired: 'Indica un ID o uno slug di classe.',
      scheduleImported: (count, hash) => `${count} lezioni importate (hash: ${hash}).`,
    },
    empty: 'Nessun dato disponibile.',
    pagination: {
      summary: (page, pages, total) => `Pagina ${page} di ${pages} (${total} elementi)`
    },
  },
};

function getTranslations() {
  const lang = document.documentElement.lang?.toLowerCase() || 'en';
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

function localeForDate() {
  const lang = document.documentElement.lang?.toLowerCase() || 'en';
  switch (lang) {
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'it':
      return 'it-IT';
    default:
      return 'en-US';
  }
}

function formatDate(value, locale) {
  if (!value) {
    return '–';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '–';
  }
  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function resolveUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const suffix = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${suffix}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(resolveUrl(url), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload;
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = {};
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText;
    const error = new Error(message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  if (payload && typeof payload.status === 'string' && payload.status !== 'ok') {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return payload;
}

function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function isSessionAdmin(session) {
  if (!session) {
    return false;
  }
  if (typeof session.isAdmin === 'boolean') {
    return session.isAdmin;
  }
  const role = String(session.role || '').toLowerCase();
  return role === 'admin';
}

function createMessageArea() {
  const element = document.createElement('div');
  element.className = 'admin-message';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');

  return {
    element,
    show(type, text) {
      element.textContent = text;
      element.dataset.type = type;
      element.hidden = false;
    },
    clear() {
      element.textContent = '';
      element.hidden = true;
      delete element.dataset.type;
    },
  };
}

function createPaginationControls(translations) {
  const container = document.createElement('div');
  container.className = 'admin-pagination';

  const info = document.createElement('div');
  info.className = 'admin-pagination__info';

  const buttons = document.createElement('div');
  buttons.className = 'admin-pagination__buttons';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'admin-button admin-button--ghost';
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'admin-button admin-button--ghost';
  next.textContent = '›';

  buttons.append(prev, next);
  container.append(info, buttons);

  return {
    element: container,
    info,
    prev,
    next,
    update({ page, pageSize, total }) {
      const pages = Math.max(1, Math.ceil(total / pageSize));
      info.textContent = translations.pagination.summary(page, pages, total);
      prev.disabled = page <= 1;
      next.disabled = page >= pages;
    },
  };
}

function createActionButton(label, variant = 'ghost') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = variant === 'ghost' ? 'admin-button admin-button--ghost' : 'admin-button';
  button.textContent = label;
  return button;
}

function sanitizeUserPayload(values) {
  const payload = { ...values };
  if (payload.class_id === null) {
    delete payload.class_id;
  }
  if (!payload.password) {
    delete payload.password;
  }
  return payload;
}

function sanitizeSchedulePayload(values) {
  const payload = { ...values };
  if (payload.class_id === null) {
    delete payload.class_id;
  }
  return payload;
}

function buildDashboard(root) {
  const t = getTranslations();
  const locale = localeForDate();

  const messageArea = createMessageArea();

  const header = document.createElement('header');
  header.className = 'admin-dashboard__header';
  header.innerHTML = `
    <div>
      <h1>${t.title}</h1>
      <p>${t.subtitle}</p>
    </div>
  `;

  const nav = document.createElement('nav');
  nav.className = 'admin-dashboard__nav';
  nav.setAttribute('role', 'tablist');

  const actionsBar = document.createElement('div');
  actionsBar.className = 'admin-dashboard__actions';

  const downloadLogsButton = createActionButton(t.buttons.downloadLogs);
  const createButton = createActionButton(t.create.users);
  actionsBar.append(downloadLogsButton, createButton);

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'admin-dashboard__table';

  const pagination = createPaginationControls(t);

  root.append(header, nav, actionsBar, tableWrapper, pagination.element, messageArea.element);

  const scheduleImportFields = [
    {
      name: 'class_identifier',
      label: t.fields.classIdentifier,
      placeholder: t.fields.classIdentifier,
      required: true,
      helpText: t.help.classIdentifier,
    },
    {
      name: 'file',
      type: 'file',
      label: t.fields.file,
      required: true,
      accept: 'application/json,.json',
    },
  ];

  const resources = {
    users: {
      key: 'users',
      label: t.nav.users,
      columns: [
        { key: 'email', label: t.table.email },
        { key: 'role', label: t.table.role, render: (row) => t.roles[row.role] || row.role },
        {
          key: 'class_slug',
          label: t.table.classSlug,
          render: (row) => row.class_slug || (row.class_id ? `#${row.class_id}` : '–'),
        },
        { key: 'is_active', label: t.table.status, render: (row) => (row.is_active ? t.status.active : t.status.inactive) },
        { key: 'updated_at', label: t.table.updatedAt, render: (row) => formatDate(row.updated_at, locale) },
      ],
      form: {
        create: [
          { name: 'email', type: 'email', label: t.fields.email, required: true },
          { name: 'password', type: 'password', label: t.fields.password, required: true },
          {
            name: 'role',
            type: 'select',
            label: t.fields.role,
            required: true,
            options: [
              { value: 'student', label: t.roles.student },
              { value: 'teacher', label: t.roles.teacher },
              { value: 'class_admin', label: t.roles.class_admin },
              { value: 'admin', label: t.roles.admin },
            ],
            defaultValue: 'student',
          },
          { name: 'class_id', type: 'number', label: t.fields.classId, min: 1 },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive, defaultValue: true },
        ],
        edit: [
          { name: 'email', type: 'email', label: t.fields.email, required: true },
          { name: 'password', type: 'password', label: t.fields.passwordNew, helpText: t.help.passwordOptional },
          {
            name: 'role',
            type: 'select',
            label: t.fields.role,
            required: true,
            options: [
              { value: 'student', label: t.roles.student },
              { value: 'teacher', label: t.roles.teacher },
              { value: 'class_admin', label: t.roles.class_admin },
              { value: 'admin', label: t.roles.admin },
            ],
          },
          { name: 'class_id', type: 'number', label: t.fields.classId, min: 1 },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive },
        ],
      },
      sanitize: sanitizeUserPayload,
    },
    classes: {
      key: 'classes',
      label: t.nav.classes,
      columns: [
        { key: 'slug', label: t.fields.slug },
        { key: 'title', label: t.fields.title },
        { key: 'description', label: t.fields.description },
        { key: 'is_active', label: t.table.status, render: (row) => (row.is_active ? t.status.active : t.status.inactive) },
        { key: 'updated_at', label: t.table.updatedAt, render: (row) => formatDate(row.updated_at, locale) },
      ],
      form: {
        create: [
          { name: 'slug', label: t.fields.slug, required: true },
          { name: 'title', label: t.fields.title, required: true },
          { name: 'description', type: 'textarea', label: t.fields.description },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive, defaultValue: true },
        ],
        edit: [
          { name: 'slug', label: t.fields.slug, required: true },
          { name: 'title', label: t.fields.title, required: true },
          { name: 'description', type: 'textarea', label: t.fields.description },
          { name: 'is_active', type: 'checkbox', label: t.fields.isActive },
        ],
      },
      sanitize: (values) => values,
    },
    schedules: {
      key: 'schedules',
      label: t.nav.schedules,
      columns: [
        { key: 'class_id', label: t.table.classId },
        { key: 'class_title', label: t.table.classTitle },
        { key: 'source', label: t.table.source },
        { key: 'import_hash', label: t.table.importHash },
        { key: 'imported_at', label: t.table.importedAt, render: (row) => formatDate(row.imported_at, locale) },
      ],
      form: {
        create: scheduleImportFields,
        edit: [
          { name: 'class_id', type: 'number', label: t.fields.classId, min: 1 },
          { name: 'source', label: t.fields.source },
          { name: 'import_hash', label: t.fields.importHash },
          { name: 'imported_at', type: 'datetime-local', label: t.fields.importedAt },
        ],
      },
      importForm: scheduleImportFields,
      sanitize: sanitizeSchedulePayload,
    },
  };

  const table = createTable([
    ...resources.users.columns,
    { label: '', render: () => '' },
  ], { emptyMessage: t.empty });
  tableWrapper.appendChild(table.element);

  const state = {
    active: 'users',
    page: 1,
    pageSize: 10,
    total: 0,
    data: [],
    authorized: true,
  };

  function setAuthorizationState(isAuthorized) {
    const allowed = Boolean(isAuthorized);
    state.authorized = allowed;
    createButton.disabled = !allowed;
    createButton.setAttribute('aria-disabled', String(!allowed));
    downloadLogsButton.disabled = !allowed;
    downloadLogsButton.setAttribute('aria-disabled', String(!allowed));
    nav.querySelectorAll('button').forEach((button) => {
      button.disabled = !allowed;
      button.setAttribute('aria-disabled', String(!allowed));
    });
    if (!allowed) {
      state.total = 0;
      state.data = [];
      table.setRows([]);
      pagination.update({ page: state.page, pageSize: state.pageSize, total: state.total });
      pagination.prev.disabled = true;
      pagination.next.disabled = true;
    }
  }

  function handleUnauthorized() {
    if (!state.authorized) {
      return;
    }
    setAuthorizationState(false);
    showMessage('error', t.messages.unauthorized);
  }

  const initialAuthorized = isSessionAdmin(loadStoredSession());
  setAuthorizationState(initialAuthorized);
  if (!initialAuthorized) {
    showMessage('error', t.messages.unauthorized);
  }

  function buildActionCell(resourceKey, row) {
    const actions = document.createElement('div');
    actions.className = 'admin-table__actions';
    const editButton = createActionButton(t.buttons.edit, 'ghost');
    editButton.addEventListener('click', () => openEditDialog(resourceKey, row));
    const deleteButton = createActionButton(t.buttons.delete, 'ghost');
    deleteButton.addEventListener('click', () => handleDelete(resourceKey, row));
    actions.append(editButton, deleteButton);
    return actions;
  }

  function configureTableColumns(resourceKey) {
    const resource = resources[resourceKey];
    table.setEmptyMessage(t.empty);
    const columns = [
      ...resource.columns,
      { label: '', render: (row) => buildActionCell(resourceKey, row) },
    ];
    table.setColumns(columns);
    table.setRows([]);
  }

  function updateNav() {
    nav.innerHTML = '';
    Object.values(resources).forEach((resource) => {
      const button = createActionButton(resource.label, 'ghost');
      button.classList.toggle('is-active', resource.key === state.active);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', resource.key === state.active ? 'true' : 'false');
      button.disabled = !state.authorized;
      button.setAttribute('aria-disabled', String(!state.authorized));
      button.addEventListener('click', () => {
        if (state.active === resource.key) {
          return;
        }
        if (!state.authorized) {
          showMessage('error', t.messages.unauthorized);
          return;
        }
        state.active = resource.key;
        state.page = 1;
        updateNav();
        onResourceChanged();
      });
      nav.appendChild(button);
    });
  }

  function showMessage(type, text) {
    if (!text) {
      messageArea.clear();
      return;
    }
    messageArea.show(type, text);
    setTimeout(() => messageArea.clear(), 4000);
  }

  async function loadData() {
    const resource = resources[state.active];
    table.setLoading(true);
    showMessage();
    if (!state.authorized) {
      table.setRows([]);
      table.setLoading(false);
      return;
    }
    try {
      const response = await fetchJson(`/api/admin/${resource.key}?page=${state.page}&page_size=${state.pageSize}`);
      const rows = response.data || [];
      state.total = response.pagination?.total ?? rows.length;
      state.data = rows;
      table.setRows(rows);
      pagination.update({ page: state.page, pageSize: state.pageSize, total: state.total });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      } else {
        showMessage('error', error.message || t.messages.loadFailed);
      }
      table.setRows([]);
    } finally {
      table.setLoading(false);
    }
  }

  function onResourceChanged() {
    const resource = resources[state.active];
    createButton.textContent = t.create[state.active];
    configureTableColumns(resource.key);
    if (!state.authorized) {
      table.setRows([]);
      return;
    }
    loadData();
  }

  function openFormDialog(resourceKey, mode, initialData = {}) {
    const resource = resources[resourceKey];
    const fields = resource.form[mode];
    const dialog = createDialog({
      title: mode === 'create' ? resource.label : `${resource.label} – ${t.buttons.edit}`,
      confirmLabel: t.buttons.save,
      cancelLabel: t.buttons.cancel,
    });
    const form = createForm(fields, { initialValues: initialData });
    dialog.setContent(form.element);
    dialog.open();
    form.focusFirst();
    return { dialog, form, resource };
  }

  function openScheduleImportDialog() {
    const resource = resources.schedules;
    const dialog = createDialog({
      title: t.create.schedules,
      confirmLabel: t.buttons.import,
      cancelLabel: t.buttons.cancel,
    });
    const form = createForm(resource.importForm);
    dialog.setContent(form.element);
    dialog.open();
    form.focusFirst();
    dialog.onConfirm(async () => {
      const values = form.getValues();
      const classIdentifier = (values.class_identifier || '').trim();
      const file = values.file || null;
      if (!classIdentifier) {
        throw new Error(t.messages.classIdentifierRequired);
      }
      if (!file) {
        throw new Error(t.messages.fileRequired);
      }
      const formData = new FormData();
      formData.append('class_identifier', classIdentifier);
      formData.append('file', file, file.name || 'schedule.json');
      formData.append('source', 'admin_dashboard');
      let response;
      try {
        response = await fetch(resolveUrl('/api/admin/schedule-import'), {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
      let payload = {};
      try {
        payload = await response.json();
      } catch (error) {
        payload = {};
      }
      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        throw new Error(t.messages.unauthorized);
      }
      if (!response.ok) {
        const message = payload.message || response.statusText || t.messages.unknownError;
        throw new Error(message);
      }
      if (payload && typeof payload.status === 'string' && payload.status !== 'ok') {
        const message = payload.message || t.messages.unknownError;
        throw new Error(message);
      }
      const inserted = payload.inserted ?? 0;
      const hash = payload.import_hash ?? '–';
      await loadData();
      if (state.authorized) {
        showMessage('success', t.messages.scheduleImported(inserted, hash));
      }
    });
  }

  function refreshAfter(action) {
    switch (action) {
      case 'create':
        showMessage('success', t.messages.created);
        break;
      case 'update':
        showMessage('success', t.messages.updated);
        break;
      case 'delete':
        showMessage('success', t.messages.deleted);
        break;
      default:
        break;
    }
    loadData();
  }

  createButton.addEventListener('click', () => {
    if (!state.authorized) {
      showMessage('error', t.messages.unauthorized);
      return;
    }
    if (state.active === 'schedules') {
      openScheduleImportDialog();
      return;
    }
    const { dialog, form, resource } = openFormDialog(state.active, 'create');
    dialog.onConfirm(async () => {
      const values = resource.sanitize(form.getValues());
      try {
        await fetchJson(`/api/admin/${resource.key}`, {
          method: 'POST',
          body: JSON.stringify(values),
        });
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleUnauthorized();
          throw new Error(t.messages.unauthorized);
        }
        throw error;
      }
      refreshAfter('create');
    });
  });

  downloadLogsButton.addEventListener('click', async () => {
    if (!state.authorized) {
      showMessage('error', t.messages.unauthorized);
      return;
    }
    downloadLogsButton.disabled = true;
    try {
      const response = await fetchJson('/api/admin/logs');
      const logs = response.logs || '';
      const source = response.source || '';
      const fileName = source.split(/[/\\]/).filter(Boolean).pop()
        || `api-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
      const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showMessage('success', t.messages.logsDownloaded);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      } else {
        showMessage('error', error.message || t.messages.logsFailed);
      }
    } finally {
      downloadLogsButton.disabled = !state.authorized;
    }
  });

  async function openEditDialog(resourceKey, row) {
    const { dialog, form, resource } = openFormDialog(resourceKey, 'edit', row);
    dialog.onConfirm(async () => {
      const values = resource.sanitize(form.getValues());
      try {
        await fetchJson(`/api/admin/${resource.key}/${row.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleUnauthorized();
          throw new Error(t.messages.unauthorized);
        }
        throw error;
      }
      refreshAfter('update');
    });
  }

  async function handleDelete(resourceKey, row) {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }
    try {
      await fetchJson(`/api/admin/${resourceKey}/${row.id}`, { method: 'DELETE' });
      refreshAfter('delete');
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      } else {
        showMessage('error', error.message || t.messages.unknownError);
      }
    }
  }

  pagination.prev.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      loadData();
    }
  });

  pagination.next.addEventListener('click', () => {
    const pages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (state.page < pages) {
      state.page += 1;
      loadData();
    }
  });

  updateNav();
  onResourceChanged();
}

function initDashboard() {
  const root = document.getElementById('admin-dashboard-root');
  if (!root) {
    return;
  }
  buildDashboard(root);
}

initDashboard();
