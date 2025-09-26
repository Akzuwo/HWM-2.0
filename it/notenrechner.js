const noteInput = document.getElementById('note');
const weightInput = document.getElementById('gewichtung');
const addButton = document.getElementById('add');
const clearAllButton = document.getElementById('clearAll');
const targetInput = document.getElementById('ziel');
const nextWeightInput = document.getElementById('zusaetzlich');
const calculateButton = document.getElementById('berechnen');
const gradeError = document.getElementById('gradeError');
const weightError = document.getElementById('weightError');
const targetError = document.getElementById('targetError');
const nextWeightError = document.getElementById('nextWeightError');
const averageValue = document.getElementById('averageValue');
const requiredGrade = document.getElementById('zielNote');
const addForm = document.getElementById('addForm');
const targetForm = document.getElementById('targetForm');
const tableBody = document.querySelector('#notenTabelle tbody');

const messages = {
  invalidNumber: 'Inserisci numeri validi.',
  required: 'Compila questo campo.',
  gradeRange: 'Il voto deve essere tra 1 e 6.',
  halfStep: 'Il voto deve essere in passi di 0.5.',
  weightPositive: 'Il peso deve essere maggiore di 0.',
  targetRange: 'La media desiderata deve essere tra 1 e 6.',
  nextWeight: 'Il peso del prossimo voto deve essere maggiore di 0.',
  requiredGradeLabel: 'Voto necessario',
  unachievable: 'Non raggiungibile'
};

const noten = [];
let editingIndex = null;

const MIN_GRADE = 1;
const MAX_GRADE = 6;
const STEP_PRECISION = 1e-9;

function parseValue(input) {
  const value = input.value.trim();
  return value === '' ? NaN : parseFloat(value);
}

function isValidGrade(value) {
  return Number.isFinite(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

function isHalfStep(value) {
  if (!Number.isFinite(value)) {
    return false;
  }
  const doubled = value * 2;
  return Math.abs(doubled - Math.round(doubled)) < STEP_PRECISION;
}

function isPositive(value) {
  return Number.isFinite(value) && value > 0;
}

function setFieldState(input, errorElement, message, shouldShow) {
  if (message && shouldShow) {
    input.classList.add('invalid');
    errorElement.textContent = message;
  } else {
    input.classList.remove('invalid');
    errorElement.textContent = '';
  }
}

function resetRequiredGrade() {
  requiredGrade.textContent = `${messages.requiredGradeLabel}: –`;
  requiredGrade.dataset.state = 'idle';
}

function updateButtonStates() {
  const gradeValue = parseValue(noteInput);
  const weightValue = parseValue(weightInput);
  const targetValue = parseValue(targetInput);
  const nextWeightValue = parseValue(nextWeightInput);

  const enableAdd = isValidGrade(gradeValue) && isHalfStep(gradeValue) && isPositive(weightValue);
  const enableCalc =
    isValidGrade(targetValue) &&
    isPositive(nextWeightValue) &&
    noten.length > 0;

  addButton.disabled = !enableAdd;
  addButton.setAttribute('aria-disabled', String(!enableAdd));

  calculateButton.disabled = !enableCalc;
  calculateButton.setAttribute('aria-disabled', String(!enableCalc));

  const disableClear = noten.length === 0;
  clearAllButton.disabled = disableClear;
  clearAllButton.setAttribute('aria-disabled', String(disableClear));
}

function validateInputs(showFeedback = false) {
  const gradeRaw = noteInput.value.trim();
  const weightRaw = weightInput.value.trim();
  const gradeValue = gradeRaw === '' ? NaN : parseFloat(gradeRaw);
  const weightValue = weightRaw === '' ? NaN : parseFloat(weightRaw);

  let gradeMessage = '';
  let weightMessage = '';

  if (gradeRaw === '') {
    gradeMessage = messages.required;
  } else if (Number.isNaN(gradeValue)) {
    gradeMessage = messages.invalidNumber;
  } else if (!isValidGrade(gradeValue)) {
    gradeMessage = messages.gradeRange;
  } else if (!isHalfStep(gradeValue)) {
    gradeMessage = messages.halfStep;
  }

  if (weightRaw === '') {
    weightMessage = messages.required;
  } else if (Number.isNaN(weightValue)) {
    weightMessage = messages.invalidNumber;
  } else if (!isPositive(weightValue)) {
    weightMessage = messages.weightPositive;
  }

  const showGradeMessage = showFeedback || gradeRaw !== '';
  const showWeightMessage = showFeedback || weightRaw !== '';

  setFieldState(noteInput, gradeError, gradeMessage, showGradeMessage);
  setFieldState(weightInput, weightError, weightMessage, showWeightMessage);

  updateButtonStates();
  return !gradeMessage && !weightMessage;
}

function validateGoalInputs(showFeedback = false) {
  const targetRaw = targetInput.value.trim();
  const nextWeightRaw = nextWeightInput.value.trim();
  const targetValue = targetRaw === '' ? NaN : parseFloat(targetRaw);
  const nextWeightValue = nextWeightRaw === '' ? NaN : parseFloat(nextWeightRaw);

  let targetMessage = '';
  let nextWeightMessage = '';

  if (targetRaw === '') {
    targetMessage = messages.required;
  } else if (Number.isNaN(targetValue)) {
    targetMessage = messages.invalidNumber;
  } else if (!isValidGrade(targetValue)) {
    targetMessage = messages.targetRange;
  }

  if (nextWeightRaw === '') {
    nextWeightMessage = messages.required;
  } else if (Number.isNaN(nextWeightValue)) {
    nextWeightMessage = messages.invalidNumber;
  } else if (!isPositive(nextWeightValue)) {
    nextWeightMessage = messages.nextWeight;
  }

  const showTargetMessage = showFeedback || targetRaw !== '';
  const showNextWeightMessage = showFeedback || nextWeightRaw !== '';

  setFieldState(targetInput, targetError, targetMessage, showTargetMessage);
  setFieldState(nextWeightInput, nextWeightError, nextWeightMessage, showNextWeightMessage);

  if (showFeedback && (targetMessage || nextWeightMessage) && typeof showOverlay === 'function') {
    showOverlay(targetMessage || nextWeightMessage);
  }

  updateButtonStates();
  return !targetMessage && !nextWeightMessage;
}

function resetInputs() {
  noteInput.value = '';
  weightInput.value = '';
  noteInput.classList.remove('invalid');
  weightInput.classList.remove('invalid');
  gradeError.textContent = '';
  weightError.textContent = '';
  updateButtonStates();
}

function resetTargetInputs() {
  targetInput.classList.remove('invalid');
  nextWeightInput.classList.remove('invalid');
  targetError.textContent = '';
  nextWeightError.textContent = '';
  updateButtonStates();
}

function noteHinzufuegen(event) {
  if (event) {
    event.preventDefault();
  }
  if (!validateInputs(true)) {
    return;
  }

  const note = parseFloat(noteInput.value);
  const gewichtung = parseFloat(weightInput.value);
  noten.push({ note, gewichtung });
  editingIndex = null;
  resetInputs();
  notenListeUpdate();
  schnittBerechnen();
  validateGoalInputs(false);
}

function schnittBerechnen() {
  if (!noten.length) {
    averageValue.textContent = '–';
    return;
  }

  const totalWeight = noten.reduce((acc, item) => acc + item.gewichtung, 0);
  const sum = noten.reduce((acc, item) => acc + item.note * item.gewichtung, 0);
  const average = sum / totalWeight;
  averageValue.textContent = average.toFixed(2);
}

function zielBerechnen(event) {
  if (event) {
    event.preventDefault();
  }
  if (!validateGoalInputs(true) || !noten.length) {
    return;
  }

  const target = parseFloat(targetInput.value);
  const additionalWeight = parseFloat(nextWeightInput.value);
  const totalWeight = noten.reduce((acc, item) => acc + item.gewichtung, 0);
  const sum = noten.reduce((acc, item) => acc + item.note * item.gewichtung, 0);
  const required = ((target * (totalWeight + additionalWeight)) - sum) / additionalWeight;

  if (!Number.isFinite(required)) {
    resetRequiredGrade();
    return;
  }

  if (required < MIN_GRADE - STEP_PRECISION || required > MAX_GRADE + STEP_PRECISION) {
    requiredGrade.textContent = `${messages.requiredGradeLabel}: ${messages.unachievable}`;
    requiredGrade.dataset.state = 'unreachable';
  } else {
    requiredGrade.textContent = `${messages.requiredGradeLabel}: ${required.toFixed(2)}`;
    requiredGrade.dataset.state = 'ready';
  }
}

function cancelEdit() {
  editingIndex = null;
  notenListeUpdate();
}

function saveEdit(index, gradeField, weightField) {
  const gradeRaw = gradeField.value.trim();
  const weightRaw = weightField.value.trim();
  const gradeValue = gradeRaw === '' ? NaN : parseFloat(gradeRaw);
  const weightValue = weightRaw === '' ? NaN : parseFloat(weightRaw);

  let gradeMessage = '';
  let weightMessage = '';

  if (gradeRaw === '') {
    gradeMessage = messages.required;
  } else if (Number.isNaN(gradeValue)) {
    gradeMessage = messages.invalidNumber;
  } else if (!isValidGrade(gradeValue)) {
    gradeMessage = messages.gradeRange;
  } else if (!isHalfStep(gradeValue)) {
    gradeMessage = messages.halfStep;
  }

  if (weightRaw === '') {
    weightMessage = messages.required;
  } else if (Number.isNaN(weightValue)) {
    weightMessage = messages.invalidNumber;
  } else if (!isPositive(weightValue)) {
    weightMessage = messages.weightPositive;
  }

  if (gradeMessage) {
    gradeField.classList.add('invalid');
  } else {
    gradeField.classList.remove('invalid');
  }

  if (weightMessage) {
    weightField.classList.add('invalid');
  } else {
    weightField.classList.remove('invalid');
  }

  const combinedMessage = gradeMessage || weightMessage;
  if (combinedMessage) {
    if (typeof showOverlay === 'function') {
      showOverlay(combinedMessage);
    }
    return;
  }

  noten[index] = { note: gradeValue, gewichtung: weightValue };
  editingIndex = null;
  notenListeUpdate();
  schnittBerechnen();
  validateGoalInputs(false);
}

function createEditControls(row, index, entry) {
  row.classList.add('editing');

  const numberCell = document.createElement('td');
  numberCell.textContent = index + 1;

  const gradeCell = document.createElement('td');
  const gradeField = document.createElement('input');
  gradeField.type = 'number';
  gradeField.step = '0.5';
  gradeField.min = String(MIN_GRADE);
  gradeField.max = String(MAX_GRADE);
  gradeField.value = entry.note;
  gradeField.className = 'grade-calculator__input';
  gradeCell.appendChild(gradeField);

  const weightCell = document.createElement('td');
  const weightField = document.createElement('input');
  weightField.type = 'number';
  weightField.step = '0.01';
  weightField.min = '0';
  weightField.value = entry.gewichtung;
  weightField.className = 'grade-calculator__input';
  weightCell.appendChild(weightField);

  const actionsCell = document.createElement('td');
  actionsCell.classList.add('grade-calculator__edit-actions');

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'grade-calculator__edit-button';
  saveButton.textContent = '✔';
  saveButton.setAttribute('aria-label', 'Salva modifiche');

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'grade-calculator__edit-button';
  cancelButton.textContent = '✖';
  cancelButton.setAttribute('aria-label', 'Annulla modifica');

  actionsCell.appendChild(saveButton);
  actionsCell.appendChild(cancelButton);

  row.appendChild(numberCell);
  row.appendChild(gradeCell);
  row.appendChild(weightCell);
  row.appendChild(actionsCell);

  saveButton.addEventListener('click', () => saveEdit(index, gradeField, weightField));
  cancelButton.addEventListener('click', cancelEdit);

  const handleKey = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(index, gradeField, weightField);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };

  gradeField.addEventListener('keydown', handleKey);
  weightField.addEventListener('keydown', handleKey);
  gradeField.focus();
}

function notenListeUpdate() {
  tableBody.innerHTML = '';

  noten.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.dataset.index = index;

    if (editingIndex === index) {
      createEditControls(row, index, entry);
    } else {
      const numberCell = document.createElement('td');
      numberCell.textContent = index + 1;

      const gradeCell = document.createElement('td');
      gradeCell.textContent = entry.note.toFixed(2);

      const weightCell = document.createElement('td');
      weightCell.textContent = entry.gewichtung.toFixed(2);

      const actionsCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'grade-calculator__delete-button';
      deleteButton.textContent = '✕';
      deleteButton.setAttribute('aria-label', 'Elimina voto');

      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        noten.splice(index, 1);
        editingIndex = null;
        notenListeUpdate();
        schnittBerechnen();
        if (!noten.length) {
          resetRequiredGrade();
        }
        validateGoalInputs(false);
      });

      actionsCell.appendChild(deleteButton);

      row.appendChild(numberCell);
      row.appendChild(gradeCell);
      row.appendChild(weightCell);
      row.appendChild(actionsCell);

      row.addEventListener('click', (event) => {
        if (event.target.closest('button')) {
          return;
        }
        editingIndex = index;
        notenListeUpdate();
      });
    }

    tableBody.appendChild(row);
  });

  updateButtonStates();
}

addForm.addEventListener('submit', noteHinzufuegen);
targetForm.addEventListener('submit', zielBerechnen);

clearAllButton.addEventListener('click', () => {
  noten.length = 0;
  editingIndex = null;
  resetInputs();
  targetInput.value = '';
  nextWeightInput.value = '';
  resetTargetInputs();
  resetRequiredGrade();
  notenListeUpdate();
  schnittBerechnen();
});

noteInput.addEventListener('input', () => validateInputs(false));
weightInput.addEventListener('input', () => validateInputs(false));
targetInput.addEventListener('input', () => validateGoalInputs(false));
nextWeightInput.addEventListener('input', () => validateGoalInputs(false));

resetRequiredGrade();
validateInputs(false);
validateGoalInputs(false);
notenListeUpdate();
