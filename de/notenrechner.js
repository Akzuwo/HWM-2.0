const faecher = [
  'MA','DE','PS','SPM-PS','SPM-MA','SP','WR','GS','GG','IN','IT','FR','EN','BG','MU','BI','Sport','CH','PH','SMU'
];
const fachSelect = document.getElementById('fach');
const noteInput = document.getElementById('note');
const gewichtungInput = document.getElementById('gewichtung');
const addButton = document.getElementById('add');
const clearAllButton = document.getElementById('clearAll');
const errorMessage = document.getElementById('inputError');

const messages = {
  invalidNumber: 'Bitte gültige Zahlen eingeben.',
  required: 'Bitte beide Felder ausfüllen.'
};

faecher.forEach((f) => {
  const opt = document.createElement('option');
  opt.textContent = f;
  fachSelect.appendChild(opt);
});

// Noten werden pro Fach gespeichert
const noten = {};
let editingIndex = null;

function getFachNoten(fach) {
  if (!noten[fach]) {
    noten[fach] = [];
  }
  return noten[fach];
}

function setError(message = '') {
  if (!errorMessage) return;
  errorMessage.textContent = message;
}

function validateInputs(showFeedback = false) {
  const noteValue = noteInput.value.trim();
  const gewichtungValue = gewichtungInput.value.trim();
  let valid = true;
  let message = '';

  noteInput.classList.remove('invalid');
  gewichtungInput.classList.remove('invalid');

  if (noteValue === '' || gewichtungValue === '') {
    valid = false;
    if (showFeedback) {
      message = messages.required;
    }
  }

  if (noteValue !== '' && isNaN(noteValue)) {
    valid = false;
    noteInput.classList.add('invalid');
    if (showFeedback) {
      message = messages.invalidNumber;
    }
  }

  if (gewichtungValue !== '' && isNaN(gewichtungValue)) {
    valid = false;
    gewichtungInput.classList.add('invalid');
    if (showFeedback) {
      message = messages.invalidNumber;
    }
  }

  addButton.disabled = !valid;
  if (showFeedback) {
    setError(message);
  } else if (valid) {
    setError('');
  }
  return valid;
}

function resetInputs() {
  noteInput.value = '';
  gewichtungInput.value = '';
  noteInput.classList.remove('invalid');
  gewichtungInput.classList.remove('invalid');
  setError('');
  validateInputs();
}

function noteHinzufuegen() {
  if (!validateInputs(true)) {
    return;
  }

  const note = parseFloat(noteInput.value);
  const gewichtung = parseFloat(gewichtungInput.value);
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);

  arr.push({ note, gewichtung });
  editingIndex = null;
  resetInputs();
  notenListeUpdate();
  schnittBerechnen();
}

function schnittBerechnen() {
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  if (!arr.length) {
    document.getElementById('schnitt').textContent = 'Schnitt: -';
    return;
  }
  const gesamtgewichtung = arr.reduce((a, n) => a + n.gewichtung, 0);
  const summe = arr.reduce((a, n) => a + n.note * n.gewichtung, 0);
  const schnitt = summe / gesamtgewichtung;
  document.getElementById('schnitt').textContent = `Schnitt: ${schnitt.toFixed(2)}`;
}

function zielBerechnen() {
  const ziel = parseFloat(document.getElementById('ziel').value);
  const zGew = parseFloat(document.getElementById('zusaetzlich').value);
  if (isNaN(ziel) || isNaN(zGew)) {
    showOverlay('Bitte gültige Zahlen eingeben.');
    return;
  }
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  const gesamtgewichtung = arr.reduce((a, n) => a + n.gewichtung, 0);
  const summe = arr.reduce((a, n) => a + n.note * n.gewichtung, 0);
  const benoetigte = ((ziel * (gesamtgewichtung + zGew)) - summe) / zGew;
  document.getElementById('zielNote').textContent = `Benötigte Note: ${benoetigte.toFixed(2)}`;
}

function cancelEdit() {
  editingIndex = null;
  setError('');
  notenListeUpdate();
}

function saveEdit(index, noteField, gewichtField) {
  const noteValue = noteField.value.trim();
  const gewichtValue = gewichtField.value.trim();
  let message = '';
  let valid = true;

  noteField.classList.remove('invalid');
  gewichtField.classList.remove('invalid');

  if (noteValue === '' || gewichtValue === '') {
    message = messages.required;
    valid = false;
  }

  if (noteValue !== '' && isNaN(noteValue)) {
    noteField.classList.add('invalid');
    message = messages.invalidNumber;
    valid = false;
  }

  if (gewichtValue !== '' && isNaN(gewichtValue)) {
    gewichtField.classList.add('invalid');
    message = messages.invalidNumber;
    valid = false;
  }

  if (!valid) {
    setError(message);
    return;
  }

  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  arr[index] = { note: parseFloat(noteValue), gewichtung: parseFloat(gewichtValue) };
  editingIndex = null;
  setError('');
  notenListeUpdate();
  schnittBerechnen();
}

function createEditControls(tr, index, daten) {
  tr.classList.add('editing');
  const nummerTd = document.createElement('td');
  nummerTd.textContent = index + 1;

  const noteTd = document.createElement('td');
  const noteField = document.createElement('input');
  noteField.type = 'number';
  noteField.step = '0.01';
  noteField.value = daten.note;
  noteField.className = 'field-control edit-field';
  noteTd.appendChild(noteField);

  const gewichtTd = document.createElement('td');
  const gewichtField = document.createElement('input');
  gewichtField.type = 'number';
  gewichtField.step = '0.01';
  gewichtField.value = daten.gewichtung;
  gewichtField.className = 'field-control edit-field';
  gewichtTd.appendChild(gewichtField);

  const actionsTd = document.createElement('td');
  actionsTd.classList.add('edit-actions');

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'edit-btn save-btn';
  saveBtn.textContent = '✔';
  saveBtn.setAttribute('aria-label', 'Änderungen speichern');

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'edit-btn cancel-btn';
  cancelBtn.textContent = '✖';
  cancelBtn.setAttribute('aria-label', 'Bearbeitung abbrechen');

  actionsTd.appendChild(saveBtn);
  actionsTd.appendChild(cancelBtn);

  tr.appendChild(nummerTd);
  tr.appendChild(noteTd);
  tr.appendChild(gewichtTd);
  tr.appendChild(actionsTd);

  saveBtn.addEventListener('click', () => saveEdit(index, noteField, gewichtField));
  cancelBtn.addEventListener('click', cancelEdit);

  function handleKey(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(index, noteField, gewichtField);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  }

  noteField.addEventListener('keydown', handleKey);
  gewichtField.addEventListener('keydown', handleKey);
}

function notenListeUpdate() {
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  const tbody = document.querySelector('#notenTabelle tbody');
  tbody.innerHTML = '';

  arr.forEach((daten, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;

    if (editingIndex === index) {
      createEditControls(tr, index, daten);
    } else {
      tr.innerHTML = `<td>${index + 1}</td><td>${daten.note}</td><td>${daten.gewichtung}</td>`;
      tr.classList.add('noten-row');
      tr.addEventListener('click', (event) => {
        if (event.target.closest('button')) {
          return;
        }
        editingIndex = index;
        setError('');
        notenListeUpdate();
      });

      const delTd = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'delete-btn';
      delBtn.textContent = '✖';
      delBtn.setAttribute('aria-label', 'Note löschen');
      delBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        arr.splice(index, 1);
        editingIndex = null;
        notenListeUpdate();
        schnittBerechnen();
      });
      delTd.appendChild(delBtn);
      tr.appendChild(delTd);
    }

    tbody.appendChild(tr);
  });

  clearAllButton.disabled = arr.length === 0;
}

document.getElementById('add').addEventListener('click', noteHinzufuegen);
document.getElementById('berechnen').addEventListener('click', zielBerechnen);
clearAllButton.addEventListener('click', () => {
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  arr.length = 0;
  editingIndex = null;
  setError('');
  notenListeUpdate();
  schnittBerechnen();
});

fachSelect.addEventListener('change', () => {
  editingIndex = null;
  setError('');
  notenListeUpdate();
  schnittBerechnen();
  document.getElementById('zielNote').textContent = 'Benötigte Note: -';
});

noteInput.addEventListener('input', () => validateInputs(false));
gewichtungInput.addEventListener('input', () => validateInputs(false));

validateInputs();
