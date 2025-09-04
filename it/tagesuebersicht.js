const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('overview');
  try {
    const res = await fetch(`${API_BASE}/tagesuebersicht`);
    if (!res.ok) {
      throw new Error(`Errore API: ${res.status}`);
    }
    const data = await res.json();
    container.innerHTML = '';
    for (const [tag, eintraege] of Object.entries(data)) {
      const h2 = document.createElement('h2');
      h2.textContent = tag;
      container.appendChild(h2);
      const ul = document.createElement('ul');
      if (eintraege.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nessuna voce';
        ul.appendChild(li);
      } else {
        for (const e of eintraege) {
          const li = document.createElement('li');
          li.textContent = `${e.start} - ${e.end}: ${e.fach} (${e.raum})`;
          ul.appendChild(li);
        }
      }
      container.appendChild(ul);
    }
  } catch (err) {
    console.error('Errore durante il caricamento della panoramica giornaliera:', err);
    container.textContent = 'Errore durante il caricamento dei dati.';
  }
});
