const noteInput = document.getElementById('note');
const gewichtungInput = document.getElementById('gewichtung');
const addButton = document.getElementById('add');
const clearAllButton = document.getElementById('clearAll');
const errorMessage = document.getElementById('inputError');
const zielInput = document.getElementById('ziel');
const zusaetzlichInput = document.getElementById('zusaetzlich');
const berechnenButton = document.getElementById('berechnen');

const messages = {
  invalidNumber: 'Inserisci valori validi, per favore.',
  required: 'Compila entrambi i campi, per favore.',
  gradeRange: 'Il voto deve essere compreso tra 1 e 6.',
  weightPositive: 'Il peso deve essere maggiore di 0.',
  targetRange: 'La media desiderata deve essere compresa tra 1 e 6.',
  nextWeight: 'Il peso del prossimo voto deve essere maggiore di 0.'
};

const noten = [];
let editingIndex = null;

const MIN_GRADE = 1;
const MAX_GRADE = 6;

function parseValue(input) {
  const value = input.value.trim();
  return value === '' ? NaN : parseFloat(value);
}

function isValidGrade(value) {
  return Number.isFinite(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

function isPositive(value) {
  return Number.isFinite(value) && value > 0;
}

function setError(message = '') {
  if (!errorMessage) return;
  errorMessage.textContent = message;
}

function updateButtonStates() {
  const gradeValue = parseValue(noteInput);
  const weightValue = parseValue(gewichtungInput);
  const targetValue = parseValue(zielInput);
  const nextWeightValue = parseValue(zusaetzlichInput);

  const enableAdd = isValidGrade(gradeValue) && isPositive(weightValue);
  const enableCalc = isValidGrade(targetValue) && isPositive(nextWeightValue) && noten.length > 0;

  addButton.disabled = !enableAdd;
  addButton.setAttribute('aria-disabled', String(!enableAdd));

  berechnenButton.disabled = !enableCalc;
  berechnenButton.setAttribute('aria-disabled', String(!enableCalc));
  berechnenButton.classList.toggle('btn--primary', enableCalc);
  berechnenButton.classList.toggle('btn--ghost', !enableCalc);
}

function validateInputs(showFeedback = false) {
  const gradeRaw = noteInput.value.trim();
  const weightRaw = gewichtungInput.value.trim();
  const gradeValue = gradeRaw === '' ? NaN : parseFloat(gradeRaw);
  const weightValue = weightRaw === '' ? NaN : parseFloat(weightRaw);
  let valid = true;
  let message = '';

  noteInput.classList.remove('invalid');
  gewichtungInput.classList.remove('invalid');

  if (gradeRaw === '' || weightRaw === '') {
    valid = false;
    message = messages.required;
  }

  if (gradeRaw !== '' && Number.isNaN(gradeValue)) {
    valid = false;
    noteInput.classList.add('invalid');
    message = messages.invalidNumber;
  }

  if (weightRaw !== '' && Number.isNaN(weightValue)) {
    valid = false;
    gewichtungInput.classList.add('invalid');
    if (!message || message === messages.required) {
      message = messages.invalidNumber;
    }
  }

  if (!Number.isNaN(gradeValue) && !isValidGrade(gradeValue)) {
    valid = false;
    noteInput.classList.add('invalid');
    if (!message || message === messages.required) {
      message = messages.gradeRange;
    }
  }

  if (!Number.isNaN(weightValue) && !isPositive(weightValue)) {
    valid = false;
    gewichtungInput.classList.add('invalid');
    if (!message || message === messages.required) {
      message = messages.weightPositive;
    }
  }

  if (!valid && showFeedback) {
    setError(message || messages.invalidNumber);
  } else if (!showFeedback || valid) {
    setError('');
  }

  updateButtonStates();
  return valid;
}

function validateGoalInputs(showFeedback = false) {
  const zielRaw = zielInput.value.trim();
  const zusaetzlichRaw = zusaetzlichInput.value.trim();
  const zielValue = zielRaw === '' ? NaN : parseFloat(zielRaw);
  const zusaetzlichValue = zusaetzlichRaw === '' ? NaN : parseFloat(zusaetzlichRaw);
  let valid = true;
  let message = '';

  zielInput.classList.remove('invalid');
  zusaetzlichInput.classList.remove('invalid');

  if (zielRaw === '' || zusaetzlichRaw === '') {
    valid = false;
    message = messages.required;
  }

  if (zielRaw !== '' && Number.isNaN(zielValue)) {
    valid = false;
    zielInput.classList.add('invalid');
    if (!message) {
      message = messages.invalidNumber;
    }
  }

  if (zusaetzlichRaw !== '' && Number.isNaN(zusaetzlichValue)) {
    valid = false;
    zusaetzlichInput.classList.add('invalid');
    if (!message) {
      message = messages.invalidNumber;
    }
  }

  if (!Number.isNaN(zielValue) && !isValidGrade(zielValue)) {
    valid = false;
    zielInput.classList.add('invalid');
    if (!message) {
      message = messages.targetRange;
    }
  }

  if (!Number.isNaN(zusaetzlichValue) && !isPositive(zusaetzlichValue)) {
    valid = false;
    zusaetzlichInput.classList.add('invalid');
    if (!message) {
      message = messages.nextWeight;
    }
  }

  if (!valid && showFeedback) {
    showOverlay(message || messages.invalidNumber);
  }

  updateButtonStates();
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
  noten.push({ note, gewichtung });
  editingIndex = null;
  resetInputs();
  notenListeUpdate();
  schnittBerechnen();
}

function schnittBerechnen() {
  if (!noten.length) {
    document.getElementById('schnitt').textContent = 'Media: -';
    return;
  }
  const gesamtgewichtung = noten.reduce((a, n) => a + n.gewichtung, 0);
  const summe = noten.reduce((a, n) => a + n.note * n.gewichtung, 0);
  const schnitt = summe / gesamtgewichtung;
  document.getElementById('schnitt').textContent = `Media: ${schnitt.toFixed(2)}`;
}

function zielBerechnen() {
  if (!validateGoalInputs(true)) {
    return;
  }

  const ziel = parseFloat(zielInput.value);
  const zGew = parseFloat(zusaetzlichInput.value);
  const gesamtgewichtung = noten.reduce((a, n) => a + n.gewichtung, 0);
  const summe = noten.reduce((a, n) => a + n.note * n.gewichtung, 0);
  const benoetigte = ((ziel * (gesamtgewichtung + zGew)) - summe) / zGew;
  document.getElementById('zielNote').textContent = `Voto necessario: ${benoetigte.toFixed(2)}`;
}

function cancelEdit() {
  editingIndex = null;
  setError('');
  notenListeUpdate();
}

function saveEdit(index, noteField, gewichtField) {
  const noteRaw = noteField.value.trim();
  const gewichtRaw = gewichtField.value.trim();
  const noteValue = noteRaw === '' ? NaN : parseFloat(noteRaw);
  const gewichtValue = gewichtRaw === '' ? NaN : parseFloat(gewichtRaw);
  let message = '';
  let valid = true;

  noteField.classList.remove('invalid');
  gewichtField.classList.remove('invalid');

  if (noteRaw === '' || gewichtRaw === '') {
    message = messages.required;
    valid = false;
  }

  if (noteRaw !== '' && Number.isNaN(noteValue)) {
    noteField.classList.add('invalid');
    message = messages.invalidNumber;
    valid = false;
  }

  if (gewichtRaw !== '' && Number.isNaN(gewichtValue)) {
    gewichtField.classList.add('invalid');
    if (!message) {
      message = messages.invalidNumber;
    }
    valid = false;
  }

  if (!Number.isNaN(noteValue) && !isValidGrade(noteValue)) {
    noteField.classList.add('invalid');
    if (!message) {
      message = messages.gradeRange;
    }
    valid = false;
  }

  if (!Number.isNaN(gewichtValue) && !isPositive(gewichtValue)) {
    gewichtField.classList.add('invalid');
    if (!message) {
      message = messages.weightPositive;
    }
    valid = false;
  }

  if (!valid) {
    setError(message || messages.invalidNumber);
    return;
  }

  noten[index] = { note: noteValue, gewichtung: gewichtValue };
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
  saveBtn.setAttribute('aria-label', 'Salva modifiche');

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'edit-btn cancel-btn';
  cancelBtn.textContent = '✖';
  cancelBtn.setAttribute('aria-label', 'Annulla modifica');

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
  const tbody = document.querySelector('#notenTabelle tbody');
  tbody.innerHTML = '';

  noten.forEach((daten, index) => {
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
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Elimina voto');
      delBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        noten.splice(index, 1);
        editingIndex = null;
        notenListeUpdate();
        schnittBerechnen();
      });
      delTd.appendChild(delBtn);
      tr.appendChild(delTd);
    }

    tbody.appendChild(tr);
  });

  const disableClear = noten.length === 0;
  clearAllButton.disabled = disableClear;
  clearAllButton.setAttribute('aria-disabled', String(disableClear));
  if (!noten.length) {
    document.getElementById('zielNote').textContent = 'Voto necessario: -';
  }

  updateButtonStates();
}

addButton.addEventListener('click', noteHinzufuegen);
berechnenButton.addEventListener('click', zielBerechnen);
clearAllButton.addEventListener('click', () => {
  noten.length = 0;
  editingIndex = null;
  setError('');
  notenListeUpdate();
  schnittBerechnen();
});

noteInput.addEventListener('input', () => validateInputs(false));
gewichtungInput.addEventListener('input', () => validateInputs(false));
zielInput.addEventListener('input', () => validateGoalInputs(false));
zusaetzlichInput.addEventListener('input', () => validateGoalInputs(false));

validateInputs();
validateGoalInputs();
