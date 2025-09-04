const faecher = ['MA','DE','PS','SPM-PS','SPM-MA','SP','WR','GS','GG','IN','IT','FR','EN','BG','MU','BI','Sport','CH','PH','SMU'];
const fachSelect = document.getElementById('fach');
faecher.forEach(f => {
  const opt = document.createElement('option');
  opt.textContent = f;
  fachSelect.appendChild(opt);
});

// Noten werden pro Fach gespeichert
const noten = {};

function getFachNoten(fach) {
  if (!noten[fach]) {
    noten[fach] = [];
  }
  return noten[fach];
}

function noteHinzufuegen() {
  const note = parseFloat(document.getElementById('note').value);
  const gewichtung = parseFloat(document.getElementById('gewichtung').value);
  if (isNaN(note) || isNaN(gewichtung)) {
    showOverlay('Inserisci numeri validi.');
    return;
  }
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  arr.push({ note, gewichtung });
  document.getElementById('note').value = '';
  document.getElementById('gewichtung').value = '';
  notenListeUpdate();
  schnittBerechnen();
}

function schnittBerechnen() {
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  if (!arr.length) {
    document.getElementById('schnitt').textContent = 'Media: -';
    return;
  }
  const gesamtgewichtung = arr.reduce((a, n) => a + n.gewichtung, 0);
  const summe = arr.reduce((a, n) => a + n.note * n.gewichtung, 0);
  const schnitt = summe / gesamtgewichtung;
  document.getElementById('schnitt').textContent = `Media: ${schnitt.toFixed(2)}`;
}

function zielBerechnen() {
  const ziel = parseFloat(document.getElementById('ziel').value);
  const zGew = parseFloat(document.getElementById('zusaetzlich').value);
  if (isNaN(ziel) || isNaN(zGew)) {
    showOverlay('Inserisci numeri validi.');
    return;
  }
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  const gesamtgewichtung = arr.reduce((a, n) => a + n.gewichtung, 0);
  const summe = arr.reduce((a, n) => a + n.note * n.gewichtung, 0);
  const benoetigte = ((ziel * (gesamtgewichtung + zGew)) - summe) / zGew;
  document.getElementById('zielNote').textContent = `Voto necessario: ${benoetigte.toFixed(2)}`;
}

function notenListeUpdate() {
  const fach = fachSelect.value;
  const arr = getFachNoten(fach);
  const tbody = document.querySelector('#notenTabelle tbody');
  tbody.innerHTML = '';
  arr.forEach((n, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${n.note}</td><td>${n.gewichtung}</td>`;
    const delTd = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = 'x';
    delBtn.addEventListener('click', () => {
      arr.splice(i, 1);
      notenListeUpdate();
      schnittBerechnen();
    });
    delTd.appendChild(delBtn);
    tr.appendChild(delTd);
    tbody.appendChild(tr);
  });
}

document.getElementById('add').addEventListener('click', noteHinzufuegen);
document.getElementById('berechnen').addEventListener('click', zielBerechnen);
fachSelect.addEventListener('change', () => {
  notenListeUpdate();
  schnittBerechnen();
  document.getElementById('zielNote').textContent = 'Voto necessario: -';
});
